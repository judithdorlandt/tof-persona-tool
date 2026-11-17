/**
 * prikkelLink — de losse link voor bestaande teams (/werkomgeving?code=…):
 * één pagina met alleen de werkomgevingsvraag, zonder naamveld en zonder dat
 * je de code invult. Zie src/components/PrikkelLink.jsx.
 *
 * Teken voor teken uit tof-marketingteam/content/teksten-app-prikkelbehoefte.md,
 * §5 en "Aanvulling 17 nov". De vraag en de antwoorden komen uit
 * quizData.werkomgeving.
 */
const prikkelLink = {
  eyebrow: 'Eén vraag voor je team',
  title: 'Hoeveel geluid heb je nodig om goed te werken?',
  intro:
    'Je team gebruikt TOF Persona al. Er is één vraag bijgekomen, zodat het teambeeld ook laat zien hoeveel stilte of reuring jullie nodig hebben. Je profiel verandert er niet door.',
  alGehad: 'Kreeg je deze vraag al toen je je profiel invulde? Dan hoef je niets te doen.',
  privacy:
    'Je antwoord wordt bewaard zonder je naam en zonder je werkstijl, ook als je team de namenoptie gebruikt. Je team ziet alleen een signaal over het hele team, en pas vanaf vijf antwoorden.',
  submit: 'Versturen',
  submitting: 'Versturen…',
  done: {
    eyebrow: 'Gelukt',
    title: 'Dank je, je antwoord is binnen.',
    body: 'Het telt mee in het teambeeld zodra er minstens vijf antwoorden zijn. Je team ziet ook dan alleen een signaal over het hele team. Je kunt dit venster sluiten.',
  },
  // Bij een tweede bezoek in dezelfde browser, in plaats van de vraag.
  alBinnen: 'Je antwoord voor dit team is al binnen. Je hoeft niets meer te doen.',
  ongeldig:
    'Deze link werkt niet: de teamcode klopt niet of is niet meer in gebruik. Vraag de juiste link aan wie hem je stuurde.',
};

export default prikkelLink;
