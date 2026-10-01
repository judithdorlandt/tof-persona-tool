// Teksten die alleen in de app bestaan: startscherm, notities, historie en
// het privacyscherm.
const native = {
  start: {
    eyebrow: 'Op dit toestel',
    // Met en zonder bewaard profiel opent de app op een ander verhaal.
    title: 'Welkom terug.',
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
    // De drie open vragen. De sleutels komen overeen met het datamodel in
    // src/native/localStore.js.
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
    // Een gesprek afronden. Daarna staat het blad weer leeg en verhuist wat je
    // had opgeschreven naar de lijst eronder, met de datum erbij.
    close: {
      title: 'Gesprek gehad?',
      text:
        'Leg het vast met de datum van vandaag. Je begint dan met een leeg blad voor je volgende gesprek, en wat je nu hebt opgeschreven kun je hieronder altijd terugvinden.',
      button: 'Gesprek afronden',
      confirm: 'Dit gesprek afronden en met een leeg blad beginnen?',
      confirmYes: 'Ja, afronden',
      confirmCancel: 'Nog niet',
      done: 'Je gesprek is vastgelegd. Hieronder kun je het teruglezen.',
    },
    // De afgeronde gesprekken, nieuwste eerst.
    past: {
      title: 'Eerdere gesprekken',
      intro: 'Wat je toen hebt opgeschreven. Alleen om terug te lezen.',
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
  // organisatie werkt al met TOF, of nog niet.
  team: {
    eyebrow: 'De volgende stap',
    title: 'Dit is jouw beeld.',
    intro:
      'Het wordt pas echt interessant als je het naast je team legt: wie vult wie aan, waar gaat het schuren, en wat vraagt dat van jullie werkomgeving. Dat gesprek gaat over jullie samen, en daar is de teamomgeving voor.',
    contribute: {
      title: 'Ik heb een teamcode',
      text:
        'Je organisatie werkt al met TOF. Breng je profiel in bij je team: de website gaat open met je persona erin, daar vul je je teamcode in en kies je zelf of je het verstuurt. De app verstuurt zelf niets.',
      button: 'Profiel inbrengen',
    },
    askOrg: {
      title: 'Vraag je organisatie om TOF',
      text:
        'Nog niet in gebruik bij jullie? Leg het voor aan je leidinggevende of HR. Je eigen mail gaat open met een tekst die je nog kunt aanpassen — de app verstuurt zelf niets.',
      button: 'Mail opstellen',
      subject: 'TOF Persona voor ons team',
      // Losse regels; ze worden met regeleinden aan elkaar geplakt.
      body: [
        'Hoi,',
        '',
        'Ik heb de TOF Persona-test gedaan en daar een beeld uit gekregen van hoe ik werk en wat ik van mijn werkomgeving nodig heb. Dat werd een nuttig gesprek met mezelf.',
        '',
        'Wat mij pas echt zou helpen, is dat beeld naast dat van het team leggen: wie vult wie aan, waar zit de wrijving, en wat vraagt dat van onze werkplekken en werkafspraken. Daar is een teamomgeving voor.',
        '',
        'Meer erover staat op www.persona-tool.nl. Zullen we kijken of dit iets voor ons is?',
        '',
        'Groet,',
      ],
    },
    // De stille regel onderaan, ook als je geen van beide routes kiest.
    siteLabel: 'www.persona-tool.nl',
    siteUrl: 'https://www.persona-tool.nl',
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
          'Je voornaam wordt tijdens de test alleen op het scherm gebruikt en niet bewaard.',
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
