import { createClient } from '@supabase/supabase-js';

// =========================
// INIT
// =========================

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

console.log('SUPABASE URL:', supabaseUrl);
console.log('SUPABASE KEY:', supabaseAnonKey ? '✅ loaded' : '❌ missing');

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Supabase env vars ontbreken');
}

export const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

function ensureSupabase() {
  if (!supabase) {
    console.error('❌ Supabase client niet geïnitialiseerd');
    return false;
  }
  return true;
}

// =========================
// AUTH — magic-link (passwordless)
// =========================

/**
 * Stuurt een magic-link mail naar het opgegeven e-mailadres.
 * De gebruiker klikt de link en komt terug op /auth/callback waar
 * de Supabase SDK automatisch de session aanmaakt.
 */
export async function sendMagicLink(email) {
  if (!ensureSupabase()) {
    return { error: { message: 'Supabase niet beschikbaar' } };
  }

  try {
    const cleanEmail = String(email || '').trim().toLowerCase();
    if (!cleanEmail) {
      return { error: { message: 'Vul een geldig e-mailadres in.' } };
    }

    const { error } = await supabase.auth.signInWithOtp({
      email: cleanEmail,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      console.error('❌ Magic-link error:', error.message);
      return { error };
    }

    return { error: null };
  } catch (err) {
    console.error('❌ Magic-link error:', err?.message || err);
    return { error: { message: err?.message || 'Onbekende fout' } };
  }
}

/** Haalt de huidige sessie op (null als niet ingelogd). */
export async function getCurrentSession() {
  if (!ensureSupabase()) return null;
  try {
    const { data } = await supabase.auth.getSession();
    return data?.session || null;
  } catch (err) {
    console.error('❌ getSession error:', err?.message || err);
    return null;
  }
}

/** Haalt de huidige user op (auth.users record), null als niet ingelogd. */
export async function getCurrentUser() {
  if (!ensureSupabase()) return null;
  try {
    const { data } = await supabase.auth.getUser();
    return data?.user || null;
  } catch (err) {
    console.error('❌ getUser error:', err?.message || err);
    return null;
  }
}

/** Logt huidige gebruiker uit en wist de sessie. */
export async function signOut() {
  if (!ensureSupabase()) return { error: null };
  try {
    const { error } = await supabase.auth.signOut();
    if (error) console.error('❌ signOut error:', error.message);
    return { error };
  } catch (err) {
    console.error('❌ signOut error:', err?.message || err);
    return { error: { message: err?.message || 'Onbekende fout' } };
  }
}

// =========================
// RESPONSES
// =========================

export async function saveResponse(profile) {
  if (!ensureSupabase()) return null;

  try {
    const payload = {
      name: String(profile.name || '').trim() || null,
      organization: String(profile.org || '').trim() || null,
      department: String(profile.dept || '').trim() || null,
      team: String(profile.team || '').trim() || null,
      invite_code: String(profile.invite_code || '').trim() || null,

      role: String(profile.role || '').trim() || null,
      team_size: String(profile.team_size || '').trim() || null,

      primary_archetype: profile.primary || null,
      secondary_archetype: profile.secondary || null,
      tertiary_archetype: profile.tertiary || null,
      full_scores: profile.scores || null,

      created_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .schema('private').from('responses')
      .insert([payload])
      .select();

    if (error) throw error;

    return data;
  } catch (err) {
    console.error('❌ Response error:', err?.message || err);
    return null;
  }
}

// =========================
// FEEDBACK
// =========================

export async function saveFeedback(feedback) {
  if (!ensureSupabase()) return null;

  try {
    const payload = {
      primary_persona_name: feedback.primary_persona_name || null,
      fit: feedback.fit || null,
      reason: feedback.reason || null,
      team_use: feedback.team_use || null,
      email: feedback.email || null,
      submitted_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('feedback')
      .insert([payload])
      .select();

    if (error) throw error;

    return data;
  } catch (err) {
    console.error('❌ Feedback error:', err?.message || err);
    return null;
  }
}

// =========================

// OPHALEN

// =========================

export async function getAllFeedback() {

  if (!ensureSupabase()) return [];

  try {

    const { data, error } = await supabase

      .from('feedback')

      .select('*')

      .order('submitted_at', { ascending: false });

    if (error) throw error;

    return data || [];

  } catch (err) {

    console.error('❌ Fetch feedback error:', err?.message || err);

    return [];

  }

}

// =========================

// TEAMS

// =========================

export async function getTeamsOverview() {

  if (!ensureSupabase()) return [];

  try {

    const { data, error } = await supabase

      .schema('private').from('responses')

      .select('organization, team, primary_archetype, created_at')

      .not('team', 'is', null)

      .order('organization', { ascending: true })

      .order('team', { ascending: true });

    if (error) throw error;

    const cleanedRows = (data || []).filter((row) => {

      const teamName = String(row?.team || '').trim();

      return teamName !== '';

    });

    return cleanedRows.map((row) => ({

      ...row,

      organization: String(row?.organization || '').trim() || null,

      team: String(row?.team || '').trim(),

    }));

  } catch (err) {

    console.error('❌ Fetch teams error:', err?.message || err);

    return [];

  }

}

export async function getResponsesByTeam(team, organization = null) {

  if (!ensureSupabase()) return [];

  try {

    const cleanTeam = String(team || '').trim();

    const cleanOrganization = String(organization || '').trim();

    if (!cleanTeam) {

      console.error('❌ Fetch team responses error: team ontbreekt');

      return [];

    }

    let query = supabase

      .schema('private').from('responses')

      .select('*')

      .eq('team', cleanTeam)

      .order('created_at', { ascending: true });

    if (cleanOrganization) {

      query = query.eq('organization', cleanOrganization);

    }

    const { data, error } = await query;

    if (error) throw error;

    return data || [];

  } catch (err) {

    console.error('❌ Fetch team responses error:', err?.message || err);

    return [];

  }

}

// =========================

// ACCESS CODE CHECK

// =========================

export async function validateTeamAccessCode(accessCode) {

  if (!ensureSupabase()) return null;

  try {

    const cleanCode = String(accessCode || '').trim();

    if (!cleanCode) {

      return null;

    }

    const { data, error } = await supabase

      .from('team_access_codes')

      .select('*')

      .eq('code', cleanCode)

      .eq('active', true)

      .maybeSingle();

    if (error) throw error;

    if (!data) return null;

    // Normaliseer het niveau — codes zonder expliciet level krijgen 'insight' als default.
    // 'strategic' = Module 3 (omvat M1+M2+M3).
    // 'dynamics' = Module 2 (omvat óók Insight, maar NIET strategic).
    // 'insight' = alleen Module 1.
    const rawLevel = String(data.level || '').trim().toLowerCase();
    const level =
      rawLevel === 'strategic' ? 'strategic'
        : rawLevel === 'dynamics' ? 'dynamics'
          : 'insight';

    return {
      ...data,
      level,
    };

  } catch (err) {

    console.error('❌ Validate access code error:', err?.message || err);

    return null;

  }

}

// =========================
// MEMBERSHIPS — auth-aware team access
// =========================

/**
 * Haalt alle teams op waar de huidige ingelogde gebruiker member van is.
 * Returned: [{ team, organization, role, created_at, code, level }]
 * Het 'code' en 'level' veld worden bijgevoegd door te joinen met team_access_codes.
 *
 * Returnt lege array als niet ingelogd.
 */
export async function getMyMemberships() {
  if (!ensureSupabase()) return [];

  try {
    const user = await getCurrentUser();
    if (!user) return [];

    const { data: memberships, error } = await supabase
      .from('membership')
      .select('id, team, organization, role, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true });

    if (error) throw error;
    if (!memberships || memberships.length === 0) return [];

    // Verrijk elk membership met de access-code metadata (level)
    // door op (organization, team) te matchen — best-effort, niet kritiek.
    const enriched = await Promise.all(
      memberships.map(async (m) => {
        try {
          let query = supabase
            .from('team_access_codes')
            .select('code, level, team, organization, active')
            .eq('active', true)
            .eq('team', m.team);
          if (m.organization) {
            query = query.eq('organization', m.organization);
          }
          const { data: codeRow } = await query.maybeSingle();
          return {
            ...m,
            code: codeRow?.code || null,
            level: codeRow?.level || 'insight',
          };
        } catch (_e) {
          return { ...m, code: null, level: 'insight' };
        }
      })
    );

    return enriched;
  } catch (err) {
    console.error('❌ getMyMemberships error:', err?.message || err);
    return [];
  }
}

/**
 * Sluit huidige ingelogde gebruiker aan bij een team via een toegangscode.
 * - Valideert de code (moet active=true zijn in team_access_codes)
 * - Maakt een membership-rij aan (idempotent: bij conflict 'unique(user_id, team)' doet niets)
 *
 * Returnt: { membership, accessCode, error }
 *   - membership: het aangemaakte (of bestaande) record
 *   - accessCode: de validated code-rij (met level)
 *   - error: bij mislukt — { message }
 *
 * Gebruikt door /team flow: eerste keer code invoeren registreert lidmaatschap;
 * volgende bezoeken hoeven geen code meer.
 */
export async function joinTeamByCode(code) {
  if (!ensureSupabase()) {
    return { membership: null, accessCode: null, error: { message: 'Supabase niet beschikbaar' } };
  }

  try {
    const user = await getCurrentUser();
    if (!user) {
      return { membership: null, accessCode: null, error: { message: 'Niet ingelogd' } };
    }

    // Validate code
    const accessCode = await validateTeamAccessCode(code);
    if (!accessCode) {
      return { membership: null, accessCode: null, error: { message: 'Code niet geldig of inactief' } };
    }

    // team_access_codes heeft organization + team als aparte kolommen.
    const team = String(accessCode.team || '').trim() || `Team ${accessCode.code}`;
    const organization = accessCode.organization || null;

    // Insert membership — bij conflict (user al member) doet niets
    const { data, error } = await supabase
      .from('membership')
      .upsert(
        {
          user_id: user.id,
          team,
          organization,
          role: 'member',
        },
        { onConflict: 'user_id,team', ignoreDuplicates: true }
      )
      .select()
      .maybeSingle();

    if (error) {
      console.error('❌ joinTeamByCode insert error:', error.message);
      return { membership: null, accessCode, error };
    }

    return { membership: data, accessCode, error: null };
  } catch (err) {
    console.error('❌ joinTeamByCode error:', err?.message || err);
    return { membership: null, accessCode: null, error: { message: err?.message || 'Onbekende fout' } };
  }
}

// =========================
// ADMIN GATING (TOF interne tooling — /admin route)
// =========================
// Voor de admin-dashboardroute. Voorlopig hardcoded e-maillijst.
// Later te verplaatsen naar een 'profiles'-tabel met is_admin kolom,
// of een Supabase custom claim. Voor MVP voldoende.

const ADMIN_EMAILS = [
  'judith@tof.services',
];

/** Sync check: gegeven een e-mailadres, is dit een admin? */
export function isAdminEmail(email) {
  if (!email) return false;
  return ADMIN_EMAILS.includes(String(email).toLowerCase());
}

/** True als de huidige ingelogde gebruiker admin-rechten heeft. */
export async function isCurrentUserAdmin() {
  try {
    const user = await getCurrentUser();
    if (!user || !user.email) return false;
    return ADMIN_EMAILS.includes(user.email.toLowerCase());
  } catch (_e) {
    return false;
  }
}

/**
 * Haalt ALLE team_access_codes op, met aantal responses per code.
 * Alleen voor admin-gebruik. Sorteert nieuwste eerst.
 *
 * Returnt: [{ code, level, description, active, created_at, response_count }]
 */
export async function getAllTeamAccessCodes() {
  if (!ensureSupabase()) return [];
  try {
    const isAdmin = await isCurrentUserAdmin();
    if (!isAdmin) return [];

    const { data: codes, error } = await supabase
      .from('team_access_codes')
      .select('code, level, team, organization, active, created_at')
      .order('created_at', { ascending: false });

    if (error) throw error;
    if (!codes || codes.length === 0) return [];

    // Verrijk met response-tellingen vanuit private.responses.
    const enriched = await Promise.all(
      codes.map(async (c) => {
        let response_count = 0;
        if (c.team) {
          try {
            let query = supabase
              .schema('private')
              .from('responses')
              .select('id', { count: 'exact', head: true })
              .eq('team', c.team);
            if (c.organization) query = query.eq('organization', c.organization);
            const { count } = await query;
            response_count = count || 0;
          } catch (_e) {
            response_count = 0;
          }
        }
        return { ...c, response_count };
      })
    );

    return enriched;
  } catch (err) {
    console.error('❌ getAllTeamAccessCodes error:', err?.message || err);
    return [];
  }
}

/**
 * Genereert een schone, leesbare team-code op basis van org + team.
 * Voorbeeld: ("Gemeente Nijkerk", "Bestuurszaken") → "NIJ-BES-26-A8K2"
 *
 * - 3 letters per stuk (eerste 3 niet-spatie letters, uppercase)
 * - 2-cijfers jaartal
 * - 4-tekens random alphanumeric voor uniciteit
 */
function generateTeamCode(organization, team) {
  const clean = (s) => String(s || '').replace(/[^a-zA-Z]/g, '').toUpperCase().slice(0, 3) || 'XXX';
  const orgPart = clean(organization);
  const teamPart = clean(team);
  const year = String(new Date().getFullYear()).slice(-2);
  const rand = Math.random().toString(36).replace(/[^a-z0-9]/gi, '').toUpperCase().slice(0, 4) || 'XXXX';
  return `${orgPart}-${teamPart}-${year}-${rand}`;
}

/**
 * Maakt een nieuwe team_access_code aan voor een klant.
 * - level: 'insight' of 'dynamics'
 * - organization + team worden als aparte kolommen opgeslagen
 *
 * Returnt: { code, accessCode, error }
 */
export async function createTeamAccessCode({ organization, team, level = 'insight' }) {
  if (!ensureSupabase()) {
    return { code: null, accessCode: null, error: { message: 'Supabase niet beschikbaar' } };
  }
  try {
    const isAdmin = await isCurrentUserAdmin();
    if (!isAdmin) {
      return { code: null, accessCode: null, error: { message: 'Geen admin-rechten' } };
    }
    if (!organization || !team) {
      return { code: null, accessCode: null, error: { message: 'Organisatie en team zijn verplicht' } };
    }

    const code = generateTeamCode(organization, team);

    const { data, error } = await supabase
      .from('team_access_codes')
      .insert({ code, level, organization, team, active: true })
      .select()
      .maybeSingle();

    if (error) {
      console.error('❌ createTeamAccessCode error:', error.message);
      return { code: null, accessCode: null, error };
    }

    return { code, accessCode: data, error: null };
  } catch (err) {
    console.error('❌ createTeamAccessCode error:', err?.message || err);
    return { code: null, accessCode: null, error: { message: err?.message || 'Onbekende fout' } };
  }
}

// =========================
// ADMIN CODE CHECK
// =========================
// Beheerders-toegang: één code geeft toegang tot alle teams.
// Opgeslagen in aparte tabel 'admin_codes' zodat frontend de code niet bevat.
// Iemand die naar de app-code kijkt ziet alleen de query — de code zelf
// moet bij jou (of in jouw Supabase) bekend zijn.

export async function validateAdminCode(adminCode) {
  if (!ensureSupabase()) return null;

  try {
    const cleanCode = String(adminCode || '').trim();
    if (!cleanCode) return null;

    const { data, error } = await supabase
      .from('admin_codes')
      .select('*')
      .eq('code', cleanCode)
      .eq('active', true)
      .maybeSingle();

    if (error) throw error;
    return data || null;
  } catch (err) {
    console.error('❌ Validate admin code error:', err?.message || err);
    return null;
  }
}