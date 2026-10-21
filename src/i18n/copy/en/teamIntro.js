/**
 * teamIntro — English copy for TeamIntro.jsx.
 * Mirrors the key structure and array lengths of copy/nl/teamIntro.js.
 */
const teamIntro = {
  // The access strip on /team. Explanation and requests live on the story
  // site; here only: who are you and how do you reach your team picture.
  entry: {
    eyebrow: 'Access',
    title: 'To your team picture',
    hook: 'Open the team picture with your team code. Leading the team? Then log in below with your email.',
    bullets: [
      'Team member: the team code shows you the team picture — no names, from five profiles',
      'Team lead: log in with the email address linked to your team, including Team Dynamics',
      'No profile yet? Take the test in the app and add your profile to your team afterwards',
    ],
    cta: 'I have a team code',
    appCta: 'Take the test in the app →',
    requestLead: 'No team yet?',
    requestLink: 'Request TOF Persona Team →',
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
    eyebrow: 'TOF Persona Team',
    titleLead: 'Your team has a pattern.',
    titleHighlight: 'This is where you see it.',
    leadDesktop:
      'Open the team picture with your team code, or log in as team lead.',
    leadMobile: 'Open the team picture with your team code, or log in as team lead.',
    makerMode: 'Maker mode active',
  },

  magicLink: {
    eyebrow: 'Leading a team? Log in with your email',
    body:
      'Log in with the email address linked to your team. No team yet? Request a team code at www.persona-tool.nl.',
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
      eyebrow: 'TOF Persona Team',
      title: 'Team Dynamics access code',
      lead: 'Enter your access code for Team Dynamics. This code also gives you access to Team Insight.',
    },
    insight: {
      eyebrow: 'TOF Persona Team',
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
    managerOnly: 'Team Dynamics is for the team manager. Sign in with the email address linked to this team — a code will not open it.',
    generic: 'Something went wrong. Please try again.',
  },

  footer: {
    backHome: 'Back to home',
    contact: 'Questions? Book a conversation →',
  },
};

export default teamIntro;
