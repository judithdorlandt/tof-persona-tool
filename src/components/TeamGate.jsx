/**
 * TeamGate — wat er in plaats van het teambeeld staat als het team nog te
 * klein is.
 *
 * Eén blok voor Module 1 (TeamDashboard) en Module 2 (TeamDynamics), zodat de
 * uitleg in beide weergaven hetzelfde is. De teksten staan daarom op één plek
 * (teamDashboard.gate). De drempel zelf staat in `utils/access.js`
 * (MIN_TEAM_RESPONSES + countCompleteProfiles).
 *
 * Geen foutmelding, geen waarschuwingsicoon, geen uitroepteken: dit is een
 * toelichting. De module-eigen accentkleur en eyebrow komen van de aanroeper,
 * zodat het scherm in de familie blijft waar de bezoeker zich al bevond.
 *
 * Opdracht C4 (23 okt 2026): de teamnaam in de kop, de telling met vijf
 * vakjes, en een knop die het bericht voor het team kopieert. Of de
 * namenvariant van dat bericht geldt, vragen we na bij de teamcode
 * (check_team_code, supabase/009); tot dat bekend is: de standaardzin.
 */

import React, { useEffect, useState } from 'react';
import { PageShell, HeroBlock, SectionCard, SectionEyebrow, PrimaryButton } from '../ui/AppShell';
import { useCopy } from '../i18n/LanguageContext';
import { TYPE, SPACING } from '../ui/tokens';
import { MIN_TEAM_RESPONSES } from '../utils/access';
import { validateTeamAccessCode } from '../supabase';
import { copyText } from '../utils/copyText';

// Het voorbeeldteam staat op de verhaalsite, niet in de app.
const EXAMPLE_URL = 'https://www.persona-tool.nl/demo';

export default function TeamGate({ count, loadFailed = false, accent, eyebrow, teamName, code }) {
    const copy = useCopy().teamDashboard.gate;
    const [showNames, setShowNames] = useState(false);
    const [status, setStatus] = useState(null); // null | 'ok' | 'failed'

    useEffect(() => {
        if (!code) return undefined;
        let cancelled = false;
        validateTeamAccessCode(code).then((row) => {
            if (!cancelled) setShowNames(row?.show_names === true);
        });
        return () => { cancelled = true; };
    }, [code]);

    async function handleCopy() {
        const ok = await copyText(copy.message({ team: teamName, code, showNames }));
        // Mislukt: zelfde plek als "Gekopieerd", iets langer in beeld omdat de
        // zin langer is (E1.4, 27 okt 2026).
        setStatus(ok ? 'ok' : 'failed');
        setTimeout(() => setStatus(null), ok ? 2000 : 4000);
    }

    const filled = Math.min(count, MIN_TEAM_RESPONSES);

    // Bij een mislukt ophalen weet de app niet of het team onder de vijf zit.
    // Een eigen kop is nog niet akkoord; tot die er is, de gewone kop.
    function headTitle() {
        if (loadFailed && copy.titleForLoadFailed) {
            return teamName ? copy.titleForLoadFailed : copy.titleLoadFailed;
        }
        return teamName ? copy.titleFor : copy.title;
    }

    return (
        <PageShell compact>
            <HeroBlock
                compact
                eyebrow={eyebrow}
                title={headTitle()}
                titleAccent={teamName || undefined}
                titleAccentColor={accent}
                lead={copy.body}
            />

            <SectionCard accent={accent}>
                {/* Ophalen lukte niet (E1.7): geen telling en geen vakjes, want
                    "0 van de vijf" zou lezen als een leeg team. Een stand,
                    geen alarm: role="status". */}
                {loadFailed ? (
                    <p role="status" style={{ ...TYPE.body, color: 'var(--tof-text)' }}>
                        {copy.loadFailed}
                    </p>
                ) : (
                    <>
                        <SectionEyebrow color={accent}>{copy.count(count)}</SectionEyebrow>
                        <div
                            aria-hidden="true"
                            style={{ display: 'flex', gap: 8, margin: '4px 0 0' }}
                        >
                            {Array.from({ length: MIN_TEAM_RESPONSES }, (_, i) => (
                                <span
                                    key={i}
                                    style={{
                                        width: 28,
                                        height: 28,
                                        borderRadius: 6,
                                        border: `1.5px solid ${accent}`,
                                        background: i < filled ? accent : 'transparent',
                                    }}
                                />
                            ))}
                        </div>
                    </>
                )}

                {/* Zonder code (oude toegang) valt er niets te delen. */}
                {code && teamName ? (
                    <div style={{ marginTop: 16, display: 'grid', gap: SPACING.md, justifyItems: 'start' }}>
                        <p style={{ ...TYPE.body, color: 'var(--tof-text)' }}>{copy.recipients}</p>
                        <div aria-live="polite">
                            <PrimaryButton onClick={handleCopy} style={{ background: accent }}>
                                {status === 'ok' ? copy.copied
                                    : status === 'failed' ? copy.copyFailed
                                    : copy.copyMessage}
                            </PrimaryButton>
                        </div>
                        <p style={TYPE.bodySmall}>{copy.return}</p>
                    </div>
                ) : null}

                <p style={TYPE.bodySmall}>
                    {copy.example.before}
                    <a
                        href={EXAMPLE_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: accent, fontWeight: 600, textDecoration: 'underline' }}
                    >
                        {copy.example.link}
                    </a>
                    {copy.example.after}
                </p>
            </SectionCard>
        </PageShell>
    );
}
