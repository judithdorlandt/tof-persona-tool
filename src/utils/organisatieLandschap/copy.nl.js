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
    pillLabel: 'ORGANISATIE-LANDSCHAP',
    dateLocale: 'nl-NL',

    // Module-label in de paginakop (pagina 2–5) en op de cover.
    moduleLabel: 'MODULE 1 · INSIGHTS',

    // Bestand-suffix
    fileSuffix: 'organisatie-landschap TOF',

    // ── Pagina 1 — TOF Brand cover
    brandCover: {
        title: 'The Office Factory',
        tagline: 'Inzicht in werkstijl, teamdynamiek en werkplek.',
        eyebrow: 'MODULE 1 · INSIGHTS',
        kicker: 'Organisatie-landschap',
        meta: (date, respondents, activeTeams, totalTeams) =>
            `${date}  ·  ${respondents} ${respondents === 1 ? 'respondent' : 'respondenten'}  ·  ${activeTeams}/${totalTeams} teams met data`,
    },

    // ── Pagina 2 — Kerncijfers (kop + lead-eyebrow)
    hero: {
        title: 'Kerncijfers',
        leadEyebrow: 'WAT ZIE JE',
    },

    // ── Pagina 2 — Organisatie-landschap cover & samenvatting
    cover: {
        eyebrow: 'ORGANISATIE-LANDSCHAP',
        kicker: 'Rapport',
        titlePrefix: '',
        subtitle: 'Werkstijlen, patronen en richting',
        kpiLabels: {
            respondents: 'Respondenten',
            dominantStyle: 'Dominante werkstijl',
            topNeed: 'Grootste werkplekvraag',
            teamsCovered: 'Teams met data',
        },
        // Fix #2 cover: schrijf eenheid + referentie volledig uit.
        kpiUnits: {
            respondents: (n) => n === 1 ? 'persoon' : 'personen',
            dominantStyle: (count) => count ? `${count} mensen primair` : '—',
            topNeed: (pct) => `${pct}% van álle werkplek-voorkeur`,
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
            intro: 'Elke respondent vult een korte vragenlijst in en krijgt één dominante werkstijl. Dit rapport telt die werkstijlen op tot een beeld per team en voor de hele organisatie. De acht werkstijlen:',
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
        // Respondenten zonder team-koppeling — expliciet zichtbaar zodat het
        // organisatietotaal en de som van de teamrijen op elkaar aansluiten.
        unlinkedRowLabel: 'Niet aan een team gekoppeld',
        unlinkedNote: (n) =>
            `${n} ${n === 1 ? 'respondent telt' : 'respondenten tellen'} mee in het organisatietotaal, maar ${n === 1 ? 'is' : 'zijn'} niet aan een specifiek team gekoppeld. Daardoor sluit de som van de teamrijen aan op het totaal.`,
        // Lage betrouwbaarheid: celkleur gedempt zodat één respondent niet als
        // "harde" 100% leest.
        lowReliabilityNote: 'Bij lage betrouwbaarheid is de celkleur gedempt — bij een enkele respondent kan één keuze al 100% vormen.',
        // De gebundelde Inter/Playfair zijn subsets ZONDER ≥ (U+2265) / ≤ (U+2264)
        // — die glyphs renderen nooit, ongeacht italic/normaal. Daarom de drempels
        // in woorden i.p.v. wiskundige tekens; leest bovendien prettiger voor een
        // bestuurlijke lezer. (· – é zitten wél in de subset en blijven dus staan.)
        reliabilityHelp: 'minder dan 5 = laag · 5–9 = midden · 10 of meer = hoog',
        // Labels achter de betrouwbaarheids-dot per rij (keyed op dot-id).
        reliabilityLabels: {
            laag: 'Laag',
            midden: 'Midden',
            hoog: 'Hoog',
        },
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
            'Wat de werkomgeving vraagt, en waar de organisatie op leegloopt — gemeten in de data.',
        // ── Pagina 5 — Kwalitatief beeld
        qualEyebrow: 'PAGINA 5 — KWALITATIEF BEELD',
        qualTitle: 'Signalen uit observatie en gesprek',
        qualSubtitle:
            'Wat goed werkt en waar de spanning zit — opgehaald uit observatie en gesprekken.',
        cols: {
            leegloopt: {
                title: 'Waar de organisatie op leegloopt',
                subtitle: 'Spanning en frictie zichtbaar in de data.',
            },
            vraagt: {
                title: 'Wat de werkomgeving vraagt',
                subtitle: 'Top-5 werkplek-typen, als aandeel van álle voorkeur.',
                scaleLabel: 'Aandeel in voorkeur',
                spreadNote: 'De verschillen zijn klein: lees dit als een brede, gespreide behoefte — geen enkel type wint.',
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
            title: 'Voor de werkomgeving (3–5 jaar)',
            subtitle: 'Waar de werkplek-investeringen het meest renderen.',
            empty: 'Te weinig data voor onderbouwde keuzes.',
        },
        attention: {
            title: 'Teams die ruimte verdienen',
            subtitle: 'Lage respons of weinig zichtbaarheid in de data.',
            empty: 'Alle teams hebben voldoende data voor analyse.',
            // Verwijzing onderaan de kaart wanneer niet alle teams passen.
            moreOnNext: (n) =>
                `Nog ${n} ${n === 1 ? 'team' : 'teams'} — zie volgende pagina`,
        },
        // Vervolgpagina wanneer de teams-lijst niet in de kaart past.
        continuationSubtitle:
            'Vervolg — overige teams die aandacht verdienen.',
        tagline: 'Een organisatie die zichzelf herkent, beweegt sneller.',
    },

    // ── Afgeleide zinnen (organisatieAggregation.js bouwt hiermee de
    //    data-gedreven teksten; geen losse string-concatenatie in de logica).
    data: {
        dateLocale: 'nl-NL',
        orgRowLabel: 'ORGANISATIE',
        teamNameFallback: '—',

        // Werkplektype-labels komen uit de aggregatie in het Nederlands.
        // In NL laten we ze ongemoeid; copy.en.js vertaalt ze.
        workplaceLabel: (label) => label,

        leeglopers: {
            tooLittle: (label) => `Te weinig ${label}`,
            tooMuch: (label) => `Te veel ${label}`,
            tension: (label) => `Spanning tussen ${label}`,
            // Keyed op een taalneutrale id; de logica kiest het paar.
            tensionPairs: {
                tempoZorgvuldigheid: 'tempo en zorgvuldigheid',
                resultaatVerbinding: 'resultaat en verbinding',
                vrijheidZekerheid: 'vrijheid en zekerheid',
                vernieuwingContinuiteit: 'vernieuwing en continuïteit',
                ontwikkelingStabiliteit: 'ontwikkeling en stabiliteit',
                loyaliteitAutonomie: 'loyaliteit en autonomie',
            },
            fallback: 'Werkplek die niet aansluit bij behoefte van de organisatie',
        },

        signature: {
            none: 'Een organisatie in beweging.',
            one: (drive) => `${drive} — daar bouwt deze organisatie op.`,
            two: (driveA, driveB) =>
                `${driveA} en ${driveB} — daar bouwt deze organisatie op.`,
        },

        leadership: {
            discuss: (topic) => `Bespreek expliciet: ${topic}.`,
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
            notEnoughData: 'Te weinig data om concrete investeringskeuzes te onderbouwen.',
            spreadClose: (min, max) =>
                `De voorkeuren liggen dicht bij elkaar (${min}–${max}% van het geheel). De behoefte is breed: geen enkel werkplektype springt eruit.`,
            spreadMix: (labels) =>
                `Investeer in een mix van werkplekken, niet in één type. Het meest genoemd: ${labels}.`,
            invest: (label, pct) =>
                `Investeer in ${label} — ${pct}% van álle werkplek-voorkeur ligt hier.`,
        },

        attention: {
            noResponse: 'nog geen respons',
            onlyN: (n) => `slechts ${n} ${n === 1 ? 'respondent' : 'respondenten'}`,
        },
    },

    // ── Persona-namen worden uit constants.getArchetypeName(id, lang) getrokken.
};
