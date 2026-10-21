-- ============================================================
-- 008_code_check_functions.sql
-- ============================================================
-- Doel: de codetabellen dichtzetten zonder de app te breken.
--
-- Probleem nu:
--   1. public.team_access_codes is leesbaar voor anon. Iedereen met de
--      (publieke) anon-key vraagt de complete lijst actieve teamcodes
--      op, en met elke code geeft responses_for_code (006/007) de
--      antwoorden van dat team terug — ook die van de Nijkerk-teams.
--      Het quiz-aanmeldformulier (QuizAanmelding.jsx) haalde die lijst
--      bovendien zélf op, om de keuzelijst en het codeveld te vullen.
--   2. public.admin_codes is leesbaar voor anon: de admin-code ligt op
--      straat.
--   3. public.membership wordt vanuit de browser beschreven, inclusief
--      de kolom `role`. Een ingelogde gebruiker kan zichzelf aan elk
--      team toevoegen, met elke rol.
--   4. private.responses heeft de policy "Authed mag responses lezen"
--      (SELECT, authenticated, qual = true). Inloggen gaat via een
--      magic link, dus wie zich kan aanmelden leest alle antwoorden.
--
-- Oplossing (zelfde patroon als 006):
--   Functies die één ingevoerde code controleren en alleen teruggeven
--   wat nodig is (SECTIE 1). De app gebruikt die functies, met een
--   terugval op de oude leesactie zolang de functie nog niet bestaat.
--   Pas daarna gaat het open leesrecht dicht (SECTIE 3 en 4).
--
-- BELANGRIJK — UITROL-VOLGORDE:
--   1. SECTIE 0 draaien (alleen lezen) en de uitkomst bekijken.
--   2. SECTIE 1 + 2 draaien. Additief: er gaat nog niets dicht.
--   3. De nieuwe frontend deployen en testen: quiz (demo én via een
--      uitnodigingslink), teamcode invoeren, admin-code, inloggen als
--      manager, het beheerscherm.
--   4. PAS DAARNA SECTIE 3 (codetabellen + membership).
--   5. SECTIE 4 (responses) los daarvan, na een eigen controle.
--
-- Idempotent: create or replace / drop ... if exists.
--
-- STATUS: secties 0 t/m 3 gedraaid op 21 okt 2026 (productie). Daarna als
-- anon geverifieerd: team_access_codes, admin_codes en een insert in
-- membership geven 42501; check_team_code, check_admin_code en quiz_teams
-- werken; join_team zonder inloggen geeft not_logged_in. SECTIE 4 gedraaid
-- op 21 okt 2026: anon leest private.responses niet (42501), de RPC geeft
-- het Demo-team (17 rijen, 0 met naam). Een ingelogde niet-beheerder is
-- niet getest — dat vraagt een tweede account.
-- ============================================================


-- ============================================================
-- SECTIE 0 — CONTROLEBLOK (read-only, draai dit eerst)
-- ============================================================

-- 0a. Welke policies staan er nu op de codetabellen en membership?
select schemaname, tablename, policyname, cmd, roles, qual, with_check
from pg_policies
where (schemaname, tablename) in (
  ('public', 'team_access_codes'),
  ('public', 'admin_codes'),
  ('public', 'membership'),
  ('private', 'responses')
)
order by schemaname, tablename, policyname;

-- 0b. Staat RLS aan?
select n.nspname as schema, c.relname as tabel, c.relrowsecurity as rls_aan
from pg_class c join pg_namespace n on n.oid = c.relnamespace
where (n.nspname, c.relname) in (
  ('public', 'team_access_codes'), ('public', 'admin_codes'),
  ('public', 'membership'), ('private', 'responses')
);

-- 0c. Rechten van anon/authenticated op deze tabellen.
select table_schema, table_name, grantee, string_agg(privilege_type, ', ' order by privilege_type) as rechten
from information_schema.role_table_grants
where grantee in ('anon', 'authenticated')
  and (table_schema, table_name) in (
    ('public', 'team_access_codes'), ('public', 'admin_codes'),
    ('public', 'membership'), ('private', 'responses')
  )
group by 1, 2, 3
order by 1, 2, 3;

-- 0d. Kolommen die de functies hieronder aannemen.
select table_name, column_name, data_type
from information_schema.columns
where table_schema = 'public'
  and table_name in ('team_access_codes', 'admin_codes', 'membership')
