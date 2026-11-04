/**
 * servicesProfile.js (EN) — visible text for "What brings this team to the
 * office" (services profile): the layer in the Workplace panel of the team
 * dashboard and the you-sentence in the personal profile.
 *
 * Source, character for character: tof-marketingteam/toetsen/2026-11-04-ID-001-dienstenprofiel-v2.md
 * (points 1–4). Decided by Judith, 4 Nov 2026. Do not rewrite.
 * Working-style names are the app names from copy/en/archetypes.js.
 *
 * Same keys as copy/nl/servicesProfile.js — see the notes there.
 */

const servicesProfile = {
    titel: 'What brings this team to the office',
    waaromKop: 'Why this team comes in',
    dienstenKop: 'What makes an office day worth it',
    helptOokKop: 'Also helps',

    geenUitgesproken: {
        kop: 'Nothing stands out for this team.',
        tekst: 'For these working styles, no part of an office day clearly outweighs the rest. Agree as a team what your office days are for.',
    },

    itVoetregel: 'A condition for everyone in this team: everything works on arrival, and when something goes wrong, help comes quickly.',

    disclaimer: 'Derived from the working styles in this team, based on expert judgement rather than measurement. It says nothing about how often anyone comes in.',

    wie: {
        team: 'Agreed within the team',
        organisatie: 'Arranged by the organisation',
        beide: 'Partly the team, partly the organisation',
    },

    diensten: {
        ontvangst: {
            naam: 'Reception and welcome',
            uitleg: 'Someone who welcomes you, shows you around and introduces people to each other.',
            voorbeelden: ['a host', 'a community manager', 'a welcome for new colleagues'],
        },
        eten: {
            naam: 'Food and drink',
            uitleg: 'Good coffee and lunch as a natural moment to run into each other.',
            voorbeelden: ['a coffee bar', 'lunch on site', 'a table where people eat together'],
        },
        ontmoeting: {
            naam: 'Events and get-togethers',
            uitleg: 'Planned moments that give people a reason to come in.',
            voorbeelden: ['team days', 'knowledge sessions', 'celebrations and milestones'],
        },
        focus: {
            naam: 'Focus support',
            uitleg: 'Agreements that protect quiet, so focused work is possible at the office too.',
            voorbeelden: ['quiet zones that stay quiet', 'fixed focus hours', 'agreements about interruptions'],
        },
        it: {
            naam: 'IT support',
            uitleg: 'Everything works on arrival, and when something goes wrong, help comes quickly.',
            voorbeelden: ['screens and connection', 'meeting-room equipment', 'help on site'],
        },
        leren: {
            naam: 'Learning and knowledge sharing',
            uitleg: 'Time and opportunity to learn from each other.',
            voorbeelden: ['lunchtime talks', 'peer coaching', 'shadowing a colleague'],
        },
        welzijn: {
            naam: 'Wellbeing and recovery',
            uitleg: 'Attention to energy and recovery during the day.',
            voorbeelden: ['a walking meeting', 'movement breaks', 'a place to decompress'],
        },
        gemak: {
            naam: 'Practical convenience',
            uitleg: 'Things that make the day easier and more predictable.',
            voorbeelden: ['parcels and lockers', 'bike storage', 'booking a desk easily and seeing who is coming in'],
        },
    },

    // Team view, third person (point 2). At most three at a time.
    waarom: {
        maker: 'Comes in to make things. At a project table or whiteboard an idea quickly becomes visible, with the right tools at hand.',
        groeier: "Comes in to learn from others, by watching how colleagues work and getting feedback they wouldn't get at home.",
        presteerder: 'Comes in when a decision is taken that day and the work can move forward afterwards without distraction.',
        denker: 'Comes in for a well-prepared, substantive conversation, provided there is a quiet place afterwards to think it through.',
        verbinder: 'Comes in for the people, to catch up and maintain the trust that wears thin at a distance.',
        teamspeler: 'Comes in when their own team is there too. A regular team day and a place of their own make the office a home base.',
        zekerzoeker: 'Comes in when the day is predictable: knowing beforehand who will be there and that there is a place to sit.',
        vernieuwer: 'Comes in for conversations with people outside their own team, where an idea gets sharper and a direction takes shape.',
    },

    // Individual view, you-form (point 3).
    individueel: {
        kop: 'What brings you to the office',
        disclaimer: 'Derived from your working style, based on expert judgement rather than measurement.',
        zin: {
            maker: 'You come in to make things, at a project table or whiteboard where an idea quickly becomes visible.',
            groeier: "You come in to learn from others: watching how colleagues work and getting feedback you wouldn't get at home.",
            presteerder: 'You come in when a decision is taken that day and you can push on afterwards without distraction.',
            denker: 'You come in for a well-prepared, substantive conversation, as long as there is a quiet place afterwards to think it through.',
            verbinder: 'You come in for the people, to catch up and maintain the trust that wears thin at a distance.',
            teamspeler: 'You come in when your own team is there too, on a regular team day with a place that is yours.',
            zekerzoeker: 'You come in when the day is predictable and you know beforehand who will be there and where you will sit.',
            vernieuwer: 'You come in for conversations with people outside your own team, where an idea gets sharper.',
        },
    },
};

export default servicesProfile;
