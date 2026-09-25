/**
 * TeamWorkplaceNeeds — Werkplek tab
 *
 * Redactioneel premium ontwerp, parallel aan TeamPersonaDistribution:
 * - Hero: de sterkste werkplekbehoefte als statement
 * - Secundaire lijst: andere bovengemiddelde behoeften in 2 kolommen
 * - Subtiele afsluiting: minder vraag
 * - Geen containers, leeft op canvas met witruimte
 */

import React from 'react';
import { SPACING, TYPE, RADIUS, useIsMobile } from '../../ui/tokens';
import { useCopy } from '../../i18n/LanguageContext';

export default function TeamWorkplaceNeeds({ aggregate }) {
    const isMobile = useIsMobile();
    const t = useCopy().teamPanels.workplaceNeeds;

    const rawItems = aggregate?.sortedWorkplaceNeeds || [];
    const items = rawItems.map((item) => ({
        ...item,
        label: t.labels[item.key] || item.label || item.key,
    }));

    const total = items.reduce(
        (sum, item) => sum + Number(item.value || item.count || 0),
        0
    );

    const enriched = items.map((item) => {
        const value = Number(item.value || item.count || 0);
        const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
        return { ...item, percentage };
    });

    if (enriched.length === 0) {
        return (
            <div style={{ padding: SPACING.lg, fontSize: 13, color: 'var(--tof-text-muted)' }}>
                {t.empty}
            </div>
        );
    }

    const averagePct = 100 / enriched.length;
    const aboveAverage = enriched.filter((item) => item.percentage >= averagePct);
    const belowAverage = enriched.filter((item) => item.percentage < averagePct);

    const [hero, ...rest] = aboveAverage.length > 0 ? aboveAverage : enriched;

    return (
        <div
            style={{
                display: 'grid',
                gap: isMobile ? SPACING.lg : SPACING['2xl'],
            }}
        >
            {/* SIGNATURE — sterkste werkplekbehoefte als statement */}
            <SignatureStatement workplace={hero} isMobile={isMobile} />

            {/* SECUNDAIR — andere bovengemiddelde behoeften */}
            {rest.length > 0 ? (
                <SecondaryList items={rest} isMobile={isMobile} />
            ) : null}

            {/* MINDER VRAAG — subtiele afsluiting */}
            {belowAverage.length > 0 ? (
                <BelowAverageNote items={belowAverage} isMobile={isMobile} />
            ) : null}
        </div>
    );
}

// =========================
// SIGNATURE STATEMENT
// =========================

function SignatureStatement({ workplace, isMobile }) {
    const t = useCopy().teamPanels.workplaceNeeds;
    const meaning = t.meaning[workplace.key];

    return (
        <div
            style={{
                display: 'grid',
                gap: SPACING.sm,
                paddingBottom: isMobile ? SPACING.md : SPACING.lg,
                borderBottom: '1px solid var(--tof-border)',
            }}
        >
            <div
                style={{
                    display: 'flex',
                    alignItems: 'baseline',
                    gap: SPACING.md,
                    flexWrap: 'wrap',
                }}
            >
                <div style={{ ...TYPE.eyebrow, color: 'var(--tof-text-muted)' }}>
                    {t.strongestEyebrow}
                </div>
                <div
                    style={{
                        fontFamily: 'var(--tof-font-body)',
                        fontSize: 13,
                        color: 'var(--tof-text-muted)',
                        fontVariantNumeric: 'tabular-nums',
                    }}
                >
                    {t.shareOfDemand(workplace.percentage)}
                </div>
            </div>

            <h3
                style={{
                    margin: 0,
                    fontFamily: 'var(--tof-font-heading)',
                    fontSize: isMobile ? 32 : 'clamp(32px, 3.6vw, 46px)',
                    lineHeight: 1.0,
                    fontWeight: 500,
                    color: 'var(--tof-accent-sage)',
                    letterSpacing: '-0.01em',
                }}
            >
                {workplace.label}
            </h3>

            {meaning ? (
                <div
                    style={{
                        fontFamily: 'var(--tof-font-body)',
                        fontSize: 14,
                        lineHeight: 1.55,
                        color: 'var(--tof-text-soft)',
                    }}
                >
                    {meaning}
                </div>
            ) : null}
        </div>
    );
}

// =========================
// SECONDARY LIST
// =========================

