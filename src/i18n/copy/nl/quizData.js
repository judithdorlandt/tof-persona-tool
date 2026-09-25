/**
 * quizData — alle vraag- en antwoordteksten van de vragenlijst.
 *
 * LET OP: `basis[i].a` en `druk.a` staan in de VASTE volgorde van de acht
 * archetypen:
 *   0 maker · 1 groeier · 2 presteerder · 3 denker
 *   4 verbinder · 5 teamspeler · 6 zekerzoeker · 7 vernieuwer
 * De scoring mapt op INDEX. Nooit herordenen, nooit toevoegen of weglaten.
 *
 * `werkplek` en `duelEssentie` zijn gesleuteld op id — de sleutels zijn data,
 * alleen de waarden zijn tekst.
 */
const quizData = {
  // ── Basis — 9 vragen ─────────────────────────────────────────────────────
  basis: [
    {
      q: 'Wat geeft jou op een gewone werkdag de meeste energie?',
      a: [
        'Iets nieuws bedenken en meteen beginnen',
        'Merken dat ik iets nieuws heb geleerd',
        'Iets afmaken en het resultaat zien',
        'Me vastbijten in een ingewikkeld vraagstuk',
        'Een goed gesprek met iemand',
        'Samenwerken met mensen op wie ik kan bouwen',
        'Rust, en weten wat er van mij wordt verwacht',
        'Een kans zien die anderen nog niet zien',
      ],
    },
    {
      q: 'Wat kost jou op het werk de meeste energie?',
      a: [
        'Regels en weinig ruimte om iets te proberen',
        'Herhaling, zonder kans om te groeien',
        'Veel overleggen, weinig besluiten',
        'Oppervlakkigheid en te snelle conclusies',
        'Werken zonder echt contact',
        'Wisselende teams en geen vaste basis',
        'Chaos en last-minute veranderingen',
        'Stilstand en vasthouden aan het oude',
      ],
    },
    {
      q: 'Hoe werk jij het liefst?',
      a: [
        'Vrij en creatief, met weinig kaders',
        'Lerend, steeds een stap verder',
        'Doelgericht en efficiënt',
        'Verdiepend: eerst begrijpen, dan doen',
        'Mensgericht, met aandacht voor sfeer',
        'Samen met een vaste, vertrouwde groep',
        'Gestructureerd en voorspelbaar',
        'Vernieuwend en vooruitkijkend',
      ],
    },
    {
      q: 'Je krijgt een nieuwe opdracht. Wat doe je als eerste?',
      a: [
        'Ik begin gewoon; onderweg wordt het duidelijk',
        'Ik kijk wat ik hiervan kan leren',
        'Ik vraag naar het doel en de deadline',
        'Ik verzamel eerst de achtergrond',
        'Ik stem af met de mensen die het raakt',
        'Ik kijk met wie ik dit samen doe',
        'Ik vraag naar de kaders en verwachtingen',
        'Ik kijk welke nieuwe richting hierin zit',
      ],
    },
    {
      q: 'Hoe neem jij een lastige beslissing?',
      a: [
        'Op gevoel, en onderweg bijsturen',
        'Ik kies wat mij verder brengt',
        'Ik kies wat het meeste oplevert en ga door',
        'Ik analyseer tot ik zeker weet wat klopt',
        'Ik stem af en voel wat er nodig is',
        'Ik kijk wat het beste is voor het team',
        'Ik kies de meest duidelijke optie',
        'Ik kijk welke kans erin zit',
      ],
    },
    {
      q: 'Welke werkomgeving haalt het beste in jou naar boven?',
      a: [
        'Ruimte en materiaal om te maken en te proberen',
        'Een omgeving die uitdaagt en leerruimte biedt',
        'Focus en tempo, zonder ruis',
        'Stil en rustig, echt kunnen concentreren',
        'Warm, met ruimte voor ontmoeting',
        'Een vertrouwde plek bij mijn eigen team',
        'Overzichtelijk, met een vaste eigen plek',
        'Inspirerend, waar vernieuwing normaal is',
      ],
    },
    {
      q: 'Wat maakt samenwerken voor jou goed?',
      a: [
        'Ruimte voor mijn eigen aanpak',
        'Dat we elkaar uitdagen en van elkaar leren',
        'Dat we tempo maken en iets neerzetten',
        'Dat besluiten inhoudelijk kloppen',
        'Dat er aandacht is voor de mens erachter',
        'Dat we op elkaar kunnen rekenen',
        'Dat rollen en afspraken helder zijn',
        'Dat we samen ergens naartoe bewegen',
      ],
    },
    {
      q: 'Er verandert iets groots in je organisatie. Wat is je eerste gedachte?',
      a: [
        'Interessant — wat kan ik hiermee?',
        'Wat kan ik hiervan leren?',
        'Wat betekent dit voor mijn doelen en planning?',
        'Ik wil eerst begrijpen wat er precies verandert',
        'Wat doet dit met de mensen om mij heen?',
        'Wat betekent dit voor ons team?',
        'Waar ben ik straks aan toe?',
        'Eindelijk beweging — dit biedt kansen',
      ],
    },
    {
      q: 'Wat heb je van je leidinggevende nodig om op je best te zijn?',
      a: [
        'Vertrouwen en ruimte voor mijn eigen aanpak',
        'Aandacht voor mijn ontwikkeling',
        'Heldere doelen en directe communicatie',
        'Voorbereiding en tijd om na te denken',
        'Betrokkenheid, en het gevoel dat ik ertoe doe',
        'Consistentie en aandacht voor het team',
        'Duidelijke afspraken vooraf',
        'Visie en ruimte om te verkennen',
      ],
    },
  ],

  // ── Verdieping — V3: onder druk ──────────────────────────────────────────
  druk: {
    q: 'Als het spannend wordt op je werk, wat doe jij dan als eerste?',
    a: [
      'Ik ga zelf iets doen, in beweging komen helpt',
      'Ik zoek uit hoe anderen dit oplossen',
      'Ik maak een lijst en begin bovenaan',
      'Ik trek me terug om het eerst te doorgronden',
      'Ik zoek iemand op om het mee te delen',
      'Ik kijk hoe het met het team gaat',
      'Ik wil weten waar ik aan toe ben',
      'Ik kijk of dit een moment is om iets te veranderen',
    ],
  },

  // ── Verdieping — V4: werkplekgebruik (sleutels = data-ids) ───────────────
  werkplek: {
    focus: 'Concentratieplek',
    work: 'Standaard werkplek',
    hybride: 'Hybride plek',
    meeting: 'Overlegplek',
    project: 'Creatieve of projectplek',
    team: 'Samenwerkplek',
    learning: 'Leerplek',
    retreat: 'Rustplek',
    social: 'Informele plek',
  },

  // ── Verdieping — V5: open vraag ──────────────────────────────────────────
  open: {
    q: 'Wat zou jouw werk volgende week merkbaar makkelijker maken?',
  },

  verdiepingIntro:
    'Je profiel staat. Wil je nog drie minuten? Dan wordt jouw beeld scherper — en het teambeeld ook.',

  // ── Verdieping — V1/V2: duels (sleutels = archetype-ids) ─────────────────
  duelEssentie: {
    maker: 'Ik begin en zoek onderweg de vorm',
    groeier: 'Ik pak het aan om er zelf beter van te worden',
    presteerder: 'Ik lever op tijd, ook als het nog niet perfect is',
    denker: 'Ik neem de tijd die de kwaliteit vraagt',
    verbinder: 'Ik zoek eerst het contact met de mensen erachter',
    teamspeler: 'Ik kijk wat het beste is voor het team als geheel',
    zekerzoeker: 'Ik wil eerst weten hoe we het precies gaan doen',
    vernieuwer: 'Ik kijk welke nieuwe richting hierin zit',
  },

  duelIntro: 'Twee kanten van jou liggen dicht bij elkaar. Welke voelt het meest als jij?',
};

export default quizData;
