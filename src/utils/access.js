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
const MODULE2_LEGACY_KEY = 'tof_module2_access';        // legacy: algemeen Module 2 vlag
const ADMIN_ACCESS_KEY = 'tof_admin_access';            // beheerders-toegang

export const LEVEL_INSIGHT = 'insight';
export const LEVEL_DYNAMICS = 'dynamics';

// Volgorde bepaalt wat hoger is. Index = "power" van het niveau.
const LEVEL_ORDER = [LEVEL_INSIGHT, LEVEL_DYNAMICS];

function levelPower(level) {
    const idx = LEVEL_ORDER.indexOf(level);
    return idx === -1 ? -1 : idx;
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
    return entry?.level || null;
}

/**
 * Controleer of een team op minstens een bepaald niveau toegang heeft.
 */
export function hasTeamLevel(team, organization, requiredLevel) {
    const current = getTeamLevel(team, organization);
    if (!current) return false;
    return levelPower(current) >= levelPower(requiredLevel);
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