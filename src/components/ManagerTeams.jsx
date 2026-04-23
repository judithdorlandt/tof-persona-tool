import React, { useEffect, useState } from 'react';
import {
    getCurrentUser,
    getUserAccessibleTeams,
    getResponsesByTeam,
} from '../supabase';
import {
    PageShell,
    SectionCard,
    SecondaryButton,
    SectionEyebrow,
} from '../ui/AppShell';

export default function ManagerTeams({
    setPage,
    setTeamResponses,
    setSelectedTeam,
}) {
    const [loading, setLoading] = useState(true);
    const [teams, setTeams] = useState([]);
    const [user, setUser] = useState(null);
    const [openingTeam, setOpeningTeam] = useState(null);

    useEffect(() => {
        let active = true;

        const load = async () => {
            const currentUser = await getCurrentUser();

            if (!currentUser) {
                setPage('login');
                return;
            }

            const accessibleTeams = await getUserAccessibleTeams(currentUser.id);

            if (!active) return;

            setUser(currentUser);
            setTeams(accessibleTeams || []);
            setLoading(false);
        };

        load();

        return () => {
            active = false;
        };
    }, [setPage]);

    const openTeam = async (team) => {
        if (!team?.team) return;

        setOpeningTeam(`${team.organization}::${team.team}`);

        try {
            const responses = await getResponsesByTeam(team.team, team.organization);

            if (typeof setSelectedTeam === 'function') {
                setSelectedTeam({
                    team: team.team,
                    organization: team.organization,
                    code: null,
                });
            }

            if (typeof setTeamResponses === 'function') {
                setTeamResponses(responses || []);
            }

            setOpeningTeam(null);
            setPage('teamdashboard');
        } catch (err) {
            console.error('Open team error:', err);
            setOpeningTeam(null);
            window.alert('Het team kon niet worden geopend. Probeer het opnieuw.');
        }
    };

    const groupedByOrganization = teams.reduce((acc, item) => {
        const org = item.organization || 'Onbekende organisatie';
        if (!acc[org]) acc[org] = [];
        acc[org].push(item);
        return acc;
    }, {});

    const organizations = Object.keys(groupedByOrganization).sort();

    if (loading) {
        return (
            <PageShell padding="24px 20px 36px">
                <SectionCard padding={28}>
                    <SectionEyebrow>Teams laden</SectionEyebrow>
                    <p
                        style={{
                            margin: 0,
                            color: 'var(--tof-text-soft)',
                            lineHeight: 1.7,
                        }}
                    >
                        Een moment — we halen jouw teams op.
                    </p>
                </SectionCard>
            </PageShell>
        );
    }

    return (
        <PageShell padding="24px 20px 36px">
            <SectionCard padding={28}>
                <SectionEyebrow>Managerdashboard</SectionEyebrow>

                <h1
                    style={{
                        margin: 0,
                        fontFamily: 'var(--tof-font-heading)',
                        fontSize: 'clamp(30px, 4vw, 44px)',
                        lineHeight: 1.08,
                        color: 'var(--tof-text)',
                    }}
                >
                    Jouw teams in één overzicht.
                </h1>

                <p
                    style={{
                        margin: 0,
                        maxWidth: 640,
                        color: 'var(--tof-text-soft)',
                        lineHeight: 1.7,
                        fontSize: 15,
                    }}
                >
                    Kies een team om het dashboard te openen. Je kunt op elk moment terugkeren
                    naar dit overzicht om een ander team te bekijken.
                </p>

                {user?.email ? (
                    <div
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 8,
                            background: 'var(--tof-surface-soft, #F4EDE6)',
                            borderRadius: 999,
                            padding: '6px 12px',
                            fontSize: 12,
                            color: 'var(--tof-text-muted)',
                            width: 'fit-content',
                        }}
                    >
                        <span>Ingelogd als</span>
                        <strong style={{ color: 'var(--tof-text)', fontWeight: 600 }}>
                            {user.email}
                        </strong>
                    </div>
                ) : null}
            </SectionCard>

            {teams.length === 0 ? (
                <SectionCard padding={24} borderTopColor="var(--tof-accent-rose)">
                    <h3
                        style={{
                            margin: 0,
                            fontFamily: 'var(--tof-font-heading)',
                            fontSize: 22,
                            color: 'var(--tof-text)',
                        }}
                    >
                        Nog geen teams gekoppeld
                    </h3>

                    <p
                        style={{
                            margin: 0,
                            color: 'var(--tof-text-soft)',
                            lineHeight: 1.7,
                        }}
                    >
                        Je account heeft op dit moment geen gekoppelde teams. Neem contact op
                        met TOF om toegang te laten activeren.
                    </p>
                </SectionCard>
            ) : (
                <div style={{ display: 'grid', gap: 20 }}>
                    {organizations.map((org) => (
                        <div key={org} style={{ display: 'grid', gap: 10 }}>
                            <div
                                style={{
                                    fontSize: 11,
                                    textTransform: 'uppercase',
                                    letterSpacing: 1.6,
                                    color: 'var(--tof-text-muted)',
                                    fontWeight: 700,
                                }}
                            >
                                {org}
                            </div>

                            <div
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns:
                                        'repeat(auto-fill, minmax(240px, 1fr))',
                                    gap: 14,
                                }}
                            >
                                {groupedByOrganization[org].map((team) => {
                                    const key = `${team.organization}::${team.team}`;
                                    const isOpening = openingTeam === key;

                                    return (
                                        <button
                                            key={key}
                                            type="button"
                                            onClick={() => openTeam(team)}
                                            disabled={isOpening}
                                            style={{
                                                textAlign: 'left',
                                                background: 'var(--tof-surface)',
                                                border: '1px solid var(--tof-border)',
                                                borderRadius: 16,
                                                padding: '18px 20px',
                                                cursor: isOpening ? 'wait' : 'pointer',
                                                boxShadow: 'var(--tof-shadow)',
                                                display: 'grid',
                                                gap: 8,
                                                transition: 'all 0.2s ease',
                                                opacity: isOpening ? 0.7 : 1,
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.borderColor =
                                                    'var(--tof-accent-rose)';
                                                e.currentTarget.style.transform =
                                                    'translateY(-2px)';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.borderColor =
                                                    'var(--tof-border)';
                                                e.currentTarget.style.transform =
                                                    'translateY(0)';
                                            }}
                                        >
                                            <div
                                                style={{
                                                    fontSize: 10,
                                                    textTransform: 'uppercase',
                                                    letterSpacing: 1.4,
                                                    color: 'var(--tof-text-muted)',
                                                    fontWeight: 700,
                                                }}
                                            >
                                                {team.role || 'team'}
                                            </div>

                                            <div
                                                style={{
                                                    fontFamily: 'var(--tof-font-heading)',
                                                    fontSize: 22,
                                                    lineHeight: 1.15,
                                                    color: 'var(--tof-text)',
                                                }}
                                            >
                                                {team.team}
                                            </div>

                                            <div
                                                style={{
                                                    marginTop: 4,
                                                    fontSize: 13,
                                                    color: 'var(--tof-accent-rose)',
                                                    fontWeight: 600,
                                                }}
                                            >
                                                {isOpening ? 'Openen…' : 'Dashboard openen →'}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <SecondaryButton onClick={() => setPage('home')}>
                    Terug naar home
                </SecondaryButton>
            </div>
        </PageShell>
    );
}
