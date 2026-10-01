import { useCopy } from '../i18n/LanguageContext';
import { resolvePinned } from '../lib/resultDerivations';

/** De vier open vragen, in de volgorde waarin je ze invulde. */
const NOTE_FIELDS = ['recognize', 'drains', 'ask', 'outcome'];

const bodyText = {
    margin: 0,
    color: 'var(--tof-text-soft)',
    lineHeight: 1.7,
    fontSize: 15,
};

/**
 * Eén afgerond gesprek: nummer, datum, wat je opschreef, wat je meenam.
 *
 * Alleen-lezen en stiller dan het lopende gesprek — geen invulvelden, geen
 * gekleurde randen, geen knoppen. Dit is er om terug te lezen, niet om aan te
 * werken. Vragen die je toen hebt overgeslagen laten we weg: een rij lege
 * kopjes zegt niets.
 *
 * Staat in een eigen bestand omdat twee schermen hem nodig hebben: het
 * gespreksscherm toont alleen je laatste gesprek, de historie alle gesprekken
 * onder het profiel waar ze bij horen.
 */
export default function PastConversation({
    isMobile,
    color,
    gesprek,
    primary,
    workplaceLabels,
    compact = false,
}) {
    const { native: copy } = useCopy();
    const beantwoord = NOTE_FIELDS.filter((field) => gesprek.notes?.[field]?.trim());
    const pinnedItems = resolvePinned(gesprek.pinned, primary, workplaceLabels);

    return (
        <div
            style={{
                background: compact ? 'var(--tof-bg)' : 'var(--tof-surface)',
                borderRadius: compact ? 14 : 18,
                padding: isMobile ? 18 : 24,
                border: '1px solid var(--tof-border)',
                display: 'grid',
                gap: 14,
            }}
        >
            <div style={{ display: 'flex', gap: 8, alignItems: 'baseline', flexWrap: 'wrap' }}>
                <span style={{ fontSize: 15, fontWeight: 600, color }}>
                    {copy.prep.past.label(gesprek.nummer)}
                </span>

                <span style={{ fontSize: 14, color: 'var(--tof-text-muted)' }}>
                    {copy.prep.past.formatDate(gesprek.closedAt)}
                </span>
            </div>

            {beantwoord.length === 0 ? (
                <p style={{ ...bodyText, fontSize: 14 }}>{copy.prep.past.noAnswer}</p>
            ) : (
                beantwoord.map((field) => (
                    <div key={field} style={{ display: 'grid', gap: 4 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--tof-text)', lineHeight: 1.45 }}>
                            {copy.notes.fields[field].label}
                        </span>

                        {/* `pre-wrap`: regeleinden die je zelf hebt getypt horen
                            te blijven staan, anders wordt een lijstje één lap. */}
                        <p style={{ ...bodyText, fontSize: 14, whiteSpace: 'pre-wrap' }}>
                            {gesprek.notes[field].trim()}
                        </p>
                    </div>
                ))
            )}

            <div style={{ display: 'grid', gap: 6 }}>
                <span
                    style={{
                        fontSize: 11,
                        letterSpacing: 1.4,
                        textTransform: 'uppercase',
                        fontWeight: 700,
                        color: 'var(--tof-text-muted)',
                    }}
                >
                    {copy.prep.pinnedTitle}
                </span>

                {pinnedItems.length === 0 ? (
                    <p style={{ ...bodyText, fontSize: 14 }}>{copy.prep.past.nothingPinned}</p>
                ) : (
                    <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'grid', gap: 8 }}>
                        {pinnedItems.map((item) => (
                            <li
                                key={`${item.kind}-${item.key}`}
                                style={{
                                    ...bodyText,
                                    fontSize: 14,
                                    borderLeft: '2px solid var(--tof-border)',
                                    paddingLeft: 10,
                                }}
                            >
                                {item.label ? (
                                    <span style={{ fontWeight: 600, color: 'var(--tof-text)' }}>
                                        {item.label}:{' '}
                                    </span>
                                ) : null}
                                {item.text}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}
