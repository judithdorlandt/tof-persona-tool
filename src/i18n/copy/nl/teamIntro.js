/**
 * teamIntro — alle teksten van TeamIntro.jsx (de verkoopintro voor de drie
 * modules, de manager-welkom, het toegangspaneel en de toegangsmodal).
 *
 * De module-ids (insight/dynamics/strategic) zijn logica-sleutels uit
 * utils/access.js — die blijven ongewijzigd, alleen de teksten zijn vertaald.
 */
const teamIntro = {
  modules: {
    insight: {
      eyebrow: 'Module 1 · Voor teams',
      title: 'Team Insight & Quick Wins',
      hook: 'Je weet wie er in je team zit. Maar weet je ook hoe het team écht werkt?',
      bullets: [
        'Zie in één oogopslag welke werkstijlen domineren',
        'Ontdek waar energie zit — en waar wrijving ontstaat',
        'Krijg directe werkplekbehoefte per team',
        'Vier concrete quick wins die je morgen kunt toepassen',
      ],
      what: 'Een teamdashboard klaar voor een teamoverleg, werkplek\u00ADbeslissing of leiderschapsgesprek.',
      cta: 'Naar de teamomgeving',
    },
    dynamics: {
      eyebrow: 'Module 2 · Voor teams & organisaties',
      title: 'Team Dynamics Sessie',
      hook: 'Je ziet de verdeling. Maar waarom loopt de samenwerking soms vast?',
      bullets: [
        'Spanningsvelden tussen persona\'s zichtbaar gemaakt',
        'Inzicht in waarom tempo, structuur en besluitvorming botsen',
        'Concrete leiderschapsimplicaties per persona-combinatie',
        'Live toelichting — online of op locatie',
      ],
      what: 'Een verdiept dashboard, toegelicht in een sessie. Van inzicht naar actie.',
      cta: 'Naar Team Dynamics',
    },
    strategic: {
      eyebrow: 'Module 3 · Voor MT, bestuur, huisvesting',
      title: 'Het Strategisch Kompas',
      hook: 'Wat de wereld vraagt, vertaald naar wie je team is.',
      bullets: [
        'Trend-radar: 8 gecureerde trends over werk, leiderschap en AI',
        'Persona-overlay: welke trends raken juist jullie team het hardst',
        'Strategische keuzes voor leiderschap, werkomgeving en cultuur',
        'Levend richtingsdocument — jaarlijks bijgewerkt, geen plan in een la',
      ],
      what: 'Een Strategisch Kompas-document (~20 pagina\'s) plus halfdaagse MT-sessie. Traject van 8–12 weken, volledig op maat.',
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
    upgradeLead: 'Meer dan Team Insight nodig?',
    upgradeLink: 'Vraag Dynamics-toegang aan →',
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
