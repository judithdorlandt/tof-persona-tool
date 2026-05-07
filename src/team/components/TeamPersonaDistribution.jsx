/**
 * TeamPersonaDistribution — Werkstijlen tab
 *
 * TWEE LAGEN, ÉÉN VERHAAL:
 *
 * 1. WIE ZIT ER (primair, met namen)
 *    → aggregate.personasByPrimary
 *    Hero met dominante primaire persona + namen.
 *    Lijst met andere primair-aanwezige persona's.
 *    Dit is wat een leidinggevende herkent: "deze mensen lopen rond".
 *
 * 2. WELKE ENERGIE DRAAGT DIT TEAM (gewogen, geen namen)
 *    → aggregate.personasByEnergy
 *    Subtiele balken die de tweede laag tonen: ook werkstijlen die niet
 *    primair zijn dragen energie via secundair/tertiair.
 *
 * 3. WIE ECHT ONTBREEKT (count=0 én energie<5%)
 *    → aggregate.missingPersonas
 *    Strikte definitie zodat een persona nooit tegelijk dominant in
 *    energie én ontbrekend kan zijn.
 *
 * Redactioneel premium ontwerp:
 * - Eén signature-statement bovenaan
 * - Asymmetrische hiërarchie
 * - Geen containers, leeft op het canvas
 */

import React from 'react';
import { SPACING, TYPE, RADIUS, useIsMobile } from '../../ui/tokens';

const PERSONA_COLORS = {
    maker: '#B05252',
    groeier: '#C28D6B',
    presteerder: '#C7A24A',
    denker: '#6F7F92',
    verbinder: '#7F9A8A',
    teamspeler: '#8B7F9A',
    zekerzoeker: '#7D8A6B',
    vernieuwer: '#D08C5B',
};

const MISSING_CONTRIBUTION = {
    maker: 'Zonder maker mist het team de drang om dingen tastbaar te maken — ideeën blijven hangen in concepten.',
    groeier: 'Zonder groeier mist het team de natuurlijke nieuwsgierigheid om te leren en zich te ontwikkelen.',
    presteerder: 'Zonder presteerder mist het team de scherpte om dingen daadwerkelijk af te krijgen.',
    denker: 'Zonder denker mist het team de grondigheid om besluiten op inhoud te toetsen.',
    verbinder: 'Zonder verbinder mist het team het vroege signaal als de samenwerking begint te schuren.',
    teamspeler: 'Zonder teamspeler mist het team de lijm — niemand bewaakt expliciet de groepsdynamiek.',
    zekerzoeker: 'Zonder zekerzoeker mist het team het tegenwicht dat continuïteit en stabiliteit bewaakt.',
    vernieuwer: 'Zonder vernieuwer mist het team de impuls om bestaande aanpakken te durven loslaten.',
};

function colorFor(id) {
    return PERSONA_COLORS[id] || 'var(--tof-text)';
}

export default function TeamPersonaDistribution({ aggregate }) {
    const isMobile = useIsMobile();

    // LAAG 1 — wie zit er primair (met namen)
    const personasByPrimary = aggregate?.personasByPrimary || [];

    // LAAG 2 — welke werkstijl-energie draagt het team
    const personasByEnergy = aggregate?.personasByEnergy || [];

    // ONTBREKEND — strikt: count=0 én energie<5%
    const missingPersonas = aggregate?.missingPersonas || [];

    if (personasByPrimary.length === 0) {
        return (
            <div style={{ padding: SPACING.lg, fontSize: 13, color: 'var(--tof-text-muted)' }}>
                Nog geen werkstijlen beschikbaar.
            </div>
        );
    }

    const [hero, ...rest] = personasByPrimary;

    return (
        <div
            style={{
                display: 'grid',
                gap: isMobile ? SPACING.lg : SPACING['2xl'],
            }}
        >
            {/* LAAG 1A — SIGNATURE: dominante primaire persona */}
            <SignatureStatement persona={hero} isMobile={isMobile} />

            {/* LAAG 1B — andere primair-aanwezige persona's */}
            {rest.length > 0 ? (
                <SecondaryList items={rest} isMobile={isMobile} />
            ) : null}

            {/* LAAG 2 — werkstijl-energie van het team */}
            {personasByEnergy.length > 0 ? (
                <EnergyDistribution
                    items={personasByEnergy}
                    isMobile={isMobile}
                />
            ) : null}

            {/* WIE ONTBREEKT — strikte definitie */}
            {missingPersonas.length > 0 ? (
                <MissingNote missing={missingPersonas} isMobile={isMobile} />
            ) : null}
        </div>
    );
}

