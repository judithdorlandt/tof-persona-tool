/**
 * WerkplekProfiel.jsx — EXPERIMENTEEL, geïsoleerd
 *
 * Vertaalt de persona-samenstelling van een team naar een werkplekbehoefte- en
 * gebruiksprofiel: HOE dit team de werkomgeving nodig heeft en gebruikt.
 *
 * Bewust NIET: m², aantallen plekken, inrichtings-/capaciteitsadvies.
 * De component leest alleen, muteert niets en zit achter een feature-flag +
 * aparte route, zodat het bestaande dashboard ongemoeid blijft.
 *
 * LEESLIJN (één type verschijnt precies één keer, geen herhaling):
 *   1. Sterkste behoefte  — de #1 als groot, dominant leespunt (positief, prominent).
 *   2. Volledige behoefte — alle overige typen, gegroepeerd per band
 *                           (kern → steun → aanvullend), op volgorde.
 *   3. Let op de balans   — gedragssignalen als secundaire kanttekening.
 */

import React, { useMemo } from 'react';
import {
    PageShell,
    HeroBlock,
    SecondaryButton,
    SectionEyebrow,
} from '../ui/AppShell';
import { SPACING, TYPE, RADIUS, useIsMobile } from '../ui/tokens';

import { buildTeamAggregate } from '../utils/TeamAggregation';
import {
    aantallenUitAggregate,
    buildWerkplekProfiel,
    buildGedragssignalen,
    BAND,
} from './werkplekProfielLogic';
import { WERKPLEK_PROFIEL_COPY as COPY } from './werkplekProfielCopy.nl';

const ACCENT = 'var(--tof-accent-sage)';
const ROSE = 'var(--tof-accent-rose)';

// Volgorde waarin de banden als groep worden getoond.
const BAND_VOLGORDE = [BAND.KERN, BAND.STEUN, BAND.AANVULLEND];

// Visuele behandeling per band — kern = vol/sterk, aanvullend = ingetogen.
const BAND_STYLE = {
    [BAND.KERN]: {
        bar: ACCENT,
        badgeBg: ACCENT,
        badgeColor: '#FFFFFF',
        badgeBorder: ACCENT,
    },
    [BAND.STEUN]: {
        bar: 'rgba(110, 136, 114, 0.45)',
        badgeBg: 'transparent',
        badgeColor: ACCENT,
        badgeBorder: 'rgba(110, 136, 114, 0.55)',
    },
    [BAND.AANVULLEND]: {
        bar: 'var(--tof-border)',
        badgeBg: 'var(--tof-surface)',
        badgeColor: 'var(--tof-text-muted)',
        badgeBorder: 'var(--tof-border)',
    },
};

// Eén kwalitatieve illustratie van het SOORT plek (geen aantallen).
function soortPlek(voorbeeldplekken) {
    if (!Array.isArray(voorbeeldplekken) || voorbeeldplekken.length === 0) return '';
    return voorbeeldplekken.slice(0, 3).join(' · ');
}

function resolveTeamName(sel) {
    if (!sel) return 'jouw team';
    if (typeof sel === 'string') return sel;
    return sel.name || sel.team || 'jouw team';
}

export default function WerkplekProfiel({ teamResponses = [], selectedTeam, setPage }) {
    const isMobile = useIsMobile();

    const aggregate = useMemo(() => buildTeamAggregate(teamResponses), [teamResponses]);
    const profiel = useMemo(
        () => buildWerkplekProfiel(aantallenUitAggregate(aggregate)),
        [aggregate]
    );
    const signalen = useMemo(() => buildGedragssignalen(profiel.typen), [profiel.typen]);

    const teamName = resolveTeamName(selectedTeam);

    // De #1 wordt als hero getoond; alle overige typen daaronder, gegroepeerd
    // per band. Zo verschijnt geen enkel type twee keer.
    const [hero, ...overige] = profiel.typen;

    return (
        <PageShell compact>
            <HeroBlock
                compact
                eyebrow={COPY.ui.eyebrow}
                title={COPY.ui.title}
                titleAccent={COPY.ui.titleAccent}
                titleAccentColor={ACCENT}
                lead={COPY.ui.lead}
                actions={
                    setPage ? (
                        <SecondaryButton onClick={() => setPage('teamdashboard')}>
                            {COPY.ui.terug}
                        </SecondaryButton>
                    ) : null
                }
            />

            <TeamSignatuur teamName={teamName} />

            {!profiel.heeftData || !hero ? (
                <p style={{ ...TYPE.body }}>{COPY.ui.legeStaat}</p>
            ) : (
                <>
                    <HeroBehoefte type={hero} isMobile={isMobile} />
                    <VolledigeBehoefte overige={overige} isMobile={isMobile} />
                    <SignalenBlok signalen={signalen} isMobile={isMobile} />
                </>
            )}
        </PageShell>
    );
}

