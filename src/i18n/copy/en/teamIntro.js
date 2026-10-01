/**
 * teamIntro — English copy for TeamIntro.jsx.
 * Mirrors the key structure and array lengths of copy/nl/teamIntro.js.
 */
const teamIntro = {
  modules: {
    app: {
      eyebrow: 'Module 1 · For everyone',
      title: 'The Persona app',
      hook: 'Start with yourself. Free, in a few minutes, without an account.',
      bullets: [
        'Your own profile: what gives you energy and what drains you',
        'What that means for your workspace and your working agreements',
        'Everything stays on your phone — nothing goes to a server',
        'Got a team code? Then you add your profile to your team',
      ],
      cta: 'I have a team code',
      store: 'Available as TOF Persona in the App Store.',
      storeSoon: 'Coming soon to the App Store.',
      webCta: 'Or take the test here →',
    },
    teams: {
      eyebrow: 'Module 2 · For teams',
      title: 'Team Insight & Dynamics',
      hook: 'You know who is in your team. But do you know how the team really works?',
      bullets: [
        'See at a glance which working styles dominate',
        'Discover where the energy sits — and where friction appears',
        'Understand why pace, structure and decision-making collide',
        'Workplace needs and concrete quick wins for every team',
        'A live session where we read it together — online or on site',
      ],
      what: 'One team dashboard plus the session where the conversation happens. Insight and interpretation belong together, so you no longer buy them separately.',
      cta: 'Go to the Team space',
    },
    bedrijf: {
      eyebrow: 'Module 3 · For leadership and property',
      title: 'The Organisational Landscape',
      hook: 'One team is a snapshot. Only several teams reveal the pattern.',
      bullets: [
        'All teams side by side: where the dominant style sits, and where the exception is',
        'Working style per department, and what that asks of your buildings',
        'Patterns you simply cannot see at team level',
        'One shared language for leadership, HR and property',
      ],
      what: 'A report covering your whole organisation plus a leadership session. The landscape emerges from three teams onwards.',
      cta: 'Book a conversation',
    },
    strategic: {
      eyebrow: 'Module 4 · For leadership teams and boards',
      title: 'The Strategic Compass',
      hook: 'What the world asks of you, translated into who your team is.',
      bullets: [
        'Trend radar: 8 curated trends on work, leadership and AI',
        'Persona overlay: which trends hit your organisation hardest',
        'Strategic choices for leadership, the working environment and culture',
        'A living direction document — updated every year, not a plan in a drawer',
      ],
      what: 'A four-month journey: intake, a Strategic Compass document (around 20 pages), a leadership session and a review. Fully tailored.',
      cta: 'Discover the Strategic Compass',
    },
  },

  card: {
    whatYouGet: 'What you get',
    showLess: 'Show less',
    showMore: 'See what this involves →',
  },

  managerWelcome: {
    eyebrow: 'Welcome back',
    greeting: (name) => `Hi ${name}, `,
    greetingHighlight: 'your team(s) are ready.',
    titleLead: 'Your team(s) ',
    titleHighlight: 'are ready.',
    lead: 'Select a team below to open its Team Insight dashboard.',
  },

  hero: {
    eyebrow: 'For teams & organisations',
    titleLead: 'Your team has a pattern.',
    titleHighlight: 'Time to see it.',
    leadDesktop:
      'Every team works differently — and that pattern can be made visible. Choose the level that fits your question.',
    leadMobile: 'Every team works differently. Choose the level that fits your question.',
    makerMode: 'Maker mode active',
  },

  magicLink: {
    eyebrow: 'Already working with TOF? Sign in with a magic link',
    body:
      'Magic-link access is only available for teams we have already started a programme with. Not working with us yet? Book a conversation below first.',
    cta: 'Go to sign in →',
  },

  access: {
    title: 'Your access',
    adminBadge: 'ADMINISTRATOR',
    adminLead: 'You are signed in as an administrator and can reach every team through the team selector.',
    oneTeam: 'You have access to this team.',
    manyTeams: (n) => `You have access to ${n} teams.`,
    logout: 'Sign out',
    adminNoTeams: 'Choose a team from the overview to open it.',
    upgradeLead: 'Want to see several teams at once?',
    upgradeLink: 'Ask about the Organisation landscape →',
    teamFallback: 'Team',
    levelDynamics: 'Team Insight + Dynamics',
    levelInsight: 'Team Insight',
    openInsight: 'Insight →',
    openDynamics: 'Dynamics →',
  },

  modal: {
    any: {
      eyebrow: 'Access code',
      title: 'Enter your access code',
      lead: 'We recognise whether you have access to Team Insight or Team Dynamics — you will land on the right dashboard automatically.',
    },
    dynamics: {
      eyebrow: 'Module 2',
      title: 'Team Dynamics access code',
      lead: 'Enter your access code for Team Dynamics. This code also gives you access to Team Insight.',
    },
    insight: {
      eyebrow: 'Module 1',
      title: 'Team Insight access code',
      lead: 'Enter your access code for Team Insight.',
    },
    placeholder: 'Enter code',
    busy: 'Working…',
    submit: 'Continue',
    close: 'Close',
  },

  errors: {
    empty: 'Please enter an access code first.',
    unknownCode: 'Incorrect or unknown code.',
    insightOnly: 'This code only gives access to Team Insight, not to Team Dynamics.',
    generic: 'Something went wrong. Please try again.',
  },

  footer: {
    backHome: 'Back to home',
    contact: 'Questions? Book a conversation →',
  },
};

export default teamIntro;
