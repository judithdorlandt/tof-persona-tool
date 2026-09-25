/**
 * Nav.jsx — sticky topbar voor de hele app.
 * Gemigreerd naar CSS Modules (Nav.module.css). Mobile state blijft in JS
 * voor open/dicht menu.
 */
import { useEffect, useState } from 'react';
import tofLogo from '../assets/tof-logo.png';
import styles from './Nav.module.css';
import { isAdminEmail } from '../supabase';
import { useCopy, useLang } from '../i18n/LanguageContext';

export default function Nav({
    page,
    setPage,
    hasResult = false,
    currentUser = null,
    isManager = false,
    onLogout,
}) {
    const { nav: t } = useCopy();
    const { lang, setLang } = useLang();
    const [isMobile, setIsMobile] = useState(window.innerWidth < 820);
    const [menuOpen, setMenuOpen] = useState(false);

    useEffect(() => {
        const onResize = () => setIsMobile(window.innerWidth < 820);
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);

    useEffect(() => {
        if (!isMobile) setMenuOpen(false);
    }, [isMobile]);

    // Manager-mode: een ingelogde team-manager heeft geen behoefte aan de
    // marketing-flow (Home/Intro/Quiz). We tonen alleen "Mijn team(s)" en
    // — als hij óók admin is — "Admin". Niet-managers zien de volledige nav.
    const baseItems = isManager
        ? [
            { key: 'team', label: t.myTeam },
        ]
        : [
            { key: 'home', label: t.home },
            { key: 'intro', label: t.intro },
            { key: 'quiz', label: t.quiz },
            { key: 'team', label: t.teamEnvironment },
        ];
    const resultItems = (hasResult && !isManager)
        ? [
            { key: 'results', label: t.results },
            { key: 'library', label: t.library },
        ]
        : [];
    // "Mijn teams" tijdelijk verborgen tot data-migratie + admin-dashboard af zijn.
    // Zonder user_id op responses kunnen we 'eigen teams' nog niet betrouwbaar tonen.
    // Zet terug op `currentUser ? [...] : []` wanneer dit klaar is.
    const managerItems = [];

    // Admin-link — alleen zichtbaar voor TOF-admins (zie ADMIN_EMAILS in supabase.js).
    const adminItems = (currentUser && isAdminEmail(currentUser.email))
        ? [{ key: 'admin', label: t.admin }]
        : [];

    const items = [...baseItems, ...resultItems, ...managerItems, ...adminItems];

    function handleNavigate(target) {
        setPage(target);
        setMenuOpen(false);
    }
    function handleLogoutClick() {
        setMenuOpen(false);
        if (typeof onLogout === 'function') onLogout();
    }

    const langSwitch = (
        <div className={styles.langSwitch} role="group" aria-label={t.languageLabel}>
            <button
                type="button"
                onClick={() => { setLang('nl'); setMenuOpen(false); }}
                className={`${styles.langBtn} ${lang === 'nl' ? styles.langBtnActive : ''}`}
                aria-label={t.switchToDutch}
                aria-pressed={lang === 'nl'}
            >
                NL
            </button>
            <button
                type="button"
                onClick={() => { setLang('en'); setMenuOpen(false); }}
                className={`${styles.langBtn} ${lang === 'en' ? styles.langBtnActive : ''}`}
                aria-label={t.switchToEnglish}
                aria-pressed={lang === 'en'}
            >
                EN
            </button>
        </div>
    );

    return (
        <div className={styles.bar}>
            <div className={styles.inner}>
                <div className={styles.row}>
                    <button
                        type="button"
                        onClick={() => handleNavigate(isManager ? 'team' : 'home')}
                        className={styles.logoBtn}
                    >
                        <img src={tofLogo} alt={t.logoAlt} className={styles.logoImg} />
                        <div className={styles.brand}>
                            <span className={styles.brandTitle}>
                                <span className={styles.brandWord}>The Office</span>
                                <span className={styles.brandAccent}>Factory</span>
                            </span>
                            <span className={styles.brandSub}>{t.brandSub}</span>
                        </div>
                    </button>

                    {!isMobile ? (
                        <div className={styles.navList}>
                            {items.map((item) => {
                                const active = page === item.key;
                                return (
                                    <button
                                        key={item.key}
                                        type="button"
                                        onClick={() => handleNavigate(item.key)}
                                        className={`${styles.navItem} ${active ? styles.navItemActive : ''}`}
                                    >
                                        {item.label}
                                    </button>
                                );
                            })}

                            {currentUser ? (
                                <button
                                    type="button"
                                    onClick={handleLogoutClick}
                                    className={styles.logoutBtn}
                                    title={currentUser.email || ''}
                                >
                                    <span className={styles.logoutDot} />
                                    {t.logout}
                                </button>
                            ) : null}

                            {langSwitch}
                        </div>
                    ) : (
                        <button
                            type="button"
                            onClick={() => setMenuOpen((prev) => !prev)}
                            className={`${styles.menuBtn} ${menuOpen ? styles.menuBtnOpen : ''}`}
                        >
                            {menuOpen ? t.close : t.menu}
                        </button>
                    )}
                </div>

                {isMobile && menuOpen && (
                    <div className={styles.menuPanel}>
                        {items.map((item) => {
                            const active = page === item.key;
                            return (
                                <button
                                    key={item.key}
                                    type="button"
                                    onClick={() => handleNavigate(item.key)}
                                    className={`${styles.menuItem} ${active ? styles.menuItemActive : ''}`}
                                >
                                    {item.label}
                                </button>
                            );
                        })}

                        {currentUser ? (
                            <button
                                type="button"
                                onClick={handleLogoutClick}
                                className={styles.menuLogoutBtn}
                            >
                                {t.logoutWithEmail(currentUser.email)}
                            </button>
                        ) : null}

                        <div className={styles.menuLang}>{langSwitch}</div>
                    </div>
                )}
            </div>
        </div>
    );
}
