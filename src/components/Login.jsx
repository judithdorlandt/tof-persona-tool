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
import { useCopy } from '../i18n/LanguageContext';

/**
 * Login — magic-link flow.
 * Vraagt om e-mailadres → stuurt magic-link mail → toont "check je inbox".
 * Echte login (Supabase Auth) gebeurt op /auth/callback wanneer gebruiker klikt.
 */
/**
 * `testerInvite` = binnengekomen via /start, de persoonlijke uitnodiging om de
 * tool zelf te proberen. Nieuwe accounts krijgen dan invite_kind 'individual',
 * zodat AuthCallback ze na het inloggen direct de quiz in stuurt.
 */
export default function Login({ setPage, testerInvite = false }) {
  const isMobile = useIsMobile();
  const { auth: t, common } = useCopy();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // 'idle' | 'sending' | 'sent' | 'error'
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setErrorMessage('');

    const cleanEmail = email.trim();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setErrorMessage(common.errors.invalidEmail);
      setStatus('error');
      return;
    }

    setStatus('sending');
    const { ok, error } = await sendMagicLink(
      cleanEmail,
      testerInvite ? { invite_kind: 'individual' } : null
    );

    if (!ok) {
      setErrorMessage(error || t.login.genericError);
      setStatus('error');
      return;
    }

    setStatus('sent');
  };

  if (status === 'sent') {
    return (
      <PageShell>
        <HeroBlock
          eyebrow={t.sent.eyebrow}
          title={t.sent.title}
          lead={
            <>
              {t.sent.leadBefore}<strong>{email}</strong>.<br />
              {t.sent.leadAfter}
            </>
          }
        />
        <SectionCard>
          <p style={{ ...TYPE.body, color: 'var(--tof-text-muted)', margin: 0 }}>
            {t.sent.spamHint}
          </p>
          <div style={{ marginTop: SPACING.xl, display: 'flex', gap: SPACING.md, flexWrap: 'wrap' }}>
            <SecondaryButton onClick={() => { setStatus('idle'); setEmail(''); }}>
              {t.sent.otherAddress}
            </SecondaryButton>
            {setPage && (
              <SecondaryButton onClick={() => setPage('landing')}>
                {t.sent.backToStart}
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
        eyebrow={testerInvite ? t.login.testerEyebrow : t.login.eyebrow}
        title={testerInvite ? t.login.testerTitle : t.login.title}
        lead={t.login.lead}
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
            {t.login.emailLabel}
          </label>

          <input
            id="login-email"
            type="email"
            inputMode="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => { setEmail(e.target.value); if (status === 'error') setStatus('idle'); }}
            placeholder={t.login.emailPlaceholder}
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
              {status === 'sending' ? t.login.submitting : t.login.submit}
            </PrimaryButton>
            {setPage && (
              <SecondaryButton type="button" onClick={() => setPage('landing')}>
                {t.login.cancel}
              </SecondaryButton>
            )}
          </div>
        </form>
      </SectionCard>
    </PageShell>
  );
}
