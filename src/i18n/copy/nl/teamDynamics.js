/**
 * teamDynamics — Module 2 · Team Dynamics.
 *
 * Hoort bij `src/components/TeamDynamics.jsx` en de pure logica in
 * `src/components/teamDynamicsLogic.js`.
 *
 * Sleutels die logica zijn en dus NOOIT vertaald worden:
 *   - tegel-ids: `dynamics`, `collaboration`, `tensions`, `leadership`
 *   - persona-ids: maker, groeier, presteerder, denker, verbinder,
 *     teamspeler, zekerzoeker, vernieuwer
 *   - spanningsveld-ids: de `persona:persona`-sleutels onder `tensions.pairs`,
 *     `collaboration.synergy` en `collaboration.attention`
 *
 * Persona-namen staan hier nooit als losse tekst: die komen altijd uit
 * copy/<taal>/archetypes.js via `getArchetypes(lang)`.
 */

/** Losse delen natuurlijk aan elkaar plakken: "A, B en C". */
function joinParts(parts = []) {
  const list = parts.filter(Boolean);
  if (list.length === 0) return '';
  if (list.length === 1) return list[0];
  if (list.length === 2) return `${list[0]} en ${list[1]}`;
  return `${list.slice(0, -1).join(', ')} en ${list[list.length - 1]}`;
}

