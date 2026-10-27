/**
 * teamIntro — alle teksten van TeamIntro.jsx: de toegang tot /team (hero en
 * toegangsstrook met twee routes), de manager-welkom en het toegangspaneel.
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
    bullets: [
      'Teamlid: met de teamcode zie je Teaminzicht, zonder namen, tenzij je team de namenoptie gebruikt, en vanaf vijf profielen',
      'Leidinggevende: log in met het mailadres dat aan je team gekoppeld is. Daar staat ook Teamdynamiek',
      'Minder dan vijf mensen in je team? Neem contact op met TOF om samen te kijken hoe het teambeeld toch kan, met oog voor privacy',
      'Nog geen profiel? Doe de test in de app en breng je profiel daarna in bij je team',
    ],
    // Twee routes naast elkaar (opdracht C2, akkoord Judith 23 okt 2026).
    codeRoute: {
      label: 'Ik heb een teamcode',
      placeholder: 'Voer code in',
      submit: 'Naar het teambeeld',
      busy: 'Bezig…',
      noCode: 'Geen teamcode? Vraag hem aan je leidinggevende.',
    },
    managerRoute: {
      label: 'Ik ben de leidinggevende',
      cta: 'Inloggen',
      note: 'Je krijgt een inloglink op het mailadres dat aan je team gekoppeld is.',
    },
    appCta: 'Doe de test in de app →',
    requestLead: 'Nog geen team?',
    requestLink: 'Vraag TOF Persona Team aan →',
  },

  managerWelcome: {
    eyebrow: 'Welkom terug',
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
    levelDynamics: 'Teaminzicht + Teamdynamiek',
    levelInsight: 'Teaminzicht',
    openInsight: 'Naar Teaminzicht →',
    openDynamics: 'Naar Teamdynamiek →',
  },


  errors: {
    empty: 'Voer eerst een toegangscode in.',
    unknownCode: 'Onjuiste of onbekende code.',
    generic: 'Er ging iets mis. Probeer het opnieuw.',
  },

  footer: {
    backHome: 'Terug naar home',
    contact: 'Vragen? Plan een gesprek →',
  },
};

export default teamIntro;
