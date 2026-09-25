/**
 * TeamStrategic — Module 3: Het Strategisch Kompas (DASHBOARD)
 *
 * Geen sales-content meer: dit is een data-dashboard voor strategic-level
 * klanten. Toont het kompas voor de organisatie waaraan de gebruiker
 * gekoppeld is.
 *
 * Familie-taal:
 *   - PageShell + compact (zoals TeamDashboard / TeamDynamics)
 *   - HeroBlock met meta-strip
 *   - SectionCard voor elke pijler:
 *       1. Trend-radar — 8 trends gewogen
 *       2. Persona-overlay — wat de team-mix vraagt over 3–5 jaar
 *       3. Strategische keuzes — 4–7 richtingen voor MT
 *       4. Jaarritme — momenten om het kompas te herijken
 *
 * Data: vandaag hardcoded demo-data voor Demo Team 3, scaffold voor
 * Supabase-payload klaar (zie src/utils/strategicKompas.js).
 */

import React, { useMemo } from 'react';
import {
    PageShell,
    HeroBlock,
    PrimaryButton,
    SecondaryButton,
    SectionCard,
    InteractiveRow,
} from '../ui/AppShell';
import { SPACING, TYPE } from '../ui/tokens';
import { getStrategicKompas } from '../utils/strategicKompas';
import { useCopy, useLang } from '../i18n/LanguageContext';

const ACCENT = 'var(--tof-accent-rose)';
const SOFT = '#F4DFDF';

// ─── COMPONENT ───────────────────────────────────────────────────────────────

