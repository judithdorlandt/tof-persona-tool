/**
 * StrategicResult — individueel resultaat na de Strategic Tool quiz.
 *
 * Toont:
 *   - Korte begroeting / samenvatting
 *   - Per as: dominante positie van deze respondent
 *   - Top trends die uit antwoorden naar voren komen
 *   - CTA: opnieuw doen, terug naar overzicht, of vraag MT om mee te doen
 */

import React from 'react';
import {
    PageShell,
    HeroBlock,
    PrimaryButton,
    SecondaryButton,
    SectionCard,
} from '../ui/AppShell';
import { SPACING, TYPE } from '../ui/tokens';
import { STRATEGIC_AXES } from '../data/strategicQuestions';

const ACCENT = 'var(--tof-accent-rose)';

// Trend-namen voor display (parallel aan strategicKompas.js)
const TREND_NAMES = {
    '01': 'Experience based working',
    '02': 'Van aanwezigheid naar waarde',
    '03': 'Piekregie',
    '04': 'DEIB als ontwerp',
    '05': 'Social based working',
    '06': 'Servicerevolutie',
    '07': 'Van megacampus naar maatwerk',
    '08': 'AI in de werkplek',
};

export default function StrategicResult({ setPage, strategicResult }) {
    if (!strategicResult) {
        return (
            <PageShell compact>
                <HeroBlock
                    compact
                    eyebrow="Strategic Tool"
                    title="Geen resultaat"
                    lead="We kunnen geen profiel tonen. Start de quiz opnieuw."
                    actions={
                        <PrimaryButton onClick={() => setPage && setPage('strategicintro')}>
                            Naar de quiz
                        </PrimaryButton>
                    }
                />
            </PageShell>
        );
    }

    const { dominantPosition, dominantTrends, profile } = strategicResult;
    const topTrends = (dominantTrends || []).slice(0, 3);
    const name = profile?.name?.trim();
    const orgName = profile?.organization?.trim();

    return (
        <PageShell compact>
            <HeroBlock
                compact
                eyebrow="Strategic Tool · jouw profiel"
                title={name ? `Bedankt ${name},` : 'Bedankt,'}
                titleAccent="dit is wat jouw kompas laat zien."
                titleAccentColor={ACCENT}
                lead={`Per as zie je waar je dominante positie ligt. ${orgName ? `Je antwoorden zijn gekoppeld aan ${orgName} — als meer MT-leden invullen, ontstaat hieruit het collectieve strategisch kompas.` : 'Vraag andere MT-leden om ook in te vullen, dan ontstaat hieruit het collectieve kompas.'}`}
                actions={
                    <>
                        <SecondaryButton onClick={() => setPage && setPage('home')}>
                            ← Terug naar home
                        </SecondaryButton>
                    </>
                }
            />

            {/* ── PROFIEL PER AS ── */}
            <SectionCard
                accent={ACCENT}
                eyebrow="01 · Jouw posities"
                title="Per as zie je waar je naartoe leunt."
            >
                <div style={{ display: 'grid', gap: SPACING.sm + 2 }}>
                    {STRATEGIC_AXES.map((axis, i) => {
                        const posId = dominantPosition?.[axis.id];
                        const pos = axis.positions.find((p) => p.id === posId);
                        return (
                            <div key={axis.id} style={{
                                background: 'rgba(255,255,255,0.85)',
                                border: '1px solid #EADFD4',
                                borderLeft: `3px solid ${ACCENT}`,
                                borderRadius: 12,
                                padding: '14px 18px',
                                display: 'grid',
                                gridTemplateColumns: '40px 1fr',
                                gap: SPACING.md,
                                alignItems: 'baseline',
                            }}>
                                <div style={{
                                    ...TYPE.eyebrow,
                                    color: ACCENT,
                                    fontSize: 11,
                                }}>
                                    As {i + 1}
                                </div>
                                <div style={{ display: 'grid', gap: 4 }}>
                                    <div style={{
                                        ...TYPE.eyebrow,
                                        color: 'var(--tof-text-muted)',
                                        fontSize: 10,
                                    }}>
                                        {axis.label}
                                    </div>
                                    <div style={{
                                        ...TYPE.subhead,
                                        fontSize: 16,
                                        color: 'var(--tof-text)',
                                        lineHeight: 1.3,
                                    }}>
                                        {pos ? pos.label : 'Geen dominante positie'}
                                    </div>
                                    <p style={{
                                        ...TYPE.body,
                                        margin: 0,
                                        fontSize: 13.5,
                                        color: 'var(--tof-text-soft)',
                                    }}>
                                        {axis.subtitle}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </SectionCard>

            {/* ── TOP TRENDS ── */}
            {topTrends.length > 0 && (
                <SectionCard
                    accent={ACCENT}
                    eyebrow="02 · Wat dit raakt"
                    title="Jouw antwoorden wijzen het sterkst naar deze trends."
                >
                    <p style={{ ...TYPE.body, color: 'var(--tof-text-soft)', margin: 0 }}>
                        Elk antwoord scoort op één of meer van de 8 externe trends die het Strategisch Kompas volgt. Deze drie kwamen bij jou het vaakst terug.
                    </p>
                    <div style={{ display: 'grid', gap: SPACING.sm + 2 }}>
                        {topTrends.map((t, i) => (
                            <div key={t.id} style={{
                                background: 'var(--tof-surface)',
                                border: '1px solid var(--tof-border)',
                                borderTop: `3px solid ${ACCENT}`,
                                borderRadius: 10,
                                padding: '12px 16px',
                                display: 'grid',
                                gridTemplateColumns: '32px 1fr 36px',
                                gap: SPACING.md,
                                alignItems: 'center',
                            }}>
                                <div style={{
                                    ...TYPE.eyebrow,
                                    color: ACCENT,
                                    fontSize: 11,
                                }}>
                                    {t.id}
                                </div>
                                <div style={{
                                    ...TYPE.subhead,
                                    fontSize: 15,
                                    color: 'var(--tof-text)',
                                }}>
                                    {TREND_NAMES[t.id] || 'Onbekende trend'}
                                </div>
                                <div style={{
                                    ...TYPE.eyebrow,
                                    color: 'var(--tof-text-muted)',
                                    fontSize: 11,
                                    textAlign: 'right',
                                }}>
                                    {t.count}×
                                </div>
                            </div>
                        ))}
                    </div>
                </SectionCard>
            )}

            {/* ── CTA ── */}
            <SectionCard accent={ACCENT}>
                <div style={{
                    display: 'grid',
                    gap: SPACING.md,
                }}>
                    <div style={{ ...TYPE.eyebrow, color: ACCENT }}>
                        Volgende stap
                    </div>
                    <h2 style={{ ...TYPE.heading, margin: 0 }}>
                        Krijg het kompas voor het hele MT.
                    </h2>
                    <p style={{ ...TYPE.body, color: 'var(--tof-text-soft)', margin: 0, maxWidth: 600 }}>
                        Jouw profiel is één stem. Het Strategisch Kompas wordt pas écht waardevol als meerdere MT-leden invullen — dan zie je waar het team convergeert en waar de spanning zit die op tafel moet.
                    </p>
                    <div style={{ display: 'flex', gap: SPACING.sm + 2, flexWrap: 'wrap', marginTop: 4 }}>
                        <PrimaryButton
                            onClick={() => window.open('https://www.tof.services/contact', '_blank', 'noopener,noreferrer')}
                            style={{ background: ACCENT, borderColor: ACCENT }}
                        >
                            Plan een gesprek
                        </PrimaryButton>
                        <SecondaryButton onClick={() => setPage && setPage('strategicquiz')}>
                            Opnieuw invullen
                        </SecondaryButton>
                    </div>
                </div>
            </SectionCard>
        </PageShell>
    );
}
