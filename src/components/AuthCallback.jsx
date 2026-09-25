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
import { useCopy } from '../i18n/LanguageContext';

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
  const { auth: t } = useCopy();
  const [waited, setWaited] = useState(false);

  useEffect(() => {
    // Geef Supabase SDK ~3 seconden om de hash-tokens te verwerken.
    const timer = setTimeout(() => setWaited(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  // Zodra een sessie verschijnt: bepaal waar we heen gaan.
  // - individuele tester    → direct naar de quiz (zie sendIndividualInvite)
  // - 1 manager-team        → direct naar dashboard (skip /team helemaal)
  // - meerdere manager-teams → /team (manager-mode lijst)
  // - geen manager-rijen    → /home
  useEffect(() => {
    if (!session || !setPage) return;
    let cancelled = false;
    (async () => {
      try {
        // Uitgenodigd om de tool zelf te proberen: die heeft geen team,
        // dus stuur hem meteen de quiz in in plaats van naar /home.
        if (session.user?.user_metadata?.invite_kind === 'individual') {
          setTimeout(() => { if (!cancelled) setPage('quiz'); }, 200);
          return;
        }

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
            const responses = await getResponsesByTeam(t.team, t.organization, t.code);
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
          eyebrow={t.callback.loggedInEyebrow}
          title={t.callback.loggedInTitle}
          lead={t.callback.loggedInLead}
        />
      </PageShell>
    );
  }

  if (loading || !waited) {
    return (
      <PageShell>
        <HeroBlock
          eyebrow={t.callback.waitingEyebrow}
          title={t.callback.waitingTitle}
          lead={t.callback.waitingLead}
        />
      </PageShell>
    );
  }

  // Geen sessie na wachttijd → link verlopen of ongeldig
  return (
    <PageShell>
      <HeroBlock
        eyebrow={t.expiredLink.eyebrow}
        title={t.expiredLink.title}
        lead={t.expiredLink.callbackLead}
      />
      <SectionCard>
        <p style={{ ...TYPE.body, color: 'var(--tof-text-muted)', margin: 0 }}>
          {t.expiredLink.note}
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
