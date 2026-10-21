/**
 * quizInApp — wat er op /quiz staat voor wie zonder uitnodigingslink komt.
 *
 * De vrije "Test jezelf" zit in de app. Dit scherm vervangt de vragenlijst in
 * de browser. Het is geen foutmelding en geen "pagina bestaat niet": iemand die
 * hier komt wilde de test doen, dus hij krijgt te horen waar die staat en wat
 * hij daarna met zijn teamcode doet.
 *
 * Wie via een uitnodigingslink van een manager komt (/quiz?org=…&code=…), ziet
 * dit scherm NIET — die doet de test gewoon in de browser, zodat de teamcode
 * vanzelf meegaat (App.js, case 'quiz').
 */
const quizInApp = {
  eyebrow: 'Test jezelf',
  title: 'De test zit in de app',
  lead:
    'Doe de test in de Persona-app. Daar blijven je antwoorden op je eigen telefoon staan — er gaat niets naar een server.',

  appStore: 'Download in de App Store',
  googlePlay: 'Download in Google Play',

  steps: {
    title: 'Zo werkt het',
    items: [
      'Download TOF Persona in de App Store of Google Play.',
      'Doe de test — vijf minuten, zonder account.',
      'Heb je een teamcode? Breng je profiel daarna in bij je team.',
    ],
  },

  contribute: {
    title: 'Al een profiel en een teamcode?',
    body:
      'Tik in de app bij je profiel op "Profiel inbrengen" en vul je teamcode in. Je ziet eerst bij welk team je terechtkomt, en pas daarna gaat het mee.',
  },

  back: 'Naar de teamomgeving',
};

export default quizInApp;
