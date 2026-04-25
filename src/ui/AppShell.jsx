/**
 * AppShell — pagina-primitives op basis van het design-system.
 *
 * Bevat de basis bouwstenen:
 *   <PageShell>         wrapper voor elke pagina
 *   <HeroBlock>         titel+eyebrow+lead+acties, direct op canvas
 *   <SectionCard>       standaard content-kaart (witte bg, border-top accent)
 *   <InnerCard>         kaart-in-kaart, subtiel
 *   <InteractiveRow>    lijst-item met border-left accent
 *   <CollapsibleCard>   Library-pattern: klikbaar, open/dicht, dimmen van andere
 *   <SectionEyebrow>
 *   <PrimaryButton>
 *   <SecondaryButton>
 *
 * Iedere primitive respecteert de tokens uit tokens.js.
 */

import React from 'react';
import { SPACING, RADIUS, TYPE, SHADOW, EASE, useIsMobile } from './tokens';

// =========================
// PAGE SHELL
// =========================

export function PageShell({ children, maxWidth = 1120, padding, compact = false }) {
    const isMobile = useIsMobile();
    const resolvedPadding = padding || (isMobile ? '20px 16px 28px' : '24px 20px 36px');

    // Compact mode: kleinere gap tussen secties, voor dashboards.
    const gap = compact
        ? (isMobile ? SPACING.lg : SPACING.xl)
        : (isMobile ? SPACING['2xl'] : SPACING['3xl']);

    return (
        <div
            style={{
                minHeight: 'calc(100vh - 88px)',
                background: 'var(--tof-bg)',
                padding: resolvedPadding,
            }}
        >
            <div
                style={{
                    maxWidth,
                    margin: '0 auto',
                    display: 'grid',
                    gap,
                }}
            >
                {children}
            </div>
        </div>
    );
}

// =========================
// HERO BLOCK
// =========================
// Geen kaart rondom. Direct op canvas.
// Patroon uit Results / Library / Intro.

export function HeroBlock({
    eyebrow,
    title,
    titleAccent,
    titleAccentColor,
    lead,
    actions,
    maxWidth = 760,
    compact = false,
}) {
    const isMobile = useIsMobile();
    const accentColor = titleAccentColor || 'var(--tof-accent-rose)';

    const titleStyle = compact
        ? {
            ...TYPE.display,
            fontSize: 'clamp(28px, 3.5vw, 42px)',
            lineHeight: 1.08,
        }
        : TYPE.display;

    return (
        <div
            style={{
                display: 'grid',
                gap: compact ? SPACING.sm + 2 : SPACING.md,
            }}
        >
            {/* TOP ROW: eyebrow links + actions rechts */}
            {(eyebrow || actions) ? (
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: SPACING.md,
                        flexWrap: 'wrap',
                    }}
                >
                    {eyebrow ? (
                        <div style={{ ...TYPE.eyebrow, color: accentColor }}>
                            {eyebrow}
                        </div>
                    ) : <div />}

                    {actions ? (
                        <div
                            style={{
                                display: 'flex',
                                gap: SPACING.sm + 2,
                                flexWrap: 'wrap',
                            }}
                        >
                            {actions}
                        </div>
                    ) : null}
                </div>
            ) : null}

            {/* TITLE op volle breedte */}
            <h1 style={{ ...titleStyle, maxWidth }}>
                {title}
                {titleAccent ? (
                    <>
                        {' '}
                        <span
                            style={{
                                color: accentColor,
                                fontStyle: 'italic',
                                whiteSpace: 'nowrap',
                            }}
                        >
                            {titleAccent}
                        </span>
                    </>
                ) : null}
            </h1>

            {/* LEAD */}
            {lead ? (
                <p
                    style={{
                        ...TYPE.bodyLarge,
                        color: '#6F6A66',
                        maxWidth: 680,
                        fontSize: compact ? 15 : 16,
                    }}
                >
                    {lead}
                </p>
            ) : null}
        </div>
    );
}

// =========================
// SECTION CARD
// =========================
// Standaard inhoud-kaart. Type A uit het design-system.
// Border-top accent, witte achtergrond.

export function SectionCard({
    children,
    eyebrow,
    title,
    accent = 'var(--tof-accent-rose)',
    padding,
    style = {},
}) {
    const isMobile = useIsMobile();
    const resolvedPadding = padding !== undefined ? padding : (isMobile ? SPACING.xl : 22);

    return (
        <div
            style={{
                background: 'var(--tof-surface)',
                borderRadius: RADIUS.xl,
                padding: resolvedPadding,
                borderTop: `4px solid ${accent}`,
                border: '1px solid var(--tof-border)',
                boxShadow: SHADOW.soft,
                display: 'grid',
                gap: SPACING.lg,
                ...style,
            }}
        >
            {eyebrow && <SectionEyebrow>{eyebrow}</SectionEyebrow>}
            {title && <h2 style={TYPE.heading}>{title}</h2>}
            {children}
        </div>
    );
}

