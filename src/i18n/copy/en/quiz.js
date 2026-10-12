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
    eyebrow: 'Your profile is calculated',
    closeTitle: 'Two personas finish almost level',
    closeBody:
      'Two of the eight end up nearly tied. Which of them comes out on top is a matter of a few points right now. A couple of short choices settle it.',
    clearTitle: 'One persona clearly stands out',
    clearBody:
      'Your answers point one way, and going deeper will not change much about that. Do it for yourself \u2014 and for the conversation you will have about it.',
    refine: 'Yes, sharpen it (3 min)',
    done: 'Show my profile',
    saveHint: 'Either way: after this your profile is settled and saved.',
  },

  reveal: {
    eyebrow: 'Your persona',
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
    basisEyebrow: 'Your profile',
    basis: 'This is your profile, based on your nine answers.',
    changed: 'Going deeper shifted your main profile — the duels settled a near tie.',
    confirmed: 'Going deeper confirmed your main profile and sharpened the balance between the others.',
  },
};

export default quiz;
