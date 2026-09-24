-- ============================================================
-- 005_private_schema_access.sql
-- ============================================================
-- Doel: de Data-API-toegang tot de responses-tabel expliciet en
-- toekomstvast maken.
--
-- Context (situatie sept/okt 2026):
--   * `responses` staat in schema `private` en wordt door de app
--     benaderd via  supabase.schema('private').from('responses').
--   * `private` is al toegevoegd aan de exposed schemas (Settings →
--     API → Data API) en er staan al 3 RLS-policies op de tabel.
--     Inserts landen (367 rijen aanwezig) — de basis werkt dus.
--   * De overige tabellen (team_access_codes, membership, admin_codes,
--     organization_observations, pdf_downloads, strategic_kompas_intake,
--     team_managers) staan in `public` en worden via een kale
--     .from('...') benaderd. NIET naar private verplaatsen en de
--     client-default NIET op private zetten — dat breekt die calls.
--
-- Waarom dit script (Supabase-mail 30 okt 2026):
--   Vanaf 30 okt krijgt een NIEUWE tabel in `public` niet meer
--   automatisch Data-API-rechten. Ook `supabase db reset`, preview
--   branches en nieuwe projecten leunen daarop. Expliciete GRANTs in
--   de migratie voorkomen dat een tabel stil onbereikbaar wordt.
--   Dit script maakt de grants expliciet en biedt een controleblok.
--
-- VOLGORDE:
--   1. Draai SECTIE 0 (read-only) en lees de uitkomst.
--   2. Pas namen aan als jouw tabellen anders heten / ergens anders staan.
--   3. Draai SECTIE 1 en 2 (additieve grants — veilig, idempotent).
--   4. SECTIE 3 (policies) ALLEEN als de controle in stap 1 laat zien
--      dat een insert- of select-policy op private.responses ontbreekt.
--      Vergelijk eerst met de 3 bestaande policies.
--
-- Veilig opnieuw te draaien (grants zijn idempotent; policies staan
-- achter DROP POLICY IF EXISTS in sectie 3).
-- ============================================================


-- ============================================================
-- SECTIE 0 — CONTROLEBLOK (read-only, draai dit eerst)
-- ============================================================

-- 0a. In welk schema staat elke tabel die de app gebruikt?
select table_schema, table_name
from information_schema.tables
where table_name in (
  'responses', 'team_access_codes', 'membership', 'admin_codes',
  'organization_observations', 'pdf_downloads',
  'strategic_kompas_intake', 'team_managers', 'feedback'
)
order by table_schema, table_name;

-- 0b. Welke rechten heeft anon/authenticated nu op private.responses?
select grantee, privilege_type
from information_schema.role_table_grants
where table_schema = 'private' and table_name = 'responses'
order by grantee, privilege_type;

-- 0c. Welke RLS-policies staan er al op private.responses?
--     (verwacht: de 3 bestaande — bekijk cmd = INSERT/SELECT/...)
select policyname, cmd, roles, qual, with_check
from pg_policies
where schemaname = 'private' and tablename = 'responses'
order by policyname;


-- ============================================================
-- SECTIE 1 — GRANTS op het private-schema en responses
-- ============================================================
-- `grant usage` op het schema is verplicht: zonder dit ziet PostgREST
-- het schema niet, ook al is het exposed. De table-grants regelen wat
-- anon (niet-ingelogde invuller) en authenticated mogen.
-- RLS bepaalt daarna PER RIJ wat echt mag; grants zijn de grove poort.

grant usage on schema private to anon, authenticated, service_role;

-- De app doet insert().select(): zonder SELECT-recht rolt de insert
-- terug (het stille falen). Vandaar select naast insert voor anon.
grant select, insert          on private.responses to anon;
grant select, insert, update, delete on private.responses to authenticated;
grant select, insert, update, delete on private.responses to service_role;


-- ============================================================
-- SECTIE 2 — Oct-30-proof: expliciete grants op de public-tabellen
-- ============================================================
-- Bestaande tabellen behouden hun rechten, maar deze regels maken ze
-- expliciet zodat een db reset / preview branch / nieuwe migratie ze
-- niet stil zonder Data-API-toegang achterlaat. Puur additief.

grant select                         on public.team_access_codes        to anon, authenticated;
grant select, insert, update, delete on public.team_access_codes        to authenticated, service_role;

grant select, insert                 on public.strategic_kompas_intake  to anon;
grant select, insert, update, delete on public.strategic_kompas_intake  to authenticated, service_role;

grant select, insert                 on public.pdf_downloads            to anon, authenticated;
grant select, insert, update, delete on public.pdf_downloads            to service_role;

grant select, insert, update, delete on public.membership               to authenticated, service_role;
grant select, insert, update, delete on public.organization_observations to authenticated, service_role;
grant select, insert, update, delete on public.team_managers            to authenticated, service_role;
grant select                         on public.admin_codes              to anon, authenticated;
grant select, insert, update, delete on public.admin_codes              to service_role;


-- ============================================================
-- SECTIE 3 — RLS-policies op private.responses
-- ============================================================
-- ALLEEN draaien als sectie 0c laat zien dat een insert- of
-- select-policy ONTBREEKT. Er staan al 3 policies; leg deze ernaast en
-- vervang niet blind. De DROP-regels hieronder verwijderen alleen
-- policies die exact deze namen dragen, dus je bestaande policies
-- (met andere namen) blijven staan.
--
-- LET OP — beveiliging: een brede SELECT-policy voor anon betekent dat
-- iedereen met de anon-key ALLE responses kan lezen. Dat is nu al zo
-- (de access-code-check zit in de frontend). Prima voor de pilot, maar
-- pak dit aan vóór je met echte klantteams draait — vraag om de variant
-- waarbij lezen alleen mag via een gevalideerde access code.

-- alter table private.responses enable row level security;

-- drop policy if exists "responses_anon_insert" on private.responses;
-- create policy "responses_anon_insert"
--   on private.responses for insert to anon, authenticated
--   with check (true);

-- -- Nodig voor insert().select(): zonder deze regel rolt de insert terug.
-- drop policy if exists "responses_anon_select" on private.responses;
-- create policy "responses_anon_select"
--   on private.responses for select to anon, authenticated
--   using (true);


-- ============================================================
-- SANITY (na afloop)
-- ============================================================
-- select count(*) from private.responses;
-- -- herhaal 0b en 0c om te bevestigen dat grants + policies kloppen.
