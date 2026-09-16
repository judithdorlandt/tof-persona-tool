import { useEffect, useMemo, useRef, useState } from 'react';
import { ARCHETYPES } from '../../data';
import { saveResponse } from '../../supabase';
import QuizAanmelding from '../../components/QuizAanmelding.jsx';
import Results from '../../components/Results.jsx';
import {
    BASIS_VRAGEN,
    DRUK_VRAAG,
    WERKPLEK_TYPES,
    OPEN_VRAAG,
    VERDIEPING_INTRO,
    DUEL_ESSENTIE,
    DUEL_INTRO,
} from './quizTestData';

/**
 * QuizTest — EXPERIMENTEEL (testvariant vragenlijst)
 *
 * Verkorte flow uit het analysestuk "Korter afnemen, scherper prijzen":
 *   1. Aanmelden (hergebruikt QuizAanmelding)
 *   2. 9 basisvragen met vast antwoordpatroon (5x één keuze, 4x twee in volgorde)
 *   3. Profiel IN BEELD (hergebruikt Results)
 *   4. Optionele verdieping (2 duels, druk, werkplekgebruik, open vraag)
 *   5. Verscherpt profiel
 *
 * Het resultaat wordt bij afronden (fase 'profielScherp') één keer opgeslagen
 * in Supabase via saveResponse — zowel na de verdieping als wanneer iemand op
 * "Nee, ik ben klaar" klikt. Zo telt precies één rij mee in de dashboards en
 * bevat die het scherpste profiel.
 */

const WEIGHTS = [3, 2]; // eerste keuze telt 3, tweede 2
const BUMP = 3; // gewicht dat een gewonnen duel / druk-antwoord toevoegt

const PALETTE = {
    bg: '#f7f2ec',
    ink: '#1f1b18',
    accent: '#b85c5c',
    soft: '#6a5f58',
    line: '#ddd6ce',
};

function shuffleArray(array) {
    const copy = [...array];
    for (let i = copy.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
}

function emptyScores() {
    return Object.fromEntries(ARCHETYPES.map((a) => [a.id, 0]));
}

function sortByScore(scores) {
    return [...ARCHETYPES]
        .map((a) => ({ ...a, score: scores[a.id] || 0 }))
        .sort((a, b) => b.score - a.score);
}

// ── Presentatie-componenten (module-niveau: stabiele identiteit, geen remount) ─
function Shell({ children, isMobile, innerRef }) {
    return (
        <div
            style={{
                minHeight: 'calc(100vh - 88px)',
                display: 'flex',
                alignItems: isMobile ? 'flex-start' : 'center',
                justifyContent: 'center',
                padding: isMobile ? '12px 12px 24px' : '24px 20px',
                background: PALETTE.bg,
                boxSizing: 'border-box',
            }}
        >
            <div ref={innerRef} style={{ width: '100%', maxWidth: 960, display: 'grid', gap: 12 }}>
                {children}
            </div>
        </div>
    );
}

function Card({ children, isMobile }) {
    return (
        <div
            style={{
                background: 'white',
                borderRadius: 20,
                padding: isMobile ? '18px 16px' : '26px 30px 22px',
                borderTop: `4px solid ${PALETTE.ink}`,
                border: `1px solid ${PALETTE.line}`,
                boxShadow: '0 12px 32px rgba(31,27,24,0.08)',
                display: 'grid',
                gap: 16,
            }}
        >
            {children}
        </div>
    );
}

function Eyebrow({ children }) {
    return (
        <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 1.5, fontWeight: 700, color: PALETTE.accent }}>
            {children}
        </div>
    );
}

function Title({ children, isMobile }) {
    return (
        <h1
            style={{
                fontFamily: 'Playfair Display',
                fontSize: isMobile ? 24 : 28,
                lineHeight: 1.18,
                margin: 0,
                color: PALETTE.ink,
                fontWeight: 500,
            }}
        >
            {children}
        </h1>
    );
}

function PrimaryBtn({ children, onClick, disabled, isMobile }) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            style={{
                background: disabled ? '#d8cec5' : PALETTE.ink,
                color: 'white',
                padding: '13px 22px',
                borderRadius: 12,
                border: 'none',
                cursor: disabled ? 'not-allowed' : 'pointer',
                fontSize: 15,
                fontWeight: 600,
                minWidth: isMobile ? '100%' : 200,
            }}
        >
            {children}
        </button>
    );
}