// =========================
// SIGNATURE — dominante primaire persona als hero
// =========================
function SignatureStatement({ persona, isMobile }) {
    const color = colorFor(persona.id);
    const namesText = formatPeople(persona.names, persona.anonymousCount);

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
                <div
                    style={{
                        ...TYPE.eyebrow,
                        color: 'var(--tof-text-muted)',
                    }}
                >
                    Dominante werkstijl
                </div>
                <div
                    style={{
                        fontFamily: 'var(--tof-font-body)',
                        fontSize: 13,
                        color: 'var(--tof-text-muted)',
                        fontVariantNumeric: 'tabular-nums',
                    }}
                >
                    {persona.countPercentage}% van het team
                </div>
            </div>

            <h3
                style={{
                    margin: 0,
                    fontFamily: 'var(--tof-font-heading)',
                    fontSize: isMobile ? 32 : 'clamp(32px, 3.6vw, 46px)',
                    lineHeight: 1.0,
                    fontWeight: 500,
                    color,
                    letterSpacing: '-0.01em',
                }}
            >
                {persona.name}
            </h3>

            {namesText ? (
                <div
                    style={{
                        fontFamily: 'var(--tof-font-body)',
                        fontSize: 14,
                        lineHeight: 1.55,
                        color: 'var(--tof-text-soft)',
                    }}
                >
                    Gedragen door{' '}
                    <span style={{ color: 'var(--tof-text)', fontWeight: 500 }}>
                        {namesText}
                    </span>
                </div>
            ) : null}
        </div>
    );
}

// =========================
// SECONDARY LIST — andere primair-aanwezige persona's
// =========================
function SecondaryList({ items, isMobile }) {
    return (
        <div style={{ display: 'grid', gap: SPACING.md }}>
            <div style={{ ...TYPE.eyebrow, color: 'var(--tof-text-muted)' }}>
                Verder vertegenwoordigd
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
                {items.map((persona) => (
                    <SecondaryItem key={persona.id} persona={persona} />
                ))}
            </div>
        </div>
    );
}

function SecondaryItem({ persona }) {
    const color = colorFor(persona.id);
    const namesText = formatPeople(persona.names, persona.anonymousCount);

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
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: SPACING.sm,
                    }}
                >
                    <span
                        style={{
                            width: 6,
                            height: 6,
                            borderRadius: RADIUS.pill,
                            background: color,
                            flexShrink: 0,
                        }}
                    />
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
                        {persona.name}
                    </h4>
                </div>
                <div
                    style={{
                        fontFamily: 'var(--tof-font-body)',
                        fontSize: 13,
                        fontVariantNumeric: 'tabular-nums',
                        color: 'var(--tof-text-muted)',
                    }}
                >
                    {persona.countPercentage}%
                </div>
            </div>

            {/* Subtiele balk — maximale waarde tonen voor visuele context */}
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
                        width: `${persona.countPercentage}%`,
                        height: '100%',
                        background: color,
                        borderRadius: RADIUS.pill,
                        transition: 'width 0.5s var(--tof-ease)',
                    }}
                />
            </div>

            {namesText ? (
                <div
                    style={{
                        fontFamily: 'var(--tof-font-body)',
                        fontSize: 13,
                        lineHeight: 1.5,
                        color: 'var(--tof-text-soft)',
                    }}
                >
                    {namesText}
                </div>
            ) : null}
        </div>
    );
}

// =========================
// ENERGY DISTRIBUTION — werkstijl-energie als 2e laag
// =========================
// Toont alle 8 persona's met hun energie-percentage. Geen namen, want
// energie wordt opgebouwd uit primair + secundair + tertiair gecombineerd.
// Visueel rustiger dan de primair-lijst — dit is duiding, geen hero.

function EnergyDistribution({ items, isMobile }) {
    return (
        <div
            style={{
                display: 'grid',
                gap: SPACING.md,
                paddingTop: isMobile ? SPACING.sm : SPACING.md,
                borderTop: '1px solid var(--tof-border)',
            }}
        >
            <div style={{ display: 'grid', gap: SPACING.xs }}>
                <div style={{ ...TYPE.eyebrow, color: 'var(--tof-text-muted)' }}>
                    Energie van dit team
                </div>
                <p
                    style={{
                        margin: 0,
                        fontFamily: 'var(--tof-font-body)',
                        fontSize: 13,
                        lineHeight: 1.5,
                        color: 'var(--tof-text-soft)',
                        maxWidth: 540,
                    }}
                >
                    Gewogen werkstijl-energie van alle profielen samen. Ook
                    werkstijlen die niet primair zijn dragen bij via tweede en
                    derde voorkeuren.
                </p>
            </div>

            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: isMobile
                        ? '1fr'
                        : 'repeat(2, minmax(0, 1fr))',
                    rowGap: SPACING.sm,
                    columnGap: isMobile ? SPACING.md : SPACING.xl,
                }}
            >
                {items.map((persona) => (
                    <EnergyBar key={persona.id} persona={persona} />
                ))}
            </div>
        </div>
    );
}

