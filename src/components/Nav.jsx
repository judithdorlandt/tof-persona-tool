/**
 * Nav.jsx — sticky topbar voor de hele app.
 * Gemigreerd naar CSS Modules (Nav.module.css). Mobile state blijft in JS
 * voor open/dicht menu.
 */
import { useEffect, useState } from 'react';
import tofLogo from '../assets/tof-logo.png';
import styles from './Nav.module.css';
import { isAdminEmail } from '../supabase';

export default function Nav({
    page,
    setPage,
    hasResult = false,
    currentUser = null,
    isManager = false,
    onLogout,
}) {
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
            { key: 'team', label: 'Mijn team' },
        ]
        : [
            { key: 'home', label: 'Home' },
            { key: 'intro', label: 'Eerst even uitleg' },
            { key: 'quiz', label: 'Test jezelf' },
            { key: 'team', label: 'Teamomgeving' },
        ];
    const resultItems = (hasResult && !isManager)
        ? [
            { key: 'results', label: 'Resultaat' },
            { key: 'library', label: "Persona's" },
        ]
        : [];
    // "Mijn teams" tijdelijk verborgen tot data-migratie + admin-dashboard af zijn.
    // Zonder user_id op responses kunnen we 'eigen teams' nog niet betrouwbaar tonen.
    // Zet terug op `currentUser ? [...] : []` wanneer dit klaar is.
    const managerItems = [];

    // Admin-link — alleen zichtbaar voor TOF-admins (zie ADMIN_EMAILS in supabase.js).
    const adminItems = (currentUser && isAdminEmail(currentUser.email))
        ? [{ key: 'admin', label: 'Admin' }]
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

    return (
        <div className={styles.bar}>
            <div className={styles.inner}>
                <div className={styles.row}>
                    <button
                        type="button"
                        onClick={() => handleNavigate(isManager ? 'team' : 'home')}
                        className={styles.logoBtn}
                    >
                        <img src={tofLogo} alt="TOF logo" className={styles.logoImg} />
                        <div className={styles.brand}>
                            <span className={styles.brandTitle}>
                                <span className={styles.brandWord}>The Office</span>
                                <span className={styles.brandAccent}>Factory</span>
                            </span>
                            <span className={styles.brandSub}>Persona Tool</span>
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
                                    Uitloggen
                                </button>
                            ) : null}
                        </div>
                    ) : (
                        <button
                            type="button"
                            onClick={() => setMenuOpen((prev) => !prev)}
                            className={`${styles.menuBtn} ${menuOpen ? styles.menuBtnOpen : ''}`}
                        >
                            {menuOpen ? 'Sluit' : 'Menu'}
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
                                Uitloggen ({currentUser.email})
                            </button>
                        ) : null}
                    </div>
                )}
            </div>
        </div>
    );
}
