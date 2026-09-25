/**
 * data.js — taal-onafhankelijke structuur van de persona's.
 *
 * De teksten staan in `src/i18n/copy/<taal>/archetypes.js`. Hier blijft alleen
 * wat logica of data is: de id's (zoals opgeslagen in de database), de vaste
 * volgorde, het cluster en het numerieke bricksProfile.
 *
 * Gebruik `getArchetypes(lang)` of `useArchetypes()` uit `src/i18n/archetypes`
 * om structuur en teksten samen te krijgen.
 */

/**
 * Vaste volgorde van de persona's. Scoring-code mapt op INDEX (de
 * antwoordopties per vraag staan in deze volgorde), dus deze volgorde is
 * load-bearing en mag niet wijzigen.
 */
export const ARCHETYPE_ORDER = [
  'maker',
  'groeier',
  'presteerder',
  'denker',
  'verbinder',
  'teamspeler',
  'zekerzoeker',
  'vernieuwer',
];

/** Niet-vertaalbare eigenschappen per persona. `id` = de waarde in de database. */
export const ARCHETYPE_STRUCTURE = {
  maker: {
    id: 'maker',
    cluster: 'creatie',
    bricksProfile: {
      focus: 1,
      work: 2,
      hybride: 1,
      meeting: 2,
      project: 4,
      team: 3,
      learning: 2,
      retreat: 1,
      social: 3,
    },
  },
  groeier: {
    id: 'groeier',
    cluster: 'creatie',
    bricksProfile: {
      focus: 2,
      work: 3,
      hybride: 1,
      meeting: 2,
      project: 3,
      team: 2,
      learning: 4,
      retreat: 1,
      social: 2,
    },
  },
  presteerder: {
    id: 'presteerder',
    cluster: 'executie',
    bricksProfile: {
      focus: 4,
      work: 2,
      hybride: 2,
      meeting: 1,
      project: 3,
      team: 1,
      learning: 1,
      retreat: 1,
      social: 1,
    },
  },
  denker: {
    id: 'denker',
    cluster: 'reflectie',
    bricksProfile: {
      focus: 4,
      work: 3,
      hybride: 1,
      meeting: 1,
      project: 1,
      team: 1,
      learning: 2,
      retreat: 3,
      social: 1,
    },
  },
  verbinder: {
    id: 'verbinder',
    cluster: 'verbinding',
    bricksProfile: {
      focus: 1,
      work: 1,
      hybride: 2,
      meeting: 3,
      project: 2,
      team: 3,
      learning: 1,
      retreat: 1,
      social: 4,
    },
  },
  teamspeler: {
    id: 'teamspeler',
    cluster: 'verbinding',
    bricksProfile: {
      focus: 1,
      work: 3,
      hybride: 2,
      meeting: 3,
      project: 1,
      team: 4,
      learning: 1,
      retreat: 1,
      social: 2,
    },
  },
  zekerzoeker: {
    id: 'zekerzoeker',
    cluster: 'structuur',
    bricksProfile: {
      focus: 3,
      work: 4,
      hybride: 2,
      meeting: 1,
      project: 1,
      team: 2,
      learning: 1,
      retreat: 2,
      social: 1,
    },
  },
  vernieuwer: {
    id: 'vernieuwer',
    cluster: 'creatie',
    bricksProfile: {
      focus: 1,
      work: 1,
      hybride: 2,
      meeting: 2,
      project: 4,
      team: 3,
      learning: 3,
      retreat: 1,
      social: 2,
    },
  },
};