function GhostBtn({ children, onClick }) {
    return (
        <button
            type="button"
            onClick={onClick}
            style={{
                background: 'transparent',
                color: PALETTE.soft,
                padding: '13px 18px',
                borderRadius: 12,
                border: `1px solid ${PALETTE.line}`,
                cursor: 'pointer',
                fontSize: 15,
                fontWeight: 600,
            }}
        >
            {children}
        </button>
    );
}

function OptionButton({ option, order, onClick, isMobile }) {
    const active = order !== null;
    return (
        <button
            type="button"
            onClick={onClick}
            style={{
                padding: isMobile ? '10px 12px' : '12px 14px',
                borderRadius: 12,
                border: active ? `2px solid ${PALETTE.accent}` : '1px solid #ddd',
                background: active ? '#fcf1f1' : 'white',
                textAlign: 'left',
                cursor: 'pointer',
                fontSize: isMobile ? 14 : 15,
                lineHeight: 1.35,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 10,
                minHeight: isMobile ? 48 : 50,
            }}
        >
            <span style={{ paddingRight: 6 }}>{option.text}</span>
            {order !== null && (
                <span
                    style={{
                        minWidth: 26,
                        height: 26,
                        borderRadius: 999,
                        background: PALETTE.accent,
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 12,
                        fontWeight: 700,
                        flexShrink: 0,
                    }}
                >
                    {order}
                </span>
            )}
        </button>
    );
}

function PlekGrid({ list, setList, isMobile }) {
    const toggle = (id) => {
        if (list.includes(id)) {
            setList(list.filter((x) => x !== id));
            return;
        }
        if (list.length >= 3) return;
        setList([...list, id]);
    };
    return (
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(3, 1fr)', gap: 8 }}>
            {WERKPLEK_TYPES.map((t) => {
                const active = list.includes(t.id);
                const full = list.length >= 3 && !active;
                return (
                    <button
                        key={t.id}
                        type="button"
                        onClick={() => toggle(t.id)}
                        style={{
                            padding: '10px 12px',
                            borderRadius: 12,
                            border: active ? `2px solid ${PALETTE.accent}` : '1px solid #ddd',
                            background: active ? '#fcf1f1' : 'white',
                            color: full ? '#b9b0a8' : PALETTE.ink,
                            cursor: full ? 'not-allowed' : 'pointer',
                            fontSize: 14,
                            lineHeight: 1.3,
                            textAlign: 'left',
                            minHeight: 46,
                        }}
                    >
                        {t.label}
                    </button>
                );
            })}
        </div>
    );
}

function ProfielBanner({ eyebrow, text, isMobile, children }) {
    return (
        <div style={{ background: PALETTE.bg, padding: isMobile ? '16px 12px 0' : '24px 20px 0' }}>
            <div style={{ maxWidth: 960, margin: '0 auto' }}>
                <div
                    style={{
                        background: 'white',
                        borderRadius: 20,
                        border: `1px solid ${PALETTE.line}`,
                        borderTop: `4px solid ${PALETTE.accent}`,
                        boxShadow: '0 12px 32px rgba(31,27,24,0.08)',
                        padding: isMobile ? '18px 16px' : '22px 26px',
                        display: 'grid',
                        gap: 14,
                    }}
                >
                    <div>
                        <Eyebrow>{eyebrow}</Eyebrow>
                        <p style={{ margin: '6px 0 0', color: PALETTE.soft, fontSize: 15, lineHeight: 1.5 }}>{text}</p>
                    </div>
                    {children}
                </div>
            </div>
        </div>
    );
}

