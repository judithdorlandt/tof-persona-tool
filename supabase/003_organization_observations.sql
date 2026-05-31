-- ============================================================
-- 003_organization_observations.sql
-- ============================================================
-- Doel: per organisatie kunnen TOF-admins handmatig observaties
-- toevoegen (bv. "akoestiek", "no-shows", "wat werkt goed"),
-- naast de data-driven insights vanuit de persona-responses.
--
-- Categorieën (uitbreidbaar):
--   leegloper   — Waar de organisatie op leegloopt
--   werkt_goed  — Wat werkt goed in de organisatie
--
-- Veilig om opnieuw te draaien: IF NOT EXISTS / DROP POLICY IF
-- EXISTS overal.
-- ============================================================

create table if not exists public.organization_observations (
  id           uuid primary key default gen_random_uuid(),
  organization text not null,
  category     text not null check (category in ('leegloper', 'werkt_goed')),
  content      text not null,
  sort_order   integer not null default 0,
  created_at   timestamptz not null default now(),
  created_by   text
);

create index if not exists organization_observations_org_idx
  on public.organization_observations (organization);

create index if not exists organization_observations_cat_idx
  on public.organization_observations (organization, category);

alter table public.organization_observations enable row level security;

-- Beleid: admin mag alles (consistent met team_managers).
drop policy if exists "obs_admin_full_access" on public.organization_observations;
create policy "obs_admin_full_access"
  on public.organization_observations for all
  using      (lower(auth.jwt() ->> 'email') = 'judith@tof.services')
  with check (lower(auth.jwt() ->> 'email') = 'judith@tof.services');

-- Sanity:
-- select category, count(*) from organization_observations group by category;
