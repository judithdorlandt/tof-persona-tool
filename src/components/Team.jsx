import { ARCHETYPES } from '../data';
import { hasFullTeamAccess, isMakerAccess } from '../utils/access';
import {
    PageShell,
    PrimaryButton,
    SecondaryButton,
    SectionEyebrow,
} from '../ui/AppShell';

const COLOR_MAP = {
    maker: '#B05252',
    groeier: '#C28D6B',
    presteerder: '#C7A24A',
    denker: '#6F7F92',
    verbinder: '#7F9A8A',
    teamspeler: '#8B7F9A',
    zekerzoeker: '#7D8A6B',
    vernieuwer: '#D08C5B',
};

const WORKPLACE_COLORS = {
    focus: '#6F7F92',
    work: '#A8A29B',
    hybride: '#B8A48B',
    meeting: '#7F9A8A',
    project: '#D08C5B',
    team: '#8B7F9A',
    learning: '#C28D6B',
    retreat: '#7D8A6B',
    social: '#B05252',
};

const WORKPLACE_LABELS = {
    focus: 'Concentratieplekken',
    work: 'Standaard werkplekken',
    hybride: 'Hybride plekken',
    meeting: 'Overlegplekken',
    project: 'Creatieve plekken',
    team: 'Samenwerkplekken',
    learning: 'Leerplekken',
    retreat: 'Rustplekken',
    social: 'Informele plekken',
};

