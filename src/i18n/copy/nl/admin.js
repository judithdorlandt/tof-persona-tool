/**
 * admin — teksten van het interne TOF-adminscherm (src/components/Admin.jsx).
 *
 * Eén sub-object per UI-blok, in de volgorde waarin de blokken op het scherm
 * staan. Databasewaarden blijven onvertaald: observatie-categorieën
 * (`leegloper`, `werkt_goed`), module-niveaus (`insight`, `dynamics`),
 * teamcodes, organisatie- en teamnamen komen uit Supabase.
 *
 * Getalvormen lopen via functies (`counts.teams(2)`), zodat Engels een
 * andere meervoudsregel kan hanteren zonder dat de component verandert.
 */

/** "1 team" / "3 teams" — enkelvoud en meervoud op één plek. */
const counts = {
  teams: (n) => `${n} ${n === 1 ? 'team' : 'teams'}`,
  responses: (n) => `${n} ${n === 1 ? 'response' : 'responses'}`,
  managers: (n) => `${n} ${n === 1 ? 'manager' : 'managers'}`,
};

const admin = {
  counts,

  /** Tussenscherm terwijl de admin-check loopt. */
  gate: {
    checking: 'Toegangscheck loopt…',
  },

  /** Ingelogd, maar zonder admin-rechten. */
  noAccess: {
    eyebrow: 'Geen toegang',
    title: 'Deze pagina is alleen voor TOF-admins.',
    body: 'Je bent ingelogd, maar je hebt geen admin-rechten op dit account.',
    backHome: 'Terug naar Home',
  },

  /** E-mail + wachtwoord-login, alleen op /admin. */
  login: {
    eyebrow: 'TOF Admin',
    title: 'Inloggen.',
    emailLabel: 'E-mailadres',
    emailPlaceholder: 'naam@tof.services',
    passwordLabel: 'Wachtwoord',
    passwordPlaceholder: '••••••••',
    submit: 'Inloggen →',
    submitting: 'Bezig met inloggen…',
    failed: 'Inloggen mislukt.',
  },

  /** Hero bovenaan het adminoverzicht. */
  hero: {
    eyebrow: 'TOF — Admin',
    titleLead: 'Nieuwe klant in ',
    titleAccent: 'één blik',
    lead: 'Maak een team-toegangscode aan, krijg een kant-en-klare welkomstmail, en houd je klantenlijst overzichtelijk.',
  },

  /** Formulier: nieuw klantteam aanmaken. */
  createTeam: {
    eyebrow: 'Nieuwe klant aanmaken',
    organizationLabel: 'Organisatie',
    organizationPlaceholder: 'Bv. Gemeente Voorbeeldstad',
    teamLabel: 'Team / Afdeling',
    teamPlaceholder: 'Bv. Bestuurszaken',
    // Geen keuze voor een toegangsniveau meer: elke teamcode geeft
    // Teaminzicht. Teamdynamiek hangt aan de leidinggevende (managerkoppeling).
    leaderNameLabel: 'Voornaam leidinggevende (optioneel)',
    leaderNamePlaceholder: 'Bv. Sanne',
    leaderEmailLabel: 'E-mail leidinggevende (optioneel)',
    leaderEmailPlaceholder: 'naam@organisatie.nl',
    leaderEmailHint:
      'Dit adres wordt meteen als leidinggevende aan het team gekoppeld. Na inloggen ziet deze persoon Teaminzicht én Teamdynamiek. De teamcode zelf geeft iedereen Teaminzicht.',
    submit: 'Team aanmaken',
    submitting: 'Aanmaken…',
    hint: 'Code wordt automatisch gegenereerd.',
    errors: {
      required: 'Organisatie en teamnaam zijn verplicht.',
      invalidEmail: 'Dit e-mailadres klopt niet.',
      leaderLinkFailed: (msg) =>
        `Het team is aangemaakt, maar de leidinggevende kon niet gekoppeld worden${msg ? ` (${msg})` : ''}. Voeg die toe onder Managers.`,
      failed: 'Aanmaken mislukt.',
      unknown: 'Onbekende fout.',
    },
  },

  /** Bevestiging na aanmaken, met kant-en-klare welkomstmail. */
  justCreated: {
    eyebrow: 'Team aangemaakt',
    leaderLinked: (email) => `Leidinggevende gekoppeld: ${email}`,
    noLeader: 'Nog geen leidinggevende gekoppeld — voeg die toe onder Managers.',
    dismiss: 'Sluiten',
    codeLabel: 'Code',
    copyCode: 'Kopieer code',
    toggleMail: 'Kant-en-klare welkomstmail tonen ↓',
    copyMail: 'Kopieer mail-tekst',
    copied: '✓ Gekopieerd',
    /** Plaatshouder als er geen leider-e-mailadres is ingevuld. */
    fallbackRecipient: '[voornaam]',
    /**
     * De leveringsmail (marketingrepo, content/klantreis-teamcode.md §3c).
     * Code, teamlink, teamnaam en e-mailadres van de manager vult de app in;
     * inkoopordernummer en sessie vult Judith zelf in vóór verzending.
     */
    mailBody: ({ recipient, code, appStoreUrl, googlePlayUrl, team, managerEmail }) => `Beste ${recipient},

Hierbij de teamcode voor ${team}. Je team kan vandaag beginnen.

Teamcode: ${code}


VOOR JE TEAM

Iedereen doet de test in de app TOF Persona, op de eigen telefoon en
zonder account:

App Store (iPhone):
${appStoreUrl}

Google Play (Android):
${googlePlayUrl}

1. Download de app en doe de test: negen vragen, ongeveer vijf minuten.
   Daarna is er een verdieping van drie minuten; die is niet verplicht.
2. Tik bij je profiel op "Profiel inbrengen".
3. Vul de teamcode in: ${code}

Stuur deze stappen en de teamcode door naar je team. Een voornaam invullen
mag, maar hoeft niet: zonder naam telt iemand gewoon mee in het teambeeld.

Het teambeeld bekijk je op team.persona-tool.nl/team, met de teamcode.


VOOR JOU ALS LEIDINGGEVENDE

Je hebt een eigen inlog voor Teamdynamiek: wat deze samenstelling van
leiderschap vraagt. Die zit niet in de teamcode, zodat de code door het team
kan gaan zonder dat dit deel meegaat.

1. Ga naar team.persona-tool.nl/login
2. Vul ${managerEmail || '[e-mailadres leidinggevende]'} in
3. Je krijgt een inloglink per mail

Doe de test zelf ook in de app en breng je profiel in. Dan tel je mee in
het beeld.


WANNEER JE IETS ZIET

Het teambeeld en Teamdynamiek verschijnen zodra vijf profielen zijn
ingevuld. Daaronder blijft het scherm leeg: in een kleinere groep is te
makkelijk te herleiden wie wat heeft geantwoord. Dat geldt ook voor jou als
leidinggevende.


DE FACTUUR

De factuur krijg je apart per mail[, met inkoopordernummer …].

[Bij een begeleide sessie: "Je gaf aan dat je een begeleide sessie wilt.
Ik neem contact met je op om een datum te kiezen; die sessie factureer ik
apart."]
[Bij "weet ik nog niet": "Wil je het teambeeld samen met je team lezen,
in een begeleide sessie? Antwoord dan op deze mail."]

Vragen? Antwoord gerust op deze mail.

Hartelijke groet,
Judith Dorlandt
The Office Factory
+31 6 8389 4556`,
  },


  /** Klikbare lijst met alle organisaties. */
  organizations: {
    heading: (n) => `Organisaties (${n})`,
    empty: 'Nog geen organisaties met teams.',
    view: 'Bekijk →',
  },

  /** Detailpagina van één organisatie. */
  detail: {
    back: '← Terug naar Admin',
    eyebrow: 'TOF — ADMIN · ORGANISATIE',
    title: 'Organisatie-inzicht voor',
    lead: (teamCount, responseCount) =>
      `Geaggregeerd over ${counts.teams(teamCount)} en ${counts.responses(responseCount)}.`,
    downloadPdf: 'Download als PDF',
    loadingResponses: 'Responses laden…',
    closeTile: 'Sluiten ✕',
    teamsHeading: (n) => `Teams in deze organisatie (${n})`,
    viewTeam: 'Bekijk team →',
    viewTeamBusy: '…',
    empty: '—',
  },

  /** Schakelaar tussen de twee weergaven binnen Module 2 op de detailpagina. */
  moduleToggle: {
    ariaLabel: 'Weergave',
    options: {
      insight: 'Teaminzicht',
      dynamics: 'Teamdynamiek',
    },
  },

  /** Handmatige observaties die in de organisatie-PDF landen. */
  observations: {
    eyebrow: 'Eigen observaties — handmatig per organisatie',
    lead: 'Naast de data-driven inzichten uit de persona-responses kun je hier zelf observaties toevoegen die in de organisatie-PDF verschijnen.',
    // Sleutels = databasewaarden van de kolom `category`; niet vertalen.
    categories: {
      leegloper: {
        label: 'Waar de organisatie op leegloopt',
        helper: 'Bv. akoestiek, no-shows, niet nakomen van afspraken.',
        placeholder: 'akoestiek op de werkvloer',
      },
      werkt_goed: {
        label: 'Wat werkt goed in de organisatie',
        helper: 'Bv. open feedbackcultuur, snelle besluitvorming.',
        placeholder: 'open feedbackcultuur tussen teams',
      },
    },
    add: 'Toevoegen',
    removeTitle: 'Verwijderen',
    errors: {
      addFailed: 'Toevoegen mislukt.',
      removeFailed: 'Verwijderen mislukt.',
    },
  },

  /** Managers koppelen aan een teamcode. */
  managers: {
    eyebrow: 'Managers — directe team-toegang via email',
    lead: 'Koppel een manager-email aan een team-code. Bij hun eerste magic-link login zien ze het team(s) automatisch in hun toegangs-overzicht — zonder code in te voeren.',
    emailLabel: 'Email manager',
    emailPlaceholder: 'naam@organisatie.nl',
    codeLabel: 'Team-code',
    codePlaceholder: '— kies een team —',
    teamWithoutName: '(zonder naam)',
    submit: 'Koppel',
    submitting: 'Bezig…',
    linkedHeading: (n) => `Gekoppeld (${n})`,
    empty: 'Nog geen managers gekoppeld. (Of de SQL-migratie is nog niet gedraaid.)',
    errors: {
      required: 'Email en teamcode zijn verplicht.',
      invalidEmail: 'Vul een geldig e-mailadres in.',
      linkFailed: 'Koppelen mislukt.',
      removeFailed: 'Verwijderen mislukt.',
      unknown: 'Onbekende fout.',
    },
    row: {
      noTeam: '—',
      sendLink: 'Stuur magic link',
      sending: 'Bezig…',
      resend: 'Opnieuw sturen',
      sent: 'Magic link verstuurd.',
      sendFailed: 'Versturen mislukt.',
      remove: 'Verwijder',
    },
  },

  /** Placeholder voor de toekomstige bestuurders-functie. */
  director: {
    eyebrow: 'Bestuurder',
    title: 'Komt binnenkort',
    bodyBefore: 'Hier kun je straks een bestuurder of directielid koppelen aan',
    bodyAfter: '. Hij of zij krijgt op organisatie-niveau dezelfde inzichten als een manager binnen één team.',
  },
};

export default admin;
