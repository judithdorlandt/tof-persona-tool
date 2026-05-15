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

const ACCENT = 'var(--tof-accent-rose)';
const SOFT = '#F4DFDF';

// ─── COMPONENT ───────────────────────────────────────────────────────────────

export default function TeamStrategic({ setPage, selectedTeam }) {
    const orgName = selectedTeam?.organization || '';
    const teamName = selectedTeam?.team || '';

    const kompas = useMemo(() => getStrategicKompas(orgName), [orgName]);

    if (!kompas) {
        return (
            <PageShell compact>
                <HeroBlock
                    compact
                    eyebrow="Module 3 · Strategisch Kompas"
                    title="Nog geen kompas beschikbaar"
                    titleAccentColor={ACCENT}
                    lead={`Er is voor ${orgName || 'deze organisatie'} nog geen Strategisch Kompas opgesteld. Plan een verkenningsgesprek om het traject te starten.`}
                    actions={
                        <>
                            <PrimaryButton
                                onClick={() => window.open('https://www.tof.services/contact', '_blank', 'noopener,noreferrer')}
                                style={{ background: ACCENT, borderColor: ACCENT }}
                            >
                                Plan een gesprek
                            </PrimaryButton>
                            <SecondaryButton onClick={() => setPage && setPage('team')}>
                                ← Terug
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
                eyebrow={`Module 3 · Strategisch Kompas · ${kompas.team || orgName}`}
                title="Het kompas voor"
                titleAccent={kompas.team || orgName}
                titleAccentColor={ACCENT}
                lead={`Hoe de huidige persona-mix verhoudt zich tot acht externe trends — en wat dat vraagt van leiderschap, werkplek en samenwerking de komende ${kompas.horizon || '3–5 jaar'}.`}
                actions={
                    <>
                        <SecondaryButton onClick={() => setPage && setPage('team')}>
                            ← Terug naar Persona Tool
                        </SecondaryButton>
                    </>
                }
            />

            {/* Meta-strip */}
            <div style={{ display: 'flex', gap: SPACING.sm + 2, flexWrap: 'wrap' }}>
                <Chip>Horizon · {kompas.horizon}</Chip>
                <Chip>Laatste herijking · {kompas.lastUpdate}</Chip>
                <Chip>Volgende review · {kompas.nextReview}</Chip>
            </div>

            {/* ── 1. TREND-RADAR ── */}
            <SectionCard
                accent={ACCENT}
                eyebrow="01 · Trend-radar"
                title={`Acht externe trends, gewogen op ${kompas.team || 'deze organisatie'}.`}
            >
                <p style={{ ...TYPE.body, color: 'var(--tof-text-soft)', margin: 0 }}>
                    De top-trend voor dit team is <strong style={{ color: 'var(--tof-text)' }}>{topTrend.name}</strong>. Wat onderaan staat is niet weg — wel minder urgent voor déze persona-mix.
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
                eyebrow="02 · Persona-overlay"
                title="Wat de team-mix vraagt over drie tot vijf jaar."
            >
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
                        Dominant aanwezig
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
                eyebrow="03 · Strategische keuzes"
                title="Vijf richtingen voor MT en bestuur."
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
                eyebrow="04 · Jaarritme"
                title="Vier momenten om het kompas te herijken."
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
