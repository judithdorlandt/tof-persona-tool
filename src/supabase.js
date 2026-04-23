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
      .from('responses')
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
      .from('responses')
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
      .from('responses')
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