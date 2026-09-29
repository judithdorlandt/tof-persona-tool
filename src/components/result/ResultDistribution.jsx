import { useEffect, useState } from 'react';
import { BAR_DURATION, BAR_STAGGER, prefersReducedMotion } from './motion';

/**
 * ResultDistribution — de acht persona's als gerangschikte balken.
 *
 * Hoogste bovenaan; het label rechts is het échte aandeel van het totaal, de
 * balkbreedte is de verhouding tot de hoogste (zie `barWidth` in
 * src/lib/resultDerivations.js). De balken groeien één keer van niets naar hun
 * waarde, met een kleine vertraging per balk, zodat de rangorde zich
 * uitspreekt in plaats van in één klap te staan.
 */
export default function ResultDistribution({ label, labelStyle, items }) {
    // `false` = alle balken nog op nul. Wie minder beweging wil begint
    // meteen op de eindbreedte, dan valt er niets te groeien.
    const [grown, setGrown] = useState(prefersReducedMotion);

    useEffect(() => {
        if (grown) return undefined;

        // Twee frames wachten. Het eerste laat de browser de balken écht op
        // nul tekenen; pas in het tweede mag de breedte veranderen. Zonder die
        // tussenstap zet React beide waarden in dezelfde paint en is er geen
        // beginpunt om vanaf te animeren.
        let second;
        const first = requestAnimationFrame(() => {
            second = requestAnimationFrame(() => setGrown(true));
        });

        return () => {
            cancelAnimationFrame(first);
            if (second) cancelAnimationFrame(second);
        };
    }, [grown]);

    return (
        <div
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