order by table_name, ordinal_position;

-- 0e. Heeft één (organisatie, team) meer dan één actieve code? De
--     trigger in sectie 1 kiest dan de nieuwste; goed om te weten.
select organization, team, count(*) as actieve_codes
from public.team_access_codes
where active = true
group by organization, team
having count(*) > 1;

-- 0f. Bestaat de unieke sleutel (user_id, team) op membership? join_team
--     leunt erop (on conflict). De oude browsercode ook al.
select conname, pg_get_constraintdef(oid)
from pg_constraint
where conrelid = 'public.membership'::regclass and contype in ('u', 'p');


-- ============================================================
-- SECTIE 1 — Functies
-- ============================================================

-- Beheerder? Zelfde regel als ADMIN_EMAILS in src/supabase.js en de
-- policy "admins_full_access" in 001. Eén plek, zodat sectie 3 en 4
-- er niet elk een eigen kopie van hebben.
create or replace function public.is_tof_admin()
returns boolean
language sql
stable
set search_path = public
as $$
  select lower(coalesce(auth.jwt() ->> 'email', '')) = 'judith@tof.services';
$$;

-- Eén teamcode controleren. Geeft precies de velden terug die de app
-- gebruikt (code, level, organization, team) — en alleen voor die ene,
-- actieve code. Een lijst opvragen kan hiermee niet.
create or replace function public.check_team_code(p_code text)
returns table (code text, level text, organization text, team text)
language sql
stable
security definer
set search_path = public
as $$
  select t.code::text, t.level::text, t.organization::text, t.team::text
  from public.team_access_codes t
  where t.code = trim(coalesce(p_code, ''))
    and t.active = true
  limit 1;
$$;

-- Eén admin-code controleren. Alleen waar of onwaar: de rij zelf
-- verlaat de server niet.
create or replace function public.check_admin_code(p_code text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admin_codes a
    where a.code = trim(coalesce(p_code, ''))
      and a.active = true
  );
$$;

-- Lid worden van een team via een code. De server bepaalt team,
-- organisatie én rol; de browser stuurt alleen de code. De rol is
-- altijd 'member' — een hogere rol loopt via team_managers (beheer).
-- Geeft niets terug bij een onbekende code; gooit een fout als de
-- gebruiker niet is ingelogd.
create or replace function public.join_team(p_code text)
returns table (team text, organization text, role text, created_at timestamptz)
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  v_uid  uuid := auth.uid();
  v_team text;
  v_org  text;
begin
  if v_uid is null then
    raise exception 'not_logged_in' using errcode = '28000';
  end if;

  select coalesce(nullif(trim(t.team), ''), 'Team ' || t.code), t.organization
    into v_team, v_org
  from public.team_access_codes t
  where t.code = trim(coalesce(p_code, ''))
    and t.active = true
  limit 1;

  if v_team is null then
    return;
  end if;

  insert into public.membership (user_id, team, organization, role)
  values (v_uid, v_team, v_org, 'member')
  on conflict (user_id, team) do nothing;

  return query
    select m.team::text, m.organization::text, m.role::text, m.created_at::timestamptz
    from public.membership m
    where m.user_id = v_uid and m.team = v_team;
end;
$$;

-- De lidmaatschappen van de ingelogde gebruiker, met de code en het
-- niveau erbij. Vervangt de losse lookups op team_access_codes die
-- getMyMemberships per lidmaatschap deed. Je krijgt alleen de codes
-- van teams waar je zelf lid van bent — die heb je zelf ingevoerd.
create or replace function public.my_team_memberships()
returns table (team text, organization text, role text, created_at timestamptz, code text, level text)
language sql
stable
security definer
set search_path = public
as $$
  select m.team::text, m.organization::text, m.role::text, m.created_at::timestamptz,
         c.code::text, coalesce(c.level::text, 'insight')
  from public.membership m
  left join lateral (
    select t.code, t.level
    from public.team_access_codes t
    where t.active = true
      and t.team = m.team
      and (m.organization is null or t.organization = m.organization)
    order by t.created_at desc
    limit 1
  ) c on true
  where m.user_id = auth.uid()
  order by m.created_at asc;
$$;

