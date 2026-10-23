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
import { MIN_TEAM_RESPONSES } from '../utils/access';
import { validateTeamAccessCode } from '../supabase';

// Kopiëren met een terugval: navigator.clipboard kan weigeren (geen https,
// oudere browser, geen toestemming). Dan via een tijdelijk tekstveld.
async function copyText(text) {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (_e) {
        try {
            const area = document.createElement('textarea');
            area.value = text;
            area.setAttribute('readonly', '');
            area.style.position = 'fixed';
            area.style.opacity = '0';
            document.body.appendChild(area);
            area.select();
            const ok = document.execCommand('copy');
            document.body.removeChild(area);
            return ok;
        } catch (_e2) {
            return false;
        }
    }
}

export default function TeamGate({ count, accent, eyebrow, teamName, code }) {
    const copy = useCopy().teamDashboard.gate;
    const [showNames, setShowNames] = useState(false);
    const [copied, setCopied] = useState(false);

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
        if (!ok) return;
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }

    const filled = Math.min(count, MIN_TEAM_RESPONSES);

    return (
        <PageShell compact>
            <HeroBlock
                compact
                eyebrow={eyebrow}
                title={teamName ? copy.titleFor : copy.title}
                titleAccent={teamName || undefined}
                titleAccentColor={accent}
                lead={copy.body}
            />

            <SectionCard accent={accent}>
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

                {/* Zonder code (oude toegang) valt er niets te delen. */}
                {code && teamName ? (
                    <div style={{ marginTop: 16 }} aria-live="polite">
                        <PrimaryButton onClick={handleCopy} style={{ background: accent }}>
                            {copied ? copy.copied : copy.copyMessage}
                        </PrimaryButton>
                    </div>
                ) : null}
            </SectionCard>
        </PageShell>
    );
}
