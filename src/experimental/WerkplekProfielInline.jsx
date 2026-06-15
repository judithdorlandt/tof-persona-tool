/**
 * WerkplekProfielInline — EXPERIMENTEEL
 *
 * Vervangt (achter de feature-flag) de inhoud van de "Werkplek"-tegel op het
 * teamdashboard. Gebruikt het GEDRAGSMODEL (werkplekmix → kern/steun/aanvullend)
 * in plaats van de energie-gewogen percentages, maar behoudt bewust de
 * redactionele LOOK & FEEL van TeamWorkplaceNeeds:
 *   - Hero: de sterkste behoefte als statement (sage)
 *   - Secundaire lijst: overige kern/steun-behoeften in 2 kolommen
 *   - Subtiele afsluiting: aanvullende behoeften ("minder vraag")
 *   - Afsluitend: gedragssignaal ("let op de balans"), secundair
 *
 * SCOPE — bewust ALLEEN behoefte, gebruik en gedrag:
 *   GEEN m², aantallen, percentages of inrichtingsadvies.
 *
 * NIEUW t.o.v. TeamWorkplaceNeeds: per type tonen we de Ruimteboek-bouwstenen
 * (voorbeeldplekken) als verduidelijking van wat dit SOORT plek kan zijn.
 */

import React from 'react';
import { SPACING, TYPE, useIsMobile } from '../ui/tokens';

import {
    buildWerkplekProfiel,
    buildGedragssignalen,
    aantallenUitAggregate,
    BAND,
} from './werkplekProfielLogic';
import { WERKPLEK_PROFIEL_COPY as COPY } from './werkplekProfielCopy.nl';

// Visuele duiding per band (subtiel, binnen het bestaande palet).
const BAND_KLEUR = {
    [BAND.KERN]: 'var(--tof-accent-sage)',
    [BAND.STEUN]: 'var(--tof-accent-sage)',
    [BAND.AANVULLEND]: 'var(--tof-text-muted)',
};

export default function WerkplekProfielInline({ aggregate }) {
    const isMobile = useIsMobile();

    const aantallen = aantallenUitAggregate(aggregate);
    const profiel = buildWerkplekProfiel(aantallen);

    if (!profiel.heeftData || profiel.typen.length === 0) {
        return (
            <div style={{ padding: SPACING.lg, fontSize: 13, color: 'var(--tof-text-muted)' }}>
                {COPY.ui.legeStaat}
            </div>
        );
    }

    const signalen = buildGedragssignalen(profiel.typen);

    const [hero, ...overige] = profiel.typen;
    const secundair = overige.filter((t) => t.band !== BAND.AANVULLEND);
    const aanvullend = overige.filter((t) => t.band === BAND.AANVULLEND);

    return (
        <div
            style={{
                display: 'grid',
                gap: isMobile ? SPACING.lg : SPACING['2xl'],
            }}
        >
            <SignatureStatement type={hero} isMobile={isMobile} />

            {secundair.length > 0 ? (
                <SecondaryList items={secundair} isMobile={isMobile} />
            ) : null}

            {aanvullend.length > 0 ? (
                <BelowAverageNote items={aanvullend} isMobile={isMobile} />
            ) : null}

            {signalen.length > 0 ? (
                <SignalenBlok ids={signalen} isMobile={isMobile} />
            ) : null}
        </div>
    );
}

// =========================
// SOORT PLEK — Ruimteboek-bouwstenen als verduidelijking
// =========================

function SoortPlek({ voorbeeldplekken }) {
    if (!voorbeeldplekken || voorbeeldplekken.length === 0) return null;
    return (
        <div
            style={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'baseline',
                gap: SPACING.xs,
                marginTop: 2,
            }}
        >
            <span
                style={{
                    ...TYPE.eyebrow,
                    color: 'var(--tof-text-muted)',
                    marginRight: SPACING.xs,
                }}
            >
                {COPY.ui.illustratieLabel}
            </span>
            {voorbeeldplekken.map((plek) => (
                <span
                    key={plek}
                    style={{
                        fontFamily: 'var(--tof-font-body)',
                        fontSize: 12,
                        lineHeight: 1.4,
                        color: 'var(--tof-text-soft)',
                        background: 'rgba(230, 221, 210, 0.45)',
                        borderRadius: 999,
                        padding: '2px 10px',
                    }}
                >
                    {plek}
                </span>
            ))}
        </div>
    );
}

