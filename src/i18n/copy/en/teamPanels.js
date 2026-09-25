/**
 * teamPanels — English copy for the panels in src/team/components/.
 * Mirrors the key structure of copy/nl/teamPanels.js.
 *
 * Persona ids (maker, groeier, …) and workplace ids (focus, work, …) are
 * database keys and therefore stay untranslated — only the values differ.
 */

/** Join names naturally: "A, B and C". */
function joinNames(parts = []) {
  const list = parts.filter(Boolean);
  if (list.length === 0) return '';
  if (list.length === 1) return list[0];
  if (list.length === 2) return `${list[0]} and ${list[1]}`;
  return `${list.slice(0, -1).join(', ')} and ${list[list.length - 1]}`;
}

const teamPanels = {
  names: {
    join: joinNames,
    anonymous: (n) => (n === 1 ? '1 anonymous' : `${n} anonymous`),
  },

  header: {
    defaultEyebrow: '01 — Team insight',
    defaultTitleLead: 'Team insight for',
    teamFallback: 'your team',
    leadRose:
      'Where collaboration rubs, why pace and reflection collide, and what that asks of leadership.',
    leadSage:
      'What the working styles are, what the team needs from its workplace and where the first opportunities lie.',
    chips: {
      responses: 'Responses',
      organization: 'Organisation',
      dominant: 'Dominant',
      reliability: 'Reliability',
    },
    reliability: {
      indicative: 'Indicative',
      growing: 'Growing',
      strong: 'Strong picture',
    },
    actions: {
      otherTeam: 'Another team',
      backHome: 'Back to home',
    },
  },

  stats: {
    empty: '—',
    responses: {
      label: 'Number of responses',
      subtext: 'Completed profiles in this dashboard',
    },
    dominant: {
      label: 'Dominant working style',
      subtext: 'Most common primary working style',
    },
    topNeed: {
      label: 'Top workplace need',
      subtext: 'Strongest spatial need at team level',
    },
  },

  personaDistribution: {
    empty: 'No working styles available yet.',
    dominantEyebrow: 'Dominant working style',
    shareOfTeam: (pct) => `${pct}% of the team`,
    carriedBy: 'Carried by ',
    furtherRepresented: 'Also represented',
    energy: {
      eyebrow: 'The energy in this team',
      lead:
        'Weighted working-style energy across all profiles. Working styles that are not primary still contribute through second and third preferences.',
    },
    missing: {
      eyebrow: 'Who is missing',
      fallback: (name) => `Without a ${name} the team misses a specific perspective.`,
      contribution: {
        maker: 'Without a Maker the team lacks the urge to make things tangible — ideas stay stuck as concepts.',
        groeier: 'Without a Grower the team lacks the natural curiosity to learn and develop.',
        presteerder: 'Without an Achiever the team lacks the edge to actually get things finished.',
        denker: 'Without a Thinker the team lacks the rigour to test decisions on substance.',
        verbinder: 'Without a Connector the team misses the early signal when collaboration starts to rub.',
        teamspeler: 'Without a Team Player the team lacks the glue — nobody explicitly guards the group dynamic.',
        zekerzoeker: 'Without a Stabiliser the team lacks the counterweight that protects continuity and stability.',
        vernieuwer: 'Without an Innovator the team lacks the impulse to dare to let go of existing approaches.',
      },
    },
  },

  workplaceNeeds: {
    empty: 'No workplace needs available yet.',
    labels: {
      focus: 'Focus spaces',
      work: 'Standard workstations',
      hybride: 'Hybrid spaces',
      meeting: 'Meeting spaces',
      project: 'Creative spaces',
      team: 'Collaboration spaces',
      learning: 'Learning spaces',
      retreat: 'Retreat spaces',
      social: 'Informal spaces',
    },
    meaning: {
      focus: 'For deep, concentrated work without interruption.',
      work: 'The steady base for daily work and focus in between activities.',
      hybride: 'For work where online and physical have to meet.',
      meeting: 'For alignment, decisions and structured conversations.',
      project: 'For creative, visual and project-based work that grows through feedback and collaboration.',
      team: 'For active collaboration and shared ownership.',
      learning: 'For learning, reflection and development at your own pace.',
      retreat: 'For recovery, calm and mental breathing space.',
      social: 'For informal contact that feeds collaboration.',
    },
    strongestEyebrow: 'Strongest need',
    shareOfDemand: (pct) => `${pct}% of the team's demand`,
    furtherAboveAverage: 'Also above average',
    below: {
      eyebrow: 'There is less demand for these',
      note: 'If your office is full of these, they cost energy without giving anything back.',
    },
  },

  workplaceTension: {
    empty: 'No workplace need visible yet — wait until more team members have taken part.',
    headerQuestion: 'What does your current office look like?',
    coreEyebrow: 'The core',
    shareOne: (pct) => `${pct}% of the team`,
    shareTwo: (a, b) => `${a}% + ${b}% of the team`,
    shareMany: (total) => `${total}% of the team`,
    impactResult: (isOne) => ({
      before: 'Will not ',
      highlight: 'deliver results',
      after: isOne
        ? ' if the workspaces he or she needs are not available in sufficient numbers.'
        : ' if the workspaces they need are not available in sufficient numbers.',
    }),
    impactEnergy: (isOne) => ({
      before: 'Will ',
      highlight: 'lose energy',
      after: isOne
        ? ' coming into the office if it is full of things he or she does not use.'
        : ' coming into the office if it is full of things they do not use.',
    }),
    carriedBy: 'Carried by ',
    restOfTeam: 'Also in the team',
    isolationRisk: 'Risk of isolation',
    office: {
      eyebrow: 'Check your office',
      enough: 'Do you provide enough of:',
      notFull: 'And is it not full of:',
    },
  },

  energyFriction: {
    section: {
      eyebrow: 'Energy & friction',
      title: 'Where is the energy and where does friction appear?',
      lead:
        'Not only who is in the team, but also where its strength comes from and where the rhythms collide. This is the essence of what sets this team apart.',
    },
    energy: {
      title: 'Where the energy sits',
      description: 'The dominant styles set the tone. This is where the team draws its strength.',
      empty: 'No clear energy line visible yet.',
      label: (persona, percentage) => `${persona} · ${percentage}%`,
    },
    friction: {
      title: 'Where friction appears',
      description:
        'Where styles meet — or where one style is so strong that others are heard less.',
      empty:
        'No direct friction detected. That does not mean there is no tension — the opposites are simply not strongly present at the same time.',
    },
  },

  quickWins: {
    empty: 'No quick wins available yet.',
    countLabel: (n) => (n === 1 ? 'One action for tomorrow' : `${n} actions for tomorrow`),
    note: 'A synthesis of every insight in this dashboard.',
    sources: {
      werkstijlen: 'From working styles',
      werkplek: 'From workplace',
      spanning: 'From tension',
      minderheid: 'From the minority',
      ontbrekend: 'From what is missing',
      reflectie: 'Reflection',
    },
  },

  usage: {
    eyebrow: 'How to use this',
    title: 'Ready for a team meeting, a workplace decision or a leadership conversation',
    lead:
      'It is not the data itself that makes this dashboard valuable — it is the conversation that follows. Three concrete ways to put it to work tomorrow.',
  },
};

export default teamPanels;
