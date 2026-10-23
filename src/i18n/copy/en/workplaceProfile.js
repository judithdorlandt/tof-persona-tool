/**
 * workplaceProfile.js (EN) — all visible copy for the experimental workplace
 * needs profile (src/team/werkplek/WerkplekProfiel*.jsx).
 *
 * Tone: needs, use and behaviour — NEVER square metres, numbers of desks or
 * fit-out advice. The "type of space" illustrations describe the KIND of space,
 * not how much of it. There are deliberately no numbers or percentages here.
 *
 * LOGIC KEYS (never translated):
 *   - `band`     → kern / steun / aanvullend (BAND from werkplekProfielLogic.js)
 *   - `types`    → workplace type ids from werkplekmix.js
 *   - `gebruik`  → the same workplace type ids
 *   - `signalen` → signal ids from buildGedragssignalen()
 */

const workplaceProfile = {
    ui: {
        eyebrow: 'Experimental — Workplace needs',
        title: 'How this team needs and uses',
        titleAccent: 'its working environment',
        lead:
            'Translated from the working styles present: where this team wants to put its energy, ' +
            'what it leans on, and where the balance needs attention. No fit-out, no numbers — ' +
            'behaviour and use only.',
        terug: '\u2190 Back to team insight',

        // Signature line with the team name.
        signatuur: 'Workplace profile of',
        teamFallback: 'your team',

        // Hero — the strongest need as the dominant point of entry.
        heroEyebrow: 'What this team needs most',
        heroOnderschrift: 'The space this team benefits from most. Leaving it underexposed costs energy.',

        // The full, ranked picture of needs (all remaining types, grouped by band).
        overzichtKop: 'The full picture of needs, in order',
        overzichtLead:
            'From most to least emphasis. The labels show how central a space is to the way ' +
            'this team works — not how much of it is needed.',

        // Behavioural signals — secondary notes.
        signalenKop: 'Mind the balance',
        signalenLead:
            'Not a shortage of space, but a behavioural signal: this is where this team\u2019s pattern may start to chafe.',
        geenSignalen: 'The needs are in balance — no notable behavioural risk in this team.',

        illustratieLabel: 'Type of space',
        legeStaat: 'No working styles available yet to build a workplace profile from.',
    },

    // Band labels at team level (derived from core/supporting/additional in the mix).
    // kort = section heading, uitleg = short explanation underneath.
    band: {
        kern: {
            label: 'Core',
            kort: 'Central to how this team works',
            uitleg: 'This is where the energy sits. Give these spaces too little room and friction follows.',
        },
        steun: {
            label: 'Supporting',
            kort: 'Needed regularly, supporting',
            uitleg: 'Not the leading role, but needed often enough to keep the work running smoothly.',
        },
        aanvullend: {
            label: 'Additional',
            kort: 'Needed only now and then',
            uitleg: 'Valuable occasionally; its absence is rarely a problem for this team.',
        },
    },

    // Name and "type of space" illustration per workplace type. The ids come from
    // werkplekmix.js, which remains the source for the LOGIC; this list is the TEXT.
    types: {
        standaard: {
            label: 'Standard workstations',
            voorbeeldplekken: [
                'Single workstation, open or enclosed',
                'Two-person workstation, open or enclosed',
                'Open workstation for several people',
            ],
        },
        concentratie: {
            label: 'Focus spaces',
            voorbeeldplekken: ['Enclosed single space', 'Quiet zone, as in a library'],
        },
        overleg: {
            label: 'Meeting spaces',
            voorbeeldplekken: ['Space for planned or spontaneous meetings', 'Meeting room, small or large'],
        },
        samenwerk: {
            label: 'Collaboration spaces',
            voorbeeldplekken: [
                'Workstation for several people, open or enclosed',
                'Team room',
                'Project table',
            ],
        },
        creatief: {
            label: 'Creative spaces',
            voorbeeldplekken: [
                'Brainstorm room',
                'Project room',
                'Walls to write on',
                'Break-out',
                'Room to make progress visible',
            ],
        },
        informeel: {
            label: 'Informal spaces',
            voorbeeldplekken: [
                'Coffee point',
                'Seating area',
                'Restaurant or café',
                'Informal seating',
                'Spot to touch down for a moment',
            ],
        },
        rust: {
            label: 'Retreat spaces',
            voorbeeldplekken: [
                'Rest room',
                'Quiet room',
                'Low-stimulus room',
                'Wellbeing room',
                'Prayer room',
            ],
        },
        leer: {
            label: 'Learning spaces',
            voorbeeldplekken: [
                'No separate room: learning can happen in a team room, a meeting room or a common area.',
            ],
        },
    },

    // What the team USES the space for (behaviour and use, not fit-out).
    gebruik: {
        standaard: 'The steady base for everyday work — where this team spends most of its hours and switches between tasks.',
        concentratie: 'For deep, uninterrupted work that this team needs to keep its head in.',
        overleg: 'For aligning, making decisions and holding structured conversations.',
        samenwerk: 'For actively building something together, with shared ownership.',
        creatief: 'For exploring, sketching and letting ideas grow by combining them.',
        informeel: 'For the easy contact that feeds trust and collaboration.',
        rust: 'For recovery, stepping back for a moment and mental breathing space.',
        leer: 'For developing, reflecting and sharing knowledge at your own pace.',
    },

    // Behavioural signals — secondary notes. Title = the point of entry,
    // text = the explanation. Strictly behaviour, never advice about space.
    signalen: {
        uitputting: {
            titel: 'A lot of switching, little recovery',
            tekst:
                'This team leans heavily on both focus and meetings, while retreat gets little emphasis. ' +
                'The pattern asks for constant sharpness without a built-in pause — over time, a risk of exhaustion.',
        },
        focus_verdrongen: {
            titel: 'Focus risks being crowded out',
            tekst:
                'The emphasis lies on aligning and working together, while concentrated work gets little room. ' +
                'Deep work can be crowded out by the busyness of contact with others.',
        },
        weinig_ontmoeting: {
            titel: 'Little contact that happens by itself',
            tekst:
                'Focus and retreat dominate, while informal and collaborative work get little emphasis. ' +
                'Mutual alignment can thin out if encounters do not happen naturally.',
        },
    },
};

export default workplaceProfile;
