/**
 * signup — het aanmeldformulier vóór de vragenlijst (QuizAanmelding).
 *
 * Let op: organisatienamen, teamnamen en teamcodes komen uit de database en
 * worden NOOIT vertaald. Alleen de labels en placeholders eromheen staan hier.
 */
const signup = {
  eyebrow: 'Test jezelf — aanmelden',
  // Standaard: de deelnemer kiest organisatie + afdeling.
  title: 'Kies je team',
  // Solo-modus: organisatie en afdeling staan al vast.
  soloTitle: 'Even over jou',
  soloLead: 'Je doet de test voor jezelf. Twee vragen vooraf, dan ga je van start.',

  organizationLabel: 'Organisatie',
  organizationLoading: 'Organisaties laden…',
  organizationPlaceholder: 'Kies je organisatie…',

  departmentLabel: 'Afdeling',
  departmentLoading: 'Afdelingen laden…',
  departmentNeedsOrganization: 'Kies eerst een organisatie…',
  departmentEmpty: 'Geen teams gevonden',
  departmentPlaceholder: 'Kies je afdeling…',

  teamcodeLabel: 'Teamcode',
  teamcodePlaceholder: 'Verschijnt na keuze afdeling',
  teamcodeHint: 'Wordt automatisch ingevuld zodra je een afdeling kiest.',

  firstNameLabel: 'Voornaam',
  firstNamePlaceholder: 'Hoe heet je?',
  firstNameHint: 'Leuk voor je persoonlijke persona als je je naam invult!',

  teamLabel: 'Team',
  teamPlaceholder: 'Laat leeg als je afdeling één team is',

  aboutLabel: 'Meer over jezelf',

  optional: '(optioneel)',
  submit: 'Verder naar de quiz →',

  errors: {
    noConnection: 'Verbinding met de database is niet beschikbaar.',
    loadFailed: 'Kon de teams niet laden. Probeer het later opnieuw.',
    pickOrganization: 'Kies eerst een organisatie.',
    pickDepartment: 'Kies eerst een afdeling.',
  },
};

export default signup;
