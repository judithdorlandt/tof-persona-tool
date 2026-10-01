import { useEffect, useRef, useState } from 'react';
import { BAR_DURATION, BAR_STAGGER, prefersReducedMotion } from './motion';

/**
 * ResultDistribution — de acht persona's als gerangschikte balken.
 *
 * Hoogste bovenaan; het label rechts is het échte aandeel van het totaal, de
 * balkbreedte is de verhouding tot de hoogste (zie `barWidth` in
 * src/lib/resultDerivations.js). De balken groeien één keer van niets naar hun
 * waarde, met een kleine vertraging per balk, zodat de rangorde zich
 * uitspreekt in plaats van in één klap te staan.
 *
 * Ze groeien pas **als het blok in beeld komt**. Stond het onder de vouw, dan
 * was het groeien al voorbij tegen de tijd dat je er was en zag je alleen een
 * stilstaand plaatje. Het gebeurt één keer: terugscrollen laat ze staan.
 */
export default function ResultDistribution({ label, labelStyle, items }) {
    // `false` = alle balken nog op nul. Wie minder beweging wil begint
    // meteen op de eindbreedte, dan valt er niets te groeien.
    const [grown, setGrown] = useState(prefersReducedMotion);
    const blokRef = useRef(null);

    useEffect(() => {
        if (grown) return undefined;

        const blok = blokRef.current;
        if (!blok || typeof IntersectionObserver !== 'function') {
            setGrown(true);
            return undefined;
        }

        const observer = new IntersectionObserver(
            ([item]) => {
                if (!item.isIntersecting) return;
                observer.disconnect();
                // Twee frames wachten. Het eerste laat de browser de balken écht
                // op nul tekenen; pas in het tweede mag de breedte veranderen.
                // Zonder die tussenstap zet React beide waarden in dezelfde
                // paint en is er geen beginpunt om vanaf te animeren.
                requestAnimationFrame(() => {
                    requestAnimationFrame(() => setGrown(true));
                });
            },
            // Een kwart van het blok moet zichtbaar zijn: bij het randje van het
            // scherm beginnen zou het groeien weer buiten beeld laten gebeuren.
            { threshold: 0.25 }
        );

        observer.observe(blok);
        return () => observer.disconnect();
    }, [grown]);

    return (
        <div
            ref={blokRef}
            style={{
                background: 'rgba(255,255,255,0.82)',
                borderRadius: 14,
                padding: '14px 16px',
                border: '1px solid #E7DBCF',
                display: 'grid',
                gap: 10,
            }}
        >
            <div style={labelStyle}>{label}</div>

            <div style={{ display: 'grid', gap: 8 }}>
                {items.map((item, index) => (
                    <div key={item.id} style={{ display: 'grid', gap: 4 }}>
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                gap: 10,
                                fontSize: 12,
                                color: '#3F342F',
                            }}
                        >
                            <span style={{ fontWeight: 600 }}>{item.name}</span>
                            <span>{item.percentage}%</span>
                        </div>

                        <div
                            style={{
                                height: 8,
                                background: '#EADFD4',
                                borderRadius: 999,
                                overflow: 'hidden',
                            }}
                        >
                            <div
                                style={{
                                    width: grown ? `${item.barWidth}%` : 0,
                                    height: '100%',
                                    background: item.color,
                                    opacity: item.opacity,
                                    borderRadius: 999,
                                    transition: `width ${BAR_DURATION}ms var(--tof-ease) ${index * BAR_STAGGER}ms`,
                                }}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
