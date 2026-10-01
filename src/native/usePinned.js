import { useCallback, useEffect, useState } from 'react';
import { togglePin } from './localStore';

/**
 * usePinned — de inzichten die aan dít profiel zijn vastgeprikt.
 *
 * Houdt de lijst in state zodat de knoppen meteen meebewegen, en schrijft
 * elke wijziging door naar de lokale opslag. Zonder bewaard profiel (het web,
 * of een quiz die nog niet is afgerond) geeft dit `null` terug — dan laat
 * PinButton zich niet zien.
 */
export default function usePinned(entry) {
    const entryId = entry?.id || null;
    const [pinned, setPinned] = useState(entry?.pinned || []);

    // Een ander profiel openen betekent: een andere lijst.
    useEffect(() => {
        setPinned(entry?.pinned || []);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [entryId]);

    const toggle = useCallback(
        (pin) => {
            if (entryId) setPinned(togglePin(entryId, pin));
        },
        [entryId]
    );

    const isPinned = useCallback(
        (pin) => pinned.some((p) => p.kind === pin.kind && p.key === pin.key),
        [pinned]
    );

    if (!entryId) return null;
    return { pinned, toggle, isPinned };
}
