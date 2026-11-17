-- ============================================================
-- 011_prikkel_antwoorden.sql
-- ============================================================
-- Doel: het antwoord op vraag 10 (werkomgeving: hoeveel geluid heb je
-- nodig om goed te werken) apart bewaren per teamcode, en het team
-- alleen één signaal in woorden teruggeven.
--
-- Besluiten Judith (16 en 17 nov 2026; docs/terugkoppeling-prikkelbehoefte.md,
-- "Plan na besluiten 17 nov"):
--   - Eigen tabel, los van private.responses. Geen naam, geen werkstijl,
--     geen verwijzing naar een profielrij, en ook GEEN datum of tijdstip:
--     via een tijdstip zou een beheerder het antwoord aan een rij in
--     responses (en dus aan een naam) kunnen koppelen. Een herhaalmeting
--     gaat via een nieuwe teamcode.
--   - Schrijven alleen via public.prikkel_opslaan (security definer).
--     Niemand krijgt rechten op de tabel zelf, ook geen select.
--   - Lezen alleen via public.prikkel_voor_code, die de UITKOMST teruggeeft
--     ('gemengd', 'stil', 'reuring', 'zonder_uitersten' of null), nooit de
--     aantallen. Zo staan er ook in de netwerkgegevens geen aantallen.
--
-- De regel (alleen op n = stil + geroezemoes + reuring; 'maakt_niet_uit'
-- telt niet mee), in deze volgorde:
--   n < 5                              -> null (te weinig voorkeuren)
--   stil >= 30 % en reuring >= 30 %    -> 'gemengd'
--   stil >= 50 %                       -> 'stil'
--   reuring >= 50 %                    -> 'reuring'
--   anders                             -> 'zonder_uitersten'
-- Gerekend in gehele getallen (stil*10 >= n*3), net als
-- src/team/werkplek/prikkelUitkomst.js, zodat SQL en JS nooit verschillen.
--
-- Raakt private.responses, responses_for_code en responses_for_codes niet.
-- Idempotent: opnieuw draaien kan.
--
-- LET OP in de SQL Editor: een gelukte `create or replace` en een lege
-- `select` geven allebei "Success. No rows returned". Draai daarom na
-- afloop de CONTROLE onderaan.
-- ============================================================


-- ============================================================
-- SECTIE 1 — De tabel
-- ============================================================

create table if not exists private.prikkel_antwoorden (
  id          uuid primary key default gen_random_uuid(),
  invite_code text not null,
  prikkel     text not null
              check (prikkel in ('stil', 'geroezemoes', 'reuring', 'maakt_niet_uit'))
);

create index if not exists prikkel_antwoorden_invite_code_idx
  on private.prikkel_antwoorden (invite_code);

alter table private.prikkel_antwoorden enable row level security;

-- Geen enkel recht op de tabel. Zonder policies en zonder grants kan
-- alleen de eigenaar (via de security-definer-functies hieronder) erbij.
revoke all on table private.prikkel_antwoorden from public, anon, authenticated;


-- ============================================================
-- SECTIE 2 — De regel, op één plek
-- ============================================================
-- Een pure functie, zodat de regel los te testen is zonder rijen te
-- schrijven (zie CONTROLE, punt 3).

create or replace function private.prikkel_uitkomst(
  p_stil bigint,
  p_geroezemoes bigint,
  p_reuring bigint
)
returns text
language sql
immutable
as $$
  select case
    when n < 5 then null
    when p_stil * 10 >= n * 3 and p_reuring * 10 >= n * 3 then 'gemengd'
    when p_stil * 2 >= n then 'stil'
    when p_reuring * 2 >= n then 'reuring'
    else 'zonder_uitersten'
  end
  from (select coalesce(p_stil, 0) + coalesce(p_geroezemoes, 0) + coalesce(p_reuring, 0) as n) x;
$$;

revoke all on function private.prikkel_uitkomst(bigint, bigint, bigint)
  from public, anon, authenticated;


-- ============================================================
-- SECTIE 3 — Schrijven
-- ============================================================
-- Controleert de code (bestaat en active = true, zoals check_team_code)
-- en de waarde. Geeft true als de rij is geschreven, anders false.
-- Gooit geen fout bij een onbekende code, zodat de browser niets leert
-- over welke codes bestaan.

