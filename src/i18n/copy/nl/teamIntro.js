/**
 * teamIntro — alle teksten van TeamIntro.jsx (de verkoopintro voor de modules,
 * de manager-welkom, het toegangspaneel en de toegangsmodal).
 *
 * De module-ids hier zijn presentatie-sleutels. Ze staan los van de
 * niveau-sleutels in utils/access.js (insight/dynamics/strategic): die blijven
 * ongewijzigd, zodat alle bestaande toegangscodes gewoon blijven werken.
 *
 * De ladder loopt per publiek, niet per product: ik → wij → het geheel → de
 * koers. Module 1 is de gratis ingang en staat daarom apart boven de drie
 * betaalde kaarten; als vierde prijskaart zou "gratis" lezen als proefversie.
 */
const teamIntro = {
  modules: {
    app: {
      eyebrow: 'Module 1 · Voor iedereen',
      title: 'De Persona-app',
      hook: 'Begin bij jezelf. Gratis, in een paar minuten, zonder account.',
      bullets: [
        'Je eigen profiel: waar je energie van krijgt en waar je leegloopt',
        'Wat dat betekent voor je werkplek en je afspraken',
        'Alles blijft op je telefoon — er gaat niets naar een server',
        'Heb je een teamcode? Dan voeg je je profiel toe aan je team',
      ],
      cta: 'Ik heb een teamcode',
      store: 'Te downloaden als TOF Persona in de App Store.',
      storeSoon: 'Binnenkort in de App Store.',
      webCta: 'Of doe de test hier →',
    },
    teams: {
      eyebrow: 'Module 2 · Voor teams',
      title: 'Team Insight & Dynamics',
      hook: 'Je weet wie er in je team zit. Maar weet je ook hoe het team écht werkt?',
      bullets: [
        'Zie in één oogopslag welke werkstijlen domineren',
        'Ontdek waar energie zit — en waar wrijving ontstaat',
        'Begrijp waarom tempo, structuur en besluitvorming botsen',
        'Werkplekbehoefte en concrete quick wins per team',
        'Live sessie waarin we het samen lezen — online of op locatie',
      ],
      what: 'Eén teamdashboard plus de sessie waarin het gesprek ontstaat. Inzicht en duiding horen bij elkaar, dus je koopt ze niet meer apart.',
      cta: 'Naar de teamomgeving',
    },
    bedrijf: {
      eyebrow: 'Module 3 · Voor directie & huisvesting',
      title: 'Het Organisatie-landschap',
      hook: 'Eén team is een momentopname. Pas meerdere teams laten het patroon zien.',
      bullets: [
        'Alle teams naast elkaar: waar zit de dominante werkstijl, waar de uitzondering',
        'Werkstijl per afdeling, en wat dat vraagt van de huisvesting',
        'Patronen die je op teamniveau niet kunt zien',
        'Duiding voor directie, HR en huisvesting in één taal',
      ],
      what: 'Een rapport over je hele organisatie plus een directiesessie. Het landschap ontstaat vanaf drie teams.',
      cta: 'Plan een gesprek',
    },
    strategic: {
      eyebrow: 'Module 4 · Voor MT & bestuur',
      title: 'Het Strategisch Kompas',
      hook: 'Wat de wereld vraagt, vertaald naar wie je team is.',
      bullets: [
        'Trend-radar: 8 gecureerde trends over werk, leiderschap en AI',
        'Persona-overlay: welke trends raken juist jullie organisatie het hardst',
        'Strategische keuzes voor leiderschap, werkomgeving en cultuur',
        'Levend richtingsdocument — jaarlijks bijgewerkt, geen plan in een la',
      ],
      what: 'Een traject van vier maanden: intake, Strategisch Kompas-document (~20 pagina\'s), MT-sessie en review. Volledig op maat.',
      cta: 'Ontdek het Strategisch Kompas',
    },
  },

  card: {
    whatYouGet: 'Wat je krijgt',
    showLess: 'Minder tonen',
    showMore: 'Ontdek wat dit inhoudt →',
  },

  managerWelcome: {
    eyebrow: 'Welkom terug',
    greeting: (name) => `Hoi ${name}, `,
    greetingHighlight: 'jouw team(s) staan klaar.',
    titleLead: 'Jouw team(s) ',
    titleHighlight: 'staan klaar.',
    lead: 'Klik op een team hieronder om het Team Insight-dashboard te openen.',
  },

  hero: {
    eyebrow: 'Voor teams & organisaties',
    titleLead: 'Jouw team heeft een patroon.',
    titleHighlight: 'Tijd om het te zien.',
    leadDesktop:
      'Elk team werkt anders — en dat patroon is zichtbaar te maken. Kies het niveau dat bij jouw vraag past.',
    leadMobile: 'Elk team werkt anders. Kies het niveau dat bij jouw vraag past.',
    makerMode: 'Maker mode actief',
  },

  magicLink: {
    eyebrow: 'Al een samenwerking met TOF? Log in met magic-link',
    body:
      'Magic-link toegang is alleen beschikbaar voor teams waarmee we een traject zijn gestart. Nog geen samenwerking? Plan eerst een gesprek hieronder.',
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
    // Insight en Dynamics zijn samen Module 2 geworden, dus "upgrade naar
    // Dynamics" bestaat niet meer als los product. De volgende stap is Module 3.
    upgradeLead: 'Meerdere teams in beeld brengen?',
    upgradeLink: 'Vraag naar het Organisatie-landschap →',
    teamFallback: 'Team',
    levelDynamics: 'Team Insight + Dynamics',
    levelInsight: 'Team Insight',
    openInsight: 'Insight →',
    openDynamics: 'Dynamics →',
  },

  modal: {
    any: {
      eyebrow: 'Toegangscode',
      title: 'Voer je toegangscode in',
      lead: 'We herkennen zelf of je toegang hebt tot Team Insight of Team Dynamics — je komt automatisch op het juiste dashboard.',
    },
    dynamics: {
      eyebrow: 'Module 2',
      title: 'Toegangscode Team Dynamics',
      lead: 'Voer je toegangscode voor Team Dynamics in. Deze code geeft ook toegang tot Team Insight.',
    },
    insight: {
      eyebrow: 'Module 1',
      title: 'Toegangscode Team Insight',
      lead: 'Voer je toegangscode voor Team Insight in.',
    },
    placeholder: 'Voer code in',
    busy: 'Bezig…',
    submit: 'Ga verder',
    close: 'Sluiten',
  },

  errors: {
    empty: 'Voer eerst een toegangscode in.',
    unknownCode: 'Onjuiste of onbekende code.',
    insightOnly: 'Deze code geeft alleen toegang tot Team Insight, niet tot Team Dynamics.',
    generic: 'Er ging iets mis. Probeer het opnieuw.',
  },

  footer: {
    backHome: 'Terug naar home',
    contact: 'Vragen? Plan een gesprek →',
  },
};

export default teamIntro;
