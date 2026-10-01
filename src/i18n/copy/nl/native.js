// Teksten die alleen in de app bestaan: startscherm, notities, historie en
// het privacyscherm.
const native = {
  start: {
    eyebrow: 'Op dit toestel',
    // Met en zonder bewaard profiel opent de app op een ander verhaal.
    // Vulde je je voornaam in, dan opent de app met jouw naam erin. Niet als
    // trucje: dit is jouw app, op jouw toestel, en dat mag je zien.
    title: (naam) => (naam ? `Welkom terug, ${naam}.` : 'Welkom terug.'),
    intro:
      'Dit is het profiel dat je nu bekijkt. Het staat op je toestel en gaat nergens anders heen.',
    emptyTitle: 'Ontdek hoe jij werkt.',
    emptyIntro:
      'Negen vragen, een paar minuten. Daarna weet je in welke werkomgeving jij tot je recht komt — en blijft dat hier staan, alleen voor jou.',
    profileEyebrow: 'Jouw profiel',
    openProfile: 'Bekijk je profiel',
    startTest: 'Doe de test',
    // Stille voetregel onderaan het startscherm, naar het privacyscherm.
    privacyLink: 'Wat deze app over je bewaart',
    // De drie vervolgstappen onder de profielkaart.
    actions: {
      history: {
        title: 'Historie',
        text: 'Wat er in de loop van de tijd verschuift.',
      },
      library: {
        title: "Alle persona's",
        text: 'De acht profielen naast elkaar.',
      },
      again: {
        title: 'Opnieuw testen',
        text: 'Ander werk, andere situatie? Doe de test nog eens.',
      },
    },
    // Datum van afronden, zonder tijd: op het startscherm is het jaartal genoeg.
    formatDate: (iso) =>
      new Date(iso).toLocaleDateString('nl-NL', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }),
  },
  notes: {
    eyebrow: 'Alleen voor jou',
    title: 'Jouw aantekeningen',
    intro:
      'Drie vragen om je gesprek mee voor te bereiden. Wat je opschrijft blijft op je toestel en wordt nergens naartoe gestuurd.',
    saved: 'Opgeslagen op dit toestel',
    // De vier open vragen. De sleutels komen overeen met het datamodel in
    // src/native/localStore.js. De eerste drie vul je vóór het gesprek in,
    // `outcome` erna — daarom staat die in een eigen blok op het scherm.
    fields: {
      recognize: {
        label: 'Wat herken ik hierin?',
        placeholder: 'Wat klopt er voor jou, en wat niet?',
      },
      drains: {
        label: 'Wat kost mij nu energie in mijn werk of werkomgeving?',
        placeholder: 'Waar loop je tegenaan?',
      },
      ask: {
        label: 'Wat wil ik bespreken of vragen?',
        placeholder: 'Waar wil je het over hebben?',
      },
      outcome: {
        label: 'Wat kwam eruit?',
        placeholder: 'Wat is er gezegd, en wat gaan jullie doen?',
      },
    },
  },
  // Meenemen naar je gesprek. `add`/`remove` worden voorgelezen; `chipAdd`/
  // `chipDone` staan op het scherm en moeten daarom kort zijn. `hint` staat één
  // keer boven de lijst en legt uit waar het heen gaat — zonder die regel is
  // een plusje naast een zin niet te begrijpen.
  pin: {
    add: 'Zet bij mijn gesprek',
    remove: 'Haal van mijn gesprek',
    chipAdd: 'Meenemen',
    chipDone: 'Meegenomen',
    hint: 'Tik op een inzicht om het mee te nemen naar je gesprek.',
  },
  prep: {
    // Het gaat om één specifiek gesprek: dat met je leidinggevende. Zonder dat
    // erbij te zeggen blijft "gesprek" een leeg woord.
    eyebrow: 'Met je leidinggevende',
    title: 'Jouw gespreksvoorbereiding',
    intro:
      'Alles wat je hebt vastgeprikt en opgeschreven voor je volgende gesprek met je leidinggevende — je bila, je functioneringsgesprek, of gewoon een goed gesprek. Blijft op je toestel.',
    // De leiderschapspunten van je persona, in de ik-vorm. Stonden eerst als
    // hoofdstuk in je profiel, maar waren geschreven tégen een leidinggevende.
    // Hier zijn ze wat ze moeten zijn: regels die je zelf kunt zeggen.
    needsTitle: 'Wat ik nodig heb van mijn leidinggevende',
    needsIntro:
      'Dit hoort bij jouw persona. Pak eruit wat klopt, en laat de rest staan.',
    pinnedTitle: 'Wat je hebt vastgeprikt',
    // Kopjes boven een vastgeprikt inzicht, per soort. De sleutels komen
    // overeen met `kind` in src/native/localStore.js.
    kinds: {
      workplace: 'Werkplek',
      leadership: 'Leiderschap',
      energy: 'Wat mij in beweging brengt',
      drain: 'Waar ik op leegloop',
    },
    pinnedEmpty:
      'Je hebt nog niets vastgeprikt. Tik op de plus bij een inzicht in je profiel.',
    backToProfile: 'Terug naar je profiel',
    // Het tweede blok met open vragen, ná het gesprek. Zelfde opslag als de
    // drie vragen erboven, ander moment — en dus een eigen kopje.
    report: {
      eyebrow: 'Na afloop',
      title: 'Wat er uit het gesprek kwam',
      intro:
        'Schrijf het op zolang het nog vers is. Het hoort bij dit gesprek en gaat straks mee naar je historie.',
    },
    // Een gesprek afronden. Daarna staat het blad weer leeg en verhuist wat je
    // had opgeschreven naar je historie, met de datum erbij. Bewust één knop:
    // afronden ís een nieuw gesprek beginnen onder hetzelfde profiel.
    close: {
      title: 'Gesprek gehad?',
      text:
        'Leg het vast met de datum van vandaag en begin met een leeg blad voor je volgende gesprek. Je profiel blijft hetzelfde — dat verandert langzamer dan je gesprekken.',
      button: 'Afronden en nieuw gesprek beginnen',
      confirm: 'Dit gesprek afronden en met een leeg blad beginnen?',
      confirmYes: 'Ja, afronden',
      confirmCancel: 'Nog niet',
      done: 'Je gesprek is vastgelegd. Hieronder kun je het teruglezen.',
      // Pas ná het afronden, als een stille vraag. Vóór de knop zou het je
      // tegenhouden; hier is het een gedachte voor de volgende keer.
      personaCheck: (persona) =>
        persona
          ? `Herken je je nog in ${persona}? Je werk verandert; je profiel mag meebewegen.`
          : 'Herken je je nog in je profiel? Je werk verandert; je profiel mag meebewegen.',
      personaCheckButton: 'Opnieuw testen',
    },
    // Het laatste afgeronde gesprek blijft hier staan; de rest zit in je
    // historie, onder het profiel waar ze bij horen.
    past: {
      title: 'Je vorige gesprek',
      intro: 'Wat je toen hebt opgeschreven. Alleen om terug te lezen.',
      allButton: 'Alle gesprekken in je historie',
      // Kop boven één afgerond gesprek: "Gesprek 2 · 14 oktober 2026". De
      // nummering loopt op in de tijd, dus gesprek 1 is het oudste.
      label: (nummer) => `Gesprek ${nummer}`,
      noAnswer: 'Niets opgeschreven',
      nothingPinned: 'Niets vastgeprikt',
      formatDate: (iso) =>
        new Date(iso).toLocaleDateString('nl-NL', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        }),
    },
  },
  // De stap ná je eigen profiel: je beeld naast dat van je team leggen. Dat
  // gebeurt niet in de app — de teamomgeving staat op de website, en de app
  // verzamelt daarvoor niets. Twee routes, want er zijn twee situaties: je
  // organisatie werkt al met The Office Factory, of nog niet.
  //
  // Hier staat de naam voluit en niet als "TOF": dit is de enige plek in de
  // app waar je iets aan iemand anders voorlegt, en dan hoort er een naam te
  // staan die buiten deze app ook iets betekent.
  team: {
    eyebrow: 'De volgende stap',
    title: 'Dit is jouw beeld.',
    intro:
      'Het wordt pas echt interessant als je het naast je team legt: wie vult wie aan, waar gaat het schuren, en wat vraagt dat van jullie werkomgeving. Dat gesprek gaat over jullie samen, en daar is de teamomgeving voor.',
    contribute: {
      title: 'Ik heb een teamcode',
      text:
        'Je organisatie werkt al met The Office Factory. Breng je profiel in bij je team: de website gaat open met je persona erin, daar vul je je teamcode in en kies je zelf of je het verstuurt. De app verstuurt zelf niets.',
      button: 'Profiel inbrengen',
    },
    askOrg: {
      title: 'Vraag je organisatie om The Office Factory',
      text:
        'Nog niet in gebruik bij jullie? Leg het voor aan je leidinggevende of HR. De tekst staat klaar; je kiest zelf waar je hem opent en past hem aan — de app verstuurt zelf niets.',
      button: 'Mail opstellen',
      // Waar je mail staat, weet de app niet. `mailto:` opent de standaard
      // mail-app, en die heeft lang niet iedereen ingesteld — dan gebeurt er
      // niets en lijkt de knop stuk. Daarom eerst de vraag, en als laatste een
      // route die altijd werkt: de tekst kopiëren.
      chooseLabel: 'Waar staat je mail?',
      providers: {
        app: 'Mijn mail-app',
        gmail: 'Gmail',
        outlook: 'Outlook',
        copy: 'Tekst kopiëren',
      },
      copied: 'Gekopieerd. Plak de tekst in een nieuwe mail.',
      copyFailed: 'Kopiëren lukte niet. Selecteer de tekst hierboven zelf.',
      subject: 'De Persona-tool van The Office Factory voor ons team',
      // Losse regels; ze worden met regeleinden aan elkaar geplakt.
      body: [
        'Hoi,',
        '',
        'Ik heb de Persona-test van The Office Factory gedaan en daar een beeld uit gekregen van hoe ik werk en wat ik van mijn werkomgeving nodig heb. Dat werd een nuttig gesprek met mezelf.',
        '',
        'Wat mij pas echt zou helpen, is dat beeld naast dat van het team leggen: wie vult wie aan, waar zit de wrijving, en wat vraagt dat van onze werkplekken en werkafspraken. Daar is een teamomgeving voor.',
        '',
        'Meer over de tool staat op www.persona-tool.nl, en over The Office Factory op www.tof.services. Zullen we kijken of dit iets voor ons is?',
        '',
        'Groet,',
      ],
    },
    // De stille regels onderaan, ook als je geen van beide routes kiest. Twee
    // adressen met twee rollen: de tool, en het bureau erachter.
    siteLabel: 'www.persona-tool.nl',
    siteUrl: 'https://www.persona-tool.nl',
    businessLabel: 'www.tof.services',
    businessUrl: 'https://www.tof.services',
    // LET OP: twee verschillende adressen, en dat is geen slordigheid.
    // `siteUrl` is de verhaalsite — daar lees je wat TOF is. `appUrl` is de
    // webapp zelf, met /bijdragen, de teamomgeving en de vragenlijst. Het
    // profiel inbrengen moet naar `appUrl`; op de verhaalsite bestaat
    // /bijdragen niet en land je op de voorpagina.
    appUrl: 'https://tof-persona-tool.netlify.app',
  },
  history: {
    eyebrow: 'Op dit toestel',
    title: 'Jouw historie',
    intro:
      'Elke keer dat je de test afrondt, komt je profiel hier te staan. Zo zie je wat er in de loop van de tijd verschuift. Alles blijft op je toestel.',
    empty:
      'Je hebt nog geen profiel bewaard. Rond de test af en je profiel verschijnt hier.',
    startTest: 'Doe de test',
    backHome: 'Terug naar start',
    current: 'Je bekijkt dit profiel',
    view: 'Bekijken',
    remove: 'Verwijderen',
    // Vegen is niet te zien; één regel boven de lijst wijst de weg.
    swipeHint: 'Veeg een profiel naar links om het te verwijderen.',
    // Verwijderen gaat nooit in één keer: de kaart vraagt het eerst na.
    confirmRemove: 'Dit profiel van je toestel verwijderen?',
    confirmYes: 'Ja, verwijderen',
    confirmCancel: 'Laat maar staan',
    hasNote: 'Met aantekening',
    mixLabel: 'Daarnaast',
    // De afgeronde gesprekken onder één profiel. Ze staan dichtgeklapt: de
    // historie is een lijst profielen, en pas als je er één opent wil je de
    // gesprekken eronder zien.
    conversations: {
      count: (n) => (n === 1 ? '1 gesprek' : `${n} gesprekken`),
      show: 'Gesprekken bekijken',
      hide: 'Gesprekken verbergen',
    },
    // Datum + tijd van afronden, in de taal van de app.
    formatDate: (iso) =>
      new Date(iso).toLocaleString('nl-NL', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
  },
  privacy: {
    eyebrow: 'Jouw gegevens',
    title: 'Alles blijft op je toestel',
    intro:
      'Deze app stuurt niets naar ons of naar iemand anders. Er is geen account, geen server en geen internetverbinding nodig. Hieronder staat precies wat er wordt bewaard, en hoe je het in één keer weghaalt.',
    // Vier blokken. `items` is telkens een opsomming onder de tekst; laat hem
    // weg als er niets op te sommen valt.
    sections: [
      {
        title: 'Wat er bewaard wordt',
        text: 'Alleen wat je zelf in de app maakt, opgeslagen in de app zelf:',
        items: [
          'Je persona-profiel: de uitslag van de test en de datum.',
          'Je voornaam, als je die invulde — zodat de app je bij naam kan aanspreken.',
          'Je antwoorden op de drie gespreksvragen.',
          'De inzichten die je aan je gesprek hebt vastgeprikt.',
          'De gesprekken die je hebt afgerond, met de datum erbij.',
          'Welke taal je hebt gekozen.',
        ],
      },
      {
        title: 'Wat er níét gebeurt',
        text: 'Er is geen enkele reden om meer van je te weten, dus dat doen we ook niet:',
        items: [
          'Geen account, geen e-mailadres, geen wachtwoord.',
          'Je voornaam blijft op dit toestel; wij zien hem nooit.',
          'Geen statistieken, geen trackers, geen advertenties.',
          'Geen toegang tot je contacten, locatie, camera of bestanden.',
        ],
      },
      {
        title: 'Wie erbij kan',
        text: 'Alleen wie je toestel kan ontgrendelen. Wij kunnen er niet bij: er is geen kopie, ergens anders. Verwijder je de app, dan gaat alles wat hierin staat mee.',
      },
      {
        title: 'Waarom dat zo is',
        text: 'Wie weet dat zijn leidinggevende kan meelezen, schrijft niet op wat er werkelijk speelt. Een eerlijk gesprek begint bij aantekeningen die van jou alleen zijn.',
      },
    ],
    // Het wisblok onderaan.
    eraseTitle: 'Alles verwijderen',
    eraseText:
      'Hiermee wis je in één keer alle profielen, antwoorden en vastgeprikte inzichten van dit toestel. Dit kan niet ongedaan worden gemaakt.',
    // Aantal bewaarde profielen, zodat je weet wat je weggooit.
    eraseCount: (n) =>
      n === 1 ? 'Er staat 1 profiel op dit toestel.' : `Er staan ${n} profielen op dit toestel.`,
    eraseEmpty: 'Er staat op dit moment niets op dit toestel.',
    eraseButton: 'Alles verwijderen',
    eraseConfirm: 'Weet je het zeker? Alles wat je hebt opgeschreven verdwijnt.',
    eraseYes: 'Ja, alles verwijderen',
    eraseCancel: 'Laat maar staan',
    eraseDone: 'Alles is van dit toestel verwijderd.',
    backHome: 'Terug naar start',
    // Datum van de laatste herziening van deze tekst.
    updated: 'Laatst bijgewerkt: 30 september 2026',
  },
  // De balk onderaan het scherm — de vier plekken waar je heen kunt. Kort
  // houden: dit moet naast elkaar passen op de smalste telefoon.
  tabs: {
    label: 'Hoofdmenu',
    profile: 'Profiel',
    conversation: 'Gesprek',
    history: 'Historie',
    library: "Persona's",
    // Voorgelezen bij het aantal vastgeprikte inzichten op het gesprek-tabblad.
    pinnedCount: (n) =>
      n === 1 ? '1 inzicht vastgeprikt' : `${n} inzichten vastgeprikt`,
  },
  // De hoofdstukken van je profiel. Stonden eerst allemaal onder elkaar —
  // 4,3 schermen scrollen; nu kies je er één. De labels zijn korter dan de
  // koppen in het hoofdstuk zelf, want ze moeten op een knop passen.
  //
  // Op de knoppen staat gewone taal. Het TOF-model (Bricks · Bytes · Behavior ·
  // Belonging) staat als klein kopje bóven het hoofdstuk — zie `chapterHeads`.
  // Wie net negen vragen heeft ingevuld snapt "Digitaal" meteen en "Bytes" niet.
  chapters: {
    label: 'Onderdeel van je profiel',
    // "Beweging" was te abstract om op een knop te snappen; het gaat over waar
    // je energie van krijgt en waar hij weglekt.
    motion: 'Energie',
    workplace: 'Werkplek',
    bytes: 'Digitaal',
    behavior: 'Gedrag',
    culture: 'Cultuur',
  },
  // Kopje + titel boven elk hoofdstuk. Staat de vakterm op de knop (Engels),
  // dan staat het gewone woord erboven — en andersom. Zo zie je altijd allebei.
  chapterHeads: {
    workplace: { label: 'Bricks', title: 'Jouw ideale werkplekmix' },
    bytes: { label: 'Bytes', title: 'Wat je digitaal nodig hebt' },
    // Gedrag ging eerst schuil onder "Bytes & Behavior", alsof het een
    // digitaal onderwerp was. Het gaat over hoe er gewerkt wordt.
    behavior: { label: 'Behavior', title: 'Waar het voor jou gaat schuren' },
    // Belonging bestond nog niet in de app, terwijl het juist de laag is die
    // het gesprek over je plek in het team raakt. De drie regels komen uit
    // `ct`: met wie je klikt, met wie het schuurt, en wat jij meebrengt.
    culture: { label: 'Belonging', title: 'Jouw plek tussen je collega’s' },
  },
};

export default native;
