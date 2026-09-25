/**
 * teamInsightText — Module 1 · Team Insight, de gegenereerde zinnen.
 *
 * Hoort bij de pure logica in `src/utils/TeamInsights.js`. Die functie
 * (`buildTeamInsights`) draait zowel in het TeamDashboard-scherm als in de
 * team-insight PDF, dus alles hier moet in beide contexten leesbaar zijn.
 *
 * Sleutels die logica zijn en dus NOOIT vertaald worden:
 *   - persona-ids: maker, groeier, presteerder, denker, verbinder,
 *     teamspeler, zekerzoeker, vernieuwer
 *   - werkplek-ids: focus, work, hybride, meeting, project, team,
 *     learning, retreat, social
 *   - spanningsveld-ids: de `persona:persona`-sleutels onder `tensionPairs`
 *   - de `source`-waarden van quick wins (werkstijlen, werkplek, spanning,
 *     minderheid, ontbrekend, reflectie) — die worden downstream als
 *     opzoeksleutel gebruikt, niet getoond
 *
 * Persona-namen staan hier nooit als losse tekst waar ze per persona
 * verschillen: die komen uit copy/<taal>/archetypes.js via
 * `getArchetypes(lang)` en worden als argument doorgegeven.
 *
 * PDF-LET OP: de gebundelde font-subsets missen de tekens >= (U+2265) en
 * <= (U+2264). Schrijf drempels uit ("10 of meer"). Wel veilig: · – — é.
 */

/** Losse delen natuurlijk aan elkaar plakken: "A, B en C". */
function joinNatural(parts = []) {
  const list = parts.filter(Boolean);
  if (list.length === 0) return '';
  if (list.length === 1) return list[0];
  if (list.length === 2) return `${list[0]} en ${list[1]}`;
  return `${list.slice(0, -1).join(', ')} en ${list[list.length - 1]}`;
}