-- De keuzelijst van het quiz-aanmeldformulier. ZONDER codes.
--   * Demo-organisaties: altijd (dat is de vrije "test jezelf"-route).
--   * p_org (uit de uitnodigingslink ?org=): de teams van die organisatie.
--   * p_code (uit de link ?code=): de teams van de organisatie van die
--     code, met is_link_team = true op het team van de code zelf, zodat
--     het formulier dat team kan voorselecteren.
-- Teamnamen binnen een organisatie zijn hier dus zichtbaar voor wie de
-- organisatienaam kent; de codes niet. Die vult de trigger hieronder in.
create or replace function public.quiz_teams(p_org text default null, p_code text default null)
returns table (organization text, team text, is_link_team boolean)
language sql
stable
security definer
set search_path = public
as $$
  with link as (
    select t.organization, t.team
    from public.team_access_codes t
    where t.code = trim(coalesce(p_code, ''))
      and t.active = true
    limit 1
  )
  select distinct t.organization::text, t.team::text,
         exists (select 1 from link l where l.organization = t.organization and l.team = t.team)
  from public.team_access_codes t
  where t.active = true
    and coalesce(trim(t.team), '') <> ''
    and (
      t.organization ilike '%demo%'
      or (nullif(trim(coalesce(p_org, '')), '') is not null and t.organization = trim(p_org))
      or t.organization in (select l.organization from link l)
    )
  order by 1, 2;
$$;

-- De teamcode bij een nieuwe response invullen als de browser hem niet
-- meestuurt. Het quizformulier kent de codes niet meer; het stuurt
-- organisatie + afdeling, en de server zoekt de bijbehorende code. Een
-- meegestuurde code (uitnodigingslink, /bijdragen) blijft staan.
create or replace function private.responses_fill_invite_code()
returns trigger
language plpgsql
security definer
set search_path = public, private
as $$
begin
  if coalesce(trim(new.invite_code), '') = '' and new.organization is not null then
    select t.code into new.invite_code
    from public.team_access_codes t
    where t.active = true
      and t.organization = new.organization
      and t.team = coalesce(nullif(trim(new.department), ''), new.team)
    order by t.created_at desc
    limit 1;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_responses_fill_invite_code on private.responses;
create trigger trg_responses_fill_invite_code
  before insert on private.responses
  for each row execute function private.responses_fill_invite_code();


-- ============================================================
-- SECTIE 2 — Execute-rechten
-- ============================================================
-- Functies zijn standaard uitvoerbaar voor PUBLIC; dat eerst intrekken
-- en dan per functie expliciet toekennen.

revoke all on function public.is_tof_admin()                 from public;
revoke all on function public.check_team_code(text)          from public;
revoke all on function public.check_admin_code(text)         from public;
revoke all on function public.join_team(text)                from public;
revoke all on function public.my_team_memberships()          from public;
revoke all on function public.quiz_teams(text, text)         from public;
revoke all on function private.responses_fill_invite_code()  from public;

grant execute on function public.is_tof_admin()              to anon, authenticated;
grant execute on function public.check_team_code(text)       to anon, authenticated;
grant execute on function public.check_admin_code(text)      to anon, authenticated;
grant execute on function public.quiz_teams(text, text)      to anon, authenticated;
grant execute on function public.join_team(text)             to authenticated;
grant execute on function public.my_team_memberships()       to authenticated;

-- Nagekomen (21 okt 2026): Supabase geeft nieuwe functies in `public` via
-- default privileges óók rechtstreeks execute aan anon. De revoke from public
-- hierboven raakt dat niet — na sectie 2 kon anon my_team_memberships nog
-- aanroepen (gaf een lege lijst, want auth.uid() is dan null; join_team gaf
-- not_logged_in). Onschuldig, maar dit hoort zo:
revoke execute on function public.join_team(text)       from anon;
revoke execute on function public.my_team_memberships() from anon;


-- ============================================================
-- SECTIE 3 — De schakelaar: codetabellen en membership dicht
-- ============================================================
-- PAS draaien NA stap 3 van de uitrol (nieuwe frontend live en getest).
-- Daarna loopt de app niet meer via de terugval naar de oude leesactie.
--
-- Wat blijft werken, en waarom:
--   * Teamcode invoeren, quiz, /bijdragen  → via de functies uit sectie 1.
--   * Manager inloggen (getMyManagedTeams) → leest team_managers met een
--     join op team_access_codes; de policy "managers_read_own_codes"
--     hieronder laat precies die rijen door.
--   * Beheerscherm (codes tonen/aanmaken)  → policy "admin_all_codes".
--   * Admin-code invoeren                  → check_admin_code.

