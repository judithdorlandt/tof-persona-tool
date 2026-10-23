/**
 * teamDashboard — Module 1 · Teaminzicht (src/components/TeamDashboard.jsx).
 *
 * De vier tegels staan in `tiles`. De sleutels daarvan (`personas`,
 * `workplace`, `tension`, `quickwins`) zijn logica-ids uit TeamDashboard.jsx —
 * nooit vertalen, alleen de waarden.
 *
 * Deze namespace wordt ook gebruikt door het organisatie-overzicht in
 * Admin.jsx, dat dezelfde tegels hergebruikt.
 */
const teamDashboard = {
  hero: {
    eyebrow: '01 — Teaminzicht',
    title: 'Teaminzicht voor',
    lead: 'Wat werkstijlen zijn, wat het team van de werkplek vraagt en waar de eerste kansen liggen.',
    downloadPdf: 'Download als PDF',
    otherTeam: 'Ander team',
  },

  // Als er geen teamnaam bekend is.
  fallbackTeamName: 'jouw team',

  chips: {
    responses: 'Responses',
    organisation: 'Organisatie',
    dominant: 'Dominant',
    reliability: 'Betrouwbaarheid',
  },


  // Wat er in plaats van het dashboard staat als het team nog te klein is
  // (drempel in utils/access.js, blok in components/TeamGate.jsx).
  // Ook Teamdynamiek toont dit blok; de teksten staan alleen hier.
  // Opdracht C4 (akkoord Judith 23 okt 2026). De oude hint "Deel de teamcode
  // met je collega's" is weg (C6): de kopieerknop vervangt hem.
  gate: {
    title: 'Nog geen teambeeld',
    titleFor: 'Nog geen teambeeld voor',
    body: 'Het teambeeld verschijnt vanaf vijf ingevulde profielen. Daaronder is te makkelijk te herleiden wie wat heeft geantwoord, ook als er geen namen bij staan.',
    count: (n) => `${n} van de vijf ingebracht`,
    copyMessage: 'Kopieer het bericht voor je team',
    copied: 'Gekopieerd',
    // Het bericht dat de knop kopieert. Neutrale stem: ook een teamlid kan
    // het doorsturen. De laatste zin hangt af van de namenschakelaar.
    message: ({ team, code, showNames }) => [
      `Doe je mee met het teambeeld van ${team}? Zo werkt het:`,
      `1. Open deze link op je telefoon en download de app TOF Persona: https://team.persona-tool.nl/quiz?code=${encodeURIComponent(code)}`,
      '2. Doe de test in de app: negen vragen, ongeveer vijf minuten.',
      `3. Tik onderaan je profiel op 'Profiel inbrengen'. Vul op de website deze teamcode in, tik op 'Code controleren' en daarna op 'Inbrengen': ${code}`,
      "Pas na 'Inbrengen' telt je profiel mee. Bewaar dit bericht tot dan: de teamcode heb je pas na de test nodig.",
      "Zodra vijf collega's hun profiel hebben ingebracht, staat het teambeeld klaar. Je opent het op team.persona-tool.nl/team, met dezelfde teamcode.",
      showNames
        ? 'Je team heeft afgesproken voornamen te tonen in Teaminzicht. Iedereen in het team ziet dezelfde namen, ook de leidinggevende. Wie het naamveld leeg laat, staat er zonder naam in.'
        : 'Niemand ziet wie welke werkstijl heeft, ook een leidinggevende niet.',
    ].join('\n'),
  },

  close: 'Sluiten ✕',

  // Als een waarde ontbreekt.
  empty: '—',

  tiles: {
    personas: {
      eyebrow: 'Werkstijlen',
      hint: 'Wie zit er in dit team',
      detailTitle: 'Wie zit er in dit team',
    },
    workplace: {
      eyebrow: 'Werkplek',
      hint: 'Wat vraagt dit team',
      detailTitle: 'Wat vraagt dit team van de werkplek',
    },
    tension: {
      eyebrow: 'Spanning',
      hint: 'Waar het kan botsen',
      detailTitle: 'Waar behoefte en aanbod kunnen botsen',
      // `kern` = aantal kernplekken, `beperkt` = aantal plekken in "beperkt nodig".
      value: (kern, beperkt) => {
        const k = kern > 0 ? `${kern} kern` : 'geen kern';
        return beperkt > 0 ? `${k} · ${beperkt} beperkt` : k;
      },
      lead: (kern, beperkt) => {
        const k = kern > 0
          ? `${kern} kernplek${kern > 1 ? 'ken' : ''} die dit team echt nodig heeft`
          : 'Geen uitgesproken kernplek';
        if (beperkt === 0) return `${k}.`;
        return `${k}, ${beperkt} plek${beperkt > 1 ? 'ken' : ''} die beperkt nodig ${beperkt > 1 ? 'zijn' : 'is'}.`;
      },
    },
    quickwins: {
      eyebrow: 'Quick wins',
      hint: 'Voor morgen',
      detailTitle: 'Acties voor morgen',
      detailLead: 'Concrete acties afgeleid uit alle inzichten van dit dashboard.',
      value: (n) => `${n} ${n === 1 ? 'actie' : 'acties'}`,
    },
  },

  bridge: {
    available: {
      eyebrow: 'Teamdynamiek beschikbaar',
      lead: 'Zie de onderliggende patronen: waarom deze samenstelling werkt of schuurt.',
      cta: 'Naar Teamdynamiek →',
    },
    locked: {
      eyebrow: 'Dieper kijken?',
      // De kop wordt opgebouwd als: before + <em>emphasis</em> + after.
      titleBefore: 'Teamdynamiek laat zien',
      titleEmphasis: 'waarom',
      titleAfter: 'deze patronen ontstaan.',
      lead: 'Spanningsvelden tussen werkstijlen, leiderschapsimplicaties en de keuze tussen tempo en reflectie — in één verdiept dashboard voor wie het team leidt.',
      plan: 'Plan een gesprek',
    },
  },
};

export default teamDashboard;
