/**
 * teamInsightText (en) — Module 1 · Team Insight, the generated sentences.
 *
 * Mirrors `copy/nl/teamInsightText.js` key for key. Belongs to the pure
 * logic in `src/utils/TeamInsights.js`, which runs both in the TeamDashboard
 * screen and in the team insight PDF.
 *
 * Keys that are logic and are therefore NEVER translated:
 *   - persona ids: maker, groeier, presteerder, denker, verbinder,
 *     teamspeler, zekerzoeker, vernieuwer
 *   - workplace ids: focus, work, hybride, meeting, project, team,
 *     learning, retreat, social
 *   - tension-pair ids: the `persona:persona` keys under `tensionPairs`
 *   - the quick-win `source` values — used downstream as lookup keys
 *
 * Persona names are never hardcoded where they vary per persona: they come
 * from copy/<lang>/archetypes.js via `getArchetypes(lang)` and are passed in
 * as an argument. English names: Maker, Grower, Achiever, Thinker,
 * Connector, Team Player, Stabiliser, Innovator.
 *
 * PDF NOTE: the bundled font subsets lack >= (U+2265) and <= (U+2264).
 * Write thresholds out in words ("10 or more"). Safe: · – — é.
 */

/** Join parts naturally: "A, B and C". */
function joinNatural(parts = []) {
  const list = parts.filter(Boolean);
  if (list.length === 0) return '';
  if (list.length === 1) return list[0];
  if (list.length === 2) return `${list[0]} and ${list[1]}`;
  return `${list.slice(0, -1).join(', ')} and ${list[list.length - 1]}`;
}

