/**
 * quiz — de schil om de vragenlijst heen (src/experimental/quizTest/QuizTest.jsx).
 *
 * De vragen en antwoorden zelf staan in `quizData`; hier staat alleen de
 * navigatie, de instructies en de tussenschermen.
 */
const quiz = {
  // Boven elke basisvraag.
  eyebrow: (count) => `${count} vragen · ± 5 minuten`,

  // De instructiebalk. Het middelste deel staat vet.
  pickTwo: { before: 'Kies ', strong: 'precies 2 antwoorden', after: ' — je eerste keuze weegt het zwaarst.' },
  pickOne: { before: 'Kies ', strong: '1 antwoord', after: ' dat het beste bij jou past.' },

  errors: {
    pickTwo: 'Kies precies 2 antwoorden, in volgorde.',
    pickOne: 'Kies 1 antwoord.',
    saveFailed: 'Je resultaat kon niet worden opgeslagen. Ververs de pagina om het opnieuw te proberen.',
  },

  nextQuestion: 'Volgende vraag',
  toProfile: 'Naar mijn profiel',
  next: 'Volgende',

  // Tussenscherm: profiel staat, verdieping is optioneel.
  profileReady: {
    eyebrow: 'Je profiel staat',
    refine: 'Ja, maak scherper (3 min)',
    done: 'Nee, ik ben klaar',
  },

  deepDive: {
    duelEyebrow: (step, total) => `Verdieping · duel ${step} van ${total}`,
    pressureEyebrow: 'Verdieping · onder druk',
    workplaceEyebrow: 'Verdieping · werkplekgebruik',
    workplaceNowTitle: 'Welke plekken gebruik je nu het meest?',
    workplaceMissTitle: 'Welke plekken mis je?',
    chooseThree: 'Kies er drie.',
    openEyebrow: 'Verdieping · tot slot',
    openHint: (max) => `Optioneel · max ${max} tekens.`,
    showSharper: 'Toon mijn verscherpte profiel',
  },

  sharpened: {
    eyebrow: 'Verscherpt profiel',
    changed: 'Na de verdieping is je hoofdprofiel bijgesteld — de duels beslechtten een nipt gelijkspel.',
    confirmed: 'De verdieping bevestigde je hoofdprofiel en maakte de onderlinge verhouding scherper.',
  },
};

export default quiz;
