const TEAM_ACCESS_KEY = 'tof_team_access';
const MAKER_ACCESS_KEY = 'tof_maker_access';
const ADMIN_ACCESS_KEY = 'tof_admin_access';

// ─── ADMIN CODE ───────────────────────────────────────────────────────────────
// Geeft toegang tot alle organisaties in de TeamSelector.
const ADMIN_CODE = 'P3rs0n4_ADMIN!';

export function checkAndGrantAdminAccess(input) {
    if (String(input || '').trim() === ADMIN_CODE) {
        localStorage.setItem(ADMIN_ACCESS_KEY, 'true');
        return true;
    }
    return false;
}

export function isAdminAccess() {
    return localStorage.getItem(ADMIN_ACCESS_KEY) === 'true';
}

export function revokeAdminAccess() {
    localStorage.removeItem(ADMIN_ACCESS_KEY);
}

// ─── TEAM ACCESS ──────────────────────────────────────────────────────────────

export function grantTeamAccess(payload = {}) {
    const cleanPayload =
        payload === true
            ? { granted: true, code: '', team: '', organization: '' }
            : {
                granted: true,
                code: payload.code || '',
                team: payload.team || '',
                organization: payload.organization || '',
            };

    localStorage.setItem(TEAM_ACCESS_KEY, JSON.stringify(cleanPayload));
}

export function revokeTeamAccess() {
    localStorage.removeItem(TEAM_ACCESS_KEY);
}

export function getStoredTeamAccess() {
    const raw = localStorage.getItem(TEAM_ACCESS_KEY);

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
    const access = getStoredTeamAccess();
    if (isMakerAccess()) return true;
    if (!access) return false;
    return access.granted || !!access.code;
}

// ─── MAKER ACCESS ─────────────────────────────────────────────────────────────

export function grantMakerAccess() {
    localStorage.setItem(MAKER_ACCESS_KEY, 'true');
}

export function revokeMakerAccess() {
    localStorage.removeItem(MAKER_ACCESS_KEY);
}

export function isMakerAccess() {
    return localStorage.getItem(MAKER_ACCESS_KEY) === 'true';
}