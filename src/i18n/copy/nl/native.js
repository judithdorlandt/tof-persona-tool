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
  pin: {
    add: 'Zet bij mijn gesprek',
    remove: 'Haal van mijn gesprek',
  },
  prep: {
    eyebrow: 'Voor je gesprek',
    title: 'Jouw gespreksvoorbereiding',
    intro:
      'Alles wat je hebt vastgeprikt en opgeschreven, op één scherm. Blijft op je toestel.',
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
    notesTitle: 'Jouw antwoorden',
    notesEmpty: 'Je hebt de drie vragen nog niet beantwoord.',
    backToProfile: 'Terug naar je profiel',
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
};

export default native;