export default function Team({ resultData, setPage }) {
    const hasAccess = hasFullTeamAccess() || isMakerAccess();

    if (!hasAccess) {
        return (
            <PageShell padding="20px 16px 32px">
                <TeamCard>
                    <SectionEyebrow>Team dashboard</SectionEyebrow>

                    <h1
                        style={{
                            margin: 0,
                            fontFamily: 'var(--tof-font-heading)',
                            fontSize: 'clamp(32px, 4.8vw, 48px)',
                            lineHeight: 1.04,
                            color: 'var(--tof-text)',
                        }}
                    >
                        🔒 Toegang vereist
                    </h1>

                    <p
                        style={{
                            margin: 0,
                            maxWidth: 720,
                            color: 'var(--tof-text-soft)',
                            lineHeight: 1.7,
                            fontSize: 15,
                        }}
                    >
                        Deze omgeving is alleen beschikbaar met een geldige toegangscode.
                    </p>

                    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                        <PrimaryButton onClick={() => setPage('teamintro')}>
                            Terug naar uitleg
                        </PrimaryButton>
                    </div>
                </TeamCard>
            </PageShell>
        );
    }

    if (!resultData) {
        return (
            <PageShell padding="24px 20px 36px">
                <TeamCard>
                    <h2
                        style={{
                            marginTop: 0,
                            marginBottom: 12,
                            fontFamily: 'var(--tof-font-heading)',
                            color: 'var(--tof-text)',
                        }}
                    >
                        Geen teamdata beschikbaar
                    </h2>

                    <p
                        style={{
                            margin: 0,
                            color: 'var(--tof-text-soft)',
                            lineHeight: 1.7,
                        }}
                    >
                        Er is nog geen teamselectie geladen. Ga eerst via de teamomgeving naar de juiste dataset.
                    </p>

                    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 12 }}>
                        <PrimaryButton onClick={() => setPage('teamselector')}>
                            Naar teamselector
                        </PrimaryButton>

                        <SecondaryButton onClick={() => setPage('teamintro')}>
                            Terug
                        </SecondaryButton>
                    </div>
                </TeamCard>
            </PageShell>
        );
    }

    const scores = resultData?.scores || {};
    const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
    const total = Object.values(scores).reduce((a, b) => a + b, 0);

    const getArchetype = (id) => ARCHETYPES.find((a) => a.id === id);

    const workplaceTotals = {
        focus: 0,
        work: 0,
        hybride: 0,
        meeting: 0,
        project: 0,
        team: 0,
        learning: 0,
        retreat: 0,
        social: 0,
    };

    sorted.forEach(([id, value]) => {
        const persona = getArchetype(id);
        const profile = persona?.bricksProfile;

        if (!profile) return;

        Object.keys(workplaceTotals).forEach((key) => {
            workplaceTotals[key] += (profile[key] || 0) * value;
        });
    });

    const workplaceEntries = Object.entries(workplaceTotals).sort((a, b) => b[1] - a[1]);
    const workplaceTotal = Object.values(workplaceTotals).reduce((sum, value) => sum + value, 0);

    const workplaceSummary = workplaceEntries
        .map(([key, value]) => ({
            key,
            label: WORKPLACE_LABELS[key],
            value,
            percentage: workplaceTotal > 0 ? Math.round((value / workplaceTotal) * 100) : 0,
            color: WORKPLACE_COLORS[key],
        }))
        .filter((item) => item.value > 0);

    const topWorkplace = workplaceSummary[0];
    const secondWorkplace = workplaceSummary[1];

    let workplaceInsight =
        'Deze mix vraagt om een gebalanceerde werkomgeving met ruimte voor focus, samenwerking en afwisseling.';

    if (topWorkplace && secondWorkplace) {
        if (topWorkplace.key === 'focus' && secondWorkplace.key === 'retreat') {
            workplaceInsight =
                'Dit team vraagt vooral om focus- en rustplekken. Denk aan stille werkzones, duidelijke concentratieplekken en plekken waar prikkels laag blijven.';
        } else if (topWorkplace.key === 'project' && secondWorkplace.key === 'focus') {
            workplaceInsight =
                'Dit team vraagt vooral om projectplekken gecombineerd met focusruimte. Denk aan maakplekken, projecttafels en zones waar ideeën ook direct uitgewerkt kunnen worden.';
        } else if (topWorkplace.key === 'meeting' && secondWorkplace.key === 'social') {
            workplaceInsight =
                'Dit team vraagt vooral om overleg- en ontmoetingsplekken. Denk aan open samenwerkzones, informele overlegruimte en plekken waar afstemming vanzelf ontstaat.';
        } else if (topWorkplace.key === 'social' && secondWorkplace.key === 'meeting') {
            workplaceInsight =
                'Deze mix laat zien dat ontmoeting en verbinding belangrijk zijn. Informele settings, koffieplekken en laagdrempelige overlegzones ondersteunen dit team het best.';
        } else if (topWorkplace.key === 'focus' && secondWorkplace.key === 'project') {
            workplaceInsight =
                'Deze mix vraagt om een combinatie van concentratie en maakruimte. Niet alleen stilte, maar ook plekken waar gericht samengewerkt en ontwikkeld kan worden.';
        } else {
            workplaceInsight = `Dit team vraagt vooral om ${topWorkplace.label.toLowerCase()} en ${secondWorkplace.label.toLowerCase()}. De werkplek moet dus niet één type gedrag ondersteunen, maar juist een slimme mix bieden.`;
        }
    }

    const topThree = sorted.slice(0, 3).map(([id]) => getArchetype(id));
    const bottomTwo = sorted.slice(-2).map(([id]) => getArchetype(id));

    const topIds = topThree.map((item) => item?.id);
    const bottomIds = bottomTwo.map((item) => item?.id);

    const hasStructure = topIds.includes('zekerzoeker') || topIds.includes('denker');
    const hasSpeed = topIds.includes('presteerder');
    const hasConnection = topIds.includes('verbinder') || topIds.includes('teamspeler');
    const hasCreation = topIds.includes('maker') || topIds.includes('vernieuwer');
    const hasGrowth = topIds.includes('groeier');

    let diagnosisTitle = 'Wat valt direct op in jouw team?';
    let diagnosisItems = [
        'De dominante werkstijlen bepalen zichtbaar het ritme van dit team.',
        'Wat sterk vertegenwoordigd is, krijgt vanzelf ruimte en aandacht.',
        'Wat lager scoort, vraagt vaak bewust leiderschap en inrichting.',
    ];

    if (hasStructure && hasCreation) {
        diagnosisItems = [
            'Er zit zowel behoefte aan vernieuwing als aan houvast in dit team.',
            'Dat kan heel krachtig zijn, zolang ruimte en structuur bewust in balans blijven.',
            'Zonder die balans ontstaat snel frictie tussen tempo maken en eerst willen afstemmen.',
        ];
    } else if (hasSpeed && hasConnection) {
        diagnosisItems = [
            'Dit team heeft zowel resultaatkracht als relationele gevoeligheid.',
            'Dat is sterk, maar kan schuren wanneer tempo belangrijker wordt dan afstemming.',
            'Leiderschap moet hier niet kiezen tussen mens of resultaat, maar beide verbinden.',
        ];
    } else if (hasCreation && hasGrowth) {
        diagnosisItems = [
            'In dit team zit veel beweging, ontwikkeling en initiatief.',
            'Dat geeft energie en vernieuwing, maar vraagt ook om richting en afronding.',
            'Zonder duidelijke kaders kan dit team versnipperen in ideeën en experimenten.',
        ];
    } else if (hasStructure) {
        diagnosisItems = [
            'In dit team is behoefte aan kwaliteit, duidelijkheid en voorspelbaarheid zichtbaar.',
            'Dat zorgt voor betrouwbaarheid, maar kan verandering ook vertragen.',
            'Heldere kaders werken hier versterkend — zolang ze niet te strak worden.',
        ];
    }

    let riskTitle = 'Waar het mis kan gaan';
    let riskText =
        'Wanneer dominante werkstijlen te veel ruimte krijgen en tegenkrachten ontbreken, ontstaan vaak blinde vlekken in tempo, samenwerking of besluitvorming.';

    if (topIds.includes('zekerzoeker') && bottomIds.includes('vernieuwer')) {
        riskText =
            'In dit team zit relatief veel behoefte aan duidelijkheid en voorspelbaarheid, terwijl vernieuwing minder vanzelfsprekend lijkt. Daardoor kunnen nieuwe ideeën te langzaam landen of te snel als onrust worden ervaren.';
    } else if (topIds.includes('maker') && bottomIds.includes('zekerzoeker')) {
        riskText =
            'In dit team zit veel initiatief en creatiekracht, maar minder natuurlijke behoefte aan structuur. Daardoor kan veel ontstaan, zonder dat het stevig genoeg landt in afspraken, rollen en uitvoering.';
    } else if (topIds.includes('presteerder') && bottomIds.includes('verbinder')) {
        riskText =
            'Dit team heeft een sterke focus op resultaat en voortgang, maar minder natuurlijke tegenkracht op verbinding. Daardoor kan output goed gaan, terwijl samenwerking of onderlinge veiligheid onder druk komt te staan.';
    } else if (topIds.includes('verbinder') && bottomIds.includes('presteerder')) {
        riskText =
            'In dit team is verbinding belangrijk, maar resultaatdruk wordt minder vanzelf gedragen. Daardoor kan veel afgestemd worden, zonder dat scherpte op voortgang of besluitvorming voldoende aanwezig is.';
    } else if (topIds.includes('denker') && bottomIds.includes('maker')) {
        riskText =
            'In dit team is analyse en zorgvuldigheid sterk aanwezig, maar doen en experimenteren minder. Daardoor kan kwaliteit hoog zijn, terwijl beweging en concreet maken te langzaam op gang komen.';
    }

    let actionTitle = 'Wat helpt dit team morgen al?';
    let actionItems = [
        'Maak expliciet waar ruimte nodig is — en waar juist duidelijkheid nodig is.',
        'Bespreek welke werkstijlen veel ruimte krijgen en welke minder gehoord worden.',
        'Gebruik werkplek, ritme en leiderschap bewuster als stuurmiddel.',
    ];

    if (topIds.includes('maker') || topIds.includes('vernieuwer')) {
        actionItems = [
            'Maak onderscheid tussen ruimte voor ideeën en momenten van besluitvorming.',
            'Bouw ritme in voor afronding, zodat creatie ook landt in resultaat.',
            'Zorg voor werkplekken met zowel projectruimte als focus.',
        ];
    }

    if (topIds.includes('zekerzoeker') || topIds.includes('denker')) {
        actionItems = [
            'Maak rollen, verwachtingen en besluitmomenten expliciet.',
            'Zorg voor rust, overzicht en informatie op tijd.',
            'Creëer daarnaast bewust ruimte voor vernieuwing, zodat het team niet te gesloten wordt.',
        ];
    }

    if (topIds.includes('presteerder')) {
        actionItems = [
            'Maak voortgang zichtbaar, maar bewaak ook de relationele kant van samenwerking.',
            'Laat niet alles door snelheid bepalen; sommige vragen hebben verdieping nodig.',
            'Combineer resultaatsturing met momenten van reflectie en afstemming.',
        ];
    }

    if (topIds.includes('verbinder') || topIds.includes('teamspeler')) {
        actionItems = [
            'Maak samenwerking en teamritme expliciet onderdeel van het werk.',
            'Gebruik ontmoeting niet als bijzaak, maar als voorwaarde voor goed functioneren.',
            'Zorg dat ook resultaat en besluitvorming voldoende scherp blijven.',
        ];
    }

    return (
        <PageShell padding="20px 16px 32px">
            <TeamCard>
                <div>
                    <SectionEyebrow>Team dashboard</SectionEyebrow>

                    <h1
                        style={{
                            margin: 0,
                            fontFamily: 'var(--tof-font-heading)',
                            fontSize: 'clamp(32px, 4.8vw, 48px)',
                            lineHeight: 1.04,
                            color: 'var(--tof-text)',
                        }}
                    >
                        Zo ziet jouw team eruit
                    </h1>

                    <p
                        style={{
                            marginTop: 14,
                            marginBottom: 0,
                            maxWidth: 720,
                            color: 'var(--tof-text-soft)',
                            lineHeight: 1.7,
                            fontSize: 15,
                        }}
                    >
                        Niet alleen wie er in een team zit, maar ook waar energie ontstaat,
                        waar het schuurt en wat dat vraagt van samenwerking, leiderschap en werkplek.
                    </p>

                    <div
                        style={{
                            marginTop: 12,
                            display: 'flex',
                            gap: 10,
                            flexWrap: 'wrap',
                        }}
                    >
                        <InfoBadge>👥 {resultData?.member_count || 0} ingevuld</InfoBadge>

                        {resultData?.estimated_team_size ? (
                            <InfoBadge>📊 ca. {resultData.estimated_team_size} in team</InfoBadge>
                        ) : null}

                        {typeof resultData?.participation_rate === 'number' ? (
                            <InfoBadge>✅ {resultData.participation_rate}% deelname</InfoBadge>
                        ) : null}

                        {isMakerAccess() ? <InfoBadge>🛠 Maker mode</InfoBadge> : null}
                    </div>

                    <div
                        style={{
                            marginTop: 10,
                            background: 'var(--tof-surface-soft)',
                            borderRadius: 12,
                            padding: '12px 14px',
                            fontSize: 14,
                            lineHeight: 1.65,
                            color: 'var(--tof-text-soft)',
                            maxWidth: 760,
                        }}
                    >
                        {getParticipationInsight(resultData)}
                    </div>

                    <div style={{ marginTop: 16 }}>
                        <div
                            style={{
                                background: 'var(--tof-surface-soft)',
                                borderRadius: 12,
                                padding: '14px 18px',
                                border: '1px solid var(--tof-border)',
                                fontSize: 12,
                                color: 'var(--tof-text-muted)',
                            }}
                        >
                            <strong style={{ color: 'var(--tof-text)' }}>PRO tip:</strong>{' '}
                            {getProTip(resultData?.member_count || 0)}
                        </div>
                    </div>
                </div>
            </TeamCard>

            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                    gap: 16,
                    alignItems: 'stretch',
                }}
            >
                <TeamCard title="Verdeling in je team">
                    <div style={{ display: 'grid', gap: 12 }}>
                        {sorted.map(([id, value]) => {
                            const persona = getArchetype(id);
                            const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
                            const color = COLOR_MAP[id] || '#B05252';

                            return (
                                <div key={id}>
                                    <div
                                        style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            marginBottom: 5,
                                            color: 'var(--tof-text)',
                                            fontSize: 14,
                                        }}
                                    >
                                        <span>{persona?.name}</span>
                                        <span>{percentage}%</span>
                                    </div>

                                    <div
                                        style={{
                                            height: 10,
                                            background: '#DDD7CF',
                                            borderRadius: 999,
                                            overflow: 'hidden',
                                        }}
                                    >
                                        <div
                                            style={{
                                                width: `${percentage}%`,
                                                background: color,
                                                height: '100%',
                                                borderRadius: 999,
                                            }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </TeamCard>

                <TeamCard title="Werkplekbehoefte in je team">
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: '140px 1fr',
                            gap: 18,
                            alignItems: 'center',
                        }}
                    >
                        <WorkplacePieChart data={workplaceSummary} />

                        <div style={{ display: 'grid', gap: 10 }}>
                            {workplaceSummary.map((item) => (
                                <div
                                    key={item.key}
                                    style={{
                                        display: 'grid',
                                        gridTemplateColumns: '14px 1fr auto',
                                        gap: 10,
                                        alignItems: 'center',
                                        fontSize: 14,
                                        color: 'var(--tof-text-soft)',
                                    }}
                                >
                                    <div
                                        style={{
                                            width: 12,
                                            height: 12,
                                            borderRadius: 999,
                                            background: item.color,
                                        }}
                                    />
                                    <span>{item.label}</span>
                                    <strong style={{ color: 'var(--tof-text)' }}>{item.percentage}%</strong>
                                </div>
                            ))}

                            <p
                                style={{
                                    margin: '6px 0 0 0',
                                    fontSize: 14,
                                    lineHeight: 1.65,
                                    color: 'var(--tof-text-soft)',
                                }}
                            >
                                Dit laat zien welk type werkplekken jouw team het meest nodig heeft vanuit de mix van persona’s.
                            </p>

                            <p
                                style={{
                                    margin: '2px 0 0 0',
                                    fontSize: 14,
                                    lineHeight: 1.65,
                                    color: 'var(--tof-text-soft)',
                                }}
                            >
                                {workplaceInsight}
                            </p>

                            <div
                                style={{
                                    marginTop: 8,
                                    background: 'var(--tof-surface-soft)',
                                    borderLeft: '4px solid var(--tof-accent-rose)',
                                    borderRadius: 12,
                                    padding: '12px 14px',
                                    fontSize: 14,
                                    lineHeight: 1.65,
                                    color: 'var(--tof-text-soft)',
                                }}
                            >
                                <strong style={{ color: 'var(--tof-text)' }}>Dit is een eerste indicatie.</strong>
                                <br />
                                In een teamsessie maken we dit concreet in keuzes voor werkplek, samenwerking en leiderschap.
                            </div>
                        </div>
                    </div>
                </TeamCard>
            </div>

            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                    gap: 16,
                    alignItems: 'stretch',
                }}
            >
                <TeamCard title={diagnosisTitle}>
                    <ul
                        style={{
                            lineHeight: 1.85,
                            margin: 0,
                            paddingLeft: 20,
                            color: 'var(--tof-text-soft)',
                            fontSize: 14,
                        }}
                    >
                        {diagnosisItems.map((item) => (
                            <li key={item}>{item}</li>
                        ))}
                    </ul>
                </TeamCard>

                <TeamCard title={riskTitle}>
                    <p
                        style={{
                            margin: 0,
                            lineHeight: 1.75,
                            color: 'var(--tof-text-soft)',
                            fontSize: 14,
                        }}
                    >
                        {riskText}
                    </p>
                </TeamCard>
            </div>

            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                    gap: 16,
                    alignItems: 'stretch',
                }}
            >
                <TeamCard title={actionTitle}>
                    <ul
                        style={{
                            lineHeight: 1.85,
                            margin: 0,
                            paddingLeft: 20,
                            color: 'var(--tof-text-soft)',
                            fontSize: 14,
                        }}
                    >
                        {actionItems.map((item) => (
                            <li key={item}>{item}</li>
                        ))}
                    </ul>
                </TeamCard>

                <div
                    style={{
                        background: 'var(--tof-surface-soft)',
                        borderRadius: 16,
                        padding: 20,
                        borderTop: '4px solid var(--tof-accent-rose)',
                        border: '1px solid var(--tof-border)',
                        boxShadow: 'var(--tof-shadow)',
                        display: 'grid',
                        gap: 12,
                        alignContent: 'start',
                    }}
                >
                    <div
                        style={{
                            fontSize: 11,
                            letterSpacing: 1.6,
                            textTransform: 'uppercase',
                            color: 'var(--tof-text-muted)',
                            fontWeight: 700,
                        }}
                    >
                        Wat je hier nog niet ziet
                    </div>

                    <h2
                        style={{
                            margin: 0,
                            fontFamily: 'var(--tof-font-heading)',
                            fontSize: 24,
                            lineHeight: 1.08,
                            color: 'var(--tof-text)',
                        }}
                    >
                        Dit is nog maar
                        <br />
                        de helft van het verhaal.
                    </h2>

                    <p
                        style={{
                            margin: 0,
                            color: 'var(--tof-text-soft)',
                            lineHeight: 1.7,
                            fontSize: 14,
                        }}
                    >
                        Je ziet hier hoe werkstijlen verdeeld zijn en waar spanning kan ontstaan.
                        Maar nog niet wat er écht gebeurt in samenwerking, besluitvorming en teamritme.
                    </p>

                    <ul
                        style={{
                            margin: 0,
                            paddingLeft: 20,
                            lineHeight: 1.85,
                            color: 'var(--tof-text-soft)',
                            fontSize: 14,
                        }}
                    >
                        <li>Waar gesprekken vastlopen</li>
                        <li>Waarom tempo en structuur botsen</li>
                        <li>Wat dit vraagt van leiderschap en werkplek</li>
                    </ul>

                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 4 }}>
                        <PrimaryButton
                            onClick={() =>
                                window.open('https://www.tof.services', '_blank', 'noopener,noreferrer')
                            }
                        >
                            Plan een teamsessie →
                        </PrimaryButton>

                        <SecondaryButton onClick={() => setPage('teamselector')}>
                            Terug
                        </SecondaryButton>
                    </div>
                </div>
            </div>
        </PageShell>
    );
}

