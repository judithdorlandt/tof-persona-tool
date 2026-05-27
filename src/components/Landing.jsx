import { useEffect, useState } from 'react';
import tofLogo from '../assets/tof-logo.png';
import styles from './Landing.module.css';

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

    // Dynamische waarden (fade/translate) blijven inline — alles statisch
    // in Landing.module.css.
    const stageStyle = {
        transform: isVisible && !isLeaving ? 'translateY(0px)' : 'translateY(18px)',
        opacity: isVisible && !isLeaving ? 1 : 0,
    };

    return (
        <div className={styles.wrapper} style={{ opacity: isLeaving ? 0 : 1 }}>
            <div className={styles.stage} style={stageStyle}>
                <button
                    type="button"
                    className={styles.logoButton}
                    onClick={handleEnter}
                    aria-label="Begin de Persona Tool"
                >
                    <img src={tofLogo} alt="TOF logo" className={styles.logo} />
                </button>

                <div className={styles.title}>
                    <span className={styles.titleSpace}>The Office</span>
                    <span className={styles.titleAccent}>Factory</span>
                </div>

                <p className={styles.subtitle}>
                    Inzicht in werkstijl, teamdynamiek en werkplek.
                </p>

                <button type="button" className={styles.cta} onClick={handleEnter}>
                    Begin bij jezelf  →
                </button>
            </div>
        </div>
    );
}
