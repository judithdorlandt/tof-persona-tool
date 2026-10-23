/**
 * copy.nl.js — Nederlandse tekstcontent voor Organisatie-Landschap PDF.
 *
 * Alle UI-tekst staat hier — pagina-builders importeren strings, geen hardcodes.
 * Zusterbestand: `copy.en.js` (IDENTIEKE sleutelstructuur). Resolver: `copy.js`.
 *
 * Lost op: maakt typo's traceerbaar op één plek (zoals 'resevering' → 'reservering'
 * uit fout #3 pagina 2).
 *
 * LET OP — font-beperking: de gebundelde Inter/Playfair zijn subsets ZONDER de
 * glyphs ≥ (U+2265) en ≤ (U+2264). Nooit gebruiken; drempels in woorden
 * uitschrijven. De tekens · – — é zitten wél in de subset.
 */

export const COPY_NL = {
    // ── Gedeeld
    brand: 'TOF · The Office Factory',

    // Label in de paginakop (pagina 2–6). Geen modulenummer: een opdrachtgever
    // kent de module-indeling niet (besluit Judith J1, 23 okt 2026).
    moduleLabel: 'ORGANISATIELANDSCHAP',

    // Bestand-suffix
    fileSuffix: 'organisatielandschap TOF',

    // ── Pagina 1 — TOF Brand cover
    brandCover: {
        tagline: 'Inzicht in werkstijlen en werkplek, voor de hele organisatie.',
        eyebrow: 'TOF PERSONA',
        kicker: 'Organisatielandschap',
        meta: (date, respondents, activeTeams, totalTeams) =>
            `${date}  ·  ${respondents} ${respondents === 1 ? 'ingevuld profiel' : 'ingevulde profielen'}  ·  ${activeTeams} van ${totalTeams} teams met ingevulde profielen`,
    },

    // ── Pagina 2 — Kerncijfers (kop + lead-eyebrow)
    hero: {
        title: 'Kerncijfers',
        leadEyebrow: 'WAT ZIE JE',
    },

    // ── Pagina 2 — Organisatielandschap cover & samenvatting
    cover: {
        kpiLabels: {
            respondents: 'Ingevulde profielen',
            dominantStyle: 'De grootste groep in de organisatie',
            // Opdracht L3 (besluit Judith 23 okt): de kern, geen percentage.
            topNeed: 'Wat de organisatie het meest nodig heeft',
        },
        // Fix #2 cover: schrijf eenheid + referentie volledig uit.
        kpiUnits: {
            // Besluit Judith 23 okt: geen "primair"; bij gelijke stand "elk".
            dominantStyle: (count, tie) => {
                if (!count) return '—';
                return tie
                    ? `elk ${count} mensen als eerste werkstijl`
                    : `${count} mensen met deze eerste werkstijl`;
            },
        },
        leadFallback:
            'Een geaggregeerd beeld van werkstijlen, spanning en werkplekbehoeftes — gebouwd uit de ingevulde profielen van teamleden.',
        // Redactie punt 7: de grootste groep, met hoofdletter; bij gelijke
        // stand meervoud.
        leadOneSentence: (org, names, n, tie) =>
            `${tie ? `De grootste groepen in ${org} zijn` : `De grootste groep in ${org} is`} ${names} — op basis van ${n} ${n === 1 ? 'ingevuld profiel' : 'ingevulde profielen'}.`,
        teamsWithoutResponses: {
            eyebrow: 'TEAMS ZONDER INGEVULDE PROFIELEN',
            note: (count) => (count === 1
                ? '1 team heeft nog geen ingevulde profielen en staat daarom niet in dit rapport.'
                : `${count} teams hebben nog geen ingevulde profielen en staan daarom niet in dit rapport.`),
        },
        // Leeswijzer "Over deze meting". De legenda gebruikt de trefwoorden van
        // de app (archetypes `kw`), zodat het rapport hetzelfde zegt als de app.
        measurement: {
            eyebrow: 'OVER DEZE METING',
            intro: 'Iedereen vult een korte vragenlijst in en krijgt een eerste, tweede en derde werkstijl. Dit rapport telt de eerste werkstijlen op tot een beeld per team en voor de hele organisatie. De acht werkstijlen:',
        },
    },

    // ── Pagina 2 — Werkstijl per team (heatmap)
    heatmap: {
        title: 'Werkstijl per team',
        subtitle:
            'Per team het aandeel van elke eerste werkstijl, in procenten, plus de organisatie als geheel.',
        cols: {
            team: 'Team',
            n: 'n',
            reliability: 'Betrouwbaarheid',
        },
        orgRowLabel: 'ORGANISATIE',
        // De gebundelde Inter/Playfair zijn subsets ZONDER ≥ (U+2265) / ≤ (U+2264)
        // — die glyphs renderen nooit, ongeacht italic/normaal. Daarom de drempels
        // in woorden i.p.v. wiskundige tekens; leest bovendien prettiger voor een
        // bestuurlijke lezer. (· – é zitten wél in de subset en blijven dus staan.)
        // Dezelfde schaal als de dashboards (getConfidence, opdracht L4).
        reliabilityHelp: 'Betrouwbaarheid: 5–15 profielen = opkomend patroon · 16–30 = betrouwbaar beeld · meer dan 30 = sterk patroon',
        // Fix #2 page 2: legenda-uitleg ipv arbitraire kleur.
        legend: {
            label: 'KLEURINTENSITEIT',
            explanation: 'Hoe sterker de kleur, hoe groter het aandeel binnen het team.',
            scaleLow: '0%',
            scaleHigh: '100%',
            // Redactie punt 22.
            cellEmpty: 'Lege cel: niemand met deze eerste werkstijl.',
        },
    },

    // ── Pagina 4 — Patronen organisatiebreed (kwantitatief)
    patronen: {
        title: 'Werkplekbehoefte van de organisatie',
        subtitle:
            'Wat de werkomgeving vraagt, en wat je in het kantoor kunt nagaan.',
        // ── Pagina 5 — Kwalitatief beeld
        qualTitle: 'Signalen uit observatie en gesprek',
        qualSubtitle:
            'Wat goed werkt en waar de spanning zit — opgehaald uit observatie en gesprekken.',
        cols: {
            // Vragen zoals in de team-PDF, geen beweringen over het kantoor.
            officeCheck: {
                title: 'Check in het kantoor',
            },
            // Het werkplekprofiel: kern, steun en beperkt nodig, geen percentages.
            vraagt: {
                title: 'Wat de werkomgeving vraagt',
            },
            werkt: {
                title: 'Wat werkt goed',
                empty: 'Nog geen observaties toegevoegd.',
            },
        },
        signalsBlock: {
            eyebrow: 'Kwalitatieve signalen',
        },
        // Fix #6 page 4: eigen kader voor methodologische noot.
        methodNoteEyebrow: 'METHODOLOGISCHE NOOT',
        // Kwantitatieve pagina: alleen de meet-herkomst.
        methodNote:
            'Gebaseerd op de eerste werkstijlen uit de ingevulde vragenlijsten. Het werkplekprofiel volgt uit die werkstijlen en zegt niets over het huidige kantoor.',
        // Kwalitatieve pagina: voorbehoud onderaan.
        qualCaveat:
            'Bron: observatie en gesprekken. Deze signalen duiden, ze bewijzen niet — verificatie in gesprek blijft nodig.',
    },

    // ── Pagina 4 — Duiding & richting
    duiding: {
        // Klein sage label in de paginakop.
        pageTitle: 'Duiding',
        title: 'Wat dit betekent',
        subtitle: 'Richting voor leiderschap en werkomgeving.',
        leadership: {
            title: 'Voor leiderschap',
            empty: 'Te weinig ingevulde profielen om richting te geven.',
        },
        environment: {
            title: 'Voor de werkomgeving',
            empty: 'Te weinig ingevulde profielen voor een beeld van de werkplek.',
        },
        attention: {
            title: 'Teams zonder eigen rij',
            empty: 'Elk team staat als eigen rij in het overzicht.',
        },
        tagline: 'Een organisatie die zichzelf herkent, beweegt sneller.',
    },

    // ── Afgeleide zinnen (organisatieAggregation.js bouwt hiermee de
    //    data-gedreven teksten; geen losse string-concatenatie in de logica).
    data: {
        orgRowLabel: 'ORGANISATIE',
        teamNameFallback: '—',
        // Alles zonder eigen rij samen (opdracht L1/L1b, besluit Judith 23 okt).
        otherTeamsRowLabel: (n) => `Overige (samen ${n})`,

        officeCheck: {
            enough: (label) => `Zijn er genoeg ${label}?`,
            used: (label) => `Worden de ${label} echt gebruikt?`,
        },

        // Redactie punt 9 / besluit J3: beschrijven, niet beweren. `drives` is
        // al samengevoegd ("Maken en ontwikkeling").
        signature: {
            none: 'Een organisatie in beweging.',
            one: (drive) => `${drive} is de sterkste drijfveer in deze meting.`,
            more: (drives) => `${drives} zijn de sterkste drijfveren in deze meting.`,
        },

        leadership: {
            // Redactie punt 8 / besluit J3: de grootste groep(en) via
            // dominantPersonas(), zonder percentages en zonder "primair".
            twoDrives: (names, drives) =>
                `De grootste groepen zijn ${names}, met ${drives} als drijfveer. Vraag in gesprek met teams of daar ruimte voor is, en wat het vraagt van de andere werkstijlen.`,
            oneDrive: (name, drive) =>
                `De grootste groep is ${name}, met ${drive} als drijfveer. Toets in gesprek of mensen met een andere werkstijl zich ook gezien voelen.`,
        },

        environment: {
            notEnoughData: 'Te weinig profielen voor een beeld van de werkplekbehoefte.',
            // Als vraag (besluit Judith 23 okt).
            focusQuestion: (labels) =>
                `Waar wil de organisatie de komende jaren op inzetten? Begin bij wat het meest nodig is: ${labels}.`,
        },

        attention: {
            noOwnRow: (x) => (x === 1
                ? '1 team staat niet als eigen rij in dit overzicht. Zo staat geen groep van minder dan vijf profielen apart in beeld. Het telt mee in “Overige” en in het totaal van de organisatie.'
                : `${x} teams staan niet als eigen rij in dit overzicht. Zo staat geen groep van minder dan vijf profielen apart in beeld. Ze tellen mee in “Overige” en in het totaal van de organisatie.`),
            // Zonder rij "Overige" (besluit Judith 23 okt).
            noOwnRowNoRest: (x) => (x === 1
                ? '1 team staat niet als eigen rij in dit overzicht. Zo staat geen groep van minder dan vijf profielen apart in beeld. Het telt mee in het totaal van de organisatie.'
                : `${x} teams staan niet als eigen rij in dit overzicht. Zo staat geen groep van minder dan vijf profielen apart in beeld. Ze tellen mee in het totaal van de organisatie.`),
        },
    },

    // ── Persona-namen worden uit constants.getArchetypeName(id, lang) getrokken.
};
