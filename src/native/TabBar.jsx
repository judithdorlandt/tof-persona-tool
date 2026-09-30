import { useCopy } from '../i18n/LanguageContext';

/**
 * TabBar — de vier plekken waar je heen kunt, onderaan het scherm.
 *
 * Bestaat alleen in de app. Daarvóór zat alle navigatie in een hamburgermenu
 * bovenin, waardoor de gespreksvoorbereiding — juist het scherm waar je iets
 * dóet — praktisch onvindbaar was. Onderin is het bovendien binnen duimbereik.
 *
 * Eén balk, altijd dezelfde vier bestemmingen. De hoofdstukken bínnen je
 * profiel zijn een andere soort navigatie en horen daarom niet hier maar op
 * het profielscherm zelf (zie ProfileScreen.jsx).
 */
export default function TabBar({ page, setPage, pinnedCount = 0 }) {
    const { native } = useCopy();
    const t = native.tabs;

    // 'home' hoort bij Profiel: AppStart is de voorkant van diezelfde sectie
    // (je profielkaart, opnieuw testen, wat de app bewaart), 'results' is het
    // profiel zelf. Allebei laten de tab oplichten, anders lijkt de app je
    // kwijt te zijn zodra je doorklikt.
    const tabs = [
        { key: 'results', label: t.profile, active: ['results', 'home', 'intro', 'quiz'] },
        { key: 'gesprek', label: t.conversation, active: ['gesprek'], badge: pinnedCount },
        { key: 'historie', label: t.history, active: ['historie'] },
        { key: 'library', label: t.library, active: ['library'] },
    ];

    return (
        <nav style={BAR} aria-label={t.label}>
            {tabs.map((tab) => {
                const isActive = tab.active.includes(page);
                return (
                    <button
                        key={tab.key}
                        type="button"
                        onClick={() => setPage(tab.key)}
                        aria-current={isActive ? 'page' : undefined}
                        style={{
                            ...TAB,
                            color: isActive ? 'var(--tof-accent-rose)' : 'var(--tof-text-muted)',
                            fontWeight: isActive ? 600 : 500,
                        }}
                    >
                        {/* Het streepje boven het actieve label; altijd aanwezig
                            zodat de labels niet verspringen bij het wisselen. */}
                        <span
                            style={{
                                ...MARK,
                                background: isActive ? 'var(--tof-accent-rose)' : 'transparent',
                            }}
                        />

                        <span style={{ fontFamily: 'inherit' }}>{tab.label}</span>

                        {/* Wat je hebt vastgeprikt, staat verspreid over de
                            hoofdstukken. Dit getal is de enige plek waar je
                            ziet hoeveel je al verzameld hebt. */}
                        {tab.badge > 0 && (
                            <span style={BADGE} aria-label={t.pinnedCount(tab.badge)}>
                                {tab.badge}
                            </span>
                        )}
                    </button>
                );
            })}
        </nav>
    );
}

const BAR = {
    position: 'fixed',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 40,
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    background: 'var(--tof-surface)',
    borderTop: '1px solid var(--tof-border)',
    // De home-indicator vrijhouden; buiten de app is de inset 0.
    paddingBottom: 'env(safe-area-inset-bottom, 0px)',
};

const TAB = {
    position: 'relative',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    display: 'grid',
    justifyItems: 'center',
    gap: 6,
    padding: '10px 4px 12px',
    fontSize: 11,
    letterSpacing: 0.2,
    lineHeight: 1.2,
    // Apples richtlijn voor raakvlakken is 44 px; met de inset erbij haalt
    // elke tab dat ruim.
    minHeight: 44,
};

const MARK = {
    width: 18,
    height: 2,
    borderRadius: 999,
};

const BADGE = {
    position: 'absolute',
    top: 4,
    right: '50%',
    transform: 'translateX(22px)',
    minWidth: 16,
    height: 16,
    borderRadius: 999,
    background: 'var(--tof-accent-rose)',
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 700,
    lineHeight: '16px',
    textAlign: 'center',
    padding: '0 4px',
};
