/**
 * StrategicQuiz — quiz-flow voor de Strategic Tool (Module 3)
 *
 * Parallel aan Quiz.jsx (Persona Tool) maar simpeler:
 *   - 8 vragen (4 assen × 2)
 *   - Single-select A/B/C/D per vraag
 *   - Geen shuffle: bewust in vaste volgorde zodat de assen mengen
 *
 * Antwoorden worden opgeslagen in component-state. Bij submit:
 *   1. Score berekenen (scoreResponse)
 *   2. Resultaat doorgeven aan StrategicResult via setStrategicResult
 *   3. setPage('strategicresult')
 */

import React, { useEffect, useState, useRef } from 'react';
import { PageShell, PrimaryButton, SecondaryButton } from '../ui/AppShell';
import { SPACING, TYPE } from '../ui/tokens';
import { STRATEGIC_QUESTIONS, getAxis } from '../data/strategicQuestions';
import { scoreResponse } from '../utils/strategicScoring';

const ACCENT = 'var(--tof-accent-rose)';

export default function StrategicQuiz({ setPage, setStrategicResult, selectedTeam }) {
    const [step, setStep] = useState(0);
    const [answers, setAnswers] = useState({});
    const [profile, setProfile] = useState({
        name: '',
        role: '',
        organization: selectedTeam?.organization || '',
        team: selectedTeam?.team || '',
    });
    const [selected, setSelected] = useState(null);
    const [error, setError] = useState('');
    const topRef = useRef(null);

    const totalQuestions = STRATEGIC_QUESTIONS.length;
    const isProfileStep = step === 0;
    const questionIndex = step - 1;
    const isQuestionStep = questionIndex >= 0 && questionIndex < totalQuestions;
    const isDoneStep = step > totalQuestions;
    const currentQuestion = isQuestionStep ? STRATEGIC_QUESTIONS[questionIndex] : null;
    const currentAxis = currentQuestion ? getAxis(currentQuestion.axisId) : null;

    // Scroll to top on step change
    useEffect(() => {
        if (topRef.current) {
            topRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, [step]);

    // Pre-select previously chosen answer if user navigates back
    useEffect(() => {
        if (currentQuestion) {
            setSelected(answers[currentQuestion.id] || null);
            setError('');
        }
    }, [currentQuestion, answers]);

    const progress = isProfileStep
        ? 0
        : Math.round(((questionIndex + (selected ? 1 : 0)) / totalQuestions) * 100);

    function handleNext() {
        if (isProfileStep) {
            setStep(1);
            return;
        }
        if (!selected) {
            setError('Maak een keuze voor je verder gaat.');
            return;
        }
        const updated = { ...answers, [currentQuestion.id]: selected };
        setAnswers(updated);

        if (questionIndex === totalQuestions - 1) {
            // Done — score en doorgaan naar result
            const result = scoreResponse(updated);
            const payload = { ...result, profile, answers: updated };
            if (typeof setStrategicResult === 'function') setStrategicResult(payload);
            // Save naar localStorage als simpele persist
            try {
                const stored = JSON.parse(localStorage.getItem('tof_strategic_responses') || '[]');
                stored.push({ ...payload, at: new Date().toISOString() });
                localStorage.setItem('tof_strategic_responses', JSON.stringify(stored));
            } catch { /* ignore */ }
            setStep(step + 1);
            setPage && setPage('strategicresult');
            return;
        }
        setStep(step + 1);
    }

    function handleBack() {
        if (step === 0) {
            setPage && setPage('strategicintro');
            return;
        }
        setStep(step - 1);
    }

    return (
        <PageShell compact>
            <div ref={topRef} />

            {/* Progress + step counter */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: SPACING.md,
                fontSize: 12,
                color: 'var(--tof-text-muted)',
                textTransform: 'uppercase',
                letterSpacing: 0.6,
                fontWeight: 600,
            }}>
                <span>
                    {isProfileStep
                        ? 'Even kort over jou'
                        : isDoneStep
                            ? 'Klaar'
                            : `Vraag ${questionIndex + 1} van ${totalQuestions}`}
                </span>
                <div style={{
                    flex: 1,
                    height: 4,
                    background: '#EFE3D6',
                    borderRadius: 999,
                    overflow: 'hidden',
                }}>
                    <div style={{
                        height: '100%',
                        width: `${progress}%`,
                        background: ACCENT,
                        borderRadius: 999,
                        transition: 'width 0.3s ease',
                    }} />
                </div>
                <span>{progress}%</span>
            </div>

            {isProfileStep && (
                <ProfileStep
                    profile={profile}
                    setProfile={setProfile}
                />
            )}

            {isQuestionStep && currentQuestion && (
                <QuestionStep
                    question={currentQuestion}
                    axis={currentAxis}
                    selected={selected}
                    onSelect={setSelected}
                />
            )}

            {error && (
                <div style={{
                    background: '#FBE6E6',
                    border: '1px solid #B05252',
                    borderRadius: 10,
                    padding: '10px 14px',
                    fontSize: 14,
                    color: '#B05252',
                }}>
                    {error}
                </div>
            )}

            <div style={{ display: 'flex', gap: SPACING.sm + 2, flexWrap: 'wrap' }}>
                <PrimaryButton
                    onClick={handleNext}
                    style={{ background: ACCENT, borderColor: ACCENT }}
                >
                    {isProfileStep
                        ? 'Start →'
                        : questionIndex === totalQuestions - 1
                            ? 'Toon mijn profiel →'
                            : 'Volgende →'}
                </PrimaryButton>
                <SecondaryButton onClick={handleBack}>
                    ← Terug
                </SecondaryButton>
            </div>
        </PageShell>
    );
}

// ─── SUB-COMPONENTS ──────────────────────────────────────────────────────────

function ProfileStep({ profile, setProfile }) {
    const fields = [
        { key: 'name', label: 'Je naam (optioneel)', placeholder: 'Bv. Judith Dorlandt' },
        { key: 'role', label: 'Je rol of functie (optioneel)', placeholder: 'Bv. CEO, COO, MT-lid' },
        { key: 'organization', label: 'Organisatie', placeholder: 'Bv. The Office Factory' },
        { key: 'team', label: 'MT/team-naam (optioneel)', placeholder: 'Bv. Demo Team 3' },
    ];

    return (
        <div style={{
            background: 'var(--tof-surface)',
            border: '1px solid var(--tof-border)',
            borderTop: `4px solid ${ACCENT}`,
            borderRadius: 18,
            padding: '24px 26px',
            display: 'grid',
            gap: SPACING.md,
        }}>
            <div>
                <div style={{ ...TYPE.eyebrow, color: ACCENT }}>
                    Even kort over jou
                </div>
                <h2 style={{ ...TYPE.heading, margin: '8px 0 0' }}>
                    Voor we beginnen.
                </h2>
                <p style={{ ...TYPE.body, color: 'var(--tof-text-soft)', margin: '12px 0 0' }}>
                    De Strategic Tool werkt het beste als we je antwoorden bij de juiste organisatie kunnen koppelen. Naam en rol zijn optioneel — organisatienaam helpt om jouw input bij het juiste MT-rapport te leggen.
                </p>
            </div>

            <div style={{ display: 'grid', gap: SPACING.sm + 2 }}>
                {fields.map((f) => (
                    <label key={f.key} style={{ display: 'grid', gap: 4 }}>
                        <span style={{
                            ...TYPE.eyebrow,
                            color: 'var(--tof-text-muted)',
                            fontSize: 11,
                        }}>
                            {f.label}
                        </span>
                        <input
                            type="text"
                            value={profile[f.key] || ''}
                            onChange={(e) => setProfile({ ...profile, [f.key]: e.target.value })}
                            placeholder={f.placeholder}
                            style={{
                                padding: '12px 14px',
                                borderRadius: 12,
                                border: '1px solid var(--tof-border)',
                                fontSize: 15,
                                outline: 'none',
                                background: 'var(--tof-bg)',
                            }}
                        />
                    </label>
                ))}
            </div>
        </div>
    );
}

function QuestionStep({ question, axis, selected, onSelect }) {
    return (
        <div style={{
            background: 'var(--tof-surface)',
            border: '1px solid var(--tof-border)',
            borderTop: `4px solid ${ACCENT}`,
            borderRadius: 18,
            padding: '24px 26px',
            display: 'grid',
            gap: SPACING.md,
        }}>
            <div>
                <div style={{ ...TYPE.eyebrow, color: ACCENT }}>
                    {axis ? `As · ${axis.label}` : 'Vraag'}
                </div>
                <h2 style={{ ...TYPE.heading, margin: '10px 0 0', fontSize: 26, lineHeight: 1.15 }}>
                    {question.question}
                </h2>
                {question.context && (
                    <p style={{
                        ...TYPE.body,
                        color: 'var(--tof-text-soft)',
                        margin: '14px 0 0',
                        fontSize: 15,
                        lineHeight: 1.65,
                    }}>
                        {question.context}
                    </p>
                )}
            </div>

            <div style={{ display: 'grid', gap: SPACING.sm + 2 }}>
                {question.options.map((opt) => {
                    const isSelected = selected === opt.letter;
                    return (
                        <button
                            key={opt.letter}
                            type="button"
                            onClick={() => onSelect(opt.letter)}
                            style={{
                                textAlign: 'left',
                                background: isSelected ? 'rgba(176,82,82,0.08)' : 'var(--tof-bg)',
                                border: isSelected ? `2px solid ${ACCENT}` : '1px solid var(--tof-border)',
                                borderRadius: 14,
                                padding: '14px 16px',
                                cursor: 'pointer',
                                display: 'grid',
                                gridTemplateColumns: '32px 1fr',
                                gap: SPACING.md,
                                alignItems: 'baseline',
                                transition: 'all 0.15s ease',
                            }}
                        >
                            <span style={{
                                ...TYPE.eyebrow,
                                color: isSelected ? ACCENT : 'var(--tof-text-muted)',
                                fontSize: 13,
                                fontWeight: 700,
                            }}>
                                {opt.letter}.
                            </span>
                            <div style={{ display: 'grid', gap: 4 }}>
                                <div style={{
                                    ...TYPE.subhead,
                                    fontSize: 15,
                                    color: 'var(--tof-text)',
                                    fontWeight: 500,
                                    lineHeight: 1.4,
                                }}>
                                    {opt.label}
                                </div>
                                {opt.detail && (
                                    <p style={{
                                        ...TYPE.body,
                                        margin: 0,
                                        fontSize: 13.5,
                                        color: 'var(--tof-text-soft)',
                                        lineHeight: 1.55,
                                    }}>
                                        {opt.detail}
                                    </p>
                                )}
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
