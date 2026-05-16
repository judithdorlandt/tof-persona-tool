/**
 * strategicQuestions.js — Strategic Tool intake-vragen (Module 3)
 *
 * 8 vragen verdeeld over 4 strategische assen. Per as twee vragen vanuit
 * verschillende invalshoeken, zodat we convergentie/divergentie kunnen meten.
 *
 * Assen:
 *   1. presence-value      Aanwezigheid ↔ Waarde
 *   2. hospitality-community Hospitality ↔ Community
 *   3. tech-human          Technologie ↔ Menselijkheid
 *   4. freedom-rhythm      Individuele vrijheid ↔ Collectief ritme
 *
 * Elk antwoord (A/B/C/D) hoort bij één positie op de as én scoort op
 * één of meer van de 8 trends uit het Strategisch Kompas.
 *
 * Trend-IDs corresponderen met strategicKompas.js (01-08).
 */

export const STRATEGIC_AXES = [
    {
        id: 'presence-value',
        label: 'Aanwezigheid ↔ Waarde',
        subtitle: 'Wat is de bedoeling van het kantoor?',
        positions: [
            { id: 'presence-volume', label: 'Aanwezigheid en volume' },
            { id: 'adaptive-individual', label: 'Adaptief per persoon' },
            { id: 'intentional-value', label: 'Intentionele waarde' },
            { id: 'decentralized', label: 'Decentralisatie' },
        ],
    },
    {
        id: 'hospitality-community',
        label: 'Hospitality ↔ Community',
        subtitle: 'Waar landt de investering?',
        positions: [
            { id: 'service-hospitality', label: 'Service en hospitality' },
            { id: 'community-rituals', label: 'Community en rituelen' },
            { id: 'adaptive-inclusive', label: 'Adaptief en inclusief' },
            { id: 'purpose-society', label: 'Maatschappelijk doel' },
        ],
    },
    {
        id: 'tech-human',
        label: 'Technologie ↔ Menselijkheid',
        subtitle: 'Waar zit onze toegevoegde waarde?',
        positions: [
            { id: 'tech-enabler', label: 'Tech als versneller' },
            { id: 'human-depth', label: 'Menselijke diepte' },
            { id: 'craft-excellence', label: 'Vakmanschap en inhoud' },
            { id: 'strategic-clarity', label: 'Strategische helderheid' },
        ],
    },
    {
        id: 'freedom-rhythm',
        label: 'Individuele vrijheid ↔ Collectief ritme',
        subtitle: 'Hoe organiseren we het werk?',
        positions: [
            { id: 'collective-fixed', label: 'Collectief en vast' },
            { id: 'individual-freedom', label: 'Individuele vrijheid' },
            { id: 'work-driven', label: 'Werk-gestuurd' },
            { id: 'designed-flexibility', label: 'Ontworpen flexibiliteit' },
        ],
    },
];

