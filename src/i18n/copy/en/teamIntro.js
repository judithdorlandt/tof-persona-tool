/**
 * teamIntro — English copy for TeamIntro.jsx.
 * Mirrors the key structure and array lengths of copy/nl/teamIntro.js.
 */
const teamIntro = {
  modules: {
    insight: {
      eyebrow: 'Module 1 · For teams',
      title: 'Team Insight & Quick Wins',
      hook: 'You know who is in your team. But do you know how the team really works?',
      bullets: [
        'See at a glance which working styles dominate',
        'Discover where the energy sits — and where friction appears',
        'Get a clear workplace need for every team',
        'Four concrete quick wins you can apply tomorrow',
      ],
      what: 'A team dashboard ready for a team meeting, a workplace decision or a leadership conversation.',
      cta: 'Go to the Team space',
    },
    dynamics: {
      eyebrow: 'Module 2 · For teams & organisations',
      title: 'Team Dynamics Session',
      hook: 'You can see the distribution. But why does collaboration sometimes stall?',
      bullets: [
        'Tensions between personas made visible',
        'Insight into why pace, structure and decision-making collide',
        'Concrete leadership implications for every persona combination',
        'Live guidance — online or on site',
      ],
      what: 'A deeper dashboard, talked through in a session. From insight to action.',
      cta: 'Go to Team Dynamics',
    },
    strategic: {
      eyebrow: 'Module 3 · For leadership teams, boards and property',
      title: 'The Strategic Compass',
      hook: 'What the world asks of you, translated into who your team is.',
      bullets: [
        'Trend radar: 8 curated trends on work, leadership and AI',
        'Persona overlay: which trends hit your team hardest',
        'Strategic choices for leadership, the working environment and culture',
        'A living direction document — updated every year, not a plan in a drawer',
      ],
      what: 'A Strategic Compass document (around 20 pages) plus a half-day leadership session. An 8 to 12 week journey, fully tailored.',
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
    upgradeLead: 'Need more than Team Insight?',
    upgradeLink: 'Request Dynamics access →',
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
