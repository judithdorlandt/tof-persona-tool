import React, { useEffect, useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { getMyManagedTeams } from '../supabase';
import {
  PageShell,
  HeroBlock,
  SectionCard,
  PrimaryButton,
} from '../ui/AppShell';
import { TYPE, SPACING } from '../ui/tokens';

/**
 * AuthCallback — landingspagina voor magic-link.
 *
 * Wanneer de gebruiker op de link in de e-mail klikt, komt hij hier terecht
 * met tokens in de URL-hash. De Supabase SDK pikt die automatisch op en
 * maakt de sessie aan. AuthContext.onAuthStateChange schiet daarop af.
 *
 * Wij wachten kort op de sessie en navigeren door naar /home (of laten
 * een fout zien als er iets misgaat).
 */
export default function AuthCallback({ setPage }) {
  const { session, loading } = useAuth();
  const [waited, setWaited] = useState(false);

  useEffect(() => {
    // Geef Supabase SDK ~3 seconden om de hash-tokens te verwerken.
    const timer = setTimeout(() => setWaited(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  // Zodra een sessie verschijnt: bepaal waar we heen gaan.
  // - Manager (heeft team_managers rijen) → /team (manager-mode UI)
  // - Gewone user → /home
  useEffect(() => {
    if (!session || !setPage) return;
    let cancelled = false;
    (async () => {
      let destination = 'home';
      try {
        const managed = await getMyManagedTeams();
        if (managed.length > 0) destination = 'team';
      } catch (_e) {
        // niet-kritiek; val terug op home
      }
      if (cancelled) return;
      setTimeout(() => { if (!cancelled) setPage(destination); }, 400);
    })();
    return () => { cancelled = true; };
  }, [session, setPage]);

  if (session) {
    return (
      <PageShell>
        <HeroBlock
          eyebrow="INGELOGD"
          title="Welkom terug."
          lead="Je wordt doorgestuurd…"
        />
      </PageShell>
    );
  }

  if (loading || !waited) {
    return (
      <PageShell>
        <HeroBlock
          eyebrow="EÉN MOMENT"
          title="Inloggen…"
          lead="We verwerken je magic-link."
        />
      </PageShell>
    );
  }

  // Geen sessie na wachttijd → link verlopen of ongeldig
  return (
    <PageShell>
      <HeroBlock
        eyebrow="LINK VERLOPEN"
        title="Dat lukte niet."
        lead="Je magic-link is verlopen of al eerder gebruikt. Vraag een nieuwe aan — duurt 5 seconden."
      />
      <SectionCard>
        <p style={{ ...TYPE.body, color: 'var(--tof-text-muted)', margin: 0 }}>
          Magic-links zijn één uur geldig en kunnen maar één keer gebruikt worden — dat is voor jouw veiligheid.
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