export const STRATEGIC_QUESTIONS = [
    // ─── AS 1 · Aanwezigheid ↔ Waarde ─────────────────────────────────────────
    {
        id: 'q1',
        axisId: 'presence-value',
        question: 'Het kantoor van over drie jaar — waar zit voor jou de winst?',
        context: 'Stel je voor: jullie organisatie staat op een keerpunt. Het kantoor is op dinsdag en donderdag overvol, op woensdag en vrijdag bijna leeg. Het MT wil bewegen, maar de richting is open. Wat zou voor jouw werk het meeste verschil maken?',
        options: [
            { letter: 'A', position: 'presence-volume', trends: ['06', '01'], label: 'Een levendiger kantoor — meer mensen, meer reuring.', detail: 'De energie van een vol gebouw, spontane ontmoetingen, samenwerking die vanzelf ontstaat. Minder werkplekken, meer beleving.' },
            { letter: 'B', position: 'adaptive-individual', trends: ['04', '01'], label: 'Een kantoor dat aansluit op hoe ik me die dag voel.', detail: 'De ene dag heb ik rust en focus nodig, de andere dag wil ik samen brainstormen. De omgeving moet meebewegen met mijn werk.' },
            { letter: 'C', position: 'intentional-value', trends: ['02', '05'], label: 'Een kantoor waar het samenkomen écht ergens over gaat.', detail: 'Niet zomaar aanwezig zijn, maar bewuste momenten van samenwerking, leren of besluiten nemen. Minder vaak, maar van hogere waarde.' },
            { letter: 'D', position: 'decentralized', trends: ['07'], label: 'Een netwerk van kleinere plekken dichter bij huis.', detail: 'Minder reistijd, meer lokale verbinding, en kantoor als satelliet — niet als verplicht middelpunt.' },
        ],
    },
    {
        id: 'q5',
        axisId: 'presence-value',
        question: 'Waaraan zou je over drie jaar zien dat het kantoor wérkt?',
        context: 'Bezetting, bedoeling, functionaliteit, plek-in-een-netwerk — verschillende organisaties meten hun werkomgeving op andere manieren. Welke "het werkt" past het beste bij jouw beeld?',
        options: [
            { letter: 'A', position: 'presence-volume', trends: ['06'], label: 'De bezetting is hoog en gevarieerd door de week — mensen komen graag.', detail: '' },
            { letter: 'B', position: 'intentional-value', trends: ['02'], label: 'Mensen kiezen actief om te komen omdat het waarde toevoegt aan hun werk.', detail: '' },
            { letter: 'C', position: 'adaptive-individual', trends: ['04', '01'], label: 'Verschillende soorten werk vinden hun plek — focus en interactie naast elkaar, zonder compromis.', detail: '' },
            { letter: 'D', position: 'decentralized', trends: ['07'], label: 'Het kantoor functioneert als knooppunt in een breder werk-netwerk — niet als eindpunt.', detail: '' },
        ],
    },

    // ─── AS 2 · Hospitality ↔ Community ───────────────────────────────────────
    {
        id: 'q2',
        axisId: 'hospitality-community',
        question: 'Wat maakt een werkomgeving voor jou betekenisvol?',
        context: 'Organisaties investeren steeds meer in werkomgevingen die verder gaan dan een goede stoel en snelle wifi. De vraag is: waarin moet die investering wat jou betreft landen?',
        options: [
            { letter: 'A', position: 'purpose-society', trends: ['07', '05'], label: 'In verbinding met de buurt en de maatschappij.', detail: 'Een kantoor dat open staat, dat iets toevoegt aan zijn omgeving, waar je trots op kunt zijn omdat het bijdraagt aan meer dan alleen het werk.' },
            { letter: 'B', position: 'adaptive-inclusive', trends: ['04', '01'], label: 'In ruimte voor verschil — prikkelarm én prikkelrijk.', detail: 'Plekken om je terug te trekken én plekken die energie geven. Een omgeving die rekening houdt met hoe verschillend mensen werken en zich voelen.' },
            { letter: 'C', position: 'service-hospitality', trends: ['06', '01'], label: 'In hospitality en service — het kantoor als verblijfsplek.', detail: 'Goede koffie, gezond eten, een ontvangst die klopt. Kwaliteit die je voelt zodra je binnenkomt, elke dag opnieuw.' },
            { letter: 'D', position: 'community-rituals', trends: ['05'], label: 'In community en gedeelde rituelen.', detail: 'Vaste momenten waarop je elkaar treft, gezamenlijke initiatieven, een cultuur die zichtbaar is in de manier waarop we met elkaar omgaan.' },
        ],
    },
    {
        id: 'q6',
        axisId: 'hospitality-community',
        question: 'Wat maakt dat je je ergens thuis voelt op het werk?',
        context: 'Werkplek-tevredenheid stopt niet bij ergonomie of locatie. Wat geeft jou het gevoel dat je op een plek hoort?',
        options: [
            { letter: 'A', position: 'service-hospitality', trends: ['06'], label: 'Goede service, comfort en kwaliteit — alles werkt zoals het hoort, elke dag opnieuw.', detail: '' },
            { letter: 'B', position: 'community-rituals', trends: ['05'], label: 'Vaste gezichten, herkenbare rituelen, mensen die je naam kennen.', detail: '' },
            { letter: 'C', position: 'adaptive-inclusive', trends: ['04', '01'], label: 'Een omgeving die jouw werk en stemming begrijpt — niet één-maat-voor-iedereen.', detail: '' },
            { letter: 'D', position: 'purpose-society', trends: ['02', '07'], label: 'Het gevoel dat je bijdraagt aan iets dat groter is dan de organisatie zelf.', detail: '' },
        ],
    },

    // ─── AS 3 · Technologie ↔ Menselijkheid ───────────────────────────────────
    {
        id: 'q3',
        axisId: 'tech-human',
        question: 'AI verandert het werk — waar zit voor jou de echte waarde?',
        context: 'De komende jaren neemt AI repetitief en routinematig werk over. Dat verlegt de vraag: waar voegen mensen dan nog écht iets toe? Waar zit voor jou de waarde die niet door een algoritme te vervangen is?',
        options: [
            { letter: 'A', position: 'tech-enabler', trends: ['08'], label: 'In het ontzorgen — alles wat sneller en soepeler kan, mag automatisch.', detail: 'Hoe minder gedoe, hoe meer ruimte voor het werk dat er toe doet. AI is een verlosser van administratie en herhaling.' },
            { letter: 'B', position: 'human-depth', trends: ['05'], label: 'In het persoonlijke contact dat het verschil maakt.', detail: 'De empathie, de aandacht, de onverwachte oplossing op het juiste moment. Dat is waar wij het verschil maken — en wat AI niet kan repliceren.' },
            { letter: 'C', position: 'craft-excellence', trends: ['01'], label: 'In het vakmanschap en de inhoud.', detail: 'Diepgaande expertise, ambacht, het kunnen doen wat anderen niet kunnen. AI helpt, maar de inhoudelijke kwaliteit komt van mensen die hun vak verstaan.' },
            { letter: 'D', position: 'strategic-clarity', trends: ['08'], label: 'In het stellen van de juiste vragen.', detail: 'AI geeft snelle antwoorden, maar de kunst zit in het scherpe denken vooraf: welke vraag stellen we eigenlijk, en waarom?' },
        ],
    },
    {
        id: 'q7',
        axisId: 'tech-human',
        question: 'Waar zou de organisatie haar leerinvestering op moeten richten?',
        context: 'Wat mensen in de komende jaren moeten kunnen, verandert. Als jij de richting van de leerbudgetten zou bepalen — waar gaat het naartoe?',
        options: [
            { letter: 'A', position: 'tech-enabler', trends: ['08'], label: 'Mensen sneller helpen om AI en data echt te benutten in hun dagelijkse werk.', detail: '' },
            { letter: 'B', position: 'human-depth', trends: ['05'], label: 'Het verfijnen van échte menselijke vaardigheden — luisteren, lezen tussen de regels, omgaan met conflict.', detail: '' },
            { letter: 'C', position: 'craft-excellence', trends: ['01'], label: 'Diepere vakkennis blijven uitbouwen, ook als AI veel routinewerk overneemt.', detail: '' },
            { letter: 'D', position: 'strategic-clarity', trends: ['08', '02'], label: 'Strategisch denken aanscherpen — beter worden in welke vragen we überhaupt stellen.', detail: '' },
        ],
    },

    // ─── AS 4 · Vrijheid ↔ Ritme ──────────────────────────────────────────────
    {
        id: 'q4',
        axisId: 'freedom-rhythm',
        question: 'Hoe zou jouw werkweek eruit moeten zien om op je best te zijn?',
        context: 'Hybride werken biedt vrijheid, maar ook nieuwe vragen: wanneer ben je samen, wanneer alleen, en wie bepaalt dat eigenlijk? Welk ritme past het beste bij hoe jij wilt werken?',
        options: [
            { letter: 'A', position: 'collective-fixed', trends: ['03'], label: 'Vaste teamdagen — duidelijkheid boven flexibiliteit.', detail: 'Iedereen weet wanneer we samen zijn. Geen gedoe, geen ruis. Het collectieve ritme geeft houvast en maakt samenwerken vanzelfsprekend.' },
            { letter: 'B', position: 'individual-freedom', trends: ['04'], label: 'Zelf kiezen wat past — vrijheid om mijn week in te delen.', detail: 'Mijn werk verschilt per week, mijn leven ook. Ik weet zelf het beste wanneer ik waar het meest waardevol ben.' },
            { letter: 'C', position: 'work-driven', trends: ['02'], label: 'Sturen op het doel, niet op de plek.', detail: 'Wat het beste werkt, hangt af van wat we willen bereiken. De ene week vraagt om intensief samenwerken, de andere om diepe focus. Het ritme volgt het werk.' },
            { letter: 'D', position: 'designed-flexibility', trends: ['03', '04'], label: 'Een nieuw collectief patroon dat ruimte laat voor verschil.', detail: 'Niet "iedereen overal" en niet "iedereen tegelijk". Een doordacht ritme waarin teamdagen, focusdagen en buurt-werkdagen elkaar afwisselen.' },
        ],
    },
    {
        id: 'q8',
        axisId: 'freedom-rhythm',
        question: 'Wanneer iemand in het team anders werkt dan de rest — wat is dan de juiste reactie?',
        context: 'In elk team werken sommigen anders. De vraag is niet óf dat gebeurt, maar hoe je daarmee omgaat als organisatie.',
        options: [
            { letter: 'A', position: 'collective-fixed', trends: ['03'], label: 'Een heldere gemeenschappelijke afspraak maken die voor iedereen werkt — niet voor één in het bijzonder.', detail: '' },
            { letter: 'B', position: 'individual-freedom', trends: ['04'], label: 'Erkennen dat verschillende mensen verschillende werkwijzen nodig hebben, en daar ruimte voor maken.', detail: '' },
            { letter: 'C', position: 'work-driven', trends: ['02'], label: 'Kijken wat het werk vraagt en daar de afspraken aan koppelen — niet andersom.', detail: '' },
            { letter: 'D', position: 'designed-flexibility', trends: ['04', '03'], label: 'Een patroon zoeken dat verschil mogelijk maakt zonder chaos — design boven regels.', detail: '' },
        ],
    },
];

/**
 * Helper: krijg de axis-config voor een gegeven axisId.
 */
export function getAxis(axisId) {
    return STRATEGIC_AXES.find((a) => a.id === axisId) || null;
}

/**
 * Helper: krijg alle vragen voor een gegeven as.
 */
export function getQuestionsForAxis(axisId) {
    return STRATEGIC_QUESTIONS.filter((q) => q.axisId === axisId);
}
