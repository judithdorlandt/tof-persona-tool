import { createClient } from '@supabase/supabase-js';

import { getActiveLang, getCopy } from './i18n/copy';

// Foutteksten in de taal die de gebruiker nu ziet. Deze module draait buiten
// React, dus de taal komt uit de URL/localStorage in plaats van uit de context.
function errorCopy() {
  return getCopy(getActiveLang()).common.errors;
}

// =========================
// INIT
// =========================

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Supabase env vars ontbreken');
}

// Vertaalt de drie fouten die je hier realistisch tegenkomt naar iets
// leesbaars. Voorkomt "stil falen": de aanroeper toont deze tekst.
function describeError(err) {
  const msg = String(err?.message || err || '').toLowerCase();
  const c = errorCopy().save;
  if (msg.includes('schema') && (msg.includes('not') || msg.includes('exist'))) {
    return c.schema;
  }
  if (msg.includes('permission') || msg.includes('denied') || msg.includes('row-level') || msg.includes('policy')) {
    return c.permission;
  }
  if (msg.includes('column') || msg.includes('does not exist')) {
    return c.column;
  }
  return c.generic;
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
 *
 * `metadata` wordt als user_metadata meegestuurd. Let op: Supabase zet dat
 * alleen bij het AANMAKEN van een nieuwe gebruiker — bestaande accounts
 * behouden hun huidige metadata.
 */
export async function sendMagicLink(email, metadata = null) {
  if (!ensureSupabase()) {
    return { ok: false, error: errorCopy().supabaseUnavailable };
  }

  try {
    const cleanEmail = String(email || '').trim().toLowerCase();
    if (!cleanEmail) {
      return { ok: false, error: errorCopy().invalidEmail };
    }

    const { error } = await supabase.auth.signInWithOtp({
      email: cleanEmail,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        ...(metadata ? { data: metadata } : {}),
      },
    });

    if (error) {
      console.error('❌ Magic-link error:', error.message);
      return { ok: false, error: error.message || 'Versturen mislukt.' };
    }

    return { ok: true, error: null };
  } catch (err) {
    console.error('❌ Magic-link error:', err?.message || err);
    return { ok: false, error: err?.message || errorCopy().generic };
  }
}

/**
 * Logt in met e-mail + wachtwoord (alleen gebruikt op de admin-pagina).
 * Vereist dat er voor het account een wachtwoord is ingesteld in Supabase.
 */
export async function signInWithPassword(email, password) {
  if (!ensureSupabase()) {
    return { ok: false, error: errorCopy().supabaseUnavailable };
  }

  const cleanEmail = String(email || '').trim().toLowerCase();
  if (!cleanEmail || !password) {
    return { ok: false, error: errorCopy().missingCredentials };
  }

  try {
    const { error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password,
    });

    if (error) {
      console.error('❌ signInWithPassword error:', error.message);
      return { ok: false, error: error.message || 'Inloggen mislukt.' };
    }

    return { ok: true, error: null };
  } catch (err) {
    console.error('❌ signInWithPassword error:', err?.message || err);
    return { ok: false, error: err?.message || errorCopy().generic };
  }
}

/**
 * Verifieert een magic-link op basis van token_hash uit de URL.
 *
 * Dit is de "veilige variant" die NIET automatisch verbruikt wordt bij het
 * openen van de link. Pas wanneer de gebruiker zelf op de knop klikt, roepen
 * we deze functie aan. Daardoor verbruiken automatische e-mailscanners
 * (Microsoft Safe Links e.d.) de token niet voortijdig.
 *
 * Het juiste OTP-`type` verschilt per Supabase-flow ('email' voor
 * signInWithOtp, 'magiclink', 'recovery', 'signup', ...). Een verkeerde type
 * verbruikt de token NIET (Supabase vindt simpelweg geen match), dus we
 * proberen de kandidaten op volgorde tot er één matcht. Zo werkt de pagina
 * ongeacht welke email-template Supabase precies gebruikt heeft.
 */
