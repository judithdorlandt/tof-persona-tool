/**
 * localStore.js — alles wat de app onthoudt, blijft op het toestel.
 *
 * In app-modus gaat er niets naar een server (besluit "alles lokaal"). Deze
 * laag bewaart de afgeronde profielen, de gespreksvoorbereiding per profiel en
 * welk profiel je nu bekijkt. Eén sleutel in localStorage, één datamodel:
 *
 *   { version, currentId, entries: [{ id, savedAt, result, notes, pinned }] }
 *
 * `notes` = de drie open vragen { recognize, drains, ask }.
 * `pinned` = de inzichten die je aan je gesprek hebt vastgeprikt, als
 * `{ kind, key }`-paren (bijv. `{ kind: 'workplace', key: 'focus' }`).
 *
 * `entries` staat nieuwste-eerst. localStorage is in een Capacitor-webview
 * gewoon persistent; mocht er later een native opslag nodig zijn, dan is dit
 * het enige bestand dat verandert.
 */

const KEY = 'tof_native_profiles';
const VERSION = 2;
const MAX_ENTRIES = 50;

const EMPTY = { version: VERSION, currentId: null, entries: [] };

export const EMPTY_NOTES = { recognize: '', drains: '', ask: '' };

/**
 * Brengt één bewaard profiel naar het huidige model.
 *
 * v1 had één vrij tekstveld (`note`). Dat was in de praktijk het antwoord op
 * "wat herken ik hierin?", dus daar landt het — niets van wat iemand heeft
 * opgeschreven gaat verloren.
 */
function migrateEntry(entry) {
    const { note, ...rest } = entry || {};
    return {
        ...rest,
        notes: { ...EMPTY_NOTES, ...(entry?.notes || {}), ...(note ? { recognize: note } : {}) },
        pinned: Array.isArray(entry?.pinned) ? entry.pinned : [],
    };
}

function read() {
    try {
        const raw = window.localStorage.getItem(KEY);
        if (!raw) return { ...EMPTY };
        const parsed = JSON.parse(raw);
        if (!parsed || !Array.isArray(parsed.entries)) return { ...EMPTY };
        return {
            version: VERSION,
            currentId: parsed.currentId || null,
            entries: parsed.entries.map(migrateEntry),
        };
    } catch (_e) {
        // Kapotte of geblokkeerde opslag mag de app nooit laten crashen.
        return { ...EMPTY };
    }
}

function write(state) {
    try {
        window.localStorage.setItem(KEY, JSON.stringify(state));
        return true;
    } catch (_e) {
        return false;
    }
}

function makeId() {
    return `p_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

/** Bewaart een afgerond profiel en maakt het meteen het actieve profiel. */
export function saveProfile(result) {
    const state = read();
    const entry = {
        id: makeId(),
        savedAt: new Date().toISOString(),
        result,
        notes: { ...EMPTY_NOTES },
        pinned: [],
    };
    const entries = [entry, ...state.entries].slice(0, MAX_ENTRIES);
    write({ version: VERSION, currentId: entry.id, entries });
    return entry;
}

/** Alle bewaarde profielen, nieuwste eerst. */
export function getHistory() {
    return read().entries;
}

/** Het profiel dat je nu bekijkt — valt terug op het nieuwste. */
export function getCurrentEntry() {
    const state = read();
    if (!state.entries.length) return null;
    return state.entries.find((e) => e.id === state.currentId) || state.entries[0];
}

/** Kies een ouder profiel uit de historie om te bekijken. */
export function selectEntry(id) {
    const state = read();
    if (!state.entries.some((e) => e.id === id)) return null;
    write({ ...state, currentId: id });
    return state.entries.find((e) => e.id === id);
}

/**
 * Antwoord op één van de drie gespreksvragen — verlaat het toestel nooit.
 * `field` is 'recognize', 'drains' of 'ask'.
 */
export function saveNote(id, field, value) {
    const state = read();
    const entries = state.entries.map((e) =>
        e.id === id ? { ...e, notes: { ...e.notes, [field]: value } } : e
    );
    return write({ ...state, entries });
}

/**
 * Prikt een inzicht aan je gesprek vast, of haalt het er weer af.
 * Geeft de nieuwe lijst terug, zodat de UI meteen kan bijwerken.
 */
export function togglePin(id, pin) {
    const state = read();
    let updated = [];
    const entries = state.entries.map((e) => {
        if (e.id !== id) return e;
        const exists = e.pinned.some((p) => p.kind === pin.kind && p.key === pin.key);
        updated = exists
            ? e.pinned.filter((p) => !(p.kind === pin.kind && p.key === pin.key))
            : [...e.pinned, pin];
        return { ...e, pinned: updated };
    });
    write({ ...state, entries });
    return updated;
}

/** Verwijdert één profiel uit de historie. */
export function deleteEntry(id) {
    const state = read();
    const entries = state.entries.filter((e) => e.id !== id);
    const currentId = state.currentId === id ? entries[0]?.id || null : state.currentId;
    return write({ version: VERSION, currentId, entries });
}
