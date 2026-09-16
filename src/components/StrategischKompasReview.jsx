/**
 * StrategischKompasReview.jsx — Module 3, vervolgvragenlijst na 3 maanden.
 *
 * Zelfde opzet als de intake, korter. Open antwoorden die Judith leest;
 * geen automatische verwerking. De submit-handler stelt een object samen
 * dat exact de review-shape uit utils/strategicKompas.js (EMPTY_REVIEW)
 * volgt, gekoppeld aan de teamcode, en schrijft het weg via
 * saveStrategicKompasReview (Supabase, met lokale fallback).
 */

import React, { useState } from 'react';
import {
    PageShell,
    HeroBlock,
    SectionCard,
    PrimaryButton,
    SecondaryButton,
} from '../ui/AppShell';
import { SPACING, TYPE } from '../ui/tokens';
import { EMPTY_REVIEW } from '../utils/strategicKompas';
import { saveStrategicKompasReview } from '../supabase';
import { Textarea, Input, Field } from './StrategischKompasIntake.jsx';

const ACCENT = 'var(--tof-text)';

// Elk veld mapt 1-op-1 op een sleutel uit de review-shape (EMPTY_REVIEW).
const QUESTIONS = [
    {
        field: 'changed',
        question: 'Wat is er sinds de start veranderd — in de organisatie, in het MT, bij jou?',
    },
    {
        field: 'mixShift',
        question: 'Is de samenstelling van het team veranderd (nieuwe mensen, vertrek)? Zo ja, hoe?',
    },
    {
        field: 'choiceLanding',
        question: 'Welke keuze uit het kompas is nog niet echt gemaakt?',
    },
    {
        field: 'notes',
        question: 'Wat heeft de komende periode nodig?',
    },
];

export default function StrategischKompasReview({ setPage }) {
    const [values, setValues] = useState({ ...EMPTY_REVIEW, teamcode: '' });
    const [status, setStatus] = useState('idle'); // 'idle' | 'saving' | 'done'
    const [error, setError] = useState('');

    const update = (key) => (e) => {
        setValues((v) => ({ ...v, [key]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        const teamcode = String(values.teamcode || '').trim();
        if (!teamcode) {
            setError('Vul een teamcode in — die koppelt deze check aan jullie kompas.');
            return;
        }

        // Stel het object samen dat exact de review-shape volgt.
        const payload = {
            ...EMPTY_REVIEW,
            submittedAt: new Date().toLocaleDateString('nl-NL', { month: 'long', year: 'numeric' }),
            changed: String(values.changed || '').trim(),
            mixShift: String(values.mixShift || '').trim(),
            choiceLanding: String(values.choiceLanding || '').trim(),
            notes: String(values.notes || '').trim(),
        };

        setStatus('saving');
        const res = await saveStrategicKompasReview(teamcode, payload);
        if (res.ok) {
            setStatus('done');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            setStatus('idle');
            setError(res.error || 'Opslaan mislukt. Probeer het later opnieuw.');
        }
    };

    if (status === 'done') {
        return (
            <PageShell compact>
                <HeroBlock
                    compact
                    eyebrow="Module 3 · Strategisch Kompas"
                    title="Dank je."
                    titleAccentColor={ACCENT}
                />
                <SectionCard accent={ACCENT}>
                    <p style={{ ...TYPE.bodyLarge, margin: 0 }}>
                        Jullie input is opgeslagen. Judith neemt hem door zodat het kompas meebeweegt.
                    </p>
                    <div style={{ display: 'flex', gap: SPACING.sm + 2, flexWrap: 'wrap' }}>
                        <SecondaryButton onClick={() => setPage && setPage('strategischkompas')}>
                            ← Terug naar Module 3
                        </SecondaryButton>
                    </div>
                </SectionCard>
            </PageShell>
        );
    }

    return (
        <PageShell compact>
            <HeroBlock
                compact
                eyebrow="Module 3 · Strategisch Kompas · Check na 3 maanden"
                title="Drie maanden"
                titleAccent="verder"
                titleAccentColor={ACCENT}
            />

            <SectionCard accent={ACCENT}>
                <p style={{ ...TYPE.bodyLarge, margin: 0 }}>
                    Drie maanden verder. Deze korte check kijkt wat er is veranderd, zodat het kompas meebeweegt.
                </p>
            </SectionCard>

            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: SPACING['2xl'] }}>
                {QUESTIONS.map((q, i) => (
                    <SectionCard
                        key={q.field}
                        accent={ACCENT}
                        eyebrow={String(i + 1).padStart(2, '0')}
                    >
                        <p style={{ ...TYPE.body, color: 'var(--tof-text)', margin: 0 }}>
                            {q.question}
                        </p>
                        <Textarea
                            value={values[q.field]}
                            onChange={update(q.field)}
                            placeholder="Jullie antwoord…"
                        />
                    </SectionCard>
                ))}

                <SectionCard accent={ACCENT} eyebrow="Afsluiting">
                    <Field
                        label="Teamcode (verplicht)"
                        hint="Koppelt deze check aan jullie kompas."
                    >
                        <Input
                            value={values.teamcode}
                            onChange={update('teamcode')}
                            placeholder="bijv. NIJ-BES-26-A8K2"
                        />
                    </Field>

                    {error ? (
                        <p style={{ ...TYPE.body, color: 'var(--tof-accent-rose)', margin: 0 }}>
                            {error}
                        </p>
                    ) : null}

                    <div style={{ display: 'flex', gap: SPACING.sm + 2, flexWrap: 'wrap' }}>
                        <PrimaryButton
                            type="submit"
                            disabled={status === 'saving'}
                            style={{ background: ACCENT, borderColor: ACCENT }}
                        >
                            {status === 'saving' ? 'Bezig met versturen…' : 'Verstuur check'}
                        </PrimaryButton>
                        <SecondaryButton onClick={() => setPage && setPage('strategischkompas')}>
                            Annuleer
                        </SecondaryButton>
                    </div>
                </SectionCard>
            </form>
        </PageShell>
    );
}
