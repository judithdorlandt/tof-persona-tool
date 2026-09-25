/**
 * StrategischKompasIntake.jsx — Module 3, intake-vragenlijst.
 *
 * Kwalitatieve start van het Strategisch Kompas: open antwoorden die Judith
 * leest en in het ontwerpgesprek tot weging en keuzes maakt. GEEN
 * automatische uitslag, geen trend-scores door de invuller.
 *
 * De submit-handler stelt een object samen dat exact de intake-shape uit
 * utils/strategicKompas.js (EMPTY_INTAKE) volgt, gekoppeld aan de teamcode,
 * en schrijft het weg via saveStrategicKompasIntake (Supabase, met lokale
 * fallback).
 */

import React, { useState } from 'react';
import {
    PageShell,
    HeroBlock,
    SectionCard,
    PrimaryButton,
    SecondaryButton,
} from '../ui/AppShell';
import { SPACING, TYPE, RADIUS } from '../ui/tokens';
import { EMPTY_INTAKE } from '../utils/strategicKompas';
import { saveStrategicKompasIntake } from '../supabase';
import { useCopy } from '../i18n/LanguageContext';

const ACCENT = 'var(--tof-text)';

// De vijf inhoudelijke secties staan in de i18n-namespace `kompasForms.intake`.
// Elk `field` daarin mapt 1-op-1 op een sleutel uit de intake-shape
// (EMPTY_INTAKE) en is dus taalonafhankelijk.

export default function StrategischKompasIntake({ setPage }) {
    const { kompasForms, common } = useCopy();
    const t = kompasForms.intake;
    const SECTIONS = t.sections;

    // Veldwaarden — start vanuit de shape zodat we exact dezelfde sleutels houden.
    const [values, setValues] = useState({ ...EMPTY_INTAKE });
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

        // Stel het object samen dat exact de intake-shape volgt. De sleutels
        // zijn Supabase-veldnamen en blijven in elke taal identiek.
        const payload = {
            ...EMPTY_INTAKE,
            submittedAt: new Date().toLocaleDateString(common.locale, { month: 'long', year: 'numeric' }),
            filledBy: String(values.filledBy || '').trim(),
            teamcode,
            ambition: String(values.ambition || '').trim(),
            movement: String(values.movement || '').trim(),
            mtBehaviour: String(values.mtBehaviour || '').trim(),
            workplace: String(values.workplace || '').trim(),
            direction: String(values.direction || '').trim(),
        };

        setStatus('saving');
        const res = await saveStrategicKompasIntake(teamcode, payload);
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
                {SECTIONS.map((sec) => (
                    <SectionCard
                        key={sec.field}
                        accent={ACCENT}
                        eyebrow={`${sec.eyebrow} · ${sec.title}`}
                    >
                        <div style={{ display: 'grid', gap: SPACING.xs }}>
                            {sec.questions.map((q, i) => (
                                <p key={i} style={{ ...TYPE.body, color: 'var(--tof-text)', margin: 0 }}>
                                    {q}
                                </p>
                            ))}
                        </div>
                        <Textarea
                            value={values[sec.field]}
                            onChange={update(sec.field)}
                            placeholder={t.answerPlaceholder}
                        />
                    </SectionCard>
                ))}

                {/* Afsluiting: teamcode (verplicht) + invuller */}
                <SectionCard accent={ACCENT} eyebrow={t.closing.eyebrow}>
                    <div style={{ display: 'grid', gap: SPACING.lg }}>
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
                        <Field label={t.closing.filledByLabel}>
                            <Input
                                value={values.filledBy}
                                onChange={update('filledBy')}
                                placeholder={t.closing.filledByPlaceholder}
                            />
                        </Field>
                    </div>

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

// ─── FORM-PRIMITIVES (lokaal, alleen voor deze formulieren) ──────────────────

export function Textarea({ value, onChange, placeholder }) {
    return (
        <textarea
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            rows={4}
            style={{
                width: '100%',
                boxSizing: 'border-box',
                resize: 'vertical',
                minHeight: 96,
                padding: '12px 14px',
                borderRadius: RADIUS.md,
                border: '1px solid var(--tof-border)',
                background: 'var(--tof-surface)',
                color: 'var(--tof-text)',
                fontFamily: 'var(--tof-font-body)',
                fontSize: 15,
                lineHeight: 1.6,
                outline: 'none',
            }}
        />
    );
}

export function Input({ value, onChange, placeholder }) {
    return (
        <input
            type="text"
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            style={{
                width: '100%',
                boxSizing: 'border-box',
                padding: '12px 14px',
                borderRadius: RADIUS.md,
                border: '1px solid var(--tof-border)',
                background: 'var(--tof-surface)',
                color: 'var(--tof-text)',
                fontFamily: 'var(--tof-font-body)',
                fontSize: 15,
                outline: 'none',
            }}
        />
    );
}

export function Field({ label, hint, children }) {
    return (
        <div style={{ display: 'grid', gap: SPACING.xs + 2 }}>
            <label style={{ ...TYPE.body, color: 'var(--tof-text)', fontWeight: 600, margin: 0 }}>
                {label}
            </label>
            {hint ? (
                <p style={{ ...TYPE.bodySmall, color: 'var(--tof-text-muted)', margin: 0 }}>{hint}</p>
            ) : null}
            {children}
        </div>
    );
}