const teamInsightText = {
  // ── Workplace labels ───────────────────────────────────────────────
  // The nine workplace types, per language-neutral key. These end up inside
  // the generated sentences (often via .toLowerCase()) and on the
  // underserved/oversupplied objects shown in the dashboard and the PDF.
  // Wording matches teamPanels.workplaceNeeds.labels.
  workplaceLabels: {
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

  // Turn names or labels into a single list.
  joinNatural,

  // Plural of a persona name in lower case ("makers").
  personaPlural: (name) => `${String(name).toLowerCase()}s`,

  // ── Headline — one sentence on what this team asks of the workplace ─
  headline: {
    empty: 'No workplace need visible yet — wait until more team members have filled in the questionnaire.',
    two: (first, second) => `This team mainly asks for ${first} and ${second}.`,
    one: (first) => `This team mainly asks for ${first}.`,
    // No category above the threshold: the needs sit close together.
    mixedBase: 'This team has a mixed workplace need — no single category clearly stands out.',
    mixedBalance: (under, over) =>
      `The gain lies in the balance: relatively high demand for ${under}, low for ${over}.`,
    mixedUnderOnly: (under) => `The largest relative demand lies with ${under}.`,
  },

  // ── Persona tension — what breaks when the workplace does not fit ───
  // Shown per persona in the impact summary (dominant/middle/minority).
  personaTension: {
    maker: (name) => `${name} never gets into flow without uninterrupted room to build.`,
    groeier: (name) => `${name} gets no time to digest the work and develop.`,
    presteerder: (name) => `${name} loses grip on progress without a visible working rhythm.`,
    denker: (name) => `${name} finds no quiet for the analysis that care demands.`,
    verbinder: (name) => `${name} misses the early signal when collaboration starts to grate.`,
    teamspeler: (name) => `${name} loses the shared rhythm that carries the team.`,
    zekerzoeker: (name) => `${name} misses the anchor that structure and predictability provide.`,
    vernieuwer: (name) => `${name} finds no sparring partner to sharpen ideas against.`,
    fallback: (name) => `${name} loses grip when the workplace does not fit.`,
  },

  // ── Underserved — above-average demand the office does not deliver ──
  underserved: {
    focus: 'The team loses concentration in an open environment.',
    work: 'There is no steady base for calm day-to-day work.',
    hybride: 'Online and physical working stalls on poor switching moments.',
    meeting: 'Alignment has no structured place to happen.',
    project: 'Layered work cannot be made visible.',
    team: 'Workable contact disappears in an environment that is too formal.',
    learning: 'Reflection and learning get no room to breathe.',
    retreat: 'There is nowhere to recharge without distraction.',
    social: 'Informal encounter no longer feeds the work.',
    fallback: (label) => `The team is missing something in ${label}.`,
  },

  // ── Oversupplied — spaces this team barely has any demand for ───────
  oversupplied: {
    focus: 'Plenty of focus spaces that nobody really needs turn into an empty island.',
    work: 'An ocean of standard workstations does not work — this team does a different kind of work.',
    hybride: 'Hybrid facilities that are barely used cost more than they return.',
    meeting: 'Too many meeting rooms tempt people into meeting instead of working.',
    project: 'Creative zones standing empty start to feel like a reproach.',
    team: 'Large collaboration spaces without demand become noisy thoroughfares.',
    learning: 'Unused learning spaces signal that development happens "somewhere else".',
    retreat: 'Retreat spaces nobody seeks out become odd empty corners.',
    social: 'Too many informal spaces fragment rather than connect.',
    fallback: (label) => `Plenty of ${label} without demand costs energy without returning any.`,
  },

  // ── Quick wins — concrete actions, per source ───────────────────────
  quickWins: {
    // source: 'werkstijlen' — what the most common primary persona asks for.
    persona: {
      maker: (name) => `Block out time without meetings. ${name}s finish things in quiet, not in interruptions.`,
      groeier: (name) => `Give ${name.toLowerCase()}s room to digest the work. That is where they grow, not under pressure.`,
      presteerder: (name) => `Make progress visible. ${name}s thrive on clear goals and milestones.`,
      denker: (name) => `Circulate documents in good time. ${name}s want to arrive prepared.`,
      verbinder: (name) => `Make room for informal contact. ${name}s keep collaboration alive.`,
      teamspeler: (name) => `Give the team shared rituals. ${name}s thrive on belonging.`,
      zekerzoeker: (name) => `Communicate change early and consistently. ${name}s deliver in predictability.`,
      vernieuwer: (name) => `Reserve room for experiment. ${name}s lose energy when everything is routine.`,
    },

    // source: 'werkplek' — what the strongest workplace need asks for.
    workplace: {
      focus: 'Create a screened-off concentration zone. No phone calls, no meetings.',
      work: 'Invest in quiet standard workstations. Quality over variety.',
      hybride: 'Build one good switching room. Fixed camera, good acoustics, plug-and-play.',
      meeting: 'Split up your meeting rooms. Small for alignment, large for depth.',
      project: 'Reserve wall and table space for work in progress. This team works visually.',
      team: 'Create a real collaboration space. Not a boardroom, but a workable place to meet.',
      learning: 'Set up a learning space where thinking is allowed to take time. Not every place has to feel productive.',
      retreat: 'Create a genuine retreat space. Not a laptop corner, a real pause for breath.',
      social: 'Strengthen the informal meeting place. Not as a thoroughfare, but as a workable space.',
    },

    // source: 'spanning' — deliberately about working style, not individuals.
    tensionUnderserved: (label, who) =>
      `Protect ${label}. Demand here is above average while the office often fails to provide it — and it is ${who} who get stuck.`,
    tensionWhoFallback: 'team members',
    tensionOversupplied: (label) =>
      `Put ${label} to different use. This team barely uses them, so they cost space without adding value.`,

    // source: 'minderheid' — `count` drives singular or plural.
    minority: (workplaces, personas, count) =>
      `Make sure the working environment also offers ${workplaces}. That stops the ${personas} from feeling isolated.`,

    // source: 'ontbrekend' — persona not present in the team at all.
    missing: {
      maker: (name) => `Recruit a ${name}. Ideas now stay stuck in concepts.`,
      groeier: (name) => `Recruit a ${name}. The team lacks the curiosity to learn.`,
      presteerder: (name) => `Recruit an ${name}. The team lacks the edge to get things finished.`,
      denker: (name) => `Recruit a ${name}. Decisions are made too quickly, without thorough testing.`,
      verbinder: (name) => `Recruit a ${name}. The early signal that collaboration is grating is missing.`,
      teamspeler: (name) => `Recruit a ${name}. Nobody explicitly guards the group dynamic.`,
      zekerzoeker: (name) => `Recruit a ${name}. The counterweight that protects stability is missing.`,
      vernieuwer: (name) => `Recruit an ${name}. The impulse to let go of existing approaches is missing.`,
    },

    // source: 'reflectie' — fallback when no persona is missing.
    reflection: 'Add the workplaces this team is missing. No refurbishment needed — small and visible works.',
  },

  // ── Highlights — summarising lines at the top of the dashboard ──────
  highlights: {
    top: (name) =>
      `${name} is the most present working style in this team and probably sets the tone for pace, preferences and collaboration.`,
    combination: (first, second) =>
      `The combination of ${first} and ${second} shows where both strength and tension can arise in alignment, decision-making and rhythm.`,
    needs: (first, second) =>
      `The strongest workplace need lies with ${first} and ${second}. That calls for deliberate choices in focus, meeting and collaboration.`,
  },

  // ── Energy — kept for Module 2 ──────────────────────────────────────
  energy: {
    present: (name, percentage) => `${name} is present in the team (${percentage}%).`,
    body: {
      maker: 'This team likes to make things.',
      groeier: 'This team wants to learn.',
      presteerder: 'This team delivers.',
      denker: 'This team thinks things through.',
      verbinder: 'This team looks after the relationships.',
      teamspeler: 'This team holds on to each other.',
      zekerzoeker: 'This team builds on continuity.',
      vernieuwer: 'This team seeks the new.',
      fallback: (name) => `${name} sets the tone.`,
    },
  },

  // ── Tension pairs — kept for Module 2 ───────────────────────────────
  // Key = `${personaA}:${personaB}`; the names come from archetypes.
  tensionPairs: {
    'maker:denker': {
      label: 'Pace vs. reflection',
      description: (a, b) =>
        `${a}s want to move forward, ${b.toLowerCase()}s want to understand first. Both are needed — without alignment the team stalls or runs in the wrong direction.`,
    },
    'presteerder:verbinder': {
      label: 'Result vs. relationship',
      description: (a, b) =>
        `${a}s steer on what has to get done, ${b.toLowerCase()}s on how it runs together. Without balance it turns either coldly efficient or warmly slow.`,
    },
    'vernieuwer:zekerzoeker': {
      label: 'Renewal vs. continuity',
      description: (a, b) => `${a}s look for the new, ${b.toLowerCase()}s protect what works.`,
    },
    'groeier:teamspeler': {
      label: 'Development vs. stability',
      description: (a, b) => `${a}s want to learn and stretch, ${b.toLowerCase()}s keep the group running.`,
    },
  },

  // Line under a tension pair with the actual ratio.
  tensionDetail: (nameA, percentageA, nameB, percentageB) =>
    `In this team: ${nameA} ${percentageA}% vs. ${nameB} ${percentageB}%.`,

  // ── Usage — kept for Module 2 ───────────────────────────────────────
  usage: {
    meeting: {
      situation: 'Before a team meeting',
      title: 'What do you put on the table?',
      item: (name, percentage) => `The team is dominated by ${name} (${percentage}%).`,
    },
    workplace: {
      situation: 'Before a workplace decision',
      title: 'What does this team ask of the space?',
      item: (label) => `${label} is the strongest need.`,
    },
  },
};

export default teamInsightText;