-- 3a. team_access_codes: alle bestaande policies weg (0a laat ze zien;
--     één daarvan is de open leesregel), dan alleen beheer + eigen
--     managerteams.
alter table public.team_access_codes enable row level security;

do $$
declare p record;
begin
  for p in
    select policyname from pg_policies
    where schemaname = 'public' and tablename = 'team_access_codes'
  loop
    execute format('drop policy %I on public.team_access_codes', p.policyname);
  end loop;
end $$;

create policy "admin_all_codes"
  on public.team_access_codes for all to authenticated
  using (public.is_tof_admin())
  with check (public.is_tof_admin());

create policy "managers_read_own_codes"
  on public.team_access_codes for select to authenticated
  using (exists (
    select 1 from public.team_managers tm
    where tm.team_code = team_access_codes.code
      and tm.email = lower(auth.jwt() ->> 'email')
  ));

revoke all on public.team_access_codes from anon;

-- 3b. admin_codes: niemand leest dit nog rechtstreeks. service_role
--     (dashboard) houdt alles.
revoke all on public.admin_codes from anon, authenticated;

-- 3c. membership: alleen nog via join_team. Lezen van je eigen rijen
--     mag blijven (bestaande policy), schrijven niet meer.
revoke insert, update on public.membership from anon, authenticated;

-- Sanity na sectie 3 (als anon, bijv. met de anon-key via curl):
--   GET /rest/v1/team_access_codes?select=code        → [] of 401
--   GET /rest/v1/admin_codes?select=code              → 401
--   POST /rest/v1/rpc/check_team_code {"p_code":"DEM-DEM-26-0K8M"} → 1 rij
--   POST /rest/v1/rpc/quiz_teams {}                   → alleen Demo, geen codes


-- ============================================================
-- SECTIE 4 — private.responses: alleen nog de beheerder rechtstreeks
-- ============================================================
-- Los van sectie 3 draaien, na een eigen controle.
--
-- Wie leest private.responses nu rechtstreeks (niet via de RPC)?
--   * Admin.jsx (getResponsesByOrganization, getAllTeamAccessCodes,
--     getTeamsOverview)  → Judith ingelogd   → blijft werken.
--   * TeamSelector.jsx (route /team/selector, na de admin-code) → werkt
--     alleen als je óók als judith@tof.services bent ingelogd. Zonder
--     inloggen kreeg anon hier sinds 006 al niets meer.
--   * Managers en teamleden lezen via responses_for_code (security
--     definer) en merken hier niets van.
--
-- Vervangt de policy die elke ingelogde gebruiker alles laat lezen.
drop policy if exists "Authed mag responses lezen" on private.responses;
drop policy if exists "admin_reads_responses" on private.responses;
create policy "admin_reads_responses"
  on private.responses for select to authenticated
  using (public.is_tof_admin());


-- ============================================================
-- SANITY
-- ============================================================
-- select * from public.check_team_code('DEM-DEM-26-0K8M');   -- 1 rij
-- select * from public.check_team_code('BESTAAT-NIET');      -- 0 rijen
-- select public.check_admin_code('BESTAAT-NIET');            -- false
-- select * from public.quiz_teams();                         -- alleen Demo
-- select * from public.quiz_teams('Gemeente Nijkerk');       -- 15 teams, geen codes
-- select * from public.quiz_teams(null, 'NJK-IT');           -- Nijkerk, IT gemarkeerd
--
-- Trigger testen zonder echte data achter te laten:
--   begin;
--   insert into private.responses (organization, department, team,
--                                  primary_archetype, secondary_archetype)
--   values ('Gemeente Nijkerk', 'Informatie en Technologie', 'Informatie en Technologie',
--           'test', 'test')
--   returning invite_code;                                   -- verwacht: NJK-IT
--   rollback;
--
-- GEDRAAID 21 okt 2026 (zonder secondary_archetype, dat is verplicht): de
-- insert werd geweigerd op die kolom, maar de foutmelding toonde de rij mét
-- invite_code = NJK-IT — de before-trigger draait vóór de not-null-controle.
-- Trigger werkt dus. Volgnummer 414 is daarbij overgeslagen.
