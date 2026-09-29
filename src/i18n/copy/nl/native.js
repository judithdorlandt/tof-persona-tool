// Teksten die alleen in de app bestaan: notities en historie.
const native = {
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
    confirmRemove: 'Dit profiel van je toestel verwijderen?',
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
};

export default native;
