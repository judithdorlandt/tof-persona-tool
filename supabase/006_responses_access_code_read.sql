-- ============================================================
-- 006_responses_access_code_read.sql
-- ============================================================
-- Doel: het openstaande beveiligingspunt uit 005 dichten.
--
-- Probleem nu:
--   private.responses heeft een brede SELECT voor anon → iedereen met
--   de (publieke) anon-key kan ALLE responses lezen. De enige rem zit
--   in de frontend (access-code-check). Prima voor de pilot, niet voor
--   echte klantteams.
--
-- Oplossing:
--   Lezen alleen nog via een SECURITY DEFINER-functie die eerst de
--   access code valideert tegen team_access_codes (active = true) en
--   daarna alléén de rijen van dat team teruggeeft. Daarna trekken we
--   het directe SELECT-recht van anon in. Admin (Judith) houdt volledig
--   leesrecht via de bestaande admin-policy / JWT-check.
--
-- BELANGRIJK — UITROL-VOLGORDE (anders breken de dashboards):
--   1. Draai SECTIE 1 + 2 (functies aanmaken + execute-grant). Veilig,
--      verandert nog niets aan bestaand gedrag.
--   2. Pas de client aan zodat de leespaden de RPC gebruiken i.p.v.
--      supabase.schema('private').from('responses').select():
--        - getResponsesByTeam  → supabase.rpc('responses_for_code', { p_code })
--        - getResponsesByOrganization → per code responses_for_code(),
--          of responses_for_codes(text[]) hieronder.
--        (Admin-overzicht in Admin.jsx blijft de admin-policy gebruiken.)
--      Verifieer de teamdashboards + admin met echte data.
--   3. PAS DAARNA SECTIE 3 draaien: revoke direct SELECT voor anon.
--      Vanaf dat moment kan anon niets meer los lezen zonder geldige code.
--
-- Idempotent: create or replace function / drop policy if exists.
-- ============================================================


-- ============================================================
-- SECTIE 1 — Leesfuncties (validatie + scoped teruggave)
-- ============================================================

-- Eén team via één access code.
-- Matcht op invite_code = p_code EN op legacy-rijen zonder code die
-- via team+organization bij deze code horen (zelfde dual-match als de
-- huidige getResponsesByTeam), maar nu server-side afgeschermd.
create or replace function public.responses_for_code(p_code text)
returns setof private.responses
language sql
stable
security definer
set search_path = private, public
as $$
  with tac as (
    select organization, team
    from public.team_access_codes
    where code = p_code and active = true
    limit 1
  )
  select r.*
  from private.responses r, tac
  where r.invite_code = p_code
     or (r.invite_code is null
         and r.team = tac.team
         and r.organization = tac.organization)
  order by r.created_at asc;
$$;

-- Meerdere codes tegelijk (voor organisatie-aggregatie). Elke code
-- wordt afzonderlijk gevalideerd tegen active = true.
create or replace function public.responses_for_codes(p_codes text[])
returns setof private.responses
language sql
stable
security definer
set search_path = private, public
as $$
  select distinct r.*
  from private.responses r
  join public.team_access_codes t
    on t.code = r.invite_code
  where t.active = true
    and r.invite_code = any (p_codes)
  order by r.created_at asc;
$$;


-- ============================================================
-- SECTIE 2 — Execute-rechten
-- ============================================================
-- anon mag de functies aanroepen (validatie zit erin). De functie
-- draait met de rechten van de eigenaar (security definer), dus de
-- onderliggende tabel hoeft anon straks niet meer te kunnen lezen.

grant execute on function public.responses_for_code(text)  to anon, authenticated;
grant execute on function public.responses_for_codes(text[]) to anon, authenticated;


-- ============================================================
-- SECTIE 3 — De schakelaar: direct leesrecht intrekken
-- ============================================================
-- PAS draaien NA stap 2 (client gebruikt de RPC) en na verificatie.
-- Hierna kan anon geen responses meer los opvragen; alleen via een
-- geldige, actieve code door de functie heen. Admin behoudt toegang
-- via de admin-policy (JWT-email) — controleer dat die policy bestaat
-- (zie 005 sectie 0c) vóór je dit draait, anders verliest ook admin
-- het overzicht.

-- revoke select on private.responses from anon;

-- -- Zorg dat de bijbehorende anon-SELECT-policy uit staat als je die
-- -- in 005 had aangezet (anders blijft select mogelijk):
-- drop policy if exists "responses_anon_select" on private.responses;


-- ============================================================
-- SANITY
-- ============================================================
-- select count(*) from public.responses_for_code('NIJ-BES-26-A8K2');
-- -- moet 0 rijen geven voor een niet-bestaande/ingetrokken code:
-- select count(*) from public.responses_for_code('BESTAAT-NIET');
