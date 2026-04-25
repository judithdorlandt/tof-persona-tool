// =========================
// TEAM INSIGHTS — MODULE 1 (werkplek-gericht)
// =========================
// Levert:
//   headline         — wat dit team van de werkplek vraagt (één zin)
//   workplaceTension — waar team behoefte en werkplekaanbod mismatchen
//                       { underserved: [...], oversupplied: [...] }
//   quickWins        — 4 werkplek-gerichte acties
//   highlights       — compat
//   energy           — bewaard voor Module 2
//   friction         — bewaard voor Module 2
//   usage            — bewaard voor Module 2

import { ARCHETYPES } from '../data';

const WORKPLACE_PRESENT_PCT = 15;

// Persona scoort >= deze waarde op een werkplek → die persona heeft hoge behoefte
const PERSONA_NEED_THRESHOLD = 3;

// =========================
// PUBLIC API
// =========================
export function buildTeamInsights(aggregate) {
    const top = aggregate?.sortedPersonas?.[0];
    const second = aggregate?.sortedPersonas?.[1];
    const topNeed = aggregate?.sortedWorkplaceNeeds?.[0];
    const secondNeed = aggregate?.sortedWorkplaceNeeds?.[1];
    const teamCount = aggregate?.teamCount || 0;

    return {
        headline: buildHeadline(aggregate),
        workplaceTension: buildWorkplaceTension(aggregate),
        quickWins: buildWorkplaceQuickWins(aggregate),
        highlights: buildHighlights(top, second, topNeed, secondNeed),

        // Voor Module 2
        energy: buildEnergy(aggregate),
        friction: buildPersonaFriction(aggregate),
        usage: buildUsage(aggregate),

        meta: { teamCount, top, second, topNeed, secondNeed },
    };
}

// =========================
// HEADLINE
// =========================
function buildHeadline(aggregate) {
    const needs = (aggregate?.sortedWorkplaceNeeds || []).filter(
        (n) => n.percentage >= WORKPLACE_PRESENT_PCT
    );
    const teamCount = aggregate?.teamCount || 0;

    if (teamCount === 0) {
        return 'Nog geen werkplekbehoefte zichtbaar — wacht tot meer teamleden hebben ingevuld.';
    }

    if (needs.length >= 2) {
        return `Dit team vraagt vooral om ${needs[0].label.toLowerCase()} en ${needs[1].label.toLowerCase()}.`;
    }

    if (needs.length === 1) {
        return `Dit team vraagt vooral om ${needs[0].label.toLowerCase()}.`;
    }

    return 'Dit team heeft een gemengde werkplekbehoefte — geen enkele categorie springt er duidelijk uit.';
}

// =========================
// WORKPLACE TENSION — onderbediend + overdosis
// =========================
function buildWorkplaceTension(aggregate) {
    const needs = aggregate?.sortedWorkplaceNeeds || [];
    const members = aggregate?.members || [];
    const presentPersonaIds = new Set(
        (aggregate?.sortedPersonas || [])
            .filter((p) => p.count > 0)
            .map((p) => p.id)
    );

    if (needs.length === 0) {
        return { underserved: [], oversupplied: [], impactSummary: null };
    }

    // Gemiddelde als scheidslijn (gelijk aan TeamWorkplaceNeeds)
    const averagePct = 100 / needs.length;

    const underserved = [];
    const oversupplied = [];

    needs.forEach((need) => {
        const impacted = impactedPersonas(need.key, presentPersonaIds);
        const names = impactedNames(need.key, members);

        // Onderbediend: bovengemiddelde behoefte
        if (need.percentage >= averagePct && impacted.length > 0) {
            underserved.push({
                key: need.key,
                label: need.label,
                percentage: need.percentage,
                impactedPersonas: impacted,
                impactedNames: names,
                message: buildUnderservedMessage(need, impacted),
            });
        }

        // Overdosis: ondergemiddeld en relatief laag
        if (need.percentage < averagePct * 0.7) {
            oversupplied.push({
                key: need.key,
                label: need.label,
                percentage: need.percentage,
                message: buildOversuppliedMessage(need),
            });
        }
    });

    underserved.sort((a, b) => b.percentage - a.percentage);
    oversupplied.sort((a, b) => a.percentage - b.percentage);

    // ========================
    // IMPACT SUMMARY
    // ========================
    // Top 3 personas die het meest geraakt worden door alle onderbediende werkplekken samen.
    // Plus alle onderbediende werkplekken als check-vraag voor de manager.

    const impactSummary = buildImpactSummary({
        underserved,
        oversupplied,
        members,
        presentPersonaIds,
        needs,
        averagePct,
        aggregate,
    });

    return { underserved, oversupplied, impactSummary };
}

