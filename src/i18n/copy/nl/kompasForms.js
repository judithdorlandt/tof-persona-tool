/**
 * kompasForms.js (NL) — teksten voor Module 3 · Strategisch Kompas:
 *   - het dashboard (TeamStrategic.jsx)
 *   - de intake-vragenlijst (StrategischKompasIntake.jsx)
 *   - de check na drie maanden (StrategischKompasReview.jsx)
 *   - de demo-payload die het dashboard toont als er nog geen eigen data is
 *     (src/utils/strategicKompas.js)
 *
 * LET OP — logica versus tekst:
 *   `field` in `intake.sections` en `review.questions` is een Supabase-sleutel.
 *   Die waarden zijn NOOIT vertaalbaar en moeten in elke taal identiek zijn,
 *   net als de sleutels in `demo.intake` / `demo.review`. Alleen de zichtbare
 *   labels en vragen veranderen per taal.
 */

const kompasForms = {
    // ── Dashboard (TeamStrategic) ────────────────────────────────────────────
    dashboard: {
        eyebrow: 'Module 3 · Strategisch Kompas',
        back: '← Terug',
        backToTool: '← Terug naar Persona Tool',
        thisOrganization: 'deze organisatie',
        defaultHorizon: '3–5 jaar',

        empty: {
            title: 'Nog geen kompas beschikbaar',
            leadBefore: 'Er is voor ',
            leadAfter: ' nog geen Strategisch Kompas opgesteld. Plan een verkenningsgesprek om het traject te starten.',
            cta: 'Plan een gesprek',
        },

        hero: {
            title: 'Het kompas voor',
            leadBefore:
                'Hoe de huidige persona-mix verhoudt zich tot acht externe trends — en wat dat vraagt van leiderschap, werkplek en samenwerking de komende ',
            leadAfter: '.',
        },

        meta: {
            horizon: 'Horizon',
            lastUpdate: 'Laatste herijking',
            nextReview: 'Volgende review',
        },

        trends: {
            eyebrow: '01 · Trend-radar',
            titleBefore: 'Acht externe trends, gewogen op ',
            titleAfter: '.',
            noteBefore: 'De top-trend voor dit team is ',
            noteAfter: '. Wat onderaan staat is niet weg — wel minder urgent voor déze persona-mix.',
        },

        overlay: {
            eyebrow: '02 · Persona-overlay',
            title: 'Wat de team-mix vraagt over drie tot vijf jaar.',
            ambitionLabel: 'Eigen ambitie · uit de intake',
            dominantLabel: 'Dominant aanwezig',
        },

        choices: {
            eyebrow: '03 · Strategische keuzes',
            title: 'Vijf richtingen voor MT en bestuur.',
        },

        jaarritme: {
            eyebrow: '04 · Jaarritme',
            title: 'Vier momenten om het kompas te herijken.',
        },
    },

    // ── Intake-vragenlijst ───────────────────────────────────────────────────
    intake: {
        eyebrow: 'Module 3 · Strategisch Kompas · Intake',
        title: 'De start van jullie',
        titleAccent: 'kompas',
        intro:
            'Deze vragenlijst is de start van jullie Strategisch Kompas. Jullie antwoorden vormen, ' +
            'samen met de persona-data uit Module 1 en 2 en de acht trends, de basis voor het ' +
            'ontwerpgesprek. Er volgt geen automatische uitslag — dit is input die we samen tot ' +
            'richting maken. Neem de tijd; eerlijke korte antwoorden zijn waardevoller dan volledige.',

        // `field` = Supabase-sleutel (niet vertalen). Volgorde en aantal secties
        // moeten in elke taal gelijk zijn.
        sections: [
            {
                eyebrow: '01',
                title: 'Organisatie en ambitie',
                field: 'ambition',
                questions: [
                    'Waar staat jullie organisatie nu, en waar moet het naartoe?',
                    'Wat is de aanleiding om dit traject nú te starten?',
                ],
            },
            {
                eyebrow: '02',
                title: 'De beweging die je wilt maken',
                field: 'movement',
                questions: [
                    'Welke beweging willen jullie de komende 3–5 jaar maken?',
                    'Wat is er al in gang gezet, en wat ontbreekt nog?',
                ],
            },
            {
                eyebrow: '03',
                title: 'MT en gedrag',
                field: 'mtBehaviour',
                questions: [
                    'Hoe loopt het in jullie MT — waar gaat het goed, waar stokt het?',
                    'Welk patroon keert terug in jullie samenwerking, en is nog niet hardop benoemd?',
                ],
            },
            {
                eyebrow: '04',
                title: 'Werkomgeving',
                field: 'workplace',
                questions: [
                    'Past jullie werkomgeving (fysiek en hybride) bij hoe jullie wíllen werken, of bij hoe het werd ingericht?',
                    'Waar werkt de omgeving jullie tegen?',
                ],
            },
            {
                eyebrow: '05',
                title: 'Richting voor 3–5 jaar',
                field: 'direction',
                questions: [
                    'Wat willen jullie over 3–5 jaar kunnen zeggen over deze periode?',
                    'Wat moet daarvoor nu in gang gezet worden?',
                ],
            },
        ],

        answerPlaceholder: 'Jullie antwoord…',

        closing: {
            eyebrow: 'Afsluiting',
            teamcodeLabel: 'Teamcode (verplicht)',
            teamcodeHint: 'Koppelt deze intake aan de persona-data van dezelfde organisatie.',
            teamcodePlaceholder: 'bijv. NIJ-BES-26-A8K2',
            filledByLabel: 'Naam en rol van de invuller',
            filledByPlaceholder: 'bijv. Sanne de Vries, MT-lid',
        },

        submit: 'Verstuur intake',
        submitting: 'Bezig met versturen…',
        cancel: 'Annuleer',

        errors: {
            teamcodeRequired: 'Vul een teamcode in — die koppelt deze intake aan jullie persona-data.',
            saveFailed: 'Opslaan mislukt. Probeer het later opnieuw.',
        },

        done: {
            eyebrow: 'Module 3 · Strategisch Kompas',
            title: 'Dank je.',
            body:
                'Jullie input is opgeslagen. Judith neemt hem door en combineert hem met jullie ' +
                'persona-data en de acht trends. In het ontwerpgesprek komt alles samen tot jullie kompas.',
            back: '← Terug naar Module 3',
        },
    },

    // ── Check na drie maanden ────────────────────────────────────────────────
    review: {
        eyebrow: 'Module 3 · Strategisch Kompas · Check na 3 maanden',
        title: 'Drie maanden',
        titleAccent: 'verder',
        intro: 'Drie maanden verder. Deze korte check kijkt wat er is veranderd, zodat het kompas meebeweegt.',

        // `field` = Supabase-sleutel (niet vertalen).
        questions: [
            {
                field: 'changed',
                question: 'Wat is er sinds de start veranderd — in de organisatie, in het MT, bij jou?',
            },
            {
                field: 'mixShift',
                question: 'Is de samenstelling van het team veranderd (nieuwe mensen, vertrek)? Zo ja, hoe?',
            },
            {
                field: 'choiceLanding',
                question: 'Welke keuze uit het kompas is nog niet echt gemaakt?',
            },
            {
                field: 'notes',
                question: 'Wat heeft de komende periode nodig?',
            },
        ],

        answerPlaceholder: 'Jullie antwoord…',

        closing: {
            eyebrow: 'Afsluiting',
            teamcodeLabel: 'Teamcode (verplicht)',
            teamcodeHint: 'Koppelt deze check aan jullie kompas.',
            teamcodePlaceholder: 'bijv. NIJ-BES-26-A8K2',
        },

        submit: 'Verstuur check',
        submitting: 'Bezig met versturen…',
        cancel: 'Annuleer',

        errors: {
            teamcodeRequired: 'Vul een teamcode in — die koppelt deze check aan jullie kompas.',
            saveFailed: 'Opslaan mislukt. Probeer het later opnieuw.',
        },

        done: {
            eyebrow: 'Module 3 · Strategisch Kompas',
            title: 'Dank je.',
            body: 'Jullie input is opgeslagen. Judith neemt hem door zodat het kompas meebeweegt.',
            back: '← Terug naar Module 3',
        },
    },

    // ── Demo-payload (Demo Team 3) ───────────────────────────────────────────
    // Alleen de TEKST. De ids en gewichten van de trends staan in
    // src/utils/strategicKompas.js; die zijn taalonafhankelijk en worden per
    // index aan `demo.trends` gekoppeld. Volgorde en lengte dus gelijk houden.
    demo: {
        team: 'Demo Team 3',
        horizon: '3–5 jaar',
        lastUpdate: 'mei 2026',
        nextReview: 'mei 2027',

        trends: [
            {
                name: 'Social based working',
                note: 'Met 42% teamspelers/verbinders/groeiers wordt verbinding niet door volume gedragen, maar door betekenisvolle ontmoeting.',
            },
            {
                name: 'Experience based working',
                note: 'Groeiers en teamspelers waarderen de werkplek op gevoel en kwaliteit van de dag — niet op stoel en bureau.',
            },
            {
                name: 'DEIB als ontwerp',
                note: 'De minderheid (denkers, zekerzoekers) bewaakt het ritme. Prikkelarme zones en voorspelbare structuur zijn ontwerpvraag, geen policy.',
            },
            {
                name: 'Van megacampus naar maatwerk',
                note: 'Hoge vraag naar samenwerk- en creatieve plekken, lage vraag naar hybride: het kompas wijst naar kleine, gerichte locaties.',
            },
            {
                name: 'Van aanwezigheid naar waarde',
                note: 'Dit team komt samen voor de ontmoeting — niet voor het aantal kantoor-dagen. Stuur op kwaliteit van samenkomst.',
            },
            {
                name: 'Servicerevolutie',
                note: 'Hospitality-omgeving past bij de waardering van beleving. Niet kritisch, wel versterkend.',
            },
            {
                name: 'Piekregie',
                note: 'Minder dominant voor dit team — sociale dynamiek weegt zwaarder dan kamelenweek-piek.',
            },
            {
                name: 'AI in de werkplek',
                note: 'Op afstand relevant: AI als stuurinstrument voor ritme-bewaking, niet als controle-tool.',
            },
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

        // Sleutels hieronder zijn Supabase jsonb-velden — nooit vertalen.
        intake: {
            submittedAt: 'mei 2026',
            filledBy: 'Demo Manager, MT-lid',
            teamcode: 'DEMO-TEAM-3',
            ambition: 'We willen van een uitvoerende organisatie naar een wendbare, lerende organisatie waarin teams meer eigen richting nemen.',
            movement: 'Van sturen op aanwezigheid naar sturen op waarde en verbinding — de komende drie tot vijf jaar.',
            mtBehaviour: 'Het MT beslist daadkrachtig, maar reflectie en het benoemen van onderliggende spanningen blijven achter.',
            workplace: 'De huidige werkomgeving is ingericht op vaste werkplekken; ons werk vraagt om meer ruimte voor ontmoeting en samenwerking.',
            direction: 'Over 3–5 jaar willen we kunnen zeggen dat verschillen in werkstijl een ontwerpkeuze zijn geworden, geen wrijving.',
        },

        review: {
            submittedAt: 'augustus 2026',
            changed: 'Het MT benoemt spanningen nu vaker hardop; in de organisatie is een eerste pilot met samenwerkplekken gestart.',
            mixShift: 'Twee nieuwe groeiers erbij, één denker vertrokken — de mix is iets beweeglijker geworden.',
            choiceLanding: 'De keuze om op kwaliteit van samenkomst te sturen in plaats van aanwezigheid is nog niet echt gemaakt.',
            notes: 'Behoefte aan een concreet ritme voor reflectie-momenten in het MT.',
        },
    },
};

export default kompasForms;