export default function TeamStrategic({ setPage, selectedTeam }) {
    const { lang } = useLang();
    const { kompasForms } = useCopy();
    const t = kompasForms.dashboard;

    const orgName = selectedTeam?.organization || '';

    const kompas = useMemo(() => getStrategicKompas(orgName, lang), [orgName, lang]);

    if (!kompas) {
        return (
            <PageShell compact>
                <HeroBlock
                    compact
                    eyebrow={t.eyebrow}
                    title={t.empty.title}
                    titleAccentColor={ACCENT}
                    lead={`${t.empty.leadBefore}${orgName || t.thisOrganization}${t.empty.leadAfter}`}
                    actions={
                        <>
                            <PrimaryButton
                                onClick={() => window.open('https://www.tof.services/contact', '_blank', 'noopener,noreferrer')}
                                style={{ background: ACCENT, borderColor: ACCENT }}
                            >
                                {t.empty.cta}
                            </PrimaryButton>
                            <SecondaryButton onClick={() => setPage && setPage('team')}>
                                {t.back}
                            </SecondaryButton>
                        </>
                    }
                />
            </PageShell>
        );
    }

    const sortedTrends = [...kompas.trends].sort((a, b) => b.weight - a.weight);
    const topTrend = sortedTrends[0];

    return (
        <PageShell compact>
            {/* ── HERO ── */}
            <HeroBlock
                compact
                eyebrow={`${t.eyebrow} · ${kompas.team || orgName}`}
                title={t.hero.title}
                titleAccent={kompas.team || orgName}
                titleAccentColor={ACCENT}
                lead={`${t.hero.leadBefore}${kompas.horizon || t.defaultHorizon}${t.hero.leadAfter}`}
                actions={
                    <>
                        <SecondaryButton onClick={() => setPage && setPage('team')}>
                            {t.backToTool}
                        </SecondaryButton>
                    </>
                }
            />

            {/* Meta-strip */}
            <div style={{ display: 'flex', gap: SPACING.sm + 2, flexWrap: 'wrap' }}>
                <Chip>{t.meta.horizon} · {kompas.horizon}</Chip>
                <Chip>{t.meta.lastUpdate} · {kompas.lastUpdate}</Chip>
                <Chip>{t.meta.nextReview} · {kompas.nextReview}</Chip>
            </div>

            {/* ── 1. TREND-RADAR ── */}
            <SectionCard
                accent={ACCENT}
                eyebrow={t.trends.eyebrow}
                title={`${t.trends.titleBefore}${kompas.team || t.thisOrganization}${t.trends.titleAfter}`}
            >
                <p style={{ ...TYPE.body, color: 'var(--tof-text-soft)', margin: 0 }}>
                    {t.trends.noteBefore}<strong style={{ color: 'var(--tof-text)' }}>{topTrend.name}</strong>{t.trends.noteAfter}
                </p>
                <div style={{ display: 'grid', gap: SPACING.sm + 2 }}>
                    {sortedTrends.map((t) => (
                        <TrendBar key={t.id} trend={t} />
                    ))}
                </div>
            </SectionCard>

            {/* ── 2. PERSONA-OVERLAY ── */}
            <SectionCard
                accent={ACCENT}
                eyebrow={t.overlay.eyebrow}
                title={t.overlay.title}
            >
                {/* Eigen ambitie uit de intake — zodat de richting van de
                    organisatie zichtbaar staat naast de trend- en persona-analyse.
                    Alleen tonen als er een intake is ingevuld. */}
                {kompas.intake?.ambition ? (
                    <div style={{
                        background: 'var(--tof-surface)',
                        border: '1px solid var(--tof-border)',
                        borderLeft: `3px solid ${ACCENT}`,
                        borderRadius: 12,
                        padding: '14px 16px',
                    }}>
                        <div style={{
                            ...TYPE.eyebrow,
                            color: 'var(--tof-text-muted)',
                            fontSize: 10,
                            marginBottom: 6,
                        }}>
                            {t.overlay.ambitionLabel}
                        </div>
                        <p style={{
                            ...TYPE.body,
                            margin: 0,
                            color: 'var(--tof-text)',
                            fontSize: 14,
                            lineHeight: 1.6,
                        }}>
                            {kompas.intake.ambition}
                        </p>
                    </div>
                ) : null}
                <div style={{
                    background: SOFT,
                    border: `1px solid ${ACCENT}30`,
                    borderRadius: 12,
                    padding: '14px 16px',
                    fontSize: 13.5,
                    lineHeight: 1.65,
                    color: 'var(--tof-text)',
                }}>
                    <div style={{
                        ...TYPE.eyebrow,
                        color: ACCENT,
                        fontSize: 10,
                        marginBottom: 6,
                    }}>
                        {t.overlay.dominantLabel}
                    </div>
                    {kompas.personaOverlay.dominant.join(' · ')}
                </div>
                <div style={{ display: 'grid', gap: SPACING.sm + 2 }}>
                    {kompas.personaOverlay.insights.map((line, i) => (
                        <InteractiveRow key={i} accent={ACCENT} subtle>
                            <span style={{
                                ...TYPE.eyebrow,
                                color: ACCENT,
                                minWidth: 24,
                                fontSize: 11,
                            }}>
                                {String(i + 1).padStart(2, '0')}
                            </span>
                            <p style={{
                                ...TYPE.body,
                                margin: 0,
                                color: 'var(--tof-text-soft)',
                                fontSize: 14,
                                flex: 1,
                            }}>
                                {line}
                            </p>
                        </InteractiveRow>
                    ))}
                </div>
            </SectionCard>

            {/* ── 3. STRATEGISCHE KEUZES ── */}
            <SectionCard
                accent={ACCENT}
                eyebrow={t.choices.eyebrow}
                title={t.choices.title}
            >
                <div style={{ display: 'grid', gap: SPACING.md }}>
                    {kompas.choices.map((c, i) => (
                        <div key={i} style={{
                            background: 'rgba(255,255,255,0.85)',
                            border: '1px solid #EADFD4',
                            borderLeft: `3px solid ${ACCENT}`,
                            borderRadius: 12,
                            padding: '14px 18px',
                            display: 'grid',
                            gap: 6,
                        }}>
                            <div style={{
                                ...TYPE.eyebrow,
                                color: ACCENT,
                                fontSize: 10,
                            }}>
                                {c.axis}
                            </div>
                            <div style={{
                                ...TYPE.subhead,
                                fontSize: 17,
                                color: 'var(--tof-text)',
                                lineHeight: 1.25,
                            }}>
                                {c.title}
                            </div>
                            <p style={{
                                ...TYPE.body,
                                color: 'var(--tof-text-soft)',
                                margin: 0,
                                fontSize: 14,
                            }}>
                                {c.body}
                            </p>
                        </div>
                    ))}
                </div>
            </SectionCard>

            {/* ── 4. JAARRITME ── */}
            <SectionCard
                accent={ACCENT}
                eyebrow={t.jaarritme.eyebrow}
                title={t.jaarritme.title}
            >
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                    gap: SPACING.sm + 2,
                }}>
                    {kompas.jaarritme.map((m, i) => (
                        <div key={i} style={{
                            background: 'var(--tof-surface)',
                            border: '1px solid var(--tof-border)',
                            borderTop: `3px solid ${ACCENT}`,
                            borderRadius: 10,
                            padding: '14px 16px',
                            display: 'grid',
                            gap: 8,
                        }}>
                            <div style={{
                                ...TYPE.eyebrow,
                                color: ACCENT,
                                fontSize: 11,
                            }}>
                                {m.moment}
                            </div>
                            <p style={{
                                ...TYPE.body,
                                margin: 0,
                                fontSize: 13.5,
                                color: 'var(--tof-text-soft)',
                                lineHeight: 1.5,
                            }}>
                                {m.activity}
                            </p>
                        </div>
                    ))}
                </div>
            </SectionCard>
        </PageShell>
    );
}

