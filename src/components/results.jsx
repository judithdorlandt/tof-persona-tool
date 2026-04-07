import { useRef } from 'react';
import { ARCHETYPES } from '../data';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default function Results({ resultData }) {
    const cardRef = useRef(null);

    if (!resultData) {
        return (
            <div style={{ maxWidth: 1100, margin: '0 auto', padding: '80px 40px' }}>
                <div
                    style={{
                        background: 'white',
                        borderRadius: 20,
                        padding: 32,
                        border: '1px solid #e7e0d9',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
                    }}
                >
                    <h2
                        style={{
                            fontFamily: 'Playfair Display',
                            fontSize: 40,
                            marginTop: 0,
                            marginBottom: 12,
                        }}
                    >
                        Nog geen resultaat
                    </h2>

                    <p style={{ color: '#555', fontSize: 18, lineHeight: 1.6 }}>
                        Vul eerst de test in om jouw persona-profiel te zien.
                    </p>
                </div>
            </div>
        );
    }

    const getA = (id) => ARCHETYPES.find((a) => a.id === id);

    const primary = getA(resultData.primary);
    const secondary = getA(resultData.secondary);
    const tertiary = getA(resultData.tertiary);

    const colorMap = {
        maker: '#b85c5c',
        groeier: '#c28d6b',
        presteerder: '#c7a24a',
        denker: '#6f7f92',
        verbinder: '#7f9a8a',
        teamspeler: '#8b7f9a',
        zekerzoeker: '#7d8a6b',
        vernieuwer: '#d08c5b',
    };

    const coachMap = {
        maker: {
            bricks:
                'Geef ruimte voor vrijheid, afwisseling en plekken waar ideeën direct mogen ontstaan. Deze persona floreert niet in kaders, maar in beweging.',
            bytes:
                'Houd tools licht, intuïtief en flexibel. Alles wat te veel stappen, controle of vaste formats vraagt, haalt snelheid uit het maakproces.',
            behavior:
                'Werk met vertrouwen, autonomie en experimenteerruimte. Minder dichtregelen, meer mogelijk maken.',
        },
        groeier: {
            bricks:
                'Creëer een omgeving die ontwikkeling uitlokt: plekken om te leren, uit te wisselen en vooruit te bewegen. Stilstand voelt hier snel als verlies.',
            bytes:
                'Zorg voor feedback, zicht op voortgang en toegang tot nieuwe kennis en inspiratie. Deze persona wil voelen dat er iets groeit.',
            behavior:
                'Stimuleer ontwikkeling actief. Geef uitdaging, perspectief en ruimte om steeds een volgende stap te zetten.',
        },
        presteerder: {
            bricks:
                'Bied een omgeving die focus, tempo en resultaat ondersteunt. Minder ruis, meer helderheid en vaart.',
            bytes:
                'Maak doelen, voortgang en prioriteiten scherp zichtbaar. Heldere dashboards en duidelijke keuzes werken hier beter dan eindeloos afstemmen.',
            behavior:
                'Wees duidelijk over verwachtingen. Geef eigenaarschap en stuur op resultaat, niet op bijzaken.',
        },
        denker: {
            bricks:
                'Bied rust, concentratie en voorbereidingstijd. Diepgang ontstaat niet tussen de interrupties door.',
            bytes:
                'Geef toegang tot goede informatie, logische systemen en ruimte om eerst te begrijpen voordat er besloten wordt.',
            behavior:
                'Werk zorgvuldig, onderbouw keuzes en forceer geen snelheid als de analyse nog niet klopt.',
        },
        verbinder: {
            bricks:
                'Maak ruimte voor ontmoeting, contact en informele uitwisseling. Verbinding heeft een plek nodig om te kunnen ontstaan.',
            bytes:
                'Zorg dat communicatiekanalen menselijk en laagdrempelig blijven. Niet alles hoeft efficiënt te zijn om goed te werken.',
            behavior:
                'Betrek deze persona vroeg. Afstemming, relatie en veiligheid zijn hier geen bijzaak, maar randvoorwaarde.',
        },
        teamspeler: {
            bricks:
                'Ondersteun samenwerking met gedeelde plekken, overzicht en een omgeving waarin samen werken logisch en prettig voelt.',
            bytes:
                'Maak informatie transparant, gedeeld en makkelijk vindbaar. Deze persona werkt beter als het geheel zichtbaar is.',
            behavior:
                'Werk met gezamenlijke ritmes, duidelijke afstemming en aandacht voor harmonie in de groep.',
        },
        zekerzoeker: {
            bricks:
                'Bied helderheid, structuur en voorspelbaarheid. Een stabiele omgeving geeft rust en maakt kwaliteit mogelijk.',
            bytes:
                'Gebruik duidelijke systemen, vaste afspraken en informatie die klopt en op tijd beschikbaar is. Consistentie is hier kracht.',
            behavior:
                'Communiceer helder, maak verwachtingen expliciet en voorkom onnodige verrassingen. Duidelijkheid geeft vertrouwen.',
        },
        vernieuwer: {
            bricks:
                'Maak ruimte voor frisse prikkels, nieuwe invalshoeken en omgevingen die verandering niet afremmen maar uitnodigen.',
            bytes:
                'Geef toegang tot nieuwe tools, inspiratie en snelle manieren om iets uit te proberen. Deze persona wil vooruit kunnen denken én doen.',
            behavior:
                'Nodig uit tot vernieuwing. Geef ruimte om bestaande patronen open te breken en nieuwe routes te verkennen.',
        },
    };

    const primaryColor = colorMap[primary?.id] || '#b85c5c';
    const secondaryColor = colorMap[secondary?.id] || '#c7bdb1';
    const tertiaryColor = colorMap[tertiary?.id] || '#d8cec5';

    const coach = coachMap[primary?.id] || {
        bricks:
            'Zorg voor een omgeving die aansluit bij wat deze persoon nodig heeft om goed te werken.',
        bytes:
            'Gebruik systemen en informatie die duidelijk, ondersteunend en passend zijn.',
        behavior:
            'Werk met heldere afspraken en gedrag dat deze persoon helpt om tot zijn of haar recht te komen.',
    };

    const scoreEntries = Object.entries(resultData.scores || {}).sort(
        (a, b) => b[1] - a[1]
    );
    const maxScore = Math.max(...scoreEntries.map(([, v]) => v), 1);

    const downloadCardAsPDF = async () => {
        if (!cardRef.current) return;

        const canvas = await html2canvas(cardRef.current, {
            scale: 2,
            backgroundColor: '#f7f2ec',
            useCORS: true,
        });

        const imgData = canvas.toDataURL('image/png');

        const pdf = new jsPDF({
            orientation: 'landscape',
            unit: 'mm',
            format: 'a5',
        });

        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();

        pdf.addImage(imgData, 'PNG', 0, 0, pageWidth, pageHeight);
        pdf.save(`tof-persona-${primary?.name?.toLowerCase() || 'resultaat'}.pdf`);
    };

    return (
        <div style={{ maxWidth: 1180, margin: '0 auto', padding: '56px 24px 80px' }}>
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 16,
                    flexWrap: 'wrap',
                    marginBottom: 24,
                }}
            >
                <div>
                    <div
                        style={{
                            color: '#b85c5c',
                            letterSpacing: 2,
                            fontSize: 12,
                            marginBottom: 10,
                            textTransform: 'uppercase',
                        }}
                    >
                        03 — Jouw resultaat
                    </div>

                    <h1
                        style={{
                            fontSize: 54,
                            lineHeight: 1.05,
                            fontFamily: 'Playfair Display',
                            fontWeight: 500,
                            margin: 0,
                        }}
                    >
                        Jouw profiel in één oogopslag
                    </h1>
                </div>

                <button
                    onClick={downloadCardAsPDF}
                    style={{
                        background: '#1f1b18',
                        color: 'white',
                        padding: '14px 20px',
                        borderRadius: 12,
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: 15,
                        fontWeight: 500,
                    }}
                >
                    Download kaart (A5 liggend)
                </button>
            </div>

            <div
                ref={cardRef}
                style={{
                    background: 'linear-gradient(135deg, #f7f2ec 0%, #efe5db 100%)',
                    borderRadius: 28,
                    border: '1px solid #e3d8cd',
                    boxShadow: '0 16px 40px rgba(70, 45, 35, 0.08)',
                    overflow: 'hidden',
                    minHeight: 540,
                    display: 'grid',
                    gridTemplateColumns: '0.95fr 1.05fr',
                }}
            >
                {/* LINKS */}
                <div
                    style={{
                        padding: '34px 28px 28px',
                        borderRight: '1px solid #eadfd4',
                        display: 'grid',
                        gridTemplateRows: 'auto auto 1fr',
                        gap: 16,
                    }}
                >
                    <div>
                        <div
                            style={{
                                display: 'inline-block',
                                background: primaryColor,
                                color: 'white',
                                fontSize: 12,
                                letterSpacing: 1.5,
                                textTransform: 'uppercase',
                                padding: '8px 12px',
                                borderRadius: 999,
                                marginBottom: 18,
                            }}
                        >
                            Primaire persona
                        </div>

                        <div
                            style={{
                                fontSize: 22,
                                color: '#7a6d66',
                                marginBottom: 8,
                                letterSpacing: 0.2,
                            }}
                        >
                            {resultData?.name?.trim() ? `${resultData.name},` : 'Jouw profiel'}
                        </div>

                        <h2
                            style={{
                                fontFamily: 'Playfair Display',
                                fontSize: 38,
                                lineHeight: 1.08,
                                margin: 0,
                                color: '#1f1b18',
                            }}
                        >
                            Jij bent een {primary?.name?.toLowerCase()}.
                        </h2>

                        <p
                            style={{
                                marginTop: 12,
                                fontSize: 15,
                                color: '#4d433d',
                                lineHeight: 1.5,
                                maxWidth: 360,
                            }}
                        >
                            Dit zegt iets belangrijks over hoe jij werkt, keuzes maakt en energie krijgt.
                        </p>

                        <p
                            style={{
                                marginTop: 18,
                                fontSize: 16,
                                lineHeight: 1.55,
                                color: '#4d433d',
                                maxWidth: 380,
                            }}
                        >
                            <span style={{ fontWeight: 500 }}>
                                {primary?.short}
                            </span>
                        </p>
                    </div>

                    {/* VERDELING LINKS */}
                    <div
                        style={{
                            background: 'rgba(255,255,255,0.55)',
                            borderRadius: 18,
                            padding: '16px 18px',
                        }}
                    >
                        <div
                            style={{
                                fontSize: 12,
                                letterSpacing: 1.5,
                                textTransform: 'uppercase',
                                color: '#7a6d66',
                                marginBottom: 10,
                            }}
                        >
                            Verdeling over alle persona&apos;s
                        </div>

                        <div style={{ display: 'grid', gap: 9 }}>
                            {scoreEntries.map(([id, value]) => {
                                const a = getA(id);
                                const width = `${Math.max(8, (Number(value) / maxScore) * 100)}%`;
                                const barColor = colorMap[id] || '#b85c5c';

                                return (
                                    <div key={id}>
                                        <div
                                            style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                marginBottom: 5,
                                                fontSize: 13,
                                                color: '#3f342f',
                                            }}
                                        >
                                            <span style={{ fontWeight: 600 }}>{a?.name || id}</span>
                                            <span>{value}</span>
                                        </div>

                                        <div
                                            style={{
                                                height: 9,
                                                background: '#eadfd4',
                                                borderRadius: 999,
                                                overflow: 'hidden',
                                            }}
                                        >
                                            <div
                                                style={{
                                                    width,
                                                    height: '100%',
                                                    background: barColor,
                                                    borderRadius: 999,
                                                }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* MIX LINKS */}
                    <div
                        style={{
                            background: '#f3ece4',
                            borderRadius: 18,
                            padding: '16px 16px',
                            borderLeft: `4px solid ${secondaryColor}`,
                        }}
                    >
                        <div
                            style={{
                                fontSize: 12,
                                letterSpacing: 1.4,
                                textTransform: 'uppercase',
                                color: '#7a6d66',
                                marginBottom: 10,
                            }}
                        >
                            Jouw mix
                        </div>

                        <div style={{ display: 'grid', gap: 10 }}>
                            {[secondary, tertiary].filter(Boolean).map((p, i) => {
                                const pColor = colorMap[p?.id] || '#d8cec5';

                                return (
                                    <div
                                        key={i}
                                        style={{
                                            background: 'rgba(255,255,255,0.76)',
                                            borderRadius: 14,
                                            padding: '10px 12px',
                                            borderLeft: `4px solid ${pColor}`,
                                        }}
                                    >
                                        <div
                                            style={{
                                                display: 'inline-block',
                                                background: pColor,
                                                color: '#fff',
                                                padding: '5px 9px',
                                                borderRadius: 999,
                                                fontSize: 12,
                                                fontWeight: 600,
                                                marginBottom: 6,
                                            }}
                                        >
                                            {i === 0 ? `2. ${p?.name}` : `3. ${p?.name}`}
                                        </div>

                                        <div
                                            style={{
                                                fontSize: 11,
                                                letterSpacing: 1.2,
                                                textTransform: 'uppercase',
                                                color: '#8a7c74',
                                                marginBottom: 3,
                                            }}
                                        >
                                            Ook zichtbaar in jouw profiel
                                        </div>

                                        <div
                                            style={{
                                                fontFamily: 'Playfair Display',
                                                fontSize: 20,
                                                lineHeight: 1.1,
                                                color: '#1f1b18',
                                                marginBottom: 4,
                                            }}
                                        >
                                            {p?.name}
                                        </div>

                                        <p
                                            style={{
                                                margin: 0,
                                                color: '#4d433d',
                                                lineHeight: 1.45,
                                                fontSize: 13,
                                            }}
                                        >
                                            {p?.short}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* RECHTS */}
                <div
                    style={{
                        padding: '34px 28px 28px',
                        display: 'grid',
                        gridTemplateRows: 'auto auto auto 1fr',
                        gap: 16,
                    }}
                >
                    <div
                        style={{
                            background: 'rgba(255,255,255,0.72)',
                            border: '1px solid #eadfd4',
                            borderRadius: 18,
                            padding: '18px 20px',
                        }}
                    >
                        <div
                            style={{
                                fontSize: 12,
                                letterSpacing: 1.5,
                                textTransform: 'uppercase',
                                color: '#7a6d66',
                                marginBottom: 8,
                            }}
                        >
                            Wat jou in beweging brengt
                        </div>

                        <div
                            style={{
                                fontFamily: 'Playfair Display',
                                fontSize: 28,
                                lineHeight: 1.1,
                                color: primaryColor,
                                marginBottom: 10,
                            }}
                        >
                            Jouw natuurlijke kracht
                        </div>

                        <p style={{ margin: 0, color: '#4d433d', lineHeight: 1.6, fontSize: 15 }}>
                            {primary?.energy_from}
                        </p>
                    </div>

                    <div
                        style={{
                            background: 'rgba(255,255,255,0.72)',
                            border: '1px solid #eadfd4',
                            borderRadius: 18,
                            padding: '18px 20px',
                            display: 'grid',
                            gap: 12,
                        }}
                    >
                        <div
                            style={{
                                fontSize: 12,
                                letterSpacing: 1.5,
                                textTransform: 'uppercase',
                                color: '#7a6d66',
                                marginBottom: 2,
                            }}
                        >
                            Coachend advies
                        </div>

                        <div>
                            <div
                                style={{
                                    fontFamily: 'Playfair Display',
                                    fontSize: 22,
                                    lineHeight: 1.1,
                                    color: primaryColor,
                                    marginBottom: 5,
                                }}
                            >
                                Bricks
                            </div>
                            <p style={{ margin: 0, color: '#4d433d', lineHeight: 1.5, fontSize: 14 }}>
                                {coach.bricks}
                            </p>
                        </div>

                        <div>
                            <div
                                style={{
                                    fontFamily: 'Playfair Display',
                                    fontSize: 22,
                                    lineHeight: 1.1,
                                    color: primaryColor,
                                    marginBottom: 5,
                                }}
                            >
                                Bytes
                            </div>
                            <p style={{ margin: 0, color: '#4d433d', lineHeight: 1.5, fontSize: 14 }}>
                                {coach.bytes}
                            </p>
                        </div>

                        <div>
                            <div
                                style={{
                                    fontFamily: 'Playfair Display',
                                    fontSize: 22,
                                    lineHeight: 1.1,
                                    color: primaryColor,
                                    marginBottom: 5,
                                }}
                            >
                                Behavior
                            </div>
                            <p style={{ margin: 0, color: '#4d433d', lineHeight: 1.5, fontSize: 14 }}>
                                {coach.behavior}
                            </p>
                        </div>
                    </div>

                    <div
                        style={{
                            background: 'white',
                            borderRadius: 18,
                            padding: '16px 16px 14px',
                            borderTop: `4px solid ${tertiaryColor}`,
                        }}
                    >
                        <div
                            style={{
                                fontSize: 12,
                                letterSpacing: 1.5,
                                textTransform: 'uppercase',
                                color: '#7a6d66',
                                marginBottom: 8,
                            }}
                        >
                            Wat jou energie kost
                        </div>

                        <div
                            style={{
                                fontFamily: 'Playfair Display',
                                fontSize: 24,
                                lineHeight: 1.1,
                                color: '#1f1b18',
                                marginBottom: 8,
                            }}
                        >
                            Waar je op leegloopt
                        </div>

                        <ul
                            style={{
                                margin: 0,
                                paddingLeft: 18,
                                color: '#4d433d',
                                lineHeight: 1.5,
                                fontSize: 13,
                            }}
                        >
                            {(primary?.energycost || []).slice(0, 3).map((item) => (
                                <li key={item} style={{ marginBottom: 4 }}>
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div
                        style={{
                            alignSelf: 'end',
                            padding: '12px 16px',
                            borderRadius: 16,
                            background: '#e8ddd1',
                            color: '#5a4f49',
                            fontSize: 13,
                            lineHeight: 1.5,
                        }}
                    >
                        <strong style={{ color: '#1f1b18' }}>Premium:</strong> Wil je deze inzichten
                        vertalen naar team- of organisatieanalyse? Vraag de uitgebreide versie aan.
                    </div>
                </div>
            </div>
        </div>
    );
}