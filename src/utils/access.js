// =========================
// TEAM ACCESS MODEL
// =========================
// Eén team kan toegang hebben tot 'insight' (Module 1) of 'dynamics' (Module 2).
// Dynamics omvat altijd Insight — wie Dynamics heeft, heeft óók Insight.
//
// Opslag: array in localStorage, één entry per unieke team+organization.
//
// Voorbeeld:
//   [
//     { team: 'TOF',  organization: 'The Office Factory', level: 'dynamics', code: 'ABC123' },
//     { team: 'HR',   organization: 'The Office Factory', level: 'insight',  code: 'XYZ789' },
//   ]

const TEAM_ACCESS_KEY_V2 = 'tof_team_access_v2';
const TEAM_ACCESS_KEY_V1 = 'tof_team_access';           // legacy: één team
const MAKER_ACCESS_KEY = 'tof_maker_access';
const MANAGER_TEAMS_KEY = 'tof_manager_teams';          // teams waar jij manager van bent
const MODULE2_LEGACY_KEY = 'tof_module2_access';        // legacy: algemeen Module 2 vlag
const ADMIN_ACCESS_KEY = 'tof_admin_access';            // beheerders-toegang
const CURRENT_TEAM_KEY = 'tof_current_team';            // laatst geopende team
const AFTER_LOGIN_KEY = 'tof_after_login';              // waarheen na inloggen

export const LEVEL_INSIGHT = 'insight';
export const LEVEL_DYNAMICS = 'dynamics';
export const LEVEL_STRATEGIC = 'strategic';

// Volgorde bepaalt wat hoger is. Index = "power" van het niveau.
// Strategic > Dynamics > Insight. Wie strategic heeft, heeft ook dynamics en insight.
// Wie dynamics heeft, heeft ook insight maar NIET strategic.
const LEVEL_ORDER = [LEVEL_INSIGHT, LEVEL_DYNAMICS, LEVEL_STRATEGIC];

function levelPower(level) {
    const idx = LEVEL_ORDER.indexOf(level);
    return idx === -1 ? -1 : idx;
}

// =========================
// DREMPEL VOOR HET TEAMBEELD
// =========================
// Onder dit aantal tonen we geen teambeeld: in een kleiner team is een
// uitslag herleidbaar tot een persoon, ook zonder naam erbij. Dit is een
// regel over wie wat mag zien, daarom staat hij hier en niet bij de
// aggregatie.
export const MIN_TEAM_RESPONSES = 5;

// Rijen zonder werkstijl leveren geen teambeeld op en tellen dus niet mee.
// Dubbele invullingen kunnen we NIET zien: private.responses heeft geen
// persoonssleutel, alleen een optionele voornaam. Dedupliceren op het
// profiel zelf (zoals Bijdragen.jsx lokaal doet) zou een echt team van vijf
// kunnen tegenhouden zodra twee mensen dezelfde uitslag hebben — onterecht
// blokkeren is hier het slechtere falen. Zie docs: opdracht teamdrempel.
export function countCompleteProfiles(responses = []) {
    if (!Array.isArray(responses)) return 0;
    return responses.filter((r) => r?.primary_archetype || r?.primary).length;
}

// =========================
// NAMEN IN HET TEAMBEELD
// =========================
// Standaard laat het teambeeld niet zien wie wat heeft geantwoord — ook niet
// aan de manager, en ook niet in de PDF. buildTeamAggregate verzamelt daarom
// geen namen; alles wat op het aggregaat draait (PDF, Teamdynamiek, het
// organisatie-overzicht in /admin) blijft dus naamloos.
//
// Dit is een standaard, geen absoluut verbod. Namen mogen aan zodra een team
// daar zelf goedkeuring voor geeft, en dan geldt dat voor iedereen gelijk:
// wat de manager ziet, zien de teamleden ook. Een stand waarin alleen de
// manager namen ziet bestaat bewust niet. Daarom staan ze alleen in
// Teaminzicht en niet in Teamdynamiek.
//
// De schakelaar staat in de database en niet hier: `show_names` op
// public.team_access_codes, standaard false (supabase/007), om te zetten in
// /admin bij het team. De RPC responses_for_code geeft `name` alleen mee als
// die vlag aan staat, dus de naam verlaat de server niet zolang er geen
// goedkeuring is. Directe reads (getResponsesByOrganization en de fallbacks
// in getResponsesByTeam) halen de naam weg in supabase.js, want die gaan om
// de schakelaar heen. Een naam in de rijen betekent dus: het team stemde in.
//
// Weergave (22 okt 2026): namesByPersona hieronder, getoond onder de
// personaverdeling in Teaminzicht, en pas vanaf MIN_TEAM_RESPONSES.

