/**
 * ShareNote — een deelmoment: korte uitleg plus een knop die een tekst naar
 * het klembord kopieert. Nooit zelf versturen; de gebruiker plakt de tekst
 * waar hij wil en maakt hem eigen (deelteksten 22 okt 2026).
 *
 * Gebruikt op het Gelukt-scherm (Bijdragen), onderaan Teaminzicht en onderaan
 * Teamdynamiek. Na het kopiëren blijft de melding staan: die zegt wat je nu
 * doet ("Plak hem waar je wilt …"), dus hij mag niet wegflitsen.
 */

import React, { useState } from 'react';
import { SectionEyebrow, SecondaryButton } from '../ui/AppShell';
import { SPACING, TYPE } from '../ui/tokens';
import { copyText } from '../utils/copyText';

export default function ShareNote({
    eyebrow,
    title,
    text,
    button,
    copied,
    copyFailed,
    getText,       // () => de kopieertekst, op het moment van klikken
    accent = 'var(--tof-text-muted)',
}) {
    const [status, setStatus] = useState(null); // null | 'ok' | 'failed'

    async function handleCopy() {
        const ok = await copyText(getText());
        setStatus(ok ? 'ok' : 'failed');
    }

    return (
        <div style={{ display: 'grid', gap: SPACING.sm, maxWidth: 680 }}>
            {eyebrow ? <SectionEyebrow color={accent}>{eyebrow}</SectionEyebrow> : null}
            {title ? (
                <h3 style={{ ...TYPE.subhead, fontSize: 20 }}>{title}</h3>
            ) : null}
            {text ? <p style={{ ...TYPE.body, margin: 0 }}>{text}</p> : null}
            <div style={{ marginTop: SPACING.xs }}>
                <SecondaryButton onClick={handleCopy}>{button}</SecondaryButton>
            </div>
            <p
                role="status"
                aria-live="polite"
                style={{
                    ...TYPE.bodySmall,
                    margin: 0,
                    color: status === 'failed' ? 'var(--tof-accent-rose)' : 'var(--tof-text-soft)',
                }}
            >
                {status === 'ok' ? copied : status === 'failed' ? copyFailed : ''}
            </p>
        </div>
    );
}
