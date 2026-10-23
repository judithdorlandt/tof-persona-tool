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
    moduleLabel: 'MODULE 3 · ORGANISATION LANDSCAPE',

    // File-name suffix
    fileSuffix: 'organisation landscape TOF',

    // ── Page 1 — TOF brand cover
    brandCover: {
        title: 'The Office Factory',
        tagline: 'Insight into working style, team dynamics and workplace.',
        eyebrow: 'MODULE 3 · ORGANISATION LANDSCAPE',
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
            topNeed: 'What the organisation needs most',
            teamsCovered: 'Teams with data',
        },
        kpiUnits: {
            respondents: (n) => n === 1 ? 'person' : 'people',
            dominantStyle: (count) => count ? `${count} people primary` : '—',
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
            officeCheck: {
                title: 'Check the office',
            },
            vraagt: {
                title: 'What the work environment asks for',
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
            title: 'Teams without their own row',
            subtitle: 'Why not every team appears separately in the overview.',
            empty: 'Every team has enough data for analysis.',
        },
        tagline: 'An organisation that recognises itself moves faster.',
    },

    // ── Derived sentences (organisatieAggregation.js builds the data-driven
    //    texts with these; no loose string concatenation in the logic).
    data: {
        dateLocale: 'en-GB',
        orgRowLabel: 'ORGANISATION',
        teamNameFallback: '—',
        otherTeamsRowLabel: (n) => `Other (together ${n})`,

        officeCheck: {
            enough: (label) => `Are there enough ${label}?`,
            used: (label) => `Are the ${label} actually used?`,
        },

        signature: {
            none: 'An organisation in motion.',
            one: (drive) => `${drive} — that is what this organisation builds on.`,
            two: (driveA, driveB) =>
                `${driveA} and ${driveB} — that is what this organisation builds on.`,
        },

        leadership: {
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
            focusQuestion: (labels) =>
                `What does the organisation want to focus on in the coming years? Start with what's needed most: ${labels}.`,
        },

        attention: {
            noOwnRow: (x) => (x === 1
                ? '1 team doesn\'t appear as its own row in this overview. This keeps everyone unidentifiable. It is counted in "Other" and in the organisation total.'
                : `${x} teams don't appear as their own row in this overview. This keeps everyone unidentifiable. They are counted in "Other" and in the organisation total.`),
            noOwnRowNoRest: (x) => (x === 1
                ? '1 team doesn\'t appear as its own row in this overview. This keeps everyone unidentifiable. It is counted in the organisation total.'
                : `${x} teams don't appear as their own row in this overview. This keeps everyone unidentifiable. They are counted in the organisation total.`),
        },
    },

    // ── Persona names come from constants.getArchetypeName(id, lang).
};

