import { APP_STORE_URL, GOOGLE_PLAY_URL } from '../config/appStore';
import { useCopy } from '../i18n/LanguageContext';
import { HeroBlock, PageShell, SecondaryButton, SectionCard } from '../ui/AppShell';
import { RADIUS, SPACING, TYPE } from '../ui/tokens';

/**
 * QuizInApp — /quiz op het web voor wie zonder uitnodigingslink komt.
 *
 * De vrije "Test jezelf" zit in de app; dit scherm wijst naar beide stores.
 * Wie via een link van een manager komt (?org=…&code=…) ziet dit niet, maar
 * doet de test in de browser — dan gaat de teamcode vanzelf mee en kost een
 * app-installatie geen deelnemers aan de teammeting. Die keuze staat in
 * App.js (case 'quiz').
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

    return (
        <PageShell compact>
            <HeroBlock compact eyebrow={t.eyebrow} title={t.title} lead={t.lead} />

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