// =========================
// INNER CARD
// =========================
// Kaart binnen een kaart. Type B uit design-system.

export function InnerCard({ children, eyebrow, title, titleColor = 'var(--tof-text)' }) {
    return (
        <div
            style={{
                background: 'rgba(255,255,255,0.82)',
                border: '1px solid #EADFD4',
                borderRadius: RADIUS.xl,
                padding: '16px 18px',
                display: 'grid',
                alignSelf: 'start',
                gap: SPACING.sm + 2,
            }}
        >
            {eyebrow ? <SectionEyebrow>{eyebrow}</SectionEyebrow> : null}

            {title ? (
                <div
                    style={{
                        ...TYPE.subhead,
                        fontSize: 24,
                        color: titleColor,
                    }}
                >
                    {title}
                </div>
            ) : null}

            {children}
        </div>
    );
}

// =========================
// INTERACTIVE ROW
// =========================
// Lijst-item met linker border-accent. Type C uit design-system.
// Wordt niet "geopend" — is gewoon een rij met eventueel knoppen erin.

export function InteractiveRow({
    accent = 'var(--tof-accent-rose)',
    children,
    subtle = false, // subtle=true → lichtere achtergrond (var(--tof-bg))
    style = {},
}) {
    return (
        <div
            style={{
                background: subtle ? 'var(--tof-bg)' : 'var(--tof-surface)',
                border: '1px solid var(--tof-border)',
                borderLeft: `3px solid ${accent}`,
                borderRadius: RADIUS.md,
                padding: '10px 12px',
                display: 'flex',
                alignItems: 'center',
                gap: SPACING.md,
                flexWrap: 'wrap',
                ...style,
            }}
        >
            {children}
        </div>
    );
}

// =========================
// COLLAPSIBLE CARD
// =========================
// Library-pattern: klikbare kaart, open/dicht, andere kaarten dimmen.
//
// Gebruik:
//   <CollapsibleCard
//     isOpen={openId === 'x'}
//     isDimmed={openId !== null && openId !== 'x'}
//     accent="var(--tof-accent-sage)"
//     soft="#DDE9E2"
//     onToggle={() => setOpenId(openId === 'x' ? null : 'x')}
//     header={<CardHeader ... />}
//   >
//     {open content}
//   </CollapsibleCard>

export function CollapsibleCard({
    isOpen,
    isDimmed = false,
    accent = 'var(--tof-accent-rose)',
    soft = 'rgba(176,82,82,0.12)',
    onToggle,
    header,        // JSX getoond altijd (dichte state)
    children,      // JSX open content, alleen bij isOpen
    cardRef,
}) {
    const isMobile = useIsMobile();

    return (
        <div
            ref={cardRef}
            style={{
                scrollMarginTop: 24,
                transition: `opacity 0.25s ${EASE}, transform 0.25s ${EASE}`,
                opacity: isDimmed ? 0.55 : 1,
                transform: isOpen ? 'translateY(-2px)' : 'translateY(0)',
                filter: isDimmed ? 'saturate(0.9)' : 'none',
            }}
        >
            <button
                type="button"
                onClick={onToggle}
                onMouseLeave={(e) => e.currentTarget.blur()}
                style={{
                    width: '100%',
                    textAlign: 'left',
                    background: isOpen
                        ? `linear-gradient(135deg, ${soft} 0%, #F7F3EE 100%)`
                        : 'var(--tof-surface)',
                    border: isOpen
                        ? `1px solid ${accent}`
                        : '1px solid var(--tof-border)',
                    borderTop: `4px solid ${accent}`,
                    borderRadius: RADIUS.xl,
                    padding: 0,
                    cursor: 'pointer',
                    boxShadow: isOpen ? SHADOW.hover : SHADOW.soft,
                    overflow: 'hidden',
                    transition: `all 0.25s ${EASE}`,
                    outline: 'none',
                    display: 'flex',
                    flexDirection: 'column',
                }}
            >
                <div
                    style={{
                        padding: isMobile ? '18px 16px 14px' : '22px 22px 18px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: SPACING.md,
                    }}
                >
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start',
                            gap: SPACING.md,
                        }}
                    >
                        <div style={{ flex: 1, display: 'grid', gap: SPACING.sm }}>
                            {header}
                        </div>

                        <div
                            style={{
                                minWidth: 34,
                                height: 34,
                                borderRadius: RADIUS.pill,
                                background: isOpen ? accent : soft,
                                color: isOpen ? '#FFFFFF' : accent,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: 20,
                                lineHeight: 1,
                                fontWeight: 500,
                                flexShrink: 0,
                            }}
                        >
                            {isOpen ? '–' : '+'}
                        </div>
                    </div>

                    {isOpen ? (
                        <div
                            style={{
                                marginTop: SPACING.md,
                                display: 'grid',
                                gap: SPACING.md,
                            }}
                        >
                            {children}
                        </div>
                    ) : null}

                    {/* Hint-regel onderaan */}
                    <div
                        style={{
                            ...TYPE.meta,
                            color: 'var(--tof-text-muted)',
                            fontWeight: 500,
                            marginTop: SPACING.xs,
                        }}
                    >
                        {isOpen ? 'Minder tonen' : 'Ontdek wat dit inhoudt →'}
                    </div>
                </div>
            </button>
        </div>
    );
}