// Bouw drie groepen: Dominant / Gemiddeld / Minderheid
//
// Regels:
// - Dominant: top 2, OF top 1 als die ≥ 1.5× top-2 (solo-uitschieter)
// - Gemiddeld: middelste 4 (na dominant)
// - Minderheid: onderste 2, mits beide < 10%
//   - Als minderheid maar 1 persona is: ook minderheid (mits < 10%)
//   - Als 1 van de onderste 2 ≥ 10%: schuift naar gemiddeld
function buildImpactSummary({ underserved, oversupplied, members, presentPersonaIds, needs, averagePct, aggregate }) {
    if (presentPersonaIds.size === 0) {
        return null;
    }

    // Alle aanwezige persona's gesorteerd op team-percentage (hoog naar laag)
    const present = (aggregate?.sortedPersonas || [])
        .filter((p) => p.count > 0)
        .map((p) => {
            const teamPct =
                aggregate?.teamCount > 0
                    ? Math.round((p.count / aggregate.teamCount) * 100)
                    : 0;
            return { ...p, teamPct };
        });

    if (present.length === 0) return null;

    // Verzamel namen per persona
    const namesByPersona = {};
    present.forEach((p) => {
        namesByPersona[p.id] = members
            .filter((m) => m.primary === p.id)
            .map((m) => firstName(m.name))
            .filter((n) => n && n !== 'Onbekend')
            .filter((n, i, arr) => arr.indexOf(n) === i);
    });

    // Bouw persona-object met alle metadata
    const enrichPersona = (p, group) => {
        const arch = ARCHETYPES.find((a) => a.id === p.id);
        return {
            id: p.id,
            name: arch?.name || p.id,
            teamPct: p.teamPct,
            tensionMessage: PERSONA_TENSION[p.id] || `${arch?.name || p.id} verliest grip als de werkplek niet aansluit.`,
            names: namesByPersona[p.id] || [],
            group,
        };
    };

    // ======================
    // GROEPSINDELING
    // ======================
    let dominant = [];
    let middle = [];
    let minority = [];

    if (present.length === 1) {
        // Edge case: maar 1 persona aanwezig
        dominant = [present[0]];
    } else if (present.length === 2) {
        // 2 persona's: beide dominant
        dominant = present;
    } else {
        // 3+ persona's: pas regels toe
        const top1 = present[0];
        const top2 = present[1];

        // Solo-uitschieter? top-1 ≥ 1.5× top-2
        const soloDominant = top1.teamPct >= top2.teamPct * 1.5;

        if (soloDominant) {
            dominant = [top1];
        } else {
            dominant = [top1, top2];
        }

        // Rest na dominant
        const afterDominant = present.slice(dominant.length);

        // Onderste 2 (of 1) bekijken voor minderheid
        // Regel: alleen minderheid als alle bottom-N onder 10% zitten
        const tail = afterDominant.slice(-2);

        if (tail.length === 1) {
            // Slechts 1 over na dominant: dat is dan ook midden of minderheid
            if (tail[0].teamPct < 10) {
                minority = tail;
            } else {
                middle = tail;
            }
        } else if (tail.length === 2) {
            const bothUnder10 = tail.every((p) => p.teamPct < 10);
            if (bothUnder10) {
                minority = tail;
                middle = afterDominant.slice(0, -2);
            } else {
                // Niet alle onder 10% → alles wordt gemiddeld
                middle = afterDominant;
            }
        } else {
            middle = afterDominant;
        }
    }

    const dominantEnriched = dominant.map((p) => enrichPersona(p, 'dominant'));
    const middleEnriched = middle.map((p) => enrichPersona(p, 'middle'));
    const minorityEnriched = minority.map((p) => enrichPersona(p, 'minority'));

    // Werkplekken voor de check-regel
    const checkWorkplaces = needs
        .filter((n) => n.percentage >= averagePct)
        .map((n) => ({ label: n.label, percentage: n.percentage }));

    const uncheckWorkplaces = needs
        .filter((n) => n.percentage < averagePct * 0.7)
        .map((n) => ({ label: n.label, percentage: n.percentage }));

    return {
        dominant: dominantEnriched,
        middle: middleEnriched,
        minority: minorityEnriched,
        checkWorkplaces,
        uncheckWorkplaces,
    };
}

