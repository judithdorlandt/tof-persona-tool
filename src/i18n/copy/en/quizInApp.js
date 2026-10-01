/**
 * quizInApp — what /quiz says once the test lives in the app.
 *
 * This screen replaces the questionnaire in the browser. It is not an error and
 * not a "page not found": whoever lands here wanted to take the test, so they
 * are told where it is and what to do next with their team code. Links from
 * mails that went out earlier also end up here — hence the separate note about
 * the team code.
 */
const quizInApp = {
  eyebrow: 'Test yourself',
  title: 'The test lives in the app',
  lead:
    'The questionnaire has moved to the Persona app. Your answers stay on your own phone there — nothing goes to a server.',

  steps: {
    title: 'How it works',
    items: [
      'Download TOF Persona from the App Store.',
      'Take the test — a few minutes, no account.',
      'Got a team code? Add your profile to your team afterwards.',
    ],
  },

  store: 'Available as TOF Persona in the App Store.',

  contribute: {
    title: 'Already have a profile and a team code?',
    body:
      'Then hand your profile in here. You first see which team you are joining, and only then does it go through.',
    button: 'Add my profile',
  },

  back: 'Back to the team area',
};

export default quizInApp;
