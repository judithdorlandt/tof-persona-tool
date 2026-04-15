/* =========================
   🔐 TEAM ACCESS (bestaand)
   ========================= */

export function hasTeamAccess() {
    return localStorage.getItem('tof_team_access') === 'granted';
}

export function grantTeamAccess(code) {
    localStorage.setItem('tof_team_access', 'granted');
    localStorage.setItem('tof_team_code', code);
}

export function clearTeamAccess() {
    localStorage.removeItem('tof_team_access');
    localStorage.removeItem('tof_team_code');
}

export function getTeamCode() {
    return localStorage.getItem('tof_team_code') || '';
}


/* =========================
   🛠 MAKER ACCESS (nieuw)
   ========================= */

export function isMakerAccess() {
    try {
        return localStorage.getItem('tof_maker_access') === 'true';
    } catch (error) {
        console.error('Maker access check failed', error);
        return false;
    }
}

export function grantMakerAccess() {
    try {
        localStorage.setItem('tof_maker_access', 'true');
    } catch (error) {
        console.error('Kon maker access niet opslaan', error);
    }
}

export function clearMakerAccess() {
    try {
        localStorage.removeItem('tof_maker_access');
    } catch (error) {
        console.error('Kon maker access niet verwijderen', error);
    }
}


/* =========================
   🚀 COMBINED ACCESS (optioneel maar slim)
   ========================= */

export function hasFullTeamAccess() {
    return hasTeamAccess() || isMakerAccess();
}