// =========================
// TILE + TILE GRID
// =========================
// Dashboard-navigatie: compacte klikbare tegel, eentje actief tegelijk.
// Gebruikt in Team Insight en Team Dynamics om tussen detail-blokken te
// schakelen zonder lange scroll.

export function TileGrid({ children, columns = 4, gap }) {
    const isMobile = useIsMobile();
    const resolvedGap = gap !== undefined ? gap : SPACING.md;

    return (
        <div
            style={{
                display: 'grid',
                gridTemplateColumns: isMobile
                    ? 'repeat(2, minmax(0, 1fr))'
                    : `repeat(${columns}, minmax(0, 1fr))`,
                gap: resolvedGap,
            }}
        >
            {children}
        </div>
    );
}

export function Tile({
    eyebrow,
    value,
    hint,
    accent = 'var(--tof-accent-rose)',
    isActive = false,
    onClick,
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            style={{
                background: isActive ? accent : 'var(--tof-surface)',
                border: isActive
                    ? `1px solid ${accent}`
                    : '1px solid var(--tof-border)',
                borderTop: `3px solid ${accent}`,
                borderRadius: RADIUS.lg,
                padding: '14px 16px',
                cursor: 'pointer',
                textAlign: 'left',
                fontFamily: 'var(--tof-font-body)',
                display: 'grid',
                gap: SPACING.xs + 2,
                alignContent: 'start',
                boxShadow: isActive ? SHADOW.hover : SHADOW.soft,
                transition: `all 0.2s ${EASE}`,
                minHeight: 100,
                position: 'relative',
            }}
            onMouseEnter={(e) => {
                if (!isActive) {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = SHADOW.hover;
                }
            }}
            onMouseLeave={(e) => {
                if (!isActive) {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = SHADOW.soft;
                }
            }}
        >
            <div
                style={{
                    ...TYPE.eyebrow,
                    fontSize: 10,
                    letterSpacing: 1.4,
                    color: isActive ? 'rgba(255,255,255,0.85)' : 'var(--tof-text-muted)',
                }}
            >
                {eyebrow}
            </div>

            <div
                style={{
                    fontFamily: 'var(--tof-font-heading)',
                    fontSize: 18,
                    lineHeight: 1.15,
                    fontWeight: 500,
                    color: isActive ? '#fff' : 'var(--tof-text)',
                }}
            >
                {value}
            </div>

            {hint ? (
                <div
                    style={{
                        fontSize: 12,
                        lineHeight: 1.5,
                        color: isActive ? 'rgba(255,255,255,0.82)' : 'var(--tof-text-soft)',
                    }}
                >
                    {hint}
                </div>
            ) : null}

            {/* Chevron onderaan rechts */}
            <div
                style={{
                    position: 'absolute',
                    bottom: 12,
                    right: 14,
                    fontSize: 11,
                    color: isActive ? 'rgba(255,255,255,0.9)' : accent,
                    fontWeight: 700,
                    transform: isActive ? 'rotate(180deg)' : 'rotate(0)',
                    transition: `transform 0.2s ${EASE}`,
                }}
            >
                ▾
            </div>
        </button>
    );
}

// =========================
// SECTION EYEBROW
// =========================

export function SectionEyebrow({ children, color }) {
    return (
        <div
            style={{
                ...TYPE.eyebrow,
                color: color || 'var(--tof-text-muted)',
            }}
        >
            {children}
        </div>
    );
}

// =========================
// BUTTONS
// =========================

export function PrimaryButton({ children, onClick, type = 'button', style = {}, disabled = false }) {
    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            style={{
                background: 'var(--tof-accent-rose)',
                color: 'white',
                border: 'none',
                padding: '12px 18px',
                borderRadius: RADIUS.md,
                cursor: disabled ? 'not-allowed' : 'pointer',
                fontSize: 14,
                fontWeight: 600,
                fontFamily: 'var(--tof-font-body)',
                opacity: disabled ? 0.6 : 1,
                ...style,
            }}
        >
            {children}
        </button>
    );
}

export function SecondaryButton({ children, onClick, type = 'button', style = {} }) {
    return (
        <button
            type={type}
            onClick={onClick}
            style={{
                background: 'transparent',
                color: 'var(--tof-text)',
                border: '1px solid #d8cec4',
                padding: '12px 18px',
                borderRadius: RADIUS.md,
                cursor: 'pointer',
                fontSize: 14,
                fontWeight: 500,
                fontFamily: 'var(--tof-font-body)',
                ...style,
            }}
        >
            {children}
        </button>
    );
}
