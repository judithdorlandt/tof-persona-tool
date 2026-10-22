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


  gate: {
    title: 'No team picture yet',
    body: 'The team picture appears from five completed profiles onwards. Below that it is too easy to work out who answered what, even without names.',
    count: (n) => `${n} of five completed`,
    hint: 'Share the team code with your colleagues. The picture appears as soon as the fifth profile comes in.',
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
      // `kern` = number of core spaces, `beperkt` = number needed only now and then.
      value: (kern, beperkt) => {
        const k = kern > 0 ? `${kern} core` : 'no core';
        return beperkt > 0 ? `${k} · ${beperkt} occasional` : k;
      },
      lead: (kern, beperkt) => {
        const k = kern > 0
          ? `${kern} core space${kern > 1 ? 's' : ''} this team really needs`
          : 'No clear core space';
        if (beperkt === 0) return `${k}.`;
        return `${k}, ${beperkt} needed only now and then.`;
      },
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
      lead: 'Tensions between working styles, what they mean for leadership, and the choice between pace and reflection — in one deeper dashboard for whoever leads the team.',
      plan: 'Book a conversation',
    },
  },
};

export default teamDashboard;
