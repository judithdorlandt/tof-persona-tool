/**
 * TeamQuickWins — Quick Wins tab (Module 1)
 *
 * Premium leesbaar:
 * - Cijfer in marge (Playfair, groot) als visueel anker
 * - Source-label klein als eyebrow erboven
 * - Actie-zin in rustige body-tekst (16px Inter), niet display
 * - Witruimte tussen acties als ritme
 *
 * Ontwerp-principe: dit zijn werkacties om te scannen, niet citaten om te bewonderen.
 */

import React from 'react';
import { SPACING, TYPE, useIsMobile } from '../../ui/tokens';

const SOURCE_LABELS = {
    werkstijlen: 'Uit werkstijlen',
    werkplek: 'Uit werkplek',
    spanning: 'Uit spanning',
    minderheid: 'Uit minderheid',
    ontbrekend: 'Uit ontbrekend',
    reflectie: 'Reflectie',
};

export default function TeamQuickWins({ insights }) {
    const isMobile = useIsMobile();

    const rawItems = insights?.quickWins || [];

    const items = rawItems.map((item) => {
        if (typeof item === 'string') {
            return { source: 'reflectie', action: item };
        }
        return item;
    });

    if (items.length === 0) {
        return (
            <div style={{ padding: SPACING.lg, fontSize: 13, color: 'var(--tof-text-muted)' }}>
                Nog geen quick wins beschikbaar.
            </div>
        );
    }

    return (
        <div
            style={{
                display: 'grid',
                gap: isMobile ? SPACING.lg : SPACING.xl,
            }}
        >
            {/* Header — eyebrow links, context rechts */}
            <div
                style={{
                    display: 'flex',
                    alignItems: 'baseline',
                    justifyContent: 'space-between',
                    gap: SPACING.md,
                    flexWrap: 'wrap',
                    paddingBottom: SPACING.sm,
                    borderBottom: '1px solid var(--tof-border)',
                }}
            >
                <div style={{ ...TYPE.eyebrow, color: 'var(--tof-text-muted)' }}>
                    {items.length === 1 ? 'Eén actie' : `${items.length} acties`} voor morgen
                </div>
                <div
                    style={{
                        fontFamily: 'var(--tof-font-body)',
                        fontSize: 12,
                        color: 'var(--tof-text-muted)',
                    }}
                >
                    Synthese uit alle inzichten van dit dashboard.
                </div>
            </div>

            {/* Acties — leesbaar verticaal ritme */}
            <div
                style={{
                    display: 'grid',
                    gap: isMobile ? SPACING.md : SPACING.lg,
                }}
            >
                {items.map((item, index) => (
                    <ActionRow
                        key={index}
                        index={index + 1}
                        source={item.source}
                        action={item.action}
                        isMobile={isMobile}
                    />
                ))}
            </div>
        </div>
    );
}

// =========================
// ACTION ROW
// =========================
// Cijfer in marge als anker. Eyebrow + actie-tekst rechts, leesbaar als artikel.

function ActionRow({ index, source, action, isMobile }) {
    const sourceLabel = SOURCE_LABELS[source] || 'Reflectie';

    return (
        <div
            style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : '48px 1fr',
                gap: isMobile ? SPACING.xs : SPACING.lg,
                alignItems: 'start',
                paddingBottom: SPACING.md,
                borderBottom: '1px solid rgba(230, 221, 210, 0.5)',
            }}
        >
            {/* Cijfer in marge — Playfair, anker */}
            <div
                style={{
                    fontFamily: 'var(--tof-font-heading)',
                    fontSize: isMobile ? 20 : 28,
                    lineHeight: 1,
                    fontWeight: 500,
                    color: 'var(--tof-accent-sage)',
                    fontVariantNumeric: 'tabular-nums',
                    paddingTop: isMobile ? 0 : 4,
                }}
            >
                {String(index).padStart(2, '0')}
            </div>

            {/* Inhoud — eyebrow + leesbare actie-tekst */}
            <div style={{ display: 'grid', gap: SPACING.xs + 2 }}>
                <div
                    style={{
                        ...TYPE.eyebrow,
                        color: 'var(--tof-accent-sage)',
                    }}
                >
                    {sourceLabel}
                </div>
                <p
                    style={{
                        margin: 0,
                        fontFamily: 'var(--tof-font-body)',
                        fontSize: isMobile ? 15 : 16,
                        lineHeight: 1.6,
                        fontWeight: 400,
                        color: 'var(--tof-text)',
                        maxWidth: 720,
                    }}
                >
                    {action}
                </p>
            </div>
        </div>
    );
}
