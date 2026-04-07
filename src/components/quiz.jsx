import { useState } from 'react';
import { ARCHETYPES, QUESTIONS } from '../data';
import { saveResponse } from '../supabase';

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

    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const totalQuestions = QUESTIONS.length;

    const startQuiz = () => {
        if (!profile.team.trim()) {
            setError('Vul minimaal een teamnaam in.');
            return;
        }
        setError('');
        setStep(0);
    };

    const handleAnswer = async (optionIndex) => {
        const archetype = ARCHETYPES[optionIndex];
        const nextScores = {
            ...scores,
            [archetype.id]: scores[archetype.id] + 1,
        };

        if (step + 1 < totalQuestions) {
            setScores(nextScores);
            setStep(step + 1);
            return;
        }

        const sorted = [...ARCHETYPES]
            .map((a) => ({
                ...a,
                score: nextScores[a.id] || 0,
            }))
            .sort((a, b) => b.score - a.score);

        const result = {
            ...profile,
            primary: sorted[0]?.id || null,
            secondary: sorted[1]?.id || null,
            tertiary: sorted[2]?.id || null,
            scores: nextScores,
        };

        setSaving(true);
        setError('');

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
            <div style={{ maxWidth: 760, margin: '0 auto', padding: '40px 24px 56px' }}>
                <div
                    style={{
                        color: '#b85c5c',
                        letterSpacing: 2,
                        fontSize: 12,
                        marginBottom: 12,
                        textTransform: 'uppercase',
                    }}
                >
                    02 — Voor je begint
                </div>

                <h1
                    style={{
                        fontSize: 42,
                        lineHeight: 1.1,
                        fontFamily: 'Playfair Display',
                        fontWeight: 500,
                        margin: 0,
                    }}
                >
                    Over jouw context
                </h1>

                <p
                    style={{
                        marginTop: 18,
                        maxWidth: 620,
                        lineHeight: 1.6,
                        color: '#444',
                        fontSize: 17,
                    }}
                >
                    Deze informatie gebruiken we om jouw profiel op te slaan en later te
                    kunnen vertalen naar team- of organisatie-inzichten.
                </p>

                <div
                    style={{
                        marginTop: 28,
                        background: 'white',
                        borderRadius: 16,
                        padding: 24,
                        borderTop: '4px solid #b85c5c',
                        display: 'grid',
                        gap: 16,
                    }}
                >
                    <div>
                        <label style={{ display: 'block', marginBottom: 6, fontWeight: 600 }}>
                            Naam <span style={{ color: '#777', fontWeight: 400 }}>(optioneel)</span>
                        </label>
                        <input
                            type="text"
                            value={profile.name}
                            onChange={(e) =>
                                setProfile((p) => ({ ...p, name: e.target.value }))
                            }
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

                    <div>
                        <label style={{ display: 'block', marginBottom: 6, fontWeight: 600 }}>
                            Organisatie
                        </label>
                        <input
                            type="text"
                            value={profile.org}
                            onChange={(e) =>
                                setProfile((p) => ({ ...p, org: e.target.value }))
                            }
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

                    <div>
                        <label style={{ display: 'block', marginBottom: 6, fontWeight: 600 }}>
                            Afdeling
                        </label>
                        <input
                            type="text"
                            value={profile.dept}
                            onChange={(e) =>
                                setProfile((p) => ({ ...p, dept: e.target.value }))
                            }
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

                    <div>
                        <label style={{ display: 'block', marginBottom: 6, fontWeight: 600 }}>
                            Team <span style={{ color: '#b85c5c' }}>*</span>
                        </label>
                        <input
                            type="text"
                            value={profile.team}
                            onChange={(e) =>
                                setProfile((p) => ({ ...p, team: e.target.value }))
                            }
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

                    {error && (
                        <div style={{ color: '#b85c5c', fontSize: 14 }}>{error}</div>
                    )}

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
                        }}
                    >
                        Verder naar de vragen
                    </button>
                </div>
            </div>
        );
    }

    const progress = ((step + 1) / totalQuestions) * 100;
    const current = QUESTIONS[step];

    return (
        <div
            style={{
                maxWidth: 860,
                margin: '0 auto',
                padding: '24px 20px 40px',
                minHeight: 'calc(100vh - 90px)',
                boxSizing: 'border-box',
                display: 'flex',
                alignItems: 'flex-start',
            }}
        >
            <div style={{ width: '100%' }}>
                <div
                    style={{
                        height: 6,
                        background: '#eee',
                        borderRadius: 999,
                        overflow: 'hidden',
                        marginBottom: 20,
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
                        marginBottom: 12,
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
                        padding: '24px 24px 20px',
                        borderTop: '4px solid #b85c5c',
                    }}
                >
                    <h1
                        style={{
                            fontFamily: 'Playfair Display',
                            fontSize: 34,
                            lineHeight: 1.2,
                            margin: '0 0 18px 0',
                        }}
                    >
                        {current.q}
                    </h1>

                    <div style={{ display: 'grid', gap: 10 }}>
                        {current.a.map((answer, i) => (
                            <button
                                key={i}
                                disabled={saving}
                                onClick={() => handleAnswer(i)}
                                style={{
                                    padding: '14px 16px',
                                    borderRadius: 12,
                                    border: '1px solid #ddd',
                                    background: 'white',
                                    textAlign: 'left',
                                    cursor: 'pointer',
                                    fontSize: 15,
                                    lineHeight: 1.4,
                                    transition: '0.2s',
                                }}
                                onMouseOver={(e) => {
                                    e.currentTarget.style.border = '1px solid #b85c5c';
                                    e.currentTarget.style.background = '#fcf7f4';
                                }}
                                onMouseOut={(e) => {
                                    e.currentTarget.style.border = '1px solid #ddd';
                                    e.currentTarget.style.background = 'white';
                                }}
                            >
                                {answer}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}