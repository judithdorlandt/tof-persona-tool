/**
 * signup — the sign-up form before the questionnaire (QuizAanmelding).
 *
 * Note: organisation names, team names and team codes come from the database
 * and are NEVER translated. Only the labels and placeholders live here.
 */
const signup = {
  eyebrow: 'Test yourself — sign up',
  // Default: the participant picks an organisation and a department.
  title: 'Choose your team',
  // Solo mode: organisation and department are already fixed.
  soloTitle: 'A little about you',
  soloLead: 'You are taking the test for yourself. Two questions first, then you are off.',

  organizationLabel: 'Organisation',
  organizationLoading: 'Loading organisations…',
  organizationPlaceholder: 'Choose your organisation…',

  departmentLabel: 'Department',
  departmentLoading: 'Loading departments…',
  departmentNeedsOrganization: 'Choose an organisation first…',
  departmentEmpty: 'No teams found',
  departmentPlaceholder: 'Choose your department…',

  teamcodeLabel: 'Team code',
  teamcodePlaceholder: 'Appears once you choose a department',
  teamcodeHint: 'This fills in automatically as soon as you choose a department.',

  firstNameLabel: 'First name',
  firstNamePlaceholder: 'What is your name?',
  firstNameHint: 'Add your name and your persona becomes properly personal.',

  teamLabel: 'Team',
  teamPlaceholder: 'Leave this blank if your department is one team',

  aboutLabel: 'More about you',

  optional: '(optional)',
  submit: 'On to the quiz →',

  errors: {
    noConnection: 'The connection to the database is unavailable.',
    loadFailed: 'We could not load the teams. Please try again later.',
    pickOrganization: 'Choose an organisation first.',
    pickDepartment: 'Choose a department first.',
  },
};

export default signup;
