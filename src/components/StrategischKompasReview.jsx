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
import { useCopy } from '../i18n/LanguageContext';

const ACCENT = 'var(--tof-text)';

// De vragen staan in de i18n-namespace `kompasForms.review`. Elk `field` daarin
// mapt 1-op-1 op een sleutel uit de review-shape (EMPTY_REVIEW) en is dus
// taalonafhankelijk.

export default function StrategischKompasReview({ setPage }) {
    const { kompasForms, common } = useCopy();
    const t = kompasForms.review;
    const QUESTIONS = t.questions;

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
            setError(t.errors.teamcodeRequired);
            return;
        }

        // Stel het object samen dat exact de review-shape volgt. De sleutels
        // zijn Supabase-veldnamen en blijven in elke taal identiek.
        const payload = {
            ...EMPTY_REVIEW,
            submittedAt: new Date().toLocaleDateString(common.locale, { month: 'long', year: 'numeric' }),
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
            setError(res.error || t.errors.saveFailed);
        }
    };

    if (status === 'done') {
        return (
            <PageShell compact>
                <HeroBlock
                    compact
                    eyebrow={t.done.eyebrow}
                    title={t.done.title}
                    titleAccentColor={ACCENT}
                />
                <SectionCard accent={ACCENT}>
                    <p style={{ ...TYPE.bodyLarge, margin: 0 }}>
                        {t.done.body}
                    </p>
                    <div style={{ display: 'flex', gap: SPACING.sm + 2, flexWrap: 'wrap' }}>
                        <SecondaryButton onClick={() => setPage && setPage('strategischkompas')}>
                            {t.done.back}
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
                eyebrow={t.eyebrow}
                title={t.title}
                titleAccent={t.titleAccent}
                titleAccentColor={ACCENT}
            />

            <SectionCard accent={ACCENT}>
                <p style={{ ...TYPE.bodyLarge, margin: 0 }}>
                    {t.intro}
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
                            placeholder={t.answerPlaceholder}
                        />
                    </SectionCard>
                ))}

                <SectionCard accent={ACCENT} eyebrow={t.closing.eyebrow}>
                    <Field
                        label={t.closing.teamcodeLabel}
                        hint={t.closing.teamcodeHint}
                    >
                        <Input
                            value={values.teamcode}
                            onChange={update('teamcode')}
                            placeholder={t.closing.teamcodePlaceholder}
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
                            {status === 'saving' ? t.submitting : t.submit}
                        </PrimaryButton>
                        <SecondaryButton onClick={() => setPage && setPage('strategischkompas')}>
                            {t.cancel}
                        </SecondaryButton>
                    </div>
                </SectionCard>
            </form>
        </PageShell>
    );
}
