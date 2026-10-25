-- ============================================================
-- 010_names_rule.sql
-- ============================================================
-- Doel: ook met de namenschakelaar aan (show_names, 007) verlaat een
-- voornaam de server alleen als niemand door wegstrepen herkenbaar is.
--
-- De regel (besluit Judith K2, 25 okt 2026; zie ook src/utils/access.js,
-- namesByPersona):
--   Namen alleen als
--     - iedereen met een ingebracht profiel een voornaam heeft, of
--     - de mensen zonder voornaam samen minstens vijf zijn.
--   Anders geen namen, alsof de schakelaar uit staat.
--   Daarnaast: onder vijf ingebrachte profielen geen namen. Daar is geen
--   teambeeld, dus de namen hoeven ook niet naar de browser.
--
-- "Ingebracht profiel" = een rij met primary_archetype (dezelfde telling
-- als de drempel van vijf in de app). "Met naam" = een naam die na het
-- weghalen van spaties niet leeg is.
--
-- Vervangt responses_for_code en responses_for_codes uit 007. De
-- execute-grants uit 006 blijven staan; create or replace raakt ze niet.
-- Idempotent.
--
-- LET OP in de SQL Editor: een gelukte `create or replace` en een lege
-- `select` geven allebei "Success. No rows returned". Draai daarom na
-- afloop de CONTROLE onderaan.
-- ============================================================


-- ============================================================
-- SECTIE 1 — De regel, op één plek
-- ============================================================
-- Een kleine functie, zodat beide leesfuncties hetzelfde rekenen en de
-- regel los te controleren is (zie CONTROLE).

create or replace function private.names_allowed(
  p_show_names boolean,
  p_profielen bigint,
  p_zonder_naam bigint
)
returns boolean
language sql
immutable
as $$
  select coalesce(p_show_names, false)
     and p_profielen >= 5
     and (p_zonder_naam = 0 or p_zonder_naam >= 5);
$$;

-- Alleen voor de leesfuncties hieronder (security definer); niemand
-- anders hoeft hem aan te roepen.
revoke all on function private.names_allowed(boolean, bigint, bigint)
  from public, anon, authenticated;


-- ============================================================
-- SECTIE 2 — De leesfuncties
-- ============================================================

create or replace function public.responses_for_code(p_code text)
returns setof private.responses
language sql
stable
security definer
set search_path = private, public
as $$
  with tac as (
    select organization, team, coalesce(show_names, false) as show_names
    from public.team_access_codes
    where code = p_code and active = true
    limit 1
  ),
  tel as (
    -- Dezelfde rijen als hieronder, inclusief de oude rijen zonder
    -- invite_code die op team en organisatie worden gevonden.
    select count(*) filter (where r.primary_archetype is not null) as profielen,
           count(*) filter (where r.primary_archetype is not null
                              and nullif(btrim(r.name), '') is null) as zonder_naam
    from private.responses r, tac
    where r.invite_code = p_code
       or (r.invite_code is null
           and r.team = tac.team
           and r.organization = tac.organization)
  )
  select case
           when private.names_allowed(tac.show_names, tel.profielen, tel.zonder_naam) then r
           else jsonb_populate_record(r, '{"name": null}'::jsonb)
         end
  from private.responses r, tac, tel
  where r.invite_code = p_code
     or (r.invite_code is null
         and r.team = tac.team
         and r.organization = tac.organization)
  order by r.created_at asc;
$$;

-- Zelfde regel per code, anders is dit een omweg om de regel heen.
create or replace function public.responses_for_codes(p_codes text[])
returns setof private.responses
language sql
stable
security definer
set search_path = private, public
as $$
  with tel as (
    select r.invite_code,
           count(*) filter (where r.primary_archetype is not null) as profielen,
           count(*) filter (where r.primary_archetype is not null
                              and nullif(btrim(r.name), '') is null) as zonder_naam
    from private.responses r
    join public.team_access_codes t on t.code = r.invite_code
    where t.active = true
      and r.invite_code = any (p_codes)
    group by r.invite_code
  )
  select case
           when private.names_allowed(x.show_names, x.profielen, x.zonder_naam) then x.resp
           else jsonb_populate_record(x.resp, '{"name": null}'::jsonb)
         end
  from (
    select distinct
           r as resp,
           coalesce(t.show_names, false) as show_names,
           tel.profielen,
           tel.zonder_naam,
           r.created_at
    from private.responses r
    join public.team_access_codes t on t.code = r.invite_code
    join tel on tel.invite_code = r.invite_code
    where t.active = true
      and r.invite_code = any (p_codes)
  ) x
  order by x.created_at asc;
$$;


-- ============================================================
-- CONTROLE — na het draaien uitvoeren
-- ============================================================
-- 1. De regel met de vier voorbeelden uit de opdracht (schakelaar aan).
--    Verwacht: true, false, true, false.
--
--   select v.profielen, v.met_naam,
--          private.names_allowed(true, v.profielen, v.profielen - v.met_naam) as namen
--   from (values (8, 8), (8, 7), (12, 7), (12, 8)) as v(profielen, met_naam);
--
-- 2. De functies bestaan in de nieuwe vorm (de definitie noemt names_allowed).
--    Verwacht: twee rijen, allebei true.
--
--   select p.proname, pg_get_functiondef(p.oid) like '%names_allowed%' as nieuw
--   from pg_proc p join pg_namespace n on n.oid = p.pronamespace
--   where n.nspname = 'public'
--     and p.proname in ('responses_for_code', 'responses_for_codes');
--
-- 3. Het demoteam staat uit, dus nog steeds geen namen.
--    Verwacht: totaal 17, met_naam 0.
--
--   select count(*) as totaal, count(name) as met_naam
--   from public.responses_for_code('DEM-DEM-26-0K8M');
--
-- 4. Anon kan de regelfunctie niet zelf aanroepen. Verwacht: geen rij.
--
--   select grantee, privilege_type
--   from information_schema.routine_privileges
--   where routine_schema = 'private' and routine_name = 'names_allowed'
--     and grantee in ('anon', 'authenticated', 'PUBLIC');
