/**
 * quizInApp — what /quiz shows to anyone arriving without an invitation link.
 *
 * The open "Test yourself" lives in the app. This screen replaces the
 * questionnaire in the browser. It is not an error and not a "page not found":
 * whoever lands here wanted to take the test, so they are told where it is and
 * what to do next with their team code.
 *
 * Anyone arriving through a manager's invitation link (/quiz?org=…&code=…)
 * does NOT see this screen — they take the test in the browser, so the team
 * code comes along automatically (App.js, case 'quiz').
 */
const quizInApp = {
  eyebrow: 'Test yourself',
  title: 'The test lives in the app',
  lead:
    'Take the test in the Persona app. Your answers stay on your own phone there — nothing goes to a server.',

  appStore: 'Download on the App Store',
  googlePlay: 'Get it on Google Play',

  steps: {
    title: 'How it works',
    items: [
      'Download TOF Persona from the App Store or Google Play.',
      'Take the test — five minutes, no account.',
      'Got a team code? Add your profile to your team afterwards.',
    ],
  },

  contribute: {
    title: 'Already have a profile and a team code?',
    body:
      'In the app, tap "Add my profile" on your profile and enter your team code. You first see which team you are joining, and only then does it go through.',
  },

  back: 'To the team area',
};

export default quizInApp;
