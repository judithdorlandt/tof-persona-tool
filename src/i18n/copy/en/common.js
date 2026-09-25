const common = {
  back: 'Back',
  next: 'Continue',
  close: 'Close',
  cancel: 'Cancel',
  save: 'Save',
  send: 'Send',
  busy: 'Working…',
  loading: 'Loading…',
  unknown: 'Unknown',
  anonymous: 'Anonymous',
  copy: 'Copy',
  copied: 'Copied',
  organization: 'Organisation',
  team: 'Team',
  department: 'Department',
  name: 'Name',
  email: 'Email',
  errors: {
    generic: 'Unknown error',
    supabaseUnavailable: 'Supabase unavailable',
    invalidEmail: 'Enter a valid email address.',
    noAdminRights: 'No admin rights',
    missingCredentials: 'Enter your email address and password.',
    invalidToken: 'No valid token in the link.',
    noSession: 'No active session',
    notLoggedIn: 'Not logged in',
    invalidCode: 'Code invalid or inactive',
    requiredFields: 'Not all required fields have been filled in.',
    // Opslagfouten die de deelnemer letterlijk te zien krijgt.
    save: {
      schema: 'The database is briefly unreachable (schema). Please try again shortly.',
      permission: 'Your result could not be saved (no permission). Get in touch if this keeps happening.',
      column: 'Something went wrong while saving (missing field). Get in touch if this keeps happening.',
      generic: 'Your result could not be saved. Refresh the page to try again.',
    },
  },
  // Taal-onafhankelijke locale voor datum- en getalnotatie.
  locale: 'en-GB',
};

export default common;
