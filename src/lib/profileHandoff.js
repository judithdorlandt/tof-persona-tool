/**
 * profileHandoff.js — hoe een profiel uit de app bij een team terechtkomt.
 *
 * De app bewaart alles op het toestel en stuurt zelf niets (zie
 * native/localStore.js en het privacyscherm). Toch wil iemand met een teamcode
 * zijn beeld kunnen inbrengen, want zonder de individuele profielen bestaat er
 * geen teaminzicht en daarboven geen organisatie-landschap.
 *
 * De app verstuurt daarom niet, maar overhandigt: ze bouwt een adres met het
 * profiel erin en opent dat in de systeembrowser. Op de website (Bijdragen.jsx)
 * ziet de gebruiker wat er in staat, vult zijn teamcode in en klikt pas dán op
 * versturen. Het versturen gebeurt dus in de browser, na een expliciete
 * handeling — de app blijft een app die niets uitstuurt.
 *
 * Twee keuzes die eruit volgen:
 *
 * - Het profiel zit in het HASH-deel van de URL (`#p=…`), niet in de query.
 *   Een hash wordt door de browser nooit meegestuurd naar de server, dus het
 *   profiel staat niet in de logs van de host en niet in statistieken. Met
 *   `?p=` zou het dat wel doen, en dan zou het "pas na jouw klik"-verhaal niet
 *   meer kloppen.
 * - Er gaat zo weinig mee als mogelijk: alleen de drie persona's en de acht
 *   scores. Geen naam, geen aantekeningen, geen antwoord op de open vraag, geen
 *   werkplekkeuzes. Dat is precies wat een teambeeld nodig heeft en niets meer.
 *
 * Omdat zo'n adres te typen, te delen en te bewerken is, vertrouwt `decode` de
 * inhoud niet: persona-id's moeten in ARCHETYPE_ORDER staan en scores moeten
 * getallen zijn. Alles wat daar niet aan voldoet levert `null` op, en dan toont
 * de website "er zit geen profiel in deze link" in plaats van rommel in de
 * database te zetten.
 */

import { ARCHETYPE_ORDER } from '../data';

/** Zodat een oudere app-versie met een nieuwere website kan blijven praten. */
const VERSION = 1;

/** De naam van de parameter in het hash-deel. */
const PARAM = 'p';

/** base64 waar `+`, `/` en `=` een URL niet in de weg zitten. */
function toBase64Url(json) {
    return window.btoa(json).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(value) {
    const base64 = value.replace(/-/g, '+').replace(/_/g, '/');
    return window.atob(base64);
}

function isArchetype(id) {
    return typeof id === 'string' && ARCHETYPE_ORDER.includes(id);
}

/**
 * Zet een afgerond profiel om in de inhoud voor het hash-deel.
 * Geeft `null` als er niets zinnigs in zit — dan heeft een link geen zin.
 */
export function encodeHandoff(result) {
    if (!result || !isArchetype(result.primary)) return null;

    // Alleen bekende persona's met een geldig getal; de rest valt weg.
    const scores = {};
    ARCHETYPE_ORDER.forEach((id) => {
        const score = result.scores?.[id];
        if (Number.isFinite(score)) scores[id] = score;
    });

    const payload = {
        v: VERSION,
        p: result.primary,
        s: isArchetype(result.secondary) ? result.secondary : null,
        t: isArchetype(result.tertiary) ? result.tertiary : null,
        sc: scores,
    };

    try {
        return toBase64Url(JSON.stringify(payload));
    } catch (_e) {
        return null;
    }
}

/**
 * Het volledige adres dat de app opent.
 *
 * `path` komt van de aanroeper (pagePath('bijdragen', lang)), zodat een
 * Engelse app bij de Engelse pagina uitkomt zonder dat dit bestand de
 * routetabel hoeft te kennen.
 */
export function handoffUrl(result, siteUrl, path) {
    const encoded = encodeHandoff(result);
    if (!encoded) return null;
    return `${String(siteUrl).replace(/\/+$/, '')}${path}#${PARAM}=${encoded}`;
}

/**
 * Leest het profiel terug uit een hash (`#p=…`).
 * Returnt `{ primary, secondary, tertiary, scores }` of `null`.
 */
export function decodeHandoff(hash) {
    const raw = String(hash || '').replace(/^#/, '');
    if (!raw) return null;

    const value = new URLSearchParams(raw).get(PARAM);
    if (!value) return null;

    let payload;
    try {
        payload = JSON.parse(fromBase64Url(value));
    } catch (_e) {
        return null;
    }

    if (!payload || payload.v !== VERSION || !isArchetype(payload.p)) return null;

    const scores = {};
    ARCHETYPE_ORDER.forEach((id) => {
        const score = payload.sc?.[id];
        if (Number.isFinite(score)) scores[id] = score;
    });
    // Een profiel zonder scores is geen profiel; het teambeeld rekent erop.
    if (Object.keys(scores).length === 0) return null;

    return {
        primary: payload.p,
        secondary: isArchetype(payload.s) ? payload.s : null,
        tertiary: isArchetype(payload.t) ? payload.t : null,
        scores,
    };
}
