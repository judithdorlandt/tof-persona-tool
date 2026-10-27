/**
 * teamIntro — English copy for TeamIntro.jsx.
 * Mirrors the key structure and array lengths of copy/nl/teamIntro.js.
 */
const teamIntro = {
  // The access strip on /team. Explanation and requests live on the story
  // site; here only: who are you and how do you reach your team picture.
  entry: {
    eyebrow: 'Access',
    title: 'Open your team picture',
    bullets: [
      'Team member: the team code shows you Team Insight, without names, unless your team uses the names option, and from five profiles',
      'Manager: log in with the email address linked to your team. Team Dynamics is there too',
      'Fewer than five people in your team? Contact TOF to look together at how the team picture can still work, with privacy in mind',
      'No profile yet? Take the test in the app and add your profile to your team afterwards',
    ],
    // Two routes side by side (assignment C2, approved by Judith 23 Oct 2026).
    codeRoute: {
      label: 'I have a team code',
      placeholder: 'Enter code',
      submit: 'Go to the team picture',
      busy: 'Working…',
      noCode: 'No team code? Ask your manager for it.',
    },
    managerRoute: {
      label: "I'm the manager",
      cta: 'Log in',
      note: "You'll get a login link sent to the email address linked to your team.",
    },
    appCta: 'Take the test in the app →',
    requestLead: 'No team yet?',
    requestLink: 'Request TOF Persona Team →',
  },

  managerWelcome: {
    eyebrow: 'Welcome back',
    titleLead: 'Your team(s) ',
    titleHighlight: 'are ready.',
    lead: 'Select a team below to open its Team Insight dashboard.',
  },

  hero: {
    eyebrow: 'TOF Persona Team',
    titleLead: 'Your team has a pattern.',
    titleHighlight: 'This is where you see it.',
    leadDesktop:
      'Open the team picture with your team code, or log in as manager.',
    leadMobile: 'Open the team picture with your team code, or log in as manager.',
    makerMode: 'Maker mode active',
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
    levelDynamics: 'Team Insight + Team Dynamics',
    levelInsight: 'Team Insight',
    openInsight: 'Go to Team Insight →',
    openDynamics: 'Go to Team Dynamics →',
  },


  errors: {
    empty: 'Please enter an access code first.',
    unknownCode: 'Incorrect or unknown code.',
    generic: 'Something went wrong. Please try again.',
  },

  footer: {
    backHome: 'Back to home',
    contact: 'Questions? Book a conversation →',
  },
};

export default teamIntro;
