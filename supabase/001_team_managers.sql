-- ============================================================
-- 001_team_managers.sql
-- ============================================================
-- Doel: managers koppelen aan team-codes via email, zodat ze
-- na een magic-link login automatisch hun team(s) zien.
--
-- Loopt in 3 stappen:
--   STAP A — zorg dat de 15 Nijkerk-codes bestaan in
--            team_access_codes (idempotent insert).
--   STAP B — maak de team_managers tabel + RLS.
--   STAP C — seed de 15 manager-koppelingen.
--
-- Veilig om opnieuw te draaien: alles gebruikt ON CONFLICT
-- DO NOTHING / IF NOT EXISTS.
-- ============================================================


-- ─── STAP A ─ Zorg dat de Nijkerk codes bestaan ───────────────
-- (Alleen Insight-niveau; pas 'level' aan in de admin UI als
-- een team naar Dynamics upgrade.)

insert into public.team_access_codes (code, level, organization, team, active) values
  ('NJK-BCP',   'insight', 'Gemeente Nijkerk', 'Bestuurszaken, Communicatie en Participatie', true),
  ('NJK-FC',    'insight', 'Gemeente Nijkerk', 'Financiën en Control',                         true),
  ('NJK-HRO',   'insight', 'Gemeente Nijkerk', 'Human Resources en Organisatieontwikkeling',   true),
  ('NJK-IT',    'insight', 'Gemeente Nijkerk', 'Informatie en Technologie',                    true),
  ('NJK-PZ',    'insight', 'Gemeente Nijkerk', 'Publiekszaken',                                true),
  ('NJK-VJI',   'insight', 'Gemeente Nijkerk', 'Veiligheid, Juridische Zaken en Inkoop',       true),
  ('NJK-GRI',   'insight', 'Gemeente Nijkerk', 'Griffie',                                      true),
  ('NJK-OB',    'insight', 'Gemeente Nijkerk', 'Operationeel beheer',                          true),
  ('NJK-PVVS',  'insight', 'Gemeente Nijkerk', 'Planvorming en Vakspecialisten',               true),
  ('NJK-PPB',   'insight', 'Gemeente Nijkerk', 'Proces- en projectbegeleiding',                true),
  ('NJK-VLBVZ', 'insight', 'Gemeente Nijkerk', 'Vluchtelingen / bedrijfsvoering / Zorg',       true),
  ('NJK-ASDP',  'insight', 'Gemeente Nijkerk', 'Administratie Sociaal Domein, Participatie',   true),
  ('NJK-BEL',   'insight', 'Gemeente Nijkerk', 'Beleid',                                       true),
  ('NJK-JGD',   'insight', 'Gemeente Nijkerk', 'Jeugd',                                        true),
  ('NJK-WMO',   'insight', 'Gemeente Nijkerk', 'WMO',                                          true)
on conflict (code) do nothing;


-- ─── STAP B ─ Tabel team_managers + RLS ──────────────────────

create table if not exists public.team_managers (
  id          uuid primary key default gen_random_uuid(),
  email       text not null,
  team_code   text not null references public.team_access_codes(code) on delete cascade,
  role        text not null default 'manager',   -- 'manager' | 'observer'
  created_at  timestamptz not null default now(),
  unique (email, team_code)
);

create index if not exists team_managers_email_idx
  on public.team_managers (lower(email));

create index if not exists team_managers_team_code_idx
  on public.team_managers (team_code);

-- Normaliseer email naar lowercase voor consistente matching.
create or replace function public.team_managers_normalize_email()
returns trigger language plpgsql as $$
begin
  new.email := lower(trim(new.email));
  return new;
end;
$$;

drop trigger if exists trg_team_managers_normalize_email on public.team_managers;
create trigger trg_team_managers_normalize_email
  before insert or update on public.team_managers
  for each row execute function public.team_managers_normalize_email();

alter table public.team_managers enable row level security;

-- Beleid 1: ingelogde manager mag alleen rijen lezen die bij
-- zijn eigen email horen.
drop policy if exists "managers_read_own" on public.team_managers;
create policy "managers_read_own"
  on public.team_managers for select
  using (email = lower(auth.jwt() ->> 'email'));

-- Beleid 2: admin (judith@tof.services) mag alles.
-- LET OP: pas dit aan zodra je admin-rechten via een aparte
-- tabel of custom claim hebt; nu hardcoded voor consistentie
-- met isAdminEmail() in src/supabase.js.
drop policy if exists "admins_full_access" on public.team_managers;
create policy "admins_full_access"
  on public.team_managers for all
  using  (lower(auth.jwt() ->> 'email') = 'judith@tof.services')
  with check (lower(auth.jwt() ->> 'email') = 'judith@tof.services');


-- ─── STAP C ─ Seed: 15 Nijkerk managers ──────────────────────

insert into public.team_managers (email, team_code) values
  ('a.kempeneers@nijkerk.eu',  'NJK-BCP'),
  ('e.vandepol@nijkerk.eu',    'NJK-FC'),
  ('m.khan@nijkerk.eu',        'NJK-HRO'),
  ('jw.vandaalen@nijkerk.eu',  'NJK-IT'),
  ('d.boersma@nijkerk.eu',     'NJK-PZ'),
  ('r.brink@nijkerk.eu',       'NJK-VJI'),
  ('a.verhoef@nijkerk.eu',     'NJK-GRI'),
  ('a.anninga@nijkerk.eu',     'NJK-OB'),
  ('m.brinkbaumer@nijkerk.eu', 'NJK-PVVS'),
  ('g.duine@nijkerk.eu',       'NJK-PPB'),
  ('c.naber@nijkerk.eu',       'NJK-VLBVZ'),
  ('w.vossestein@nijkerk.eu',  'NJK-ASDP'),
  ('m.blesing@nijkerk.eu',     'NJK-BEL'),
  ('m.boer@nijkerk.eu',        'NJK-JGD'),
  ('j.blok@nijkerk.eu',        'NJK-WMO')
on conflict (email, team_code) do nothing;


-- ─── Sanity-check queries (handmatig na het draaien) ─────────

-- select code, organization, team, active
--   from public.team_access_codes
--   where code like 'NJK-%'
--   order by code;
--
-- select tm.email, tm.team_code, tac.team
--   from public.team_managers tm
--   join public.team_access_codes tac on tac.code = tm.team_code
--   order by tm.team_code;
