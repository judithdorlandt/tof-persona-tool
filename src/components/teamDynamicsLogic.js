/**
 * teamDynamicsLogic - pure functies voor TeamDynamics view.
 * Geextraheerd uit TeamDynamics.jsx voor overzicht en testbaarheid.
 */
import { ARCHETYPES } from '../data';
import { getDynamics } from '../insights';
import { MODULE } from '../ui/tokens';

const ACCENT = MODULE.dynamics.accent;

export const PERSONA_COLORS = {
    maker: '#B05252',
    groeier: '#C28D6B',
    presteerder: '#C7A24A',
    denker: '#6F7F92',
    verbinder: '#7F9A8A',
    teamspeler: '#8B7F9A',
    zekerzoeker: '#7D8A6B',
    vernieuwer: '#D08C5B',
};

// =========================
// TENSION PAIRS
// =========================
export const TENSION_PAIRS = [
    {
        a: 'presteerder', b: 'verbinder',
        label: 'Tempo en verbinding vragen om regie',
        desc: 'De presteerder stuurt op tempo en uitkomst, de verbinder op relatie en afstemming. Beide zijn nodig — maar zonder regie wisselen ze elkaar niet af, ze botsen.',
        risk: 'Besluiten worden snel genomen, maar draagvlak ontbreekt. De presteerder raakt geïrriteerd door wat hij ziet als vertraging. De verbinder voelt zich overruled. Frustratie stapelt zich aan beide kanten.',
        leadership: 'Maak per situatie expliciet wat leidend is: snelheid of verbinding. Niet als compromis, maar als bewuste keuze. Zo weet iedereen waarop wordt gestuurd, en waarom.',
    },
    {
        a: 'maker', b: 'zekerzoeker',
        label: 'Vrijheid en zekerheid vragen om kaders',
        desc: 'De maker wil experimenteren en snel bewegen, de zekerzoeker heeft helderheid en continuïteit nodig. Zonder duidelijke afspraken voelt het voor de één benauwd en voor de ander chaotisch.',
        risk: 'Onrust bij de zekerzoeker, frustratie bij de maker. Energie die naar het werk had moeten gaan, verdwijnt in intern conflict over werkwijze en aanpak.',
        leadership: 'Zorg voor stabiele kaders waarbinnen experimenteren normaal is. Zo houdt de zekerzoeker zijn houvast en krijgt de maker zijn ruimte — zonder dat één van beiden hoeft te buigen.',
    },
    {
        a: 'denker', b: 'presteerder',
        label: 'Diepgang en tempo vragen om ritme',
        desc: 'De denker wil begrijpen voordat hij beweegt. De presteerder wil bewegen voordat hij volledig begrijpt. Beide horen bij goede besluitvorming, maar in hetzelfde tempo gaan ze niet.',
        risk: 'De denker wordt buitengesloten van besluiten omdat hij niet snel genoeg meekomt. De presteerder neemt besluiten zonder voldoende inhoudelijke onderbouwing. Op termijn ondermijnt dat de kwaliteit van het werk én het vertrouwen in elkaar.',
        leadership: 'Reserveer denktijd vóór besluitvorming, niet erna. Maak duidelijk wanneer analyse leidend is en wanneer actie. Dat geeft beide werkstijlen het ritme dat ze nodig hebben.',
    },
    {
        a: 'vernieuwer', b: 'zekerzoeker',
        label: 'Vernieuwing en continuïteit vragen om timing',
        desc: 'De vernieuwer zoekt verandering, de zekerzoeker beschermt wat werkt. Beide perspectieven beschermen het team — voor verschillende risico\'s.',
        risk: 'Vernieuwers raken gefrustreerd door wat ze ervaren als rem op verandering. Zekerzoekers raken onrustig door instabiliteit. Vernieuwing wordt dan óf afgeremd óf doorgedrukt — geen van beide werkt.',
        leadership: 'Maak onderscheid tussen verbetering en vervanging. Betrek de zekerzoeker vroeg in veranderingstrajecten — niet om af te remmen, maar om risico\'s te benoemen die de vernieuwer over het hoofd ziet.',
    },
    {
        a: 'teamspeler', b: 'maker',
        label: 'Loyaliteit en autonomie vragen om eigenaarschap',
        desc: 'De teamspeler werkt vanuit gedeelde verantwoordelijkheid, de maker vanuit persoonlijke drang en autonomie. Allebei willen ze resultaat — maar via een ander pad.',
        risk: 'De teamspeler ervaart de maker als individualistisch en weinig collegiaal. De maker ervaart de teamspeler als remmend en politiek. Beiden trekken zich terug op hun eigen manier.',
        leadership: 'Definieer eigenaarschap expliciet per taak. Wie beslist, wie wordt geconsulteerd, wie informeert? Zo krijgt de maker zijn ruimte zonder dat de teamspeler het gevoel heeft buitengesloten te worden.',
    },
    {
        a: 'groeier', b: 'zekerzoeker',
        label: 'Ontwikkeling en stabiliteit vragen om verankering',
        desc: 'De groeier zoekt continu nieuwe uitdagingen, de zekerzoeker heeft baat bij een stabiele omgeving. Beide hebben gelijk — maar zonder verbinding worden hun ritmes elkaars tegenpool.',
        risk: 'De groeier ziet de zekerzoeker als conservatief en weinig ambitieus. De zekerzoeker ervaart de veranderingsdrang als stressvol en ondermijnend. Het team verliest zowel ontwikkeling als stabiliteit.',
        leadership: 'Koppel groeidoelen aan stabiele structuren. Laat zien dat ontwikkeling niet hetzelfde is als verandering om de verandering — en dat stabiliteit niet hetzelfde is als stilstand.',
    },
];

