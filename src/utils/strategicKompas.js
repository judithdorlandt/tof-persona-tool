/**
 * strategicKompas.js — data-laag voor Module 3
 *
 * Eén shape voor alles wat het Strategisch Kompas-dashboard laat zien
 * voor een organisatie. Vandaag: hardcoded demo-data voor Demo Team 3.
 * Morgen: payload uit Supabase per organisatie.
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
 *     ]
 *   }
 *
 * Helper:
 *   getStrategicKompas(organization?) → bovenstaande shape of null
 *
 *   Nu probeert hij eerst een match op organization-name uit DEMO_DATA.
 *   Later kan dit een Supabase-fetch worden (zie SUPABASE-block onderin).
 */

// ─── DEMO DATA — Demo Team 3 (TOF) ───────────────────────────────────────────

const DEMO_TEAM_3 = {
    organization: 'TOF',
    team: 'Demo Team 3',
    horizon: '3–5 jaar',
    lastUpdate: 'mei 2026',
    nextReview: 'mei 2027',

    trends: [
        { id: '05', name: 'Social based working', weight: 95, note: 'Met 42% teamspelers/verbinders/groeiers wordt verbinding niet door volume gedragen, maar door betekenisvolle ontmoeting.' },
        { id: '01', name: 'Experience based working', weight: 85, note: 'Groeiers en teamspelers waarderen de werkplek op gevoel en kwaliteit van de dag — niet op stoel en bureau.' },
        { id: '04', name: 'DEIB als ontwerp', weight: 80, note: 'De minderheid (denkers, zekerzoekers) bewaakt het ritme. Prikkelarme zones en voorspelbare structuur zijn ontwerpvraag, geen policy.' },
        { id: '07', name: 'Van megacampus naar maatwerk', weight: 75, note: 'Hoge vraag naar samenwerk- en creatieve plekken, lage vraag naar hybride: het kompas wijst naar kleine, gerichte locaties.' },
        { id: '02', name: 'Van aanwezigheid naar waarde', weight: 70, note: 'Dit team komt samen voor de ontmoeting — niet voor het aantal kantoor-dagen. Stuur op kwaliteit van samenkomst.' },
        { id: '06', name: 'Servicerevolutie', weight: 65, note: 'Hospitality-omgeving past bij de waardering van beleving. Niet kritisch, wel versterkend.' },
        { id: '03', name: 'Piekregie', weight: 55, note: 'Minder dominant voor dit team — sociale dynamiek weegt zwaarder dan kamelenweek-piek.' },
        { id: '08', name: 'AI in de werkplek', weight: 40, note: 'Op afstand relevant: AI als stuurinstrument voor ritme-bewaking, niet als controle-tool.' },
    ],

    personaOverlay: {
        dominant: ['Groeier', 'Teamspeler', 'Vernieuwer'],
        insights: [
            'Beweeglijk team met sociale draagkracht — 42% leunt op verbinding en ontwikkeling.',
            'Drie spanningen vragen om ontwerp, niet om reparatie: tempo/verbinding, vrijheid/zekerheid, diepgang/tempo.',
            'De minderheid (denkers, zekerzoekers, één verbinder) bewaakt het ritme — koester die kleine groep.',
        ],
    },

    choices: [
        {
            axis: 'Leiderschap',
            title: 'Bouw ritme in, niet meer tempo',
            body: 'Drie spanningen draaien om hetzelfde: dit team kan tempo aan, maar niet zonder kaders. Maak ritme-momenten expliciet — wanneer reflectie, wanneer beslissen, wanneer leveren.',
        },
        {
            axis: 'Werkplek',
            title: 'Klein, sociaal, dichtbij',
            body: 'Hoge vraag naar samenwerk- en creatieve plekken, lage vraag naar hybride. Investeer in kleinere, gerichte locaties met sterke sociale architectuur — niet in een groot centraal hoofdkantoor.',
        },
        {
            axis: 'Cultuur',
            title: 'Maak verschillen ontwerpvraag, geen probleem',
            body: 'Benoem de drie spanningen actief in MT-meetings als ontwerpvragen. Wie heeft welk ritme nodig, en hoe vertaalt zich dat in afspraken, kantooromgeving en samenwerking?',
        },
        {
            axis: 'Technologie',
            title: 'AI als stuurinstrument voor ritme',
            body: 'Gebruik AI om beleving, frictie en effectiviteit continu te meten — niet om medewerkers te controleren, maar om de minderheid te beschermen en het ritme bij te sturen.',
        },
        {
            axis: 'Samenwerking',
            title: 'Sociale architectuur in plaats van bezetting',
            body: 'Stuur niet op aanwezigheid maar op kwaliteit van samenkomen. Plan rituelen — geen vergaderingen — voor de momenten waarop dit team energie ophaalt.',
        },
    ],

    jaarritme: [
        { moment: 'Q1', activity: 'Kompas-herijking met MT — trends opnieuw wegen, keuzes evalueren.' },
        { moment: 'Q2', activity: 'Tussentijdse persona-check — nieuwe mensen erbij? Mix verschoven?' },
        { moment: 'Q3', activity: 'Werkplek-evaluatie — wat heeft sociale architectuur opgeleverd?' },
        { moment: 'Q4', activity: 'Trends-update + jaaroverzicht — nieuw kompas voor volgend jaar.' },
    ],
};

// Mapping organization-name → kompas. Hardcoded voor nu.
const DEMO_INDEX = {
    'tof': DEMO_TEAM_3,
    'demo': DEMO_TEAM_3,
    'demo team 3': DEMO_TEAM_3,
    'the office factory': DEMO_TEAM_3,
};

// ─── PUBLIC API ──────────────────────────────────────────────────────────────

/**
 * Haal het kompas op voor een organisatie. Probeert eerst Supabase
 * (later, zie #SUPABASE block onderin), valt terug op demo-data.
 *
 * Synchronous voor nu — async wanneer Supabase erbij komt.
 */
export function getStrategicKompas(organization) {
    const key = (organization || '').trim().toLowerCase();
    if (key && DEMO_INDEX[key]) return DEMO_INDEX[key];
    // Default: laat Demo Team 3 zien zodat het dashboard altijd iets toont
    // (voor klanten zonder eigen payload).
    return DEMO_TEAM_3;
}

// =============================================================================
// SUPABASE — toekomstige uitbreiding (nog niet actief)
// =============================================================================
// Wanneer we het kompas-per-organisatie in Supabase gaan opslaan:
//
// 1. Tabel toevoegen: `strategic_kompas` met kolommen
//      organization (text, PK)
//      payload (jsonb)             ← exact dezelfde shape als DEMO_TEAM_3
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
