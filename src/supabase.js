import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// =========================
// RESPONSES (quiz resultaten)
// =========================

export async function saveResponse(profile) {
  const payload = {
    name: profile.name || null,
    organization: profile.org || null,
    department: profile.dept || null,
    team: profile.team || null,
    primary_archetype: profile.primary || null,
    secondary_archetype: profile.secondary || null,
    tertiary_archetype: profile.tertiary || null,
    full_scores: profile.scores || null,
  };

  console.log('🔥 Saving response:', payload);

  const { data, error } = await supabase
    .from('responses')
    .insert([payload])
    .select();

  if (error) {
    console.error('❌ Response error:', error);
    throw error;
  }

  console.log('✅ Response opgeslagen:', data);
  return data;
}

// =========================
// FEEDBACK (belangrijk nu)
// =========================

export async function saveFeedback(feedback) {
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
    .from('Feedback') // ⚠️ BELANGRIJK (hoofdletter!)
    .insert([payload])
    .select();

  if (error) {
    console.error('❌ Feedback error:', error);
    throw error;
  }

  console.log('✅ Feedback opgeslagen:', data);
  return data;
}

// =========================
// OPHALEN
// =========================

export async function getAllFeedback() {
  const { data, error } = await supabase
    .from('Feedback')
    .select('*')
    .order('submitted_at', { ascending: false });

  if (error) {
    console.error('❌ Fetch feedback error:', error);
    return [];
  }

  return data || [];
}