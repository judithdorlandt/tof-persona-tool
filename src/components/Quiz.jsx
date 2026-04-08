import { useEffect, useMemo, useState } from 'react';
import { ARCHETYPES, QUESTIONS } from '../data';
import { saveResponse } from '../supabase';

function shuffleArray(array) {
    const copy = [...array];
    for (let i = copy.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
}

export default function Quiz({ setPage, setResultData }) {
    const [step, setStep] = useState(-1);
    const [profile, setProfile] = useState({
        name: '',
        org: '',
        dept: '',
        team: '',
    });
    const [scores, setScores] = useState(
        Object.fromEntries(ARCHETYPES.map((a) => [a.id, 0]))
    );
    const [selectedAnswers, setSelectedAnswers] = useState([]);
    const [shuffledOptions, setShuffledOptions] = useState([]);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    const totalQuestions = QUESTIONS.length;
    const current = step >= 0 ? QUESTIONS[step] : null;

    useEffect(() => {
        const onResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);

    useEffect(() => {
        if (step < 0 || !current) return;

        const optionObjects = current.a.map((answerText, index) => ({
            text: answerText,
            archetypeId: ARCHETYPES[index]?.id,
            originalIndex: index,
        }));

        setShuffledOptions(shuffleArray(optionObjects));
        setSelectedAnswers([]);
    }, [step, current]);

    const progress = useMemo(() => {
        if (step < 0) return 0;
        return ((step + 1) / totalQuestions) * 100;
    }, [step, totalQuestions]);

    const startQuiz = () => {
        if (!profile.team.trim()) {
            setError('Vul minimaal een teamnaam in.');
            return;
        }
        setError('');
        setStep(0);
    };

    const toggleAnswer = (option) => {
        const exists = selectedAnswers.find((item) => item.text === option.text);

        if (exists) {
            setSelectedAnswers((prev) =>
                prev.filter((item) => item.text !== option.text)
            );
            return;
        }

        if (selectedAnswers.length >= 3) return;

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
            .map((a) => ({
                ...a,
                score: weightedScores[a.id] || 0,
            }))
            .sort((a, b) => b.score - a.score);

        const result = {
            ...profile,
            primary: sorted[0]?.id || null,
            secondary: sorted[1]?.id || null,
            tertiary: sorted[2]?.id || null,
            scores: weightedScores,
        };

        setSaving(true);

        try {
            await saveResponse(result);
        } catch (e) {
            console.error(e);
        }

        setSaving(false);
        setResultData(result);
        setPage('results');
    };

    if (step === -1) {
        return (
            <div
                style={{
                    minHeight: 'calc(100vh - 88px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: isMobile ? '20px 16px 28px' : '24px 20px',
                    background: '#f7f2ec',
                    boxSizing: 'border-box',
                }}
            >
                <div
                    style={{
                        width: '100%',
                        maxWidth: 760,
                        display: 'grid',
                        gap: 18,
                    }}
                >
                    <div>
                        <div
                            style={{
                                color: '#b85c5c',
                                letterSpacing: 2,
                                fontSize: 12,
                                marginBottom: 12,
                                textTransform: 'uppercase',
                            }}
                        >
                            03 — Voor je begint
                        </div>

                        <h1
                            style={{
                                fontSize: isMobile ? 34 : 42,
                                lineHeight: 1.08,
                                fontFamily: 'Playfair Display',
                                fontWeight: 500,
                                margin: 0,
                                color: '#1f1b18',
                            }}
                        >
                            Over jouw context
                        </h1>

                        <p
                            style={{
                                marginTop: 14,
                                maxWidth: 620,
                                lineHeight: 1.6,
                                color: '#444',
                                fontSize: isMobile ? 15 : 17,
                            }}
                        >
                            Deze informatie gebruiken we om jouw profiel op te slaan en later te
                            kunnen vertalen naar team- of organisatie-inzichten.
                        </p>
                    </div>

                    <div
                        style={{
                            background: 'white',
                            borderRadius: 16,
                            padding: isMobile ? 18 : 24,
                            borderTop: '4px solid #b85c5c',
                            display: 'grid',
                            gap: 14,
                            boxShadow: '0 10px 26px rgba(70, 45, 35, 0.05)',
                        }}
                    >
                        <FormField
                            label="Naam"
                            optional
                            value={profile.name}
                            onChange={(value) => setProfile((p) => ({ ...p, name: value }))}
                        />

                        <FormField
                            label="Organisatie"
                            value={profile.org}
                            onChange={(value) => setProfile((p) => ({ ...p, org: value }))}
                        />

                        <FormField
                            label="Afdeling"
                            value={profile.dept}
                            onChange={(value) => setProfile((p) => ({ ...p, dept: value }))}
                        />

                        <FormField
                            label="Team"
                            required
                            value={profile.team}
                            onChange={(value) => setProfile((p) => ({ ...p, team: value }))}
                        />

                        {error && <div style={{ color: '#b85c5c', fontSize: 14 }}>{error}</div>}

                        <button
                            onClick={startQuiz}
                            style={{
                                marginTop: 4,
                                background: '#b85c5c',
                                color: 'white',
                                padding: '13px 20px',
                                borderRadius: 10,
                                border: 'none',
                                cursor: 'pointer',
                                fontSize: 15,
                                fontWeight: 500,
                                width: isMobile ? '100%' : 'auto',
                            }}
                        >
                            Verder naar de vragen
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div
            style={{
                minHeight: 'calc(100vh - 88px)',
                display: 'flex',
                alignItems: isMobile ? 'flex-start' : 'center',
                justifyContent: 'center',
                padding: isMobile ? '16px 12px 20px' : '18px 20px',
                background: '#f7f2ec',
                boxSizing: 'border-box',
            }}
        >
            <div
                style={{
                    width: '100%',
                    maxWidth: 1020,
                    display: 'grid',
                    gap: 12,
                }}
            >
                <div
                    style={{
                        height: 6,
                        background: '#e6dfd8',
                        borderRadius: 999,
                        overflow: 'hidden',
                    }}
                >
                    <div
                        style={{
                            width: `${progress}%`,
                            height: '100%',
                            background: '#b85c5c',
                            transition: '0.3s',
                        }}
                    />
                </div>

                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginBottom: 2,
                        color: '#777',
                        fontSize: 11,
                        textTransform: 'uppercase',
                        letterSpacing: 1.5,
                    }}
                >
                    <span>
                        Vraag {step + 1} van {totalQuestions}
                    </span>
                    <span>{Math.round(progress)}%</span>
                </div>

                <div
                    style={{
                        background: 'white',
                        borderRadius: 18,
                        padding: isMobile ? '16px 14px 14px' : '20px 22px 18px',
                        borderTop: '4px solid #b85c5c',
                        boxShadow: '0 10px 26px rgba(70, 45, 35, 0.05)',
                        display: 'grid',
                        gap: 12,
                    }}
                >
                    <div>
                        <h1
                            style={{
                                fontFamily: 'Playfair Display',
                                fontSize: isMobile ? 28 : 34,
                                lineHeight: 1.15,
                                margin: '0 0 8px 0',
                                color: '#1f1b18',
                            }}
                        >
                            {current?.q}
                        </h1>

                        <p
                            style={{
                                margin: 0,
                                color: '#6a5f58',
                                fontSize: isMobile ? 13 : 14,
                                lineHeight: 1.45,
                            }}
                        >
                            Kies maximaal 3 antwoorden. Begin met wat het meest dichtbij voelt.
                        </p>
                    </div>

                    <div
                        style={{
                            display: 'grid',
                            gap: isMobile ? 8 : 10,
                        }}
                    >
                        {shuffledOptions.map((option, i) => {
                            const selectedIndex = selectedAnswers.findIndex(
                                (item) => item.text === option.text
                            );
                            const isSelected = selectedIndex !== -1;
                            const orderBadge =
                                selectedIndex === 0
                                    ? '1'
                                    : selectedIndex === 1
                                        ? '2'
                                        : selectedIndex === 2
                                            ? '3'
                                            : '+';

                            return (
                                <button
                                    key={`${option.text}-${i}`}
                                    type="button"
                                    onClick={() => toggleAnswer(option)}
                                    onMouseLeave={(e) => e.currentTarget.blur()}
                                    style={{
                                        padding: isMobile ? '12px 12px' : '13px 16px',
                                        borderRadius: 12,
                                        border: isSelected ? '2px solid #b85c5c' : '1px solid #ddd',
                                        background: isSelected ? '#fcf1f1' : 'white',
                                        textAlign: 'left',
                                        cursor: 'pointer',
                                        fontSize: isMobile ? 15 : 16,
                                        lineHeight: 1.35,
                                        transition: '0.2s',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        gap: 12,
                                        outline: 'none',
                                        minHeight: isMobile ? 56 : 58,
                                    }}
                                >
                                    <span style={{ paddingRight: 8 }}>{option.text}</span>

                                    <span
                                        style={{
                                            minWidth: isMobile ? 28 : 30,
                                            height: isMobile ? 28 : 30,
                                            borderRadius: 999,
                                            background: isSelected ? '#b85c5c' : '#efe8df',
                                            color: isSelected ? 'white' : '#7a6d66',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: 13,
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
                        <div style={{ color: '#b85c5c', fontSize: 14 }}>{error}</div>
                    )}

                    <div
                        style={{
                            marginTop: 2,
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: isMobile ? 'stretch' : 'center',
                            gap: 12,
                            flexWrap: 'wrap',
                        }}
                    >
                        <div
                            style={{
                                color: '#7a6d66',
                                fontSize: 13,
                                lineHeight: 1.4,
                            }}
                        >
                            {selectedAnswers.length === 0
                                ? 'Nog niets gekozen'
                                : `${selectedAnswers.length} antwoord${selectedAnswers.length > 1 ? 'en' : ''
                                } gekozen`}
                        </div>

                        <button
                            onClick={handleNext}
                            disabled={saving || selectedAnswers.length === 0}
                            style={{
                                background:
                                    saving || selectedAnswers.length === 0 ? '#d8cec5' : '#1f1b18',
                                color: 'white',
                                padding: '13px 18px',
                                borderRadius: 12,
                                border: 'none',
                                cursor:
                                    saving || selectedAnswers.length === 0 ? 'not-allowed' : 'pointer',
                                fontSize: 15,
                                fontWeight: 500,
                                minWidth: isMobile ? '100%' : 190,
                            }}
                        >
                            {saving
                                ? 'Bezig...'
                                : step + 1 === totalQuestions
                                    ? 'Bekijk resultaat'
                                    : 'Volgende'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function FormField({ label, value, onChange, optional = false, required = false }) {
    return (
        <div>
            <label style={{ display: 'block', marginBottom: 6, fontWeight: 600 }}>
                {label}{' '}
                {optional && <span style={{ color: '#777', fontWeight: 400 }}>(optioneel)</span>}
                {required && <span style={{ color: '#b85c5c' }}>*</span>}
            </label>
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: 10,
                    border: '1px solid #ddd',
                    fontSize: 15,
                    boxSizing: 'border-box',
                }}
            />
        </div>
    );
}