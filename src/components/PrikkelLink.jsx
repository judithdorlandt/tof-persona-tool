/**
 * PrikkelLink — de losse link voor bestaande teams:
 *   team.persona-tool.nl/werkomgeving?code=<CODE>  (EN /en/working-environment)
 *
 * Eén pagina met alleen de werkomgevingsvraag (vraag 10 uit de app), voor
 * teamleden die hun profiel al inbrachten voordat die vraag bestond. Geen
 * nieuw profiel, geen naamveld, en de code hoeft niemand in te vullen: die
 * zit in de link. Alleen op het web (niet in NATIVE_PAGES).
 *
 * Opslaan gaat alleen via savePrikkel → public.prikkel_opslaan
 * (supabase/011): zonder naam, zonder werkstijl, zonder datum. Mislukt het,
 * dan staat de knop weer klaar, zonder foutmelding.
 *
 * Dubbel tellen (besluit Judith 17 nov 2026, punt 4): na een gelukte
 * verzending zet de pagina de markering tof_prikkel_<CODE> in deze browser.
 * Staat die er al (ook gezet door Bijdragen), dan toont de pagina
 * `alBinnen` in plaats van de vraag. Een ander toestel of een privévenster
 * vangt dat niet; daarvoor staat `alGehad` boven de vraag.
 *
 * Teksten: copy/{nl,en}/prikkelLink.js; vraag en antwoorden uit
 * quizData.werkomgeving, in de vaste volgorde van PRIKKEL_IDS.
 */

import { useEffect, useState } from 'react';

import { useCopy } from '../i18n/LanguageContext';
import { heeftPrikkelMarkering, PRIKKEL_IDS, zetPrikkelMarkering } from '../lib/prikkel';
import { savePrikkel, validateTeamAccessCode } from '../supabase';
import { HeroBlock, PageShell, PrimaryButton, SectionCard } from '../ui/AppShell';
import { SPACING, TYPE } from '../ui/tokens';

const ACCENT = 'var(--tof-accent-rose)';

export default function PrikkelLink() {
    const { prikkelLink: t, quizData, quiz } = useCopy();

    // De code staat in de link en verandert daarna niet meer.
    const [code] = useState(
        () => (new URLSearchParams(window.location.search).get('code') || '').trim()
    );
    // checking | ongeldig | alBinnen | vraag | saving | done
    const [status, setStatus] = useState('checking');
    const [keuze, setKeuze] = useState(null);

    useEffect(() => {
        let actief = true;
        if (!code) {
            setStatus('ongeldig');
            return undefined;
        }
        validateTeamAccessCode(code)
            .then((rij) => {
                if (!actief) return;
                if (!rij) setStatus('ongeldig');
                else setStatus(heeftPrikkelMarkering(rij.code) ? 'alBinnen' : 'vraag');
            })
            .catch(() => {
                if (actief) setStatus('ongeldig');
            });
        return () => { actief = false; };
    }, [code]);

    async function verstuur() {
        if (!keuze || status === 'saving') return;
        setStatus('saving');
        const ok = await savePrikkel(code, keuze);
        if (ok) {
            zetPrikkelMarkering(code);
            setStatus('done');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            // Geen foutmelding: de knop staat gewoon weer klaar.
            setStatus('vraag');
        }
    }

    if (status === 'checking') {
        return <PageShell compact />;
    }

    if (status === 'ongeldig') {
        return (
            <PageShell compact>
                <HeroBlock compact eyebrow={t.eyebrow} title={t.title} />
                <SectionCard accent={ACCENT}>
                    <p style={{ ...TYPE.bodyLarge, margin: 0 }}>{t.ongeldig}</p>
                </SectionCard>
            </PageShell>
        );
    }

    if (status === 'done') {
        return (
            <PageShell compact>
                <HeroBlock compact eyebrow={t.done.eyebrow} title={t.done.title} />
                <SectionCard accent={ACCENT}>
                    <p style={{ ...TYPE.bodyLarge, margin: 0 }}>{t.done.body}</p>
                </SectionCard>
            </PageShell>
        );
    }

    if (status === 'alBinnen') {
        return (
            <PageShell compact>
                <HeroBlock compact eyebrow={t.eyebrow} title={t.title} />
                <SectionCard accent={ACCENT}>
                    <p style={{ ...TYPE.bodyLarge, margin: 0 }}>{t.alBinnen}</p>
                </SectionCard>
            </PageShell>
        );
    }

    const vraag = quizData?.werkomgeving;
    const bezig = status === 'saving';

    return (
        <PageShell compact>
            <HeroBlock compact eyebrow={t.eyebrow} title={t.title} lead={t.intro} />

            <SectionCard accent={ACCENT}>
                <p style={{ ...TYPE.bodySmall, color: 'var(--tof-text-muted)', margin: 0 }}>
                    {t.alGehad}
                </p>

                <div style={{ display: 'grid', gap: SPACING.sm }}>
                    <p
                        style={{
                            margin: 0,
                            fontFamily: 'var(--tof-font-heading)',
                            fontSize: 22,
                            lineHeight: 1.25,
                            fontWeight: 500,
                            color: 'var(--tof-text)',
                        }}
                    >
                        {vraag.q}
                    </p>
                    {quiz?.pickOne ? (
                        <p style={{ ...TYPE.bodySmall, color: 'var(--tof-text-soft)', margin: 0 }}>
                            {quiz.pickOne.before}
                            <strong>{quiz.pickOne.strong}</strong>
                            {quiz.pickOne.after}
                        </p>
                    ) : null}
                </div>

                <div role="radiogroup" aria-label={vraag.q} style={{ display: 'grid', gap: SPACING.sm }}>
                    {PRIKKEL_IDS.map((id) => {
                        const actief = keuze === id;
                        return (
                            <button
                                key={id}
                                type="button"
                                role="radio"
                                aria-checked={actief}
                                disabled={bezig}
                                onClick={() => setKeuze(id)}
                                style={{
                                    padding: '12px 14px',
                                    minHeight: 48,
                                    borderRadius: 12,
                                    border: actief ? `2px solid ${ACCENT}` : '1px solid #ddd',
                                    background: actief ? '#fcf1f1' : 'white',
                                    textAlign: 'left',
                                    cursor: bezig ? 'default' : 'pointer',
                                    fontFamily: 'var(--tof-font-body)',
                                    fontSize: 15,
                                    lineHeight: 1.35,
                                    color: 'var(--tof-text)',
                                }}
                            >
                                {vraag.a[id]}
                            </button>
                        );
                    })}
                </div>

                <p style={{ ...TYPE.bodySmall, color: 'var(--tof-text-soft)', margin: 0 }}>
                    {t.privacy}
                </p>

                <div>
                    <PrimaryButton onClick={verstuur} disabled={!keuze || bezig}>
                        {bezig ? t.submitting : t.submit}
                    </PrimaryButton>
                </div>
            </SectionCard>
        </PageShell>
    );
}