export const QUESTIONS = [
  {
    q: 'Wat geeft jou op een gewone werkdag de meeste energie?',
    a: [
      'Iets nieuws bedenken en meteen beginnen — ook zonder compleet plan',
      'Merken dat ik iets nieuws heb geleerd of beter ben geworden',
      'Iets echt afmaken en het resultaat zien',
      'Me volledig vastbijten in een ingewikkeld vraagstuk',
      'Een goed gesprek of oprechte verbinding met iemand',
      'Samenwerken met mensen op wie ik kan bouwen',
      'Rust, duidelijkheid en weten precies wat er van mij verwacht wordt',
      'Een kans zien die anderen nog niet zien en daar iets mee doen',
    ],
  },
  {
    q: 'Hoe ziet jouw ideale manier van werken eruit?',
    a: [
      'Vrij, creatief en op mijn eigen manier — zonder te veel kaders',
      'Lerend en groeiend — ik wil steeds beter worden in wat ik doe',
      'Doelgericht en scherp — van A naar B, zo efficiënt mogelijk',
      'Verdiepend en inhoudelijk — eerst begrijpen, dan handelen',
      'Mensgericht — met aandacht voor sfeer, gevoel en verbinding',
      'Samen met een vaste groep mensen die ik goed ken en vertrouw',
      'Gestructureerd en voorspelbaar — ik werk best met duidelijke kaders',
      'Vernieuwend en toekomstgericht — ik denk liever vooruit dan achteruit',
    ],
  },
  {
    q: 'Wat kost jou op het werk de meeste energie?',
    a: [
      'Regels, procedures en weinig ruimte om iets zelf te proberen',
      'Herhaling, routine en geen kans om te groeien',
      'Veel praten maar weinig bereiken — overleg zonder besluit',
      'Oppervlakkigheid en besluiten die niet inhoudelijk kloppen',
      'Werken zonder echt contact — koud, taakgericht en afstandelijk',
      'Steeds wisselende teams en geen stabiel teamgevoel',
      'Chaos, vage afspraken en last-minute veranderingen',
      'Stilstand — vasthouden aan hoe het altijd is gegaan',
    ],
  },
  {
    q: 'Welke zin past het best bij hoe jij in je werk staat?',
    a: [
      'Ik maak het liefst iets wat er nog niet was',
      'Ik wil altijd een stapje verder komen dan gisteren',
      'Ik ben op mijn best als ik ergens naartoe werk',
      'Ik wil iets echt begrijpen voordat ik handel',
      'Ik ben het meest mezelf als ik goed contact heb met mensen',
      'Ik ben sterk als ik weet dat het team op mij rekent',
      'Ik functioneer het best als ik weet waar ik aan toe ben',
      'Ik zie altijd mogelijkheden die anderen over het hoofd zien',
    ],
  },
  {
    q: 'Hoe neem jij een beslissing als het er echt op aankomt?',
    a: [
      'Ik volg mijn gevoel, maak een keuze en stuur onderweg bij',
      'Ik kijk wat ik hiervan kan leren en wat de volgende stap is',
      'Ik kies wat het meeste oplevert en ga er meteen voor',
      'Ik analyseer alle kanten totdat ik zeker weet wat klopt',
      'Ik stem af met anderen en voel wat er nodig is',
      'Ik kijk wat het beste is voor het team als geheel',
      'Ik kies voor de meest duidelijke en voorspelbare optie',
      'Ik kijk welke kans of nieuwe richting er in de beslissing zit',
    ],
  },
  {
    q: 'Wanneer voelt werk voor jou echt waardevol?',
    a: [
      'Als ik iets heb gemaakt dat er eerst nog niet was',
      'Als ik merk dat ik gegroeid ben of iets nieuws heb geleerd',
      'Als ik een concreet doel heb gehaald waar ik naartoe heb gewerkt',
      'Als ik iets complex echt heb doorgrond en begrepen',
      'Als er oprecht contact was en mensen zich gezien voelden',
      'Als we als team iets hebben neergezet waar we trots op zijn',
      'Als er rust, overzicht en duidelijkheid was de hele dag',
      'Als ik een nieuwe kans of richting heb zien ontstaan',
    ],
  },
  {
    q: 'Je krijgt een nieuwe opdracht. Wat is jouw eerste reactie?',
    a: [
      'Ik begin meteen — ideeën komen vanzelf als ik in beweging ben',
      'Ik vraag me af wat ik hiervan kan leren',
      'Ik wil eerst weten wat het doel is en wanneer het klaar moet zijn',
      'Ik wil alle context en achtergrond begrijpen voordat ik begin',
      'Ik zoek eerst afstemming — wie is erbij betrokken en hoe voelen zij erbij?',
      'Ik kijk eerst met wie ik dit samen doe en wat ieders rol is',
      'Ik wil weten wat de kaders zijn en wat er precies van mij verwacht wordt',
      'Ik kijk meteen welke nieuwe mogelijkheid of richting hierin zit',
    ],
  },
  {
    q: 'Welke werkomgeving haalt het beste in jou naar boven?',
    a: [
      'Een omgeving met ruimte, vrijheid en tools om te maken en experimenteren',
      'Een omgeving die uitdaagt, inspireert en leerruimte biedt',
      'Een omgeving gericht op focus, tempo en resultaat — zonder ruis',
      'Een rustige, stille omgeving waar ik me echt kan concentreren',
      'Een warme omgeving met menselijk contact en echte ontmoeting',
      'Een vertrouwde, stabiele plek met een vaste groep mensen',
      'Een overzichtelijke omgeving met duidelijke structuur en voorspelbaarheid',
      'Een inspirerende omgeving waar vernieuwing en toekomstdenken normaal zijn',
    ],
  },
  {
    q: 'Wat maakt samenwerking voor jou echt goed?',
    a: [
      'Dat ik ruimte krijg voor mijn eigen ideeën en aanpak',
      'Dat we van elkaar leren en elkaar uitdagen om te groeien',
      'Dat we tempo maken, scherp zijn en echt iets neerzetten',
      'Dat besluiten inhoudelijk kloppen en niet worden afgeraffeld',
      'Dat er oprechte aandacht is voor de mens achter het werk',
      'Dat we op elkaar kunnen rekenen en het team centraal staat',
      'Dat rollen, verwachtingen en afspraken voor iedereen helder zijn',
      'Dat we samen ergens naartoe bewegen en richting geven aan iets nieuws',
    ],
  },
  {
    q: 'Wat maakt een team voor jou uiteindelijk minder goed?',
    a: [
      'Dat initiatieven direct worden dichtgeregeld of tegengehouden',
      'Dat niemand zich ontwikkelt of iets nieuws probeert te leren',
      'Dat er veel wordt gepraat maar weinig concreet wordt afgemaakt',
      'Dat snelheid belangrijker wordt dan inhoud en kwaliteit',
      'Dat de menselijke kant volledig wordt genegeerd',
      'Dat iedereen vooral voor zichzelf werkt in plaats van samen',
      'Dat afspraken vaag blijven of voortdurend veranderen',
      'Dat vernieuwing steeds wordt tegengehouden door oude gewoonten',
    ],
  },
  {
    q: 'Er komt een grote verandering in jouw organisatie. Wat is jouw eerste gedachte?',
    a: [
      'Interessant — wat kan ik hier mee en hoe zet ik dit in beweging?',
      'Wat kan ik hiervan leren en hoe maak ik mezelf sterker?',
      'Wat betekent dit voor mijn doelen en planning?',
      'Ik wil eerst begrijpen wat er precies verandert en waarom',
      'Wat doet dit met de mensen om mij heen?',
      'Wat betekent dit voor ons team en onze samenwerking?',
      'Gaat dit goed komen? Ik wil weten waar ik aan toe ben',
      'Eindelijk beweging — dit biedt kansen die ik wil benutten',
    ],
  },
  {
    q: 'Wat houdt jou op de lange termijn gemotiveerd in je werk?',
    a: [
      'Vrijheid om dingen op mijn manier te doen en te creëren',
      'Het gevoel dat ik steeds verder kom en mezelf blijf ontwikkelen',
      'Voortgang zien, grip houden en resultaten boeken',
      'Inhoud, inzicht en het gevoel dat kwaliteit ertoe doet',
      'Betekenisvol contact en het gevoel erbij te horen',
      'Een sterk team met echte saamhorigheid en gedeelde verantwoordelijkheid',
      'Zekerheid, duidelijkheid en weten waar ik aan toe ben',
      'Het gevoel dat ik bijdraag aan iets nieuws en toekomstgericht',
    ],
  },
  {
    q: 'Wat voegt jouw aanwezigheid toe aan een team?',
    a: [
      'Ik zet ideeën in beweging en maak dingen concreet',
      'Ik breng energie, nieuwsgierigheid en leerbereidheid',
      'Ik houd het team scherp op doelen en resultaten',
      'Ik bewaak de kwaliteit en diepgang van besluiten',
      'Ik zorg dat mensen zich gezien en verbonden voelen',
      'Ik houd het team bij elkaar en zorg voor saamhorigheid',
      'Ik breng structuur, betrouwbaarheid en overzicht',
      'Ik zie kansen en geef richting aan wat er anders of beter kan',
    ],
  },
  {
    q: 'Wat heb jij nodig van een leidinggevende om op je best te zijn?',
    a: [
      'Vertrouwen en ruimte om dingen op mijn eigen manier aan te pakken',
      'Oprechte aandacht voor mijn groei en ontwikkeling',
      'Heldere doelen, scherpe prioriteiten en directe communicatie',
      'Inhoudelijke voorbereiding en de ruimte om goed na te denken',
      'Menselijke betrokkenheid en het gevoel dat ik ertoe doe',
      'Stabiliteit, aandacht voor het team en consistentie',
      'Helderheid, voorspelbaarheid en duidelijke afspraken vooraf',
      'Visie, lef en ruimte om nieuwe richtingen te verkennen',
    ],
  },
  {
    q: 'Je rijdt naar huis. Wanneer denk je: dit was een goede dag?',
    a: [
      'Als ik iets heb gemaakt of echt in beweging heb gezet',
      'Als ik iets nieuws heb geleerd of een stap verder ben gekomen',
      'Als ik concreet resultaat heb geboekt en iets echt af is',
      'Als ik een ingewikkeld vraagstuk echt heb doorgrond',
      'Als er oprecht contact was en ik me verbonden voelde',
      'Als we het als team samen goed hebben gedaan',
      'Als er de hele dag rust, overzicht en duidelijkheid was',
      'Als ik een nieuwe kans of richting heb zien ontstaan',
    ],
  },
  {
    q: 'Kies de zin die het meest bij jou past als je eerlijk bent:',
    a: [
      'Ik werk het best als ik vrij ben om te creëren en te experimenteren',
      'Ik werk het best als ik leer en mezelf steeds ontwikkel',
      'Ik werk het best als ik weet wat het doel is en er naartoe kan werken',
      'Ik werk het best als ik de tijd krijg om iets echt te doordenken',
      'Ik werk het best als er oprecht contact is en mensen elkaar zien',
      'Ik werk het best in een vertrouwd team met duidelijke rollen',
      'Ik werk het best als alles helder, overzichtelijk en voorspelbaar is',
      'Ik werk het best als er ruimte is voor vernieuwing en nieuwe ideeën',
    ],
  },
];
