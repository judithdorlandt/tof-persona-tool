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
    pillLabel: 'ORGANISATIELANDSCHAP',
    dateLocale: 'nl-NL',

    // Module-label in de paginakop (pagina 2–5) en op de cover.
    moduleLabel: 'MODULE 3 · ORGANISATIELANDSCHAP',

    // Bestand-suffix
    fileSuffix: 'organisatie-landschap TOF',

    // ── Pagina 1 — TOF Brand cover
    brandCover: {
        title: 'The Office Factory',
        tagline: 'Inzicht in werkstijl, teamdynamiek en werkplek.',
        eyebrow: 'MODULE 3 · ORGANISATIELANDSCHAP',
        kicker: 'Organisatielandschap',
        meta: (date, respondents, activeTeams, totalTeams) =>
            `${date}  ·  ${respondents} ${respondents === 1 ? 'respondent' : 'respondenten'}  ·  ${activeTeams}/${totalTeams} teams met data`,
    },

    // ── Pagina 2 — Kerncijfers (kop + lead-eyebrow)
    hero: {
        title: 'Kerncijfers',
        leadEyebrow: 'WAT ZIE JE',
    },

    // ── Pagina 2 — Organisatielandschap cover & samenvatting
    cover: {
        eyebrow: 'ORGANISATIELANDSCHAP',
        kicker: 'Rapport',
        titlePrefix: '',
        subtitle: 'Werkstijlen, patronen en richting',
        kpiLabels: {
            respondents: 'Respondenten',
            dominantStyle: 'De grootste groep in de organisatie:',
            // Opdracht L3 (besluit Judith 23 okt): de kern, geen percentage.
            topNeed: 'Wat de organisatie het meest nodig heeft',
            teamsCovered: 'Teams met data',
        },
        // Fix #2 cover: schrijf eenheid + referentie volledig uit.
        kpiUnits: {
            respondents: (n) => n === 1 ? 'persoon' : 'personen',
            dominantStyle: (count) => count ? `${count} mensen primair` : '—',
        },
        leadIntro: 'Wat zie je in dit rapport',
        leadFallback:
            'Een geaggregeerd beeld van werkstijlen, spanning en werkplekbehoeftes — gebouwd uit de individuele responses van teamleden.',
        leadOneSentence: (org, dominant, n) =>
            `${org} laat zich in deze meting het sterkst herkennen in ${dominant.toLowerCase()} — op basis van ${n} ${n === 1 ? 'respondent' : 'respondenten'}.`,
        teamsWithoutResponses: {
            eyebrow: 'TEAMS ZONDER RESPONS',
            empty: 'Alle teams hebben gereageerd.',
            note: (count) =>
                `${count} ${count === 1 ? 'team heeft' : 'teams hebben'} nog geen respons ingestuurd. Deze ontbreken in de heatmap en patronen.`,
        },
        // Leeswijzer-blok dat de vrijgekomen ruimte vult wanneer alle teams
        // hebben gereageerd. Legenda-omschrijvingen afgeleid van de drijfveren.
        measurement: {
            eyebrow: 'OVER DEZE METING',
            intro: 'Iedereen vult een korte vragenlijst in en krijgt een eerste, tweede en derde werkstijl. Dit rapport telt de eerste werkstijlen op tot een beeld per team en voor de hele organisatie. De acht werkstijlen:',
            // Keyed op archetype-id; builder koppelt aan ARCHETYPE_NAME.
            legend: {
                maker: 'maakt graag iets tastbaars af',
                groeier: 'zoekt groei en nieuwe vaardigheden',
                presteerder: 'stuurt op doelen en resultaat',
                denker: 'zoekt rust, diepgang en concentratie',
                verbinder: 'brengt mensen en samenwerking bij elkaar',
                teamspeler: 'hecht aan een betrouwbaar, hecht team',
                zekerzoeker: 'houdt van structuur en zekerheid',
                vernieuwer: 'bedenkt nieuwe wegen en ideeën',
            },
        },
    },

    // ── Pagina 2 — Werkstijl per team (heatmap)
    heatmap: {
        eyebrow: 'PAGINA 2 — WERKSTIJL PER TEAM',
        title: 'Werkstijl per team',
        subtitle:
            'De verdeling van werkstijlen binnen elk team, plus de organisatie als geheel.',
        cols: {
            team: 'Team',
            n: 'n',
            reliability: 'Betrouwbaarheid',
        },
        orgRowLabel: 'ORGANISATIE',
        orgRowReliability: 'n.v.t.',  // fix #6 page 2 — vervangt zachte em-dash
        // De gebundelde Inter/Playfair zijn subsets ZONDER ≥ (U+2265) / ≤ (U+2264)
        // — die glyphs renderen nooit, ongeacht italic/normaal. Daarom de drempels
        // in woorden i.p.v. wiskundige tekens; leest bovendien prettiger voor een
        // bestuurlijke lezer. (· – é zitten wél in de subset en blijven dus staan.)
        // Dezelfde schaal als de dashboards (getConfidence, opdracht L4).
        reliabilityHelp: '5–15 = opkomend patroon · 16–30 = betrouwbaar beeld · meer dan 30 = sterk patroon',
        // Fix #5 page 2: rij-totalen kunnen door afronding op 99–101% uitkomen.
        roundingNote: 'Rij-totalen kunnen door afronding optellen tot 99–101%.',
        // Fix #2 page 2: legenda-uitleg ipv arbitraire kleur.
        legend: {
            label: 'KLEURINTENSITEIT',
            explanation: 'Hoe sterker de kleur, hoe groter het aandeel binnen het team.',
            scaleLow: '0%',
            scaleHigh: '100%',
            cellZero: 'Gemeten 0%',
            cellEmpty: 'Niet aanwezig',
        },
    },

    // ── Pagina 4 — Patronen organisatiebreed (kwantitatief)
    patronen: {
        eyebrow: 'PAGINA 4 — PATRONEN',
        title: 'Patronen in de organisatie',
        subtitle:
            'Wat de werkomgeving vraagt, en wat je in het kantoor kunt nagaan.',
        // ── Pagina 5 — Kwalitatief beeld
        qualEyebrow: 'PAGINA 5 — KWALITATIEF BEELD',
        qualTitle: 'Signalen uit observatie en gesprek',
        qualSubtitle:
            'Wat goed werkt en waar de spanning zit — opgehaald uit observatie en gesprekken.',
        cols: {
            // Vragen zoals in de team-PDF, geen beweringen over het kantoor.
            officeCheck: {
                title: 'Check in het kantoor',
                subtitle: 'Vragen om in het eigen kantoor na te gaan.',
            },
            // Het werkplekprofiel: kern, steun en beperkt nodig, geen percentages.
            vraagt: {
                title: 'Wat de werkomgeving vraagt',
                subtitle: 'Van meest naar minder nodig, zonder percentages.',
            },
            werkt: {
                title: 'Wat werkt goed',
                subtitle: 'Wat de organisatie staande houdt.',
                empty: 'Nog geen observaties toegevoegd.',
            },
        },
        signalsBlock: {
            eyebrow: 'Kwalitatieve signalen',
            source: 'Bron: observatie en gesprekken (geen meting).',
        },
        // Fix #6 page 4: eigen kader voor methodologische noot.
        methodNoteEyebrow: 'METHODOLOGISCHE NOOT',
        // Kwantitatieve pagina: alleen de meet-herkomst.
        methodNote:
            'Data uit de persona-vragenlijst — kwantitatief, n = aantal respondenten per categorie.',
        // Kwalitatieve pagina: voorbehoud onderaan.
        qualCaveat:
            'Bron: observatie en gesprekken. Deze signalen duiden, ze bewijzen niet — verificatie in gesprek blijft nodig.',
    },

    // ── Pagina 4 — Duiding & richting
    duiding: {
        eyebrow: 'PAGINA 4 — DUIDING',
        // Klein sage label in de paginakop.
        pageTitle: 'Duiding',
        title: 'Wat dit betekent',
        subtitle: 'Richting voor leiderschap en werkomgeving.',
        leadership: {
            title: 'Voor leiderschap',
            subtitle: 'Wat verdient aandacht in gesprek met teams.',
            empty: 'Te weinig data om scherpe richting te geven.',
        },
        environment: {
            title: 'Voor de werkomgeving',
            subtitle: 'Waar het gesprek over de werkplek kan beginnen.',
            empty: 'Te weinig data voor onderbouwde keuzes.',
        },
        attention: {
            title: 'Teams zonder eigen rij',
            subtitle: 'Waarom niet elk team apart in het overzicht staat.',
            empty: 'Alle teams hebben voldoende data voor analyse.',
        },
        tagline: 'Een organisatie die zichzelf herkent, beweegt sneller.',
    },

    // ── Afgeleide zinnen (organisatieAggregation.js bouwt hiermee de
    //    data-gedreven teksten; geen losse string-concatenatie in de logica).
    data: {
        dateLocale: 'nl-NL',
        orgRowLabel: 'ORGANISATIE',
        teamNameFallback: '—',
        // Alles zonder eigen rij samen (opdracht L1/L1b, besluit Judith 23 okt).
        otherTeamsRowLabel: (n) => `Overige (samen ${n})`,

        officeCheck: {
            enough: (label) => `Zijn er genoeg ${label}?`,
            used: (label) => `Worden de ${label} echt gebruikt?`,
        },

        signature: {
            none: 'Een organisatie in beweging.',
            one: (drive) => `${drive} — daar bouwt deze organisatie op.`,
            two: (driveA, driveB) =>
                `${driveA} en ${driveB} — daar bouwt deze organisatie op.`,
        },

        leadership: {
            twoDrives: (a, b) =>
                `Twee drijfveren springen eruit: ${a.drive} (${a.label}) en ${b.drive} (${b.label}). Maak ruimte voor beide — onderdruk geen van twee.`,
            oneDrive: (a) =>
                `De dominante drijfveer is ${a.drive} (${a.label}). Toets in gesprek of teams met andere drijfveren zich nog gezien voelen.`,
            // Naam + optioneel aandeel, zoals getoond tussen haakjes.
            personaLabel: (name, pct) =>
                pct != null ? `${name}, ${pct}% primair` : name,
            lowReliability: (n) =>
                `${n} teams hebben te weinig respons voor harde uitspraken. Verdiep in gesprek voordat je beleid maakt.`,
        },

        environment: {
            notEnoughData: 'Te weinig profielen voor een beeld van de werkplekbehoefte.',
            // Als vraag (besluit Judith 23 okt).
            focusQuestion: (labels) =>
                `Waar wil de organisatie de komende jaren op inzetten? Begin bij wat het meest nodig is: ${labels}.`,
        },

        attention: {
            noOwnRow: (x) => (x === 1
                ? '1 team staat niet als eigen rij in dit overzicht. Zo blijft niemand herleidbaar. Het telt mee in "Overige" en in het totaal van de organisatie.'
                : `${x} teams staan niet als eigen rij in dit overzicht. Zo blijft niemand herleidbaar. Ze tellen mee in "Overige" en in het totaal van de organisatie.`),
            // Zonder rij "Overige" (besluit Judith 23 okt).
            noOwnRowNoRest: (x) => (x === 1
                ? '1 team staat niet als eigen rij in dit overzicht. Zo blijft niemand herleidbaar. Het telt mee in het totaal van de organisatie.'
                : `${x} teams staan niet als eigen rij in dit overzicht. Zo blijft niemand herleidbaar. Ze tellen mee in het totaal van de organisatie.`),
        },
    },

    // ── Persona-namen worden uit constants.getArchetypeName(id, lang) getrokken.
};