// =========================
// LEADERSHIP MAP
// =========================
export const LEADERSHIP_MAP = {
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
};

export function getArchetype(id) {
    return ARCHETYPES.find((a) => a.id === id) || null;
}

export function resolveTeamName(sel) {
    if (!sel) return 'jouw team';
    if (typeof sel === 'string') return sel;
    return sel.name || sel.team || 'jouw team';
}

export function resolveTeamKey(sel) {
    if (!sel) return '';
    if (typeof sel === 'string') return sel;
    return sel.team || '';
}

export function resolveOrg(sel) {
    if (!sel || typeof sel === 'string') return '';
    return sel.organization || '';
}

export function buildPersonaScores(teamResponses) {
    const scores = {};
    teamResponses.forEach((r) => {
        const full = r?.full_scores || {};
        if (Object.keys(full).length > 0) {
            Object.entries(full).forEach(([k, v]) => {
                scores[k] = (scores[k] || 0) + Number(v || 0);
            });
            return;
        }
        if (r?.primary_archetype) scores[r.primary_archetype] = (scores[r.primary_archetype] || 0) + 3;
        if (r?.secondary_archetype) scores[r.secondary_archetype] = (scores[r.secondary_archetype] || 0) + 2;
        if (r?.tertiary_archetype) scores[r.tertiary_archetype] = (scores[r.tertiary_archetype] || 0) + 1;
    });
    return scores;
}

export function findActiveTensions(sorted) {
    const present = new Set(sorted.filter(([, v]) => v > 0).map(([id]) => id));
    return TENSION_PAIRS.filter((p) => present.has(p.a) && present.has(p.b));
}

export function buildDynamicsAxes(sorted, totalScore) {
    const idx = {};
    ARCHETYPES.forEach((a, i) => { idx[a.id] = i; });
    const pcts = Array(8).fill(0);
    sorted.forEach(([id, value]) => {
        const i = idx[id];
        if (i !== undefined && totalScore > 0) pcts[i] = Math.round((value / totalScore) * 100);
    });
    return getDynamics(pcts);
}

export function findMissingCritical(sorted) {
    const present = new Set(sorted.filter(([, v]) => v > 0).map(([id]) => id));
    return ['denker', 'verbinder', 'vernieuwer']
        .filter((id) => !present.has(id))
        .map((id) => ({ id, archetype: getArchetype(id) }))
        .filter((x) => x.archetype);
}

export function buildLeadershipActions(sorted) {
    return sorted
        .slice(0, 3)
        .filter(([id]) => LEADERSHIP_MAP[id])
        .map(([id]) => ({
            id,
            persona: getArchetype(id)?.name || id,
            color: PERSONA_COLORS[id],
            items: LEADERSHIP_MAP[id],
        }));
}

