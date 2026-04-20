import { useEffect, useState } from 'react';
import tofLogo from '../assets/tof-logo.png';
import { hasModule2Access } from '../utils/access';

export default function Nav({ page, setPage, hasResult = false }) {
    const [isMobile, setIsMobile] = useState(window.innerWidth < 820);
    const [menuOpen, setMenuOpen] = useState(false);

    useEffect(() => {
        const onResize = () => setIsMobile(window.innerWidth < 820);
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);

    useEffect(() => {
        if (!isMobile) {
            setMenuOpen(false);
        }
    }, [isMobile]);

    const TEAM_PAGES = ['team', 'team-insight', 'team-dynamics', 'teamintro', 'teamdashboard', 'teamdynamics', 'teamselector'];
    const isTeamContext = TEAM_PAGES.includes(page);

    const baseItems = [
        { key: 'home', label: 'Home' },
        { key: 'intro', label: 'Eerst even uitleg' },
        { key: 'quiz', label: 'Test jezelf' },
    ];

    const resultItems = hasResult
        ? [
            { key: 'results', label: 'Resultaat' },
            { key: 'library', label: "Persona's" },
        ]
        : [];

    const teamItems = [
        { key: 'home', label: 'Home' },
        { key: 'team-insight', label: 'Team Insight' },
        { key: 'team-dynamics', label: 'Team Dynamics' },
    ];

    const items = isTeamContext ? teamItems : [...baseItems, ...resultItems];

    function handleNavigate(target) {
        setPage(target);
        setMenuOpen(false);
    }

    return (
        <div
            style={{
                background: '#FFFFFF',
                borderBottom: '1px solid #EAE3DC',
                boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
                position: 'sticky',
                top: 0,
                zIndex: 100,
            }}
        >
            <div
                style={{
                    maxWidth: 1120,
                    margin: '0 auto',
                    padding: isMobile ? '12px 14px' : '14px 20px',
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: 16,
                    }}
                >
                    <button
                        type="button"
                        onClick={() => handleNavigate('home')}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 12,
                            background: 'transparent',
                            border: 'none',
                            padding: 0,
                            cursor: 'pointer',
                            flexShrink: 0,
                        }}
                    >
                        <img
                            src={tofLogo}
                            alt="TOF logo"
                            style={{
                                width: isMobile ? 34 : 40,
                                height: isMobile ? 34 : 40,
                                objectFit: 'contain',
                                display: 'block',
                                flexShrink: 0,
                            }}
                        />

                        <div
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'flex-start',
                                lineHeight: 1.25,
                            }}
                        >
                            <span
                                style={{
                                    fontFamily: '"Playfair Display", serif',
                                    fontWeight: 300,
                                    fontStyle: 'normal',
                                    color: '#1F1F1F',
                                    fontSize: isMobile ? '1rem' : '1.125rem',
                                    letterSpacing: '-0.025em',
                                }}
                            >
                                <span style={{ marginRight: '0.15em' }}>The Office</span>
                                <span
                                    style={{
                                        fontFamily: '"Playfair Display", serif',
                                        fontWeight: 300,
                                        fontStyle: 'italic',
                                        color: '#B05252',
                                    }}
                                >
                                    Factory
                                </span>
                            </span>

                            {!isMobile && (
                                <span
                                    style={{
                                        marginTop: 2,
                                        fontFamily: '"Inter", sans-serif',
                                        fontSize: 11,
                                        letterSpacing: '0.18em',
                                        textTransform: 'uppercase',
                                        color: '#7A7A7A',
                                        fontWeight: 400,
                                        lineHeight: 1.2,
                                    }}
                                >
                                    Persona Tool
                                </span>
                            )}
                        </div>
                    </button>

                    {!isMobile ? (
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 10,
                                flexWrap: 'wrap',
                                justifyContent: 'flex-end',
                            }}
                        >
                            {items.map((item) => {
                                const active = page === item.key;

                                return (
                                    <button
                                        key={item.key}
                                        type="button"
                                        onClick={() => handleNavigate(item.key)}
                                        style={{
                                            padding: '10px 18px',
                                            borderRadius: 14,
                                            border: active ? '1px solid #B05252' : '1px solid #E2D8CC',
                                            background: active ? '#B05252' : '#FFFFFF',
                                            color: active ? '#FFFFFF' : '#1F1F1F',
                                            cursor: 'pointer',
                                            fontSize: 14,
                                            fontWeight: 500,
                                            boxShadow: 'none',
                                            transition: 'all 0.2s ease',
                                        }}
                                    >
                                        {item.label}
                                    </button>
                                );
                            })}
                        </div>
                    ) : (
                        <button
                            type="button"
                            onClick={() => setMenuOpen((prev) => !prev)}
                            style={{
                                padding: '10px 14px',
                                borderRadius: 12,
                                border: '1px solid #E2D8CC',
                                background: menuOpen ? '#B05252' : '#FFFFFF',
                                color: menuOpen ? '#FFFFFF' : '#1F1F1F',
                                cursor: 'pointer',
                                fontSize: 14,
                                fontWeight: 600,
                            }}
                        >
                            {menuOpen ? 'Sluit' : 'Menu'}
                        </button>
                    )}
                </div>

                {isMobile && menuOpen && (
                    <div
                        style={{
                            marginTop: 12,
                            display: 'grid',
                            gap: 8,
                            paddingTop: 12,
                            borderTop: '1px solid #EFE7DE',
                        }}
                    >
                        {items.map((item) => {
                            const active = page === item.key;

                            return (
                                <button
                                    key={item.key}
                                    type="button"
                                    onClick={() => handleNavigate(item.key)}
                                    style={{
                                        width: '100%',
                                        textAlign: 'left',
                                        padding: '12px 14px',
                                        borderRadius: 12,
                                        border: active ? '1px solid #B05252' : '1px solid #E2D8CC',
                                        background: active ? '#FCF1F1' : '#FFFFFF',
                                        color: '#1F1F1F',
                                        cursor: 'pointer',
                                        fontSize: 14,
                                        fontWeight: active ? 600 : 500,
                                    }}
                                >
                                    {item.label}
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}