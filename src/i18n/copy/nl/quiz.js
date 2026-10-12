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

  // Het keuzemoment na de negen vragen. Je profiel is dan wél berekend maar
  // nog niet in beeld: welke knop je ook kiest, je komt via de onthulling bij
  // je profiel en pas daar wordt het bewaard. Twee toonzettingen — als de
  // nummers 1 en 2 vlak bij elkaar liggen duwen we richting de verdieping,
  // anders is die vooral voor jezelf. De persona's worden bewust niet
  // genoemd; dat zou de onthulling verklappen.
  profileReady: {
    eyebrow: 'Je profiel is berekend',
    closeTitle: 'Twee persona\u2019s liggen vlak bij elkaar',
    closeBody:
      'Twee van de acht eindigen bijna gelijk. Welke van die twee bovenaan komt, scheelt nu maar een paar punten. Met een paar korte keuzes beslecht je dat zelf.',
    clearTitle: 'E\u00e9n persona komt er duidelijk uit',
    clearBody:
      'Je antwoorden wijzen \u00e9\u00e9n kant op; daar verandert de verdieping weinig aan. Doe hem vooral voor jezelf \u2014 en voor het gesprek dat je erover voert.',
    refine: 'Ja, maak scherper (3 min)',
    done: 'Toon mijn profiel',
    saveHint: 'Wat je ook kiest: hierna staat je profiel vast en wordt het bewaard.',
  },

  // Het onthullingsmoment vlak voordat je profiel in beeld komt.
  reveal: {
    eyebrow: 'Jouw persona',
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
    // Wie de verdieping oversloeg krijgt deze regel: er valt niets te
    // vergelijken, dus doe ook niet alsof.
    basisEyebrow: 'Je profiel',
    basis: 'Dit is je profiel, op basis van je negen antwoorden.',
    changed: 'Na de verdieping is je hoofdprofiel bijgesteld — de duels beslechtten een nipt gelijkspel.',
    confirmed: 'De verdieping bevestigde je hoofdprofiel en maakte de onderlinge verhouding scherper.',
  },
};

export default quiz;
