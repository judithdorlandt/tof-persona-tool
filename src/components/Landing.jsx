import { useEffect, useState } from 'react';
import tofLogo from '../assets/tof-logo.png';
import styles from './Landing.module.css';
import { useCopy, useLang } from '../i18n/LanguageContext';
import { LANGS, LANG_NAMES } from '../i18n/routes';
import { IS_NATIVE } from '../config/platform';

export default function Landing({ setPage }) {
    const { landing: t } = useCopy();
    const { lang, setLang, rememberLang } = useLang();
    const [isVisible, setIsVisible] = useState(false);
    const [isLeaving, setIsLeaving] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setIsVisible(true), 60);
        return () => clearTimeout(timer);
    }, []);

    function handleEnter() {
        // In de app is doorgaan tegelijk het bevestigen van je taal: daarna
        // opent de app meteen op je eigen scherm en zie je dit niet meer.
        if (IS_NATIVE) rememberLang();
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
                    aria-label={t.logoButtonLabel}
                >
                    <img src={tofLogo} alt={t.logoAlt} className={styles.logo} />
                </button>

                <div className={styles.title}>
                    <span className={styles.titleSpace}>The Office</span>
                    <span className={styles.titleAccent}>Factory</span>
                </div>

                <p className={styles.subtitle}>{t.subtitle}</p>

                {/* Het moment waarop je je taal kiest: hier is nog geen
                    navigatiebalk, en hierna gaat alles in die taal verder.
                    In de app zie je dit scherm alleen de eerste keer. */}
                <div className={styles.langRow} role="group" aria-label={t.languageLabel}>
                    {LANGS.map((code) => (
                        <button
                            key={code}
                            type="button"
                            className={`${styles.langBtn} ${code === lang ? styles.langBtnActive : ''}`}
                            aria-pressed={code === lang}
                            onClick={() => setLang(code)}
                        >
                            {LANG_NAMES[code] || code.toUpperCase()}
                        </button>
                    ))}
                </div>

                <button type="button" className={styles.cta} onClick={handleEnter}>
                    {t.cta}
                </button>
            </div>
        </div>
    );
}
