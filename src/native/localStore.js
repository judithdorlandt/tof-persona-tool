/**
 * localStore.js — alles wat de app onthoudt, blijft op het toestel.
 *
 * In app-modus gaat er niets naar een server (besluit "alles lokaal"). Deze
 * laag bewaart de afgeronde profielen, de persoonlijke notitie per profiel en
 * welk profiel je nu bekijkt. Eén sleutel in localStorage, één datamodel:
 *
 *   { version, currentId, entries: [{ id, savedAt, result, note }] }
 *
 * `entries` staat nieuwste-eerst. localStorage is in een Capacitor-webview
 * gewoon persistent; mocht er later een native opslag nodig zijn, dan is dit
 * het enige bestand dat verandert.
 */

const KEY = 'tof_native_profiles';
const VERSION = 1;
const MAX_ENTRIES = 50;

const EMPTY = { version: VERSION, currentId: null, entries: [] };

function read() {
    try {
        const raw = window.localStorage.getItem(KEY);
        if (!raw) return { ...EMPTY };
        const parsed = JSON.parse(raw);
        if (!parsed || !Array.isArray(parsed.entries)) return { ...EMPTY };
        return { version: VERSION, currentId: parsed.currentId || null, entries: parsed.entries };
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
        note: '',
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

/** Persoonlijke notitie bij een profiel — verlaat het toestel nooit. */
export function saveNote(id, note) {
    const state = read();
    const entries = state.entries.map((e) => (e.id === id ? { ...e, note } : e));
    return write({ ...state, entries });
}

/** Verwijdert één profiel uit de historie. */
export function deleteEntry(id) {
    const state = read();
    const entries = state.entries.filter((e) => e.id !== id);
    const currentId = state.currentId === id ? entries[0]?.id || null : state.currentId;
    return write({ version: VERSION, currentId, entries });
}
