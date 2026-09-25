/** Join parts naturally: "A, B and C". */
function joinParts(parts = []) {
  const list = parts.filter(Boolean);
  if (list.length === 0) return '';
  if (list.length === 1) return list[0];
  if (list.length === 2) return `${list[0]} and ${list[1]}`;
  return `${list.slice(0, -1).join(', ')} and ${list[list.length - 1]}`;
}

const teamDynamics = {
  hero: {
    eyebrow: '02 — Team Dynamics',
    title: 'Team Dynamics for',
    lead: 'Where collaboration grates, why pace and reflection collide, and what that asks of leadership.',
    downloadPdf: 'Download as PDF',
    backToInsight: '← Back to Team Insight',
    otherTeam: 'Another team',
  },

  noAccess: {
    title: 'No access to',
    titleAccent: 'Team Dynamics',
    lead: 'Enter your Team Dynamics access code in the team area. That code unlocks Team Insight as well.',
    cta: 'Go to the team area',
  },

  noData: {
    title: 'No team data for',
    lead: 'Load a team through Team Insight first.',
    cta: '← Back to Team Insight',
    embedded: 'No responses to base Dynamics on.',
  },

  fallbackTeamName: 'your team',

  close: 'Close ✕',

  chips: {
    responses: 'Responses',
    organisation: 'Organisation',
    dominant: 'Dominant',
    tensions: 'Tensions',
    reliability: 'Reliability',
  },

  reliability: {
    first: 'First signals',
    emerging: 'Emerging pattern',
    reliable: 'Reliable picture',
    strong: 'Strong pattern',
  },

  names: {
    join: joinParts,
    anonymousOne: 'anonymous',
    anonymousMany: (n) => `${n} anonymous`,
    anonymousAlone: 'Anonymous',
  },

  tiles: {
    dynamics: {
      eyebrow: 'Dynamics',
      value: 'Three axes',
      hint: 'Fundamental tensions',
      detailTitle: 'Three axes of team dynamics',
      detailLead: 'None of the axes is right or wrong. They show where deliberate steering pays off most.',
    },
    collaboration: {
      eyebrow: 'Collaboration',
      value: 'By working style',
      hint: 'How it runs together',
      detailTitle: 'How these working styles work together',
    },
    tensions: {
      eyebrow: 'Tensions',
      value: (n) => `${n} active`,
      valueNone: 'None active',
      hint: 'Where direction helps',
      detailTitle: 'Where this team asks for direction',
      detailLead: 'Select a tension to see the risk and the leadership advice.',
      detailLeadNone: 'No direct tension pairs — the most common combinations are not both strongly represented.',
    },
    leadership: {
      eyebrow: 'Leadership',
      value: 'Actions',
      hint: 'Synthesis for tomorrow',
      detailTitle: 'Leadership for this team',
      detailLead: 'Concrete actions, taken straight from the dynamics, collaboration, tensions and blind spots on this dashboard.',
    },
  },

  dynamics: {
    imbalance: 'Imbalance',
    axisBalanced: (left, right) =>
      `${left} and ${right.toLowerCase()} are in balance in this team. That is a mature pattern — but only if both sides are deliberately given room in discussion and decision-making.`,
    axisDominant: (dominant, recessive) =>
      `${dominant} outweighs ${recessive.toLowerCase()} in this team. That brings movement and direction, but also the risk that ${recessive.toLowerCase()} quietly disappears from conversations and choices — while it is exactly what keeps the pattern going.`,
    missing: {
      eyebrow: 'Who is missing',
      lead: (n) =>
        n === 1
          ? 'One critical voice is missing or barely present. That raises the risk of blind spots when things change.'
          : `${n} critical voices are missing or barely present. That raises the risk of blind spots when things change.`,
    },
  },

  collaboration: {
    empty: 'No collaboration patterns visible yet — wait until more team members have taken part.',
    dominantEyebrow: (pct) => `Dominant working style · ${pct}% of the team`,
    carriedBy: 'Carried by',
    worksWell: 'What works well',
    attentionFor: 'Watch out for',
    strongWith: (name) => `Strong with the ${name}`,
    attentionWith: (name) => `Watch out with the ${name}`,
    rest: {
      eyebrow: 'Further in the team',
      lead: 'The remaining working styles, who they strengthen and where attention is worth spending.',
    },
    missing: {
      eyebrow: 'Not represented',
      lead: (n) =>
        n === 1
          ? 'One working style is missing — it cannot take part in this collaboration yet.'
          : `${n} working styles are missing — they cannot take part in this collaboration yet.`,
    },
    synergy: {
      'maker:denker': 'the maker turns ideas into movement, the thinker keeps them pointed somewhere',
      'maker:vernieuwer': 'both bring energy and new ideas — together they really get things moving',
      'denker:maker': 'the thinker gives the maker structure, the maker gives the thinker something to build on',
      'denker:zekerzoeker': 'both value care — together they keep hasty decisions off the table',
      'verbinder:teamspeler': 'both guard the human side of the work — together they hold the team together',
      'verbinder:groeier': 'the connector sees who needs support, the grower helps others develop',
      'teamspeler:verbinder': 'both invest in relationships — together they form the steady base of the team',
      'teamspeler:zekerzoeker': 'both bring continuity and reliability to the work',
      'presteerder:vernieuwer': 'the achiever turns renewal into results',
      'presteerder:groeier': 'both want to move forward — together they keep the pace up',
      'groeier:presteerder': 'the grower develops at speed, the achiever keeps the focus on the outcome',
      'zekerzoeker:presteerder': 'the stabiliser builds the base the achiever accelerates from',
      'zekerzoeker:teamspeler': 'both value predictability and agreements that hold',
      'vernieuwer:maker': 'the innovator thinks it up, the maker builds it',
      'vernieuwer:presteerder': 'the innovator brings new ideas, the achiever makes sure they land',
      fallback: 'together they complement each other in pace and approach',
    },
    attention: {
      'maker:zekerzoeker': 'the maker moves faster than the stabiliser is comfortable with',
      'maker:teamspeler': 'the maker often works alone, while the team player wants to pull together',
      'denker:presteerder': 'the thinker wants to understand first, the achiever wants to decide now',
      'denker:maker': 'the thinker keeps analysing while the maker already wants to act',
      'verbinder:presteerder': 'the connector slows down to align, while the achiever wants to push on',
      'teamspeler:maker': 'the team player expects consultation, while the maker would rather decide alone',
      'teamspeler:vernieuwer': 'the team player values settled ways of working, the innovator wants to change them',
      'presteerder:verbinder': 'the achiever chooses pace, the connector alignment — both essential, not always compatible',
      'presteerder:denker': 'the achiever makes the thinker impatient, the thinker frustrates the achiever with detail',
      'zekerzoeker:maker': 'the stabiliser is unsettled by the pace and unpredictability of the maker',
      'zekerzoeker:vernieuwer': 'change that makes sense to the innovator feels unpredictable to the stabiliser',
      'zekerzoeker:groeier': 'the stabiliser wants calm, the grower wants movement — that grates without agreements',
      'groeier:zekerzoeker': 'the grower wants to push on, the stabiliser wants to know where it is heading first',
      'vernieuwer:zekerzoeker': 'the innovator unintentionally undercuts the certainty the stabiliser needs',
      'vernieuwer:teamspeler': 'the innovator maps out new routes, while the team player looks for support first',
      fallback: 'their working rhythms clash without clear agreements',
    },
  },

  tensions: {
    empty: 'No direct tension pairs detected. The most common combinations are not both strongly represented in this team.',
    and: 'and',
    risk: 'Risk',
    advice: 'Leadership advice',
    pairs: {
      'presteerder:verbinder': {
        label: 'Pace and connection need direction',
        desc: 'The achiever steers on pace and outcome, the connector on relationship and alignment. Both are needed — but without direction they do not take turns, they collide.',
        risk: 'Decisions come quickly, but nobody is behind them. The achiever gets irritated by what looks to him like delay. The connector feels overruled. Frustration builds on both sides.',
        leadership: 'Say out loud, per situation, what leads: speed or connection. Not as a compromise, but as a deliberate choice. Then everyone knows what is being steered on, and why.',
      },
      'maker:zekerzoeker': {
        label: 'Freedom and certainty need boundaries',
        desc: 'The maker wants to experiment and move fast; the stabiliser needs clarity and continuity. Without clear agreements it feels cramped to one and chaotic to the other.',
        risk: 'Unease for the stabiliser, frustration for the maker. Energy that should have gone into the work disappears into an internal argument about how to work.',
        leadership: 'Build stable boundaries within which experimenting is normal. The stabiliser keeps his footing and the maker gets his room — without either having to give way.',
      },
      'denker:presteerder': {
        label: 'Depth and pace need rhythm',
        desc: 'The thinker wants to understand before he moves. The achiever wants to move before he fully understands. Both belong to good decision-making, but not at the same speed.',
        risk: 'The thinker gets shut out of decisions because he does not keep up. The achiever decides without enough substance underneath. Over time that erodes the quality of the work and the trust between them.',
        leadership: 'Reserve thinking time before decisions, not after. Be clear about when analysis leads and when action does. That gives both working styles the rhythm they need.',
      },
      'vernieuwer:zekerzoeker': {
        label: 'Renewal and continuity need timing',
        desc: 'The innovator looks for change, the stabiliser protects what works. Both perspectives protect the team — from different risks.',
        risk: 'Innovators get frustrated by what feels like a brake on change. Stabilisers get uneasy with the instability. Renewal then either stalls or is forced through — neither works.',
        leadership: 'Separate improvement from replacement. Involve the stabiliser early in change, not to slow it down, but to name the risks the innovator overlooks.',
      },
      'teamspeler:maker': {
        label: 'Loyalty and autonomy need ownership',
        desc: 'The team player works from shared responsibility, the maker from personal drive and autonomy. Both want results — by a different route.',
        risk: 'The team player sees the maker as individualistic and not much of a colleague. The maker sees the team player as slow and political. Both withdraw, each in their own way.',
        leadership: 'Define ownership explicitly, task by task. Who decides, who is consulted, who is informed? The maker gets his room without the team player feeling left out.',
      },
      'groeier:zekerzoeker': {
        label: 'Development and stability need anchoring',
        desc: 'The grower keeps looking for the next challenge, the stabiliser does best in a settled environment. Both are right — but without a link their rhythms become opposites.',
        risk: 'The grower sees the stabiliser as conservative and short on ambition. The stabiliser finds the push for change stressful and undermining. The team loses both development and stability.',
        leadership: 'Tie growth goals to stable structures. Show that development is not change for the sake of change — and that stability is not standing still.',
      },
    },
  },

  leadership: {
    empty: 'No leadership actions to generate yet — wait until more team members have taken part.',
    sources: {
      dynamics: 'From dynamics',
      collaboration: 'From collaboration',
      tension: 'From tensions',
      missing: 'From a blind spot',
      fallback: 'Reflection',
    },
    forPersona: (persona, action) => `For the ${persona}: ${action}`,
    axisAction: (dominant, recessive) =>
      `${dominant} outweighs ${recessive.toLowerCase()} in this team. Make room for ${recessive.toLowerCase()} in discussion and decision-making — not as a formality, but as an active counterweight. Otherwise this voice gradually drops out of the work.`,
    missingAction: (name) =>
      `${name} is missing or barely present. Bring this perspective into decisions on purpose — by giving someone the role explicitly, or by asking for outside advice. Otherwise a blind spot builds that only shows up once something goes wrong.`,
    actions: {
      presteerder: [
        'Make priorities concrete and visible. Achievers lose energy when they cannot see what they are working towards — a clear goal with measurable progress keeps them sharp.',
        'Acknowledge progress and outcome out loud. To an achiever, silence reads as disapproval or indifference, even when it is neither.',
        'Steer on results, not on busyness. Presence and activity mean little to an achiever — only what gets delivered counts.',
      ],
      verbinder: [
        'Ask regularly how things really are. Connectors pick up tension earlier than anyone else, but only if there is room to say so.',
        'Use the connector as your early warning. What they catch in the corridor reaches you three weeks later in a formal conversation — if it reaches you at all.',
        'Make meeting part of the work. To a connector a good conversation is not a break; it is how the work gets done.',
      ],
      maker: [
        'Give direction on the big picture and leave room in the approach. A maker needs a goal, not a script — otherwise the energy that gets things done simply fades.',
        'Reward initiative visibly. Makers take a risk by picking up what has not been agreed yet — punish or ignore that and they stop.',
        'Make experimenting safe. Makers learn by doing, and doing sometimes means failing. Without that room you lose their best work.',
      ],
      denker: [
        'Share information early and in full. A thinker forced to respond at the last minute does not deliver his best work — and knows it.',
        'Protect thinking time. In a team built on pace, reflection quickly becomes a luxury — which is exactly where the thinker adds value.',
        'Value thoroughness, even when it is slower. The thinker prevents mistakes others only spot once they have been made.',
      ],
      teamspeler: [
        'Keep roles clear and relationships steady. A team player does his best work when he knows where he stands in the whole — ambiguity costs him disproportionate energy.',
        'Communicate change early and in person. To a team player, an email about a reorganisation is not information; it is a sign of distance.',
        'Name team results alongside individual ones. The team player sees his contribution in what the team achieves — if only individual performance is celebrated, he feels invisible.',
      ],
      zekerzoeker: [
        'Keep expectations predictable. A stabiliser performs best when the rules hold — not because he cannot handle change, but because otherwise he loses his focus.',
        'Communicate change with a reason and a timeline. A stabiliser accepts change, but needs the context around it: why now, what changes, when.',
        'Value reliability visibly. Work that is always finished on time stops being noticed — while it is the base everything else is built on.',
      ],
      groeier: [
        'Talk about learning goals actively. A grower who sees no path forward gets restless — even when the work itself suits him fine.',
        'Add stretching work alongside the routine. A grower handles routine perfectly well, but without something to get his teeth into he loses his edge.',
        'Make growth visible. A grower wants to know whether he is moving forward — not out of vanity, but because development is what drives him.',
      ],
      vernieuwer: [
        'Set aside room to experiment. Innovators need small protected spaces where new ideas are allowed to fail — otherwise they stay stuck in the existing routine.',
        'Give the innovator a voice in decisions. A table filled only with delivery-minded voices produces no renewal — only optimisation of what is already there.',
        'Protect new ideas in their early stage. An unfinished idea is shot down too easily for what it is not yet. That is when the innovator drops out.',
      ],
    },
  },
};

export default teamDynamics;