// =========================
// TEAM-SIGNATUUR
// =========================

function TeamSignatuur({ teamName }) {
    return (
        <div style={{ borderLeft: `3px solid ${ACCENT}`, paddingLeft: SPACING.lg }}>
            <p
                style={{
                    margin: 0,
                    fontFamily: 'var(--tof-font-heading)',
                    fontSize: 'clamp(16px, 2vw, 20px)',
                    fontStyle: 'italic',
                    lineHeight: 1.4,
                    color: 'var(--tof-text)',
                }}
            >
                {COPY.ui.signatuur} <span style={{ color: ACCENT }}>{teamName}</span>
            </p>
        </div>
    );
}

// =========================
// HERO — sterkste behoefte (één dominant leespunt)
// =========================

function HeroBehoefte({ type, isMobile }) {
    const plek = soortPlek(type.voorbeeldplekken);
    return (
        <section
            style={{
                display: 'grid',
                gap: SPACING.md,
                paddingBottom: isMobile ? SPACING.lg : SPACING.xl,
                borderBottom: '1px solid var(--tof-border)',
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: SPACING.md, flexWrap: 'wrap' }}>
                <SectionEyebrow color="var(--tof-text-muted)">{COPY.ui.heroEyebrow}</SectionEyebrow>
                <BandBadge band={type.band} />
            </div>

            <h2
                style={{
                    margin: 0,
                    fontFamily: 'var(--tof-font-heading)',
                    fontSize: isMobile ? 34 : 'clamp(36px, 4vw, 52px)',
                    lineHeight: 1.0,
                    fontWeight: 500,
                    color: ACCENT,
                    letterSpacing: '-0.01em',
                }}
            >
                {type.label}
            </h2>

            <p style={{ ...TYPE.bodyLarge, color: 'var(--tof-text-soft)', maxWidth: 640 }}>
                {COPY.gebruik[type.id]}
            </p>

            {plek ? <SoortPlekRegel tekst={plek} /> : null}

            <p style={{ ...TYPE.bodySmall, color: 'var(--tof-text-muted)', maxWidth: 560 }}>
                {COPY.ui.heroOnderschrift}
            </p>
        </section>
    );
}

// =========================
// VOLLEDIGE BEHOEFTE — overige typen, gegroepeerd per band
// =========================

function VolledigeBehoefte({ overige, isMobile }) {
    if (!overige || overige.length === 0) return null;

    return (
        <section style={{ display: 'grid', gap: isMobile ? SPACING.lg : SPACING.xl }}>
            <div style={{ display: 'grid', gap: SPACING.xs }}>
                <SectionEyebrow color="var(--tof-text-muted)">{COPY.ui.overzichtKop}</SectionEyebrow>
                <p style={{ ...TYPE.body, maxWidth: 620 }}>{COPY.ui.overzichtLead}</p>
            </div>

            {BAND_VOLGORDE.map((band) => {
                const typen = overige.filter((t) => t.band === band);
                if (typen.length === 0) return null;
                return <BandGroep key={band} band={band} typen={typen} isMobile={isMobile} />;
            })}
        </section>
    );
}

function BandGroep({ band, typen, isMobile }) {
    const bandCopy = COPY.band[band] || {};
    return (
        <div style={{ display: 'grid', gap: SPACING.md }}>
            {/* Groepkop: band als label + korte duiding */}
            <div
                style={{
                    display: 'flex',
                    alignItems: 'baseline',
                    gap: SPACING.md,
                    flexWrap: 'wrap',
                    paddingBottom: SPACING.xs,
                    borderBottom: '1px solid rgba(230, 221, 210, 0.7)',
                }}
            >
                <BandBadge band={band} />
                <span
                    style={{
                        fontFamily: 'var(--tof-font-heading)',
                        fontSize: 17,
                        fontWeight: 500,
                        color: 'var(--tof-text)',
                    }}
                >
                    {bandCopy.kort}
                </span>
                <span style={{ ...TYPE.bodySmall, color: 'var(--tof-text-muted)', flex: '1 1 240px' }}>
                    {bandCopy.uitleg}
                </span>
            </div>

            <div style={{ display: 'grid', gap: SPACING.sm + 2 }}>
                {typen.map((t) => (
                    <BehoefteRij key={t.id} type={t} isMobile={isMobile} />
                ))}
            </div>
        </div>
    );
}