export function getReliability(count) {
    if (count < 3) return 'Eerste signalen';
    if (count < 6) return 'Opkomend patroon';
    if (count <= 15) return 'Betrouwbaar beeld';
    return 'Sterk patroon';
}

export function collectPersonaPeople(teamResponses, personaId) {
    const names = [];
    let anonymousCount = 0;
    teamResponses.forEach((r) => {
        if (r?.primary_archetype !== personaId) return;
        const fname = String(r?.name || '').trim().split(/\s+/)[0];
        if (!fname || fname === 'Onbekend') {
            anonymousCount += 1;
            return;
        }
        if (!names.includes(fname)) names.push(fname);
    });
    return { names, anonymousCount };
}

// Backwards-compat helper: returns just the names array
export function collectFirstNames(teamResponses, personaId) {
    return collectPersonaPeople(teamResponses, personaId).names;
}

export function findMentionedPersona(text, presentMap) {
    const lowered = String(text).toLowerCase();
    for (const arch of ARCHETYPES) {
        if (!presentMap[arch.id]) continue;
        if (lowered.includes(arch.name.toLowerCase())) {
            return {
                id: arch.id,
                name: arch.name,
                names: presentMap[arch.id].names,
                anonymousCount: presentMap[arch.id].anonymousCount || 0,
                color: PERSONA_COLORS[arch.id] || ACCENT,
            };
        }
    }
    return null;
}

export function formatNames(names) {
    if (!names || names.length === 0) return '';
    if (names.length === 1) return names[0];
    if (names.length === 2) return `${names[0]} en ${names[1]}`;
    return `${names.slice(0, -1).join(', ')} en ${names[names.length - 1]}`;
}

/**
 * Formatteer namen + eventuele anonieme respondenten.
 *   - 0 namen, 1 anoniem  → "Anoniem"
 *   - 0 namen, 3 anoniem  → "3 anoniem"
 *   - 2 namen, 0 anoniem  → "Maria en Doris"
 *   - 2 namen, 1 anoniem  → "Maria, Doris en 1 anoniem"
 *   - 1 naam, 2 anoniem   → "Maria en 2 anoniem"
 */
export function formatPeople(names, anonymousCount = 0) {
    const parts = [...(names || [])];
    if (anonymousCount > 0) {
        parts.push(anonymousCount === 1 ? 'anoniem' : `${anonymousCount} anoniem`);
    }
    if (parts.length === 0) return '';
    if (parts.length === 1) {
        // Speciaal geval: alleen "anoniem" → hoofdletter
        return parts[0] === 'anoniem' ? 'Anoniem' : parts[0];
    }
    if (parts.length === 2) return `${parts[0]} en ${parts[1]}`;
    return `${parts.slice(0, -1).join(', ')} en ${parts[parts.length - 1]}`;
}

// =========================
// DYNAMICS-AS UITLEG — uitgeschreven per richting
// =========================
// Geeft per as een uitgeschreven leeszin afhankelijk van richting & disbalans.
// axis.label is typisch "Creatie vs Structuur" — we matchen op label.

export function describeAxis(axis) {
    const total = axis.lv + axis.rv;
    if (total === 0) return axis.desc || '';

    const lPct = Math.round((axis.lv / total) * 100);
    const rPct = 100 - lPct;
    const balanced = Math.abs(lPct - rPct) <= 20;

    const left = (axis.left || '').trim();
    const right = (axis.right || '').trim();
    const dominant = lPct >= rPct ? left : right;
    const recessive = lPct >= rPct ? right : left;

    if (balanced) {
        return `${left} en ${right.toLowerCase()} zijn in dit team in balans. Dat is een rijp patroon — maar alleen als beide kanten ook bewust de ruimte krijgen in overleg en besluitvorming.`;
    }

    return `${dominant} weegt zwaarder dan ${recessive.toLowerCase()} in dit team. Dat geeft beweging en richting, maar ook het risico dat ${recessive.toLowerCase()} sluipenderwijs verdwijnt uit gesprekken en keuzes — terwijl dat juist nodig is om het patroon vol te houden.`;
}

// =========================
// MAIN COMPONENT
// =========================

