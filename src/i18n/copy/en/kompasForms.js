/**
 * kompasForms.js (EN) — copy for Module 3 · Strategic Compass:
 *   - the dashboard (TeamStrategic.jsx)
 *   - the intake questionnaire (StrategischKompasIntake.jsx)
 *   - the three-month check (StrategischKompasReview.jsx)
 *   - the demo payload shown when an organisation has no data of its own
 *     (src/utils/strategicKompas.js)
 *
 * NOTE — logic versus text:
 *   `field` in `intake.sections` and `review.questions` is a Supabase key.
 *   Those values are NEVER translated and must be identical in every language,
 *   as are the keys inside `demo.intake` / `demo.review`. Only the visible
 *   labels and questions change per language.
 */

const kompasForms = {
    // ── Dashboard (TeamStrategic) ────────────────────────────────────────────
    dashboard: {
        eyebrow: 'Module 3 · Strategic Compass',
        back: '← Back',
        backToTool: '← Back to the Persona Tool',
        thisOrganization: 'this organisation',
        defaultHorizon: '3–5 years',

        empty: {
            title: 'No compass available yet',
            leadBefore: 'There is no Strategic Compass for ',
            leadAfter: ' yet. Book an exploratory conversation to get the process started.',
            cta: 'Book a conversation',
        },

        hero: {
            title: 'The compass for',
            leadBefore:
                'How the current persona mix relates to eight external trends — and what that asks of leadership, workplace and collaboration over the next ',
            leadAfter: '.',
        },

        meta: {
            horizon: 'Horizon',
            lastUpdate: 'Last recalibration',
            nextReview: 'Next review',
        },

        trends: {
            eyebrow: '01 · Trend radar',
            titleBefore: 'Eight external trends, weighted for ',
            titleAfter: '.',
            noteBefore: 'The leading trend for this team is ',
            noteAfter: '. What sits at the bottom has not disappeared — it is simply less urgent for this particular persona mix.',
        },

        overlay: {
            eyebrow: '02 · Persona overlay',
            title: 'What the team mix asks for over the next three to five years.',
            ambitionLabel: 'Your own ambition · from the intake',
            dominantLabel: 'Strongly present',
        },

        choices: {
            eyebrow: '03 · Strategic choices',
            title: 'Five directions for the leadership team and board.',
        },

        jaarritme: {
            eyebrow: '04 · Annual rhythm',
            title: 'Four moments to recalibrate the compass.',
        },
    },

    // ── Intake questionnaire ─────────────────────────────────────────────────
    intake: {
        eyebrow: 'Module 3 · Strategic Compass · Intake',
        title: 'The start of your',
        titleAccent: 'compass',
        intro:
            'This questionnaire is the starting point of your Strategic Compass. Together with the ' +
            'persona data from Modules 1 and 2 and the eight trends, your answers form the basis for ' +
            'the design conversation. There is no automated outcome — this is input that we turn into ' +
            'direction together. Take your time; honest short answers are worth more than complete ones.',

        // `field` = Supabase key (never translated). The order and number of
        // sections must be the same in every language.
        sections: [
            {
                eyebrow: '01',
                title: 'Organisation and ambition',
                field: 'ambition',
                questions: [
                    'Where does your organisation stand today, and where does it need to go?',
                    'What makes now the right moment to start this process?',
                ],
            },
            {
                eyebrow: '02',
                title: 'The shift you want to make',
                field: 'movement',
                questions: [
                    'What shift do you want to make over the next 3–5 years?',
                    'What has already been set in motion, and what is still missing?',
                ],
            },
            {
                eyebrow: '03',
                title: 'Leadership team and behaviour',
                field: 'mtBehaviour',
                questions: [
                    'How are things going in your leadership team — where does it work well, where does it stall?',
                    'Which pattern keeps returning in the way you work together, without being named out loud?',
                ],
            },
            {
                eyebrow: '04',
                title: 'Working environment',
                field: 'workplace',
                questions: [
                    'Does your working environment (physical and hybrid) match how you want to work, or how it happened to be set up?',
                    'Where does the environment work against you?',
                ],
            },
            {
                eyebrow: '05',
                title: 'Direction for 3–5 years',
                field: 'direction',
                questions: [
                    'What do you want to be able to say about this period in 3–5 years from now?',
                    'What needs to be set in motion now to make that happen?',
                ],
            },
        ],

        answerPlaceholder: 'Your answer…',

        closing: {
            eyebrow: 'To finish',
            teamcodeLabel: 'Team code (required)',
            teamcodeHint: 'Links this intake to the persona data of the same organisation.',
            teamcodePlaceholder: 'e.g. NIJ-BES-26-A8K2',
            filledByLabel: 'Name and role of the person filling this in',
            filledByPlaceholder: 'e.g. Sanne de Vries, leadership team',
        },

        submit: 'Send intake',
        submitting: 'Sending…',
        cancel: 'Cancel',

        errors: {
            teamcodeRequired: 'Please enter a team code — it links this intake to your persona data.',
            saveFailed: 'Saving failed. Please try again later.',
        },

        done: {
            eyebrow: 'Module 3 · Strategic Compass',
            title: 'Thank you.',
            body:
                'Your input has been saved. Judith will read it through and combine it with your ' +
                'persona data and the eight trends. In the design conversation it all comes together into your compass.',
            back: '← Back to Module 3',
        },
    },

    // ── Three-month check ────────────────────────────────────────────────────
    review: {
        eyebrow: 'Module 3 · Strategic Compass · Three-month check',
        title: 'Three months',
        titleAccent: 'on',
        intro: 'Three months on. This short check looks at what has changed, so that the compass moves with you.',

        // `field` = Supabase key (never translated).
        questions: [
            {
                field: 'changed',
                question: 'What has changed since the start — in the organisation, in the leadership team, for you?',
            },
            {
                field: 'mixShift',
                question: 'Has the make-up of the team changed (new people, departures)? If so, how?',
            },
            {
                field: 'choiceLanding',
                question: 'Which choice from the compass has not really been made yet?',
            },
            {
                field: 'notes',
                question: 'What does the period ahead need?',
            },
        ],

        answerPlaceholder: 'Your answer…',

        closing: {
            eyebrow: 'To finish',
            teamcodeLabel: 'Team code (required)',
            teamcodeHint: 'Links this check to your compass.',
            teamcodePlaceholder: 'e.g. NIJ-BES-26-A8K2',
        },

        submit: 'Send check',
        submitting: 'Sending…',
        cancel: 'Cancel',

        errors: {
            teamcodeRequired: 'Please enter a team code — it links this check to your compass.',
            saveFailed: 'Saving failed. Please try again later.',
        },

        done: {
            eyebrow: 'Module 3 · Strategic Compass',
            title: 'Thank you.',
            body: 'Your input has been saved. Judith will read it through so the compass can move with you.',
            back: '← Back to Module 3',
        },
    },

    // ── Demo payload (Demo Team 3) ───────────────────────────────────────────
    // Text only. The trend ids and weights live in src/utils/strategicKompas.js;
    // they are language-independent and are matched to `demo.trends` by index.
    // Keep the order and the length identical across languages.
    demo: {
        team: 'Demo Team 3',
        horizon: '3–5 years',
        lastUpdate: 'May 2026',
        nextReview: 'May 2027',

        trends: [
            {
                name: 'Social based working',
                note: 'With 42% Team Players, Connectors and Growers, connection is not carried by volume but by meaningful encounters.',
            },
            {
                name: 'Experience based working',
                note: 'Growers and Team Players judge the workplace on how the day feels and how good it is — not on a chair and a desk.',
            },
            {
                name: 'DEIB by design',
                note: 'The minority (Thinkers, Stabilisers) guards the rhythm. Low-stimulus zones and predictable structure are a design question, not a policy.',
            },
            {
                name: 'From mega-campus to tailored locations',
                note: 'High demand for collaboration and creative spaces, low demand for hybrid: the compass points to small, purposeful locations.',
            },
            {
                name: 'From presence to value',
                note: 'This team comes together for the encounter — not for a number of office days. Steer on the quality of coming together.',
            },
            {
                name: 'Service revolution',
                note: 'A hospitality-led environment fits how much this team values experience. Not critical, but reinforcing.',
            },
            {
                name: 'Managing the peaks',
                note: 'Less dominant for this team — social dynamics weigh more heavily than the midweek peak.',
            },
            {
                name: 'AI in the workplace',
                note: 'Relevant at a distance: AI as an instrument to keep an eye on rhythm, not as a monitoring tool.',
            },
        ],

        personaOverlay: {
            dominant: ['Grower', 'Team Player', 'Innovator'],
            insights: [
                'An agile team with social resilience — 42% leans on connection and development.',
                'Three tensions call for design, not repair: pace versus connection, freedom versus certainty, depth versus pace.',
                'The minority (Thinkers, Stabilisers, one Connector) guards the rhythm — look after that small group.',
            ],
        },

        choices: [
            {
                axis: 'Leadership',
                title: 'Build in rhythm, not more pace',
                body: 'The three tensions all come back to the same thing: this team can handle pace, but not without a frame. Make rhythm moments explicit — when to reflect, when to decide, when to deliver.',
            },
            {
                axis: 'Workplace',
                title: 'Small, social, close by',
                body: 'High demand for collaboration and creative spaces, low demand for hybrid. Invest in smaller, purposeful locations with strong social architecture — not in one large central head office.',
            },
            {
                axis: 'Culture',
                title: 'Treat differences as a design question, not a problem',
                body: 'Name the three tensions actively in leadership meetings as design questions. Who needs which rhythm, and how does that translate into agreements, office environment and collaboration?',
            },
            {
                axis: 'Technology',
                title: 'AI as an instrument for rhythm',
                body: 'Use AI to measure experience, friction and effectiveness continuously — not to monitor people, but to protect the minority and adjust the rhythm.',
            },
            {
                axis: 'Collaboration',
                title: 'Social architecture instead of occupancy',
                body: 'Steer on the quality of coming together rather than on attendance. Plan rituals — not meetings — for the moments where this team picks up energy.',
            },
        ],

        jaarritme: [
            { moment: 'Q1', activity: 'Compass recalibration with the leadership team — reweigh the trends, evaluate the choices.' },
            { moment: 'Q2', activity: 'Interim persona check — anyone new on board? Has the mix shifted?' },
            { moment: 'Q3', activity: 'Workplace evaluation — what has the social architecture delivered?' },
            { moment: 'Q4', activity: 'Trends update and year overview — a new compass for the year ahead.' },
        ],

        // The keys below are Supabase jsonb fields — never translate them.
        intake: {
            submittedAt: 'May 2026',
            filledBy: 'Demo Manager, leadership team',
            teamcode: 'DEMO-TEAM-3',
            ambition: 'We want to move from a delivery-driven organisation to an agile, learning one in which teams take more direction of their own.',
            movement: 'From steering on attendance to steering on value and connection — over the next three to five years.',
            mtBehaviour: 'The leadership team decides decisively, but reflection and naming the underlying tensions lag behind.',
            workplace: 'The current environment is built around fixed desks; our work asks for more room to meet and collaborate.',
            direction: 'In 3–5 years we want to be able to say that differences in working style have become a design choice rather than a source of friction.',
        },

        review: {
            submittedAt: 'August 2026',
            changed: 'The leadership team now names tensions out loud more often; a first pilot with collaboration spaces has started in the organisation.',
            mixShift: 'Two new Growers have joined and one Thinker has left — the mix has become a little more agile.',
            choiceLanding: 'The choice to steer on the quality of coming together rather than on attendance has not really been made yet.',
            notes: 'A need for a concrete rhythm for reflection moments in the leadership team.',
        },
    },
};

export default kompasForms;
