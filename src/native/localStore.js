/**
 * localStore.js — alles wat de app onthoudt, blijft op het toestel.
 *
 * In app-modus gaat er niets naar een server (besluit "alles lokaal"). Deze
 * laag bewaart de afgeronde profielen, de gespreksvoorbereiding per profiel en
 * welk profiel je nu bekijkt. Eén sleutel in localStorage, één datamodel:
 *
 *   { version, currentId, entries: [{
 *       id, savedAt, result,
 *       notes, pinned,                              // het gesprek dat nu loopt
 *       conversations: [{ id, nummer, closedAt, notes, pinned }]  // afgerond
 *   }] }
 *
 * `notes` = de vier open vragen { recognize, drains, ask, outcome }.
 * `pinned` = de inzichten die je aan je gesprek hebt vastgeprikt, als
 * `{ kind, key }`-paren (bijv. `{ kind: 'workplace', key: 'focus' }`).
 *
 * Waarom het lopende gesprek níet in `conversations` zit: er is er altijd
 * precies één open, en die hoort op een vaste plek te staan. Zo hoeft de rest
 * van de app (vastprikken, de teller in de balk, het label "met aantekening"
 * in de historie) niet te weten dat gesprekken bestaan — die kijken gewoon
 * naar `notes` en `pinned`, net als eerst. Afronden verhuist het gesprek naar
 * `conversations` en laat een leeg blad achter.
 *
 * `entries` staat nieuwste-eerst, `conversations` ook. localStorage is in een
 * Capacitor-webview gewoon persistent; mocht er later een native opslag nodig
 * zijn, dan is dit het enige bestand dat verandert.
 */

const KEY = 'tof_native_profiles';
const VERSION = 3;
const MAX_ENTRIES = 50;

/**
 * Hoeveel afgeronde gesprekken er onder één profiel passen.
 *
 * Acht is geen technische grens maar een leesbare: daarboven wordt het een
 * archief in plaats van een lijn die je kunt volgen. Valt het negende erin,
 * dan valt het oudste eraf.
 */
const MAX_CONVERSATIONS = 8;

const EMPTY = { version: VERSION, currentId: null, entries: [] };

/**
 * De vier open vragen. De eerste drie bereid je vóór het gesprek voor;
 * `outcome` schrijf je erna op. Ze staan in hetzelfde blok omdat ze bij
 * hetzelfde gesprek horen en dus samen mee verhuizen bij het afronden.
 */
export const EMPTY_NOTES = { recognize: '', drains: '', ask: '', outcome: '' };

/** Is er in dit gesprek iets vastgelegd? Leeg afronden heeft geen zin. */
function heeftInhoud(notes, pinned) {
    const geschreven = Object.values(notes || {}).some((v) => v && v.trim());
    return geschreven || (pinned || []).length > 0;
}

/**
 * Brengt één bewaard profiel naar het huidige model.
 *
 * v1 had één vrij tekstveld (`note`). Dat was in de praktijk het antwoord op
 * "wat herken ik hierin?", dus daar landt het. v2 kende nog geen gesprekken;
 * wat daar stond is simpelweg het gesprek dat nog loopt. Niets van wat iemand
 * heeft opgeschreven gaat verloren.
 */
function migrateEntry(entry) {
    const { note, ...rest } = entry || {};
    return {
        ...rest,
        notes: { ...EMPTY_NOTES, ...(entry?.notes || {}), ...(note ? { recognize: note } : {}) },
        pinned: Array.isArray(entry?.pinned) ? entry.pinned : [],
        conversations: Array.isArray(entry?.conversations) ? entry.conversations : [],
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

/**
 * Wie er wil weten dat er iets veranderd is. De tabbalk gebruikt dit voor het
 * getal bij "Gesprek": je prikt een inzicht vast op het profielscherm, en de
 * teller onderin moet dan meteen meelopen — anders zie je nooit dat je iets
 * aan het verzamelen bent.
 */
const listeners = new Set();

export function subscribe(fn) {
    listeners.add(fn);
    return () => listeners.delete(fn);
}

function write(state) {
    try {
        window.localStorage.setItem(KEY, JSON.stringify(state));
        listeners.forEach((fn) => fn());
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
        conversations: [],
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

/**
 * Rondt het lopende gesprek af: het krijgt de datum van vandaag, verhuist naar
 * de lijst afgeronde gesprekken en je begint met een leeg blad.
 *
 * Een leeg gesprek afronden doet niets — dan zou je een lege bladzijde met een
 * datum erop bewaren. Geeft terug of er echt iets is afgerond, zodat het scherm
 * weet of het iets te melden heeft.
 */
export function closeConversation(id) {
    const state = read();
    const entry = state.entries.find((e) => e.id === id);
    if (!entry || !heeftInhoud(entry.notes, entry.pinned)) return false;

    // Het nummer staat vast zodra het gesprek is afgerond. Zou het uit de
    // lengte van de lijst komen, dan schoof het hele rijtje op zodra het
    // oudste gesprek eraf valt — en dan heet je derde gesprek ineens je
    // tweede. `conversations` staat nieuwste-eerst, dus [0] heeft het hoogste.
    const eerder = entry.conversations || [];
    const afgerond = {
        id: makeId(),
        nummer: (eerder[0]?.nummer || eerder.length) + 1,
        closedAt: new Date().toISOString(),
        notes: { ...entry.notes },
        pinned: [...entry.pinned],
    };

    const entries = state.entries.map((e) =>
        e.id === id
            ? {
                ...e,
                notes: { ...EMPTY_NOTES },
                pinned: [],
                conversations: [afgerond, ...(e.conversations || [])].slice(
                    0,
                    MAX_CONVERSATIONS
                ),
            }
            : e
    );

    write({ ...state, entries });
    return true;
}

/** Valt er iets af te ronden? Het scherm verbergt de knop als dat niet zo is. */
export function hasOpenConversation(entry) {
    return heeftInhoud(entry?.notes, entry?.pinned);
}

/** Verwijdert één profiel uit de historie. */
export function deleteEntry(id) {
    const state = read();
    const entries = state.entries.filter((e) => e.id !== id);
    const currentId = state.currentId === id ? entries[0]?.id || null : state.currentId;
    return write({ version: VERSION, currentId, entries });
}

/**
 * Wist alles wat de app over je bewaart: profielen, antwoorden, vastgeprikte
 * inzichten, welk profiel je bekeek.
 *
 * `removeItem` in plaats van een lege staat wegschrijven — dan blijft er ook
 * geen skelet achter en is de sleutel daadwerkelijk weg van het toestel. Dat
 * is wat "verwijderen" hoort te betekenen.
 */
export function clearAll() {
    try {
        window.localStorage.removeItem(KEY);
        return true;
    } catch (_e) {
        return false;
    }
}

/** Hoeveel profielen er nu op het toestel staan (voor het privacyscherm). */
export function countEntries() {
    return read().entries.length;
}
