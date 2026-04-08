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
      name: profile.name || null,
      organization: profile.org || null,
      department: profile.dept || null,
      team: profile.team || null,

      // 👇 NIEUW TOEGEVOEGD
      role: profile.role || null,
      team_size: profile.team_size || null,

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
    console.error('❌ Response error:', err.message);
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