const teamDashboard = {
  hero: {
    eyebrow: '01 — Team Insight',
    title: 'Team insight for',
    lead: 'Which working styles this team has, what it needs from the workplace and where the first opportunities lie.',
    downloadPdf: 'Download as PDF',
    otherTeam: 'Another team',
  },

  fallbackTeamName: 'your team',

  chips: {
    responses: 'Completed',
    organisation: 'Organisation',
    dominant: 'Dominant',
    reliability: 'Reliability',
  },


  // Team Dynamics shows this block too; the copy lives only here.
  gate: {
    title: 'No team picture yet',
    titleFor: 'No team picture yet for',
    body: 'The team picture appears from five completed profiles onwards. Below that it is too easy to work out who answered what, even without names.',
    count: (n) => `${n} of five added`,
    copyMessage: 'Copy the message for your team',
    copied: 'Copied',
    message: ({ team, code, showNames }) => [
      `${team} is putting together a team picture. Here's how to take part:`,
      `1. Open this link on your phone and download the TOF Persona app: https://team.persona-tool.nl/en/quiz?code=${encodeURIComponent(code)}`,
      '2. Take the test in the app: nine questions, about five minutes.',
      `3. Tap 'Add my profile' at the bottom of your profile. The website opens. Enter this team code, tap 'Check code' and then 'Add my profile' again: ${code}`,
      "Your profile only counts once you've tapped 'Add my profile' on the website. Keep this message until then: you only need the team code after the test.",
      'Once five colleagues have added their profile, the team picture is ready. You can open it at team.persona-tool.nl/en/team, with the same team code.',
      showNames
        ? "Your team has agreed to show first names in Team Insight. Everyone in the team sees the same names, the manager included. If you leave the name field empty, you'll appear without a name."
        : 'Nobody sees who has which working style, not even a manager.',
    ].join('\n'),
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
      eyebrow: 'First steps',
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
      body: "Your manager also sees Team Dynamics: what this team's mix asks of the person leading it. It doesn't show who has which working style either.",
      login: 'Are you the manager? Log in →',
    },
  },
};

export default teamDashboard;