function EnergyBar({ persona }) {
    const color = colorFor(persona.id);

    return (
        <div
            style={{
                display: 'grid',
                gridTemplateColumns: '110px 1fr 36px',
                alignItems: 'center',
                gap: SPACING.sm,
            }}
        >
            <div
                style={{
                    fontFamily: 'var(--tof-font-body)',
                    fontSize: 13,
                    color: 'var(--tof-text)',
                    fontWeight: 500,
                }}
            >
                {persona.name}
            </div>
            <div
                style={{
                    height: 4,
                    background: 'rgba(230, 221, 210, 0.5)',
                    borderRadius: RADIUS.pill,
                    overflow: 'hidden',
                }}
            >
                <div
                    style={{
                        width: `${persona.energyPercentage}%`,
                        height: '100%',
                        background: color,
                        opacity: 0.75,
                        borderRadius: RADIUS.pill,
                        transition: 'width 0.5s var(--tof-ease)',
                    }}
                />
            </div>
            <div
                style={{
                    fontFamily: 'var(--tof-font-body)',
                    fontSize: 12,
                    fontVariantNumeric: 'tabular-nums',
                    color: 'var(--tof-text-muted)',
                    textAlign: 'right',
                }}
            >
                {persona.energyPercentage}%
            </div>
        </div>
    );
}

// =========================
// MISSING NOTE — strikte definitie uit aggregate.missingPersonas
// =========================
function MissingNote({ missing, isMobile }) {
    return (
        <div
            style={{
                display: 'grid',
                gap: SPACING.sm,
                paddingTop: isMobile ? SPACING.sm : SPACING.md,
                borderTop: '1px solid var(--tof-border)',
            }}
        >
            <div style={{ ...TYPE.eyebrow, color: 'var(--tof-text-muted)' }}>
                Wie ontbreekt
            </div>

            <div style={{ display: 'grid', gap: SPACING.md }}>
                {missing.map((p) => {
                    const color = colorFor(p.id);
                    const text = MISSING_CONTRIBUTION[p.id] ||
                        `Zonder ${p.name.toLowerCase()} mist het team een specifiek perspectief.`;

                    return (
                        <div
                            key={p.id}
                            style={{
                                display: 'grid',
                                gridTemplateColumns: isMobile ? '1fr' : '160px 1fr',
                                gap: isMobile ? SPACING.xs : SPACING.lg,
                                alignItems: 'baseline',
                            }}
                        >
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'baseline',
                                    gap: SPACING.sm,
                                }}
                            >
                                <span
                                    style={{
                                        width: 6,
                                        height: 6,
                                        borderRadius: RADIUS.pill,
                                        background: color,
                                        flexShrink: 0,
                                        opacity: 0.5,
                                        transform: 'translateY(-2px)',
                                    }}
                                />
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
                                    {p.name}
                                </h4>
                            </div>
                            <p
                                style={{
                                    margin: 0,
                                    fontFamily: 'var(--tof-font-body)',
                                    fontSize: 13,
                                    lineHeight: 1.6,
                                    color: 'var(--tof-text-soft)',
                                }}
                            >
                                {text}
                            </p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

// =========================
// HELPERS
// =========================

// Combineer namen met aantal anonieme respondenten.
// Voorbeelden:
//   ["Maria","Doris","Thomas"], 0 → "Maria, Doris en Thomas"
//   ["Karel","Henk"], 1         → "Karel, Henk en 1 anoniem"
//   [], 1                       → "1 anoniem"
//   [], 3                       → "3 anoniem"
function formatPeople(names = [], anonymousCount = 0) {
    const parts = [...names];
    if (anonymousCount > 0) {
        parts.push(`${anonymousCount} anoniem`);
    }
    if (parts.length === 0) return '';
    if (parts.length === 1) return parts[0];
    if (parts.length === 2) return `${parts[0]} en ${parts[1]}`;
    return `${parts.slice(0, -1).join(', ')} en ${parts[parts.length - 1]}`;
}
