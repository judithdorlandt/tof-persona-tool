// Copy that only exists in the app: notes and history.
const native = {
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
    eyebrow: 'For your conversation',
    title: 'Your conversation prep',
    intro:
      'Everything you pinned and wrote down, on one screen. Stays on your device.',
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
    notesTitle: 'Your answers',
    notesEmpty: 'You have not answered the three questions yet.',
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
    confirmRemove: 'Remove this profile from your device?',
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
};

export default native;
