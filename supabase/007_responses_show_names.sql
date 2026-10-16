-- ============================================================
-- 007_responses_show_names.sql
-- ============================================================
-- Doel: de voornaam van een respondent verlaat de server niet meer,
-- tenzij het team daar zelf goedkeuring voor heeft gegeven.
--
-- Waarom:
--   Sinds commit b2160da toont de app geen namen meer in het teambeeld,
--   maar dat was een wijziging in de WEERGAVE. De RPC uit 006 doet
--   `select r.*` en stuurt `name` dus nog steeds mee aan iedereen met
--   een geldige teamcode — zichtbaar in de netwerkrespons. Dit bestand
--   verplaatst die regel naar de server, waar hij hoort.
--
-- De regel (zie ook src/utils/access.js, "NAMEN IN HET TEAMBEELD"):
--   Standaard geen namen, ook niet voor de manager. Namen mogen aan
--   zodra een team daar zelf goedkeuring voor geeft, en dan geldt dat
--   voor iedereen gelijk — teamleden én manager zien hetzelfde. Een
--   stand waarin alleen de manager namen ziet bestaat bewust niet.
--   Daarom hangt de schakelaar aan de teamcode en niet aan de rol.
--
-- Aanzetten voor één team (Supabase → Table Editor, of hier):
--   update public.team_access_codes set show_names = true where code = '...';
--
-- LET OP: aanzetten verandert vandaag niets aan wat je ziet. De app
-- rendert geen namen meer — dat is een bewuste keuze, niet een
-- vergetelheid. Deze migratie zorgt dat de data pas beschikbaar is als
-- er goedkeuring is; de weergave is een aparte opdracht.
--
-- Idempotent: add column if not exists / create or replace function.
-- ============================================================


-- ============================================================
-- SECTIE 1 — De schakelaar
-- ============================================================
-- Standaard uit. Bestaande teams komen dus automatisch goed terecht.

alter table public.team_access_codes
  add column if not exists show_names boolean not null default false;

comment on column public.team_access_codes.show_names is
  'Heeft dit team goedkeuring gegeven om voornamen in het teambeeld te tonen? Standaard false. Geldt voor iedereen gelijk: teamleden én manager.';


-- ============================================================
-- SECTIE 2 — De leesfuncties respecteren de schakelaar
-- ============================================================
-- jsonb_populate_record(base, json) geeft base terug met alleen de
-- velden uit json overschreven. Zo hoeven we de kolommen van
-- private.responses niet op te sommen — voeg je er later een toe, dan
-- blijft dit werken en valt er niets stilletjes buiten.

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
  )
  select case
           when tac.show_names then r
           else jsonb_populate_record(r, '{"name": null}'::jsonb)
         end
  from private.responses r, tac
  where r.invite_code = p_code
     or (r.invite_code is null
         and r.team = tac.team
         and r.organization = tac.organization)
  order by r.created_at asc;
$$;

-- Zelfde regel per code, anders is dit een omweg om de schakelaar heen.
create or replace function public.responses_for_codes(p_codes text[])
returns setof private.responses
language sql
stable
security definer
set search_path = private, public
as $$
  select case
           when x.show_names then x.resp
           else jsonb_populate_record(x.resp, '{"name": null}'::jsonb)
         end
  from (
    select distinct
           r as resp,
           coalesce(t.show_names, false) as show_names,
           r.created_at
    from private.responses r
    join public.team_access_codes t
      on t.code = r.invite_code
    where t.active = true
      and r.invite_code = any (p_codes)
  ) x
  order by x.created_at asc;
$$;

-- De execute-grants uit 006 blijven staan; create or replace raakt ze niet.


-- ============================================================
-- SANITY
-- ============================================================
-- Demo-team staat standaard uit → name moet overal leeg zijn:
--   select count(*) as totaal, count(name) as met_naam
--   from public.responses_for_code('DEM-DEM-26-0K8M');
--   -- verwacht: totaal 17, met_naam 0
--
-- Tijdelijk aanzetten en opnieuw tellen:
--   update public.team_access_codes set show_names = true
--   where code = 'DEM-DEM-26-0K8M';
--   select count(*) as totaal, count(name) as met_naam
--   from public.responses_for_code('DEM-DEM-26-0K8M');
--   -- verwacht: met_naam > 0
--
-- EN DAARNA WEER UIT — het Demo-team heeft geen goedkeuring gegeven:
--   update public.team_access_codes set show_names = false
--   where code = 'DEM-DEM-26-0K8M';
--
-- Controleer ook dat de rest van de rij intact blijft (alleen name is
-- leeggemaakt, de scores niet):
--   select id, name, team, primary_archetype, full_scores is not null as scores_ok
--   from public.responses_for_code('DEM-DEM-26-0K8M') limit 3;