// Spanning-zinnen per persona (universeel — wat verliest deze persona als werkplek niet aansluit)
const PERSONA_TENSION = {
    maker: 'Maker komt niet in flow zonder aaneengesloten ruimte om te bouwen.',
    groeier: 'Groeier krijgt geen tijd om het werk te verteren en zich te ontwikkelen.',
    presteerder: 'Presteerder verliest grip op voortgang zonder zichtbaar werkritme.',
    denker: 'Denker vindt geen rust voor de analyse die zorgvuldigheid vraagt.',
    verbinder: 'Verbinder mist het vroege signaal als samenwerking schuurt.',
    teamspeler: 'Teamspeler verliest het gezamenlijke ritme dat het team draagt.',
    zekerzoeker: 'Zekerzoeker mist het houvast dat structuur en voorspelbaarheid biedt.',
    vernieuwer: 'Vernieuwer vindt geen sparringpartner om ideeën te scherpen.',
};

// Welke aanwezige persona's scoren hoog (>=3) op deze werkplek?
function impactedPersonas(workplaceKey, presentPersonaIds) {
    return ARCHETYPES
        .filter((arch) => presentPersonaIds.has(arch.id))
        .filter((arch) => {
            const score = arch?.bricksProfile?.[workplaceKey] || 0;
            return score >= PERSONA_NEED_THRESHOLD;
        })
        .map((arch) => ({
            id: arch.id,
            name: arch.name,
            score: arch.bricksProfile[workplaceKey],
        }));
}

// Voornamen van teamleden met primary die hoog scoort op deze werkplek
// Voornamen + persona van teamleden met primary die hoog scoort op deze werkplek.
// Returnt objects { name, personaId } zodat UI per naam de juiste kleur kan kiezen.
function impactedNames(workplaceKey, members) {
    const highScoringIds = ARCHETYPES
        .filter((arch) => (arch?.bricksProfile?.[workplaceKey] || 0) >= PERSONA_NEED_THRESHOLD)
        .map((arch) => arch.id);

    const seen = new Set();
    const result = [];

    members.forEach((m) => {
        if (!highScoringIds.includes(m.primary)) return;
        const fname = firstName(m.name);
        if (!fname || fname === 'Onbekend') return;
        if (seen.has(fname)) return;
        seen.add(fname);
        result.push({ name: fname, personaId: m.primary });
    });

    return result;
}

function firstName(fullName) {
    if (!fullName) return '';
    return String(fullName).trim().split(/\s+/)[0];
}

// Formatteer als natuurlijke zin: "X, Y en Z"
function formatNamesNatural(names) {
    if (names.length === 0) return '';
    if (names.length === 1) return names[0];
    if (names.length === 2) return `${names[0]} en ${names[1]}`;
    return `${names.slice(0, -1).join(', ')} en ${names[names.length - 1]}`;
}

function buildUnderservedMessage(need, impacted) {
    // Standalone spanningszinnen: spanning-gericht, niet persona-gericht.
    // De persona's worden in de UI als eyebrow getoond, dus de zin hoeft
    // niet meer met persona-namen te beginnen.
    const tension = {
        focus: 'Het team verliest concentratie in een open omgeving.',
        work: 'Er is geen vaste basis om rustig dagelijks werk te doen.',
        hybride: 'Online en fysiek werken loopt vast op slechte schakelmomenten.',
        meeting: 'Afstemming krijgt geen gestructureerde plek.',
        project: 'Werk in lagen kan niet visueel gemaakt worden.',
        team: 'Het werkbare contact valt weg in een te formele omgeving.',
        learning: 'Reflectie en leren krijgen geen ruimte om te ademen.',
        retreat: 'Er is geen plek om op te laden zonder afleiding.',
        social: 'Informele ontmoeting voedt het werk niet meer.',
    };

    return tension[need.key] || `Het team mist iets in ${need.label.toLowerCase()}.`;
}