// ─── SUB-COMPONENTS ──────────────────────────────────────────────────────────

function Chip({ children }) {
    return (
        <span style={{
            background: 'var(--tof-surface)',
            border: '1px solid var(--tof-border)',
            borderRadius: 999,
            padding: '6px 12px',
            fontSize: 11,
            color: 'var(--tof-text-muted)',
            letterSpacing: 0.6,
            fontWeight: 600,
            textTransform: 'uppercase',
        }}>
            {children}
        </span>
    );
}

function TrendBar({ trend }) {
    return (
        <div style={{
            display: 'grid',
            gridTemplateColumns: '28px 1fr 56px',
            alignItems: 'center',
            gap: SPACING.sm + 2,
            padding: '10px 12px',
            background: 'var(--tof-surface)',
            border: '1px solid var(--tof-border)',
            borderRadius: 10,
        }}>
            <span style={{
                ...TYPE.eyebrow,
                color: ACCENT,
                fontSize: 11,
            }}>
                {trend.id}
            </span>
            <div style={{ display: 'grid', gap: 4 }}>
                <div style={{
                    ...TYPE.subhead,
                    fontSize: 14,
                    color: 'var(--tof-text)',
                    lineHeight: 1.2,
                }}>
                    {trend.name}
                </div>
                <div style={{
                    height: 6,
                    background: '#EFE3D6',
                    borderRadius: 999,
                    overflow: 'hidden',
                }}>
                    <div style={{
                        height: '100%',
                        width: `${trend.weight}%`,
                        background: ACCENT,
                        borderRadius: 999,
                        transition: 'width 0.4s ease',
                    }} />
                </div>
                <p style={{
                    ...TYPE.body,
                    fontSize: 12.5,
                    color: 'var(--tof-text-soft)',
                    margin: '2px 0 0',
                    lineHeight: 1.45,
                }}>
                    {trend.note}
                </p>
            </div>
            <span style={{
                ...TYPE.eyebrow,
                color: ACCENT,
                fontSize: 12,
                textAlign: 'right',
                fontWeight: 700,
            }}>
                {trend.weight}%
            </span>
        </div>
    );
}
