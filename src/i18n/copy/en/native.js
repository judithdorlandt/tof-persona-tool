// Copy that only exists in the app: start screen, notes, history and the
// privacy screen.
const native = {
  start: {
    eyebrow: 'On this device',
    // With and without a saved profile the app opens on a different story.
    // If you filled in your first name, the app opens with your name in it.
    // Not as a trick: this is your app, on your device, and that may show.
    title: (name) => (name ? `Welcome back, ${name}.` : 'Welcome back.'),
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
    // The four open questions. The keys match the data model in
    // src/native/localStore.js. You fill in the first three before the
    // conversation and `outcome` afterwards — hence its own block on screen.
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
      outcome: {
        label: 'What came out of it?',
        placeholder: 'What was said, and what will you do?',
      },
    },
  },
  // `add`/`remove` are read aloud; `chipAdd`/`chipDone` appear on screen and so
  // have to be short. `hint` sits once above the list and says where it goes.
  pin: {
    add: 'Add to my conversation',
    remove: 'Remove from my conversation',
    chipAdd: 'Add',
    chipDone: 'Added',
    hint: 'Tap an insight to take it into your conversation.',
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
    // The second block of open questions, after the conversation. Same storage
    // as the three above, a different moment — and so its own heading.
    report: {
      eyebrow: 'Afterwards',
      title: 'What came out of the conversation',
      intro:
        'Write it down while it is still fresh. It belongs to this conversation and travels with it into your history.',
    },
    // Closing a conversation. The page goes blank again and what you wrote down
    // moves to your history, with the date on it. Deliberately one button:
    // closing is starting a new conversation under the same profile.
    close: {
      title: 'Had the conversation?',
      text:
        "Log it with today's date and start with a clean page for your next one. Your profile stays as it is — that changes more slowly than your conversations.",
      button: 'Close and start a new conversation',
      confirm: 'Close this conversation and start with a clean page?',
      confirmYes: 'Yes, close it',
      confirmCancel: 'Not yet',
      done: 'Your conversation is logged. You can read it back below.',
      // Only after closing, as a quiet question. Before the button it would
      // hold you up; here it is a thought for next time.
      personaCheck: (persona) =>
        persona
          ? `Do you still recognise yourself in ${persona}? Your work changes; your profile may move with it.`
          : 'Do you still recognise yourself in your profile? Your work changes; your profile may move with it.',
      personaCheckButton: 'Take the test again',
    },
    // The last closed conversation stays here; the rest live in your history,
    // under the profile they belong to.
    past: {
      title: 'Your previous conversation',
      intro: 'What you wrote down then. Here to read back, nothing more.',
      allButton: 'All conversations in your history',
      // Heading above one closed conversation: "Conversation 2 · 14 October
      // 2026". Numbering runs forward in time, so 1 is the oldest.
      label: (nummer) => `Conversation ${nummer}`,
      noAnswer: 'Nothing written down',
      nothingPinned: 'Nothing pinned',
      formatDate: (iso) =>
        new Date(iso).toLocaleDateString('en-GB', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        }),
    },
  },
  // The step after your own profile: putting your picture next to your team's.
  // That does not happen in the app — the team environment lives on the website,
  // and the app collects nothing for it. Two routes, because there are two
  // situations: your organisation already uses The Office Factory, or not yet.
  //
  // The name is spelled out here rather than shortened to "TOF": this is the
  // one place in the app where you put something to somebody else, and then it
  // should carry a name that means something outside this app too.
  team: {
    eyebrow: 'The next step',
    title: 'This is your picture.',
    intro:
      'It gets genuinely interesting when you put it next to your team: who complements whom, where things start to rub, and what that asks of your workplace. That conversation is about all of you together, and that is what the team environment is for.',
    contribute: {
      title: 'I have a team code',
      text:
        'Your organisation already works with The Office Factory. Add your profile to your team: the website opens with your persona in it, you enter your team code there and decide for yourself whether to send it. The app sends nothing itself.',
      button: 'Add my profile',
    },
    askOrg: {
      title: 'Ask your organisation for The Office Factory',
      text:
        'Not in use with you yet? Put it to your manager or HR. The text is ready; you choose where to open it and edit it yourself — the app sends nothing itself.',
      button: 'Draft an email',
      // The app has no idea where your mail lives. `mailto:` opens the default
      // mail app, which plenty of people never set up — then nothing happens
      // and the button looks broken. Hence the question first, and a last route
      // that always works: copy the text.
      chooseLabel: 'Where is your mail?',
      providers: {
        app: 'My mail app',
        gmail: 'Gmail',
        outlook: 'Outlook',
        copy: 'Copy the text',
      },
      copied: 'Copied. Paste it into a new email.',
      copyFailed: 'Copying did not work. Select the text above yourself.',
      subject: "The Office Factory's Persona tool for our team",
      // Separate lines; they are joined with line breaks.
      body: [
        'Hi,',
        '',
        "I took The Office Factory's Persona test and it gave me a picture of how I work and what I need from my work environment. That turned into a useful conversation with myself.",
        '',
        "What would really help me is putting that picture next to the team's: who complements whom, where the friction sits, and what that asks of our workplaces and working agreements. That is what a team environment is for.",
        '',
        'There is more about the tool on www.persona-tool.nl, and about The Office Factory on www.tof.services. Shall we look at whether this is something for us?',
        '',
        'Best,',
      ],
    },
    // The quiet lines at the bottom, even if you take neither route. Two
    // addresses with two roles: the tool, and the firm behind it.
    siteLabel: 'www.persona-tool.nl',
    siteUrl: 'https://www.persona-tool.nl',
    businessLabel: 'www.tof.services',
    businessUrl: 'https://www.tof.services',
    // NOTE: two different addresses, and that is deliberate. `siteUrl` is the
    // story site — that is where you read what TOF is. `appUrl` is the web app
    // itself, with /contribute, the team space and the questionnaire. Adding a
    // profile has to go to `appUrl`; the story site has no /contribute and
    // would drop you on its front page.
    appUrl: 'https://tof-persona-tool.netlify.app',
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
    // The closed conversations under one profile. They start folded: the
    // history is a list of profiles, and only when you open one do you want to
    // see the conversations underneath.
    conversations: {
      count: (n) => (n === 1 ? '1 conversation' : `${n} conversations`),
      show: 'View conversations',
      hide: 'Hide conversations',
    },
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
          'Your first name, if you filled it in — so the app can greet you by name.',
          'Your answers to the three conversation questions.',
          'The insights you pinned to your conversation.',
          'The conversations you closed, with the date on them.',
          'The language you picked.',
        ],
      },
      {
        title: 'What does not happen',
        text: 'There is no reason for us to know more about you, so we do not:',
        items: [
          'No account, no email address, no password.',
          'Your first name stays on this device; we never see it.',
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
