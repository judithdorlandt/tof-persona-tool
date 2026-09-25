/**
 * quizData — all question and answer text for the questionnaire.
 *
 * NOTE: `basis[i].a` and `druk.a` follow the FIXED order of the eight
 * archetypes:
 *   0 maker · 1 groeier · 2 presteerder · 3 denker
 *   4 verbinder · 5 teamspeler · 6 zekerzoeker · 7 vernieuwer
 * Scoring maps by INDEX. Never reorder, never add or drop an option.
 *
 * `werkplek` and `duelEssentie` are keyed by id — the keys are data, only the
 * values are text.
 */
const quizData = {
  // ── Core — 9 questions ───────────────────────────────────────────────────
  basis: [
    {
      q: 'What gives you the most energy on an ordinary working day?',
      a: [
        'Thinking up something new and starting straight away',
        'Noticing that I have learned something new',
        'Finishing something and seeing the result',
        'Getting my teeth into a complex question',
        'A good conversation with someone',
        'Working with people I can rely on',
        'Calm, and knowing what is expected of me',
        'Spotting a chance that others have not seen yet',
      ],
    },
    {
      q: 'What drains your energy most at work?',
      a: [
        'Rules, with little room to try things out',
        'Repetition, with no chance to grow',
        'Plenty of meetings, few decisions',
        'Surface thinking and hasty conclusions',
        'Working without any real contact',
        'Shifting teams and no steady base',
        'Chaos and last-minute changes',
        'Standing still and clinging to the old',
      ],
    },
    {
      q: 'How do you prefer to work?',
      a: [
        'Freely and creatively, with few frames',
        'Learning, a step further each time',
        'Goal-driven and efficient',
        'In depth: understand first, then act',
        'People-first, with an eye for the mood',
        'Together with a steady, familiar group',
        'Structured and predictable',
        'Inventive and looking ahead',
      ],
    },
    {
      q: 'You are given a new assignment. What do you do first?',
      a: [
        'I simply start; it becomes clear along the way',
        'I look at what I can learn from this',
        'I ask about the goal and the deadline',
        'I gather the background first',
        'I check in with the people it affects',
        'I look at who I will do this with',
        'I ask about the frames and expectations',
        'I look for the new direction in this',
      ],
    },
    {
      q: 'How do you make a difficult decision?',
      a: [
        'On instinct, adjusting along the way',
        'I choose whatever takes me further',
        'I choose what delivers most and move on',
        'I analyse until I am sure what is right',
        'I check in and sense what is needed',
        'I look at what is best for the team',
        'I choose the clearest option',
        'I look at the opportunity in it',
      ],
    },
    {
      q: 'Which working environment brings out the best in you?',
      a: [
        'Room and materials to make and try things',
        'A setting that challenges and offers room to learn',
        'Focus and pace, without any noise',
        'Quiet and calm, able to really concentrate',
        'Warm, with room to meet people',
        'A familiar spot with my own team',
        'Orderly, with a fixed desk of my own',
        'Inspiring, where renewal is normal',
      ],
    },
    {
      q: 'What makes working together good for you?',
      a: [
        'Room for my own approach',
        'That we challenge and learn from each other',
        'That we keep the pace and deliver something',
        'That decisions hold up on substance',
        'That there is care for the person behind it',
        'That we can count on each other',
        'That roles and agreements are clear',
        'That we are moving somewhere together',
      ],
    },
    {
      q: 'Something big changes in your organisation. What is your first thought?',
      a: [
        'Interesting — what can I do with this?',
        'What can I learn from this?',
        'What does this mean for my goals and planning?',
        'I want to understand exactly what is changing',
        'What does this do to the people around me?',
        'What does this mean for our team?',
        'Where will I stand after this?',
        'Movement at last — this brings chances',
      ],
    },
    {
      q: 'What do you need from your manager to be at your best?',
      a: [
        'Trust and room for my own approach',
        'Attention for my development',
        'Clear goals and direct communication',
        'Preparation and time to think',
        'Involvement, and the sense that I matter',
        'Consistency and attention for the team',
        'Clear agreements up front',
        'Vision and room to explore',
      ],
    },
  ],

  // ── Deep dive — V3: under pressure ───────────────────────────────────────
  druk: {
    q: 'When things get tense at work, what do you do first?',
    a: [
      'I start doing something; moving helps me',
      'I find out how others solve this',
      'I make a list and begin at the top',
      'I step back to get to the bottom of it',
      'I find someone to share it with',
      'I check how the team is doing',
      'I want to know where I stand',
      'I ask whether this is a moment to change something',
    ],
  },

  // ── Deep dive — V4: workplace use (keys are data ids) ────────────────────
  werkplek: {
    focus: 'Focus spaces',
    work: 'Standard workstations',
    hybride: 'Hybrid spaces',
    meeting: 'Meeting spaces',
    project: 'Creative spaces',
    team: 'Collaboration spaces',
    learning: 'Learning spaces',
    retreat: 'Retreat spaces',
    social: 'Informal spaces',
  },

  // ── Deep dive — V5: open question ────────────────────────────────────────
  open: {
    q: 'What would make your work noticeably easier next week?',
  },

  verdiepingIntro:
    'Your profile is ready. Have another three minutes? It will sharpen your picture — and the team picture too.',

  // ── Deep dive — V1/V2: duels (keys are archetype ids) ────────────────────
  duelEssentie: {
    maker: 'I start, and find the shape as I go',
    groeier: 'I take it on to get better myself',
    presteerder: 'I deliver on time, even when it is not perfect',
    denker: 'I take the time the quality asks for',
    verbinder: 'I look for contact with the people behind it',
    teamspeler: 'I look at what is best for the team as a whole',
    zekerzoeker: 'I want to know exactly how we will do it',
    vernieuwer: 'I look for the new direction in this',
  },

  duelIntro: 'Two sides of you sit close together. Which one feels most like you?',
};

export default quizData;
