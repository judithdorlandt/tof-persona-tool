/**
 * TeamGate — wat er in plaats van het teambeeld staat als het team nog te
 * klein is.
 *
 * Eén blok voor Module 1 (TeamDashboard) en Module 2 (TeamDynamics), zodat de
 * uitleg in beide weergaven hetzelfde is. De drempel zelf staat in
 * `utils/access.js` (MIN_TEAM_RESPONSES + countCompleteProfiles).
 *
 * Geen foutmelding, geen waarschuwingsicoon, geen uitroepteken: dit is een
 * toelichting. De module-eigen accentkleur en eyebrow komen van de aanroeper,
 * zodat het scherm in de familie blijft waar de bezoeker zich al bevond.
 */

import React from 'react';
import { PageShell, HeroBlock, SectionCard, SectionEyebrow } from '../ui/AppShell';
import { TYPE } from '../ui/tokens';

export default function TeamGate({ copy, count, accent, eyebrow }) {
    return (
        <PageShell compact>
            <HeroBlock
                compact
                eyebrow={eyebrow}
                title={copy.title}
                titleAccentColor={accent}
                lead={copy.body}
            />

            <SectionCard accent={accent}>
                <SectionEyebrow color={accent}>{copy.count(count)}</SectionEyebrow>
                <p style={{ ...TYPE.body, margin: 0, color: 'var(--tof-text-soft)' }}>
                    {copy.hint}
                </p>
            </SectionCard>
        </PageShell>
    );
}
