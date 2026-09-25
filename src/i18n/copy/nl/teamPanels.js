/**
 * teamPanels — teksten van alle panelen in src/team/components/.
 *
 * Eén namespace per paneel. Persona-ids (maker, groeier, …) en
 * werkplek-ids (focus, work, …) zijn databasesleutels: die blijven staan,
 * alleen de waarden zijn taalafhankelijk.
 */

/** Namen natuurlijk aan elkaar plakken: "A, B en C". */
function joinNames(parts = []) {
  const list = parts.filter(Boolean);
  if (list.length === 0) return '';
  if (list.length === 1) return list[0];
  if (list.length === 2) return `${list[0]} en ${list[1]}`;
  return `${list.slice(0, -1).join(', ')} en ${list[list.length - 1]}`;
}

const teamPanels = {
  names: {
    join: joinNames,
    anonymous: (n) => `${n} anoniem`,
  },

  header: {
    defaultEyebrow: '01 — Teaminzicht',
    defaultTitleLead: 'Teaminzicht voor',
    teamFallback: 'jouw team',
    leadRose:
      'Waar samenwerking schuurt, waarom tempo en reflectie botsen, en wat dat vraagt van leiderschap.',
    leadSage:
      'Wat werkstijlen zijn, wat het team van de werkomgeving vraagt en waar de eerste kansen liggen.',
    chips: {
      responses: 'Responses',
      organization: 'Organisatie',
      dominant: 'Dominant',
      reliability: 'Betrouwbaarheid',
    },
    reliability: {
      indicative: 'Indicatief',
      growing: 'Groeiend',
      strong: 'Sterk beeld',
    },
    actions: {
      otherTeam: 'Ander team',
      backHome: 'Terug naar home',
    },
  },

  stats: {
    empty: '—',
    responses: {
      label: 'Aantal responses',
      subtext: 'Ingevulde profielen in dit dashboard',
    },
    dominant: {
      label: 'Dominante werkstijl',
      subtext: 'Meest aanwezige primaire werkstijl',
    },
    topNeed: {
      label: 'Top werkplekbehoefte',
      subtext: 'Sterkste ruimtelijke behoefte op teamniveau',
    },
  },

  personaDistribution: {
    empty: 'Nog geen werkstijlen beschikbaar.',
    dominantEyebrow: 'Dominante werkstijl',
    shareOfTeam: (pct) => `${pct}% van het team`,
    carriedBy: 'Gedragen door ',
    furtherRepresented: 'Verder vertegenwoordigd',
    energy: {
      eyebrow: 'Energie van dit team',
      lead:
        'Gewogen werkstijl-energie van alle profielen samen. Ook werkstijlen die niet primair zijn dragen bij via tweede en derde voorkeuren.',
    },
    missing: {
      eyebrow: 'Wie ontbreekt',
      fallback: (name) =>
        `Zonder ${String(name || '').toLowerCase()} mist het team een specifiek perspectief.`,
      contribution: {
        maker: 'Zonder maker mist het team de drang om dingen tastbaar te maken — ideeën blijven hangen in concepten.',
        groeier: 'Zonder groeier mist het team de natuurlijke nieuwsgierigheid om te leren en zich te ontwikkelen.',
        presteerder: 'Zonder presteerder mist het team de scherpte om dingen daadwerkelijk af te krijgen.',
        denker: 'Zonder denker mist het team de grondigheid om besluiten op inhoud te toetsen.',
        verbinder: 'Zonder verbinder mist het team het vroege signaal als de samenwerking begint te schuren.',
        teamspeler: 'Zonder teamspeler mist het team de lijm — niemand bewaakt expliciet de groepsdynamiek.',
        zekerzoeker: 'Zonder zekerzoeker mist het team het tegenwicht dat continuïteit en stabiliteit bewaakt.',
        vernieuwer: 'Zonder vernieuwer mist het team de impuls om bestaande aanpakken te durven loslaten.',
      },
    },
  },

  workplaceNeeds: {
    empty: 'Nog geen werkplekbehoefte beschikbaar.',
    labels: {
      focus: 'Concentratieplekken',
      work: 'Standaard werkplekken',
      hybride: 'Hybride plekken',
      meeting: 'Overlegplekken',
      project: 'Creatieve plekken',
      team: 'Samenwerkplekken',
      learning: 'Leerplekken',
      retreat: 'Rustplekken',
      social: 'Informele plekken',
    },
    meaning: {
      focus: 'Voor diep, geconcentreerd werk zonder onderbreking.',
      work: 'De vaste basis voor dagelijks werk en focus tussen activiteiten door.',
      hybride: 'Voor werk waar online en fysiek elkaar moeten ontmoeten.',
      meeting: 'Voor afstemming, beslissing en gestructureerde gesprekken.',
      project: 'Voor creatief, visueel en projectmatig werk dat groeit door feedback en samenwerking.',
      team: 'Voor actieve samenwerking en gedeeld eigenaarschap.',
      learning: 'Voor leren, reflectie en ontwikkeling in eigen tempo.',
      retreat: 'Voor herstel, rust en mentale ademruimte.',
      social: 'Voor informeel contact dat samenwerking voedt.',
    },
    strongestEyebrow: 'Sterkste behoefte',
    shareOfDemand: (pct) => `${pct}% van de teamvraag`,
    furtherAboveAverage: 'Verder bovengemiddeld',
    below: {
      eyebrow: 'Hier is minder vraag naar',
      note: 'Als jullie kantoor hier vol mee staat, kost dat energie zonder op te leveren.',
    },
  },

  workplaceTension: {
    empty: 'Nog geen werkplekbehoefte zichtbaar — wacht tot meer teamleden hebben ingevuld.',
    headerQuestion: 'Hoe ziet jullie huidige kantoor eruit?',
    coreEyebrow: 'De kern',
    shareOne: (pct) => `${pct}% van het team`,
    shareTwo: (a, b) => `${a}% + ${b}% van het team`,
    shareMany: (total) => `${total}% van het team`,
    impactResult: (isOne) => ({
      before: isOne ? 'Komt ' : 'Komen ',
      highlight: 'niet tot resultaat',
      after: isOne
        ? ' als de werkplekken die hij of zij nodig heeft er onvoldoende zijn.'
        : ' als de werkplekken die ze nodig hebben er onvoldoende zijn.',
    }),
    impactEnergy: (isOne) => ({
      before: isOne ? 'Verliest ' : 'Verliezen ',
      highlight: 'energie',
      after: isOne
        ? ' om te komen werken als het kantoor vol staat met wat hij of zij niet gebruikt.'
        : ' om te komen werken als het kantoor vol staat met wat ze niet gebruiken.',
    }),
    carriedBy: 'Gedragen door ',
    restOfTeam: 'Verder in het team',
    isolationRisk: 'Risico op isolatie',
    office: {
      eyebrow: 'Check in je kantoor',
      enough: 'Voorzien jullie genoeg in:',
      notFull: 'En staat het niet vol met:',
    },
  },

  energyFriction: {
    section: {
      eyebrow: 'Energie & wrijving',
      title: 'Waar zit de energie en waar ontstaat wrijving?',
      lead:
        'Niet alleen wie er in het team zit, maar ook waar kracht ontstaat en waar de ritmes botsen. Dit is de essentie van wat dit team onderscheidt.',
    },
    energy: {
      title: 'Waar zit de energie',
      description: 'De dominante stijlen zetten de toon. Hier komt de kracht van het team vandaan.',
      empty: 'Nog geen duidelijke energielijn zichtbaar.',
      label: (persona, percentage) => `${persona} · ${percentage}%`,
    },
    friction: {
      title: 'Waar ontstaat wrijving',
      description:
        'Waar stijlen elkaar raken — of waar één stijl zo sterk is dat andere minder gehoord worden.',
      empty:
        'Geen directe wrijving gedetecteerd. Dat betekent niet dat er geen spanning is — de tegenpolen zijn niet tegelijk sterk aanwezig.',
    },
  },

  quickWins: {
    empty: 'Nog geen quick wins beschikbaar.',
    countLabel: (n) => (n === 1 ? 'Eén actie voor morgen' : `${n} acties voor morgen`),
    note: 'Synthese uit alle inzichten van dit dashboard.',
    sources: {
      werkstijlen: 'Uit werkstijlen',
      werkplek: 'Uit werkplek',
      spanning: 'Uit spanning',
      minderheid: 'Uit minderheid',
      ontbrekend: 'Uit ontbrekend',
      reflectie: 'Reflectie',
    },
  },

  usage: {
    eyebrow: 'Zo gebruik je dit',
    title: 'Klaar voor een teamoverleg, werkplekbeslissing of leiderschapsgesprek',
    lead:
      'Niet de data zelf maakt dit dashboard waardevol — maar het gesprek dat eruit volgt. Drie concrete manieren om dit morgen al in te zetten.',
  },
};

export default teamPanels;
