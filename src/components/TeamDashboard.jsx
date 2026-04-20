import React, { useMemo } from 'react';
import {
    PageShell,
    SectionCard,
} from '../ui/AppShell';

import TeamHeader from '../team/components/TeamHeader';
import TeamStatsCards from '../team/components/TeamStatsCards';
import TeamPersonaDistribution from '../team/components/TeamPersonaDistribution';
import TeamWorkplaceNeeds from '../team/components/TeamWorkplaceNeeds';
import TeamDynamicsHighlights from '../team/components/TeamDynamicsHighlights';
import TeamQuickWins from '../team/components/TeamQuickWins';
import TeamMembersTable from '../team/components/TeamMembersTable';

import { buildTeamAggregate } from '../team/utils/teamAggregation';
import { buildTeamInsights } from '../team/utils/teamInsights';

export default function TeamDashboard({ teamResponses = [], selectedTeam, setPage }) {

    const aggregate = useMemo(() => buildTeamAggregate(teamResponses), [teamResponses]);
    const insights = useMemo(() => buildTeamInsights(aggregate), [aggregate]);

    const handleAccessSubmit = () => {
        const cleanedInput = accessInput.trim();

        console.log('INPUT:', cleanedInput);

        if (cleanedInput.toLowerCase() === '1980!t03g4ngpersona'.toLowerCase())
            if (cleanedInput === '1980!T03g4ngPERSONA') {
                setShowAccessModal(false);
                setAccessInput('');
                setPage('teamselector');
            } else {
                console.log('VERGELIJKING MISLUKT');
                window.alert('Onjuiste toegangscode');
            }
    };

    return (
        <PageShell padding="24px 20px 36px">
            <div
                style={{
                    display: 'grid',
                    gap: 28,
                    animation: 'tofFadeIn 0.5s ease',
                }}
            >
                {/* HEADER */}
                <TeamHeader
                    selectedTeam={selectedTeam}
                    teamCount={aggregate.teamCount}
                    setPage={setPage}
                />

                {/* STATS */}
                <TeamStatsCards aggregate={aggregate} />

                <div style={{ display: 'grid', gap: 6 }}>
                    <div style={{
                        fontSize: 11,
                        textTransform: 'uppercase',
                        letterSpacing: 1.6,
                        color: 'var(--tof-text-muted)',
                        fontWeight: 700,
                    }}>
                        Teamanalyse
                    </div>

                    <h2 style={{
                        margin: 0,
                        fontFamily: 'var(--tof-font-heading)',
                        fontSize: 28,
                        lineHeight: 1.08,
                        color: 'var(--tof-text)',
                    }}>
                        Inzicht in hoe dit team werkt
                    </h2>
                </div>

                {/* PERSONA DISTRIBUTION — ROSE */}
                <SectionCard
                    padding={26}
                    background="var(--tof-surface)"
                    borderTopColor="var(--tof-accent-rose)"
                >
                    <TeamPersonaDistribution aggregate={aggregate} />
                </SectionCard>

                {/* WORKPLACE NEEDS — SAGE */}
                <SectionCard
                    padding={26}
                    background="var(--tof-surface)"
                    borderTopColor="var(--tof-accent-sage)"
                >
                    <TeamWorkplaceNeeds aggregate={aggregate} />
                </SectionCard>

                {/* DYNAMICS — NEUTRAAL (TEXT) */}
                <SectionCard
                    padding={26}
                    background="var(--tof-surface)"
                    borderTopColor="var(--tof-text)"
                >
                    <TeamDynamicsHighlights insights={insights} />
                </SectionCard>

                {/* QUICK WINS — ROSE (actie) */}
                <SectionCard
                    padding={26}
                    background="var(--tof-surface-soft)"
                    borderTopColor="var(--tof-accent-rose)"
                >
                    <TeamQuickWins insights={insights} />
                </SectionCard>

                {/* MEMBERS — SAGE (rust / overzicht) */}
                <SectionCard
                    padding={26}
                    background="var(--tof-surface)"
                    borderTopColor="var(--tof-accent-sage)"
                >
                    <TeamMembersTable teamResponses={teamResponses} />
                </SectionCard>

            </div>
        </PageShell>
    );
}