function buildOversuppliedMessage(need) {
    const noise = {
        focus: 'Veel concentratieplekken die niemand echt nodig heeft worden een leeg eiland.',
        work: 'Een zee aan standaard werkplekken werkt niet — dit team doet ander soort werk.',
        hybride: 'Veel hybride faciliteiten die weinig gebruikt worden kosten meer dan ze opleveren.',
        meeting: 'Te veel overlegruimtes verleiden tot overleggen in plaats van werken.',
        project: 'Veel creatieve zones die leeg staan voelen als een verwijt.',
        team: 'Grote samenwerkplekken zonder vraag worden luidruchtige doorlooproutes.',
        learning: 'Ongebruikte leerplekken geven het signaal dat ontwikkeling "ergens anders" gebeurt.',
        retreat: 'Rustplekken die niemand zoekt worden rare lege hoeken.',
        social: 'Te veel ontmoetingsplekken versplinteren in plaats van verbinden.',
    };

    return (
        noise[need.key] ||
        `Veel ${need.label.toLowerCase()} zonder vraag kost energie zonder op te leveren.`
    );
}

// =========================
// QUICK WINS
// =========================
// =========================
// QUICK WINS — synthese van werkstijlen + werkplek + spanning + ontbrekend
// =========================
// Elke win is gekoppeld aan een eerder tabblad (source). Dat maakt de
// samenhang zichtbaar: dit komt direct uit wat de gebruiker net heeft gelezen.

