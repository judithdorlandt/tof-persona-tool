import { useCopy } from '../../i18n/LanguageContext';
import { tap } from '../../native/nativeShell';

/**
 * PinButton — prikt één inzicht aan je gespreksvoorbereiding.
 *
 * Alleen in app-modus zichtbaar: zonder `pinning` (het web, of een profiel dat
 * nog niet bewaard is) rendert dit niets, zodat de bestaande pagina niet
 * verandert. Tikken prikt vast, nog eens tikken haalt het er weer af — geen
 * dialoog, geen bevestiging.
 */
export default function PinButton({ pin, pinning, color }) {
    const { native: copy } = useCopy();
    if (!pinning) return null;

    const active = pinning.isPinned(pin);
    const label = active ? copy.pin.remove : copy.pin.add;

    return (
        <button
            type="button"
            onClick={() => {
                tap();
                pinning.toggle(pin);
            }}
            aria-label={label}
            aria-pressed={active}
            title={label}
            style={{
                flexShrink: 0,
                width: 26,
                height: 26,
                borderRadius: '50%',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                padding: 0,
                lineHeight: 1,
                fontSize: 15,
                fontFamily: 'inherit',
                border: `1px solid ${color}`,
                background: active ? color : 'transparent',
                color: active ? '#F7F3EE' : color,
                transition: 'background 0.15s ease, color 0.15s ease',
            }}
        >
            {active ? '✓' : '+'}
        </button>
    );
}