/**
 * Voornamen per primaire werkstijl, of null als er geen enkele naam is
 * (dan staat de schakelaar uit) of als het team onder de drempel zit.
 * → { [personaId]: { names: ['Anna', 'Bram'], unnamed: 1 } }
 */
export function namesByPersona(responses = [], locale = 'nl') {
    if (!Array.isArray(responses)) return null;
    if (countCompleteProfiles(responses) < MIN_TEAM_RESPONSES) return null;

    const byPersona = {};
    let anyName = false;
    responses.forEach((r) => {
        const primary = r?.primary_archetype || r?.primary;
        if (!primary) return;
        const entry = byPersona[primary] || (byPersona[primary] = { names: [], unnamed: 0 });
        const name = String(r?.name || '').trim();
        if (name) {
            entry.names.push(name);
            anyName = true;
        } else {
            entry.unnamed += 1;
        }
    });
    if (!anyName) return null;

    Object.values(byPersona).forEach((entry) => {
        entry.names.sort((x, y) => x.localeCompare(y, locale, { sensitivity: 'base' }));
    });
    return byPersona;
}

// =========================
// DE ROL BEPAALT HET NIVEAU
// =========================
// Een teamcode geeft het teambeeld (Insight). Teamdynamiek hangt niet aan
// een code maar aan een persoon: wie in `team_managers` staat en is ingelogd.
// Zo kan de code rondgaan in het team zonder dat de managerkant meelekt.
//
// De rol komt uit de database, maar de toegangsvragen worden synchroon
// gesteld midden in een render. Daarom haalt App.js de teams één keer per
// sessie op en legt ze hier neer; de rest van de app leest ze synchroon.

/** Teams waar de ingelogde gebruiker manager van is. */
export function rememberManagedTeams(teams = []) {
    const keys = (teams || []).map((t) => teamKey(t.team, t.organization));
    localStorage.setItem(MANAGER_TEAMS_KEY, JSON.stringify(keys));
}

export function forgetManagedTeams() {
    localStorage.removeItem(MANAGER_TEAMS_KEY);
}

export function isManagerOf(team, organization) {
    const raw = localStorage.getItem(MANAGER_TEAMS_KEY);
    if (!raw) return false;
    try {
        const keys = JSON.parse(raw);
        return Array.isArray(keys) && keys.includes(teamKey(team, organization));
    } catch {
        return false;
    }
}

/**
 * Wat een ingewisselde code oplevert. Dynamics-codes geven sinds dit model
 * alleen nog het teambeeld — de dynamiek hoort bij de rol. Strategic blijft
 * ongemoeid: Module 3 is een los traject met een eigen afspraak.
 */
export function levelFromCode(codeLevel) {
    return codeLevel === LEVEL_STRATEGIC ? LEVEL_STRATEGIC : LEVEL_INSIGHT;
}

// =========================
// STORAGE HELPERS
// =========================

