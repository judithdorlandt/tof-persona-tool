import { useState } from 'react';
import { saveFeedback } from '../supabase';

export default function Feedback({ primaryPersonaName = '' }) {
    const [fit, setFit] = useState('');
    const [reason, setReason] = useState('');
    const [teamUse, setTeamUse] = useState('');
    const [email, setEmail] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const fitOptions = [
        { value: 'spot_on', label: 'Spot on' },
        { value: 'recognizable', label: 'Herkenbaar' },
        { value: 'doubt', label: 'Twijfel' },
        { value: 'not_really', label: 'Niet echt' },
    ];

    const teamOptions = [
        { value: 'yes', label: 'Ja' },
        { value: 'maybe', label: 'Misschien' },
        { value: 'no', label: 'Nee' },
    ];

    const showReason = !!fit;
    const showTeamUse = fit === 'spot_on' || fit === 'recognizable';
    const showEmail = teamUse === 'yes' || teamUse === 'maybe';

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSaving(true);

        try {
            await saveFeedback({
                primary_persona_name: primaryPersonaName,
                fit,
                reason,
                team_use: teamUse,
                email,
            });

            setSubmitted(true);
        } catch (err) {
            console.error('Feedback save error:', err);
            setError('Er ging iets mis bij opslaan.');
        } finally {
            setSaving(false);
        }
    };

    if (submitted) {
        return (
            <div
                style={{
                    marginTop: 24,
                    background: 'linear-gradient(135deg, #f7f2ec 0%, #efe5db 100%)',
                    borderRadius: 24,
                    border: '1px solid #e3d8cd',
                    padding: '24px 24px 22px',
                }}
            >
                <div
                    style={{
                        color: '#b85c5c',
                        letterSpacing: 1.6,
                        fontSize: 12,
                        marginBottom: 8,
                        textTransform: 'uppercase',
                    }}
                >
                    Dank je
                </div>

                <h3
                    style={{
                        fontFamily: 'Playfair Display',
                        fontSize: 30,
                        lineHeight: 1.1,
                        margin: '0 0 10px 0',
                        color: '#1f1b18',
                    }}
                >
                    Dank je wel voor je input.
                </h3>

                <p
                    style={{
                        margin: 0,
                        color: '#4d433d',
                        fontSize: 15,
                        lineHeight: 1.6,
                        maxWidth: 640,
                    }}
                >
                    Dit is versie 1 — jouw input helpt om de tool scherper en waardevoller te maken.
                </p>
            </div>
        );
    }

    return (
        <form
            onSubmit={handleSubmit}
            style={{
                marginTop: 24,
                background: 'linear-gradient(135deg, #f7f2ec 0%, #efe5db 100%)',
                borderRadius: 24,
                border: '1px solid #e3d8cd',
                padding: '24px 24px 22px',
                display: 'grid',
                gap: 18,
            }}
        >
            <div>
                <div
                    style={{
                        color: '#b85c5c',
                        letterSpacing: 1.6,
                        fontSize: 12,
                        marginBottom: 8,
                        textTransform: 'uppercase',
                    }}
                >
                    Kleine check
                </div>

                <h3
                    style={{
                        fontFamily: 'Playfair Display',
                        fontSize: 30,
                        lineHeight: 1.1,
                        margin: '0 0 10px 0',
                        color: '#1f1b18',
                    }}
                >
                    Klopt dit voor jou?
                </h3>

                <p
                    style={{
                        margin: 0,
                        color: '#4d433d',
                        fontSize: 15,
                        lineHeight: 1.6,
                        maxWidth: 640,
                    }}
                >
                    Dit helpt om de tool slimmer en scherper te maken.
                </p>
            </div>

            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                    gap: 10,
                }}
            >
                {fitOptions.map((option) => {
                    const active = fit === option.value;

                    return (
                        <button
                            key={option.value}
                            type="button"
                            onClick={() => setFit(option.value)}
                            style={{
                                padding: '14px 16px',
                                borderRadius: 14,
                                border: active ? '1px solid #b85c5c' : '1px solid #ddd',
                                background: active ? '#b85c5c' : '#fff',
                                color: active ? '#fff' : '#1f1b18',
                                cursor: 'pointer',
                                fontSize: 15,
                                fontWeight: 500,
                                textAlign: 'center',
                            }}
                        >
                            {option.label}
                        </button>
                    );
                })}
            </div>

            {showReason && (
                <div
                    style={{
                        background: 'rgba(255,255,255,0.76)',
                        borderRadius: 18,
                        padding: '16px 18px',
                        borderLeft: '4px solid #b85c5c',
                    }}
                >
                    <div
                        style={{
                            fontSize: 12,
                            letterSpacing: 1.3,
                            textTransform: 'uppercase',
                            color: '#7a6d66',
                            marginBottom: 8,
                        }}
                    >
                        Wat herken je hierin?
                    </div>

                    <textarea
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="Bijvoorbeeld: manier van werken, energie, frustraties..."
                        rows={4}
                        style={{
                            width: '100%',
                            resize: 'vertical',
                            borderRadius: 12,
                            border: '1px solid #ddd',
                            padding: '12px 14px',
                            fontSize: 14,
                            lineHeight: 1.5,
                            boxSizing: 'border-box',
                            fontFamily: 'inherit',
                        }}
                    />
                </div>
            )}

            {showTeamUse && (
                <div
                    style={{
                        background: 'rgba(255,255,255,0.76)',
                        borderRadius: 18,
                        padding: '16px 18px',
                        borderLeft: '4px solid #7f9a8a',
                    }}
                >
                    <div
                        style={{
                            fontSize: 12,
                            letterSpacing: 1.3,
                            textTransform: 'uppercase',
                            color: '#7a6d66',
                            marginBottom: 8,
                        }}
                    >
                        Doorvertaling
                    </div>

                    <div
                        style={{
                            fontFamily: 'Playfair Display',
                            fontSize: 24,
                            color: '#1f1b18',
                            marginBottom: 12,
                        }}
                    >
                        Zou je dit ook voor je team willen gebruiken?
                    </div>

                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                        {teamOptions.map((option) => {
                            const active = teamUse === option.value;

                            return (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => setTeamUse(option.value)}
                                    style={{
                                        padding: '12px 16px',
                                        borderRadius: 12,
                                        border: active ? '1px solid #7f9a8a' : '1px solid #ddd',
                                        background: active ? '#7f9a8a' : '#fff',
                                        color: active ? '#fff' : '#1f1b18',
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
            )}

            {showEmail && (
                <div
                    style={{
                        background: 'rgba(255,255,255,0.76)',
                        borderRadius: 18,
                        padding: '16px 18px',
                        borderLeft: '4px solid #c7a24a',
                    }}
                >
                    <div
                        style={{
                            fontSize: 12,
                            letterSpacing: 1.3,
                            textTransform: 'uppercase',
                            color: '#7a6d66',
                            marginBottom: 8,
                        }}
                    >
                        Verder praten
                    </div>

                    <div
                        style={{
                            fontFamily: 'Playfair Display',
                            fontSize: 24,
                            color: '#1f1b18',
                            marginBottom: 8,
                        }}
                    >
                        Laat je mail achter
                    </div>

                    <p
                        style={{
                            margin: '0 0 12px 0',
                            color: '#4d433d',
                            fontSize: 14,
                            lineHeight: 1.55,
                        }}
                    >
                        Dan denk ik graag met je mee over wat dit voor jouw team kan betekenen.
                    </p>

                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="jouwmail@bedrijf.nl"
                        style={{
                            width: '100%',
                            borderRadius: 12,
                            border: '1px solid #ddd',
                            padding: '12px 14px',
                            fontSize: 14,
                            boxSizing: 'border-box',
                        }}
                    />
                </div>
            )}

            {error && (
                <div
                    style={{
                        color: '#b85c5c',
                        fontSize: 14,
                    }}
                >
                    {error}
                </div>
            )}

            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: 12,
                    flexWrap: 'wrap',
                }}
            >
                <div
                    style={{
                        color: '#7a6d66',
                        fontSize: 13,
                        lineHeight: 1.5,
                    }}
                >
                    Dit is versie 1 — jouw input maakt hem beter.
                </div>

                <button
                    type="submit"
                    disabled={!fit || saving}
                    style={{
                        background: !fit || saving ? '#d8cec5' : '#1f1b18',
                        color: '#fff',
                        padding: '12px 18px',
                        borderRadius: 12,
                        border: 'none',
                        cursor: !fit || saving ? 'not-allowed' : 'pointer',
                        fontSize: 14,
                        fontWeight: 500,
                    }}
                >
                    {saving ? 'Opslaan...' : 'Verstuur'}
                </button>
            </div>
        </form>
    );
}