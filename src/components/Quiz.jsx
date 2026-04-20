import { useEffect, useMemo, useState, useRef } from 'react';
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

function createEmptyScores() {
    return Object.fromEntries(ARCHETYPES.map((archetype) => [archetype.id, 0]));
}

export default function Quiz({ setPage, setResultData }) {
    const [step, setStep] = useState(-1);
    const [profile, setProfile] = useState({
        name: '',
        org: '',
        dept: '',
        has_multiple_teams: '',
        team: '',
        invite_code: '',
        role: '',
        team_size: '',
    });
    const [scores, setScores] = useState(createEmptyScores());
    const questionTopRef = useRef(null);
    const [selectedAnswers, setSelectedAnswers] = useState([]);
    const [shuffledOptions, setShuffledOptions] = useState([]);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

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

    const updateProfileField = (field, value) => {
        setProfile((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const startQuiz = () => {
        const hasOrg = profile.org.trim() !== '';
        const hasDept = profile.dept.trim() !== '';
        const hasMultipleTeams = profile.has_multiple_teams === 'yes';
        const hasAnsweredTeamQuestion =
            profile.has_multiple_teams === 'yes' || profile.has_multiple_teams === 'no';
        const hasTeam = profile.team.trim() !== '';

        if (!hasOrg) {
            setError('Vul je organisatie in.');
            return;
        }

        if (!hasDept) {
            setError('Vul je afdeling in.');
            return;
        }

        if (!hasAnsweredTeamQuestion) {
            setError('Geef aan of jouw afdeling uit meerdere teams bestaat.');
            return;
        }

        if (hasMultipleTeams && !hasTeam) {
            setError('Vul je team in.');
            return;
        }

        setError('');
        setStep(0);
    };

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

        const normalizedTeam =
            profile.has_multiple_teams === 'yes' ? profile.team.trim() : profile.dept.trim();

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
            <div
                style={{
                    minHeight: 'calc(100vh - 88px)',
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'center',
                    padding: isMobile ? '16px 16px 28px' : '20px 20px 32px',
                    background: '#f7f2ec',
                    boxSizing: 'border-box',
                }}
            >
                <div style={{ width: '100%', maxWidth: 680, display: 'grid', gap: 14 }}>

                    {/* ── HERO — rode identiteit ──────────────────────── */}
                    <div style={{
                        background: '#fff',
                        borderRadius: 20,
                        border: '1px solid #e7ddd4',
                        boxShadow: '0 10px 26px rgba(70,45,35,0.05)',
                        padding: isMobile ? '22px 18px 20px' : '30px 34px 26px',
                        position: 'relative',
                        overflow: 'hidden',
                    }}>
                        <div style={{ position: 'absolute', left: 0, top: 0, width: 4, height: '100%', background: '#b85c5c', borderRadius: '4px 0 0 4px' }} />
                        <div style={{ paddingLeft: isMobile ? 8 : 12 }}>
                            <div style={{ color: '#b85c5c', letterSpacing: 2, fontSize: 11, textTransform: 'uppercase', fontWeight: 700, marginBottom: 10 }}>
                                03 — Jouw context
                            </div>
                            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap' }}>
                                <h1 style={{ margin: 0, fontFamily: 'Playfair Display', fontWeight: 500, fontSize: isMobile ? 28 : 36, lineHeight: 1.06, color: '#1f1b18' }}>
                                    Over jouw{' '}
                                    <em style={{ color: '#b85c5c', fontStyle: 'italic' }}>context</em>
                                </h1>
                                {!isMobile && (
                                    <p style={{ margin: 0, maxWidth: 220, fontSize: 13, lineHeight: 1.6, color: '#777', paddingBottom: 3, flexShrink: 0 }}>
                                        Organisatie en afdeling zijn verplicht. De rest is optioneel.
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* ── FORMULIER ───────────────────────────────────── */}
                    <div style={{
                        background: 'white',
                        borderRadius: 18,
                        padding: isMobile ? '16px 14px' : '20px 22px',
                        border: '1px solid #e7ddd4',
                        boxShadow: '0 10px 26px rgba(70,45,35,0.05)',
                        display: 'grid',
                        gap: 12,
                    }}>
                        {/* Naam — één kolom breed */}
                        <FormField
                            label="Voornaam"
                            optional
                            value={profile.name}
                            onChange={(value) => updateProfileField('name', value)}
                        />

                        {/* Organisatie + Afdeling naast elkaar */}
                        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 12 }}>
                            <FormField
                                label="Organisatie"
                                required
                                placeholder="Jouw organisatie"
                                value={profile.org}
                                onChange={(value) => updateProfileField('org', value)}
                            />
                            <FormField
                                label="Afdeling"
                                required
                                placeholder="Bijv. HR of Finance"
                                value={profile.dept}
                                onChange={(value) => updateProfileField('dept', value)}
                            />
                        </div>

                        {/* Meerdere teams? */}
                        <ChoiceField
                            label="Bestaat jouw afdeling uit meerdere teams?"
                            required
                            value={profile.has_multiple_teams}
                            onChange={(value) => {
                                updateProfileField('has_multiple_teams', value);
                                if (value === 'no') updateProfileField('team', '');
                            }}
                            options={[
                                { label: 'Ja', value: 'yes' },
                                { label: 'Nee', value: 'no' },
                            ]}
                        />

                        {profile.has_multiple_teams === 'yes' && (
                            <FormField
                                label="Team"
                                required
                                placeholder="Bijv. directieteam of projectteam"
                                value={profile.team}
                                onChange={(value) => updateProfileField('team', value)}
                            />
                        )}

                        {/* Rol + Teamgrootte naast elkaar */}
                        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 12 }}>
                            <FormField
                                label="Rol"
                                placeholder="Bijv. teamleider of adviseur"
                                value={profile.role}
                                onChange={(value) => updateProfileField('role', value)}
                            />
                            <FormField
                                label="Teamgrootte"
                                placeholder="Bijv. 5-10"
                                value={profile.team_size}
                                onChange={(value) => updateProfileField('team_size', value)}
                            />
                        </div>

                        <FormField
                            label="Teamcode"
                            placeholder="Alleen invullen als je die hebt ontvangen"
                            value={profile.invite_code}
                            onChange={(value) => updateProfileField('invite_code', value)}
                        />

                        {error && (
                            <div style={{ color: '#b85c5c', fontSize: 13 }}>{error}</div>
                        )}

                        <button
                            type="button"
                            onClick={startQuiz}
                            style={{
                                marginTop: 4,
                                background: '#b85c5c',
                                color: 'white',
                                padding: '13px 22px',
                                borderRadius: 10,
                                border: 'none',
                                cursor: 'pointer',
                                fontSize: 15,
                                fontWeight: 600,
                                width: isMobile ? '100%' : 'auto',
                                boxShadow: '0 4px 14px rgba(176,82,82,0.28)',
                                transition: 'transform 0.15s, box-shadow 0.15s',
                            }}
                            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(176,82,82,0.36)'; }}
                            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(176,82,82,0.28)'; }}
                        >
                            Start de vragen →
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

function FormField({
    label,
    value,
    onChange,
    placeholder = '',
    optional = false,
    required = false,
}) {
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
                placeholder={placeholder}
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

function ChoiceField({ label, value, onChange, options, required = false }) {
    return (
        <div>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>
                {label} {required && <span style={{ color: '#b85c5c' }}>*</span>}
            </label>

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {options.map((option) => {
                    const active = value === option.value;

                    return (
                        <button
                            key={option.value}
                            type="button"
                            onClick={() => onChange(option.value)}
                            style={{
                                padding: '10px 14px',
                                borderRadius: 10,
                                border: active ? '2px solid #b85c5c' : '1px solid #ddd',
                                background: active ? '#fcf1f1' : 'white',
                                color: '#1f1b18',
                                cursor: 'pointer',
                                fontSize: 14,
                                fontWeight: 500,
                            }}
                        >
                            {option.label}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}