-- ============================================================
-- 009_check_team_code_show_names.sql
-- ============================================================
-- Doel: check_team_code (008) geeft ook `show_names` terug.
--
-- Waarom:
--   Het wachtscherm (TeamGate) en het Gelukt-scherm na "Profiel
--   inbrengen" (Bijdragen) hebben een andere privacyzin als het team
--   heeft afgesproken voornamen te tonen (opdracht C4 en C5, 23 okt
--   2026). Wie alleen een teamcode heeft, kon nergens zien of die
--   schakelaar aan staat: check_team_code gaf alleen code, niveau,
--   organisatie en team terug, en team_access_codes is sinds 008 dicht
--   voor anon. Afleiden uit de antwoorden gaat niet — bij nul ingevulde
--   namen zie je het verschil niet.
--
-- Is dat veilig?
--   Ja. Het is een vlag van het team, geen persoonsgegeven, en hij gaat
--   alleen naar wie de juiste code al heeft. Wie die code heeft, ziet de
--   namen sowieso zodra de schakelaar aan staat (responses_for_code, 007).
--
-- Zolang dit bestand niet gedraaid is, krijgt de app geen show_names en
-- toont hij de standaardzin ("Niemand ziet wie welke werkstijl heeft").
-- Dat is de veilige kant.
--
-- Draaien: in de Supabase SQL-editor, in één keer. Idempotent.
-- De functie wordt eerst verwijderd, want Postgres staat niet toe dat
-- `create or replace` de teruggegeven kolommen verandert.
-- ============================================================

drop function if exists public.check_team_code(text);

create function public.check_team_code(p_code text)
returns table (code text, level text, organization text, team text, show_names boolean)
language sql
stable
security definer
set search_path = public
as $$
  select t.code::text, t.level::text, t.organization::text, t.team::text,
         coalesce(t.show_names, false)
  from public.team_access_codes t
  where t.code = trim(coalesce(p_code, ''))
    and t.active = true
  limit 1;
$$;

revoke all on function public.check_team_code(text) from public;
grant execute on function public.check_team_code(text) to anon, authenticated;


-- ============================================================
-- Controle (alleen lezen): moet één rij met show_names geven.
-- ============================================================
-- select * from public.check_team_code('DEM-DEM-26-0K8M');
