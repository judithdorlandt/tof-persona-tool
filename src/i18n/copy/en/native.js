// Copy that only exists in the app: notes and history.
const native = {
  notes: {
    eyebrow: 'For your eyes only',
    title: 'Your notes',
    intro:
      'What rings true, and what do you want to remember? This note stays on your device and is never sent anywhere.',
    placeholder: 'What do you want to hold on to about yourself?',
    saved: 'Saved on this device',
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
