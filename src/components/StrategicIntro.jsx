/**
 * StrategicIntro — landingspagina voor de Strategic Tool (Module 3)
 *
 * Parallel aan Intro.jsx (Persona Tool), maar voor MT/bestuur:
 *   - Korte uitleg over wat de tool meet
 *   - De 4 strategische assen kort getoond
 *   - CTA naar de quiz
 *
 * Toegang: hybride — publiek beschikbaar als verkenning, maar voor
 * team-aggregatie heb je een team-/organisatie-koppeling nodig.
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

export default function StrategicIntro({ setPage }) {
    return (
        <PageShell compact>
            <HeroBlock
                compact
                eyebrow="Module 3 · Strategic Tool"
                title="Waar wijst jullie kompas"
                titleAccent="naar over drie tot vijf jaar?"
                titleAccentColor={ACCENT}
                lead="Acht strategische vragen voor MT en bestuur. Geen psychologische test — wel een meetlat voor waar jullie energie en aandacht naartoe gaan als het over de toekomst gaat. Per persoon ~10 minuten. Geaggregeerd geeft het een kompas waar het MT-gesprek scherp op kan."
                actions={
                    <>
                        <PrimaryButton
                            onClick={() => setPage && setPage('strategicquiz')}
                            style={{ background: ACCENT, borderColor: ACCENT }}
                        >
                            Start de Strategic Tool
                        </PrimaryButton>
                        <SecondaryButton onClick={() => setPage && setPage('home')}>
                            ← Terug
                        </SecondaryButton>
                    </>
                }
            />

            <SectionCard
                accent={ACCENT}
                eyebrow="Wat de tool meet"
                title="Vier strategische assen."
            >
                <p style={{ ...TYPE.body, color: 'var(--tof-text-soft)', margin: 0 }}>
                    Per as twee vragen vanuit verschillende invalshoeken — zodat we kunnen zien waar het MT
                    {' '}convergeert (eensgezindheid over de richting) en waar divergeert (spanning die op tafel moet
                    {' '}voordat strategische keuzes landen). Juist die divergentie is goud voor het kompas-gesprek.
                </p>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                    gap: SPACING.md,
                }}>
                    {STRATEGIC_AXES.map((axis, i) => (
                        <div key={axis.id} style={{
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
                                fontSize: 11,
                            }}>
                                As {i + 1}
                            </div>
                            <div style={{
                                ...TYPE.subhead,
                                fontSize: 16,
                                color: 'var(--tof-text)',
                                lineHeight: 1.25,
                            }}>
                                {axis.label}
                            </div>
                            <p style={{
                                ...TYPE.body,
                                color: 'var(--tof-text-soft)',
                                margin: 0,
                                fontSize: 13.5,
                            }}>
                                {axis.subtitle}
                            </p>
                        </div>
                    ))}
                </div>
            </SectionCard>

            <SectionCard
                accent={ACCENT}
                eyebrow="Hoe het werkt"
                title="Van individuele antwoorden naar collectief kompas."
            >
                <div style={{ display: 'grid', gap: SPACING.sm + 2 }}>
                    {[
                        { num: '01', title: 'Jij vult de 8 vragen in', body: 'Vier strategische assen, twee vragen per as. Geen goed of fout — wel scherp.' },
                        { num: '02', title: 'Je ziet je eigen profiel', body: 'Per as je dominante positie en wat dat zegt over jouw kijk op de toekomst.' },
                        { num: '03', title: 'MT vult ook in — anoniem of met naam', body: 'Geaggregeerd zien we waar het team convergeert en waar de spanning zit.' },
                        { num: '04', title: 'Kompas voedt het Module 3 dashboard', body: 'De keuzes van het MT bepalen het strategisch kompas voor de organisatie.' },
                    ].map((step) => (
                        <div key={step.num} style={{
                            background: 'var(--tof-surface)',
                            border: '1px solid var(--tof-border)',
                            borderLeft: `3px solid ${ACCENT}`,
                            borderRadius: 10,
                            padding: '12px 16px',
                            display: 'grid',
                            gridTemplateColumns: '36px 1fr',
                            gap: SPACING.md,
                            alignItems: 'baseline',
                        }}>
                            <div style={{
                                ...TYPE.eyebrow,
                                color: ACCENT,
                                fontSize: 12,
                            }}>
                                {step.num}
                            </div>
                            <div style={{ display: 'grid', gap: 4 }}>
                                <div style={{
                                    ...TYPE.subhead,
                                    fontSize: 15,
                                    color: 'var(--tof-text)',
                                }}>
                                    {step.title}
                                </div>
                                <p style={{
                                    ...TYPE.body,
                                    margin: 0,
                                    fontSize: 13.5,
                                    color: 'var(--tof-text-soft)',
                                }}>
                                    {step.body}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                <div style={{ display: 'flex', gap: SPACING.sm + 2, flexWrap: 'wrap' }}>
                    <PrimaryButton
                        onClick={() => setPage && setPage('strategicquiz')}
                        style={{ background: ACCENT, borderColor: ACCENT }}
                    >
                        Begin nu
                    </PrimaryButton>
                </div>
            </SectionCard>
        </PageShell>
    );
}