export async function verifyMagicLink(tokenHash, type) {
  if (!ensureSupabase()) {
    return { ok: false, error: errorCopy().supabaseUnavailable };
  }

  const cleanHash = String(tokenHash || '').trim();
  if (!cleanHash) {
    return { ok: false, error: errorCopy().invalidToken };
  }

  // Begin met het type uit de URL, val daarna terug op de overige kandidaten.
  const candidates = [type, 'email', 'magiclink', 'recovery', 'signup']
    .filter(Boolean)
    .filter((t, i, arr) => arr.indexOf(t) === i);

  let lastError = null;

  for (const t of candidates) {
    try {
      const { error } = await supabase.auth.verifyOtp({
        token_hash: cleanHash,
        type: t,
      });
      if (!error) {
        return { ok: true, error: null };
      }
      lastError = error;
    } catch (err) {
      lastError = err;
    }
  }

  const message = lastError?.message || 'Verifiëren mislukt.';
  console.error('❌ verifyOtp error:', message);
  return { ok: false, error: message };
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
    return { error: { message: err?.message || errorCopy().generic } };
  }
}

// =========================
// PDF DOWNLOAD LOGGING
// =========================

export async function logPdfDownload(teamId) {
  if (!ensureSupabase()) {
    return { ok: false, error: errorCopy().supabaseUnavailable };
  }

  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { ok: false, error: errorCopy().noSession };
    }

    const { error } = await supabase
      .from('pdf_downloads')
      .insert({ user_id: user.id, team_id: teamId });

    if (error) throw error;

    return { ok: true };
  } catch (err) {
    console.error('❌ PDF download log error:', err?.message || err);
    return { ok: false, error: err?.message || 'Loggen mislukt' };
  }
}

// =========================
// STRATEGISCH KOMPAS — Module 3 intake & review (kwalitatief)
// =========================
// De intake- en review-formulieren leveren open antwoorden die Judith
// leest en in het ontwerpgesprek tot weging en keuzes maakt. GEEN
// automatische uitslag. We bewaren de ruwe payload (exact de intake-/
// review-shape uit utils/strategicKompas.js) gekoppeld aan de teamcode.
//
// Persistentie: tabel `strategic_kompas_intake` (zie
// supabase/004_strategic_kompas_intake.sql). Lukt de insert niet — tabel
// bestaat nog niet, of geen verbinding — dan valt het terug op localStorage
// zodat de inzending niet verloren gaat. De gebruiker krijgt altijd een
// bevestiging.

const KOMPAS_LOCAL_KEY = 'tof_strategic_kompas_submissions';

function persistKompasLocally(entry) {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return false;
    const raw = window.localStorage.getItem(KOMPAS_LOCAL_KEY);
    const list = raw ? JSON.parse(raw) : [];
    list.push(entry);
    window.localStorage.setItem(KOMPAS_LOCAL_KEY, JSON.stringify(list));
    return true;
  } catch (err) {
    console.warn('⚠️ Kompas lokaal opslaan mislukt:', err?.message || err);
    return false;
  }
}

/**
 * Slaat een Module 3-inzending op, gekoppeld aan de teamcode.
 *
 * @param {'intake'|'review'} kind  welk blok dit is
 * @param {string} teamcode         koppelt aan de persona-data van dezelfde org
 * @param {object} payload          exact de intake-/review-shape
 *
 * Returnt: { ok, persisted: 'supabase'|'local', error }
 */
