const quiz = {
  eyebrow: (count) => `${count} questions · about 5 minutes`,

  pickTwo: { before: 'Pick ', strong: 'exactly 2 answers', after: ' — your first choice carries the most weight.' },
  pickOne: { before: 'Pick ', strong: '1 answer', after: ' that fits you best.' },

  errors: {
    pickTwo: 'Pick exactly 2 answers, in order.',
    pickOne: 'Pick 1 answer.',
    saveFailed: 'We could not save your result. Refresh the page to try again.',
  },

  nextQuestion: 'Next question',
  toProfile: 'Show my profile',
  next: 'Next',

  profileReady: {
    eyebrow: 'Your profile is ready',
    refine: 'Yes, sharpen it (3 min)',
    done: 'No, I am done',
  },

  deepDive: {
    duelEyebrow: (step, total) => `Going deeper · duel ${step} of ${total}`,
    pressureEyebrow: 'Going deeper · under pressure',
    workplaceEyebrow: 'Going deeper · how you use the workplace',
    workplaceNowTitle: 'Which places do you use most right now?',
    workplaceMissTitle: 'Which places do you miss?',
    chooseThree: 'Pick three.',
    openEyebrow: 'Going deeper · one last thing',
    openHint: (max) => `Optional · max ${max} characters.`,
    showSharper: 'Show my sharpened profile',
  },

  sharpened: {
    eyebrow: 'Sharpened profile',
    changed: 'Going deeper shifted your main profile — the duels settled a near tie.',
    confirmed: 'Going deeper confirmed your main profile and sharpened the balance between the others.',
  },
};

export default quiz;
