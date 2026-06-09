import React, { useState } from 'react';
import { sendMagicLink } from '../supabase';
import {
  PageShell,
  HeroBlock,
  SectionCard,
  PrimaryButton,
  SecondaryButton,
} from '../ui/AppShell';
import { TYPE, SPACING, RADIUS, useIsMobile } from '../ui/tokens';

/**
 * Login — magic-link flow.
 * Vraagt om e-mailadres → stuurt magic-link mail → toont "check je inbox".
 * Echte login (Supabase Auth) gebeurt op /auth/callback wanneer gebruiker klikt.
 */
export default function Login({ setPage }) {
  const isMobile = useIsMobile();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // 'idle' | 'sending' | 'sent' | 'error'
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setErrorMessage('');

    const cleanEmail = email.trim();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setErrorMessage('Vul een geldig e-mailadres in.');
      setStatus('error');
      return;
    }

    setStatus('sending');
    const { ok, error } = await sendMagicLink(cleanEmail);

    if (!ok) {
      setErrorMessage(error || 'Er ging iets mis. Probeer het opnieuw.');
      setStatus('error');
      return;
    }

    setStatus('sent');
  };

  if (status === 'sent') {
    return (
      <PageShell>
        <HeroBlock
          eyebrow="CHECK JE INBOX"
          title="Je link is onderweg."
          lead={
            <>
              We hebben een magic-link gestuurd naar <strong>{email}</strong>.<br />
              Klik op de knop in de mail om in te loggen.
            </>
          }
        />
        <SectionCard>
          <p style={{ ...TYPE.body, color: 'var(--tof-text-muted)', margin: 0 }}>
            Geen mail ontvangen? Check je spam-folder, of vraag een nieuwe aan met een ander adres.
          </p>
          <div style={{ marginTop: SPACING.xl, display: 'flex', gap: SPACING.md, flexWrap: 'wrap' }}>
            <SecondaryButton onClick={() => { setStatus('idle'); setEmail(''); }}>
              ← Ander adres
            </SecondaryButton>
            {setPage && (
              <SecondaryButton onClick={() => setPage('landing')}>
                Terug naar start
              </SecondaryButton>
            )}
          </div>
        </SectionCard>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <HeroBlock
        eyebrow="INLOGGEN"
        title="Welkom terug."
        lead="Vul je e-mailadres in. We sturen je een link om met één klik in te loggen — geen wachtwoord nodig."
      />

      <SectionCard>
        <form onSubmit={handleSubmit} noValidate>
          <label
            htmlFor="login-email"
            style={{
              ...TYPE.eyebrow,
              display: 'block',
              marginBottom: SPACING.sm,
              color: 'var(--tof-text-muted)',
            }}
          >
            E-MAILADRES
          </label>

          <input
            id="login-email"
            type="email"
            inputMode="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => { setEmail(e.target.value); if (status === 'error') setStatus('idle'); }}
            placeholder="naam@bedrijf.nl"
            disabled={status === 'sending'}
            style={{
              width: '100%',
              padding: isMobile ? '14px 16px' : '16px 18px',
              fontSize: 16,
              fontFamily: 'inherit',
              color: 'var(--tof-text)',
              background: 'var(--tof-bg)',
              border: '1px solid var(--tof-border)',
              borderRadius: RADIUS.md,
              outline: 'none',
              transition: 'border-color 200ms ease',
            }}
            onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--tof-accent-rose)'; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--tof-border)'; }}
          />

          {status === 'error' && errorMessage && (
            <p
              role="alert"
              style={{
                ...TYPE.small,
                color: 'var(--tof-accent-rose)',
                marginTop: SPACING.sm,
                marginBottom: 0,
              }}
            >
              {errorMessage}
            </p>
          )}

          <div style={{ marginTop: SPACING.xl, display: 'flex', gap: SPACING.md, flexWrap: 'wrap' }}>
            <PrimaryButton type="submit" disabled={status === 'sending'}>
              {status === 'sending' ? 'Bezig met versturen…' : 'Stuur magic-link →'}
            </PrimaryButton>
            {setPage && (
              <SecondaryButton type="button" onClick={() => setPage('landing')}>
                Annuleren
              </SecondaryButton>
            )}
          </div>
        </form>
      </SectionCard>
    </PageShell>
  );
}
