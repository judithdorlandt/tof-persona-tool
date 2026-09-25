import React, { useState } from 'react';
import { verifyMagicLink } from '../supabase';
import {
  PageShell,
  HeroBlock,
  SectionCard,
  PrimaryButton,
} from '../ui/AppShell';
import { TYPE, SPACING } from '../ui/tokens';
import { useCopy } from '../i18n/LanguageContext';

/**
 * AuthConfirm — veilige magic-link bevestiging.
 *
 * De magic-link in de e-mail wijst naar deze pagina met een `token_hash` en
 * `type` in de URL-query (i.p.v. de oude hash-tokens die direct verbruikt
 * worden). Wij verifiëren de token NIET automatisch: pas wanneer de gebruiker
 * zelf op "Inloggen" klikt, roepen we verifyOtp aan.
 *
 * Daardoor verbruiken automatische e-mailscanners (Microsoft Safe Links e.d.)
 * de link niet voortijdig — die laden alleen deze pagina, maar klikken de knop
 * niet aan. Na een geslaagde verificatie sturen we door naar /auth/callback,
 * dat de bestaande routing (manager-teams → dashboard, etc.) afhandelt.
 */
export default function AuthConfirm({ setPage }) {
  const { auth: t } = useCopy();
  const params = new URLSearchParams(window.location.search);
  const tokenHash = params.get('token_hash') || '';
  const type = params.get('type') || 'magiclink';

  const [status, setStatus] = useState('idle'); // idle | verifying | error
  const [errorMessage, setErrorMessage] = useState('');

  async function handleConfirm() {
    setStatus('verifying');
    setErrorMessage('');

    const result = await verifyMagicLink(tokenHash, type);

    if (result.ok) {
      // Sessie is nu aangemaakt → laat /auth/callback de routing doen.
      if (setPage) setPage('authcallback');
      return;
    }

    setStatus('error');
    setErrorMessage(result.error || t.confirm.failed);
  }

  // Iemand opent /auth/confirm zonder token (of de scanner pakte de query weg).
  if (!tokenHash) {
    return (
      <PageShell>
        <HeroBlock
          eyebrow={t.invalidLink.eyebrow}
          title={t.invalidLink.title}
          lead={t.invalidLink.lead}
        />
        <SectionCard>
          <div style={{ marginTop: SPACING.md }}>
            <PrimaryButton onClick={() => setPage && setPage('login')}>
              {t.expiredLink.requestNew}
            </PrimaryButton>
          </div>
        </SectionCard>
      </PageShell>
    );
  }

  if (status === 'error') {
    return (
      <PageShell>
        <HeroBlock
          eyebrow={t.expiredLink.eyebrow}
          title={t.expiredLink.title}
          lead={t.expiredLink.lead}
        />
        <SectionCard>
          <p style={{ ...TYPE.body, color: 'var(--tof-text-muted)', margin: 0 }}>
            {errorMessage}
          </p>
          <div style={{ marginTop: SPACING.xl }}>
            <PrimaryButton onClick={() => setPage && setPage('login')}>
              {t.expiredLink.requestNew}
            </PrimaryButton>
          </div>
        </SectionCard>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <HeroBlock
        eyebrow={t.confirm.eyebrow}
        title={t.confirm.title}
        lead={t.confirm.lead}
      />
      <SectionCard>
        <p style={{ ...TYPE.body, color: 'var(--tof-text-muted)', margin: 0 }}>
          {t.confirm.safetyNote}
        </p>
        <div style={{ marginTop: SPACING.xl }}>
          <PrimaryButton onClick={handleConfirm} disabled={status === 'verifying'}>
            {status === 'verifying' ? t.confirm.submitting : t.confirm.submit}
          </PrimaryButton>
        </div>
      </SectionCard>
    </PageShell>
  );
}
