/**
 * teamSelector — alle teksten van TeamSelector.jsx.
 *
 * Organisatie-, team- en invite-code-waarden komen uit Supabase en blijven
 * onvertaald; alleen de labels eromheen staan hier.
 */
const teamSelector = {
  gate: {
    eyebrow: 'Team selector',
    title: 'Toegang vereist',
    lead: 'Deze omgeving is alleen beschikbaar met een geldige toegangscode.',
    cta: 'Terug naar uitleg',
  },

  page: {
    eyebrow: 'Team selector',
    titleLead: 'Kies hoe je wilt selecteren',
    titleHighlight: 'en open het dashboard.',
    lead:
      'Je kunt een dashboard openen op basis van teams en afdelingen binnen een organisatie, of direct op basis van een invite code.',
    makerMode: 'Maker mode actief',
    loading: 'Teams laden…',
  },

  modes: {
    team: 'Organisatie + team',
    invite: 'Invite code',
  },

  fields: {
    organization: 'Organisatie',
    allOrganizations: 'Alle organisaties',
    teams: 'Teams / afdelingen',
    selectAll: 'Alles selecteren',
    noTeams: 'Kies eerst een organisatie of zorg dat er teams beschikbaar zijn.',
    inviteCode: 'Invite code',
    chooseInviteCode: 'Kies een invite code',
    chooseLevel: 'Kies niveau',
  },

  optionLabels: {
    departmentOnly: (department) => `Afdeling: ${department}`,
    departmentAndTeam: (department, team) => `Afdeling: ${department} — Team: ${team}`,
    teamOnly: (team) => `Team: ${team}`,
    inviteCode: (code) => `Invite code: ${code}`,
  },

  reliability: {
    low: 'Lage betrouwbaarheid',
    basic: 'Basis inzicht',
    strong: 'Sterk beeld',
  },

  invite: {
    loggedInPrefix: 'Je bent ingelogd met invite code ',
    loggedInSuffix:
      '. Kies hieronder of je het totaalbeeld van de afdeling wilt zien of één team apart.',
    departmentTotal: 'Afdeling totaal',
    departmentTotalHint: 'Alle responses binnen deze invite code samen',
  },

  summary: {
    teamsPrefix: 'Je hebt nu ',
    teamsSuffix: ' groep(en) geselecteerd.',
    invitePrefix: 'Je bekijkt nu invite code ',
    atTeamLevel: ' op teamniveau: ',
    atLevelPrefix: ' op ',
    departmentLevel: 'afdelingsniveau',
    withPrefix: ' met ',
    responsesSuffix: ' response(s).',
  },

  actions: {
    openDashboard: 'Bekijk teamdashboard',
    busy: 'Bezig…',
    back: 'Terug',
  },

  errors: {
    supabaseUnavailable: 'Supabase is niet beschikbaar.',
    loadTeams: 'Er ging iets mis bij het ophalen van teams.',
    noTeamSelected: 'Kies minstens één team of afdeling.',
    dashboardFailed: 'Het teamdashboard kon niet worden opgebouwd.',
    noInviteCode: 'Kies een invite code.',
    inviteDashboardFailed: 'Het dashboard op basis van invite code kon niet worden opgebouwd.',
  },
};

export default teamSelector;