function SecondaryList({ items, isMobile }) {
    const t = useCopy().teamPanels.workplaceNeeds;

    return (
        <div style={{ display: 'grid', gap: SPACING.md }}>
            <div style={{ ...TYPE.eyebrow, color: 'var(--tof-text-muted)' }}>
                {t.furtherAboveAverage}
            </div>

            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: isMobile
                        ? '1fr'
                        : 'repeat(2, minmax(0, 1fr))',
                    gap: isMobile ? SPACING.md : SPACING.lg,
                    columnGap: isMobile ? SPACING.md : SPACING.xl,
                }}
            >
                {items.map((item) => (
                    <SecondaryItem key={item.key} workplace={item} />
                ))}
            </div>
        </div>
    );
}

function SecondaryItem({ workplace }) {
    const meaning = useCopy().teamPanels.workplaceNeeds.meaning[workplace.key];

    return (
        <div
            style={{
                display: 'grid',
                gap: SPACING.xs + 2,
                paddingBottom: SPACING.sm + 2,
                borderBottom: '1px solid rgba(230, 221, 210, 0.6)',
            }}
        >
            <div
                style={{
                    display: 'flex',
                    alignItems: 'baseline',
                    justifyContent: 'space-between',
                    gap: SPACING.md,
                }}
            >
                <h4
                    style={{
                        margin: 0,
                        fontFamily: 'var(--tof-font-heading)',
                        fontSize: 20,
                        lineHeight: 1.1,
                        fontWeight: 500,
                        color: 'var(--tof-text)',
                    }}
                >
                    {workplace.label}
                </h4>
                <div
                    style={{
                        fontFamily: 'var(--tof-font-body)',
                        fontSize: 13,
                        fontVariantNumeric: 'tabular-nums',
                        color: 'var(--tof-text-muted)',
                    }}
                >
                    {workplace.percentage}%
                </div>
            </div>

            <div
                style={{
                    height: 3,
                    background: 'rgba(230, 221, 210, 0.6)',
                    borderRadius: RADIUS.pill,
                    overflow: 'hidden',
                }}
            >
                <div
                    style={{
                        width: `${workplace.percentage}%`,
                        height: '100%',
                        background: 'var(--tof-accent-sage)',
                        borderRadius: RADIUS.pill,
                        transition: 'width 0.5s var(--tof-ease)',
                    }}
                />
            </div>

            {meaning ? (
                <div
                    style={{
                        fontFamily: 'var(--tof-font-body)',
                        fontSize: 13,
                        lineHeight: 1.5,
                        color: 'var(--tof-text-soft)',
                    }}
                >
                    {meaning}
                </div>
            ) : null}
        </div>
    );
}

// =========================
// BELOW AVERAGE NOTE
// =========================

function BelowAverageNote({ items, isMobile }) {
    const t = useCopy().teamPanels.workplaceNeeds.below;

    return (
        <div
            style={{
                display: 'grid',
                gap: SPACING.sm,
                paddingTop: isMobile ? SPACING.sm : SPACING.md,
                borderTop: '1px solid var(--tof-border)',
            }}
        >
            <div
                style={{
                    display: 'flex',
                    alignItems: 'baseline',
                    justifyContent: 'space-between',
                    gap: SPACING.md,
                    flexWrap: 'wrap',
                }}
            >
                <div style={{ ...TYPE.eyebrow, color: 'var(--tof-text-muted)' }}>
                    {t.eyebrow}
                </div>
                <div
                    style={{
                        fontFamily: 'var(--tof-font-body)',
                        fontSize: 12,
                        color: 'var(--tof-text-muted)',
                    }}
                >
                    {t.note}
                </div>
            </div>

            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: isMobile
                        ? '1fr 1fr'
                        : 'repeat(3, minmax(0, 1fr))',
                    columnGap: SPACING.lg,
                    rowGap: SPACING.sm,
                }}
            >
                {items.map((item) => (
                    <div
                        key={item.key}
                        style={{
                            display: 'flex',
                            alignItems: 'baseline',
                            justifyContent: 'space-between',
                            gap: SPACING.sm,
                            paddingBottom: 6,
                            borderBottom: '1px solid rgba(230, 221, 210, 0.4)',
                        }}
                    >
                        <span
                            style={{
                                fontFamily: 'var(--tof-font-body)',
                                fontSize: 14,
                                color: 'var(--tof-text-soft)',
                                fontWeight: 400,
                            }}
                        >
                            {item.label}
                        </span>
                        <span
                            style={{
                                fontFamily: 'var(--tof-font-body)',
                                fontSize: 12,
                                fontVariantNumeric: 'tabular-nums',
                                color: 'var(--tof-text-muted)',
                            }}
                        >
                            {item.percentage}%
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
