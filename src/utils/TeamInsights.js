// =========================
// TEAM INSIGHTS — MODULE 1 (werkplek-gericht)
// =========================
// Levert:
//   headline         — wat dit team van de werkplek vraagt (één zin)
//   workplaceTension — waar team behoefte en werkplekaanbod mismatchen
//                       { underserved: [...], oversupplied: [...] }
//   quickWins        — werkplek-gerichte acties
//   highlights       — compat
//   energy           — bewaard voor Module 2 (op werkstijl-energie)
//   friction         — bewaard voor Module 2 (op werkstijl-energie)
//   usage            — bewaard voor Module 2
//
// Consistency-regel:
//   "Dominante persona" in meta + highlights = personasByPrimary[0].
//   Dat is dezelfde definitie die Tegel + Chip gebruiken in TeamDashboard.
//   Werkplek-spanning blijft gewogen op energie/full_scores — daar gaat
//   het om wat het hele profiel van de werkplek vraagt, niet wie er
//   primair zit.

import { ARCHETYPES } from '../data';

const WORKPLACE_PRESENT_PCT = 15;

// Persona scoort >= deze waarde op een werkplek → die persona heeft hoge behoefte
const PERSONA_NEED_THRESHOLD = 3;

// =========================
// PUBLIC API
// =========================
export function buildTeamInsights(aggregate) {
    // "Wie zit er primair" — voor headline + meta + highlights
    const topByPrimary = aggregate?.personasByPrimary?.[0] || null;
    const secondByPrimary = aggregate?.personasByPrimary?.[1] || null;

    // Werkstijl-energie — voor Module 2 dynamics
    const topByEnergy = aggregate?.sortedPersonas?.[0] || null;
    const secondByEnergy = aggregate?.sortedPersonas?.[1] || null;

    const topNeed = aggregate?.sortedWorkplaceNeeds?.[0];
    const secondNeed = aggregate?.sortedWorkplaceNeeds?.[1];
    const teamCount = aggregate?.teamCount || 0;

    return {
        headline: buildHeadline(aggregate),
        workplaceTension: buildWorkplaceTension(aggregate),
        quickWins: buildWorkplaceQuickWins(aggregate),
        highlights: buildHighlights(topByPrimary, secondByPrimary, topNeed, secondNeed),

        // Voor Module 2 — energie-basis
        energy: buildEnergy(aggregate),
        friction: buildPersonaFriction(aggregate),
        usage: buildUsage(aggregate),

        // Meta levert beide expliciet zodat downstream consumers (PDF, hero, etc.)
        // weten welke ze nodig hebben. "top" blijft op primair voor consistentie
        // met het dashboard.
        meta: {
            teamCount,
            top: topByPrimary,
            second: secondByPrimary,
            topByEnergy,
            secondByEnergy,
            topNeed,
            secondNeed,
        },
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
function buildImpactSummary({ underserved, oversupplied, members, presentPersonaIds, needs, averagePct, aggregate }) {
    if (presentPersonaIds.size === 0) {
        return null;
    }

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

    const namesByPersona = {};
    present.forEach((p) => {
        namesByPersona[p.id] = members
            .filter((m) => m.primary === p.id)
            .map((m) => firstName(m.name))
            .filter((n) => n && n !== 'Onbekend' && n !== 'Anoniem')
            .filter((n, i, arr) => arr.indexOf(n) === i);
    });

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

    let dominant = [];
    let middle = [];
    let minority = [];

    if (present.length === 1) {
        dominant = [present[0]];
    } else if (present.length === 2) {
        dominant = present;
    } else {
        const top1 = present[0];
        const top2 = present[1];
        const soloDominant = top1.teamPct >= top2.teamPct * 1.5;

        if (soloDominant) {
            dominant = [top1];
        } else {
            dominant = [top1, top2];
        }

        const afterDominant = present.slice(dominant.length);
        const tail = afterDominant.slice(-2);

        if (tail.length === 1) {
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
                middle = afterDominant;
            }
        } else {
            middle = afterDominant;
        }
    }

    const dominantEnriched = dominant.map((p) => enrichPersona(p, 'dominant'));
    const middleEnriched = middle.map((p) => enrichPersona(p, 'middle'));
    const minorityEnriched = minority.map((p) => enrichPersona(p, 'minority'));

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

function impactedNames(workplaceKey, members) {
    const highScoringIds = ARCHETYPES
        .filter((arch) => (arch?.bricksProfile?.[workplaceKey] || 0) >= PERSONA_NEED_THRESHOLD)
        .map((arch) => arch.id);

    const seen = new Set();
    const result = [];

    members.forEach((m) => {
        if (!highScoringIds.includes(m.primary)) return;
        const fname = firstName(m.name);
        if (!fname || fname === 'Onbekend' || fname === 'Anoniem') return;
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

function formatNamesNatural(names) {
    if (names.length === 0) return '';
    if (names.length === 1) return names[0];
    if (names.length === 2) return `${names[0]} en ${names[1]}`;
    return `${names.slice(0, -1).join(', ')} en ${names[names.length - 1]}`;
}

function buildUnderservedMessage(need, impacted) {
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
function buildWorkplaceQuickWins(aggregate) {
    const wins = [];
    const needs = aggregate?.sortedWorkplaceNeeds || [];

    // QuickWins gaan over "wie zit er in dit team" voor de werkstijl-actie,
    // zodat ze rijmen met het dashboard. Voor de werkstijl-actie kiezen we
    // de meest voorkomende primaire persona.
    const personasByPrimary = aggregate?.personasByPrimary || [];
    const topPersona = personasByPrimary[0] || null;

    // Ontbrekend op basis van strikte definitie uit aggregate
    const missingPersonas = aggregate?.missingPersonas || [];

    const topNeed = needs[0];
    const tension = buildWorkplaceTension(aggregate);

    // WIN 1 — uit WERKSTIJLEN: de dominante primaire persona vraagt iets
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
            wins.push({ source: 'werkstijlen', action });
        }
    }

    // WIN 2 — uit WERKPLEK
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
            wins.push({ source: 'werkplek', action });
        }
    }

    // WIN 3 — uit SPANNING
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

    // WIN 4 — uit MINDERHEID
    const minority = tension?.impactSummary?.minority || [];
    if (minority.length > 0) {
        const personaNames = minority.map((p) => p.name);
        const personaText = formatNamesNatural(personaNames);
        const verb = minority.length === 1 ? 'zich geïsoleerd voelt' : 'zich geïsoleerd voelen';

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

    // WIN 5+ — uit ONTBREKEND (strikte definitie uit aggregate)
    if (missingPersonas.length > 0) {
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

        missingPersonas.slice(0, 3).forEach((persona) => {
            const action = missingActions[persona.id];
            if (action) {
                wins.push({ source: 'ontbrekend', action });
            }
        });
    } else {
        wins.push({
            source: 'reflectie',
            action: `Vul de werkplekken aan die dit team mist. Geen verbouwing nodig — klein en zichtbaar werkt.`,
        });
    }

    return wins.slice(0, 7);
}

// =========================
// HIGHLIGHTS — gebaseerd op personasByPrimary (consistent met dashboard)
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
// ENERGY & FRICTION — voor Module 2 (energie-basis)
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
    // Bewust op personasByPrimary voor consistentie met dashboard
    const top = aggregate?.personasByPrimary?.[0]
        || aggregate?.sortedPersonas?.[0];
    const topNeed = aggregate?.sortedWorkplaceNeeds?.[0];
    const pct = top?.countPercentage ?? top?.percentage ?? 0;

    return [
        {
            situation: 'Voor een teamoverleg',
            title: 'Wat leg je op tafel?',
            items: top ? [`Het team wordt gedomineerd door ${top.name} (${pct}%).`] : [],
        },
        {
            situation: 'Voor een werkplekbeslissing',
            title: 'Wat vraagt dit team van de ruimte?',
            items: topNeed ? [`${topNeed.label} is de sterkste behoefte.`] : [],
        },
    ];
}