const teamDynamics = {
  hero: {
    eyebrow: '02 — Team Dynamics',
    title: 'Team Dynamics voor',
    lead: 'Waar samenwerking schuurt, waarom tempo en reflectie botsen, en wat dat vraagt van leiderschap.',
    downloadPdf: 'Download als PDF',
    backToInsight: '← Naar Team Insight',
    otherTeam: 'Ander team',
  },

  noAccess: {
    title: 'Geen toegang tot',
    titleAccent: 'Team Dynamics',
    lead: 'Voer je toegangscode voor Team Dynamics in via de teamomgeving. Deze code geeft ook toegang tot Team Insight.',
    cta: 'Naar teamomgeving',
  },

  noData: {
    title: 'Geen teamdata voor',
    lead: 'Laad eerst een team via Team Insight.',
    cta: '← Naar Team Insight',
    embedded: 'Geen responses om Dynamics op te baseren.',
  },

  // Als er geen teamnaam bekend is.
  fallbackTeamName: 'jouw team',

  close: 'Sluiten ✕',

  chips: {
    responses: 'Responses',
    organisation: 'Organisatie',
    dominant: 'Dominant',
    tensions: 'Spanningen',
    reliability: 'Betrouwbaarheid',
  },

  reliability: {
    first: 'Eerste signalen',
    emerging: 'Opkomend patroon',
    reliable: 'Betrouwbaar beeld',
    strong: 'Sterk patroon',
  },

  // Namen van teamleden samenvoegen, inclusief anonieme respondenten.
  names: {
    join: joinParts,
    anonymousOne: 'anoniem',
    anonymousMany: (n) => `${n} anoniem`,
    anonymousAlone: 'Anoniem',
  },

  tiles: {
    dynamics: {
      eyebrow: 'Dynamiek',
      value: 'Drie assen',
      hint: 'Fundamentele spanningen',
      detailTitle: 'Drie assen van teamdynamiek',
      detailLead: 'Geen van de assen is goed of fout. Ze laten zien waar bewuste sturing het meeste oplevert.',
    },
    collaboration: {
      eyebrow: 'Samenwerking',
      value: 'Per werkstijl',
      hint: 'Hoe loopt het samen',
      detailTitle: 'Hoe deze werkstijlen samenwerken',
    },
    tensions: {
      eyebrow: 'Spanningen',
      value: (n) => `${n} actief`,
      valueNone: 'Geen actieve',
      hint: 'Waar regie helpt',
      detailTitle: 'Waar dit team om regie vraagt',
      detailLead: 'Klik op een spanningsveld om risico en leiderschapsadvies te zien.',
      detailLeadNone: 'Geen directe spanningsparen — de meest voorkomende combinaties zijn niet tegelijk sterk vertegenwoordigd.',
    },
    leadership: {
      eyebrow: 'Leiderschap',
      value: 'Acties',
      hint: 'Synthese voor morgen',
      detailTitle: 'Leiderschap voor dit team',
      detailLead: 'Concrete acties, direct afgeleid uit de dynamiek, samenwerking, spanningen en blinde vlekken in dit dashboard.',
    },
  },

  dynamics: {
    imbalance: 'Disbalans',
    // Uitgeschreven leeszin per as, afhankelijk van richting en disbalans.
    axisBalanced: (left, right) =>
      `${left} en ${right.toLowerCase()} zijn in dit team in balans. Dat is een rijp patroon — maar alleen als beide kanten ook bewust de ruimte krijgen in overleg en besluitvorming.`,
    axisDominant: (dominant, recessive) =>
      `${dominant} weegt zwaarder dan ${recessive.toLowerCase()} in dit team. Dat geeft beweging en richting, maar ook het risico dat ${recessive.toLowerCase()} sluipenderwijs verdwijnt uit gesprekken en keuzes — terwijl dat juist nodig is om het patroon vol te houden.`,
    missing: {
      eyebrow: 'Wie ontbreekt',
      lead: (n) =>
        n === 1
          ? 'Eén kritieke stem ontbreekt of is nauwelijks aanwezig. Dat vergroot het risico op blinde vlekken bij verandering.'
          : `${n} kritieke stemmen ontbreken of zijn nauwelijks aanwezig. Dat vergroot het risico op blinde vlekken bij verandering.`,
    },
  },

  collaboration: {
    empty: 'Nog geen samenwerkingspatronen zichtbaar — wacht tot meer teamleden hebben ingevuld.',
    dominantEyebrow: (pct) => `Dominante werkstijl · ${pct}% van het team`,
    carriedBy: 'Gedragen door',
    worksWell: 'Wat werkt goed',
    attentionFor: 'Aandacht voor',
    strongWith: (name) => `Sterk met ${name}`,
    attentionWith: (name) => `Aandacht met ${name}`,
    rest: {
      eyebrow: 'Verder in het team',
      lead: 'De overige werkstijlen, met wie ze versterken en waar aandacht voor mag zijn.',
    },
    missing: {
      eyebrow: 'Niet vertegenwoordigd',
      lead: (n) =>
        n === 1
          ? 'Eén werkstijl ontbreekt — die kan nog niet meedoen in deze samenwerking.'
          : `${n} werkstijlen ontbreken — die kunnen nog niet meedoen in deze samenwerking.`,
    },
    // Per persona-paar een uitleg-zin. Begint klein en eindigt zonder punt:
    // de UI zet de hoofdletter en de punt erbij.
    synergy: {
      'maker:denker': 'de maker zet ideeën om in beweging, de denker zorgt dat ze richting houden',
      'maker:vernieuwer': 'beiden brengen energie en nieuwe ideeën — samen krijgen ze dingen écht in gang',
      'denker:maker': 'de denker geeft de maker structuur, de maker geeft de denker iets om aan te bouwen',
      'denker:zekerzoeker': 'beiden waarderen zorgvuldigheid — samen voorkomen ze haastige besluiten',
      'verbinder:teamspeler': 'beiden bewaken de menselijke kant van het werk — samen houden ze het team bij elkaar',
      'verbinder:groeier': 'de verbinder ziet wie ondersteuning nodig heeft, de groeier helpt anderen ontwikkelen',
      'teamspeler:verbinder': 'beiden investeren in relaties — samen vormen ze de stabiele basis van het team',
      'teamspeler:zekerzoeker': 'beiden zorgen voor continuïteit en betrouwbaarheid in het werk',
      'presteerder:vernieuwer': 'de presteerder zet vernieuwing om in resultaat',
      'presteerder:groeier': 'beiden willen vooruit — samen houden ze het tempo erin',
      'groeier:presteerder': 'de groeier ontwikkelt zichzelf in tempo, de presteerder houdt focus op uitkomst',
      'zekerzoeker:presteerder': 'de zekerzoeker bouwt de basis waarop de presteerder kan versnellen',
      'zekerzoeker:teamspeler': 'beiden waarderen voorspelbaarheid en stabiele afspraken',
      'vernieuwer:maker': 'de vernieuwer bedenkt het, de maker maakt het',
      'vernieuwer:presteerder': 'de vernieuwer levert nieuwe ideeën, de presteerder zorgt dat ze landen',
      fallback: 'samen vullen ze elkaar aan in tempo en aanpak',
    },
    attention: {
      'maker:zekerzoeker': 'de maker beweegt sneller dan voor de zekerzoeker comfortabel is',
      'maker:teamspeler': 'de maker werkt vaak alleen, terwijl de teamspeler juist samen wil optrekken',
      'denker:presteerder': 'de denker wil eerst begrijpen, de presteerder wil nu beslissen',
      'denker:maker': 'de denker analyseert door, terwijl de maker al wil doen',
      'verbinder:presteerder': 'de verbinder vertraagt om af te stemmen, terwijl de presteerder vooruit wil',
      'teamspeler:maker': 'de teamspeler verwacht overleg, terwijl de maker liever zelf besluit',
      'teamspeler:vernieuwer': 'de teamspeler hecht aan stabiele werkwijzen, de vernieuwer wil ze juist veranderen',
      'presteerder:verbinder': 'de presteerder kiest voor tempo, de verbinder voor afstemming — beiden onmisbaar, niet altijd verenigbaar',
      'presteerder:denker': 'de presteerder maakt de denker ongeduldig, de denker frustreert de presteerder met details',
      'zekerzoeker:maker': 'de zekerzoeker raakt onrustig van het tempo en de onvoorspelbaarheid van de maker',
      'zekerzoeker:vernieuwer': 'verandering die voor de vernieuwer logisch is, voelt voor de zekerzoeker onvoorspelbaar',
      'zekerzoeker:groeier': 'de zekerzoeker zoekt rust, de groeier juist beweging — dat schuurt zonder afspraken',
      'groeier:zekerzoeker': 'de groeier wil door, de zekerzoeker wil eerst weten waar het naartoe gaat',
      'vernieuwer:zekerzoeker': 'de vernieuwer ondermijnt onbedoeld de zekerheid die de zekerzoeker nodig heeft',
      'vernieuwer:teamspeler': 'de vernieuwer bedenkt nieuwe paden, terwijl de teamspeler eerst draagvlak zoekt',
      fallback: 'hun werkritme botst zonder duidelijke afspraken',
    },
  },

  tensions: {
    empty: 'Geen directe spanningsparen gedetecteerd. De meest voorkomende combinaties zijn niet tegelijk sterk vertegenwoordigd in dit team.',
    and: 'en',
    risk: 'Risico',
    advice: 'Leiderschapsadvies',
    pairs: {
      'presteerder:verbinder': {
        label: 'Tempo en verbinding vragen om regie',
        desc: 'De presteerder stuurt op tempo en uitkomst, de verbinder op relatie en afstemming. Beide zijn nodig — maar zonder regie wisselen ze elkaar niet af, ze botsen.',
        risk: 'Besluiten worden snel genomen, maar draagvlak ontbreekt. De presteerder raakt geïrriteerd door wat hij ziet als vertraging. De verbinder voelt zich overruled. Frustratie stapelt zich aan beide kanten.',
        leadership: 'Maak per situatie expliciet wat leidend is: snelheid of verbinding. Niet als compromis, maar als bewuste keuze. Zo weet iedereen waarop wordt gestuurd, en waarom.',
      },
      'maker:zekerzoeker': {
        label: 'Vrijheid en zekerheid vragen om kaders',
        desc: 'De maker wil experimenteren en snel bewegen, de zekerzoeker heeft helderheid en continuïteit nodig. Zonder duidelijke afspraken voelt het voor de één benauwd en voor de ander chaotisch.',
        risk: 'Onrust bij de zekerzoeker, frustratie bij de maker. Energie die naar het werk had moeten gaan, verdwijnt in intern conflict over werkwijze en aanpak.',
        leadership: 'Zorg voor stabiele kaders waarbinnen experimenteren normaal is. Zo houdt de zekerzoeker zijn houvast en krijgt de maker zijn ruimte — zonder dat één van beiden hoeft te buigen.',
      },
      'denker:presteerder': {
        label: 'Diepgang en tempo vragen om ritme',
        desc: 'De denker wil begrijpen voordat hij beweegt. De presteerder wil bewegen voordat hij volledig begrijpt. Beide horen bij goede besluitvorming, maar in hetzelfde tempo gaan ze niet.',
        risk: 'De denker wordt buitengesloten van besluiten omdat hij niet snel genoeg meekomt. De presteerder neemt besluiten zonder voldoende inhoudelijke onderbouwing. Op termijn ondermijnt dat de kwaliteit van het werk én het vertrouwen in elkaar.',
        leadership: 'Reserveer denktijd vóór besluitvorming, niet erna. Maak duidelijk wanneer analyse leidend is en wanneer actie. Dat geeft beide werkstijlen het ritme dat ze nodig hebben.',
      },
      'vernieuwer:zekerzoeker': {
        label: 'Vernieuwing en continuïteit vragen om timing',
        desc: 'De vernieuwer zoekt verandering, de zekerzoeker beschermt wat werkt. Beide perspectieven beschermen het team — voor verschillende risico\'s.',
        risk: 'Vernieuwers raken gefrustreerd door wat ze ervaren als rem op verandering. Zekerzoekers raken onrustig door instabiliteit. Vernieuwing wordt dan óf afgeremd óf doorgedrukt — geen van beide werkt.',
        leadership: 'Maak onderscheid tussen verbetering en vervanging. Betrek de zekerzoeker vroeg in veranderingstrajecten — niet om af te remmen, maar om risico\'s te benoemen die de vernieuwer over het hoofd ziet.',
      },
      'teamspeler:maker': {
        label: 'Loyaliteit en autonomie vragen om eigenaarschap',
        desc: 'De teamspeler werkt vanuit gedeelde verantwoordelijkheid, de maker vanuit persoonlijke drang en autonomie. Allebei willen ze resultaat — maar via een ander pad.',
        risk: 'De teamspeler ervaart de maker als individualistisch en weinig collegiaal. De maker ervaart de teamspeler als remmend en politiek. Beiden trekken zich terug op hun eigen manier.',
        leadership: 'Definieer eigenaarschap expliciet per taak. Wie beslist, wie wordt geconsulteerd, wie informeert? Zo krijgt de maker zijn ruimte zonder dat de teamspeler het gevoel heeft buitengesloten te worden.',
      },
      'groeier:zekerzoeker': {
        label: 'Ontwikkeling en stabiliteit vragen om verankering',
        desc: 'De groeier zoekt continu nieuwe uitdagingen, de zekerzoeker heeft baat bij een stabiele omgeving. Beide hebben gelijk — maar zonder verbinding worden hun ritmes elkaars tegenpool.',
        risk: 'De groeier ziet de zekerzoeker als conservatief en weinig ambitieus. De zekerzoeker ervaart de veranderingsdrang als stressvol en ondermijnend. Het team verliest zowel ontwikkeling als stabiliteit.',
        leadership: 'Koppel groeidoelen aan stabiele structuren. Laat zien dat ontwikkeling niet hetzelfde is als verandering om de verandering — en dat stabiliteit niet hetzelfde is als stilstand.',
      },
    },
  },

  leadership: {
    empty: 'Nog geen leiderschapsacties te genereren — wacht tot meer teamleden hebben ingevuld.',
    sources: {
      dynamics: 'Uit dynamiek',
      collaboration: 'Uit samenwerking',
      tension: 'Uit spanningen',
      missing: 'Uit blinde vlek',
      fallback: 'Reflectie',
    },
    // `persona` komt al in kleine letters binnen, `action` al met kleine
    // beginletter — de UI doet die bewerking.
    forPersona: (persona, action) => `Voor de ${persona}: ${action}`,
    axisAction: (dominant, recessive) =>
      `${dominant} weegt zwaarder dan ${recessive.toLowerCase()} in dit team. Maak ruimte voor ${recessive.toLowerCase()} in overleg en besluitvorming — niet als formaliteit, maar als actief tegenwicht. Anders verdwijnt deze stem geleidelijk uit het werk.`,
    missingAction: (name) =>
      `${name} ontbreekt of is nauwelijks aanwezig. Breng dit perspectief actief in besluiten — door iemand expliciet de rol te geven, of door extern advies te vragen. Anders ontstaat een blinde vlek die pas zichtbaar wordt als het misgaat.`,
    actions: {
      presteerder: [
        'Maak prioriteiten concreet en zichtbaar. Presteerders verliezen energie als ze niet weten waar ze naartoe werken — een helder doel met meetbare voortgang houdt ze scherp.',
        'Erken voortgang en uitkomst actief. Stilte voelt voor een presteerder als afkeuring of desinteresse, ook als die er niet is.',
        'Stuur op resultaat, niet op drukte. Aanwezigheid en activiteit zeggen een presteerder weinig — alleen wat wordt opgeleverd telt voor hem.',
      ],
      verbinder: [
        'Vraag regelmatig hoe het echt gaat. Verbinders signaleren spanning eerder dan anderen, maar alleen als de ruimte er is om dat te delen.',
        'Gebruik de verbinder als vroege signaalgever. Wat zij oppikken in de wandelgangen, hoor jij pas drie weken later in een formeel gesprek — als je het al hoort.',
        'Maak ontmoeting onderdeel van het werk. Voor een verbinder is een goed gesprek geen pauze, maar de manier waarop het werk gedaan wordt.',
      ],
      maker: [
        'Geef richting op hoofdlijnen, laat ruimte in de aanpak. Een maker heeft een doel nodig, geen draaiboek — anders dooft de energie waarmee hij dingen voor elkaar krijgt.',
        'Beloon initiatief zichtbaar. Makers nemen risico door dingen op te pakken die nog niet zijn afgesproken — als dat wordt afgestraft of genegeerd, stoppen ze ermee.',
        'Maak experimenteren veilig. Makers leren door te doen, en doen betekent soms falen. Zonder die ruimte verlies je hun beste werk.',
      ],
      denker: [
        'Geef informatie op tijd en volledig. Een denker die op het laatste moment moet reageren, levert niet zijn beste werk — en weet dat zelf ook.',
        'Bescherm denktijd. In een team dat draait om tempo wordt reflectie al snel een luxe — terwijl de denker juist daar zijn waarde heeft.',
        'Waardeer grondigheid, ook als het langzamer gaat. De denker voorkomt fouten die anderen pas zien als ze al gemaakt zijn.',
      ],
      teamspeler: [
        'Zorg voor duidelijke rollen en stabiele verhoudingen. Een teamspeler levert het beste werk als hij weet waar hij staat in het geheel — onduidelijkheid kost hem onevenredig veel energie.',
        'Communiceer verandering vroeg en persoonlijk. Voor een teamspeler is een mailtje over een reorganisatie geen informatie, maar een teken van afstand.',
        'Benoem teamresultaten naast individuele prestaties. De teamspeler ziet zijn bijdrage in wat het team bereikt — als alleen individuele prestaties gevierd worden, voelt hij zich onzichtbaar.',
      ],
      zekerzoeker: [
        'Geef voorspelbaarheid in verwachtingen. Een zekerzoeker presteert het beste als de regels stabiel zijn — niet omdat hij geen verandering aankan, maar omdat hij anders zijn focus kwijtraakt.',
        'Communiceer verandering met reden en tijdlijn. Een zekerzoeker accepteert verandering, maar heeft daar de context bij nodig: waarom nu, wat verandert er, wanneer.',
        'Waardeer betrouwbaarheid zichtbaar. Werk dat altijd op tijd af is, valt niet meer op — terwijl het de basis vormt waarop de rest kan bouwen.',
      ],
      groeier: [
        'Bespreek leerdoelen actief. Een groeier die geen ontwikkelperspectief ziet, wordt onrustig — ook als het werk inhoudelijk goed bevalt.',
        'Geef uitdagende opdrachten naast routine. Routine voert een groeier prima uit, maar zonder iets om in te bijten verliest hij zijn scherpte.',
        'Maak groei zichtbaar. Een groeier wil weten of hij vooruit komt — niet uit ijdelheid, maar omdat ontwikkeling voor hem de motivator is.',
      ],
      vernieuwer: [
        'Reserveer ruimte voor experiment. Vernieuwers hebben kleine vrijplaatsen nodig waarin nieuwe ideeën mogen mislukken — anders blijven ze hangen in de bestaande routines.',
        'Maak de vernieuwer zichtbaar in besluitvorming. Wie alleen aan tafel zit met executie-gerichte stemmen, krijgt geen vernieuwing — alleen optimalisatie van wat er al is.',
        'Bescherm nieuwe ideeën in de beginfase. Een idee dat nog niet af is, wordt te makkelijk afgeschoten op wat het nog niet is. De vernieuwer haakt dan af.',
      ],
    },
  },
};

export default teamDynamics;
