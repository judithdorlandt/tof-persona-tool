/**
 * teamDashboard — Module 1 · Team Insight (src/components/TeamDashboard.jsx).
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
    eyebrow: '01 — Team Insight',
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
      valueConsistent: 'Consistent',
      valueUnderserved: (n) => `${n} onderbediend`,
      valueOversupplied: (n) => `${n} teveel`,
      leadNone: 'De werkplekbehoefte is consistent — weinig botsing.',
      leadBoth: (under, over) =>
        `${under} werkplek${under > 1 ? 'ken' : ''} onderbediend, ${over} mogelijk te veel aanwezig.`,
      leadUnder: (n) => `${n} werkplek${n > 1 ? 'ken' : ''} waar dit team extra op leunt.`,
      leadOver: (n) => `${n} werkplek${n > 1 ? 'ken' : ''} waar dit team weinig aan heeft.`,
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
      eyebrow: 'Team Dynamics beschikbaar',
      lead: 'Zie de onderliggende patronen: waarom deze samenstelling werkt of schuurt.',
      cta: 'Naar Team Dynamics →',
    },
    locked: {
      eyebrow: 'Dieper kijken?',
      // De kop wordt opgebouwd als: before + <em>emphasis</em> + after.
      titleBefore: 'Team Dynamics laat zien',
      titleEmphasis: 'waarom',
      titleAfter: 'deze patronen ontstaan.',
      lead: 'Spanningsvelden tussen werkstijlen, leiderschapsimplicaties en de keuze tussen tempo en reflectie — in één verdiept dashboard, toegelicht in een sessie.',
      unlock: 'Dynamics ontgrendelen',
      plan: 'Plan een gesprek',
    },
  },
};

export default teamDashboard;
