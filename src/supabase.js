import { createClient } from '@supabase/supabase-js';

// =========================
// INIT
// =========================

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Supabase env vars ontbreken');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// =========================
// RESPONSES (quiz resultaten)
// =========================

export async function saveResponse(profile) {
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

    console.log('🔥 Saving response full:', JSON.stringify(payload, null, 2));

    const { data, error } = await supabase
      .from('responses')
      .insert([payload])
      .select();

    if (error) throw error;

    console.log('✅ Response opgeslagen:', data);
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
  try {
    const payload = {
      primary_persona_name: feedback.primary_persona_name || null,
      fit: feedback.fit || null,
      reason: feedback.reason || null,
      team_use: feedback.team_use || null,
      email: feedback.email || null,
      submitted_at: new Date().toISOString(),
    };

    console.log('🔥 Saving feedback:', payload);

    const { data, error } = await supabase
      .from('feedback') // ✅ lowercase (goed!)
      .insert([payload])
      .select();

    if (error) throw error;

    console.log('✅ Feedback opgeslagen:', data);
    return data;
  } catch (err) {
    console.error('❌ Feedback error:', err.message);
    return null;
  }
}

// =========================
// OPHALEN
// =========================

export async function getAllFeedback() {
  try {
    const { data, error } = await supabase
      .from('feedback')
      .select('*')
      .order('submitted_at', { ascending: false });

    if (error) throw error;

    return data || [];
  } catch (err) {
    console.error('❌ Fetch feedback error:', err.message);
    return [];
  }
}
// =========================
// TEAMS / TEAMSELECTOR
// =========================

export async function getTeamsOverview() {
  try {
    const { data, error } = await supabase
      .from('responses')
      .select(
        'organization, team, primary_archetype, secondary_archetype, tertiary_archetype, created_at'
      )
      .not('team', 'is', null)
      .order('organization', { ascending: true })
      .order('team', { ascending: true });

    if (error) {
      throw error;
    }

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
  try {
    const cleanTeam = String(team || '').trim();
    const cleanOrganization = String(organization || '').trim();

    if (!cleanTeam) {
      console.error('❌ Fetch team responses error: team ontbreekt');
      return [];
    }

    let query = supabase
      .from('responses')
      .select(
        'id, name, organization, department, team, role, team_size, primary_archetype, secondary_archetype, tertiary_archetype, full_scores, created_at'
      )
      .eq('team', cleanTeam)
      .order('created_at', { ascending: true });

    if (cleanOrganization) {
      query = query.eq('organization', cleanOrganization);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    return (data || []).map((row) => ({
      ...row,
      name: row?.name || null,
      organization: row?.organization || null,
      department: row?.department || null,
      team: row?.team || null,
      role: row?.role || null,
      team_size: row?.team_size || null,
      primary_archetype: row?.primary_archetype || null,
      secondary_archetype: row?.secondary_archetype || null,
      tertiary_archetype: row?.tertiary_archetype || null,
      full_scores: row?.full_scores || null,
      created_at: row?.created_at || null,
    }));
  } catch (err) {
    console.error('❌ Fetch team responses error:', err?.message || err);
    return [];
  }
}
export async function getResponsesByInviteCode(inviteCode) {
  try {
    const cleanInviteCode = String(inviteCode || '').trim();

    if (!cleanInviteCode) {
      console.error('❌ Fetch invite code responses error: invite_code ontbreekt');
      return [];
    }

    const { data, error } = await supabase
      .from('responses')
      .select(
        'id, name, organization, department, team, invite_code, role, team_size, primary_archetype, secondary_archetype, tertiary_archetype, full_scores, created_at'
      )
      .eq('invite_code', cleanInviteCode)
      .order('created_at', { ascending: true });

    if (error) {
      throw error;
    }

    return data || [];
  } catch (err) {
    console.error('❌ Fetch invite code responses error:', err?.message || err);
    return [];
  }
}