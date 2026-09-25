/**
 * resultsCard — the two cards on the results page:
 *   profile  → ResultsProfileCard (hero with all the insights)
 *   download → ResultsDownloadCard (PDF download)
 */
const resultsCard = {
  // Empty state: someone lands on the results page without a test result.
  empty: {
    eyebrow: '04 — Your result',
    title: 'No result available yet',
    body: 'Take the test first to see your persona profile.',
    startTest: 'Start the test',
    backHome: 'Back to home',
  },

  profile: {
    badge: 'Primary persona',
    // Followed by the persona name and a full stop.
    dominantPrefix: 'Your dominant profile is',

    meaningTitle: 'What this means in practice',
    meaningBody:
      'You work at your strongest when your environment matches the way you naturally work. Where the two differ, it costs you energy and it becomes harder to come into your own.',

    motionLabel: 'What sets you in motion',
    motionTitle: 'Your natural strength',

    distributionLabel: 'The balance of your profile',
    mixLabel: 'Your mix',

    leadershipLabel: 'What helps in leadership',
    leadershipTitle: 'How you come into your own',

    bricksLabel: 'Bricks',
    bricksTitle: 'Your ideal workplace mix',
    // Followed by the score number.
    scorePrefix: 'score',

    bytesLabel: 'Bytes & Behavior',
    bytesTitle: 'What you need',

    // The two blocks inside "Bytes & Behavior".
    bytesBlocks: {
      bytes: { label: 'Bytes', title: 'Digital support' },
      behavior: { label: 'Behavior', title: 'Behaviour & culture' },
    },

    drainLabel: 'What drains you',

    // Labels for the nine workplace types (keys are language-neutral).
    workplaceLabels: {
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
  },

  download: {
    eyebrow: 'Your persona card',
    format: 'PDF · 2 pages · A5',

    includesLabel: 'What you download',
    includes: [
      'Your dominant persona and profile balance',
      'Your mix of secondary personas',
      'What sets you in motion',
      'Your ideal workplace mix (top 3)',
      'What helps in leadership',
    ],

    howToLabel: 'How to use it',
    howToBody:
      'The card is designed to be shared — with your manager, your team or your organisation. Use it as a conversation starter, or as input for workplace and collaboration agreements.',

    // Followed by the participant's first name.
    madeForPrefix: 'Made for',

    // Heading on the card when no name was filled in.
    nameFallback: 'Your profile',

    // Closing quote on the back if the persona has none of its own.
    fallbackQuote:
      'You work at your strongest when your environment matches the way you naturally work.',

    // File name of the downloaded PDF. `firstName` may be empty.
    fileName: (firstName) => (firstName
      ? `${firstName} - persona card TOF.pdf`
      : 'persona card TOF.pdf'),

    downloadButton: 'Download persona card',
    availability: 'PDF · free · available right away',

    allPersonas: 'See all personas',
    retakeTest: 'Take the test again',
  },
};

export default resultsCard;
