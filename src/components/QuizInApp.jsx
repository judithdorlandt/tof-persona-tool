import { useEffect, useState } from 'react';
import { APP_STORE_URL, GOOGLE_PLAY_URL } from '../config/appStore';
import { useCopy } from '../i18n/LanguageContext';
import { validateTeamAccessCode } from '../supabase';
import { HeroBlock, PageShell, SecondaryButton, SectionCard } from '../ui/AppShell';
import { RADIUS, SPACING, TYPE } from '../ui/tokens';

/**
 * QuizInApp — /quiz (en /intro, /quiz-test) op het web: het storescherm.
 *
 * De test zit in de app; dit scherm wijst naar beide stores. Ook wie via een
 * uitnodigingslink van een manager komt (?org=…&code=…) landt hier (besluit
 * 21 okt 2026). Dan staat de teamcode van die link bovenaan, gecontroleerd
 * op de server, zodat hij na de test bij "Profiel inbrengen" klaarligt.
 */

// Zelfde maat als PrimaryButton, maar als link: de stores openen in een nieuw
// tabblad, en een echte <a> laat zich ook kopiëren of lang indrukken.
const storeLink = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'var(--tof-accent-rose)',
    color: 'white',
    padding: '12px 18px',
    borderRadius: RADIUS.md,
    fontSize: 14,
    fontWeight: 600,
    fontFamily: 'var(--tof-font-body)',
    textDecoration: 'none',
};

export default function QuizInApp({ setPage }) {
    const { quizInApp: t } = useCopy();

    // Teamcode uit de uitnodigingslink. Alleen tonen als de server hem kent:
    // een afgekapte of oude link mag geen verkeerde code voorhouden.
    const [teamCode, setTeamCode] = useState(null); // { code, team }
    useEffect(() => {
        const code = new URLSearchParams(window.location.search).get('code');
        if (!code) return undefined;
        let actief = true;
        validateTeamAccessCode(code).then((rij) => {
            if (actief && rij) setTeamCode({ code: rij.code, team: rij.team });
        });
        return () => { actief = false; };
    }, []);

    return (
        <PageShell compact>
            <HeroBlock compact eyebrow={t.eyebrow} title={t.title} lead={t.lead} />

            {teamCode && (
                <SectionCard eyebrow={t.teamCode.title}>
                    <div style={{
                        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                        fontSize: 22,
                        fontWeight: 600,
                        letterSpacing: 1,
                        color: 'var(--tof-text)',
                    }}>
                        {teamCode.code}
                    </div>
                    <p style={{ ...TYPE.body, margin: 0 }}>{t.teamCode.body(teamCode.team)}</p>
                </SectionCard>
            )}

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: SPACING.sm + 2 }}>
                <a href={APP_STORE_URL} target="_blank" rel="noopener noreferrer" style={storeLink}>
                    {t.appStore}
                </a>
                <a href={GOOGLE_PLAY_URL} target="_blank" rel="noopener noreferrer" style={storeLink}>
                    {t.googlePlay}
                </a>
            </div>

            <SectionCard eyebrow={t.steps.title}>
                <ol style={{ ...TYPE.body, margin: 0, paddingLeft: 20, display: 'grid', gap: SPACING.xs + 2 }}>
                    {t.steps.items.map((item) => (
                        <li key={item}>{item}</li>
                    ))}
                </ol>
            </SectionCard>

            <SectionCard eyebrow={t.contribute.title}>
                <p style={{ ...TYPE.body, margin: 0 }}>{t.contribute.body}</p>
                <div>
                    <SecondaryButton onClick={() => setPage && setPage('team')}>{t.back}</SecondaryButton>
                </div>
            </SectionCard>
        </PageShell>
    );
}