function TeamCard({ title, children }) {
    return (
        <div
            style={{
                background: 'var(--tof-surface)',
                borderRadius: 16,
                padding: 20,
                borderTop: '4px solid var(--tof-accent-sage)',
                border: '1px solid var(--tof-border)',
                boxShadow: 'var(--tof-shadow)',
                display: 'grid',
                gap: 12,
                alignContent: 'start',
            }}
        >
            {title ? (
                <h2
                    style={{
                        margin: 0,
                        fontFamily: 'var(--tof-font-heading)',
                        fontSize: 24,
                        lineHeight: 1.08,
                        color: 'var(--tof-text)',
                    }}
                >
                    {title}
                </h2>
            ) : null}

            {children}
        </div>
    );
}

function WorkplacePieChart({ data }) {
    const size = 140;
    const strokeWidth = 26;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;

    let cumulative = 0;

    return (
        <div
            style={{
                width: size,
                height: size,
                display: 'grid',
                placeItems: 'center',
                position: 'relative',
            }}
        >
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        fill="none"
                        stroke="#E6DDD2"
                        strokeWidth={strokeWidth}
                    />

                    {data.map((item) => {
                        const fraction = item.percentage / 100;
                        const dash = fraction * circumference;
                        const gap = circumference - dash;
                        const offset = -cumulative * circumference;
                        cumulative += fraction;

                        return (
                            <circle
                                key={item.key}
                                cx={size / 2}
                                cy={size / 2}
                                r={radius}
                                fill="none"
                                stroke={item.color}
                                strokeWidth={strokeWidth}
                                strokeDasharray={`${dash} ${gap}`}
                                strokeDashoffset={offset}
                                strokeLinecap="butt"
                            />
                        );
                    })}
                </g>
            </svg>

            <div
                style={{
                    position: 'absolute',
                    textAlign: 'center',
                    pointerEvents: 'none',
                }}
            >
                <div
                    style={{
                        fontSize: 11,
                        letterSpacing: 1.2,
                        textTransform: 'uppercase',
                        color: 'var(--tof-text-muted)',
                    }}
                >
                    Werkplek
                    <br /> mix
                </div>
            </div>
        </div>
    );
}

