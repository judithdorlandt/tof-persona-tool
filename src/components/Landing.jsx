import { useCallback, useEffect, useRef, useState } from 'react';
import tofLogo from '../assets/tof-logo.png';
import styles from './Landing.module.css';
import { useCopy, useLang } from '../i18n/LanguageContext';
import { LANGS, LANG_NAMES } from '../i18n/routes';
import { IS_NATIVE } from '../config/platform';

/**
 * Hoe lang de landing blijft staan als hij zichzelf afsluit (elke start ná de
 * eerste). Het scherm faadt in 0,8s in en in 0,42s uit, dus bij 1,8s staat het
 * beeld ruim een seconde stil: lang genoeg om te lezen, kort genoeg om niet
 * als wachten te voelen.
 */
const AUTO_ENTER_MS = 1800;

export default function Landing({ setPage }) {
    const { landing: t } = useCopy();
    const { lang, setLang, rememberLang, langChosen } = useLang();
    const [isVisible, setIsVisible] = useState(false);
    const [isLeaving, setIsLeaving] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setIsVisible(true), 60);
        return () => clearTimeout(timer);
    }, []);

    // In de app kies je je taal één keer. Elke start daarna begint nog steeds
    // op dit scherm — het vertelt waar de app voor is — maar zonder taalkeuze
    // en zonder dat je iets hoeft te doen: na AUTO_ENTER_MS gaat hij door.
    const isSplash = IS_NATIVE && langChosen;

    const enteredRef = useRef(false);
    const handleEnter = useCallback(() => {
        if (enteredRef.current) return;
        enteredRef.current = true;
        // In de app is doorgaan tegelijk het bevestigen van je taal.
        if (IS_NATIVE) rememberLang();
        setIsLeaving(true);
        setTimeout(() => {
            setPage('home');
        }, 420);
    }, [rememberLang, setPage]);

    useEffect(() => {
        if (!isSplash) return undefined;
        const timer = setTimeout(handleEnter, AUTO_ENTER_MS);
        return () => clearTimeout(timer);
    }, [isSplash, handleEnter]);

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
                    In de app alleen de eerste keer. */}
                {!isSplash && (
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
                )}

                <button type="button" className={styles.cta} onClick={handleEnter}>
                    {t.cta}
                </button>
            </div>
        </div>
    );
}
