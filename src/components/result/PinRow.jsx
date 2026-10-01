import { useCopy } from '../../i18n/LanguageContext';
import { tap } from '../../native/nativeShell';

/**
 * PinRow — maakt een heel inzicht aantikbaar om mee te nemen naar je gesprek.
 *
 * Verving de losse plus-knop (`PinButton`). Een rond plusje naast een regel
 * vertelt niet wát het toevoegt en ziet er niet uit als iets waar je op kunt
 * tikken. Nu is de hele regel de knop, staat er een woord naast het plusje, en
 * kleurt een meegenomen inzicht zichtbaar op — ook als je het chipje niet leest.
 *
 * Zonder `pinning` (het web, of een profiel dat nog niet bewaard is) blijft de
 * inhoud gewoon staan, zonder knop eromheen. Zo verandert het web niet.
 */
export default function PinRow({ pin, pinning, color, children }) {
    const { native: copy } = useCopy();

    // De omlijsting hoort bij de regel zelf, niet bij de knop: zonder pinning
    // ziet het er hetzelfde uit, je kunt er alleen niet op tikken.
    const omhulsel = {
        borderRadius: 12,
        padding: '12px 14px',
        borderTop: '1px solid var(--tof-border)',
        borderRight: '1px solid var(--tof-border)',
        borderBottom: '1px solid var(--tof-border)',
    };

    if (!pinning) {
        return (
            <div style={{ ...omhulsel, background: 'var(--tof-bg)', borderLeft: `4px solid ${color}` }}>
                {children}
            </div>
        );
    }

    const active = pinning.isPinned(pin);

    return (
        <button
            type="button"
            onClick={() => {
                tap();
                pinning.toggle(pin);
            }}
            aria-pressed={active}
            aria-label={active ? copy.pin.remove : copy.pin.add}
            style={{
                ...omhulsel,
                width: '100%',
                textAlign: 'left',
                font: 'inherit',
                cursor: 'pointer',
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                gap: 10,
                background: active ? `${color}14` : 'var(--tof-bg)',
                borderLeft: `4px solid ${active ? color : 'var(--tof-border)'}`,
                transition: 'background 0.15s ease, border-color 0.15s ease',
            }}
        >
            {/* Een korte regel houdt het chipje naast zich; een blok met uitleg
                duwt het vanzelf naar de volgende regel. */}
            <span style={{ flex: '1 1 150px', minWidth: 0, display: 'block' }}>{children}</span>

            <span
                aria-hidden="true"
                style={{
                    flexShrink: 0,
                    marginLeft: 'auto',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    borderRadius: 999,
                    padding: '6px 11px',
                    fontSize: 12,
                    fontWeight: 600,
                    lineHeight: 1,
                    border: `1px solid ${color}`,
                    background: active ? color : 'transparent',
                    color: active ? '#F7F3EE' : color,
                }}
            >
                <span style={{ fontSize: 14, lineHeight: 1 }}>{active ? '✓' : '+'}</span>
                {active ? copy.pin.chipDone : copy.pin.chipAdd}
            </span>
        </button>
    );
}