function InfoBadge({ children }) {
    return (
        <div
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                background: 'var(--tof-rose-soft)',
                border: '1px solid rgba(176,82,82,0.12)',
                borderRadius: 999,
                padding: '6px 12px',
                fontSize: 12,
                color: 'var(--tof-text-muted)',
            }}
        >
            <span>{children}</span>
        </div>
    );
}

function getParticipationInsight(resultData) {
    const memberCount = resultData?.member_count || 0;
    const estimatedTeamSize = resultData?.estimated_team_size || null;
    const participationRate = resultData?.participation_rate;

    if (!estimatedTeamSize || typeof participationRate !== 'number') {
        return `Dit dashboard is gebaseerd op ${memberCount} ingevulde profiel${memberCount === 1 ? '' : 'en'}. De totale teamgrootte is nog niet scherp genoeg om de deelname exact te duiden.`;
    }

    if (participationRate < 40) {
        return `Dit dashboard is gebaseerd op ${memberCount} van ongeveer ${estimatedTeamSize} teamleden. Het geeft een eerste beeld, maar waarschijnlijk nog geen volledig teambeeld.`;
    }

    if (participationRate < 70) {
        return `Dit dashboard is gebaseerd op ${memberCount} van ongeveer ${estimatedTeamSize} teamleden. Het beeld is bruikbaar, maar kan nog scherper worden als meer collega’s invullen.`;
    }

    return `Dit dashboard is gebaseerd op ${memberCount} van ongeveer ${estimatedTeamSize} teamleden. Dat geeft een stevig en bruikbaar beeld van de teamdynamiek.`;
}

function getProTip(count) {
    if (count < 3) {
        return 'Er zijn nog te weinig responses voor een betrouwbaar beeld. Nodig meer teamleden uit.';
    }
    if (count < 6) {
        return 'Je ziet eerste patronen. Met meer responses wordt dit beeld sterker en betrouwbaarder.';
    }
    return 'Sterk teambeeld. Je kunt nu echt sturen op samenwerking en werkplekkeuzes.';
}