async function saveKompasSubmission(kind, teamcode, payload) {
  const cleanCode = String(teamcode || '').trim();
  const submittedAt = new Date().toISOString();
  const entry = { kind, teamcode: cleanCode, payload, submitted_at: submittedAt };

  if (ensureSupabase()) {
    try {
      const { error } = await supabase
        .from('strategic_kompas_intake')
        .insert({
          teamcode: cleanCode,
          kind,
          payload,
          submitted_at: submittedAt,
        });

      if (!error) {
        return { ok: true, persisted: 'supabase', error: null };
      }
      console.warn(`⚠️ Kompas ${kind} → Supabase mislukt, val terug op lokaal:`, error.message);
    } catch (err) {
      console.warn(`⚠️ Kompas ${kind} → Supabase error, val terug op lokaal:`, err?.message || err);
    }
  }

  // Fallback: lokaal bewaren zodat de inzending niet verloren gaat.
  const localOk = persistKompasLocally(entry);
  return {
    ok: localOk,
    persisted: localOk ? 'local' : null,
    error: localOk ? null : 'Opslaan mislukt.',
  };
}

/** Slaat een ingevulde Module 3-intake op. payload volgt de intake-shape. */
export async function saveStrategicKompasIntake(teamcode, payload) {
  return saveKompasSubmission('intake', teamcode, payload);
}

