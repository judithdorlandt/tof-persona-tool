const common = {
  back: 'Terug',
  next: 'Verder',
  close: 'Sluiten',
  cancel: 'Annuleren',
  save: 'Opslaan',
  send: 'Versturen',
  busy: 'Bezig…',
  loading: 'Laden…',
  unknown: 'Onbekend',
  anonymous: 'Anoniem',
  copy: 'Kopieer',
  copied: 'Gekopieerd',
  organization: 'Organisatie',
  team: 'Team',
  department: 'Afdeling',
  name: 'Naam',
  email: 'E-mail',
  errors: {
    generic: 'Onbekende fout',
    supabaseUnavailable: 'Supabase niet beschikbaar',
    invalidEmail: 'Vul een geldig e-mailadres in.',
    noAdminRights: 'Geen admin-rechten',
    missingCredentials: 'Vul je e-mailadres en wachtwoord in.',
    invalidToken: 'Geen geldige token in de link.',
    noSession: 'Geen actieve sessie',
    notLoggedIn: 'Niet ingelogd',
    invalidCode: 'Code niet geldig of inactief',
    requiredFields: 'Niet alle verplichte velden zijn ingevuld.',
    // Opslagfouten die de deelnemer letterlijk te zien krijgt.
    save: {
      schema: 'De database is even niet bereikbaar (schema). Probeer het zo opnieuw.',
      permission: 'Je resultaat kon niet worden opgeslagen (geen rechten). Neem contact op als dit blijft.',
      column: 'Er ging iets mis bij het opslaan (veld ontbreekt). Neem contact op als dit blijft.',
      generic: 'Je resultaat kon niet worden opgeslagen. Ververs de pagina om het opnieuw te proberen.',
    },
  },
  // Taal-onafhankelijke locale voor datum- en getalnotatie.
  locale: 'nl-NL',
};

export default common;
