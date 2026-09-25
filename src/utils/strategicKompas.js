/**
 * strategicKompas.js — data-laag voor Module 3
 *
 * Eén shape voor alles wat het Strategisch Kompas-dashboard laat zien
 * voor een organisatie. Vandaag: demo-data voor Demo Team 3.
 * Morgen: payload uit Supabase per organisatie.
 *
 * TWEETALIG: alle zichtbare tekst van de demo-payload staat in de
 * i18n-namespace `kompasForms.demo` (nl/en). Hier blijft alleen de
 * taalonafhankelijke LOGICA staan: trend-ids en hun gewicht. Tekst en
 * gewichten worden per index aan elkaar gekoppeld, dus de volgorde van
 * `demo.trends` in de copy-bestanden moet gelijk blijven aan DEMO_TREND_METRICS.
 *
 * Shape:
 *   {
 *     organization,             // 'TOF'
 *     team,                     // 'Demo Team 3'
 *     horizon,                  // '3–5 jaar'
 *     lastUpdate,               // 'mei 2026'
 *     nextReview,               // 'mei 2027'
 *     trends: [                 // 8 trends gewogen (0–100)
 *       { id, name, weight, note }
 *     ],
 *     personaOverlay: {
 *       dominant: [],           // dominante persona's
 *       insights: []            // 2–4 korte regels
 *     },
 *     choices: [                // 4–7 strategische keuzes
 *       { axis, title, body }
 *     ],
 *     jaarritme: [
 *       { moment, activity }
 *     ],
 *
 *     // ── Kwalitatieve input uit Module 3 (open antwoorden, geen scores) ──
 *     // Wordt door Judith gelezen en in het ontwerpgesprek tot weging en
 *     // keuzes gemaakt. GEEN automatische uitslag of trend-scores.
 *     intake: {
 *       submittedAt,    // 'mei 2026'
 *       filledBy,       // naam en rol invuller
 *       teamcode,       // koppelt aan de persona-data van dezelfde organisatie
 *       ambition,       // organisatie en ambitie
 *       movement,       // de beweging die ze willen maken
 *       mtBehaviour,    // MT en gedrag
 *       workplace,      // werkomgeving
 *       direction,      // richting 3–5 jaar
 *     },
 *     review: {         // na 3 maanden, zelfde idee, korter
 *       submittedAt,
 *       changed,        // wat is veranderd
 *       mixShift,       // is de team-samenstelling/persona-mix verschoven
 *       choiceLanding,  // welke keuze is nog niet gemaakt / hoe landen ze
 *       notes,
 *     }
 *   }
 *
 * De sleutels van `intake` en `review` zijn Supabase jsonb-veldnamen. Ze zijn
 * taalonafhankelijk en veranderen NOOIT — alleen de waarden zijn vertaald.
 *
 * Helpers:
 *   getStrategicKompas(organization?, lang?) → bovenstaande shape of null
 *   EMPTY_INTAKE / EMPTY_REVIEW              → lege shape-skeletten voor de formulieren
 */

import { getCopy } from '../i18n/copy';

// ─── DEMO DATA — Demo Team 3 (TOF) ───────────────────────────────────────────
// Taalonafhankelijk deel: trend-id + gewicht. De bijbehorende naam en duiding
// komen per index uit kompasForms.demo.trends.

const DEMO_TREND_METRICS = [
    { id: '05', weight: 95 },
    { id: '01', weight: 85 },
    { id: '04', weight: 80 },
    { id: '07', weight: 75 },
    { id: '02', weight: 70 },
    { id: '06', weight: 65 },
    { id: '03', weight: 55 },
    { id: '08', weight: 40 },
];

// Organisaties die (voorlopig) op de demo-payload uitkomen.
const DEMO_ORGS = ['tof', 'demo', 'demo team 3', 'the office factory'];

// ─── SHAPE-SKELETTEN — gebruikt door de Module 3-formulieren ─────────────────
// Eén bron van waarheid: de intake- en review-formulieren bouwen hun payload
// op basis van deze skeletten, zodat de opgeslagen vorm exact de shape volgt.
// Deze sleutels zijn Supabase-veldnamen en blijven in elke taal identiek.

export const EMPTY_INTAKE = {
    submittedAt: '',
    filledBy: '',
    teamcode: '',
    ambition: '',
    movement: '',
    mtBehaviour: '',
    workplace: '',
    direction: '',
};

export const EMPTY_REVIEW = {
    submittedAt: '',
    changed: '',
    mixShift: '',
    choiceLanding: '',
    notes: '',
};

// Bouwt de demo-payload in de gevraagde taal.
function buildDemoTeam3(lang) {
    const demo = getCopy(lang)?.kompasForms?.demo || {};
    const trendCopy = Array.isArray(demo.trends) ? demo.trends : [];

    return {
        organization: 'TOF',
        team: demo.team || '',
        horizon: demo.horizon || '',
        lastUpdate: demo.lastUpdate || '',
        nextReview: demo.nextReview || '',

        trends: DEMO_TREND_METRICS.map((metric, i) => ({
            id: metric.id,
            weight: metric.weight,
            name: trendCopy[i]?.name || '',
            note: trendCopy[i]?.note || '',
        })),

        personaOverlay: {
            dominant: demo.personaOverlay?.dominant || [],
            insights: demo.personaOverlay?.insights || [],
        },

        choices: demo.choices || [],
        jaarritme: demo.jaarritme || [],

        intake: { ...EMPTY_INTAKE, ...(demo.intake || {}) },
        review: { ...EMPTY_REVIEW, ...(demo.review || {}) },
    };
}

// ─── PUBLIC API ──────────────────────────────────────────────────────────────

/**
 * Haal het kompas op voor een organisatie. Probeert eerst Supabase
 * (later, zie #SUPABASE block onderin), valt terug op demo-data.
 *
 * Synchronous voor nu — async wanneer Supabase erbij komt.
 *
 * @param {string} [organization] — organisatienaam
 * @param {'nl'|'en'} [lang='nl'] — taal van de zichtbare tekst
 */
export function getStrategicKompas(organization, lang = 'nl') {
    const key = (organization || '').trim().toLowerCase();
    if (key && DEMO_ORGS.includes(key)) return buildDemoTeam3(lang);
    // Default: laat Demo Team 3 zien zodat het dashboard altijd iets toont
    // (voor klanten zonder eigen payload).
    return buildDemoTeam3(lang);
}

// =============================================================================
// SUPABASE — toekomstige uitbreiding (nog niet actief)
// =============================================================================
// Wanneer we het kompas-per-organisatie in Supabase gaan opslaan:
//
// 1. Tabel toevoegen: `strategic_kompas` met kolommen
//      organization (text, PK)
//      payload (jsonb)             ← exact dezelfde shape als hierboven
//      updated_at (timestamptz)
//      next_review (date)
//
// 2. Hieronder een async fetcher implementeren:
//
//      export async function fetchStrategicKompas(organization) {
//          const { data } = await supabase
//              .from('strategic_kompas')
//              .select('payload')
//              .eq('organization', organization)
//              .maybeSingle();
//          return data?.payload || null;
//      }
//
// 3. Component aanpassen om eerst fetchStrategicKompas() te proberen,
//    en bij null terug te vallen op getStrategicKompas() (demo-data).
//
// Voor nu: alleen statische demo-data.