const teamInsightText = {
  // ── Werkplek-labels ────────────────────────────────────────────────
  // De negen werkplektypen, per taalvaste sleutel. Deze labels komen in de
  // gegenereerde zinnen terecht (vaak via .toLowerCase()) én op de
  // underserved/oversupplied-objecten die het dashboard en de PDF tonen.
  // De NL-waarden zijn identiek aan WORKPLACE_LABELS in TeamAggregation.js.
  workplaceLabels: {
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

  // Namen of labels tot één opsomming maken.
  joinNatural,

  // Meervoud van een persona-naam in kleine letters ("makers").
  personaPlural: (name) => `${String(name).toLowerCase()}s`,

  // ── Headline — één zin over wat dit team van de werkplek vraagt ─────
  headline: {
    empty: 'Nog geen werkplekbehoefte zichtbaar — wacht tot meer teamleden hebben ingevuld.',
    two: (first, second) => `Dit team vraagt vooral om ${first} en ${second}.`,
    one: (first) => `Dit team vraagt vooral om ${first}.`,
    // Geen categorie boven de drempel: de behoeften liggen dicht bij elkaar.
    mixedBase: 'Dit team heeft een gemengde werkplekbehoefte — geen enkele categorie springt er duidelijk uit.',
    mixedBalance: (under, over) =>
      `De winst zit in de balans: relatief veel vraag naar ${under}, weinig naar ${over}.`,
    mixedUnderOnly: (under) => `De grootste relatieve vraag ligt bij ${under}.`,
  },

  // ── Persona-spanning — wat er misgaat als de werkplek niet aansluit ──
  // Getoond per persona in de impact-samenvatting (dominant/midden/minderheid).
  personaTension: {
    maker: (name) => `${name} komt niet in flow zonder aaneengesloten ruimte om te bouwen.`,
    groeier: (name) => `${name} krijgt geen tijd om het werk te verteren en zich te ontwikkelen.`,
    presteerder: (name) => `${name} verliest grip op voortgang zonder zichtbaar werkritme.`,
    denker: (name) => `${name} vindt geen rust voor de analyse die zorgvuldigheid vraagt.`,
    verbinder: (name) => `${name} mist het vroege signaal als samenwerking schuurt.`,
    teamspeler: (name) => `${name} verliest het gezamenlijke ritme dat het team draagt.`,
    zekerzoeker: (name) => `${name} mist het houvast dat structuur en voorspelbaarheid biedt.`,
    vernieuwer: (name) => `${name} vindt geen sparringpartner om ideeën te scherpen.`,
    fallback: (name) => `${name} verliest grip als de werkplek niet aansluit.`,
  },

  // ── Onderbediend — bovengemiddelde vraag die het kantoor niet levert ──
  underserved: {
    focus: 'Het team verliest concentratie in een open omgeving.',
    work: 'Er is geen vaste basis om rustig dagelijks werk te doen.',
    hybride: 'Online en fysiek werken loopt vast op slechte schakelmomenten.',
    meeting: 'Afstemming krijgt geen gestructureerde plek.',
    project: 'Werk in lagen kan niet visueel gemaakt worden.',
    team: 'Het werkbare contact valt weg in een te formele omgeving.',
    learning: 'Reflectie en leren krijgen geen ruimte om te ademen.',
    retreat: 'Er is geen plek om op te laden zonder afleiding.',
    social: 'Informele ontmoeting voedt het werk niet meer.',
    fallback: (label) => `Het team mist iets in ${label}.`,
  },

  // ── Overdosis — plekken waar dit team nauwelijks vraag naar heeft ────
  oversupplied: {
    focus: 'Veel concentratieplekken die niemand echt nodig heeft worden een leeg eiland.',
    work: 'Een zee aan standaard werkplekken werkt niet — dit team doet ander soort werk.',
    hybride: 'Veel hybride faciliteiten die weinig gebruikt worden kosten meer dan ze opleveren.',
    meeting: 'Te veel overlegruimtes verleiden tot overleggen in plaats van werken.',
    project: 'Veel creatieve zones die leeg staan voelen als een verwijt.',
    team: 'Grote samenwerkplekken zonder vraag worden luidruchtige doorlooproutes.',
    learning: 'Ongebruikte leerplekken geven het signaal dat ontwikkeling "ergens anders" gebeurt.',
    retreat: 'Rustplekken die niemand zoekt worden rare lege hoeken.',
    social: 'Te veel ontmoetingsplekken versplinteren in plaats van verbinden.',
    fallback: (label) => `Veel ${label} zonder vraag kost energie zonder op te leveren.`,
  },

  // ── Quick wins — concrete acties, per bron ──────────────────────────
  quickWins: {
    // source: 'werkstijlen' — wat de meest voorkomende primaire persona vraagt.
    persona: {
      maker: (name) => `Plan blokken zonder vergaderingen. ${name}s maken iets af in stilte, niet in onderbrekingen.`,
      groeier: (name) => `Geef ${name.toLowerCase()}s ruimte om het werk te verteren. Daar groeien ze, niet onder druk.`,
      presteerder: (name) => `Maak voortgang zichtbaar. ${name}s bloeien op duidelijke doelen en mijlpalen.`,
      denker: (name) => `Stuur stukken op tijd rond. ${name}s willen voorbereid aan tafel komen.`,
      verbinder: (name) => `Maak ruimte voor informeel contact. ${name}s houden de samenwerking levend.`,
      teamspeler: (name) => `Geef het team gezamenlijke rituelen. ${name}s gedijen op verbondenheid.`,
      zekerzoeker: (name) => `Communiceer veranderingen vroeg en consistent. ${name}s leveren in voorspelbaarheid.`,
      vernieuwer: (name) => `Reserveer ruimte voor experiment. ${name}s verliezen energie als alles routine is.`,
    },

    // source: 'werkplek' — wat de sterkste werkplekbehoefte vraagt.
    workplace: {
      focus: 'Maak een afgeschermde concentratiezone. Geen telefoongesprekken, geen meetings.',
      work: 'Investeer in rustige standaardplekken. Kwaliteit boven variatie.',
      hybride: 'Bouw één goede schakelruimte. Vaste camera, goede akoestiek, plug-and-play.',
      meeting: 'Splits overlegruimtes. Klein voor afstemming, groot voor verdieping.',
      project: 'Reserveer wand- en tafelruimte voor lopend werk. Dit team werkt visueel.',
      team: 'Maak een echte samenwerkplek. Geen vergaderzaal, maar een werkbare ontmoetingsplek.',
      learning: 'Zet een leerplek in waar nadenken mag duren. Niet elke plek hoeft productief te voelen.',
      retreat: 'Creëer een echte rustplek. Geen laptop-hoek, een echte adempauze.',
      social: 'Versterk de informele ontmoetingsplek. Niet als doorloopzone, maar als werkbare plek.',
    },

    // source: 'spanning' — bewust op werkstijl, niet op persoonsnaam.
    tensionUnderserved: (label, who) =>
      `Bescherm ${label}. De vraag ligt hier bovengemiddeld terwijl het kantoor het vaak niet biedt — juist ${who} lopen dan vast.`,
    tensionWhoFallback: 'teamleden',
    tensionOversupplied: (label) =>
      `Zet ${label} anders in. Dit team gebruikt ze nauwelijks, dus het kost ruimte zonder waarde.`,

    // source: 'minderheid' — `count` bepaalt enkelvoud of meervoud.
    minority: (workplaces, personas, count) =>
      `Voorzie de werkomgeving ook van ${workplaces}. Zo voorkom je dat de ${personas} zich geïsoleerd ${count === 1 ? 'voelt' : 'voelen'}.`,

    // source: 'ontbrekend' — persona die helemaal niet in het team zit.
    missing: {
      maker: (name) => `Werf een ${name}. Ideeën blijven nu hangen in concepten.`,
      groeier: (name) => `Werf een ${name}. Het team mist nieuwsgierigheid om te leren.`,
      presteerder: (name) => `Werf een ${name}. Het team mist scherpte om af te krijgen.`,
      denker: (name) => `Werf een ${name}. Besluiten komen nu te snel zonder grondige toetsing.`,
      verbinder: (name) => `Werf een ${name}. Het vroege signaal als samenwerking schuurt ontbreekt.`,
      teamspeler: (name) => `Werf een ${name}. Niemand bewaakt expliciet de groepsdynamiek.`,
      zekerzoeker: (name) => `Werf een ${name}. Het tegenwicht voor stabiliteit ontbreekt.`,
      vernieuwer: (name) => `Werf een ${name}. De impuls om aanpakken los te laten ontbreekt.`,
    },

    // source: 'reflectie' — terugval als er geen persona ontbreekt.
    reflection: 'Vul de werkplekken aan die dit team mist. Geen verbouwing nodig — klein en zichtbaar werkt.',
  },

  // ── Highlights — samenvattende zinnen bovenaan het dashboard ────────
  highlights: {
    top: (name) =>
      `${name} is de meest aanwezige werkstijl in dit team en zet waarschijnlijk de toon in tempo, voorkeuren en samenwerking.`,
    combination: (first, second) =>
      `De combinatie van ${first} en ${second} laat zien waar kracht én spanning kunnen ontstaan in afstemming, besluitvorming en ritme.`,
    needs: (first, second) =>
      `De sterkste werkplekbehoefte ligt bij ${first} en ${second}. Dat vraagt om bewuste keuzes in focus, overleg en samenwerking.`,
  },

  // ── Energie — bewaard voor Module 2 ─────────────────────────────────
  energy: {
    present: (name, percentage) => `${name} is aanwezig in het team (${percentage}%).`,
    body: {
      maker: 'Dit team maakt graag.',
      groeier: 'Dit team wil leren.',
      presteerder: 'Dit team levert.',
      denker: 'Dit team denkt grondig.',
      verbinder: 'Dit team zorgt voor relatie.',
      teamspeler: 'Dit team houdt elkaar vast.',
      zekerzoeker: 'Dit team bouwt op continuïteit.',
      vernieuwer: 'Dit team zoekt het nieuwe.',
      fallback: (name) => `${name} zet de toon.`,
    },
  },

  // ── Spanningsparen — bewaard voor Module 2 ──────────────────────────
  // Sleutel = `${personaA}:${personaB}`; de namen komen uit archetypes.
  tensionPairs: {
    'maker:denker': {
      label: 'Tempo vs. reflectie',
      description: (a, b) =>
        `${a}s willen vooruit, ${b.toLowerCase()}s willen eerst begrijpen. Beide nodig — zonder afstemming loopt het team vast of rent het de verkeerde kant op.`,
    },
    'presteerder:verbinder': {
      label: 'Resultaat vs. relatie',
      description: (a, b) =>
        `${a}s sturen op wat af moet, ${b.toLowerCase()}s op hoe het samen loopt. Zonder balans wordt het óf koud efficiënt óf warm traag.`,
    },
    'vernieuwer:zekerzoeker': {
      label: 'Vernieuwing vs. continuïteit',
      description: (a, b) => `${a}s zoeken het nieuwe, ${b.toLowerCase()}s beschermen wat werkt.`,
    },
    'groeier:teamspeler': {
      label: 'Ontwikkeling vs. stabiliteit',
      description: (a, b) => `${a}s willen leren en stretchen, ${b.toLowerCase()}s houden de groep draaiend.`,
    },
  },

  // Regel onder een spanningspaar met de feitelijke verhouding.
  tensionDetail: (nameA, percentageA, nameB, percentageB) =>
    `In dit team: ${nameA} ${percentageA}% vs. ${nameB} ${percentageB}%.`,

  // ── Gebruik — bewaard voor Module 2 ─────────────────────────────────
  usage: {
    meeting: {
      situation: 'Voor een teamoverleg',
      title: 'Wat leg je op tafel?',
      item: (name, percentage) => `Het team wordt gedomineerd door ${name} (${percentage}%).`,
    },
    workplace: {
      situation: 'Voor een werkplekbeslissing',
      title: 'Wat vraagt dit team van de ruimte?',
      item: (label) => `${label} is de sterkste behoefte.`,
    },
  },
};

export default teamInsightText;
