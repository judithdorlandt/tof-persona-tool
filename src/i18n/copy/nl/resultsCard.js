/**
 * resultsCard — de twee kaarten op de resultatenpagina:
 *   profile  → ResultsProfileCard (hero met alle inzichten)
 *   download → ResultsDownloadCard (PDF-download)
 */
const resultsCard = {
  // Lege staat: iemand landt op de resultatenpagina zonder testresultaat.
  empty: {
    eyebrow: '04 — Jouw resultaat',
    title: 'Nog geen resultaat beschikbaar',
    body: 'Vul eerst de test in om jouw persona-profiel te bekijken.',
    startTest: 'Start de test',
    backHome: 'Terug naar home',
  },

  profile: {
    badge: 'Primaire persona',
    // Wordt gevolgd door de personanaam + punt.
    dominantPrefix: 'Jouw dominante profiel is',

    meaningTitle: 'Wat dit betekent in de praktijk',
    meaningBody:
      'Je werkt het sterkst wanneer je omgeving aansluit op hoe jij van nature werkt. Zit daar verschil in, dan kost dat energie en wordt het moeilijker om echt tot je recht te komen.',

    motionLabel: 'Wat jou in beweging brengt',
    motionTitle: 'Jouw natuurlijke kracht',

    distributionLabel: 'Verdeling van jouw profiel',
    mixLabel: 'Jouw mix',

    leadershipLabel: 'Wat helpt in leiderschap',
    leadershipTitle: 'Zo kom jij beter tot je recht',

    bricksLabel: 'Bricks',
    bricksTitle: 'Jouw ideale werkplekmix',
    // Wordt gevolgd door het scoregetal.
    scorePrefix: 'score',

    bytesLabel: 'Bytes & Behavior',
    bytesTitle: 'Wat jij nodig hebt',

    // De twee blokken binnen "Bytes & Behavior".
    bytesBlocks: {
      bytes: { label: 'Bytes', title: 'Digitale ondersteuning' },
      behavior: { label: 'Behavior', title: 'Gedrag & cultuur' },
    },

    drainLabel: 'Waar je op leegloopt',

    // Labels van de negen werkplektypen (sleutels zijn taalonafhankelijk).
    workplaceLabels: {
      focus: 'Concentratieplekken',
      work: 'Standaard werkplekken',
      hybride: 'Hybride plekken',
      meeting: 'Overlegplekken',
      project: 'Creatieve plekken',
      team: 'Samenwerkplekken',
      learning: 'Leerplekken',
      retreat: 'Rustplekken',
      social: 'Informele plekken',
    },
  },

  download: {
    eyebrow: 'Jouw personakaart',
    format: 'PDF · 2 pagina\'s · A5',

    includesLabel: 'Wat je downloadt',
    includes: [
      'Jouw dominante persona en profielverdeling',
      'Jouw mix van secundaire persona\'s',
      'Wat jou in beweging brengt',
      'Jouw ideale werkplekmix (top 3)',
      'Wat helpt in leiderschap',
    ],

    howToLabel: 'Hoe te gebruiken',
    howToBody:
      'De kaart is ontworpen om te delen — met je manager, je team of je organisatie. Gebruik hem als gespreksstarter of als input voor werkplek- en samenwerkingsafspraken.',

    // Wordt gevolgd door de voornaam van de deelnemer.
    madeForPrefix: 'Opgemaakt voor',

    // Kop op de kaart wanneer er geen naam is ingevuld.
    nameFallback: 'Jouw profiel',

    // Slotquote op de achterkant als de persona er zelf geen heeft.
    fallbackQuote:
      'Je werkt het sterkst wanneer je omgeving aansluit op hoe jij van nature werkt.',

    // Bestandsnaam van de gedownloade PDF. `firstName` kan leeg zijn.
    fileName: (firstName) => (firstName
      ? `${firstName} - personakaart TOF.pdf`
      : 'personakaart TOF.pdf'),

    downloadButton: 'Download personakaart',
    availability: 'PDF · gratis · direct beschikbaar',

    allPersonas: 'Bekijk alle persona\'s',
    retakeTest: 'Test opnieuw',
  },
};

export default resultsCard;