export default function QuizTest({ setPage }) {
    const [phase, setPhase] = useState('intake'); // intake | basis | profiel | verdieping | profielScherp
    const [profile, setProfile] = useState(null);
    const [scores, setScores] = useState(emptyScores());

    // basis
    const [basisStep, setBasisStep] = useState(0);
    const [shuffled, setShuffled] = useState([]);
    const [selected, setSelected] = useState([]);
    const [error, setError] = useState('');

    // verdieping
    const [verdiepStep, setVerdiepStep] = useState(0); // 0=duel1 1=duel2 2=druk 3=werkplek 4=open
    const [duelBumps, setDuelBumps] = useState({});
    const [drukShuffled, setDrukShuffled] = useState([]);
    const [drukChoice, setDrukChoice] = useState(null);
    const [gebruikNu, setGebruikNu] = useState([]);
    const [mistPlek, setMistPlek] = useState([]);
    const [openText, setOpenText] = useState('');

    const [isMobile, setIsMobile] = useState(
        typeof window !== 'undefined' ? window.innerWidth < 768 : false
    );
    const topRef = useRef(null);

    // Opslag — bij afronden precies één keer naar Supabase.
    const savedRef = useRef(false);
    const [saveError, setSaveError] = useState('');

    useEffect(() => {
        const onResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);

    const currentBasis = phase === 'basis' ? BASIS_VRAGEN[basisStep] : null;

    // Shuffle opties bij elke basisvraag.
    useEffect(() => {
        if (phase !== 'basis' || !currentBasis) return;
        const opts = currentBasis.a.map((text, index) => ({
            text,
            archetypeId: ARCHETYPES[index]?.id,
        }));
        setShuffled(shuffleArray(opts));
        setSelected([]);
        setError('');
        if (topRef.current) topRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, [phase, basisStep]); // eslint-disable-line react-hooks/exhaustive-deps

    // Shuffle druk-opties zodra we bij die stap zijn.
    useEffect(() => {
        if (phase !== 'verdieping' || verdiepStep !== 2) return;
        const opts = DRUK_VRAAG.a.map((text, index) => ({
            text,
            archetypeId: ARCHETYPES[index]?.id,
        }));
        setDrukShuffled(shuffleArray(opts));
    }, [phase, verdiepStep]);

    const buildResult = (finalScores) => {
        const sorted = sortByScore(finalScores);
        return {
            ...profile,
            primary: sorted[0]?.id || null,
            secondary: sorted[1]?.id || null,
            tertiary: sorted[2]?.id || null,
            scores: finalScores,
        };
    };

    const verscherpteScores = useMemo(() => {
        const s = { ...scores };
        Object.entries(duelBumps).forEach(([id, v]) => {
            s[id] = (s[id] || 0) + v;
        });
        if (drukChoice?.archetypeId) {
            s[drukChoice.archetypeId] = (s[drukChoice.archetypeId] || 0) + BUMP;
        }
        return s;
    }, [scores, duelBumps, drukChoice]);

    const basisResult = useMemo(
        () => (profile ? buildResult(scores) : null),
        [profile, scores] // eslint-disable-line react-hooks/exhaustive-deps
    );
    const scherpResult = useMemo(
        () =>
            profile
                ? { ...buildResult(verscherpteScores), werkplek: { gebruikNu, mist: mistPlek }, openAntwoord: openText }
                : null,
        [profile, verscherpteScores, gebruikNu, mistPlek, openText] // eslint-disable-line react-hooks/exhaustive-deps
    );

    // Opslaan zodra het verscherpte profiel in beeld komt — één keer.
    // Beide paden ('Nee, ik ben klaar' en de afgeronde verdieping) landen hier.
    useEffect(() => {
        if (phase !== 'profielScherp' || savedRef.current || !scherpResult) return;
        savedRef.current = true;
        setSaveError('');
        (async () => {
            const saved = await saveResponse(scherpResult);
            if (!saved) {
                savedRef.current = false; // mislukt → volgende render mag opnieuw
                setSaveError('Je resultaat kon niet worden opgeslagen. Ververs de pagina om het opnieuw te proberen.');
            }
        })();
    }, [phase, scherpResult]);

    const sortedBasis = useMemo(() => sortByScore(scores), [scores]);
    const duelPairs = useMemo(
        () => [
            [sortedBasis[0], sortedBasis[1]],
            [sortedBasis[1], sortedBasis[2]],
        ],
        [sortedBasis]
    );

    // ── Handlers ────────────────────────────────────────────────────────────────
    const toggleSelect = (option) => {
        setSelected((prev) => {
            const exists = prev.some((s) => s.text === option.text);
            if (exists) return prev.filter((s) => s.text !== option.text);
            if (prev.length >= currentBasis.pick) return prev;
            return [...prev, option];
        });
    };

    const nextBasis = () => {
        if (selected.length !== currentBasis.pick) {
            setError(currentBasis.pick === 2 ? 'Kies precies 2 antwoorden, in volgorde.' : 'Kies 1 antwoord.');
            return;
        }
        const next = { ...scores };
        selected.forEach((opt, i) => {
            if (opt.archetypeId) next[opt.archetypeId] = (next[opt.archetypeId] || 0) + WEIGHTS[i];
        });
        setScores(next);
        if (basisStep + 1 < BASIS_VRAGEN.length) setBasisStep((s) => s + 1);
        else setPhase('profiel');
    };

    const kiesDuel = (archetypeId) => {
        setDuelBumps((prev) => ({ ...prev, [archetypeId]: (prev[archetypeId] || 0) + BUMP }));
        setVerdiepStep((s) => (s === 0 ? 1 : 2));
    };

    // ── INTAKE ────────────────────────────────────────────────────────────────
    if (phase === 'intake') {
        return (
            <QuizAanmelding
                onSubmit={(p) => {
                    setProfile(p);
                    setScores(emptyScores());
                    setBasisStep(0);
                    setPhase('basis');
                }}
            />
        );
    }

    // ── BASIS ────────────────────────────────────────────────────────────────────
    if (phase === 'basis') {
        const progress = ((basisStep + 1) / BASIS_VRAGEN.length) * 100;
        return (
            <Shell isMobile={isMobile} innerRef={topRef}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ flex: 1, height: 5, background: '#e6dfd8', borderRadius: 999, overflow: 'hidden' }}>
                        <div style={{ width: `${progress}%`, height: '100%', background: PALETTE.accent, borderRadius: 999, transition: 'width .3s' }} />
                    </div>
                    <span style={{ color: '#999', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1.5, whiteSpace: 'nowrap', fontWeight: 600 }}>
                        {basisStep + 1} / {BASIS_VRAGEN.length}
                    </span>
                </div>

                <Card isMobile={isMobile}>
                    <div>
                        <Eyebrow>Testversie · 9 vragen · ± 5 minuten</Eyebrow>
                        <Title isMobile={isMobile}>{currentBasis.q}</Title>
                    </div>

                    <div style={{ background: PALETTE.bg, borderRadius: 10, padding: '9px 14px', fontSize: 13, color: PALETTE.soft, lineHeight: 1.4 }}>
                        {currentBasis.pick === 2 ? (
                            <>Kies <strong style={{ color: PALETTE.ink }}>precies 2 antwoorden</strong> — je eerste keuze weegt het zwaarst.</>
                        ) : (
                            <>Kies <strong style={{ color: PALETTE.ink }}>1 antwoord</strong> dat het beste bij jou past.</>
                        )}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: isMobile ? 7 : 8 }}>
                        {shuffled.map((option, index) => {
                            const idx = selected.findIndex((s) => s.text === option.text);
                            const order = idx === -1 ? null : currentBasis.pick === 1 ? '✓' : idx + 1;
                            return (
                                <OptionButton
                                    key={`${option.text}-${index}`}
                                    option={option}
                                    order={order}
                                    isMobile={isMobile}
                                    onClick={() => toggleSelect(option)}
                                />
                            );
                        })}
                    </div>

                    {error && <div style={{ color: PALETTE.accent, fontSize: 14 }}>{error}</div>}

                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <PrimaryBtn isMobile={isMobile} onClick={nextBasis} disabled={selected.length !== currentBasis.pick}>
                            {basisStep + 1 === BASIS_VRAGEN.length ? 'Naar mijn profiel' : 'Volgende vraag'}
                        </PrimaryBtn>
                    </div>
                </Card>
            </Shell>
        );
    }

    // ── PROFIEL (in beeld) — met optionele verdieping erboven ───────────────────
    if (phase === 'profiel') {
        return (
            <div>
                <ProfielBanner isMobile={isMobile} eyebrow="Je profiel staat" text={VERDIEPING_INTRO}>
                    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                        <PrimaryBtn isMobile={isMobile} onClick={() => { setVerdiepStep(0); setPhase('verdieping'); }}>
                            Ja, maak scherper (3 min)
                        </PrimaryBtn>
                        <GhostBtn onClick={() => setPhase('profielScherp')}>Nee, ik ben klaar</GhostBtn>
                    </div>
                </ProfielBanner>
                <Results resultData={basisResult} setPage={setPage} />
            </div>
        );
    }

    // ── VERDIEPING ───────────────────────────────────────────────────────────────
    if (phase === 'verdieping') {
        if (verdiepStep === 0 || verdiepStep === 1) {
            const pair = duelPairs[verdiepStep] || [];
            const [a, b] = pair;
            if (!a || !b) {
                setVerdiepStep(2);
                return null;
            }
            return (
                <Shell isMobile={isMobile} innerRef={topRef}>
                    <Card isMobile={isMobile}>
                        <div>
                            <Eyebrow>Verdieping · duel {verdiepStep + 1} van 2</Eyebrow>
                            <Title isMobile={isMobile}>{DUEL_INTRO}</Title>
                        </div>
                        <div style={{ display: 'grid', gap: 10 }}>
                            {[a, b].map((arch) => (
                                <OptionButton
                                    key={arch.id}
                                    option={{ text: DUEL_ESSENTIE[arch.id] || arch.name }}
                                    order={null}
                                    isMobile={isMobile}
                                    onClick={() => kiesDuel(arch.id)}
                                />
                            ))}
                        </div>
                    </Card>
                </Shell>
            );
        }

        if (verdiepStep === 2) {
            return (
                <Shell isMobile={isMobile} innerRef={topRef}>
                    <Card isMobile={isMobile}>
                        <div>
                            <Eyebrow>Verdieping · onder druk</Eyebrow>
                            <Title isMobile={isMobile}>{DRUK_VRAAG.q}</Title>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: 8 }}>
                            {drukShuffled.map((option, index) => (
                                <OptionButton
                                    key={`${option.text}-${index}`}
                                    option={option}
                                    order={drukChoice?.text === option.text ? '✓' : null}
                                    isMobile={isMobile}
                                    onClick={() => setDrukChoice(option)}
                                />
                            ))}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <PrimaryBtn isMobile={isMobile} onClick={() => setVerdiepStep(3)} disabled={!drukChoice}>Volgende</PrimaryBtn>
                        </div>
                    </Card>
                </Shell>
            );
        }

        if (verdiepStep === 3) {
            return (
                <Shell isMobile={isMobile} innerRef={topRef}>
                    <Card isMobile={isMobile}>
                        <div>
                            <Eyebrow>Verdieping · werkplekgebruik</Eyebrow>
                            <Title isMobile={isMobile}>Welke plekken gebruik je nu het meest?</Title>
                            <p style={{ margin: '4px 0 0', color: PALETTE.soft, fontSize: 13 }}>Kies er drie.</p>
                        </div>
                        <PlekGrid list={gebruikNu} setList={setGebruikNu} isMobile={isMobile} />
                        <div style={{ borderTop: `1px solid ${PALETTE.line}`, paddingTop: 16 }}>
                            <Title isMobile={isMobile}>Welke plekken mis je?</Title>
                            <p style={{ margin: '4px 0 10px', color: PALETTE.soft, fontSize: 13 }}>Kies er drie.</p>
                            <PlekGrid list={mistPlek} setList={setMistPlek} isMobile={isMobile} />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <PrimaryBtn
                                isMobile={isMobile}
                                onClick={() => setVerdiepStep(4)}
                                disabled={gebruikNu.length !== 3 || mistPlek.length !== 3}
                            >
                                Volgende
                            </PrimaryBtn>
                        </div>
                    </Card>
                </Shell>
            );
        }

        return (
            <Shell isMobile={isMobile} innerRef={topRef}>
                <Card isMobile={isMobile}>
                    <div>
                        <Eyebrow>Verdieping · tot slot</Eyebrow>
                        <Title isMobile={isMobile}>{OPEN_VRAAG.q}</Title>
                        <p style={{ margin: '4px 0 0', color: PALETTE.soft, fontSize: 13 }}>Optioneel · max {OPEN_VRAAG.maxLength} tekens.</p>
                    </div>
                    <textarea
                        value={openText}
                        maxLength={OPEN_VRAAG.maxLength}
                        onChange={(e) => setOpenText(e.target.value)}
                        style={{
                            width: '100%',
                            minHeight: 96,
                            padding: '12px 14px',
                            border: '1px solid #ddd',
                            borderRadius: 12,
                            fontSize: 15,
                            fontFamily: 'inherit',
                            resize: 'vertical',
                            boxSizing: 'border-box',
                        }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                        <span style={{ fontSize: 12, color: '#a89e96' }}>{openText.length}/{OPEN_VRAAG.maxLength}</span>
                        <PrimaryBtn isMobile={isMobile} onClick={() => setPhase('profielScherp')}>Toon mijn verscherpte profiel</PrimaryBtn>
                    </div>
                </Card>
            </Shell>
        );
    }

    // ── VERSCHERPT PROFIEL ────────────────────────────────────────────────────────
    if (phase === 'profielScherp') {
        const veranderd = basisResult?.primary !== scherpResult?.primary;
        return (
            <div>
                <ProfielBanner
                    isMobile={isMobile}
                    eyebrow="Verscherpt profiel"
                    text={
                        veranderd
                            ? 'Na de verdieping is je hoofdprofiel bijgesteld — de duels beslechtten een nipt gelijkspel.'
                            : 'De verdieping bevestigde je hoofdprofiel en maakte de onderlinge verhouding scherper.'
                    }
                >
                    {saveError && (
                        <p style={{ margin: 0, color: PALETTE.accent, fontSize: 14 }}>{saveError}</p>
                    )}
                </ProfielBanner>
                <Results resultData={scherpResult} setPage={setPage} />
            </div>
        );
    }

    return null;
}