function readAccessList() {
    const raw = localStorage.getItem(TEAM_ACCESS_KEY_V2);
    if (!raw) return [];
    try {
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

function writeAccessList(list) {
    localStorage.setItem(TEAM_ACCESS_KEY_V2, JSON.stringify(list));
}

function teamKey(team, organization) {
    return `${(team || '').trim().toLowerCase()}|${(organization || '').trim().toLowerCase()}`;
}

// Migreer één V1-entry naar V2 als die bestaat
function migrateLegacyIfNeeded() {
    const v2 = readAccessList();
    if (v2.length > 0) return; // V2 heeft al data, geen migratie nodig

    const rawV1 = localStorage.getItem(TEAM_ACCESS_KEY_V1);
    if (!rawV1) return;

    try {
        const parsed = JSON.parse(rawV1);
        if (!parsed || (!parsed.team && !parsed.code)) return;

        // Oude entry migreren naar V2 met insight-niveau als default
        const migrated = {
            team: parsed.team || '',
            organization: parsed.organization || '',
            code: parsed.code || '',
            level: LEVEL_INSIGHT,
        };

        // Als de oude module2-vlag aan stond, upgrade naar dynamics
        if (localStorage.getItem(MODULE2_LEGACY_KEY) === '1') {
            migrated.level = LEVEL_DYNAMICS;
        }

        writeAccessList([migrated]);
    } catch {
        // Geen migratie als parse mislukt
    }
}

// =========================
// NIEUWE NIVEAU-API
// =========================

/**
 * Ken een niveau toe aan een team.
 * Nooit downgraden: als het team al hoger staat, blijft het hoger.
 */
export function grantTeamLevel({ team, organization, level, code = '' }) {
    if (!team && !organization) return;
    if (!LEVEL_ORDER.includes(level)) return;

    migrateLegacyIfNeeded();
    const list = readAccessList();
    const key = teamKey(team, organization);

    const existingIndex = list.findIndex(
        (entry) => teamKey(entry.team, entry.organization) === key
    );

    if (existingIndex === -1) {
        list.push({ team, organization, level, code });
    } else {
        const existing = list[existingIndex];
        const shouldUpgrade = levelPower(level) > levelPower(existing.level);
        list[existingIndex] = {
            team,
            organization,
            level: shouldUpgrade ? level : existing.level,
            code: code || existing.code,
        };
    }

    writeAccessList(list);
}

/**
 * Geeft het huidige niveau voor een team terug, of null als er geen toegang is.
 * Admin en Maker hebben altijd Dynamics-niveau.
 */
export function getTeamLevel(team, organization) {
    if (isMakerAccess() || isAdminAccess()) return LEVEL_DYNAMICS;

    migrateLegacyIfNeeded();
    const list = readAccessList();
    const key = teamKey(team, organization);
    const entry = list.find((e) => teamKey(e.team, e.organization) === key);
    const stored = entry?.level || null;

    // Manager van dit team? Dan minstens Dynamics, ook zonder code.
    if (isManagerOf(team, organization)) {
        return levelPower(stored) > levelPower(LEVEL_DYNAMICS) ? stored : LEVEL_DYNAMICS;
    }

    return stored;
}

/**
 * Controleer of een team op minstens een bepaald niveau toegang heeft.
 */
export function hasTeamLevel(team, organization, requiredLevel) {
    const current = getTeamLevel(team, organization);
    if (!current) return false;
    return levelPower(current) >= levelPower(requiredLevel);
}

/** De bewaarde toegang voor één team, of null. */
export function findTeamAccess(team, organization) {
    migrateLegacyIfNeeded();
    const key = teamKey(team, organization);
    return readAccessList().find((e) => teamKey(e.team, e.organization) === key) || null;
}

// =========================
// HET LAATST GEOPENDE TEAM
// =========================
// Het gekozen team leeft in App.js als state en is dus weg na verversen of
// bij een bladwijzer. Hier staat welk team je het laatst opende, zodat de
// app je daar terugbrengt. Alleen team en organisatie, nooit de code: die
// staat al in de toegangslijst, en zonder toegang levert dit niets op.
// localStorage en niet sessionStorage, want een bladwijzer opent een nieuw
// tabblad.

export function rememberCurrentTeam({ team, organization } = {}) {
    if (!team) return;
    localStorage.setItem(
        CURRENT_TEAM_KEY,
        JSON.stringify({ team, organization: organization || '' })
    );
}

export function forgetCurrentTeam() {
    localStorage.removeItem(CURRENT_TEAM_KEY);
}

export function getCurrentTeam() {
    const raw = localStorage.getItem(CURRENT_TEAM_KEY);
    if (!raw) return null;
    try {
        const parsed = JSON.parse(raw);
        return parsed?.team ? parsed : null;
    } catch {
        return null;
    }
}

// =========================
// NA HET INLOGGEN TERUG
// =========================
// "Inloggen als leidinggevende" op Teamdynamiek onthoudt waar je was, zodat
// AuthCallback je daar na de inloglink terugzet. localStorage, want de link
// opent in een nieuw tabblad. Wie de mail in een andere browser opent, komt
// op de gewone bestemming uit. Na een dag vervalt het: een inloglink is
// dan allang verlopen.
const AFTER_LOGIN_MAX_AGE = 24 * 60 * 60 * 1000;

export function rememberAfterLogin({ page, team, organization }) {
    if (!page) return;
    localStorage.setItem(
        AFTER_LOGIN_KEY,
        JSON.stringify({ page, team: team || '', organization: organization || '', at: Date.now() })
    );
}

/**
 * De bewaarde bestemming, of null als er geen (geldige) is. Wist niets: de
 * callback kan twee keer draaien, dus wissen gebeurt pas bij het doorsturen.
 */
export function readAfterLogin() {
    const raw = localStorage.getItem(AFTER_LOGIN_KEY);
    if (!raw) return null;
    try {
        const parsed = JSON.parse(raw);
        if (!parsed?.page || Date.now() - (parsed.at || 0) > AFTER_LOGIN_MAX_AGE) return null;
        return parsed;
    } catch {
        return null;
    }
}

export function clearAfterLogin() {
    localStorage.removeItem(AFTER_LOGIN_KEY);
}

/**
 * Lijst van alle teams met toegang (voor "Jouw teams" / "Mijn teams" overzicht).
 */
export function listTeamAccesses() {
    migrateLegacyIfNeeded();
    return readAccessList().slice();
}

/**
 * Toegang voor één team intrekken.
 */
export function revokeTeamLevel(team, organization) {
    const list = readAccessList();
    const key = teamKey(team, organization);
    const filtered = list.filter(
        (entry) => teamKey(entry.team, entry.organization) !== key
    );
    writeAccessList(filtered);
}

// =========================
// LEGACY API — voor bestaande code
// =========================
// Houden we werkend totdat de rest van de app is overgezet.

/**
 * LEGACY: oude signatuur. Schrijft naar het nieuwe model.
 * Behandelt een oude call als een Insight-grant tenzij anders vermeld.
 */
export function grantTeamAccess(payload = {}) {
    if (payload === true) {
        // Oude "gewoon toegang" call — bewaren we als markering in legacy key
        // zodat hasFullTeamAccess() true blijft geven voor oude flows
        localStorage.setItem(TEAM_ACCESS_KEY_V1, JSON.stringify({ granted: true, code: '', team: '', organization: '' }));
        return;
    }

    const team = payload.team || '';
    const organization = payload.organization || '';
    const code = payload.code || '';
    const level = payload.level || LEVEL_INSIGHT;

    if (team || organization) {
        grantTeamLevel({ team, organization, level, code });
    }

    // Ook legacy key schrijven zodat oude checks blijven werken
    localStorage.setItem(
        TEAM_ACCESS_KEY_V1,
        JSON.stringify({ granted: true, code, team, organization })
    );
}

export function revokeTeamAccess() {
    localStorage.removeItem(TEAM_ACCESS_KEY_V1);
    localStorage.removeItem(TEAM_ACCESS_KEY_V2);
    localStorage.removeItem(MODULE2_LEGACY_KEY);
    // Admin- en Maker-access blijven bestaan — die horen bij de persoon,
    // niet bij team-toegang. Uitzetten via revokeAdminAccess() / revokeMakerAccess().
}

export function getStoredTeamAccess() {
    // Eerst migreren, dan het meest recente team uit V2 pakken als er iets is
    migrateLegacyIfNeeded();
    const list = readAccessList();

    if (list.length > 0) {
        const last = list[list.length - 1];
        return {
            granted: true,
            code: last.code || '',
            team: last.team || '',
            organization: last.organization || '',
        };
    }

    const raw = localStorage.getItem(TEAM_ACCESS_KEY_V1);
    if (!raw) return null;
    try {
        const parsed = JSON.parse(raw);
        return {
            granted: true,
            code: parsed.code || '',
            team: parsed.team || '',
            organization: parsed.organization || '',
        };
    } catch {
        return { granted: true, code: '', team: '', organization: '' };
    }
}

export function hasFullTeamAccess() {
    if (isMakerAccess() || isAdminAccess()) return true;
    migrateLegacyIfNeeded();
    if (readAccessList().length > 0) return true;

    const access = getStoredTeamAccess();
    if (!access) return false;
    return access.granted || !!access.code;
}

// =========================
// ADMIN ACCESS (beheerders)
// =========================
// Geldt voor de sitebeheerder — een code die toegang geeft tot elk team
// zonder dat er per-team-code nodig is. Opgeslagen in localStorage na
// succesvolle validatie via Supabase.

export function grantAdminAccess() {
    localStorage.setItem(ADMIN_ACCESS_KEY, 'true');
}

export function revokeAdminAccess() {
    localStorage.removeItem(ADMIN_ACCESS_KEY);
}

export function isAdminAccess() {
    return localStorage.getItem(ADMIN_ACCESS_KEY) === 'true';
}

// =========================
// MAKER ACCESS (ongewijzigd)
// =========================

export function grantMakerAccess() {
    localStorage.setItem(MAKER_ACCESS_KEY, 'true');
}

export function revokeMakerAccess() {
    localStorage.removeItem(MAKER_ACCESS_KEY);
}

export function isMakerAccess() {
    return localStorage.getItem(MAKER_ACCESS_KEY) === 'true';
}