function BehoefteRij({ type, isMobile }) {
    const s = BAND_STYLE[type.band] || BAND_STYLE[BAND.AANVULLEND];
    const plek = soortPlek(type.voorbeeldplekken);
    return (
        <article
            style={{
                background: 'var(--tof-surface)',
                // Per-side borders i.p.v. shorthand+longhand mix (voorkomt React-warning).
                borderTop: '1px solid var(--tof-border)',
                borderRight: '1px solid var(--tof-border)',
                borderBottom: '1px solid var(--tof-border)',
                borderLeft: `3px solid ${s.bar}`,
                borderRadius: RADIUS.md,
                padding: isMobile ? '14px 16px' : '16px 18px',
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : 'minmax(200px, 260px) 1fr',
                columnGap: isMobile ? 0 : SPACING['2xl'],
                rowGap: isMobile ? SPACING.sm : 0,
                alignItems: 'start',
            }}
        >
            <div style={{ display: 'grid', gap: SPACING.sm, alignContent: 'start' }}>
                <h3
                    style={{
                        margin: 0,
                        fontFamily: 'var(--tof-font-heading)',
                        fontSize: 21,
                        lineHeight: 1.1,
                        fontWeight: 500,
                        color: 'var(--tof-text)',
                    }}
                >
                    {type.label}
                </h3>
                {plek ? <SoortPlekRegel tekst={plek} /> : null}
            </div>

            <p style={{ ...TYPE.body, fontSize: 14.5, alignSelf: 'center' }}>
                {COPY.gebruik[type.id]}
            </p>
        </article>
    );
}

// =========================
// GEDEELDE BOUWSTENEN
// =========================

function BandBadge({ band }) {
    const s = BAND_STYLE[band] || BAND_STYLE[BAND.AANVULLEND];
    const bandCopy = COPY.band[band] || {};
    return (
        <span
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                background: s.badgeBg,
                color: s.badgeColor,
                border: `1px solid ${s.badgeBorder}`,
                borderRadius: RADIUS.pill,
                padding: '3px 11px',
                fontSize: 10,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: 1,
                fontFamily: 'var(--tof-font-body)',
                whiteSpace: 'nowrap',
            }}
        >
            {bandCopy.label || band}
        </span>
    );
}

function SoortPlekRegel({ tekst }) {
    if (!tekst) return null;
    return (
        <div style={{ display: 'grid', gap: 3 }}>
            <span
                style={{
                    ...TYPE.eyebrow,
                    fontSize: 9,
                    letterSpacing: 1.2,
                    color: 'var(--tof-text-muted)',
                }}
            >
                {COPY.ui.illustratieLabel}
            </span>
            <span style={{ fontSize: 12.5, lineHeight: 1.5, color: 'var(--tof-text-soft)' }}>
                {tekst}
            </span>
        </div>
    );
}

// =========================
// SIGNALEN BLOK (secundair)
// =========================

function SignalenBlok({ signalen, isMobile }) {
    return (
        <section
            style={{
                background: 'var(--tof-bg)',
                border: '1px solid var(--tof-border)',
                borderRadius: RADIUS.lg,
                padding: isMobile ? '18px 16px' : '20px 22px',
                display: 'grid',
                gap: SPACING.md,
            }}
        >
            <div style={{ display: 'grid', gap: SPACING.xs }}>
                <SectionEyebrow color={ROSE}>{COPY.ui.signalenKop}</SectionEyebrow>
                <p style={{ ...TYPE.bodySmall }}>{COPY.ui.signalenLead}</p>
            </div>

            {signalen.length === 0 ? (
                <p style={{ ...TYPE.bodySmall, color: 'var(--tof-text-muted)' }}>
                    {COPY.ui.geenSignalen}
                </p>
            ) : (
                <div style={{ display: 'grid', gap: SPACING.md }}>
                    {signalen.map((id) => {
                        const sig = COPY.signalen[id];
                        if (!sig) return null;
                        return (
                            <div
                                key={id}
                                style={{
                                    borderLeft: `3px solid ${ROSE}`,
                                    paddingLeft: SPACING.md,
                                    display: 'grid',
                                    gap: 3,
                                }}
                            >
                                <span
                                    style={{
                                        fontFamily: 'var(--tof-font-heading)',
                                        fontSize: 17,
                                        fontWeight: 500,
                                        color: 'var(--tof-text)',
                                    }}
                                >
                                    {sig.titel}
                                </span>
                                <p style={{ ...TYPE.bodySmall, maxWidth: 680 }}>{sig.tekst}</p>
                            </div>
                        );
                    })}
                </div>
            )}
        </section>
    );
}
