const teamDashboard = {
  hero: {
    eyebrow: '01 — Team Insight',
    title: 'Team insight for',
    lead: 'What the working styles are, what this team asks of its workplace, and where the first opportunities sit.',
    downloadPdf: 'Download as PDF',
    otherTeam: 'Another team',
  },

  fallbackTeamName: 'your team',

  chips: {
    responses: 'Responses',
    organisation: 'Organisation',
    dominant: 'Dominant',
    reliability: 'Reliability',
  },

  reliability: {
    low: 'Indicative',
    mid: 'Growing',
    high: 'Strong picture',
  },

  close: 'Close ✕',

  empty: '—',

  tiles: {
    personas: {
      eyebrow: 'Working styles',
      hint: 'Who is in this team',
      detailTitle: 'Who is in this team',
    },
    workplace: {
      eyebrow: 'Workplace',
      hint: 'What this team asks for',
      detailTitle: 'What this team asks of the workplace',
    },
    tension: {
      eyebrow: 'Tension',
      hint: 'Where things may rub',
      detailTitle: 'Where need and supply may rub',
      valueConsistent: 'Consistent',
      valueUnderserved: (n) => `${n} underserved`,
      valueOversupplied: (n) => `${n} too many`,
      leadNone: 'The workplace need is consistent — little friction.',
      leadBoth: (under, over) =>
        `${under} workplace type${under > 1 ? 's' : ''} underserved, ${over} possibly present in excess.`,
      leadUnder: (n) => `${n} workplace type${n > 1 ? 's' : ''} this team leans on extra hard.`,
      leadOver: (n) => `${n} workplace type${n > 1 ? 's' : ''} this team has little use for.`,
    },
    quickwins: {
      eyebrow: 'Quick wins',
      hint: 'For tomorrow',
      detailTitle: 'Actions for tomorrow',
      detailLead: 'Concrete actions drawn from every insight on this dashboard.',
      value: (n) => `${n} ${n === 1 ? 'action' : 'actions'}`,
    },
  },

  bridge: {
    available: {
      eyebrow: 'Team Dynamics available',
      lead: 'See the patterns underneath: why this mix works, or where it grates.',
      cta: 'Go to Team Dynamics →',
    },
    locked: {
      eyebrow: 'Want to look deeper?',
      titleBefore: 'Team Dynamics shows you',
      titleEmphasis: 'why',
      titleAfter: 'these patterns appear.',
      lead: 'Tensions between working styles, what they mean for leadership, and the choice between pace and reflection — in one deeper dashboard, talked through in a session.',
      unlock: 'Unlock Dynamics',
      plan: 'Book a conversation',
    },
  },
};

export default teamDashboard;
