import { useEffect, useMemo, useState, useRef } from 'react';
import { ARCHETYPES, QUESTIONS } from '../data';
import { saveResponse } from '../supabase';
import QuizAanmelding from './QuizAanmelding.jsx';
import styles from './Quiz.module.css';

// Auto-save key. Bump versie als de state-shape verandert.
const QUIZ_STORAGE_KEY = 'tof-quiz-progress-v1';

function readProgress() {
    if (typeof window === 'undefined') return null;
    try {
        const raw = window.localStorage.getItem(QUIZ_STORAGE_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        if (!parsed || typeof parsed !== 'object') return null;
        // Minimale validatie: step + profile + scores moeten bestaan
        if (typeof parsed.step !== 'number') return null;
        if (!parsed.profile || typeof parsed.profile !== 'object') return null;
        return parsed;
    } catch (err) {
        return null;
    }
}

function writeProgress(state) {
    if (typeof window === 'undefined') return;
    try {
        window.localStorage.setItem(QUIZ_STORAGE_KEY, JSON.stringify(state));
    } catch (err) {
        // localStorage kan vol of geblokkeerd zijn; geen blokker
    }
}

function clearProgress() {
    if (typeof window === 'undefined') return;
    try {
        window.localStorage.removeItem(QUIZ_STORAGE_KEY);
    } catch (err) {
        // niets
    }
}

function shuffleArray(array) {
    const copy = [...array];
    for (let i = copy.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
}

function createEmptyScores() {
    return Object.fromEntries(ARCHETYPES.map((archetype) => [archetype.id, 0]));
}

export default function Quiz({ setPage, setResultData }) {
    // Bij eerste mount restoren uit localStorage als er progress is.
    const restored = useMemo(() => readProgress(), []);

    const [step, setStep] = useState(restored?.step ?? -1);
    const [profile, setProfile] = useState(
        restored?.profile ?? {
            name: '',
            org: '',
            dept: '',
            team: '',
            invite_code: '',
            role: '',
            team_size: '',
        }
    );
    const [scores, setScores] = useState(restored?.scores ?? createEmptyScores());
    const questionTopRef = useRef(null);
    const [selectedAnswers, setSelectedAnswers] = useState([]);
    const [shuffledOptions, setShuffledOptions] = useState([]);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    // Auto-save bij elke wijziging van step/profile/scores.
    // Pas opslaan zodra de gebruiker iets heeft ingevuld OF al begonnen is.
    useEffect(() => {
        const hasMeaningfulProgress =
            step >= 0 ||
            (profile.org && profile.org.trim() !== '') ||
            (profile.dept && profile.dept.trim() !== '');
        if (!hasMeaningfulProgress) return;
        writeProgress({ step, profile, scores });
    }, [step, profile, scores]);

    const totalQuestions = QUESTIONS.length;
    const currentQuestion = step >= 0 ? QUESTIONS[step] : null;

    useEffect(() => {
        const onResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);

    useEffect(() => {
        if (step >= 0 && questionTopRef.current) {
            questionTopRef.current.scrollIntoView({
                behavior: isMobile ? 'auto' : 'smooth',
                block: 'start',
            });
        }
    }, [step, isMobile]);

    useEffect(() => {
        if (step < 0 || !currentQuestion) return;

        const optionObjects = currentQuestion.a.map((answerText, index) => ({
            text: answerText,
            archetypeId: ARCHETYPES[index]?.id,
            originalIndex: index,
        }));

        setShuffledOptions(shuffleArray(optionObjects));
        setSelectedAnswers([]);
        setError('');
    }, [step, currentQuestion]);

    const progress = useMemo(() => {
        if (step < 0) return 0;
        return ((step + 1) / totalQuestions) * 100;
    }, [step, totalQuestions]);

    const toggleAnswer = (option) => {
        const exists = selectedAnswers.some((item) => item.text === option.text);

        if (exists) {
            setSelectedAnswers((prev) => prev.filter((item) => item.text !== option.text));
            return;
        }

        if (selectedAnswers.length >= 3) {
            return;
        }

        setSelectedAnswers((prev) => [...prev, option]);
    };

    const handleNext = async () => {
        if (selectedAnswers.length === 0) {
            setError('Kies minimaal 1 antwoord.');
            return;
        }

        setError('');

        const weightedScores = { ...scores };

        selectedAnswers.forEach((option, index) => {
            const weight = index === 0 ? 3 : index === 1 ? 2 : 1;

            if (option.archetypeId) {
                weightedScores[option.archetypeId] =
                    (weightedScores[option.archetypeId] || 0) + weight;
            }
        });

        if (step + 1 < totalQuestions) {
            setScores(weightedScores);
            setStep((prev) => prev + 1);
            return;
        }

        const sorted = [...ARCHETYPES]
            .map((archetype) => ({
                ...archetype,
                score: weightedScores[archetype.id] || 0,
            }))
            .sort((a, b) => b.score - a.score);

        // Team is optioneel; valt terug op afdeling als leeg.
        const normalizedTeam = profile.team.trim() || profile.dept.trim();

        const result = {
            ...profile,
            team: normalizedTeam,
            primary: sorted[0]?.id || null,
            secondary: sorted[1]?.id || null,
            tertiary: sorted[2]?.id || null,
            scores: weightedScores,
        };

        console.log('📦 RESULT VOLLEDIG:', JSON.stringify(result, null, 2));

        setSaving(true);

        try {
            await saveResponse(result);
            // Klaar — progress wissen zodat een refresh niet meer terugbrengt.
            clearProgress();
            setResultData(result);
            setPage('results');
        } catch (err) {
            console.error('Quiz save error:', err);
            setError('Er ging iets mis bij het opslaan. Probeer het opnieuw.');
        } finally {
            setSaving(false);
        }
    };

    if (step === -1) {
        return (
            <QuizAanmelding
                onSubmit={(p) => {
                    setProfile((prev) => ({ ...prev, ...p }));
                    setError('');
                    setStep(0);
                }}
            />
        );
    }

    return (
        <div
            style={{
                minHeight: 'calc(100vh - 88px)',
                display: 'flex',
                alignItems: isMobile ? 'flex-start' : 'center',
                justifyContent: 'center',
                padding: isMobile ? '12px 12px 20px' : '16px 20px',
                background: '#f7f2ec',
                boxSizing: 'border-box',
            }}
        >
            <div style={{ width: '100%', maxWidth: 960, display: 'grid', gap: 10 }}>

                {/* Voortgang + teller */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ flex: 1, height: 5, background: '#e6dfd8', borderRadius: 999, overflow: 'hidden' }}>
                        <div style={{ width: `${progress}%`, height: '100%', background: '#b85c5c', borderRadius: 999, transition: 'width 0.3s ease' }} />
                    </div>
                    <span style={{ color: '#999', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1.5, whiteSpace: 'nowrap', fontWeight: 600 }}>
                        {step + 1} / {totalQuestions}
                    </span>
                </div>

                <div
                    ref={questionTopRef}
                    style={{
                        background: 'white',
                        borderRadius: 20,
                        padding: isMobile ? '18px 16px' : '24px 28px 20px',
                        borderTop: '4px solid #1f1b18',
                        border: '1px solid #ddd6ce',
                        boxShadow: '0 12px 32px rgba(31,27,24,0.08)',
                        display: 'grid',
                        gap: 14,
                    }}
                >
                    <div>
                        <h1
                            style={{
                                fontFamily: 'Playfair Display',
                                fontSize: isMobile ? 24 : 28,
                                lineHeight: 1.18,
                                margin: '0 0 6px 0',
                                color: '#1f1b18',
                                fontWeight: 500,
                            }}
                        >
                            {currentQuestion?.q}
                        </h1>

                        <p
                            style={{
                                margin: 0,
                                color: '#6a5f58',
                                fontSize: isMobile ? 13 : 14,
                                lineHeight: 1.45,
                            }}
                        >
                            Kies wat het meest op jou lijkt — niet wat 'goed' klinkt. Ga op je eerste gevoel af.
                        </p>
                    </div>

                    {/* Selectie-instructie — duidelijk zichtbaar boven de opties */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 12,
                        background: '#f7f2ec',
                        borderRadius: 10,
                        padding: '9px 14px',
                        flexWrap: 'wrap',
                    }}>
                        <span style={{ fontSize: 13, color: '#6a5f58', lineHeight: 1.4 }}>
                            Kies <strong style={{ color: '#1f1b18' }}>1, 2 of 3 antwoorden</strong> die het beste bij jou passen. Volgorde telt mee.
                        </span>
                        {/* Visuele teller */}
                        <div style={{ display: 'flex', gap: 5, flexShrink: 0 }}>
                            {[1, 2, 3].map((n) => {
                                const filled = selectedAnswers.length >= n;
                                return (
                                    <div key={n} style={{
                                        width: 26,
                                        height: 26,
                                        borderRadius: 999,
                                        background: filled ? '#b85c5c' : 'white',
                                        border: `1.5px solid ${filled ? '#b85c5c' : '#ddd'}`,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: 11,
                                        fontWeight: 700,
                                        color: filled ? 'white' : '#bbb',
                                        transition: 'all 0.15s ease',
                                    }}>
                                        {n}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
                            gap: isMobile ? 7 : 8,
                        }}
                    >
                        {shuffledOptions.map((option, index) => {
                            const selectedIndex = selectedAnswers.findIndex(
                                (item) => item.text === option.text
                            );
                            const isSelected = selectedIndex !== -1;
                            const orderBadge =
                                selectedIndex === 0 ? '1' :
                                    selectedIndex === 1 ? '2' :
                                        selectedIndex === 2 ? '3' : '+';

                            return (
                                <button
                                    key={`${option.text}-${index}`}
                                    type="button"
                                    onClick={() => toggleAnswer(option)}
                                    onMouseLeave={(e) => e.currentTarget.blur()}
                                    style={{
                                        padding: isMobile ? '10px 12px' : '11px 14px',
                                        borderRadius: 12,
                                        border: isSelected ? '2px solid #b85c5c' : '1px solid #ddd',
                                        background: isSelected ? '#fcf1f1' : 'white',
                                        textAlign: 'left',
                                        cursor: 'pointer',
                                        fontSize: isMobile ? 14 : 15,
                                        lineHeight: 1.35,
                                        transition: '0.2s',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        gap: 10,
                                        outline: 'none',
                                        minHeight: isMobile ? 48 : 50,
                                    }}
                                >
                                    <span style={{ paddingRight: 6 }}>{option.text}</span>
                                    <span
                                        style={{
                                            minWidth: 26,
                                            height: 26,
                                            borderRadius: 999,
                                            background: isSelected ? '#b85c5c' : '#efe8df',
                                            color: isSelected ? 'white' : '#7a6d66',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: 12,
                                            fontWeight: 700,
                                            flexShrink: 0,
                                        }}
                                    >
                                        {orderBadge}
                                    </span>
                                </button>
                            );
                        })}
                    </div>

                    {error && (
                        <div style={{ color: '#b85c5c', fontSize: 14 }}>
                            {error}
                        </div>
                    )}

                    <div style={{
                        marginTop: 2,
                        display: 'flex',
                        justifyContent: 'flex-end',
                        alignItems: 'center',
                        gap: 12,
                    }}>

                        <button
                            type="button"
                            onClick={handleNext}
                            disabled={saving || selectedAnswers.length === 0}
                            style={{
                                background: saving || selectedAnswers.length === 0 ? '#d8cec5' : '#1f1b18',
                                color: 'white',
                                padding: '13px 22px',
                                borderRadius: 12,
                                border: 'none',
                                cursor: saving || selectedAnswers.length === 0 ? 'not-allowed' : 'pointer',
                                fontSize: 15,
                                fontWeight: 600,
                                minWidth: isMobile ? '100%' : 200,
                                boxShadow: saving || selectedAnswers.length === 0 ? 'none' : '0 4px 14px rgba(31,27,24,0.18)',
                                transition: 'transform 0.15s, box-shadow 0.15s',
                            }}
                            onMouseEnter={e => { if (selectedAnswers.length > 0) { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(31,27,24,0.24)'; } }}
                            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = selectedAnswers.length > 0 ? '0 4px 14px rgba(31,27,24,0.18)' : 'none'; }}
                        >
                            {saving
                                ? 'Bezig...'
                                : step + 1 === totalQuestions
                                    ? 'Naar mijn resultaat'
                                    : 'Volgende vraag'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}