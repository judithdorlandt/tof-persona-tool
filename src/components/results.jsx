import { useEffect, useRef, useState } from 'react';
import { ARCHETYPES } from '../data';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import Feedback from './feedback';

export default function Results({ resultData }) {
    const cardRef = useRef(null);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        const onResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);

    if (!resultData) {
        return (
            <div
                style={{
                    maxWidth: 980,
                    margin: '0 auto',
                    padding: isMobile ? '24px 16px 40px' : '56px 24px 80px',
                }}
            >
                <div
                    style={{
                        background: 'white',
                        borderRadius: 20,
                        padding: isMobile ? 22 : 32,
                        border: '1px solid #e7e0d9',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
                    }}
                >
                    <h2
                        style={{
                            fontFamily: 'Playfair Display',
                            fontSize: isMobile ? 32 : 40,
                            marginTop: 0,
                            marginBottom: 12,
                            color: '#1f1b18',
                        }}
                    >
                        Nog geen resultaat
                    </h2>

                    <p
                        style={{
                            color: '#555',
                            fontSize: isMobile ? 16 : 18,
                            lineHeight: 1.6,
                            margin: 0,
                        }}
                    >
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

    const primaryColor = colorMap[primary?.id] || '#b85c5c';
    const secondaryColor = colorMap[secondary?.id] || '#c7bdb1';
    const tertiaryColor = colorMap[tertiary?.id] || '#d8cec5';

    const scoreEntries = Object.entries(resultData.scores || {}).sort(
        (a, b) => b[1] - a[1]
    );
    const maxScore = Math.max(...scoreEntries.map(([, v]) => v), 1);

    const pickLeadSentence = (text) => {
        if (!text) return '';
        const first = text.split('. ')[0]?.trim() || '';
        if (!first) return '';
        return first.endsWith('.') ? first : `${first}.`;
    };

    const lowerFirst = (text) => {
        if (!text) return '';
        return text.charAt(0).toLowerCase() + text.slice(1);
    };

    const combinedCoach = {
        bricks: `${primary?.bricks || ''} Vanuit jouw mix zie je daarnaast ook behoefte aan ${lowerFirst(
            pickLeadSentence(secondary?.bricks)
        )} En ook ${lowerFirst(pickLeadSentence(tertiary?.bricks))}`,
        bytes: `${primary?.bytes || ''} Vanuit jouw mix helpt het daarnaast als er ook ruimte is voor ${lowerFirst(
            pickLeadSentence(secondary?.bytes)
        )} En ook ${lowerFirst(pickLeadSentence(tertiary?.bytes))}`,
        behavior: `${primary?.behavior || ''} In jouw mix zie je daarnaast ook dat ${secondary?.name?.toLowerCase() || 'je tweede persona'} en ${tertiary?.name?.toLowerCase() || 'je derde persona'} vragen om ${lowerFirst(
            pickLeadSentence(secondary?.behavior)
        )} En ook ${lowerFirst(pickLeadSentence(tertiary?.behavior))}`,
    };

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

    const infoLabelStyle = {
        fontSize: 11,
        letterSpacing: 1.5,
        textTransform: 'uppercase',
        color: '#7a6d66',
        marginBottom: 8,
    };

    return (
        <div
            style={{
                maxWidth: 1180,
                margin: '0 auto',
                padding: isMobile ? '20px 12px 40px' : '40px 20px 72px',
            }}
        >
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: isMobile ? 'stretch' : 'center',
                    gap: 14,
                    flexWrap: 'wrap',
                    marginBottom: 18,
                }}
            >
                <div>
                    <div
                        style={{
                            color: '#b85c5c',
                            letterSpacing: 2,
                            fontSize: 12,
                            marginBottom: 8,
                            textTransform: 'uppercase',
                        }}
                    >
                        04 — Jouw profiel
                    </div>

                    <h1
                        style={{
                            fontSize: isMobile ? 34 : 48,
                            lineHeight: 1.02,
                            fontFamily: 'Playfair Display',
                            fontWeight: 500,
                            margin: 0,
                            color: '#1f1b18',
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
                        padding: '13px 18px',
                        borderRadius: 12,
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: 14,
                        fontWeight: 500,
                        width: isMobile ? '100%' : 'auto',
                    }}
                >
                    Download profiel →
                </button>
            </div>

            <div
                ref={cardRef}
                style={{
                    background: 'linear-gradient(135deg, #f7f2ec 0%, #efe5db 100%)',
                    borderRadius: 24,
                    border: '1px solid #e3d8cd',
                    boxShadow: '0 16px 40px rgba(70, 45, 35, 0.08)',
                    overflow: 'hidden',
                    display: 'grid',
                    gridTemplateColumns: isMobile ? '1fr' : '0.95fr 1.05fr',
                }}
            >
                <div
                    style={{
                        padding: isMobile ? '18px 14px 14px' : '26px 24px 22px',
                        borderRight: isMobile ? 'none' : '1px solid #eadfd4',
                        borderBottom: isMobile ? '1px solid #eadfd4' : 'none',
                        display: 'grid',
                        gap: 12,
                    }}
                >
                    <div>
                        <div
                            style={{
                                display: 'inline-block',
                                background: primaryColor,
                                color: 'white',
                                fontSize: 11,
                                letterSpacing: 1.4,
                                textTransform: 'uppercase',
                                padding: '7px 11px',
                                borderRadius: 999,
                                marginBottom: 14,
                            }}
                        >
                            Primaire persona
                        </div>

                        <div
                            style={{
                                fontSize: isMobile ? 18 : 20,
                                color: '#7a6d66',
                                marginBottom: 6,
                            }}
                        >
                            {resultData?.name?.trim() ? `${resultData.name},` : 'Jouw profiel'}
                        </div>

                        <h2
                            style={{
                                fontFamily: 'Playfair Display',
                                fontSize: isMobile ? 30 : 36,
                                lineHeight: 1.06,
                                margin: 0,
                                color: '#1f1b18',
                            }}
                        >
                            Jij bent een {primary?.name?.toLowerCase()}.
                        </h2>

                        <p
                            style={{
                                marginTop: 10,
                                fontSize: 14,
                                color: '#4d433d',
                                lineHeight: 1.5,
                                maxWidth: 430,
                            }}
                        >
                            Dit verklaart waarom sommige dingen vanzelf gaan — en andere juist energie kosten.
                        </p>

                        <p
                            style={{
                                marginTop: 14,
                                fontSize: 15,
                                lineHeight: 1.5,
                                color: '#4d433d',
                                maxWidth: 450,
                            }}
                        >
                            <span style={{ fontWeight: 500 }}>{primary?.short}</span>
                        </p>
                    </div>

                    <div
                        style={{
                            background: 'rgba(255,255,255,0.58)',
                            borderRadius: 16,
                            padding: '14px 16px',
                        }}
                    >
                        <div style={infoLabelStyle}>Verdeling over alle persona&apos;s</div>

                        <div style={{ display: 'grid', gap: 8 }}>
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
                                                marginBottom: 4,
                                                fontSize: 12,
                                                color: '#3f342f',
                                            }}
                                        >
                                            <span style={{ fontWeight: 600 }}>{a?.name || id}</span>
                                            <span>{value}</span>
                                        </div>

                                        <div
                                            style={{
                                                height: 8,
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

                    <div
                        style={{
                            background: '#f3ece4',
                            borderRadius: 16,
                            padding: '14px',
                            borderLeft: `4px solid ${secondaryColor}`,
                        }}
                    >
                        <div style={infoLabelStyle}>Jouw mix</div>

                        <div style={{ display: 'grid', gap: 10 }}>
                            {[secondary, tertiary].filter(Boolean).map((p, i) => {
                                const pColor = colorMap[p?.id] || '#d8cec5';

                                return (
                                    <div
                                        key={i}
                                        style={{
                                            background: 'rgba(255,255,255,0.78)',
                                            borderRadius: 12,
                                            padding: '10px 12px',
                                            borderLeft: `4px solid ${pColor}`,
                                        }}
                                    >
                                        <div
                                            style={{
                                                display: 'inline-block',
                                                background: pColor,
                                                color: '#fff',
                                                padding: '4px 8px',
                                                borderRadius: 999,
                                                fontSize: 11,
                                                fontWeight: 600,
                                                marginBottom: 5,
                                            }}
                                        >
                                            {i === 0 ? `2. ${p?.name}` : `3. ${p?.name}`}
                                        </div>

                                        <div
                                            style={{
                                                fontSize: 10,
                                                letterSpacing: 1.1,
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
                                                fontSize: 18,
                                                lineHeight: 1.1,
                                                color: '#1f1b18',
                                                marginBottom: 3,
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

                <div
                    style={{
                        padding: isMobile ? '18px 14px 14px' : '26px 24px 22px',
                        display: 'grid',
                        gap: 12,
                    }}
                >
                    <SectionCard
                        label="Wat jou in beweging brengt"
                        title="Jouw natuurlijke kracht"
                        titleColor={primaryColor}
                    >
                        <p style={{ margin: 0, color: '#4d433d', lineHeight: 1.55, fontSize: 14 }}>
                            {primary?.energy_from}
                        </p>
                    </SectionCard>

                    <SectionCard label="Coachend advies">
                        <CoachBlock title="Bricks" color={primaryColor} text={combinedCoach.bricks} />
                        <CoachBlock title="Bytes" color={primaryColor} text={combinedCoach.bytes} />
                        <CoachBlock title="Behavior" color={primaryColor} text={combinedCoach.behavior} />
                    </SectionCard>

                    <div
                        style={{
                            background: 'white',
                            borderRadius: 16,
                            padding: '14px 14px 12px',
                            borderTop: `4px solid ${tertiaryColor}`,
                        }}
                    >
                        <div style={infoLabelStyle}>Wat jou energie kost</div>

                        <div
                            style={{
                                fontFamily: 'Playfair Display',
                                fontSize: 22,
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
                                lineHeight: 1.45,
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
                            padding: '12px 14px',
                            borderRadius: 14,
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

            <div style={{ marginTop: 16 }}>
                <Feedback primaryPersonaName={primary?.name || ''} />
            </div>
        </div>
    );
}

function SectionCard({ label, title, titleColor = '#1f1b18', children }) {
    return (
        <div
            style={{
                background: 'rgba(255,255,255,0.72)',
                border: '1px solid #eadfd4',
                borderRadius: 16,
                padding: '14px 16px',
                display: 'grid',
                gap: 10,
            }}
        >
            <div
                style={{
                    fontSize: 11,
                    letterSpacing: 1.5,
                    textTransform: 'uppercase',
                    color: '#7a6d66',
                    marginBottom: title ? -2 : 0,
                }}
            >
                {label}
            </div>

            {title && (
                <div
                    style={{
                        fontFamily: 'Playfair Display',
                        fontSize: 24,
                        lineHeight: 1.08,
                        color: titleColor,
                        marginBottom: 2,
                    }}
                >
                    {title}
                </div>
            )}

            {children}
        </div>
    );
}

function CoachBlock({ title, color, text }) {
    return (
        <div>
            <div
                style={{
                    fontFamily: 'Playfair Display',
                    fontSize: 20,
                    lineHeight: 1.1,
                    color,
                    marginBottom: 5,
                }}
            >
                {title}
            </div>
            <p
                style={{
                    margin: 0,
                    color: '#4d433d',
                    lineHeight: 1.55,
                    fontSize: 14,
                }}
            >
                {text}
            </p>
        </div>
    );
}