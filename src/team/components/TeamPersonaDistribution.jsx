/**
 * TeamPersonaDistribution — Werkstijlen tab
 *
 * Redactioneel premium ontwerp:
 * - Eén signature-statement bovenaan (de dominante persona als titel)
 * - Asymmetrische hiërarchie: top krijgt ruimte, onderkant comprimeert
 * - Geen containers, leeft op het canvas met witte ruimte
 * - Persona-kleuren subtiel: alleen waar identiteit telt
 * - Typografie met echt contrast tussen display, body en eyebrow
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

function firstName(fullName) {
    if (!fullName) return '';
    return String(fullName).trim().split(/\s+/)[0];
}

function firstNamesFor(personaId, members = []) {
    return members
        .filter((m) => m.primary === personaId)
        .map((m) => firstName(m.name))
        .filter((n) => n && n !== 'Onbekend')
        .filter((n, i, arr) => arr.indexOf(n) === i);
}

export default function TeamPersonaDistribution({ aggregate }) {
    const isMobile = useIsMobile();
    const allPersonas = aggregate?.sortedPersonas || [];
    const members = aggregate?.members || [];
    const teamCount = aggregate?.teamCount || 0;

    const presentPersonas = allPersonas
        .filter((p) => p.count > 0)
        .map((p) => ({
            ...p,
            percentage: teamCount > 0 ? Math.round((p.count / teamCount) * 100) : 0,
            names: firstNamesFor(p.id, members),
        }));

    const missingPersonas = allPersonas.filter((p) => p.count === 0);

    if (presentPersonas.length === 0) {
        return (
            <div style={{ padding: SPACING.lg, fontSize: 13, color: 'var(--tof-text-muted)' }}>
                Nog geen werkstijlen beschikbaar.
            </div>
        );
    }

    const [hero, ...rest] = presentPersonas;

    return (
        <div
            style={{
                display: 'grid',
                gap: isMobile ? SPACING.lg : SPACING['2xl'],
            }}
        >
            {/* SIGNATURE — de dominante persona als statement */}
            <SignatureStatement
                persona={hero}
                isMobile={isMobile}
            />

            {/* SECONDAIRE PERSONA'S — asymmetrisch, met afnemend gewicht */}
            {rest.length > 0 ? (
                <SecondaryList items={rest} isMobile={isMobile} />
            ) : null}

            {/* ONTBREKEND — strategisch, op canvas, geen container */}
            {missingPersonas.length > 0 ? (
                <MissingNote missing={missingPersonas} isMobile={isMobile} />
            ) : null}
        </div>
    );
}

// =========================
// SIGNATURE STATEMENT
// =========================
// De dominante persona als hero-statement.
// Dit is waar het oog landt.

function SignatureStatement({ persona, isMobile }) {
    const color = colorFor(persona.id);

    return (
        <div
            style={{
                display: 'grid',
                gap: SPACING.sm,
                paddingBottom: isMobile ? SPACING.md : SPACING.lg,
                borderBottom: '1px solid var(--tof-border)',
            }}
        >
            {/* Eyebrow + percentage als zelfverzekerd statement */}
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
                    {persona.percentage}% van het team
                </div>
            </div>

            {/* Statement-titel: persona-naam in groot Playfair */}
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

            {/* Namen direct onder de titel */}
            {persona.names.length > 0 ? (
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
                        {formatNamesNatural(persona.names)}
                    </span>
                </div>
            ) : null}
        </div>
    );
}

// =========================
// SECONDARY LIST
// =========================
// De andere aanwezige persona's. Asymmetrisch — top breder, onder smaller.
// Geen kaarten, gewoon ritmische rijen op het canvas.

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
                    <SecondaryItem
                        key={persona.id}
                        persona={persona}
                    />
                ))}
            </div>
        </div>
    );
}

function SecondaryItem({ persona }) {
    const color = colorFor(persona.id);

    return (
        <div
            style={{
                display: 'grid',
                gap: SPACING.xs + 2,
                paddingBottom: SPACING.sm + 2,
                borderBottom: '1px solid rgba(230, 221, 210, 0.6)',
            }}
        >
            {/* Naam + percentage */}
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
                    {persona.percentage}%
                </div>
            </div>

            {/* Subtiele balk */}
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
                        width: `${persona.percentage}%`,
                        height: '100%',
                        background: color,
                        borderRadius: RADIUS.pill,
                        transition: 'width 0.5s var(--tof-ease)',
                    }}
                />
            </div>

            {/* Namen */}
            {persona.names.length > 0 ? (
                <div
                    style={{
                        fontFamily: 'var(--tof-font-body)',
                        fontSize: 13,
                        lineHeight: 1.5,
                        color: 'var(--tof-text-soft)',
                    }}
                >
                    {formatNamesNatural(persona.names)}
                </div>
            ) : null}
        </div>
    );
}

// =========================
// MISSING NOTE
// =========================
// Strategisch element — wat het team mist. Geen container, redactioneel.

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

// Formatteer namen als natuurlijke zin: "Maria, Doris en Thomas"
function formatNamesNatural(names) {
    if (names.length === 0) return '';
    if (names.length === 1) return names[0];
    if (names.length === 2) return `${names[0]} en ${names[1]}`;
    return `${names.slice(0, -1).join(', ')} en ${names[names.length - 1]}`;
}
