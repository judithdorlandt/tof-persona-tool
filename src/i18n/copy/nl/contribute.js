/**
 * Teksten van de bijdragen-pagina (components/Bijdragen.jsx): de plek waar een
 * profiel uit de app bij een team terechtkomt.
 *
 * De toon is hier bewust zakelijk en open: iemand staat op het punt iets van
 * zichzelf af te staan aan zijn werk. Dan hoort er te staan wat er meegaat,
 * waar het heen gaat en wat er niet meegaat.
 */
const contribute = {
  eyebrow: 'Van jouw beeld naar het teambeeld',
  title: 'Breng je profiel in',
  titleAccent: 'bij je team',
  intro:
    'Je profiel komt uit de app en staat in de link waarmee je hier bent gekomen — het is nog niemand anders onder ogen gekomen. Hieronder zie je precies wat er meegaat. Pas als je op inbrengen klikt, gaat het naar je team.',

  payload: {
    heading: 'Dit gaat mee',
    personaHeading: 'Je persona',
    primaryLabel: 'Eerste',
    secondaryLabel: 'Tweede',
    tertiaryLabel: 'Derde',
    scoresHeading: 'Je werkstijl',
    note:
      'En niets anders. Geen aantekeningen, geen antwoorden op open vragen, geen werkplekkeuzes. Wat je in de app bij je gesprek hebt opgeschreven blijft op je toestel staan.',
  },

  code: {
    label: 'Teamcode',
    hint: 'De code die je van je organisatie of leidinggevende hebt gekregen.',
    placeholder: 'Bijvoorbeeld TOF-1234',
    check: 'Code controleren',
    checking: 'Even kijken…',
    change: 'Andere code invullen',
  },

  resolved: {
    label: 'Je draagt bij aan',
  },

  name: {
    label: 'Je voornaam',
    hint:
      'Mag je overslaan. Een voornaam helpt je leidinggevende het gesprek met jou te voeren; zonder naam tel je alleen mee in het teambeeld.',
    placeholder: 'Voornaam',
  },

  submit: 'Inbrengen',
  submitting: 'Versturen…',

  already: {
    body: (team) =>
      `Dit profiel staat al bij ${team}. Nog een keer inbrengen zou je dubbel laten meetellen, dus dat houden we hier tegen.`,
    anyway: 'Toch opnieuw inbrengen',
  },

  done: {
    eyebrow: 'Gelukt',
    title: 'Je profiel staat erbij.',
    body: (team) =>
      `Je persona is toegevoegd aan ${team}. Vanaf nu telt hij mee in het teambeeld — en in het beeld van de hele organisatie. Je kunt dit venster sluiten en terug naar de app.`,
    once:
      'Eén keer is genoeg. Deze browser onthoudt dat je het hebt gedaan, dus je kunt niet per ongeluk dubbel meetellen.',
  },

  empty: {
    eyebrow: 'Geen profiel gevonden',
    title: 'Er zit geen profiel in deze link.',
    body:
      'Deze pagina verwacht een profiel uit de app. Kom je hier via de knop "Profiel inbrengen" in de app, dan zit het erin — is de link onderweg afgekapt of met de hand ingetypt, dan niet. Je kunt de test ook hier doen; dan kies je meteen je team.',
    startTest: 'Doe de test hier',
    backHome: 'Naar de uitleg',
  },

  errors: {
    codeRequired: 'Vul eerst je teamcode in.',
    codeUnknown:
      'Deze code kennen we niet, of hij is niet meer in gebruik. Kijk hem na bij je organisatie.',
    codeCheckFailed: 'We konden de code even niet controleren. Probeer het nog eens.',
    saveFailed: 'Het inbrengen is niet gelukt. Probeer het nog eens.',
  },
};

export default contribute;