/** Slaat een 3-maanden-review op. payload volgt de review-shape. */
export async function saveStrategicKompasReview(teamcode, payload) {
  return saveKompasSubmission('review', teamcode, payload);
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

    // Bewust GEEN .select() na de insert: anon respondenten mogen na de
    // beveiligings-lockdown (006) niet meer uit responses lezen, en een
    // insert().select() zou dan terugrollen. We hebben de teruggegeven rij
    // hier niet nodig — succes/fout loopt via throw.
    const { error } = await supabase
      .schema('private').from('responses')
      .insert([payload]);

    if (error) throw error;

    return true;
  } catch (err) {
    console.error('❌ Response error:', err?.message || err);
    throw new Error(describeError(err));
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
    throw new Error(describeError(err));
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

export async function getResponsesByTeam(team, organization = null, code = null) {

  if (!ensureSupabase()) return [];

  try {

    const cleanTeam = String(team || '').trim();

    const cleanOrganization = String(organization || '').trim();

    const cleanCode = String(code || '').trim();

    if (!cleanTeam && !cleanCode) {

      console.error('❌ Fetch team responses error: team én code ontbreken');

      return [];

    }

    // Dual matching: eerst op invite_code (1-op-1 match, geen typo-gevoelig),
    // dan op team+organization namen als fallback voor legacy responses
    // zonder code. Dedup op id zodat dezelfde response niet dubbel telt.
    const seen = new Set();
    const results = [];

    if (cleanCode) {

      // Anonieme bezoekers lezen via de SECURITY DEFINER-RPC die de code
      // valideert en alléén dat team teruggeeft (006). Bestaat de functie
      // nog niet (006 niet gedraaid), dan vallen we terug op de directe
      // read — zo werkt het vóór én na de migratie. Ingelogde admin/manager
      // krijgen exact dezelfde teamrijen.
      let codeData = null;

      const { data: rpcData, error: rpcErr } = await supabase
        .rpc('responses_for_code', { p_code: cleanCode });

      if (rpcErr) {
        const missing = /(function|does not exist|not found|pgrst202|schema cache)/i
          .test(String(rpcErr.message || rpcErr.code || ''));
        if (!missing) throw rpcErr;

        const { data: direct, error: directErr } = await supabase
          .schema('private').from('responses')
          .select('*')
          .eq('invite_code', cleanCode)
          .order('created_at', { ascending: true });

        if (directErr) throw directErr;
        codeData = direct;
      } else {
        codeData = rpcData;
      }

      (codeData || []).forEach((r) => {

        if (r.id != null && !seen.has(r.id)) {

          seen.add(r.id);

          results.push(r);

        }

      });

    }

    if (cleanTeam) {

      let query = supabase

        .schema('private').from('responses')

        .select('*')

        .eq('team', cleanTeam)

        .order('created_at', { ascending: true });

      if (cleanOrganization) {

        query = query.eq('organization', cleanOrganization);

      }

      const { data: nameData, error: nameErr } = await query;

      if (nameErr) throw nameErr;

      (nameData || []).forEach((r) => {

        if (r.id != null && !seen.has(r.id)) {

          seen.add(r.id);

          results.push(r);

        }

      });

    }

    return results;

  } catch (err) {

    console.error('❌ Fetch team responses error:', err?.message || err);

    return [];

  }

}

// Geaggregeerd: alle responses voor één organisatie. Dual matching:
// match op organization-naam OF op invite_code (lijst van team-codes van
// die organisatie). Dedup op id zodat een response die op beide manieren
// matcht niet dubbel telt. Caller geeft de codes mee, opgehaald uit
// getAllTeamAccessCodes.
export async function getResponsesByOrganization(organization, codes = []) {

  if (!ensureSupabase()) return [];

  try {

    const cleanOrg = String(organization || '').trim();

    const cleanCodes = (Array.isArray(codes) ? codes : [])

      .map((c) => String(c || '').trim())

      .filter((c) => c);

    if (!cleanOrg && cleanCodes.length === 0) {

      console.error('❌ Fetch organization responses error: organization én codes ontbreken');

      return [];

    }

    const seen = new Set();

    const results = [];

    if (cleanCodes.length > 0) {

      const { data: codeData, error: codeErr } = await supabase

        .schema('private').from('responses')

        .select('*')

        .in('invite_code', cleanCodes)

        .order('created_at', { ascending: true });

      if (codeErr) throw codeErr;

      (codeData || []).forEach((r) => {

        if (r.id != null && !seen.has(r.id)) {

          seen.add(r.id);

          results.push(r);

        }

      });

    }

    if (cleanOrg) {

      const { data: orgData, error: orgErr } = await supabase

        .schema('private').from('responses')

        .select('*')

        .eq('organization', cleanOrg)

        .order('created_at', { ascending: true });

      if (orgErr) throw orgErr;

      (orgData || []).forEach((r) => {

        if (r.id != null && !seen.has(r.id)) {

          seen.add(r.id);

          results.push(r);

        }

      });

    }

    return results;

  } catch (err) {

    console.error('❌ Fetch organization responses error:', err?.message || err);

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
    return { membership: null, accessCode: null, error: { message: errorCopy().supabaseUnavailable } };
  }

  try {
    const user = await getCurrentUser();
    if (!user) {
      return { membership: null, accessCode: null, error: { message: errorCopy().notLoggedIn } };
    }

    // Validate code
    const accessCode = await validateTeamAccessCode(code);
    if (!accessCode) {
      return { membership: null, accessCode: null, error: { message: errorCopy().invalidCode } };
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
    return { membership: null, accessCode: null, error: { message: err?.message || errorCopy().generic } };
  }
}

// =========================
// MANAGER ACCESS — team_managers tabel
// =========================
// Managers worden vooraf gekoppeld aan een team-code via hun e-mail
// (zie supabase/001_team_managers.sql). Bij hun eerste magic-link login
// matcht Supabase de email automatisch en krijgen ze toegang tot
// alle gekoppelde teams — zonder code in te voeren.

/**
 * Haalt teams op waar de ingelogde user manager van is, via team_managers.
 * Joint met team_access_codes om level/team/organization mee te leveren.
 *
 * Returnt: [{ code, level, team, organization, role }]
 * Lege array als niet ingelogd of geen koppelingen.
 */
export async function getMyManagedTeams() {
  if (!ensureSupabase()) return [];

  try {
    const user = await getCurrentUser();
    if (!user?.email) return [];

    const { data, error } = await supabase
      .from('team_managers')
      .select('role, team_code, team_access_codes!inner(code, level, team, organization, active)')
      .eq('email', user.email.toLowerCase())
      .eq('team_access_codes.active', true);

    if (error) {
      // Tabel bestaat misschien nog niet (SQL nog niet gedraaid) — log en geef [].
      console.warn('⚠️ getMyManagedTeams:', error.message);
      return [];
    }

    return (data || []).map((r) => ({
      code: r.team_access_codes?.code || r.team_code,
      level: r.team_access_codes?.level || 'insight',
      team: r.team_access_codes?.team || null,
      organization: r.team_access_codes?.organization || null,
      role: r.role || 'manager',
    }));
  } catch (err) {
    console.warn('⚠️ getMyManagedTeams error:', err?.message || err);
    return [];
  }
}

// ─── Admin-side helpers voor de Managers-tab in Admin.jsx ──────────────────

/**
 * Lijst ALLE manager-koppelingen, verrijkt met team-naam.
 * Alleen admin. Sorteert op team_code.
 *
 * Returnt: [{ id, email, team_code, role, created_at, team, organization }]
 */
export async function adminListTeamManagers() {
  if (!ensureSupabase()) return [];
  try {
    const isAdmin = await isCurrentUserAdmin();
    if (!isAdmin) return [];

    const { data, error } = await supabase
      .from('team_managers')
      .select('id, email, team_code, role, created_at, team_access_codes!inner(team, organization)')
      .order('team_code', { ascending: true });

    if (error) {
      console.warn('⚠️ adminListTeamManagers:', error.message);
      return [];
    }

    return (data || []).map((r) => ({
      id: r.id,
      email: r.email,
      team_code: r.team_code,
      role: r.role,
      created_at: r.created_at,
      team: r.team_access_codes?.team || null,
      organization: r.team_access_codes?.organization || null,
    }));
  } catch (err) {
    console.warn('⚠️ adminListTeamManagers error:', err?.message || err);
    return [];
  }
}

/**
 * Koppel een manager (email) aan een team-code.
 * Idempotent: bij conflict (email, team_code) gebeurt niets.
 *
 * Returnt: { row, error }
 */
export async function adminAddTeamManager({ email, teamCode, role = 'manager' }) {
  if (!ensureSupabase()) {
    return { row: null, error: { message: errorCopy().supabaseUnavailable } };
  }
  try {
    const isAdmin = await isCurrentUserAdmin();
    if (!isAdmin) return { row: null, error: { message: errorCopy().noAdminRights } };

    const cleanEmail = String(email || '').trim().toLowerCase();
    const cleanCode = String(teamCode || '').trim();
    if (!cleanEmail || !cleanCode) {
      return { row: null, error: { message: errorCopy().requiredFields } };
    }

    const { data, error } = await supabase
      .from('team_managers')
      .upsert(
        { email: cleanEmail, team_code: cleanCode, role },
        { onConflict: 'email,team_code', ignoreDuplicates: true }
      )
      .select()
      .maybeSingle();

    if (error) {
      console.error('❌ adminAddTeamManager:', error.message);
      return { row: null, error };
    }
    return { row: data, error: null };
  } catch (err) {
    console.error('❌ adminAddTeamManager error:', err?.message || err);
    return { row: null, error: { message: err?.message || errorCopy().generic } };
  }
}

/** Verwijder een manager-koppeling op id. Alleen admin. */
export async function adminRemoveTeamManager(id) {
  if (!ensureSupabase()) return { error: { message: errorCopy().supabaseUnavailable } };
  try {
    const isAdmin = await isCurrentUserAdmin();
    if (!isAdmin) return { error: { message: errorCopy().noAdminRights } };

    const { error } = await supabase.from('team_managers').delete().eq('id', id);
    if (error) {
      console.error('❌ adminRemoveTeamManager:', error.message);
      return { error };
    }
    return { error: null };
  } catch (err) {
    console.error('❌ adminRemoveTeamManager error:', err?.message || err);
    return { error: { message: err?.message || errorCopy().generic } };
  }
}

// =========================
// ORGANISATIE-OBSERVATIES (admin handmatige input)
// =========================
// Per organisatie kunnen TOF-admins observaties toevoegen die naast
// de data-driven insights getoond worden (bv. akoestiek, no-shows).
// Categorieën: 'leegloper' | 'werkt_goed'.

export async function adminListOrgObservations(organization) {
  if (!ensureSupabase()) return [];
  try {
    const isAdmin = await isCurrentUserAdmin();
    if (!isAdmin) return [];
    const { data, error } = await supabase
      .from('organization_observations')
      .select('id, organization, category, content, sort_order, created_at')
      .eq('organization', organization)
      .order('category', { ascending: true })
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true });
    if (error) {
      console.warn('⚠️ adminListOrgObservations:', error.message);
      return [];
    }
    return data || [];
  } catch (err) {
    console.warn('⚠️ adminListOrgObservations error:', err?.message || err);
    return [];
  }
}

