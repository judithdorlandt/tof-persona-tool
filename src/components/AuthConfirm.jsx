import React, { useState } from 'react';
import { verifyMagicLink } from '../supabase';
import {
  PageShell,
  HeroBlock,
  SectionCard,
  PrimaryButton,
} from '../ui/AppShell';
import { TYPE, SPACING } from '../ui/tokens';

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
    setErrorMessage(result.error || 'Inloggen mislukt. Vraag een nieuwe link aan.');
  }

  // Iemand opent /auth/confirm zonder token (of de scanner pakte de query weg).
  if (!tokenHash) {
    return (
      <PageShell>
        <HeroBlock
          eyebrow="LINK ONGELDIG"
          title="Dat lukte niet."
          lead="Deze link bevat geen geldige toegangscode. Vraag een nieuwe aan — duurt 5 seconden."
        />
        <SectionCard>
          <div style={{ marginTop: SPACING.md }}>
            <PrimaryButton onClick={() => setPage && setPage('login')}>
              Vraag nieuwe link →
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
          eyebrow="LINK VERLOPEN"
          title="Dat lukte niet."
          lead="Je magic-link is verlopen of al gebruikt. Vraag een nieuwe aan — duurt 5 seconden."
        />
        <SectionCard>
          <p style={{ ...TYPE.body, color: 'var(--tof-text-muted)', margin: 0 }}>
            {errorMessage}
          </p>
          <div style={{ marginTop: SPACING.xl }}>
            <PrimaryButton onClick={() => setPage && setPage('login')}>
              Vraag nieuwe link →
            </PrimaryButton>
          </div>
        </SectionCard>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <HeroBlock
        eyebrow="FIJN DAT JE ER BENT"
        title="Nog één klik."
        lead="Klik op de knop hieronder om in te loggen bij The Office Factory."
      />
      <SectionCard>
        <p style={{ ...TYPE.body, color: 'var(--tof-text-muted)', margin: 0 }}>
          Voor jouw veiligheid wordt je toegang pas geactiveerd op het moment dat
          je zelf op de knop klikt.
        </p>
        <div style={{ marginTop: SPACING.xl }}>
          <PrimaryButton onClick={handleConfirm} disabled={status === 'verifying'}>
            {status === 'verifying' ? 'Bezig met inloggen…' : 'Inloggen →'}
          </PrimaryButton>
        </div>
      </SectionCard>
    </PageShell>
  );
}
