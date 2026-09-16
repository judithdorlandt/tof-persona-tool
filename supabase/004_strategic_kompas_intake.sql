-- ============================================================
-- 004_strategic_kompas_intake.sql
-- ============================================================
-- Doel: kwalitatieve input voor Module 3 (Strategisch Kompas)
-- bewaren. De intake- en 3-maanden-review-formulieren leveren open
-- antwoorden die Judith leest en in het ontwerpgesprek tot weging en
-- keuzes maakt. GEEN automatische uitslag of trend-scores.
--
-- We bewaren de ruwe payload (exact de intake-/review-shape uit
-- src/utils/strategicKompas.js) gekoppeld aan de teamcode, zodat het
-- later samengevoegd kan worden met de geplande `strategic_kompas`-tabel.
--
-- Kolom `kind` onderscheidt 'intake' (start) van 'review' (na 3 mnd).
--
-- Veilig om opnieuw te draaien: IF NOT EXISTS / DROP POLICY IF EXISTS.
-- ============================================================

create table if not exists public.strategic_kompas_intake (
  id           uuid primary key default gen_random_uuid(),
  teamcode     text not null,
  kind         text not null default 'intake' check (kind in ('intake', 'review')),
  payload      jsonb not null,
  submitted_at timestamptz not null default now()
);

create index if not exists strategic_kompas_intake_teamcode_idx
  on public.strategic_kompas_intake (teamcode);

create index if not exists strategic_kompas_intake_kind_idx
  on public.strategic_kompas_intake (teamcode, kind);

alter table public.strategic_kompas_intake enable row level security;

-- Beleid:
--  - Iedereen (ook niet-ingelogde invuller) mag een inzending insert-en.
--    De formulieren zijn niet auth-gated; een team vult ze via de link in.
--    Er is geen select-recht voor anon, dus inzendingen zijn niet leesbaar
--    van buitenaf.
drop policy if exists "kompas_public_insert" on public.strategic_kompas_intake;
create policy "kompas_public_insert"
  on public.strategic_kompas_intake for insert
  with check (true);

--  - Alleen admin (Judith) mag alle inzendingen lezen/beheren.
drop policy if exists "kompas_admin_full_access" on public.strategic_kompas_intake;
create policy "kompas_admin_full_access"
  on public.strategic_kompas_intake for all
  using      (lower(auth.jwt() ->> 'email') = 'judith@tof.services')
  with check (lower(auth.jwt() ->> 'email') = 'judith@tof.services');

-- Sanity:
-- select kind, teamcode, submitted_at from strategic_kompas_intake order by submitted_at desc;
