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
    organizationPlaceholder: 'Bv. Gemeente Nijkerk',
    teamLabel: 'Team / Afdeling',
    teamPlaceholder: 'Bv. Bestuurszaken',
    moduleLabel: 'Module',
    moduleOptions: {
      insight: 'Module 01 — Insight (€1.500)',
      dynamics: 'Module 02 — Dynamics (€8.500)',
    },
    leaderEmailLabel: 'Leider e-mail (optioneel)',
    leaderEmailPlaceholder: 'l.janssen@nijkerk.nl',
    submit: 'Team aanmaken',
    submitting: 'Aanmaken…',
    hint: 'Code wordt automatisch gegenereerd.',
    errors: {
      required: 'Organisatie en teamnaam zijn verplicht.',
      failed: 'Aanmaken mislukt.',
      unknown: 'Onbekende fout.',
    },
  },

  /** Bevestiging na aanmaken, met kant-en-klare welkomstmail. */
  justCreated: {
    eyebrow: 'Team aangemaakt',
    moduleLabels: {
      insight: 'Module 01 — Insight',
      dynamics: 'Module 02 — Dynamics',
    },
    dismiss: 'Sluiten',
    codeLabel: 'Code',
    copyCode: 'Kopieer code',
    toggleMail: 'Kant-en-klare welkomstmail tonen ↓',
    copyMail: 'Kopieer mail-tekst',
    copied: '✓ Gekopieerd',
    /** Voorbeeldnaam als er geen leider-e-mailadres is ingevuld. */
    fallbackRecipient: 'Livia',
    mailBody: ({ recipient, code, quizUrl }) => `Beste ${recipient},

Fijn dat we deze stap samen zetten. Hieronder alles wat je nodig hebt om jouw team aan de slag te laten gaan.

JULLIE TEAMCODE
${code}

Deze code zit al verwerkt in de link hieronder, zodat de tool de antwoorden automatisch aan jullie team koppelt.

WAT JE TEAMLEDEN DOEN (15 minuten per persoon)
1. Open de persoonlijke teamlink: ${quizUrl}
2. Organisatie, afdeling en teamcode staan al ingevuld — alleen voornaam toevoegen
3. Vul de quiz in — ze beantwoorden ~30 stellingen
4. Ze krijgen direct hun persoonlijke persona als resultaat

WAT JIJ ALS LEIDINGGEVENDE STRAKS DOET
Zodra iedereen heeft ingevuld krijg je van mij een persoonlijke link om het team-resultaat in te zien.

Vragen? Bel of mail gerust.

Hartelijke groet,
Judith
The Office Factory
+31 6 8389 4556 · judith@tof.services`,
  },

  /** Individuele tester uitnodigen — los van teams en codes. */
  inviteTester: {
    eyebrow: 'Individuele tester uitnodigen',
    lead: 'Geen team, geen code — alleen een persoonlijke inlog. Na het klikken op de link in de mail komt de ontvanger direct in de vragenlijst en ziet daarna zijn eigen persona.',
    nameLabel: 'Voornaam (optioneel)',
    namePlaceholder: 'Bv. Maarten',
    emailLabel: 'E-mail',
    emailPlaceholder: 'naam@organisatie.nl',
    send: 'Stuur inlogmail',
    sending: 'Bezig…',
    cooldown: (seconds) => `Opnieuw over ${seconds}s`,
    hint: 'Lukt versturen niet? Mail de tekst hieronder zelf.',
    sent: (email) => `Inlogmail verstuurd naar ${email}. De link is één uur geldig.`,
    errors: {
      invalidEmail: 'Vul een geldig e-mailadres in.',
      sendFailed: 'Versturen mislukt. Gebruik de mailtekst hieronder.',
    },
    toggleMail: 'Mailtekst en link zelf versturen ↓',
    copyMail: 'Kopieer mailtekst',
    copied: '✓ Gekopieerd',
    copyLink: 'Kopieer alleen de link',
    /** Terugval als naam of e-mailadres nog leeg is. */
    mailFallbackName: 'jij',
    mailFallbackEmail: 'je eigen adres',
    mailBody: ({ recipient, email, loginUrl }) => `Beste ${recipient},

Ik laat je graag zelf ervaren waar onze persona-tool over gaat. Je bent er een kwartiertje mee bezig.

ZO WERKT HET
1. Open deze link: ${loginUrl}
2. Vul je e-mailadres in (${email}) — je krijgt meteen een inloglink in je mailbox
3. Klik die link aan en je staat direct in de vragenlijst
4. Na negen vragen zie je je eigen persona

Geen wachtwoord nodig. Je antwoorden blijven van jou.

Benieuwd naar wat dit voor een heel team laat zien? Bel of mail gerust.

Hartelijke groet,
Judith
The Office Factory
+31 6 8389 4556 · judith@tof.services`,
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

  /** Schakelaar tussen module 01 en 02 op de detailpagina. */
  moduleToggle: {
    ariaLabel: 'Module',
    options: {
      insight: '01 — Team Insight',
      dynamics: '02 — Team Dynamics',
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
    emailPlaceholder: 'a.kempeneers@nijkerk.eu',
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