create or replace function public.prikkel_opslaan(p_code text, p_prikkel text)
returns boolean
language plpgsql
volatile
security definer
set search_path = private, public
as $$
begin
  if p_code is null or btrim(p_code) = '' then
    return false;
  end if;
  if p_prikkel is null
     or p_prikkel not in ('stil', 'geroezemoes', 'reuring', 'maakt_niet_uit') then
    return false;
  end if;
  if not exists (
    select 1 from public.team_access_codes
    where code = p_code and active = true
  ) then
    return false;
  end if;

  insert into private.prikkel_antwoorden (invite_code, prikkel)
  values (p_code, p_prikkel);
  return true;
end;
$$;


-- ============================================================
-- SECTIE 4 — Lezen
-- ============================================================
-- Alleen de uitkomst, nooit aantallen. null bij een onbekende of
-- inactieve code, en bij minder dan vijf antwoorden met een voorkeur.

create or replace function public.prikkel_voor_code(p_code text)
returns text
language sql
stable
security definer
set search_path = private, public
as $$
  select private.prikkel_uitkomst(
           count(*) filter (where a.prikkel = 'stil'),
           count(*) filter (where a.prikkel = 'geroezemoes'),
           count(*) filter (where a.prikkel = 'reuring')
         )
  from private.prikkel_antwoorden a
  where a.invite_code = p_code
    and exists (
      select 1 from public.team_access_codes t
      where t.code = p_code and t.active = true
    );
$$;


-- ============================================================
-- SECTIE 5 — Rechten op de functies
-- ============================================================

revoke all on function public.prikkel_opslaan(text, text) from public;
revoke all on function public.prikkel_voor_code(text) from public;
grant execute on function public.prikkel_opslaan(text, text) to anon, authenticated;
grant execute on function public.prikkel_voor_code(text) to anon, authenticated;


-- ============================================================
-- CONTROLE — na het draaien uitvoeren (alleen lezen, schrijft niets)
-- ============================================================
-- 1. De tabel bestaat en heeft precies drie kolommen (geen datum).
--    Verwacht: id, invite_code, prikkel.
--
--   select column_name from information_schema.columns
--   where table_schema = 'private' and table_name = 'prikkel_antwoorden'
--   order by ordinal_position;
--
-- 2. Niemand heeft rechten op de tabel.
--    Verwacht: twee rijen, alle vier de waarden false.
--
--   select r.rolname,
--          has_table_privilege(r.rolname, 'private.prikkel_antwoorden', 'select') as mag_lezen,
--          has_table_privilege(r.rolname, 'private.prikkel_antwoorden', 'insert') as mag_schrijven
--   from pg_roles r
--   where r.rolname in ('anon', 'authenticated');
--
-- 3. De regel met verzonnen verdelingen. Schrijft niets.
--    Verwacht in de kolom uitkomst, van boven naar beneden:
--      null, null, gemengd, stil, reuring, zonder_uitersten,
--      gemengd, stil, null, zonder_uitersten
--
--   select v.omschrijving,
--          private.prikkel_uitkomst(v.stil, v.geroezemoes, v.reuring) as uitkomst
--   from (values
--     ('4x maakt niet uit + 1 stil (n = 1)',      1, 0, 0),
--     ('4 voorkeuren (n = 4)',                    2, 0, 2),
--     ('3 stil + 2 reuring',                      3, 0, 2),
--     ('3 stil + 2 geroezemoes',                  3, 2, 0),
--     ('3 reuring + 2 geroezemoes',               0, 2, 3),
--     ('1 stil + 3 geroezemoes + 1 reuring',      1, 3, 1),
--     ('3 stil + 4 geroezemoes + 3 reuring (30 %)', 3, 4, 3),
--     ('5 stil + 3 geroezemoes + 2 reuring (50 %)', 5, 3, 2),
--     ('niets',                                   0, 0, 0),
--     ('2 stil + 6 geroezemoes + 2 reuring (20 %)', 2, 6, 2)
--   ) as v(omschrijving, stil, geroezemoes, reuring);
--
-- 4. De functies bestaan, met security definer.
--    Verwacht: twee rijen, allebei true.
--
--   select p.proname, p.prosecdef
--   from pg_proc p join pg_namespace n on n.oid = p.pronamespace
--   where n.nspname = 'public' and p.proname in ('prikkel_opslaan', 'prikkel_voor_code');
--
-- 5. Een onbekende code levert niets op en schrijft niets.
--    Verwacht: null.
--
--   select public.prikkel_voor_code('BESTAAT-NIET');
-- ============================================================