// =========================
// SIGNATURE STATEMENT — sterkste behoefte
// =========================

function SignatureStatement({ type, isMobile }) {
    const band = COPY.band[type.band];
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
                    {COPY.ui.heroEyebrow}
                </div>
                {band ? <BandBadge band={type.band} /> : null}
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
                {type.label}
            </h3>

            {COPY.gebruik[type.id] ? (
                <div
                    style={{
                        fontFamily: 'var(--tof-font-body)',
                        fontSize: 14,
                        lineHeight: 1.55,
                        color: 'var(--tof-text-soft)',
                    }}
                >
                    {COPY.gebruik[type.id]}
                </div>
            ) : null}

            <SoortPlek voorbeeldplekken={type.voorbeeldplekken} />
        </div>
    );
}

function BandBadge({ band }) {
    const meta = COPY.band[band];
    if (!meta) return null;
    return (
        <span
            style={{
                fontFamily: 'var(--tof-font-body)',
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                color: BAND_KLEUR[band] || 'var(--tof-text-muted)',
                border: `1px solid ${BAND_KLEUR[band] || 'var(--tof-border)'}`,
                borderRadius: 999,
                padding: '2px 10px',
                whiteSpace: 'nowrap',
            }}
        >
            {meta.label}
        </span>
    );
}

// =========================
// SECONDARY LIST — overige kern/steun
// =========================

function SecondaryList({ items, isMobile }) {
    return (
        <div style={{ display: 'grid', gap: SPACING.md }}>
            <div style={{ ...TYPE.eyebrow, color: 'var(--tof-text-muted)' }}>
                {COPY.ui.overzichtKop}
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
                    <SecondaryItem key={item.id} type={item} />
                ))}
            </div>
        </div>
    );
}

function SecondaryItem({ type }) {
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
                    {type.label}
                </h4>
                <BandBadge band={type.band} />
            </div>

            {COPY.gebruik[type.id] ? (
                <div
                    style={{
                        fontFamily: 'var(--tof-font-body)',
                        fontSize: 13,
                        lineHeight: 1.5,
                        color: 'var(--tof-text-soft)',
                    }}
                >
                    {COPY.gebruik[type.id]}
                </div>
            ) : null}

            <SoortPlek voorbeeldplekken={type.voorbeeldplekken} />
        </div>
    );
}

// =========================
// BELOW AVERAGE NOTE — aanvullende behoeften
// =========================

function BelowAverageNote({ items, isMobile }) {
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
                    {COPY.band.aanvullend.kort}
                </div>
                <div
                    style={{
                        fontFamily: 'var(--tof-font-body)',
                        fontSize: 12,
                        color: 'var(--tof-text-muted)',
                    }}
                >
                    {COPY.band.aanvullend.uitleg}
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
                        key={item.id}
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
                    </div>
                ))}
            </div>
        </div>
    );
}

// =========================
// SIGNALEN — gedragsduiding, secundair
// =========================

function SignalenBlok({ ids, isMobile }) {
    const signalen = ids
        .map((id) => COPY.signalen[id])
        .filter(Boolean);
    if (signalen.length === 0) return null;

    return (
        <div
            style={{
                display: 'grid',
                gap: SPACING.md,
                paddingTop: isMobile ? SPACING.md : SPACING.lg,
                borderTop: '1px solid var(--tof-border)',
            }}
        >
            <div style={{ ...TYPE.eyebrow, color: 'var(--tof-accent-rose)' }}>
                {COPY.ui.signalenKop}
            </div>

            <div style={{ display: 'grid', gap: SPACING.md }}>
                {signalen.map((s) => (
                    <div
                        key={s.titel}
                        style={{
                            display: 'grid',
                            gap: SPACING.xs,
                            paddingLeft: SPACING.md,
                            borderLeft: '2px solid var(--tof-accent-rose)',
                        }}
                    >
                        <div
                            style={{
                                fontFamily: 'var(--tof-font-heading)',
                                fontSize: 18,
                                lineHeight: 1.15,
                                fontWeight: 500,
                                color: 'var(--tof-text)',
                            }}
                        >
                            {s.titel}
                        </div>
                        <div
                            style={{
                                fontFamily: 'var(--tof-font-body)',
                                fontSize: 13,
                                lineHeight: 1.55,
                                color: 'var(--tof-text-soft)',
                            }}
                        >
                            {s.tekst}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
