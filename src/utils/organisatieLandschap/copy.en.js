/**
 * copy.en.js — English text content for the Organisation Landscape PDF.
 *
 * Mirror of `copy.nl.js` with an IDENTICAL key structure. Resolver: `copy.js`.
 * Page builders never hardcode strings; they read from the resolved copy object.
 *
 * FONT CONSTRAINT: the bundled Inter/Playfair TTFs are subsets WITHOUT the
 * glyphs >= (U+2265) and <= (U+2264). Never use them — write thresholds out in
 * words. The characters · – — é ARE available. Avoid italic for text with
 * non-Latin1 characters (there is no Inter-italic).
 */

export const COPY_EN = {
    // ── Shared
    brand: 'TOF · The Office Factory',
    pillLabel: 'ORGANISATION LANDSCAPE',
    dateLocale: 'en-GB',

    // Module label in the page header (pages 2–5) and on the cover.
    moduleLabel: 'MODULE 1 · INSIGHTS',

    // File-name suffix
    fileSuffix: 'organisation landscape TOF',

    // ── Page 1 — TOF brand cover
    brandCover: {
        title: 'The Office Factory',
        tagline: 'Insight into working style, team dynamics and workplace.',
        eyebrow: 'MODULE 1 · INSIGHTS',
        kicker: 'Organisation landscape',
        meta: (date, respondents, activeTeams, totalTeams) =>
            `${date}  ·  ${respondents} ${respondents === 1 ? 'respondent' : 'respondents'}  ·  ${activeTeams}/${totalTeams} teams with data`,
    },

    // ── Page 2 — Key figures (heading + lead eyebrow)
    hero: {
        title: 'Key figures',
        leadEyebrow: 'WHAT YOU SEE',
    },

    // ── Page 2 — Organisation landscape cover & summary
    cover: {
        eyebrow: 'ORGANISATION LANDSCAPE',
        kicker: 'Report',
        titlePrefix: '',
        subtitle: 'Working styles, patterns and direction',
        kpiLabels: {
            respondents: 'Respondents',
            dominantStyle: 'Dominant working style',
            topNeed: 'Biggest workplace need',
            teamsCovered: 'Teams with data',
        },
        kpiUnits: {
            respondents: (n) => n === 1 ? 'person' : 'people',
            dominantStyle: (count) => count ? `${count} people primary` : '—',
            topNeed: (pct) => `${pct}% of all workplace preference`,
        },
        leadIntro: 'What this report shows',
        leadFallback:
            'An aggregated view of working styles, tension and workplace needs — built from the individual responses of team members.',
        leadOneSentence: (org, dominant, n) =>
            `In this measurement ${org} recognises itself most strongly in ${dominant.toLowerCase()} — based on ${n} ${n === 1 ? 'respondent' : 'respondents'}.`,
        teamsWithoutResponses: {
            eyebrow: 'TEAMS WITHOUT RESPONSES',
            empty: 'Every team has responded.',
            note: (count) =>
                `${count} ${count === 1 ? 'team has' : 'teams have'} not submitted a response yet. They are missing from the heatmap and the patterns.`,
        },
        // Reader's guide that fills the freed-up space when every team responded.
        measurement: {
            eyebrow: 'ABOUT THIS MEASUREMENT',
            intro: 'Every respondent completes a short questionnaire and receives one dominant working style. This report adds those styles up into a picture per team and for the organisation as a whole. The eight working styles:',
            // Keyed on archetype id; the builder pairs it with the persona name.
            legend: {
                maker: 'likes to finish something tangible',
                groeier: 'seeks growth and new skills',
                presteerder: 'steers on goals and results',
                denker: 'seeks calm, depth and concentration',
                verbinder: 'brings people and collaboration together',
                teamspeler: 'values a reliable, close-knit team',
                zekerzoeker: 'likes structure and certainty',
                vernieuwer: 'invents new routes and ideas',
            },
        },
    },

    // ── Page 3 — Working style per team (heatmap)
    heatmap: {
        eyebrow: 'PAGE 2 — WORKING STYLE PER TEAM',
        title: 'Working style per team',
        subtitle:
            'How working styles are spread within each team, plus the organisation as a whole.',
        cols: {
            team: 'Team',
            n: 'n',
            reliability: 'Reliability',
        },
        orgRowLabel: 'ORGANISATION',
        orgRowReliability: 'n/a',
        unlinkedRowLabel: 'Not linked to a team',
        unlinkedNote: (n) =>
            `${n} ${n === 1 ? 'respondent counts' : 'respondents count'} towards the organisation total, but ${n === 1 ? 'is' : 'are'} not linked to a specific team. That is why the team rows add up to the total.`,
        lowReliabilityNote: 'Where reliability is low the cell colour is muted — with a single respondent one choice can already make 100%.',
        // No >= / <= glyphs: the bundled font subsets do not contain them.
        reliabilityHelp: 'fewer than 5 = low · 5–9 = medium · 10 or more = high',
        // Labels next to the reliability dot per row (keyed on dot id).
        reliabilityLabels: {
            laag: 'Low',
            midden: 'Medium',
            hoog: 'High',
        },
        roundingNote: 'Rounding means row totals can add up to 99–101%.',
        legend: {
            label: 'COLOUR INTENSITY',
            explanation: 'The stronger the colour, the larger the share within the team.',
            scaleLow: '0%',
            scaleHigh: '100%',
            cellZero: 'Measured 0%',
            cellEmpty: 'Not present',
        },
    },

    // ── Page 4 — Organisation-wide patterns (quantitative)
    patronen: {
        eyebrow: 'PAGE 4 — PATTERNS',
        title: 'Patterns in the organisation',
        subtitle:
            'What the work environment asks for, and where the organisation drains — measured in the data.',
        // ── Page 5 — Qualitative picture
        qualEyebrow: 'PAGE 5 — QUALITATIVE PICTURE',
        qualTitle: 'Signals from observation and conversation',
        qualSubtitle:
            'What works well and where the tension sits — gathered from observation and conversations.',
        cols: {
            leegloopt: {
                title: 'Where the organisation drains',
                subtitle: 'Tension and friction visible in the data.',
            },
            vraagt: {
                title: 'What the work environment asks for',
                subtitle: 'Top 5 workplace types, as a share of all preference.',
                scaleLabel: 'Share of preference',
                spreadNote: 'The differences are small: read this as a broad, evenly spread need — no single type wins.',
            },
            werkt: {
                title: 'What works well',
                subtitle: 'What keeps the organisation standing.',
                empty: 'No observations added yet.',
            },
        },
        signalsBlock: {
            eyebrow: 'Qualitative signals',
            source: 'Source: observation and conversations (not measured).',
        },
        methodNoteEyebrow: 'METHODOLOGICAL NOTE',
        methodNote:
            'Data from the persona questionnaire — quantitative, n = number of respondents per category.',
        qualCaveat:
            'Source: observation and conversations. These signals point, they do not prove — verification in conversation remains necessary.',
    },

    // ── Page 6 — Interpretation & direction
    duiding: {
        eyebrow: 'PAGE 4 — INTERPRETATION',
        pageTitle: 'Interpretation',
        title: 'What this means',
        subtitle: 'Direction for leadership and the work environment.',
        leadership: {
            title: 'For leadership',
            subtitle: 'What deserves attention in conversation with teams.',
            empty: 'Too little data to give sharp direction.',
        },
        environment: {
            title: 'For the work environment (3–5 years)',
            subtitle: 'Where workplace investment pays off most.',
            empty: 'Too little data for well-founded choices.',
        },
        attention: {
            title: 'Teams that deserve room',
            subtitle: 'Low response or little visibility in the data.',
            empty: 'Every team has enough data for analysis.',
            moreOnNext: (n) =>
                `${n} more ${n === 1 ? 'team' : 'teams'} — see next page`,
        },
        continuationSubtitle:
            'Continued — remaining teams that deserve attention.',
        tagline: 'An organisation that recognises itself moves faster.',
    },

    // ── Derived sentences (organisatieAggregation.js builds the data-driven
    //    texts with these; no loose string concatenation in the logic).
    data: {
        dateLocale: 'en-GB',
        orgRowLabel: 'ORGANISATION',
        teamNameFallback: '—',

        // Workplace-type labels arrive from the aggregation in Dutch; map them
        // to the agreed English names. Unknown labels pass through unchanged,
        // so an already-translated label is never mangled.
        workplaceLabel: (label) => WORKPLACE_LABELS_EN[label] || label,

        leeglopers: {
            tooLittle: (label) => `Too little ${label}`,
            tooMuch: (label) => `Too much ${label}`,
            tension: (label) => `Tension between ${label}`,
            tensionPairs: {
                tempoZorgvuldigheid: 'pace and care',
                resultaatVerbinding: 'results and connection',
                vrijheidZekerheid: 'freedom and certainty',
                vernieuwingContinuiteit: 'renewal and continuity',
                ontwikkelingStabiliteit: 'development and stability',
                loyaliteitAutonomie: 'loyalty and autonomy',
            },
            fallback: 'A workplace that does not match what the organisation needs',
        },

        signature: {
            none: 'An organisation in motion.',
            one: (drive) => `${drive} — that is what this organisation builds on.`,
            two: (driveA, driveB) =>
                `${driveA} and ${driveB} — that is what this organisation builds on.`,
        },

        leadership: {
            discuss: (topic) => `Discuss explicitly: ${topic}.`,
            twoDrives: (a, b) =>
                `Two drivers stand out: ${a.drive} (${a.label}) and ${b.drive} (${b.label}). Make room for both — do not suppress either.`,
            oneDrive: (a) =>
                `The dominant driver is ${a.drive} (${a.label}). Check in conversation whether teams with other drivers still feel seen.`,
            personaLabel: (name, pct) =>
                pct != null ? `${name}, ${pct}% primary` : name,
            lowReliability: (n) =>
                `${n} teams have too few responses for firm conclusions. Explore in conversation before you set policy.`,
        },

        environment: {
            notEnoughData: 'Too little data to underpin concrete investment choices.',
            spreadClose: (min, max) =>
                `The preferences sit close together (${min}–${max}% of the whole). The need is broad: no single workplace type stands out.`,
            spreadMix: (labels) =>
                `Invest in a mix of workplaces, not in one type. Mentioned most: ${labels}.`,
            invest: (label, pct) =>
                `Invest in ${label} — ${pct}% of all workplace preference sits here.`,
        },

        attention: {
            noResponse: 'no response yet',
            onlyN: (n) => `only ${n} ${n === 1 ? 'respondent' : 'respondents'}`,
        },
    },

    // ── Persona names come from constants.getArchetypeName(id, lang).
};

// Fixed translations for the nine workplace types. Keys are the Dutch source
// labels produced by the aggregation; never translate the underlying keys
// (focus/work/hybride/meeting/project/team/learning/retreat/social).
const WORKPLACE_LABELS_EN = {
    'Concentratieplekken': 'Focus spaces',
    'Standaard werkplekken': 'Standard workstations',
    'Hybride plekken': 'Hybrid spaces',
    'Overlegplekken': 'Meeting spaces',
    'Creatieve plekken': 'Creative spaces',
    'Samenwerkplekken': 'Collaboration spaces',
    'Leerplekken': 'Learning spaces',
    'Rustplekken': 'Retreat spaces',
    'Informele plekken': 'Informal spaces',
};

export { WORKPLACE_LABELS_EN };
