/**
 * quizInApp — wat er op /quiz staat zodra de test in de app zit.
 *
 * Dit scherm vervangt de vragenlijst in de browser. Het is geen foutmelding en
 * geen "pagina bestaat niet": iemand die hier komt wilde de test doen, dus hij
 * krijgt te horen waar die staat en wat hij daarna met zijn teamcode doet.
 * Oude links uit verstuurde mails komen hier ook terecht — vandaar dat de
 * teamcode apart genoemd wordt.
 */
const quizInApp = {
  eyebrow: 'Test jezelf',
  title: 'De test zit in de app',
  lead:
    'De vragenlijst is verhuisd naar de Persona-app. Daar blijven je antwoorden op je eigen telefoon staan — er gaat niets naar een server.',

  steps: {
    title: 'Zo werkt het',
    items: [
      'Download TOF Persona in de App Store.',
      'Doe de test — een paar minuten, zonder account.',
      'Heb je een teamcode? Breng je profiel daarna in bij je team.',
    ],
  },

  store: 'Te downloaden als TOF Persona in de App Store.',

  contribute: {
    title: 'Al een profiel en een teamcode?',
    body:
      'Dan lever je je profiel hier in. Je ziet eerst bij welk team je terechtkomt, en pas daarna gaat het mee.',
    button: 'Profiel inbrengen',
  },

  back: 'Terug naar de teamomgeving',
};

export default quizInApp;
