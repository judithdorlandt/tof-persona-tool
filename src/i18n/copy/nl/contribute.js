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
      'Mag je overslaan. Gebruikt je team de namenoptie, dan kunnen je teamleden en je leidinggevende je voornaam bij je werkstijl zien. Laat je het veld leeg, dan sta je er zonder naam in.',
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
    // Waar en wanneer het teambeeld komt (opdracht C5, akkoord Judith 23 okt).
    next: 'Het teambeeld is te zien zodra er minstens vijf profielen zijn ingebracht. Je opent het op team.persona-tool.nl/team, met dezelfde teamcode.',
    privacy: 'Niemand ziet wie welke werkstijl heeft, ook een leidinggevende niet.',
    // Alleen als de namenschakelaar van het team aan staat.
    privacyNames: 'Je team gebruikt de namenoptie. Heb je je voornaam ingevuld, dan kan iedereen in het team hem zien, ook de leidinggevende.',
    cta: 'Naar het teambeeld',
  },

  // Deelmoment 1a (deelteksten 22 okt 2026; `text` besluit Judith 26 okt):
  // je eigen profiel doorvertellen. Alleen je persona, niets over je team.
  share: {
    eyebrow: 'Doorsturen',
    title: 'Laat iemand meelezen die je goed kent.',
    text: 'Je profiel is van jou. De tekst staat klaar, met jouw persona erin. Kopieer hem en stuur hem naar wie je wilt. Over je team staat er niets in.',
    button: 'Tekst kopiëren',
    copied: 'Gekopieerd. Plak hem waar je wilt en maak er je eigen woorden van.',
    copyFailed: 'Kopiëren lukte niet. Probeer het nog een keer.',
    // Zonder persona vervallen de tweede en derde zin.
    message: (persona) => [
      `Ik heb TOF Persona gedaan: negen vragen over hoe ik werk.${
        persona ? ` Ik kom er vooral uit als ${persona}. Herken je me erin?` : ''
      } Ik ben benieuwd wat het bij jou wordt.`,
      '',
      'Zoek op TOF Persona in de App Store of Google Play. Het duurt ongeveer vijf minuten, daarna volgt een korte verdieping als je wilt.',
    ].join('\n'),
  },

  empty: {
    eyebrow: 'Geen profiel gevonden',
    title: 'Er zit geen profiel in deze link.',
    body:
      'Deze pagina verwacht een profiel uit de app. Kom je hier via de knop "Profiel inbrengen" in de app, dan zit het erin — is de link onderweg afgekapt of met de hand ingetypt, dan niet. Nog geen profiel? Doe de test in de app.',
    startTest: 'Naar de app',
    backHome: 'Terug naar home',
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
