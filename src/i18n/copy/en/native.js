// Copy that only exists in the app: start screen, notes, history and the
// privacy screen.
const native = {
  start: {
    eyebrow: 'On this device',
    // With and without a saved profile the app opens on a different story.
    title: 'Welcome back.',
    intro:
      'This is the profile you are looking at. It lives on your device and goes nowhere else.',
    emptyTitle: 'Find out how you work.',
    emptyIntro:
      'Nine questions, a few minutes. After that you will know which workplace brings out your best — and it stays right here, for your eyes only.',
    profileEyebrow: 'Your profile',
    openProfile: 'View your profile',
    startTest: 'Take the test',
    // Quiet footer line at the bottom of the start screen.
    privacyLink: 'What this app keeps about you',
    // The three next steps below the profile card.
    actions: {
      history: {
        title: 'History',
        text: 'What shifts for you over time.',
      },
      library: {
        title: 'All personas',
        text: 'The eight profiles side by side.',
      },
      again: {
        title: 'Test again',
        text: 'New job, new situation? Take the test again.',
      },
    },
    // Completion date without the time: on the start screen the year is enough.
    formatDate: (iso) =>
      new Date(iso).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }),
  },
  notes: {
    eyebrow: 'For your eyes only',
    title: 'Your notes',
    intro:
      'Three questions to prepare your conversation. What you write down stays on your device and is never sent anywhere.',
    saved: 'Saved on this device',
    // The three open questions. The keys match the data model in
    // src/native/localStore.js.
    fields: {
      recognize: {
        label: 'What do I recognise in this?',
        placeholder: 'What rings true for you, and what does not?',
      },
      drains: {
        label: 'What is costing me energy in my work or workplace right now?',
        placeholder: 'What are you running into?',
      },
      ask: {
        label: 'What do I want to discuss or ask?',
        placeholder: 'What do you want to talk about?',
      },
    },
  },
  pin: {
    add: 'Add to my conversation',
    remove: 'Remove from my conversation',
  },
  prep: {
    // It is one specific conversation: the one with your manager.
    eyebrow: 'With your manager',
    title: 'Your conversation prep',
    intro:
      'Everything you pinned and wrote down for your next conversation with your manager — a one-to-one, a review, or simply a good talk. Stays on your device.',
    // Your persona's leadership points, in the first person. They used to be a
    // chapter in your profile, but were written to a manager about you. Here
    // they are what they should be: lines you can say yourself.
    needsTitle: 'What I need from my manager',
    needsIntro:
      'This comes with your persona. Take what rings true, and leave the rest.',
    pinnedTitle: 'What you pinned',
    // Headings above a pinned insight, per kind. The keys match `kind` in
    // src/native/localStore.js.
    kinds: {
      workplace: 'Workplace',
      leadership: 'Leadership',
      energy: 'What gets me moving',
      drain: 'What drains me',
    },
    pinnedEmpty:
      'You have not pinned anything yet. Tap the plus next to an insight in your profile.',
    backToProfile: 'Back to your profile',
  },
  history: {
    eyebrow: 'On this device',
    title: 'Your history',
    intro:
      'Every time you finish the test, your profile lands here. That way you can see what shifts over time. Everything stays on your device.',
    empty: 'You have not saved a profile yet. Finish the test and it will appear here.',
    startTest: 'Take the test',
    backHome: 'Back to start',
    current: 'You are viewing this profile',
    view: 'View',
    remove: 'Remove',
    // Swiping is invisible; one line above the list points the way.
    swipeHint: 'Swipe a profile to the left to remove it.',
    // Removing never happens in one go: the card asks first.
    confirmRemove: 'Remove this profile from your device?',
    confirmYes: 'Yes, remove it',
    confirmCancel: 'Keep it',
    hasNote: 'Has a note',
    mixLabel: 'Alongside',
    formatDate: (iso) =>
      new Date(iso).toLocaleString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
  },
  privacy: {
    eyebrow: 'Your data',
    title: 'Everything stays on your device',
    intro:
      'This app sends nothing to us or to anyone else. There is no account, no server and no internet connection needed. Below is exactly what is kept, and how to wipe it in one go.',
    // Four blocks. `items` is an optional list below the text.
    sections: [
      {
        title: 'What is kept',
        text: 'Only what you make in the app yourself, stored inside the app:',
        items: [
          'Your persona profile: the outcome of the test and the date.',
          'Your answers to the three conversation questions.',
          'The insights you pinned to your conversation.',
          'The language you picked.',
        ],
      },
      {
        title: 'What does not happen',
        text: 'There is no reason for us to know more about you, so we do not:',
        items: [
          'No account, no email address, no password.',
          'Your first name is only shown on screen during the test and is not kept.',
          'No analytics, no trackers, no advertising.',
          'No access to your contacts, location, camera or files.',
        ],
      },
      {
        title: 'Who can see it',
        text: 'Only whoever can unlock your device. We cannot: there is no copy anywhere else. Delete the app and everything in it goes with it.',
      },
      {
        title: 'Why it works this way',
        text: 'Anyone who knows their manager might read along will not write down what is really going on. An honest conversation starts with notes that are yours alone.',
      },
    ],
    eraseTitle: 'Erase everything',
    eraseText:
      'This wipes every profile, answer and pinned insight from this device in one go. It cannot be undone.',
    eraseCount: (n) =>
      n === 1
        ? 'There is 1 profile on this device.'
        : `There are ${n} profiles on this device.`,
    eraseEmpty: 'There is nothing on this device right now.',
    eraseButton: 'Erase everything',
    eraseConfirm: 'Are you sure? Everything you wrote down will be gone.',
    eraseYes: 'Yes, erase everything',
    eraseCancel: 'Keep it',
    eraseDone: 'Everything has been erased from this device.',
    backHome: 'Back to start',
    updated: 'Last updated: 30 September 2026',
  },
  tabs: {
    label: 'Main menu',
    profile: 'Profile',
    conversation: 'Conversation',
    history: 'History',
    library: 'Personas',
    pinnedCount: (n) => (n === 1 ? '1 insight pinned' : `${n} insights pinned`),
  },
  // The other way round from Dutch: in English, Bricks · Bytes · Behavior ·
  // Belonging are current workplace terms, so they belong on the buttons. The
  // plain word sits above the chapter instead — see `chapterHeads`.
  chapters: {
    label: 'Part of your profile',
    motion: 'Energy',
    workplace: 'Bricks',
    bytes: 'Bytes',
    behavior: 'Behavior',
    culture: 'Belonging',
  },
  chapterHeads: {
    workplace: { label: 'Workplace', title: 'Your ideal workplace mix' },
    bytes: { label: 'Digital', title: 'What you need digitally' },
    behavior: { label: 'Behaviour', title: 'Where it starts to chafe for you' },
    culture: { label: 'Culture', title: 'Your place among your colleagues' },
  },
};

export default native;
