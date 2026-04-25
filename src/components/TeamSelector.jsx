import React, { useEffect, useMemo, useState } from 'react';
import { supabase } from '../supabase';
import {
    hasFullTeamAccess,
    getStoredTeamAccess,
    isMakerAccess,
} from '../utils/access';
import {
    PageShell,
    SectionCard,
    PrimaryButton,
    SecondaryButton,
    SectionEyebrow,
} from '../ui/AppShell';

export default function TeamSelector({
    setPage,
    setResultData,
    setTeamResponses,
    setSelectedTeam,
}) {
    const storedAccess = getStoredTeamAccess();
    const storedCode = storedAccess?.code || '';
    const storedTeam = storedAccess?.team || '';
    const storedOrganization = storedAccess?.organization || '';

    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openingDashboard, setOpeningDashboard] = useState(false);
    const [selectionMode, setSelectionMode] = useState(storedCode ? 'invite' : 'team');
    const [selectedOrg, setSelectedOrg] = useState(storedOrganization || '');
    const [selectedTeams, setSelectedTeams] = useState(storedTeam ? [storedTeam] : []);
    const [selectedInviteCode, setSelectedInviteCode] = useState(storedCode || '');
    const [errorMessage, setErrorMessage] = useState('');

    const activeInviteCode = storedCode || selectedInviteCode;
    const makerMode = isMakerAccess();

    useEffect(() => {
        async function loadTeams() {
            if (!supabase) {
                setErrorMessage('Supabase is niet beschikbaar.');
                setLoading(false);
                return;
            }

            setLoading(true);
            setErrorMessage('');

            const { data, error } = await supabase
                .schema('private').from('responses')
                .select(
                    'name, organization, department, team, invite_code, role, team_size, primary_archetype, secondary_archetype, tertiary_archetype, full_scores, created_at'
                )
                .order('organization', { ascending: true })
                .order('department', { ascending: true })
                .order('team', { ascending: true })
                .order('invite_code', { ascending: true });

            if (error) {
                console.error(error);
                setErrorMessage('Er ging iets mis bij het ophalen van teams.');
                setLoading(false);
                return;
            }

            const cleaned = (data || []).map((row) => ({
                ...row,
                name: String(row?.name || '').trim(),
                organization: String(row?.organization || '').trim(),
                department: String(row?.department || '').trim(),
                team: String(row?.team || '').trim(),
                invite_code: String(row?.invite_code || '').trim(),
                role: String(row?.role || '').trim(),
                team_size: String(row?.team_size || '').trim(),
            }));

            setRows(cleaned);
            setLoading(false);
        }

        loadTeams();
    }, []);

    const organizations = useMemo(() => {
        return [...new Set(rows.map((row) => row.organization).filter(Boolean))].sort();
    }, [rows]);

    const teamOptions = useMemo(() => {
        const filteredRows = rows.filter((row) => {
            if (!selectedOrg) return true;
            return row.organization === selectedOrg;
        });

        const withTeam = filteredRows.filter((row) => row.team);
        const grouped = new Map();

        withTeam.forEach((row) => {
            const teamKey = row.team;
            const dept = row.department || '';
            const team = row.team || '';

            const isSameAsDepartment =
                dept && team && dept.toLowerCase() === team.toLowerCase();

            const label = isSameAsDepartment
                ? `Afdeling: ${dept}`
                : dept
                    ? `Afdeling: ${dept} — Team: ${team}`
                    : `Team: ${team}`;

            if (!grouped.has(teamKey)) {
                grouped.set(teamKey, {
                    value: teamKey,
                    label,
                    department: dept || null,
                    organization: row.organization || null,
                    count: 0,
                });
            }

            grouped.get(teamKey).count += 1;
        });

        return [...grouped.values()].sort((a, b) =>
            a.label.localeCompare(b.label, 'nl')
        );
    }, [rows, selectedOrg]);

    const inviteCodeOptions = useMemo(() => {
        if (storedCode) {
            const filteredRows = rows.filter(
                (row) =>
                    row.invite_code &&
                    String(row.invite_code).trim() === String(storedCode).trim()
            );

            return [
                {
                    value: storedCode,
                    label: `Invite code: ${storedCode}`,
                    count: filteredRows.length,
                },
            ];
        }

        const filteredRows = rows.filter((row) => row.invite_code);
        const grouped = new Map();

        filteredRows.forEach((row) => {
            const code = String(row.invite_code || '').trim();
            if (!code) return;

            const org = row.organization || '';
            const dept = row.department || '';

            let label = code;

            if (org && dept) {
                label = `${code} — ${org} / ${dept}`;
            } else if (org) {
                label = `${code} — ${org}`;
            }

            if (!grouped.has(code)) {
                grouped.set(code, {
                    value: code,
                    label,
                    count: 0,
                });
            }

            grouped.get(code).count += 1;
        });

        return [...grouped.values()].sort((a, b) =>
            a.label.localeCompare(b.label, 'nl')
        );
    }, [rows, storedCode]);

    const storedCodeTeamOptions = useMemo(() => {
        if (!activeInviteCode) return [];

        const filteredRows = rows.filter(
            (row) =>
                row.invite_code &&
                String(row.invite_code).trim() === String(activeInviteCode).trim()
        );

        const grouped = new Map();

        filteredRows.forEach((row) => {
            const teamKey = String(row.team || '').trim();
            if (!teamKey) return;

            const dept = row.department || '';
            const isSameAsDepartment =
                dept && teamKey && dept.toLowerCase() === teamKey.toLowerCase();

            const label = isSameAsDepartment
                ? `Afdeling: ${dept}`
                : dept
                    ? `Afdeling: ${dept} — Team: ${teamKey}`
                    : `Team: ${teamKey}`;

            if (!grouped.has(teamKey)) {
                grouped.set(teamKey, {
                    value: teamKey,
                    label,
                    count: 0,
                });
            }

            grouped.get(teamKey).count += 1;
        });

        return [...grouped.values()].sort((a, b) =>
            a.label.localeCompare(b.label, 'nl')
        );
    }, [rows, activeInviteCode]);

    const selectedInviteMeta = inviteCodeOptions.find(
        (item) => item.value === activeInviteCode
    );

    useEffect(() => {
        setSelectedTeams([]);
    }, [selectedOrg]);

    useEffect(() => {
        if (selectionMode === 'team') {
            setSelectedInviteCode('');
        } else {
            setSelectedTeams(storedTeam ? [storedTeam] : []);
            setSelectedOrg(storedOrganization || '');
            if (storedCode) {
                setSelectedInviteCode(storedCode);
            }
        }
    }, [selectionMode, storedCode, storedTeam, storedOrganization]);

    function toggleTeam(teamValue) {
        setSelectedTeams((prev) =>
            prev.includes(teamValue)
                ? prev.filter((item) => item !== teamValue)
                : [...prev, teamValue]
        );
    }

    function handleSelectAllTeams() {
        const allValues = teamOptions.map((item) => item.value);

        if (selectedTeams.length === allValues.length) {
            setSelectedTeams([]);
        } else {
            setSelectedTeams(allValues);
        }
    }

    function reliabilityLabel(count) {
        if (count < 3) return 'Lage betrouwbaarheid';
        if (count < 6) return 'Basis inzicht';
        return 'Sterk beeld';
    }

    function buildTeamResultData(members, meta = {}) {
        const memberCount = members.length;
        const teamScores = {};

        members.forEach((row) => {
            if (row.primary_archetype) {
                teamScores[row.primary_archetype] =
                    (teamScores[row.primary_archetype] || 0) + 2;
            }

            if (row.secondary_archetype) {
                teamScores[row.secondary_archetype] =
                    (teamScores[row.secondary_archetype] || 0) + 1;
            }

            if (row.tertiary_archetype) {
                teamScores[row.tertiary_archetype] =
                    (teamScores[row.tertiary_archetype] || 0) + 0.5;
            }
        });

        return {
            name: meta.name || '',
            organization: meta.organization || '',
            team_names: meta.team_names || [],
            team_labels: meta.team_labels || [],
            invite_code: meta.invite_code || '',
            scores: teamScores,
            members,
            member_count: memberCount,
            source: meta.source || 'supabase_team',
        };
    }

    async function handleOpenDashboard() {
        if (!supabase) {
            setErrorMessage('Supabase is niet beschikbaar.');
            return;
        }

        setOpeningDashboard(true);
        setErrorMessage('');

        if (selectionMode === 'team') {
            if (selectedTeams.length === 0) {
                setErrorMessage('Kies minstens één team of afdeling.');
                setOpeningDashboard(false);
                return;
            }

            let query = supabase
                .schema('private').from('responses')
                .select(
                    'name, organization, department, team, invite_code, role, team_size, primary_archetype, secondary_archetype, tertiary_archetype, full_scores, created_at'
                )
                .in('team', selectedTeams)
                .order('created_at', { ascending: true });

            if (selectedOrg) {
                query = query.eq('organization', selectedOrg);
            }

            const { data, error } = await query;

            if (error) {
                console.error(error);
                setErrorMessage('Het teamdashboard kon niet worden opgebouwd.');
                setOpeningDashboard(false);
                return;
            }

            const members = data || [];
            const selectedLabels = teamOptions
                .filter((item) => selectedTeams.includes(item.value))
                .map((item) => item.label);

            if (typeof setTeamResponses === 'function') {
                setTeamResponses(members);
            }

            if (typeof setSelectedTeam === 'function') {
                setSelectedTeam({
                    team: selectedTeams.length === 1 ? selectedTeams[0] : selectedLabels.join(', '),
                    organization: selectedOrg || members[0]?.organization || '',
                    code: '',
                });
            }

            if (typeof setResultData === 'function') {
                const result = buildTeamResultData(members, {
                    name: selectedLabels.join(', '),
                    organization: selectedOrg || '',
                    team_names: selectedTeams,
                    team_labels: selectedLabels,
                    source: 'supabase_team',
                });
                setResultData(result);
            }

            setOpeningDashboard(false);
            setPage('teamdashboard');
            return;
        }

        if (!activeInviteCode) {
            setErrorMessage('Kies een invite code.');
            setOpeningDashboard(false);
            return;
        }

        let inviteQuery = supabase
            .schema('private').from('responses')
            .select(
                'name, organization, department, team, invite_code, role, team_size, primary_archetype, secondary_archetype, tertiary_archetype, full_scores, created_at'
            )
            .eq('invite_code', activeInviteCode)
            .order('created_at', { ascending: true });

        if (selectedTeams.length === 1) {
            inviteQuery = inviteQuery.eq('team', selectedTeams[0]);
        }

        const { data, error } = await inviteQuery;

        if (error) {
            console.error(error);
            setErrorMessage('Het dashboard op basis van invite code kon niet worden opgebouwd.');
            setOpeningDashboard(false);
            return;
        }

        const members = data || [];
        const firstOrg = members[0]?.organization || '';

        if (typeof setTeamResponses === 'function') {
            setTeamResponses(members);
        }

        if (typeof setSelectedTeam === 'function') {
            setSelectedTeam({
                team: selectedTeams.length === 1 ? selectedTeams[0] : 'Afdeling totaal',
                organization: firstOrg,
                code: activeInviteCode,
            });
        }

        if (typeof setResultData === 'function') {
            const result = buildTeamResultData(members, {
                name:
                    selectedTeams.length === 1
                        ? `Team: ${selectedTeams[0]}`
                        : 'Afdeling totaal',
                organization: firstOrg,
                invite_code: activeInviteCode,
                team_names: selectedTeams,
                team_labels: selectedTeams,
                source: 'supabase_invite_code',
            });
            setResultData(result);
        }

        setOpeningDashboard(false);
        setPage('teamdashboard');
    }

    if (!hasFullTeamAccess() && !makerMode) {
        return (
            <PageShell padding="20px 16px 32px">
                <SectionCard padding={28}>
                    <div style={{ display: 'grid', gap: 16 }}>
                        <SectionEyebrow>Team selector</SectionEyebrow>

                        <h1
                            style={{
                                margin: 0,
                                fontFamily: 'var(--tof-font-heading)',
                                fontSize: 'clamp(32px, 4.8vw, 48px)',
                                lineHeight: 1.04,
                                color: 'var(--tof-text)',
                            }}
                        >
                            🔒 Toegang vereist
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
                            Deze omgeving is alleen beschikbaar met een geldige toegangscode.
                        </p>

                        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                            <PrimaryButton onClick={() => setPage('team')}>
                                Terug naar uitleg
                            </PrimaryButton>
                        </div>
                    </div>
                </SectionCard>
            </PageShell>
        );
    }

    return (
        <PageShell padding="20px 16px 32px">
            <SectionCard padding={24}>
                <div style={{ display: 'grid', gap: 14 }}>
                    <SectionEyebrow>Team selector</SectionEyebrow>

                    <h1
                        style={{
                            margin: 0,
                            fontFamily: 'var(--tof-font-heading)',
                            fontSize: 'clamp(32px, 4.8vw, 48px)',
                            lineHeight: 1.04,
                            color: 'var(--tof-text)',
                        }}
                    >
                        Kies hoe je wilt selecteren
                        <br />
                        <span style={{ color: 'var(--tof-accent-rose)', fontStyle: 'italic' }}>
                            en open het dashboard.
                        </span>
                    </h1>

                    <p
                        style={{
                            margin: 0,
                            maxWidth: 680,
                            color: 'var(--tof-text-soft)',
                            lineHeight: 1.7,
                            fontSize: 15,
                        }}
                    >
                        Je kunt een dashboard openen op basis van teams en afdelingen binnen een
                        organisatie, of direct op basis van een invite code.
                    </p>

                    {makerMode ? (
                        <div
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 8,
                                background: 'var(--tof-rose-soft)',
                                border: '1px solid rgba(176,82,82,0.12)',
                                borderRadius: 999,
                                padding: '8px 14px',
                                fontSize: 12,
                                color: 'var(--tof-text-muted)',
                                width: 'fit-content',
                            }}
                        >
                            <span>🛠</span>
                            <span>Maker mode actief</span>
                        </div>
                    ) : null}
                </div>

                {loading ? (
                    <div
                        style={{
                            marginTop: 20,
                            padding: '16px 0 4px',
                            color: 'var(--tof-text-soft)',
                            fontSize: 15,
                        }}
                    >
                        Teams laden…
                    </div>
                ) : (
                    <>
                        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 8 }}>
                            <ModeButton
                                active={selectionMode === 'team'}
                                onClick={() => setSelectionMode('team')}
                            >
                                Organisatie + team
                            </ModeButton>

                            <ModeButton
                                active={selectionMode === 'invite'}
                                onClick={() => setSelectionMode('invite')}
                            >
                                Invite code
                            </ModeButton>
                        </div>

                        {selectionMode === 'team' && (
                            <div
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                                    gap: 16,
                                    marginTop: 16,
                                }}
                            >
                                <div style={{ display: 'grid', gap: 8 }}>
                                    <label style={{ fontSize: 13, color: 'var(--tof-text-muted)' }}>
                                        Organisatie
                                    </label>

                                    <select
                                        value={selectedOrg}
                                        onChange={(e) => setSelectedOrg(e.target.value)}
                                        style={selectStyle}
                                    >
                                        <option value="">Alle organisaties</option>
                                        {organizations.map((org) => (
                                            <option key={org} value={org}>
                                                {org}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div style={{ display: 'grid', gap: 10 }}>
                                    <label style={{ fontSize: 13, color: 'var(--tof-text-muted)' }}>
                                        Teams / afdelingen
                                    </label>

                                    <div
                                        style={{
                                            border: '1px solid var(--tof-border)',
                                            borderRadius: 12,
                                            background: 'white',
                                            padding: 12,
                                            display: 'grid',
                                            gap: 10,
                                            maxHeight: 260,
                                            overflowY: 'auto',
                                        }}
                                    >
                                        {teamOptions.length > 0 && (
                                            <label
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 10,
                                                    fontSize: 14,
                                                    color: 'var(--tof-text)',
                                                    cursor: 'pointer',
                                                    paddingBottom: 8,
                                                    borderBottom: '1px solid var(--tof-border)',
                                                }}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={
                                                        selectedTeams.length === teamOptions.length &&
                                                        teamOptions.length > 0
                                                    }
                                                    onChange={handleSelectAllTeams}
                                                />
                                                <span>Alles selecteren</span>
                                            </label>
                                        )}

                                        {teamOptions.length === 0 ? (
                                            <div style={{ fontSize: 14, color: 'var(--tof-text-muted)' }}>
                                                Kies eerst een organisatie of zorg dat er teams beschikbaar zijn.
                                            </div>
                                        ) : (
                                            teamOptions.map((item) => {
                                                const checked = selectedTeams.includes(item.value);

                                                return (
                                                    <label
                                                        key={item.value}
                                                        style={{
                                                            display: 'flex',
                                                            alignItems: 'flex-start',
                                                            justifyContent: 'space-between',
                                                            gap: 12,
                                                            fontSize: 14,
                                                            color: 'var(--tof-text)',
                                                            cursor: 'pointer',
                                                            lineHeight: 1.45,
                                                        }}
                                                    >
                                                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                                                            <input
                                                                type="checkbox"
                                                                checked={checked}
                                                                onChange={() => toggleTeam(item.value)}
                                                                style={{ marginTop: 2 }}
                                                            />
                                                            <div style={{ display: 'grid', gap: 4 }}>
                                                                <span>{item.label}</span>
                                                                <span
                                                                    style={{
                                                                        fontSize: 12,
                                                                        color: 'var(--tof-text-muted)',
                                                                    }}
                                                                >
                                                                    {reliabilityLabel(item.count)}
                                                                </span>
                                                            </div>
                                                        </div>

                                                        <span
                                                            style={{
                                                                flexShrink: 0,
                                                                fontSize: 12,
                                                                color: 'var(--tof-text-muted)',
                                                                background: 'var(--tof-surface-soft)',
                                                                borderRadius: 999,
                                                                padding: '4px 8px',
                                                            }}
                                                        >
                                                            {item.count}
                                                        </span>
                                                    </label>
                                                );
                                            })
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {selectionMode === 'invite' && (
                            <div
                                style={{
                                    display: 'grid',
                                    gap: 16,
                                    marginTop: 16,
                                }}
                            >
                                {!storedCode && (
                                    <div style={{ display: 'grid', gap: 8 }}>
                                        <label style={{ fontSize: 13, color: 'var(--tof-text-muted)' }}>
                                            Invite code
                                        </label>

                                        <select
                                            value={selectedInviteCode}
                                            onChange={(e) => setSelectedInviteCode(e.target.value)}
                                            style={selectStyle}
                                        >
                                            <option value="">Kies een invite code</option>
                                            {inviteCodeOptions.map((item) => (
                                                <option key={item.value} value={item.value}>
                                                    {item.label} ({item.count})
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                {(storedCode || selectedInviteCode) && (
                                    <>
                                        <div
                                            style={{
                                                background: 'var(--tof-surface-soft)',
                                                borderRadius: 12,
                                                padding: '12px 14px',
                                                fontSize: 14,
                                                color: 'var(--tof-text-soft)',
                                            }}
                                        >
                                            Je bent ingelogd met invite code{' '}
                                            <strong style={{ color: 'var(--tof-text)' }}>
                                                {activeInviteCode}
                                            </strong>
                                            . Kies hieronder of je het totaalbeeld van de afdeling wilt zien of één team apart.
                                        </div>

                                        <div style={{ display: 'grid', gap: 10 }}>
                                            <label style={{ fontSize: 13, color: 'var(--tof-text-muted)' }}>
                                                Kies niveau
                                            </label>

                                            <div style={{ display: 'grid', gap: 10 }}>
                                                <label
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'flex-start',
                                                        justifyContent: 'space-between',
                                                        gap: 12,
                                                        fontSize: 14,
                                                        color: 'var(--tof-text)',
                                                        cursor: 'pointer',
                                                        lineHeight: 1.45,
                                                        border: '1px solid var(--tof-border)',
                                                        borderRadius: 12,
                                                        background: selectedTeams.length === 0 ? '#FCF1F1' : 'white',
                                                        padding: '12px 14px',
                                                    }}
                                                >
                                                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                                                        <input
                                                            type="radio"
                                                            name="invite_scope"
                                                            checked={selectedTeams.length === 0}
                                                            onChange={() => setSelectedTeams([])}
                                                            style={{ marginTop: 2 }}
                                                        />
                                                        <div style={{ display: 'grid', gap: 4 }}>
                                                            <span style={{ fontWeight: 600 }}>Afdeling totaal</span>
                                                            <span style={{ fontSize: 12, color: 'var(--tof-text-muted)' }}>
                                                                Alle responses binnen deze invite code samen
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <span
                                                        style={{
                                                            flexShrink: 0,
                                                            fontSize: 12,
                                                            color: 'var(--tof-text-muted)',
                                                            background: 'white',
                                                            borderRadius: 999,
                                                            padding: '4px 8px',
                                                            border: '1px solid var(--tof-border)',
                                                        }}
                                                    >
                                                        {
                                                            rows.filter(
                                                                (row) =>
                                                                    row.invite_code &&
                                                                    row.invite_code === activeInviteCode
                                                            ).length
                                                        }
                                                    </span>
                                                </label>

                                                {storedCodeTeamOptions.map((item) => {
                                                    const checked =
                                                        selectedTeams.length === 1 && selectedTeams.includes(item.value);

                                                    return (
                                                        <label
                                                            key={item.value}
                                                            style={{
                                                                display: 'flex',
                                                                alignItems: 'flex-start',
                                                                justifyContent: 'space-between',
                                                                gap: 12,
                                                                fontSize: 14,
                                                                color: 'var(--tof-text)',
                                                                cursor: 'pointer',
                                                                lineHeight: 1.45,
                                                                border: '1px solid var(--tof-border)',
                                                                borderRadius: 12,
                                                                background: checked ? '#FCF1F1' : 'white',
                                                                padding: '12px 14px',
                                                            }}
                                                        >
                                                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                                                                <input
                                                                    type="radio"
                                                                    name="invite_scope"
                                                                    checked={checked}
                                                                    onChange={() => setSelectedTeams([item.value])}
                                                                    style={{ marginTop: 2 }}
                                                                />
                                                                <div style={{ display: 'grid', gap: 4 }}>
                                                                    <span style={{ fontWeight: 600 }}>{item.label}</span>
                                                                    <span style={{ fontSize: 12, color: 'var(--tof-text-muted)' }}>
                                                                        {reliabilityLabel(item.count)}
                                                                    </span>
                                                                </div>
                                                            </div>

                                                            <span
                                                                style={{
                                                                    flexShrink: 0,
                                                                    fontSize: 12,
                                                                    color: 'var(--tof-text-muted)',
                                                                    background: 'var(--tof-surface-soft)',
                                                                    borderRadius: 999,
                                                                    padding: '4px 8px',
                                                                }}
                                                            >
                                                                {item.count}
                                                            </span>
                                                        </label>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        )}

                        {selectionMode === 'team' && selectedTeams.length > 0 && (
                            <div
                                style={{
                                    marginTop: 12,
                                    background: 'var(--tof-surface-soft)',
                                    borderRadius: 12,
                                    padding: '12px 14px',
                                    fontSize: 14,
                                    color: 'var(--tof-text-soft)',
                                }}
                            >
                                Je hebt nu{' '}
                                <strong style={{ color: 'var(--tof-text)' }}>
                                    {selectedTeams.length}
                                </strong>{' '}
                                groep(en) geselecteerd.
                            </div>
                        )}

                        {selectionMode === 'invite' && activeInviteCode && (
                            <div
                                style={{
                                    marginTop: 12,
                                    background: 'var(--tof-surface-soft)',
                                    borderRadius: 12,
                                    padding: '12px 14px',
                                    fontSize: 14,
                                    color: 'var(--tof-text-soft)',
                                }}
                            >
                                Je bekijkt nu invite code{' '}
                                <strong style={{ color: 'var(--tof-text)' }}>
                                    {activeInviteCode}
                                </strong>
                                {selectedTeams.length === 1 ? (
                                    <>
                                        {' '}op teamniveau:{' '}
                                        <strong style={{ color: 'var(--tof-text)' }}>{selectedTeams[0]}</strong>
                                    </>
                                ) : (
                                    <>
                                        {' '}op <strong style={{ color: 'var(--tof-text)' }}>afdelingsniveau</strong>
                                    </>
                                )}
                                {selectedInviteMeta ? (
                                    <>
                                        {' '}met{' '}
                                        <strong style={{ color: 'var(--tof-text)' }}>
                                            {selectedInviteMeta.count}
                                        </strong>{' '}
                                        response(s).
                                    </>
                                ) : null}
                            </div>
                        )}

                        {errorMessage ? (
                            <div
                                style={{
                                    marginTop: 12,
                                    background: 'var(--tof-rose-soft)',
                                    borderRadius: 12,
                                    padding: '12px 14px',
                                    fontSize: 14,
                                    color: 'var(--tof-text)',
                                }}
                            >
                                {errorMessage}
                            </div>
                        ) : null}

                        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 12 }}>
                            <PrimaryButton onClick={handleOpenDashboard}>
                                {openingDashboard ? 'Bezig…' : 'Bekijk teamdashboard'}
                            </PrimaryButton>

                            <SecondaryButton onClick={() => setPage('team')}>
                                Terug
                            </SecondaryButton>
                        </div>
                    </>
                )}
            </SectionCard>
        </PageShell>
    );
}

function ModeButton({ active, onClick, children }) {
    return (
        <button
            type="button"
            onClick={onClick}
            style={{
                padding: '10px 14px',
                borderRadius: 10,
                border: active ? '2px solid #B05252' : '1px solid var(--tof-border)',
                background: active ? '#FCF1F1' : 'white',
                color: 'var(--tof-text)',
                cursor: 'pointer',
                fontSize: 14,
                fontWeight: 600,
                transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
                if (!active) e.currentTarget.style.background = '#F9F6F3';
            }}
            onMouseLeave={(e) => {
                if (!active) e.currentTarget.style.background = 'white';
            }}
        >
            {children}
        </button>
    );
}

const selectStyle = {
    width: '100%',
    padding: '12px 14px',
    borderRadius: 10,
    border: '1px solid var(--tof-border)',
    background: 'white',
    fontSize: 14,
    color: 'var(--tof-text)',
    outline: 'none',
    transition: 'border 0.2s ease',
};