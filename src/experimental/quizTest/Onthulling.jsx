import { useEffect, useRef, useState } from 'react';
import { PERSONA_COLORS, DEFAULT_PERSONA_COLOR } from '../../lib/resultDerivations';
import { tap } from '../../native/nativeShell';

/**
 * Onthulling — het moment tussen "toon mijn profiel" en het profiel zelf.
 *
 * Bestaat omdat mensen het profiel eerder al meteen in beeld kregen, langs de
 * knoppen heen scrolden en wegklikten zonder af te ronden — waardoor er niets
 * werd opgeslagen. Nu is er één weg naar je profiel, en die loopt hierlangs.
 *
 * De acht persona's komen één voor één voorbij en dan staat de jouwe er. Geen
 * versnelling of vertraging: één rustig tempo, anders voelt het jachtig.
 *
 * `onDone` vuurt als de onthulling klaar is; de aanroeper laat dan het profiel
 * zien. Wie beweging heeft uitgezet (prefers-reduced-motion) krijgt de
 * eindtoestand meteen te zien.
 */

const CREAM = '#f7f2ec';
const SOFT = '#6a5f58';

// 12 wissels van 280 ms: ruim drie seconden, waarin elke persona minstens
// één keer langskomt.
const SLOT_TICKS = 12;
const SLOT_MS = 280;
// Hoe lang de naam in beeld blijft voordat het profiel overneemt.
const NAAM_HOUD_MS = 1250;

function prefersReducedMotion() {
    try {
        return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    } catch (_e) {
        return false;
    }
}

export default function Onthulling({ archetypes, primaryId, onDone, isMobile, eyebrow }) {
    const primary = archetypes.find((a) => a.id === primaryId) || archetypes[0];
    const kleur = PERSONA_COLORS[primary?.id] || DEFAULT_PERSONA_COLOR;

    // 'bezig' = de namen lopen nog, 'naam' = de jouwe staat er.
    const [fase, setFase] = useState('bezig');
    const [slotIndex, setSlotIndex] = useState(0);
    const timers = useRef([]);

    useEffect(() => {
        const plan = (fn, ms) => timers.current.push(setTimeout(fn, ms));
        const klaar = () => {
            setFase('naam');
            tap(true);
            plan(onDone, NAAM_HOUD_MS);
        };

        if (prefersReducedMotion()) {
            klaar();
        } else {
            for (let i = 1; i <= SLOT_TICKS; i += 1) plan(() => setSlotIndex(i), SLOT_MS * i);
            plan(klaar, SLOT_MS * (SLOT_TICKS + 1));
        }

        const lopend = timers.current;
        return () => lopend.forEach(clearTimeout);
        // Eén keer opzetten: de onthulling speelt zich af zoals hij begon.
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const flitsNaam = archetypes[slotIndex % archetypes.length]?.name || '';

    return (
        <div
            style={{
                minHeight: 'calc(100vh - 88px)',
                background: CREAM,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 24,
                boxSizing: 'border-box',
                overflow: 'hidden',
            }}
        >
            <div style={{ display: 'grid', justifyItems: 'center', gap: 18, width: '100%', maxWidth: 680 }}>
                {fase === 'bezig' ? (
                    <div
                        key={slotIndex}
                        style={{
                            fontFamily: 'Playfair Display',
                            fontSize: isMobile ? 38 : 58,
                            lineHeight: 1.05,
                            fontWeight: 500,
                            color: '#cdc3b9',
                            textAlign: 'center',
                            animation: 'tofSlotIn .22s ease',
                        }}
                    >
                        {flitsNaam}
                    </div>
                ) : (
                    <div
                        style={{
                            display: 'grid',
                            justifyItems: 'center',
                            gap: 10,
                            animation: 'tofNaamIn .55s cubic-bezier(.2,1.3,.4,1)',
                        }}
                    >
                        <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 2, fontWeight: 700, color: SOFT }}>
                            {eyebrow}
                        </div>
                        <div
                            style={{
                                fontFamily: 'Playfair Display',
                                fontSize: isMobile ? 44 : 68,
                                lineHeight: 1.05,
                                fontWeight: 500,
                                color: kleur,
                                textAlign: 'center',
                            }}
                        >
                            {primary?.name}
                        </div>
                        <div
                            style={{
                                height: 2,
                                width: isMobile ? 120 : 180,
                                background: kleur,
                                borderRadius: 999,
                                animation: 'tofLijnUit .7s ease .15s backwards',
                            }}
                        />
                    </div>
                )}
            </div>

            <style>{`
                @keyframes tofSlotIn {
                    from { opacity: 0; transform: translateY(14px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                @keyframes tofNaamIn {
                    from { opacity: 0; transform: scale(0.86); }
                    to   { opacity: 1; transform: scale(1); }
                }
                @keyframes tofLijnUit {
                    from { width: 0; }
                }
            `}</style>
        </div>
    );
}
