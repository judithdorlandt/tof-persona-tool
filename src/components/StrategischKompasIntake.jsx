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

const ACCENT = 'var(--tof-text)';

// De vijf inhoudelijke secties. Elk veld mapt 1-op-1 op een sleutel uit
// de intake-shape (EMPTY_INTAKE).
const SECTIONS = [
    {
        eyebrow: '01',
        title: 'Organisatie en ambitie',
        field: 'ambition',
        questions: [
            'Waar staat jullie organisatie nu, en waar moet het naartoe?',
            'Wat is de aanleiding om dit traject nú te starten?',
        ],
    },
    {
        eyebrow: '02',
        title: 'De beweging die je wilt maken',
        field: 'movement',
        questions: [
            'Welke beweging willen jullie de komende 3–5 jaar maken?',
            'Wat is er al in gang gezet, en wat ontbreekt nog?',
        ],
    },
    {
        eyebrow: '03',
        title: 'MT en gedrag',
        field: 'mtBehaviour',
        questions: [
            'Hoe loopt het in jullie MT — waar gaat het goed, waar stokt het?',
            'Welk patroon keert terug in jullie samenwerking, en is nog niet hardop benoemd?',
        ],
    },
    {
        eyebrow: '04',
        title: 'Werkomgeving',
        field: 'workplace',
        questions: [
            'Past jullie werkomgeving (fysiek en hybride) bij hoe jullie wíllen werken, of bij hoe het werd ingericht?',
            'Waar werkt de omgeving jullie tegen?',
        ],
    },
    {
        eyebrow: '05',
        title: 'Richting voor 3–5 jaar',
        field: 'direction',
        questions: [
            'Wat willen jullie over 3–5 jaar kunnen zeggen over deze periode?',
            'Wat moet daarvoor nu in gang gezet worden?',
        ],
    },
];

export default function StrategischKompasIntake({ setPage }) {
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
            setError('Vul een teamcode in — die koppelt deze intake aan jullie persona-data.');
            return;
        }

        // Stel het object samen dat exact de intake-shape volgt.
        const payload = {
            ...EMPTY_INTAKE,
            submittedAt: new Date().toLocaleDateString('nl-NL', { month: 'long', year: 'numeric' }),
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
                        Jullie input is opgeslagen. Judith neemt hem door en combineert hem met jullie
                        persona-data en de acht trends. In het ontwerpgesprek komt alles samen tot jullie kompas.
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
                eyebrow="Module 3 · Strategisch Kompas · Intake"
                title="De start van jullie"
                titleAccent="kompas"
                titleAccentColor={ACCENT}
            />

            <SectionCard accent={ACCENT}>
                <p style={{ ...TYPE.bodyLarge, margin: 0 }}>
                    Deze vragenlijst is de start van jullie Strategisch Kompas. Jullie antwoorden vormen,
                    samen met de persona-data uit Module 1 en 2 en de acht trends, de basis voor het
                    ontwerpgesprek. Er volgt geen automatische uitslag — dit is input die we samen tot
                    richting maken. Neem de tijd; eerlijke korte antwoorden zijn waardevoller dan volledige.
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
                            placeholder="Jullie antwoord…"
                        />
                    </SectionCard>
                ))}

                {/* Afsluiting: teamcode (verplicht) + invuller */}
                <SectionCard accent={ACCENT} eyebrow="Afsluiting">
                    <div style={{ display: 'grid', gap: SPACING.lg }}>
                        <Field
                            label="Teamcode (verplicht)"
                            hint="Koppelt deze intake aan de persona-data van dezelfde organisatie."
                        >
                            <Input
                                value={values.teamcode}
                                onChange={update('teamcode')}
                                placeholder="bijv. NIJ-BES-26-A8K2"
                            />
                        </Field>
                        <Field label="Naam en rol van de invuller">
                            <Input
                                value={values.filledBy}
                                onChange={update('filledBy')}
                                placeholder="bijv. Sanne de Vries, MT-lid"
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
                            {status === 'saving' ? 'Bezig met versturen…' : 'Verstuur intake'}
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
