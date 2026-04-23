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

// Helper: responses staat in schema 'private', rest in 'public'
function responsesTable() {
  return supabase.schema('private').from('responses');
}

// =========================
// AUTH
// =========================

export async function signInWithEmail(email, password) {
  if (!ensureSupabase()) return { user: null, session: null, error: 'no_client' };

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: String(email || '').trim(),
      password: String(password || ''),
    });

    if (error) throw error;

    return {
      user: data?.user || null,
      session: data?.session || null,
      error: null,
    };
  } catch (err) {
    console.error('❌ Sign in error:', err?.message || err);
    return {
      user: null,
      session: null,
      error: err?.message || 'sign_in_failed',
    };
  }
}

export async function signOut() {
  if (!ensureSupabase()) return { error: 'no_client' };

  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { error: null };
  } catch (err) {
    console.error('❌ Sign out error:', err?.message || err);
    return { error: err?.message || 'sign_out_failed' };
  }
}

export async function getCurrentUser() {
  if (!ensureSupabase()) return null;

  try {
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;
    return data?.user || null;
  } catch (err) {
    console.error('❌ Get user error:', err?.message || err);
    return null;
  }
}

export async function getCurrentSession() {
  if (!ensureSupabase()) return null;

  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data?.session || null;
  } catch (err) {
    console.error('❌ Get session error:', err?.message || err);
    return null;
  }
}

export function onAuthChange(callback) {
  if (!ensureSupabase()) return () => { };

  const { data } = supabase.auth.onAuthStateChange((event, session) => {
    callback(event, session);
  });

  return () => {
    data?.subscription?.unsubscribe?.();
  };
}

// =========================
// MEMBERSHIP
// =========================

export async function getUserMemberships(userId = null) {
  if (!ensureSupabase()) return [];

  try {
    let resolvedUserId = userId;

    if (!resolvedUserId) {
      const user = await getCurrentUser();
      resolvedUserId = user?.id || null;
    }

    if (!resolvedUserId) return [];

    const { data, error } = await supabase
      .from('membership')
      .select('*')
      .eq('user_id', resolvedUserId)
      .order('organization', { ascending: true })
      .order('team', { ascending: true });

    if (error) throw error;

    return (data || []).map((row) => ({
      ...row,
      organization: String(row?.organization || '').trim(),
      team: String(row?.team || '').trim(),
      role: row?.role ? String(row.role).trim().toLowerCase() : null,
    }));
  } catch (err) {
    console.error('❌ Fetch memberships error:', err?.message || err);
    return [];
  }
}

export async function isUserAdmin(userId = null) {
  const memberships = await getUserMemberships(userId);
  return memberships.some((m) => m.role === 'admin');
}

export async function getUserAccessibleTeams(userId = null) {
  const memberships = await getUserMemberships(userId);

  return memberships.map((m) => ({
    organization: m.organization,
    team: m.team,
    role: m.role,
  }));
}

// =========================
// RESPONSES (private schema)
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

    const { data, error } = await responsesTable().insert([payload]).select();

    if (error) throw error;

    return data;
  } catch (err) {
    console.error('❌ Response error:', err?.message || err);
    return null;
  }
}

// =========================
// FEEDBACK (public schema)
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
// TEAMS (responses staat in private schema)
// =========================

export async function getTeamsOverview() {
  if (!ensureSupabase()) return [];

  try {
    const { data, error } = await responsesTable()
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

    let query = responsesTable()
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

    return data || null;
  } catch (err) {
    console.error('❌ Validate access code error:', err?.message || err);
    return null;
  }
}