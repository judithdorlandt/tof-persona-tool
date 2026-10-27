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
    "Your profile comes from the app and sits in the link that brought you here — nobody else has seen it yet. Below you can see exactly what travels. Enter your team code, tap 'Check code' and then 'Add my profile'. Only then does it go to your team.",

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
      "You can skip this. If your team uses the names option, your teammates and your manager can see your first name next to your working style. Leave it empty and you're included without a name.",
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
      `Your persona has been added to ${team}. From now on it counts towards the team picture.`,
    close: 'You can close this window and go back to the app.',
    once:
      'Once is enough. This browser remembers that you did it, so you cannot accidentally be counted twice.',
    next: 'The team picture is available once at least five profiles have been added. You can open it at team.persona-tool.nl/en/team, with the same team code.',
    privacy: 'Nobody sees who has which working style, not even a manager.',
    privacyNames: 'Your team uses the names option. If you added your first name, everyone in the team can see it, including the manager.',
    cta: 'Go to the team picture',
  },

  // Share moment 1a: pass on your own profile. Only your persona, nothing
  // about your team.
  share: {
    eyebrow: 'Pass it on',
    title: 'Show it to someone who knows you well.',
    text: 'Your profile is yours. The note is ready, with your persona in it. Copy it and send it to whoever you like. It says nothing about your team.',
    button: 'Copy the note',
    copied: 'Copied. Paste it wherever you like and make it sound like you.',
    copyFailed: 'Copying did not work. Please try again.',
    // Without a persona, the second and third sentences drop out.
    message: (persona) => [
      `I did TOF Persona: nine questions about how I work.${
        persona ? ` My main working style came out as ${persona}. Does that sound like me?` : ''
      } I'm curious what yours would be.`,
      '',
      'Look for TOF Persona in the App Store or Google Play. It takes about five minutes, with a short optional follow-up after that.',
    ].join('\n'),
  },

  empty: {
    eyebrow: 'No profile found',
    title: 'There is no profile in this link.',
    body:
      'This page expects a profile from the app. If you got here through the "Add my profile" button in the app, it is in there — if the link was cut short along the way or typed by hand, it is not. No profile yet? Take the test in the app.',
    startTest: 'Get the app',
    backHome: 'Back to home',
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
