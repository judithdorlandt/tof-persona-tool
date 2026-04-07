import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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

  console.log('🔥 Saving to Supabase:', payload);

  const { data, error } = await supabase
    .from('responses')
    .insert([payload])
    .select();

  if (error) {
    console.error('Fout bij opslaan:', error);
  } else {
    console.log('✅ Opgeslagen in Supabase:', data);
  }

  return { data, error };
}

export async function getAllResponses() {
  const { data, error } = await supabase
    .from('responses')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Fout bij ophalen:', error);
    return [];
  }

  return data || [];
}

export async function getTeamData(teamName) {
  const { data, error } = await supabase
    .from('responses')
    .select('*')
    .eq('team', teamName)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Fout bij ophalen teamdata:', error);
    return [];
  }

  return data || [];
}

export async function getTeamNames() {
  const { data, error } = await supabase
    .from('responses')
    .select('team')
    .order('team');

  if (error) {
    console.error('Fout bij ophalen teamnamen:', error);
    return [];
  }

  return [...new Set((data || []).map((r) => r.team).filter(Boolean))];
}