export async function adminAddOrgObservation({ organization, category, content }) {
  if (!ensureSupabase()) {
    return { row: null, error: { message: errorCopy().supabaseUnavailable } };
  }
  try {
    const isAdmin = await isCurrentUserAdmin();
    if (!isAdmin) return { row: null, error: { message: errorCopy().noAdminRights } };

    const org = String(organization || '').trim();
    const cat = String(category || '').trim();
    const txt = String(content || '').trim();
    if (!org || !cat || !txt) {
      return { row: null, error: { message: errorCopy().requiredFields } };
    }
    if (!['leegloper', 'werkt_goed'].includes(cat)) {
      return { row: null, error: { message: `Onbekende categorie: ${cat}` } };
    }

    const { data, error } = await supabase
      .from('organization_observations')
      .insert({ organization: org, category: cat, content: txt })
      .select()
      .maybeSingle();

    if (error) {
      console.error('❌ adminAddOrgObservation:', error.message);
      return { row: null, error };
    }
    return { row: data, error: null };
  } catch (err) {
    console.error('❌ adminAddOrgObservation error:', err?.message || err);
    return { row: null, error: { message: err?.message || errorCopy().generic } };
  }
}

export async function adminRemoveOrgObservation(id) {
  if (!ensureSupabase()) return { error: { message: errorCopy().supabaseUnavailable } };
  try {
    const isAdmin = await isCurrentUserAdmin();
    if (!isAdmin) return { error: { message: errorCopy().noAdminRights } };
    const { error } = await supabase.from('organization_observations').delete().eq('id', id);
    if (error) {
      console.error('❌ adminRemoveOrgObservation:', error.message);
      return { error };
    }
    return { error: null };
  } catch (err) {
    console.error('❌ adminRemoveOrgObservation error:', err?.message || err);
    return { error: { message: err?.message || errorCopy().generic } };
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
    // Dual matching: tellen op invite_code (1-op-1) plus op team+org-namen
    // als fallback voor legacy responses. Dedup op id zodat een response
    // die op beide manieren matcht niet dubbel telt.
    const enriched = await Promise.all(
      codes.map(async (c) => {
        const ids = new Set();
        try {
          if (c.code) {
            const { data: codeRows } = await supabase
              .schema('private')
              .from('responses')
              .select('id')
              .eq('invite_code', c.code);
            (codeRows || []).forEach((r) => { if (r.id != null) ids.add(r.id); });
          }
          if (c.team) {
            let query = supabase
              .schema('private')
              .from('responses')
              .select('id')
              .eq('team', c.team);
            if (c.organization) query = query.eq('organization', c.organization);
            const { data: nameRows } = await query;
            (nameRows || []).forEach((r) => { if (r.id != null) ids.add(r.id); });
          }
        } catch (_e) {
          // Bij fout: 0 tonen i.p.v. de hele lijst stuk laten gaan
        }
        return { ...c, response_count: ids.size };
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
    return { code: null, accessCode: null, error: { message: errorCopy().supabaseUnavailable } };
  }
  try {
    const isAdmin = await isCurrentUserAdmin();
    if (!isAdmin) {
      return { code: null, accessCode: null, error: { message: errorCopy().noAdminRights } };
    }
    if (!organization || !team) {
      return { code: null, accessCode: null, error: { message: errorCopy().requiredFields } };
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
    return { code: null, accessCode: null, error: { message: err?.message || errorCopy().generic } };
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