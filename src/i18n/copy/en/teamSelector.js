/**
 * teamSelector — English copy for TeamSelector.jsx.
 * Mirrors the key structure of copy/nl/teamSelector.js.
 */
const teamSelector = {
  gate: {
    eyebrow: 'Team selector',
    title: 'Access required',
    lead: 'This space is only available with a valid access code.',
    cta: 'Back to the explanation',
  },

  page: {
    eyebrow: 'Team selector',
    titleLead: 'Choose how you want to select',
    titleHighlight: 'and open the dashboard.',
    lead:
      'You can open a dashboard based on teams and departments within an organisation, or straight from an invite code.',
    makerMode: 'Maker mode active',
    loading: 'Loading teams…',
  },

  modes: {
    team: 'Organisation + team',
    invite: 'Invite code',
  },

  fields: {
    organization: 'Organisation',
    allOrganizations: 'All organisations',
    teams: 'Teams / departments',
    selectAll: 'Select all',
    noTeams: 'Choose an organisation first, or make sure teams are available.',
    inviteCode: 'Invite code',
    chooseInviteCode: 'Choose an invite code',
    chooseLevel: 'Choose a level',
  },

  optionLabels: {
    departmentOnly: (department) => `Department: ${department}`,
    departmentAndTeam: (department, team) => `Department: ${department} — Team: ${team}`,
    teamOnly: (team) => `Team: ${team}`,
    inviteCode: (code) => `Invite code: ${code}`,
  },

  reliability: {
    low: 'Low reliability',
    basic: 'Basic insight',
    strong: 'Strong picture',
  },

  invite: {
    loggedInPrefix: 'You are signed in with invite code ',
    loggedInSuffix:
      '. Choose below whether you want the overall picture for the department or a single team.',
    departmentTotal: 'Department total',
    departmentTotalHint: 'All responses within this invite code combined',
  },

  summary: {
    teamsPrefix: 'You have now selected ',
    teamsSuffix: ' group(s).',
    invitePrefix: 'You are now viewing invite code ',
    atTeamLevel: ' at team level: ',
    atLevelPrefix: ' at ',
    departmentLevel: 'department level',
    withPrefix: ' with ',
    responsesSuffix: ' response(s).',
  },

  actions: {
    openDashboard: 'View team dashboard',
    busy: 'Working…',
    back: 'Back',
  },

  errors: {
    supabaseUnavailable: 'Supabase is unavailable.',
    loadTeams: 'Something went wrong while loading the teams.',
    noTeamSelected: 'Choose at least one team or department.',
    dashboardFailed: 'The team dashboard could not be built.',
    noInviteCode: 'Choose an invite code.',
    inviteDashboardFailed: 'The dashboard for this invite code could not be built.',
  },
};

export default teamSelector;
