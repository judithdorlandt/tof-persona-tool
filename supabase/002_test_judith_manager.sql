-- ============================================================
-- 002_test_judith_manager.sql
-- ============================================================
-- Doel: lokale test van de manager-flow met judith@tof.services
-- als manager van Demo Team 3 + Demo Team 4.
--
-- Voorwaarde: 001_team_managers.sql moet eerst gedraaid zijn.
--
-- Wat dit doet:
--   A — zorgt dat DEMO-3 en DEMO-4 codes bestaan in
--       team_access_codes (level=insight, idempotent)
--   B — koppelt judith@tof.services als manager aan beide
--
-- Veilig herhaalbaar.
-- ============================================================


-- ─── STAP A ─ Demo-team codes ─────────────────────────────────

insert into public.team_access_codes (code, level, organization, team, active) values
  ('DEMO-3', 'insight', 'The Office Factory', 'Demo Team 3', true),
  ('DEMO-4', 'insight', 'The Office Factory', 'Demo Team 4', true)
on conflict (code) do nothing;


-- ─── STAP B ─ Judith als manager van beide ────────────────────

insert into public.team_managers (email, team_code) values
  ('judith@tof.services', 'DEMO-3'),
  ('judith@tof.services', 'DEMO-4')
on conflict (email, team_code) do nothing;


-- ─── Sanity-check ────────────────────────────────────────────

-- select tm.email, tm.team_code, tac.team
--   from public.team_managers tm
--   join public.team_access_codes tac on tac.code = tm.team_code
--  where tm.email = 'judith@tof.services'
--   order by tm.team_code;
--
-- Verwacht: 2 rijen — DEMO-3 (Demo Team 3) en DEMO-4 (Demo Team 4)
