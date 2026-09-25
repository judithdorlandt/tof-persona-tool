/**
 * feedback — de korte check onderaan de resultatenpagina.
 *
 * De sleutels van `fitOptions` en `teamOptions` zijn databasewaarden
 * (kolommen `fit` en `team_use`) — nooit vertalen, alleen de waarden.
 */
const feedback = {
  eyebrow: 'Kleine check',
  title: 'Klopt dit voor jou?',
  lead: 'Dit helpt om de tool slimmer en scherper te maken.',

  fitOptions: {
    spot_on: 'Spot on',
    recognizable: 'Herkenbaar',
    doubt: 'Twijfel',
    not_really: 'Niet echt',
  },

  reasonLabel: 'Wat herken je hierin?',
  reasonPlaceholder: 'Bijvoorbeeld: manier van werken, energie, frustraties...',

  teamUseLabel: 'Doorvertaling',
  teamUseQuestion: 'Zou je dit ook voor je team willen gebruiken?',
  teamOptions: {
    yes: 'Ja',
    maybe: 'Misschien',
    no: 'Nee',
  },

  emailLabel: 'Verder praten',
  emailTitle: 'Laat je mail achter',
  emailLead: 'Dan denk ik graag met je mee over wat dit voor jouw team kan betekenen.',
  emailPlaceholder: 'jouwmail@bedrijf.nl',

  versionNote: 'Dit is versie 1 — jouw input maakt hem beter.',
  saving: 'Opslaan...',
  submit: 'Verstuur',
  saveError: 'Er ging iets mis bij opslaan.',

  thanks: {
    eyebrow: 'Dank je',
    title: 'Dank je wel voor je input.',
    lead: 'Dit is versie 1 — jouw input helpt om de tool scherper en waardevoller te maken.',
  },
};

export default feedback;