function buildWorkplaceQuickWins(aggregate) {
    const wins = [];
    const needs = aggregate?.sortedWorkplaceNeeds || [];
    const personas = aggregate?.sortedPersonas || [];
    const topPersona = personas.find((p) => p.count > 0);
    const missingPersonas = personas.filter((p) => p.count === 0);
    const topNeed = needs[0];
    const tension = buildWorkplaceTension(aggregate);

    // WIN 1 — uit WERKSTIJLEN: de dominante persona vraagt iets specifieks
    if (topPersona) {
        const personaActions = {
            maker: `Plan blokken zonder vergaderingen. Makers maken iets af in stilte, niet in onderbrekingen.`,
            groeier: `Geef groeiers ruimte om het werk te verteren. Daar groeien ze, niet onder druk.`,
            presteerder: `Maak voortgang zichtbaar. Presteerders bloeien op duidelijke doelen en mijlpalen.`,
            denker: `Stuur stukken op tijd rond. Denkers willen voorbereid aan tafel komen.`,
            verbinder: `Maak ruimte voor informeel contact. Verbinders houden de samenwerking levend.`,
            teamspeler: `Geef het team gezamenlijke rituelen. Teamspelers gedijen op verbondenheid.`,
            zekerzoeker: `Communiceer veranderingen vroeg en consistent. Zekerzoekers leveren in voorspelbaarheid.`,
            vernieuwer: `Reserveer ruimte voor experiment. Vernieuwers verliezen energie als alles routine is.`,
        };
        const action = personaActions[topPersona.id];
        if (action) {
            wins.push({
                source: 'werkstijlen',
                action,
            });
        }
    }

    // WIN 2 — uit WERKPLEK: top behoefte krijgt een concrete inrichtingsactie
    if (topNeed) {
        const workplaceActions = {
            focus: `Maak een afgeschermde concentratiezone. Geen telefoongesprekken, geen meetings.`,
            work: `Investeer in rustige standaardplekken. Kwaliteit boven variatie.`,
            hybride: `Bouw één goede schakelruimte. Vaste camera, goede akoestiek, plug-and-play.`,
            meeting: `Splits overlegruimtes. Klein voor afstemming, groot voor verdieping.`,
            project: `Reserveer wand- en tafelruimte voor lopend werk. Dit team werkt visueel.`,
            team: `Maak een echte samenwerkplek. Geen vergaderzaal, maar een werkbare ontmoetingsplek.`,
            learning: `Zet een leerplek in waar nadenken mag duren. Niet elke plek hoeft productief te voelen.`,
            retreat: `Creëer een echte rustplek. Geen laptop-hoek, een echte adempauze.`,
            social: `Versterk de informele ontmoetingsplek. Niet als doorloopzone, maar als werkbare plek.`,
        };
        const action = workplaceActions[topNeed.key];
        if (action) {
            wins.push({
                source: 'werkplek',
                action,
            });
        }
    }

    // WIN 3 — uit SPANNING: onderbediende werkplek raakt specifieke mensen
    if (tension.underserved.length > 0) {
        const first = tension.underserved[0];
        const namesArr = (first.impactedNames || []).map((n) =>
            typeof n === 'string' ? n : n.name
        );
        const namesText = namesArr.length > 0
            ? namesArr.slice(0, 2).join(' en ')
            : 'het team';

        wins.push({
            source: 'spanning',
            action: `Bescherm ${first.label.toLowerCase()} voor ${namesText}. Daar zit de pijn als het kantoor het niet biedt.`,
        });
    } else if (tension.oversupplied.length > 0) {
        const first = tension.oversupplied[0];
        wins.push({
            source: 'spanning',
            action: `Zet ${first.label.toLowerCase()} anders in. Dit team gebruikt ze nauwelijks, dus het kost ruimte zonder waarde.`,
        });
    }

    // WIN 4 — uit MINDERHEID: voorkom isolatie
    // Alleen als er een minderheid is (uit impactSummary)
    const minority = tension?.impactSummary?.minority || [];
    if (minority.length > 0) {
        const personaNames = minority.map((p) => p.name);
        const personaText = formatNamesNatural(personaNames);
        const verb = minority.length === 1 ? 'zich geïsoleerd voelt' : 'zich geïsoleerd voelen';

        // Verzamel top-2 werkplekken op basis van bricks-score voor minderheid
        const workplaceScores = {};
        minority.forEach((p) => {
            const arch = ARCHETYPES.find((a) => a.id === p.id);
            if (!arch?.bricksProfile) return;
            Object.entries(arch.bricksProfile).forEach(([key, score]) => {
                workplaceScores[key] = (workplaceScores[key] || 0) + score;
            });
        });

        const topMinorityWorkplaces = Object.entries(workplaceScores)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 2)
            .map(([key]) => {
                const need = needs.find((n) => n.key === key);
                return need?.label || key;
            });

        const workplacesText = formatNamesNatural(topMinorityWorkplaces.map((w) => w.toLowerCase()));

        wins.push({
            source: 'minderheid',
            action: `Voorzie de werkomgeving ook van ${workplacesText}. Zo voorkom je dat de ${personaText} ${verb}.`,
        });
    }

    // WIN 5 — uit ONTBREKEND: strategische werving
    if (missingPersonas.length > 0) {
        const first = missingPersonas[0];
        const missingActions = {
            maker: `Werf een Maker. Ideeën blijven nu hangen in concepten.`,
            groeier: `Werf een Groeier. Het team mist nieuwsgierigheid om te leren.`,
            presteerder: `Werf een Presteerder. Het team mist scherpte om af te krijgen.`,
            denker: `Werf een Denker. Besluiten komen nu te snel zonder grondige toetsing.`,
            verbinder: `Werf een Verbinder. Het vroege signaal als samenwerking schuurt ontbreekt.`,
            teamspeler: `Werf een Teamspeler. Niemand bewaakt expliciet de groepsdynamiek.`,
            zekerzoeker: `Werf een Zekerzoeker. Het tegenwicht voor stabiliteit ontbreekt.`,
            vernieuwer: `Werf een Vernieuwer. De impuls om aanpakken los te laten ontbreekt.`,
        };
        const action = missingActions[first.id];
        if (action) {
            wins.push({
                source: 'ontbrekend',
                action,
            });
        }
    } else {
        // Als er geen ontbrekende persona is, een algemene reflectie-win
        wins.push({
            source: 'reflectie',
            action: `Vul de werkplekken aan die dit team mist. Geen verbouwing nodig — klein en zichtbaar werkt.`,
        });
    }

    return wins.slice(0, 5);
}

