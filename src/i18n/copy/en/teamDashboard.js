// Spaces as running text: "Focus spaces, collaboration spaces and quiet
// spaces". Only the first capitalised (start of the sentence).
function list(labels) {
  const l = labels.map((x, i) => (i === 0 ? x : x.toLowerCase()));
  return l.length <= 1 ? (l[0] || '') : `${l.slice(0, -1).join(', ')} and ${l[l.length - 1]}`;
}

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
        ? "Your team uses the names option. Everyone in the team sees the same names, the manager included. If you leave the name field empty, you'll appear without a name."
        : 'Nobody sees who has which working style, not even a manager.',
    ].join('\n'),
  },

  close: 'Close ✕',
  closeLabel: 'Close panel',

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
    // Workplace fit. See the NL file for the arguments.
    tension: {
      eyebrow: 'Workplace fit',
      detailTitle: 'Does the workplace fit this team?',
      value: (first) => `Enough ${first.toLowerCase()}?`,
      hint: (beperkt, extra) => (beperkt
        ? `Needed only now and then: ${beperkt.toLowerCase()}${extra > 0 ? ` +${extra}` : ''}`
        : 'Needed only now and then: none'),
      lead: (kernen, hoogste, beperkt) => {
        const eerste = kernen.length > 0
          ? `${list(kernen)} are core for this team.`
          : `This team has no clear core space. The most in demand are ${hoogste.toLowerCase()}.`;
        return beperkt.length > 0
          ? `${eerste} ${list(beperkt)} are needed only now and then.`
          : eerste;
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
      discuss: "This picture is meant for your team to talk through together: what do you recognise, and what don't you?",
      body: "Your manager also sees Team Dynamics: what this team's mix asks of the person leading it. It doesn't show who has which working style.",
      login: 'Are you the manager? Log in →',
      shareEyebrow: 'Another team?',
      shareLead: 'Know a team that could use this? Copy a note for whoever leads it.',
      button: 'Copy the note',
      copied: "Copied. Add, in your own words, what stayed with you. Your own team's picture stays out of it.",
      copyFailed: 'Copying did not work. Please try again.',
      shareText: `Hi,

Our team did TOF Persona. Everyone answers nine questions about how they work. What I found most interesting was seeing how I work, and why that sometimes causes friction in a team.

The team then gets a shared picture: which working styles it has and what it needs from the workplace. By default it doesn't show who has which working style, not even to a manager. And with fewer than five completed profiles, there's no picture at all.

The example team at www.persona-tool.nl/demo shows what it looks like. To set it up for a team, see www.persona-tool.nl/voor-je-team.

Best,`,
    },
  },
};

export default teamDashboard;
