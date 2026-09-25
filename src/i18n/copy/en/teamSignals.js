/**
 * teamSignals (en-GB) — English counterpart of copy/nl/teamSignals.js.
 * Same key structure; only the strings differ.
 *
 * Belongs to the derived team "signals" in `src/insights.js`: reliability of
 * the picture, balance of working styles, the three tension axes, the tone
 * fragments and the closing signature line.
 *
 * Keys are logic and are never translated (confidence levels, maturity
 * levels, axis ids, the tone keys and the signature ids).
 *
 * NOTE — PDF fonts: the bundled typefaces have no glyph for the
 * greater-or-equal and less-or-equal symbols. Always write thresholds out
 * ("10 or more"); never use those symbols here.
 */

const teamSignals = {
  // Reliability badge plus explanation; `n` = number of completed profiles.
  confidence: {
    low: {
      label: 'First signals',
      text: (n) =>
        `Based on ${n} profile${n === 1 ? '' : 's'} these are first signals. The patterns may point in a direction, but they need further validation.`,
    },
    emerging: {
      label: 'Emerging pattern',
      text: (n) =>
        `${n} profiles give an emerging pattern. The insights are probably representative, but they gain strength as more colleagues take the test.`,
    },
    reliable: {
      label: 'Reliable pattern',
      text: (n) =>
        `With ${n} profiles this is a reliable picture. The patterns recur consistently and give a solid basis for concrete decisions.`,
    },
    strong: {
      label: 'Strong pattern',
      text: (n) =>
        `${n} profiles deliver a strong, consistent picture. This pattern is clearly visible and gives a reliable basis for strategic choices.`,
    },
  },

  // Maturity of the working-style mix. `stmt` is the headline sentence,
  // `explain` the explanation underneath.
  maturity: {
    imbalance: {
      label: 'Imbalance',
      stmt: 'This team leans heavily on a small number of working styles. That creates cohesion — but also blind spots that grow as the context changes.',
      explain: 'One or two personas dominate strongly. Several others are barely represented. This works in stable contexts, but it is fragile once things change.',
    },
    functional: {
      label: 'Functional',
      stmt: 'This team functions, but leans on a limited number of working styles. The missing perspectives are not critical — they become so once the pressure rises.',
      explain: 'Some dominance is visible but there is no extreme imbalance. The team performs well in familiar situations; new challenges reveal the limits.',
    },
    complementary: {
      label: 'Complementary',
      stmt: 'This team has the potential of a complementary team — provided the differences are designed deliberately and not left to chance.',
      explain: 'The working styles are spread fairly evenly. That brings breadth and resilience, but it asks for deliberate coordination. Diversity only works when it is understood.',
    },
  },

  // The three tension axes. Per axis the logic picks one of the three
  // `desc` variants (left side heavier / right side heavier / balanced)
  // and the matching `tension` line.
  axes: {
    creationStructure: {
      label: 'Creation vs Structure',
      left: 'Creation',
      right: 'Structure',
      descLeft: 'The team generates plenty of ideas but lacks anchor points. Without structure, creativity never lands.',
      descRight: 'The team is strong on delivery and frameworks, but can miss new perspectives.',
      descBalanced: 'Creation and structure keep each other in balance — a healthy tension when it is used deliberately.',
      tensionLeft: 'Risk: ideas start but never land.',
      tensionRight: 'Risk: existing frameworks are rarely challenged.',
      tensionBalanced: 'Watch out: balance asks for an active link between both poles.',
    },
    connectionIndividual: {
      label: 'Connection vs Individuality',
      left: 'Connection',
      right: 'Individual',
      descLeft: 'The team invests heavily in relationships. Individual performance can get overlooked as a result.',
      descRight: 'The team likes to work autonomously. Collaboration is functional but rarely warm — what is going on underneath stays unspoken.',
      descBalanced: 'Connection and individuality are in balance. That asks for workspaces that facilitate both.',
      tensionLeft: 'Risk: conflict is avoided instead of discussed.',
      tensionRight: 'Risk: nobody flags what is really going on.',
      tensionBalanced: 'Keep following the balance between group and individual deliberately.',
    },
    executionReflection: {
      label: 'Execution vs Reflection',
      left: 'Execution',
      right: 'Reflection',
      descLeft: 'The team is strong on action and results. The quality check afterwards is sometimes thinner than you would want.',
      descRight: 'The team thinks things through thoroughly. Turning insight into action takes more time than it needs to.',
      descBalanced: 'Action and reflection alternate — a mature pattern, as long as it is deliberate.',
      tensionLeft: 'Risk: speed comes at the cost of quality and support.',
      tensionRight: 'Risk: the team keeps analysing while the opportunity passes.',
      tensionBalanced: 'Make sure reflection leads to a decision — not to delay.',
    },
  },

  // Loose fragments inserted mid-sentence. Hence lower case and no full
  // stop. Which set is used depends on how certain the picture is.
  tone: {
    low: {
      schuurt: 'may point to',
      zien: 'first signals suggest',
      ontbreekt: 'could mean',
      vraagt: 'could call for',
    },
    emerging: {
      schuurt: 'probably',
      zien: 'the pattern points to',
      ontbreekt: 'appears to mean',
      vraagt: 'probably calls for',
    },
    imbalance: {
      schuurt: 'is clearly visible',
      zien: 'recurs consistently',
      ontbreekt: 'concretely means',
      vraagt: 'unmistakably calls for',
    },
    confident: {
      schuurt: 'is visible',
      zien: 'gives a reliable picture of',
      ontbreekt: 'means',
      vraagt: 'calls for',
    },
  },

  // One closing line under the team dashboard. The logic picks the first
  // line that applies; `fallback` when no pattern fits.
  signature: {
    achieverWithoutConnector: 'Where pace dominates and connection is missing, results grow — but support disappears.',
    makerAndStabiliser: 'Creativity and certainty pull the same team in opposite directions. Without direction the strongest wins — not the best.',
    innovatorAndStabiliser: 'A team that wants to renew and hold on at the same time gets in its own way.',
    missingConnectorWithAchiever: 'A team that only counts results eventually loses the people who produce them.',
    missingInnovator: 'An organisation without innovators sees the future only when it is too late to move.',
    complementary: 'Diversity is not a promise — it is a design question. This team has the ingredients. Now the direction.',
    imbalance: 'Homogeneity feels like strength — until the context changes and everyone has the same blind spot.',
    ideasWithoutStructure: 'A team full of ideas without structure is a team that wastes its own energy.',
    structureWithoutCreation: 'Where structure rules and creativity is missing, the future is repeated instead of made.',
    fallback: 'The strongest team is not the most homogeneous — but the team that understands and uses its differences.',
  },
};

export default teamSignals;
