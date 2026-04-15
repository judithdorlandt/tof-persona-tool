import { useEffect, useState } from 'react';
import tofLogo from '../assets/tof-logo.png';

export default function Landing({ setPage }) {
    const [isVisible, setIsVisible] = useState(false);
    const [isLeaving, setIsLeaving] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setIsVisible(true), 60);
        return () => clearTimeout(timer);
    }, []);

    function handleEnter() {
        setIsLeaving(true);

        setTimeout(() => {
            setPage('home');
        }, 420);
    }

    return (
        <div
            style={{
                minHeight: '100vh',
                background: '#F7F3EE',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '24px',
                boxSizing: 'border-box',
                opacity: isLeaving ? 0 : 1,
                transition: 'opacity 0.42s ease',
            }}
        >
            <div
                style={{
                    display: 'grid',
                    justifyItems: 'center',
                    gap: 20,
                    textAlign: 'center',
                    maxWidth: 680,
                    transform: isVisible && !isLeaving ? 'translateY(0px)' : 'translateY(18px)',
                    opacity: isVisible && !isLeaving ? 1 : 0,
                    transition: 'opacity 0.8s ease, transform 0.8s ease',
                }}
            >
                <button
                    type="button"
                    onClick={handleEnter}
                    style={{
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        padding: 0,
                        borderRadius: 16,
                    }}
                >
                    <img
                        src={tofLogo}
                        alt="TOF logo"
                        style={{
                            width: 'min(34vw, 180px)',
                            height: 'auto',
                            objectFit: 'contain',
                            display: 'block',
                            transition: 'transform 0.2s ease',
                        }}
                        onMouseOver={(e) => {
                            e.currentTarget.style.transform = 'scale(1.04)';
                        }}
                        onMouseOut={(e) => {
                            e.currentTarget.style.transform = 'scale(1)';
                        }}
                    />
                </button>

                <div
                    style={{
                        fontFamily: '"Playfair Display", serif',
                        fontWeight: 300,
                        fontSize: 'clamp(30px, 5vw, 56px)',
                        letterSpacing: '-0.025em',
                        lineHeight: 1.05,
                        color: '#1F1F1F',
                    }}
                >
                    <span style={{ marginRight: '0.15em' }}>The Office</span>
                    <span
                        style={{
                            fontStyle: 'italic',
                            color: '#B05252',
                        }}
                    >
                        Factory
                    </span>
                </div>

                <p
                    style={{
                        margin: 0,
                        maxWidth: 560,
                        color: '#7A7A7A',
                        fontSize: 'clamp(14px, 2vw, 17px)',
                        lineHeight: 1.7,
                    }}
                >
                    Inzicht in werkstijl, teamdynamiek en werkplek.
                </p>

                <div
                    style={{
                        marginTop: 6,
                        fontSize: 13,
                        color: '#A79B92',
                        letterSpacing: '0.04em',
                    }}
                >
                    klik op het logo
                </div>
            </div>
        </div>
    );
}