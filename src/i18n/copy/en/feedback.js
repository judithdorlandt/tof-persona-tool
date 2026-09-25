/**
 * feedback — the short check at the bottom of the results page.
 *
 * The keys of `fitOptions` and `teamOptions` are database values (columns
 * `fit` and `team_use`) — never translate those, only the values.
 */
const feedback = {
  eyebrow: 'Quick check',
  title: 'Does this ring true for you?',
  lead: 'This helps us make the tool smarter and sharper.',

  fitOptions: {
    spot_on: 'Spot on',
    recognizable: 'Recognisable',
    doubt: 'Not sure',
    not_really: 'Not really',
  },

  reasonLabel: 'What do you recognise in it?',
  reasonPlaceholder: 'For example: how you work, your energy, your frustrations...',

  teamUseLabel: 'Taking it further',
  teamUseQuestion: 'Would you want to use this for your team as well?',
  teamOptions: {
    yes: 'Yes',
    maybe: 'Maybe',
    no: 'No',
  },

  emailLabel: 'Keep talking',
  emailTitle: 'Leave your email',
  emailLead: 'Then I would be glad to think along about what this could mean for your team.',
  emailPlaceholder: 'youremail@company.com',

  versionNote: 'This is version 1 — your input makes it better.',
  saving: 'Saving...',
  submit: 'Send',
  saveError: 'Something went wrong while saving.',

  thanks: {
    eyebrow: 'Thank you',
    title: 'Thank you for your input.',
    lead: 'This is version 1 — your input helps make the tool sharper and more valuable.',
  },
};

export default feedback;