// =========================
// HIGHLIGHTS (compat)
// =========================
function buildHighlights(top, second, topNeed, secondNeed) {
    const out = [];
    if (top) {
        out.push(
            `${top.name} is de meest aanwezige werkstijl in dit team en zet waarschijnlijk de toon in tempo, voorkeuren en samenwerking.`
        );
    }
    if (top && second) {
        out.push(
            `De combinatie van ${top.name} en ${second.name} laat zien waar kracht én spanning kunnen ontstaan in afstemming, besluitvorming en ritme.`
        );
    }
    if (topNeed && secondNeed) {
        out.push(
            `De sterkste werkplekbehoefte ligt bij ${topNeed.label.toLowerCase()} en ${secondNeed.label.toLowerCase()}. Dat vraagt om bewuste keuzes in focus, overleg en samenwerking.`
        );
    }
    return out;
}

// =========================
// ENERGY & FRICTION — voor Module 2
// =========================
const DOMINANT_PCT = 30;

const TENSION_PAIRS = [
    { a: 'maker', b: 'denker', label: 'Tempo vs. reflectie', description: 'Makers willen vooruit, denkers willen eerst begrijpen. Beide nodig — zonder afstemming loopt het team vast of rent het de verkeerde kant op.' },
    { a: 'presteerder', b: 'verbinder', label: 'Resultaat vs. relatie', description: 'Presteerders sturen op wat af moet, verbinders op hoe het samen loopt. Zonder balans wordt het óf koud efficiënt óf warm traag.' },
    { a: 'vernieuwer', b: 'zekerzoeker', label: 'Vernieuwing vs. continuïteit', description: 'Vernieuwers zoeken het nieuwe, zekerzoekers beschermen wat werkt.' },
    { a: 'groeier', b: 'teamspeler', label: 'Ontwikkeling vs. stabiliteit', description: 'Groeiers willen leren en stretchen, teamspelers houden de groep draaiend.' },
];

function buildEnergy(aggregate) {
    const personas = (aggregate?.sortedPersonas || []).filter(
        (p) => p.count > 0 && p.percentage >= DOMINANT_PCT
    );

    if (personas.length === 0) {
        return (aggregate?.sortedPersonas || [])
            .filter((p) => p.count > 0)
            .slice(0, 2)
            .map((p) => ({
                persona: p.name,
                percentage: p.percentage,
                body: `${p.name} is aanwezig in het team (${p.percentage}%).`,
            }));
    }

    return personas.map((p) => ({
        persona: p.name,
        percentage: p.percentage,
        body: energyBodyFor(p),
    }));
}

function energyBodyFor(persona) {
    const map = {
        maker: 'Dit team maakt graag.',
        groeier: 'Dit team wil leren.',
        presteerder: 'Dit team levert.',
        denker: 'Dit team denkt grondig.',
        verbinder: 'Dit team zorgt voor relatie.',
        teamspeler: 'Dit team houdt elkaar vast.',
        zekerzoeker: 'Dit team bouwt op continuïteit.',
        vernieuwer: 'Dit team zoekt het nieuwe.',
    };
    return map[persona.id] || `${persona.name} zet de toon.`;
}

function buildPersonaFriction(aggregate) {
    const personas = aggregate?.sortedPersonas || [];
    const present = new Set(personas.filter((p) => p.count > 0).map((p) => p.id));
    const items = [];

    TENSION_PAIRS.forEach((pair) => {
        if (present.has(pair.a) && present.has(pair.b)) {
            const pA = personas.find((p) => p.id === pair.a);
            const pB = personas.find((p) => p.id === pair.b);
            items.push({
                type: 'tension',
                label: pair.label,
                body: pair.description,
                detail: `In dit team: ${pA.name} ${pA.percentage}% vs. ${pB.name} ${pB.percentage}%.`,
            });
        }
    });

    return items;
}

function buildUsage(aggregate) {
    const top = aggregate?.sortedPersonas?.[0];
    const topNeed = aggregate?.sortedWorkplaceNeeds?.[0];
    return [
        {
            situation: 'Voor een teamoverleg',
            title: 'Wat leg je op tafel?',
            items: top ? [`Het team wordt gedomineerd door ${top.name} (${top.percentage}%).`] : [],
        },
        {
            situation: 'Voor een werkplekbeslissing',
            title: 'Wat vraagt dit team van de ruimte?',
            items: topNeed ? [`${topNeed.label} is de sterkste behoefte.`] : [],
        },
    ];
}