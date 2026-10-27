/**
 * teamDynamics — Module 2 · Teamdynamiek.
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

const teamDynamics = {
  hero: {
    eyebrow: '02 — Teamdynamiek',
    title: 'Teamdynamiek voor',
    lead: 'Waar samenwerking schuurt, waarom tempo en reflectie botsen, en wat dat vraagt van leiderschap.',
    // Voor wie dit deel is (besluit 3, akkoord Judith 27 okt 2026). "Is voor"
    // en "het team": klopt ook voor de beheerder, die het ook ziet.
    audience: 'Dit deel is voor de leidinggevende. Het team ziet alleen Teaminzicht.',
    downloadPdf: 'Download als PDF',
    backToInsight: '← Naar Teaminzicht',
    otherTeam: 'Ander team',
  },

  noAccess: {
    title: 'Dit deel is voor de',
    titleAccent: 'leidinggevende',
    lead: 'Teaminzicht is er voor het hele team. Teamdynamiek gaat een laag dieper: wat deze samenstelling vraagt van leidinggeven. Je opent het door in te loggen met het mailadres dat aan dit team gekoppeld is.',
    login: 'Inloggen als leidinggevende',
    cta: 'Naar Teaminzicht',
  },

  noData: {
    title: 'Geen teamdata voor',
    lead: 'Laad eerst een team via Teaminzicht.',
    cta: '← Naar Teaminzicht',
    embedded: 'Geen responses om de dynamiek op te baseren.',
  },

  // Wat er in plaats van de dynamiek staat als het team nog te klein is
  // (drempel in utils/access.js, blok in components/TeamGate.jsx).

  // Als er geen teamnaam bekend is.
  fallbackTeamName: 'jouw team',

  close: 'Sluiten ✕',
  // Voor de schermlezer; het kruisje zelf leest als "maal".
  closeLabel: 'Paneel sluiten',

  chips: {
    responses: 'Ingevuld',
    organisation: 'Organisatie',
    dominant: 'Dominant',
    tensions: 'Spanningen',
    reliability: 'Betrouwbaarheid',
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
      valueNone: 'Geen directe',
      hint: 'Waar regie helpt',
      detailTitle: 'Waar dit team om regie vraagt',
      detailLead: 'Klik op een spanningsveld om risico en leiderschapsadvies te zien.',
      detailLeadNone: 'De werkstijlen die vaak botsen, zijn in dit team niet allebei sterk aanwezig.',
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
    dominantEyebrow: (pct) => `Dominante werkstijl · ${pct}% van de teamenergie`,
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
    empty: 'Geen directe spanningen.',
    and: 'en',
    // Eén keer achter het paar (B2.2): de percentages zijn van de teamenergie.
    ofEnergy: 'van de teamenergie',
    risk: 'Risico',
    advice: 'Leiderschapsadvies',
    pairs: {
      'presteerder:verbinder': {
        label: 'Tempo en verbinding vragen om regie',
        desc: 'De presteerder stuurt op tempo en uitkomst, de verbinder op relatie en afstemming. Beide zijn nodig — maar zonder regie wisselen ze elkaar niet af, ze botsen.',
        risk: 'Besluiten worden snel genomen, maar draagvlak ontbreekt. Presteerders raken geïrriteerd door wat ze zien als vertraging. Verbinders voelen zich overruled. Frustratie stapelt zich aan beide kanten.',
        leadership: 'Maak per situatie expliciet wat leidend is: snelheid of verbinding. Niet als compromis, maar als bewuste keuze. Zo weet iedereen waarop wordt gestuurd, en waarom.',
      },
      'maker:zekerzoeker': {
        label: 'Vrijheid en zekerheid vragen om kaders',
        desc: 'De maker wil experimenteren en snel bewegen, de zekerzoeker heeft helderheid en continuïteit nodig. Zonder duidelijke afspraken voelt het voor de één benauwd en voor de ander chaotisch.',
        risk: 'Onrust bij de zekerzoeker, frustratie bij de maker. Energie die naar het werk had moeten gaan, verdwijnt in intern conflict over werkwijze en aanpak.',
        leadership: 'Zorg voor stabiele kaders waarbinnen experimenteren normaal is. Zo houden zekerzoekers hun houvast en krijgen makers hun ruimte — zonder dat één van beiden hoeft te buigen.',
      },
      'denker:presteerder': {
        label: 'Diepgang en tempo vragen om ritme',
        desc: 'Denkers willen begrijpen voordat ze bewegen. Presteerders willen bewegen voordat ze volledig begrijpen. Beide horen bij goede besluitvorming, maar in hetzelfde tempo gaan ze niet.',
        risk: 'Denkers worden buitengesloten van besluiten omdat ze niet snel genoeg meekomen. Presteerders nemen besluiten zonder voldoende inhoudelijke onderbouwing. Op termijn ondermijnt dat de kwaliteit van het werk én het vertrouwen in elkaar.',
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
        leadership: 'Definieer eigenaarschap expliciet per taak. Wie beslist, wie wordt geconsulteerd, wie informeert? Zo krijgen makers hun ruimte zonder dat teamspelers het gevoel hebben buitengesloten te worden.',
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
      fallback: 'Zelf aan de slag',
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
        'Stuur op resultaat, niet op drukte. Aanwezigheid en activiteit zeggen presteerders weinig — alleen wat wordt opgeleverd telt voor hen.',
      ],
      verbinder: [
        'Vraag regelmatig hoe het echt gaat. Verbinders signaleren spanning eerder dan anderen, maar alleen als de ruimte er is om dat te delen.',
        'Gebruik verbinders als vroege signaalgevers. Wat zij oppikken in de wandelgangen, hoor jij pas drie weken later in een formeel gesprek — als je het al hoort.',
        'Maak ontmoeting onderdeel van het werk. Voor een verbinder is een goed gesprek geen pauze, maar de manier waarop het werk gedaan wordt.',
      ],
      maker: [
        'Geef richting op hoofdlijnen, laat ruimte in de aanpak. Makers hebben een doel nodig, geen draaiboek — anders dooft de energie waarmee ze dingen voor elkaar krijgen.',
        'Beloon initiatief zichtbaar. Makers nemen risico door dingen op te pakken die nog niet zijn afgesproken — als dat wordt afgestraft of genegeerd, stoppen ze ermee.',
        'Maak experimenteren veilig. Makers leren door te doen, en doen betekent soms falen. Zonder die ruimte verlies je hun beste werk.',
      ],
      denker: [
        'Geef informatie op tijd en volledig. Denkers die op het laatste moment moeten reageren, leveren niet hun beste werk — en weten dat zelf ook.',
        'Bescherm denktijd. In een team dat draait om tempo wordt reflectie al snel een luxe — terwijl denkers juist daar hun waarde hebben.',
        'Waardeer grondigheid, ook als het langzamer gaat. De denker voorkomt fouten die anderen pas zien als ze al gemaakt zijn.',
      ],
      teamspeler: [
        'Zorg voor duidelijke rollen en stabiele verhoudingen. Teamspelers leveren het beste werk als ze weten waar ze staan in het geheel — onduidelijkheid kost hen onevenredig veel energie.',
        'Communiceer verandering vroeg en persoonlijk. Voor een teamspeler is een mailtje over een reorganisatie geen informatie, maar een teken van afstand.',
        'Benoem teamresultaten naast individuele prestaties. Teamspelers zien hun bijdrage in wat het team bereikt — als alleen individuele prestaties gevierd worden, voelen ze zich onzichtbaar.',
      ],
      zekerzoeker: [
        'Geef voorspelbaarheid in verwachtingen. Zekerzoekers presteren het beste als de regels stabiel zijn — niet omdat ze geen verandering aankunnen, maar omdat ze anders hun focus kwijtraken.',
        'Communiceer verandering met reden en tijdlijn. Een zekerzoeker accepteert verandering, maar heeft daar de context bij nodig: waarom nu, wat verandert er, wanneer.',
        'Waardeer betrouwbaarheid zichtbaar. Werk dat altijd op tijd af is, valt niet meer op — terwijl het de basis vormt waarop de rest kan bouwen.',
      ],
      groeier: [
        'Bespreek leerdoelen actief. Een groeier die geen ontwikkelperspectief ziet, wordt onrustig — ook als het werk inhoudelijk goed bevalt.',
        'Geef uitdagende opdrachten naast routine. Routine voeren groeiers prima uit, maar zonder iets om in te bijten verliezen ze hun scherpte.',
        'Maak groei zichtbaar. Groeiers willen weten of ze vooruitkomen — niet uit ijdelheid, maar omdat ontwikkeling voor hen de motivator is.',
      ],
      vernieuwer: [
        'Reserveer ruimte voor experiment. Vernieuwers hebben kleine vrijplaatsen nodig waarin nieuwe ideeën mogen mislukken — anders blijven ze hangen in de bestaande routines.',
        'Maak de vernieuwer zichtbaar in besluitvorming. Wie alleen aan tafel zit met executie-gerichte stemmen, krijgt geen vernieuwing — alleen optimalisatie van wat er al is.',
        'Bescherm nieuwe ideeën in de beginfase. Een idee dat nog niet af is, wordt te makkelijk afgeschoten op wat het nog niet is. De vernieuwer haakt dan af.',
      ],
    },
  },
  // Deelmoment 3 (deelteksten 22 okt 2026; besluit Judith 25 okt: nu al,
  // zonder te wachten op de gespreksvragen). Alleen voor de leidinggevende.
  share: {
    eyebrow: 'Doorvertellen',
    title: 'Een collega-leidinggevende laten meekijken? Laat het voorbeeldteam zien, niet dit scherm.',
    // "Er staan geen namen in dit beeld" klopt hier altijd: Teamdynamiek
    // toont nooit namen, ook niet bij een team met de namenoptie.
    lead: 'Er staan geen namen in dit beeld, maar wie je team kent, kan er toch mensen in herkennen. Wat je wel kunt navertellen, is wat het gesprek met je team opleverde.',
    button: 'Tekst kopiëren',
    copied: 'Gekopieerd. Zet er in je eigen woorden bij hoe het gesprek met je team ging. Dat wil je collega horen.',
    copyFailed: 'Kopiëren lukte niet. Probeer het nog een keer.',
    text: `Hoi,

Ik heb met mijn team TOF Persona gedaan. Iedereen vult negen vragen in over de eigen manier van werken. Het team krijgt daarna een gezamenlijk beeld van de werkstijlen en van wat het team van de werkplek vraagt. Ik zie als leidinggevende daarnaast wat dat vraagt van leidinggeven. Wie welke werkstijl heeft, staat er standaard niet in, ook niet voor de leidinggevende, en onder vijf ingevulde profielen is er geen beeld. Daardoor kan iedereen eerlijk invullen.

Mijn eigen teambeeld laat ik je niet zien: jij kent mijn team, dus je zou er mensen in kunnen herkennen. Hoe het eruitziet, zie je aan het voorbeeldteam op www.persona-tool.nl/demo. Wil je het voor je eigen team, dan staat op www.persona-tool.nl/voor-je-team hoe dat gaat.

Groet,`,
    secondTeam: 'Leid je nog een team? Antwoord op de mail waarin je de teamcode kreeg.',
  },

  // De sessieregel; de link staat in src/config/contact.js (BOOKING_URL).
  session: {
    lead: 'Wil je het beeld samen met je team lezen, met Judith erbij? Begin met een vrijblijvend gesprek van een halfuur.',
    cta: 'Plan een gesprek',
  },
};

export default teamDynamics;
