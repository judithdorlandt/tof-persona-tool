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

    // Page-header label (pages 2–6). No module number (decision J1).
    moduleLabel: 'ORGANISATION LANDSCAPE',

    // File-name suffix
    fileSuffix: 'organisation landscape TOF',

    // ── Page 1 — TOF brand cover
    brandCover: {
        tagline: 'Insight into working styles and workplace, across the whole organisation.',
        eyebrow: 'TOF PERSONA',
        kicker: 'Organisation landscape',
        meta: (date, respondents, activeTeams, totalTeams) =>
            `${date}  ·  ${respondents} ${respondents === 1 ? 'completed profile' : 'completed profiles'}  ·  ${activeTeams} of ${totalTeams} teams with completed profiles`,
    },

    // ── Page 2 — Key figures (heading + lead eyebrow)
    hero: {
        title: 'Key figures',
        leadEyebrow: 'WHAT YOU SEE',
    },

    // ── Page 2 — Organisation landscape cover & summary
    cover: {
        kpiLabels: {
            respondents: 'Completed profiles',
            dominantStyle: 'The largest group in the organisation',
            topNeed: 'What the organisation needs most',
        },
        kpiUnits: {
            dominantStyle: (count, tie) => {
                if (!count) return '—';
                return tie
                    ? `${count} people each as their first working style`
                    : `${count} people with this as their first working style`;
            },
        },
        leadFallback:
            'An aggregated view of working styles, tension and workplace needs — built from the completed profiles of team members.',
        leadOneSentence: (org, names, n, tie) =>
            `${tie ? `The largest groups in ${org} are` : `The largest group in ${org} is`} ${names} — based on ${n} ${n === 1 ? 'completed profile' : 'completed profiles'}.`,
        teamsWithoutResponses: {
            eyebrow: 'TEAMS WITHOUT COMPLETED PROFILES',
            note: (count) => (count === 1
                ? '1 team has no completed profiles yet, so it does not appear in this report.'
                : `${count} teams have no completed profiles yet, so they do not appear in this report.`),
        },
        // Reader's guide that fills the freed-up space when every team responded.
        measurement: {
            eyebrow: 'ABOUT THIS MEASUREMENT',
            intro: 'Everyone completes a short questionnaire and receives a first, second and third working style. This report adds up the first working styles into a picture per team and for the organisation as a whole. The eight working styles:',
        },
    },

    // ── Page 3 — Working style per team (heatmap)
    heatmap: {
        title: 'Working style per team',
        subtitle:
            'Per team, the share of each first working style in percent, plus the organisation as a whole.',
        cols: {
            team: 'Team',
            n: 'n',
            reliability: 'Reliability',
        },
        orgRowLabel: 'ORGANISATION',
        // No >= / <= glyphs: the bundled font subsets do not contain them.
        reliabilityHelp: 'Reliability: 5–15 profiles = emerging pattern · 16–30 = reliable picture · more than 30 = strong pattern',
        legend: {
            label: 'COLOUR INTENSITY',
            explanation: 'The stronger the colour, the larger the share within the team.',
            scaleLow: '0%',
            scaleHigh: '100%',
            cellEmpty: 'Empty cell: no one with this as their first working style.',
        },
    },

    // ── Page 4 — Organisation-wide patterns (quantitative)
    patronen: {
        title: 'Workplace needs of the organisation',
        subtitle:
            'What the work environment asks for, and what to check in the office.',
        // ── Page 5 — Qualitative picture
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
                empty: 'No observations added yet.',
            },
        },
        signalsBlock: {
            eyebrow: 'Qualitative signals',
        },
        methodNoteEyebrow: 'METHODOLOGICAL NOTE',
        methodNote:
            'Based on the first working styles from the completed questionnaires. The workplace profile follows from those working styles and says nothing about the current office.',
        qualCaveat:
            'Source: observation and conversations. These signals point, they do not prove — verification in conversation remains necessary.',
    },

    // ── Page 6 — Interpretation & direction
    duiding: {
        pageTitle: 'Interpretation',
        title: 'What this means',
        subtitle: 'Direction for leadership and the work environment.',
        leadership: {
            title: 'For leadership',
            empty: 'Too few completed profiles to give direction.',
        },
        environment: {
            title: 'For the work environment',
            empty: 'Too few completed profiles for a picture of the workplace.',
        },
        attention: {
            title: 'Teams without their own row',
            empty: 'Every team has its own row in the overview.',
        },
        tagline: 'An organisation that recognises itself moves faster.',
    },

    // ── Derived sentences (organisatieAggregation.js builds the data-driven
    //    texts with these; no loose string concatenation in the logic).
    data: {
        orgRowLabel: 'ORGANISATION',
        teamNameFallback: '—',
        otherTeamsRowLabel: (n) => `Other (together ${n})`,

        officeCheck: {
            enough: (label) => `Are there enough ${label}?`,
            used: (label) => `Are the ${label} actually used?`,
        },

        signature: {
            none: 'An organisation in motion.',
            one: (drive) => `${drive} is the strongest driver in this measurement.`,
            more: (drives) => `${drives} are the strongest drivers in this measurement.`,
        },

        leadership: {
            twoDrives: (names, drives) =>
                `The largest groups are ${names}, driven by ${drives}. Ask teams whether there is room for that, and what it asks of the other working styles.`,
            oneDrive: (name, drive) =>
                `The largest group is ${name}, driven by ${drive}. Check in conversation whether people with other working styles feel seen too.`,
        },

        environment: {
            notEnoughData: 'Too few profiles for a picture of workplace needs.',
            focusQuestion: (labels) =>
                `What does the organisation want to focus on in the coming years? Start with what's needed most: ${labels}.`,
        },

        attention: {
            noOwnRow: (x) => (x === 1
                ? '1 team doesn\'t appear as its own row in this overview. This way no group of fewer than five profiles is shown separately. It is counted in “Other” and in the organisation total.'
                : `${x} teams don't appear as their own row in this overview. This way no group of fewer than five profiles is shown separately. They are counted in “Other” and in the organisation total.`),
            noOwnRowNoRest: (x) => (x === 1
                ? '1 team doesn\'t appear as its own row in this overview. This way no group of fewer than five profiles is shown separately. It is counted in the organisation total.'
                : `${x} teams don't appear as their own row in this overview. This way no group of fewer than five profiles is shown separately. They are counted in the organisation total.`),
        },
    },

    // ── Persona names come from constants.getArchetypeName(id, lang).
};

