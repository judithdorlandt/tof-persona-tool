/**
 * Copy for the contribute page (components/Bijdragen.jsx): where a profile from
 * the app joins a team.
 *
 * The tone is deliberately plain and open: someone is about to hand something
 * of themselves to their employer. That deserves a page that says what travels,
 * where it goes, and what stays behind.
 */
const contribute = {
  eyebrow: 'From your picture to the team picture',
  title: 'Add your profile',
  titleAccent: 'to your team',
  intro:
    'Your profile comes from the app and sits in the link that brought you here — nobody else has seen it yet. Below you can see exactly what travels. It only goes to your team once you click add.',

  payload: {
    heading: 'What travels',
    personaHeading: 'Your persona',
    primaryLabel: 'First',
    secondaryLabel: 'Second',
    tertiaryLabel: 'Third',
    scoresHeading: 'Your working style',
    note:
      'And nothing else. No notes, no answers to open questions, no workplace choices. Whatever you wrote down for your conversation in the app stays on your device.',
  },

  code: {
    label: 'Team code',
    hint: 'The code you were given by your organisation or your manager.',
    placeholder: 'For example TOF-1234',
    check: 'Check code',
    checking: 'One moment…',
    change: 'Use a different code',
  },

  resolved: {
    label: 'You are contributing to',
  },

  name: {
    label: 'Your first name',
    hint:
      'You can skip this. A first name helps your manager have the conversation with you; without one you only count towards the team picture.',
    placeholder: 'First name',
  },

  submit: 'Add my profile',
  submitting: 'Sending…',

  already: {
    body: (team) =>
      `This profile is already in ${team}. Adding it again would have you counted twice, so we stop that here.`,
    anyway: 'Add it again anyway',
  },

  done: {
    eyebrow: 'Done',
    title: 'Your profile is in.',
    body: (team) =>
      `Your persona has been added to ${team}. From now on it counts towards the team picture — and towards the picture of the whole organisation. You can close this window and go back to the app.`,
    once:
      'Once is enough. This browser remembers that you did it, so you cannot accidentally be counted twice.',
  },

  empty: {
    eyebrow: 'No profile found',
    title: 'There is no profile in this link.',
    body:
      'This page expects a profile from the app. If you got here through the "Add my profile" button in the app, it is in there — if the link was cut short along the way or typed by hand, it is not. You can also take the test here; then you pick your team as you go.',
    startTest: 'Take the test here',
    backHome: 'Read the introduction',
  },

  errors: {
    codeRequired: 'Please enter your team code first.',
    codeUnknown:
      'We do not know this code, or it is no longer in use. Please check it with your organisation.',
    codeCheckFailed: 'We could not check the code just now. Please try again.',
    saveFailed: 'Adding your profile did not work. Please try again.',
  },
};

export default contribute;
