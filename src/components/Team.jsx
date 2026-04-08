import React, { useEffect, useMemo, useState } from 'react';
import { supabase } from '../supabase';
import { ARCHETYPES } from '../data';

const COLOR_MAP = {
    maker: '#b85c5c',
    groeier: '#c28d6b',
    presteerder: '#c7a24a',
    denker: '#6f7f92',
    verbinder: '#7f9a8a',
    teamspeler: '#8b7f9a',
    zekerzoeker: '#7d8a6b',
    vernieuwer: '#d08c5b',
};

export default function Team({ setPage }) {
    const [responses, setResponses] = useState([]);
    const [selectedTeam, setSelectedTeam] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isMobile, setIsMobile] = useState(window.innerWidth < 900);

    useEffect(() => {
        const onResize = () => setIsMobile(window.innerWidth < 900);
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);

    useEffect(() => {
        async function fetchResponses() {
            setLoading(true);
            setError('');

            try {
                const { data, error } = await supabase
                    .from('responses')
                    .select('*')
                    .order('created_at', { ascending: false });

                if (error) throw error;

                const safeData = data || [];
                setResponses(safeData);

                const teams = [...new Set(safeData.map((item) => item.team).filter(Boolean))];
                if (teams.length > 0) {
                    setSelectedTeam(teams[0]);
                }
            } catch (err) {
                console.error('Team fetch error:', err);
                setError('Er ging iets mis bij het ophalen van de teamdata.');
            } finally {
                setLoading(false);
            }
        }

        fetchResponses();
    }, []);

    const teamOptions = useMemo(() => {
        return [...new Set(responses.map((item) => item.team).filter(Boolean))].sort((a, b) =>
            a.localeCompare(b)
        );
    }, [responses]);

    const teamResponses = useMemo(() => {
        if (!selectedTeam) return [];
        return responses.filter((item) => item.team === selectedTeam);
    }, [responses, selectedTeam]);

    const personaStats = useMemo(() => {
        const counts = {};

        teamResponses.forEach((item) => {
            const personaId = item.primary_archetype;
            if (!personaId) return;
            counts[personaId] = (counts[personaId] || 0) + 1;
        });

        return Object.entries(counts)
            .map(([id, count]) => {
                const archetype = ARCHETYPES.find((item) => item.id === id);
                return {
                    id,
                    count,
                    name: archetype?.name || id,
                    color: COLOR_MAP[id] || '#b85c5c',
                };
            })
            .sort((a, b) => b.count - a.count);
    }, [teamResponses]);

    const totalResponses = teamResponses.length;
    const topThree = personaStats.slice(0, 3);

    return (
        <div
            style={{
                minHeight: 'calc(100vh - 88px)',
                padding: isMobile ? '20px 16px 32px' : '40px',
                background: '#f7f2ec',
            }}
        >
            <div
                style={{
                    maxWidth: 1100,
                    margin: '0 auto',
                    display: 'grid',
                    gap: 20,
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
                        06 — Team inzicht
                    </div>

                    <h1
                        style={{
                            fontFamily: 'Playfair Display',
                            fontSize: isMobile ? 32 : 44,
                            margin: 0,
                            color: '#1f1b18',
                        }}
                    >
                        Begrijp je team beter
                    </h1>

                    <p
                        style={{
                            marginTop: 12,
                            maxWidth: 700,
                            color: '#555',
                            lineHeight: 1.6,
                            fontSize: 15,
                        }}
                    >
                        Hier zie je hoe persona’s verdeeld zijn binnen je team. Zo wordt sneller
                        zichtbaar waar energie zit, waar spanning ontstaat en welke mix aanwezig is.
                    </p>
                </div>

                <div
                    style={{
                        background: 'white',
                        borderRadius: 16,
                        padding: isMobile ? 18 : 24,
                        borderTop: '4px solid #b85c5c',
                        boxShadow: '0 10px 26px rgba(70, 45, 35, 0.05)',
                        display: 'grid',
                        gap: 16,
                    }}
                >
                    <div>
                        <label
                            style={{
                                display: 'block',
                                marginBottom: 8,
                                fontSize: 13,
                                fontWeight: 600,
                                color: '#1f1b18',
                            }}
                        >
                            Kies een team
                        </label>

                        <select
                            value={selectedTeam}
                            onChange={(e) => setSelectedTeam(e.target.value)}
                            disabled={loading || teamOptions.length === 0}
                            style={{
                                width: '100%',
                                padding: '12px 14px',
                                borderRadius: 10,
                                border: '1px solid #ddd',
                                fontSize: 15,
                                background: '#fff',
                                boxSizing: 'border-box',
                            }}
                        >
                            {teamOptions.length === 0 ? (
                                <option value="">Nog geen teams gevonden</option>
                            ) : (
                                teamOptions.map((team) => (
                                    <option key={team} value={team}>
                                        {team}
                                    </option>
                                ))
                            )}
                        </select>
                    </div>

                    {loading && (
                        <div style={{ color: '#6b625d', fontSize: 14 }}>
                            Teamdata wordt geladen...
                        </div>
                    )}

                    {error && (
                        <div style={{ color: '#b85c5c', fontSize: 14 }}>
                            {error}
                        </div>
                    )}

                    {!loading && !error && teamOptions.length === 0 && (
                        <div
                            style={{
                                background: '#fff7f7',
                                border: '1px solid #f0d8d8',
                                borderRadius: 12,
                                padding: '16px 18px',
                            }}
                        >
                            <h3
                                style={{
                                    margin: '0 0 8px 0',
                                    fontFamily: 'Playfair Display',
                                    color: '#1f1b18',
                                }}
                            >
                                Nog geen teamdata beschikbaar
                            </h3>

                            <p
                                style={{
                                    margin: 0,
                                    color: '#555',
                                    fontSize: 14,
                                    lineHeight: 1.6,
                                }}
                            >
                                Laat meerdere teamleden de test doen om hier inzichten te zien.
                            </p>
                        </div>
                    )}

                    {!loading && !error && selectedTeam && teamResponses.length > 0 && (
                        <>
                            <div
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
                                    gap: 14,
                                }}
                            >
                                <StatCard
                                    label="Geselecteerd team"
                                    value={selectedTeam}
                                    accent="#b85c5c"
                                />

                                <StatCard
                                    label="Aantal responses"
                                    value={String(totalResponses)}
                                    accent="#6f7f92"
                                />

                                <StatCard
                                    label="Meest zichtbaar"
                                    value={topThree[0]?.name || '—'}
                                    accent={topThree[0]?.color || '#7f9a8a'}
                                />
                            </div>

                            <div
                                style={{
                                    background: '#f9f4ef',
                                    borderRadius: 14,
                                    padding: isMobile ? 16 : 20,
                                    border: '1px solid #eadfd4',
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
                                    Top persona&apos;s in dit team
                                </div>

                                <div style={{ display: 'grid', gap: 10 }}>
                                    {topThree.map((item) => (
                                        <div key={item.id}>
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    marginBottom: 4,
                                                    fontSize: 14,
                                                    color: '#3f342f',
                                                }}
                                            >
                                                <span style={{ fontWeight: 600 }}>{item.name}</span>
                                                <span>{item.count}</span>
                                            </div>

                                            <div
                                                style={{
                                                    height: 10,
                                                    background: '#eadfd4',
                                                    borderRadius: 999,
                                                    overflow: 'hidden',
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        width: `${(item.count / totalResponses) * 100}%`,
                                                        height: '100%',
                                                        background: item.color,
                                                        borderRadius: 999,
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div
                                style={{
                                    background: 'white',
                                    borderRadius: 14,
                                    border: '1px solid #eadfd4',
                                    overflow: 'hidden',
                                }}
                            >
                                <div
                                    style={{
                                        padding: '16px 18px',
                                        borderBottom: '1px solid #efe5db',
                                        fontSize: 12,
                                        letterSpacing: 1.5,
                                        textTransform: 'uppercase',
                                        color: '#7a6d66',
                                    }}
                                >
                                    Teamleden in beeld
                                </div>

                                <div style={{ display: 'grid' }}>
                                    {teamResponses.map((item) => {
                                        const color = COLOR_MAP[item.primary_archetype] || '#b85c5c';
                                        const archetypeName =
                                            ARCHETYPES.find((a) => a.id === item.primary_archetype)?.name ||
                                            item.primary_archetype ||
                                            'Onbekend';

                                        return (
                                            <div
                                                key={item.id}
                                                style={{
                                                    padding: '14px 18px',
                                                    borderBottom: '1px solid #f3ece4',
                                                    display: 'grid',
                                                    gridTemplateColumns: isMobile ? '1fr' : '1.2fr 1fr 1fr 1fr',
                                                    gap: 10,
                                                    alignItems: 'center',
                                                }}
                                            >
                                                <div>
                                                    <div
                                                        style={{
                                                            fontWeight: 600,
                                                            color: '#1f1b18',
                                                            marginBottom: 4,
                                                        }}
                                                    >
                                                        {item.name || 'Anoniem'}
                                                    </div>
                                                    <div
                                                        style={{
                                                            fontSize: 13,
                                                            color: '#7a6d66',
                                                        }}
                                                    >
                                                        {item.organization || 'Geen organisatie opgegeven'}
                                                    </div>
                                                </div>

                                                <div
                                                    style={{
                                                        fontSize: 14,
                                                        color: '#4d433d',
                                                    }}
                                                >
                                                    {item.role || 'Geen rol'}
                                                </div>

                                                <div
                                                    style={{
                                                        fontSize: 14,
                                                        color: '#4d433d',
                                                    }}
                                                >
                                                    {item.team_size || 'Geen teamgrootte'}
                                                </div>

                                                <div>
                                                    <span
                                                        style={{
                                                            display: 'inline-block',
                                                            background: color,
                                                            color: '#fff',
                                                            padding: '6px 10px',
                                                            borderRadius: 999,
                                                            fontSize: 12,
                                                            fontWeight: 600,
                                                        }}
                                                    >
                                                        {archetypeName}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </>
                    )}
                </div>

                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                    <button
                        onClick={() => setPage('quiz')}
                        style={{
                            background: '#b85c5c',
                            color: 'white',
                            padding: '12px 18px',
                            borderRadius: 10,
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: 14,
                            fontWeight: 500,
                        }}
                    >
                        Start test →
                    </button>

                    <button
                        onClick={() => setPage('home')}
                        style={{
                            background: 'transparent',
                            border: '1px solid #1a1a1a',
                            padding: '12px 18px',
                            borderRadius: 10,
                            cursor: 'pointer',
                            fontSize: 14,
                            fontWeight: 500,
                        }}
                    >
                        Terug
                    </button>
                </div>
            </div>
        </div>
    );
}

function StatCard({ label, value, accent }) {
    return (
        <div
            style={{
                background: '#fff',
                borderRadius: 14,
                padding: '18px 18px 16px',
                borderTop: `4px solid ${accent}`,
                border: '1px solid #eadfd4',
            }}
        >
            <div
                style={{
                    fontSize: 11,
                    letterSpacing: 1.4,
                    textTransform: 'uppercase',
                    color: '#7a6d66',
                    marginBottom: 8,
                }}
            >
                {label}
            </div>

            <div
                style={{
                    fontFamily: 'Playfair Display',
                    fontSize: 28,
                    lineHeight: 1.1,
                    color: '#1f1b18',
                }}
            >
                {value}
            </div>
        </div>
    );
}