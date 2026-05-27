import React, { useEffect, useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { getMyManagedTeams, getResponsesByTeam } from '../supabase';
import { grantTeamLevel, LEVEL_INSIGHT, LEVEL_DYNAMICS } from '../utils/access';
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
export default function AuthCallback({ setPage, setSelectedTeam, setTeamResponses }) {
  const { session, loading } = useAuth();
  const [waited, setWaited] = useState(false);

  useEffect(() => {
    // Geef Supabase SDK ~3 seconden om de hash-tokens te verwerken.
    const timer = setTimeout(() => setWaited(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  // Zodra een sessie verschijnt: bepaal waar we heen gaan.
  // - 1 manager-team        → direct naar dashboard (skip /team helemaal)
  // - meerdere manager-teams → /team (manager-mode lijst)
  // - geen manager-rijen    → /home
  useEffect(() => {
    if (!session || !setPage) return;
    let cancelled = false;
    (async () => {
      try {
        const managed = await getMyManagedTeams();

        if (managed.length === 1) {
          // Direct naar dashboard — geen tussenpagina met 3 modules.
          const t = managed[0];
          grantTeamLevel({
            team: t.team,
            organization: t.organization,
            level: t.level || LEVEL_INSIGHT,
            code: t.code,
          });
          if (typeof setSelectedTeam === 'function') {
            setSelectedTeam({ team: t.team, organization: t.organization, code: t.code });
          }
          try {
            const responses = await getResponsesByTeam(t.team, t.organization);
            if (typeof setTeamResponses === 'function') {
              setTeamResponses(responses || []);
            }
          } catch (_e) {
            if (typeof setTeamResponses === 'function') setTeamResponses([]);
          }
          if (cancelled) return;
          const destination = t.level === LEVEL_DYNAMICS ? 'teamdynamics' : 'teamdashboard';
          setTimeout(() => { if (!cancelled) setPage(destination); }, 200);
          return;
        }

        if (cancelled) return;
        const destination = managed.length > 1 ? 'team' : 'home';
        setTimeout(() => { if (!cancelled) setPage(destination); }, 400);
      } catch (_e) {
        if (!cancelled) setTimeout(() => setPage('home'), 400);
      }
    })();
    return () => { cancelled = true; };
  }, [session, setPage, setSelectedTeam, setTeamResponses]);

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
