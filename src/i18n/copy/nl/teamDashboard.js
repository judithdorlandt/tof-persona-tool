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

  reliability: {
    low: 'Indicatief',
    mid: 'Groeiend',
    high: 'Sterk beeld',
  },

  // Wat er in plaats van het dashboard staat als het team nog te klein is
  // (drempel in utils/access.js, blok in components/TeamGate.jsx).
  gate: {
    title: 'Nog geen teambeeld',
    body: 'Het teambeeld verschijnt vanaf vijf ingevulde profielen. Daaronder is te makkelijk te herleiden wie wat heeft geantwoord, ook als er geen namen bij staan.',
    count: (n) => `${n} van de vijf ingevuld`,
    hint: 'Deel de teamcode met je collega’s. Zodra het vijfde profiel binnen is, staat het beeld er.',
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
