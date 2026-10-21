/**
 * teamIntro — alle teksten van TeamIntro.jsx: de toegang tot /team (hero en
 * toegangsstrook), de manager-welkom, het toegangspaneel en de toegangsmodal.
 *
 * Sinds 21 okt 2026 geen verkoopintro met module-kaarten meer; die uitleg
 * staat op www.persona-tool.nl/voor-je-team.
 */
const teamIntro = {
  // De toegangsstrook op /team. Uitleg en aanvraag staan op de verhaalsite;
  // hier alleen: wie ben je en hoe kom je bij je teambeeld.
  entry: {
    eyebrow: 'Toegang',
    title: 'Naar je teambeeld',
    hook: 'Met de teamcode van je team open je het teambeeld. Leid je het team, log dan hieronder in met je mailadres.',
    bullets: [
      'Teamlid: met de teamcode zie je Teaminzicht, zonder namen en vanaf vijf profielen',
      'Leidinggevende: log in met het mailadres dat aan je team gekoppeld is. Daar staat ook Teamdynamiek',
      'Minder dan vijf mensen in je team? Neem contact op met TOF om samen te kijken hoe het teambeeld toch kan, met oog voor privacy',
      'Nog geen profiel? Doe de test in de app en breng je profiel daarna in bij je team',
    ],
    cta: 'Ik heb een teamcode',
    appCta: 'Doe de test in de app →',
    requestLead: 'Nog geen team?',
    requestLink: 'Vraag TOF Persona Team aan →',
  },

  managerWelcome: {
    eyebrow: 'Welkom terug',
    greeting: (name) => `Hoi ${name}, `,
    greetingHighlight: 'jouw team(s) staan klaar.',
    titleLead: 'Jouw team(s) ',
    titleHighlight: 'staan klaar.',
    lead: 'Klik op een team hieronder om het Teaminzicht-dashboard te openen.',
  },

  hero: {
    eyebrow: 'TOF Persona Team',
    titleLead: 'Jouw team heeft een patroon.',
    titleHighlight: 'Hier zie je het.',
    leadDesktop:
      'Open het teambeeld met je teamcode, of log in als leidinggevende.',
    leadMobile: 'Open het teambeeld met je teamcode, of log in als leidinggevende.',
    makerMode: 'Maker mode actief',
  },

  magicLink: {
    eyebrow: 'Leid je een team? Log in met je mailadres',
    body:
      'Inloggen kan met het mailadres dat aan je team gekoppeld is. Nog geen team? Vraag een teamcode aan op www.persona-tool.nl.',
    cta: 'Naar inloggen →',
  },

  access: {
    title: 'Jouw toegang',
    adminBadge: 'BEHEERDER',
    adminLead: 'Je bent ingelogd als beheerder en hebt toegang tot alle teams via de teamselector.',
    oneTeam: 'Je hebt toegang tot dit team.',
    manyTeams: (n) => `Je hebt toegang tot ${n} teams.`,
    logout: 'Uitloggen',
    adminNoTeams: 'Kies een team uit het overzicht om te openen.',
    // Inzicht en Dynamiek zijn samen Module 2 geworden, dus "upgrade naar
    // Dynamiek" bestaat niet meer als los product. De volgende stap is Module 3.
    upgradeLead: 'Meerdere teams in beeld brengen?',
    upgradeLink: 'Vraag naar het Organisatielandschap →',
    teamFallback: 'Team',
    levelDynamics: 'Teaminzicht + Dynamiek',
    levelInsight: 'Teaminzicht',
    openInsight: 'Inzicht →',
    openDynamics: 'Dynamiek →',
  },

  modal: {
    any: {
      eyebrow: 'Toegangscode',
      title: 'Voer je toegangscode in',
      lead: 'We herkennen zelf of je toegang hebt tot Teaminzicht of Teamdynamiek — je komt automatisch op het juiste dashboard.',
    },
    dynamics: {
      eyebrow: 'TOF Persona Team',
      title: 'Toegangscode Teamdynamiek',
      lead: 'Voer je toegangscode voor Teamdynamiek in. Deze code geeft ook toegang tot Teaminzicht.',
    },
    insight: {
      eyebrow: 'TOF Persona Team',
      title: 'Toegangscode Teaminzicht',
      lead: 'Voer je toegangscode voor Teaminzicht in.',
    },
    placeholder: 'Voer code in',
    busy: 'Bezig…',
    submit: 'Ga verder',
    close: 'Sluiten',
  },

  errors: {
    empty: 'Voer eerst een toegangscode in.',
    unknownCode: 'Onjuiste of onbekende code.',
    managerOnly: 'Teamdynamiek is voor de teammanager. Log in met het mailadres dat aan dit team gekoppeld is — met een code kom je er niet in.',
    generic: 'Er ging iets mis. Probeer het opnieuw.',
  },

  footer: {
    backHome: 'Terug naar home',
    contact: 'Vragen? Plan een gesprek →',
  },
};

export default teamIntro;
