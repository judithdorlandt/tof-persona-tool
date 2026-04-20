/**
 * TeamSelector.jsx — Team & afdeling kiezen
 *
 * Toegangslogica:
 *   - Normale gebruikers zien alleen hun eigen organisatie (uit storedAccess)
 *   - Admin (code P3rs0n4_ADMIN!) ziet alle organisaties
 *   - Maker mode heeft altijd volledige toegang
 */

import React, { useEffect, useMemo, useState } from 'react';
import { supabase } from '../supabase';
import {
    hasFullTeamAccess,
    getStoredTeamAccess,
    isMakerAccess,
    isAdminAccess,
    checkAndGrantAdminAccess,
} from '../utils/access';
import {
    PageShell,
    PrimaryButton,
    SecondaryButton,
    SectionEyebrow,
} from '../ui/AppShell';

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function reliabilityInfo(count) {
    if (count < 3) return { label: 'Eerste signalen', color: '#C7A24A', pct: 20 };
    if (count < 6) return { label: 'Opkomend patroon', color: '#C28D6B', pct: 50 };
    if (count <= 15) return { label: 'Betrouwbaar beeld', color: '#7F9A8A', pct: 80 };
    return { label: 'Sterk patroon', color: '#6E8872', pct: 100 };
}

// ─── HOOFDCOMPONENT ──────────────────────────────────────────────────────────

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

    // ── Toegangsniveau bepalen ────────────────────────────────────────────────
    const makerMode = isMakerAccess();
    const [adminMode, setAdminMode] = useState(isAdminAccess());
    const [adminInput, setAdminInput] = useState('');
    const [adminError, setAdminError] = useState('');
    const [showAdminField, setShowAdminField] = useState(false);

    // Mag de gebruiker alle organisaties zien?
    const canSeeAllOrgs = makerMode || adminMode;

    // Eigen organisatie (voor niet-admins)
    const ownOrg = storedOrganization || '';

    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openingDashboard, setOpeningDashboard] = useState(false);
    const [selectionMode, setSelectionMode] = useState(storedCode ? 'invite' : 'team');
    // Admins beginnen zonder org-filter, anderen vast op eigen org
    const [selectedOrg, setSelectedOrg] = useState(canSeeAllOrgs ? '' : ownOrg);
    const [selectedTeams, setSelectedTeams] = useState(storedTeam ? [storedTeam] : []);
    const [selectedInviteCode, setSelectedInviteCode] = useState(storedCode || '');
    const [errorMessage, setErrorMessage] = useState('');
    const [openDepts, setOpenDepts] = useState({});

    const activeInviteCode = storedCode || selectedInviteCode;

    // ── Admin code invoeren ───────────────────────────────────────────────────
    function handleAdminSubmit() {
        const ok = checkAndGrantAdminAccess(adminInput);
        if (ok) {
            setAdminMode(true);
            setSelectedOrg('');       // ontgrendel alle organisaties
            setShowAdminField(false);
            setAdminInput('');
            setAdminError('');
        } else {
            setAdminError('Onjuiste beheerderscode.');
        }
    }

    // ── Data laden ────────────────────────────────────────────────────────────
    useEffect(() => {
        async function loadTeams() {
            if (!supabase) { setErrorMessage('Supabase is niet beschikbaar.'); setLoading(false); return; }
            setLoading(true);
            setErrorMessage('');

            let query = supabase
                .from('responses')
                .select('name, organization, department, team, invite_code, role, team_size, primary_archetype, secondary_archetype, tertiary_archetype, full_scores, created_at')
                .order('organization', { ascending: true })
                .order('department', { ascending: true })
                .order('team', { ascending: true })
                .order('invite_code', { ascending: true });

            // Niet-admins krijgen alleen hun eigen organisatie terug uit de DB
            if (!canSeeAllOrgs && ownOrg) {
                query = query.eq('organization', ownOrg);
            }

            const { data, error } = await query;
            if (error) { console.error(error); setErrorMessage('Er ging iets mis bij het ophalen van teams.'); setLoading(false); return; }

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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [adminMode]); // herlaad als adminMode wijzigt

    // ── Opties bouwen ─────────────────────────────────────────────────────────

    const organizations = useMemo(() =>
        [...new Set(rows.map((r) => r.organization).filter(Boolean))].sort()
        , [rows]);

    const departmentGroups = useMemo(() => {
        const filtered = rows.filter((r) => {
            if (!r.team) return false;
            if (selectedOrg && r.organization !== selectedOrg) return false;
            return true;
        });

        const deptMap = new Map();
        filtered.forEach((row) => {
            const dept = row.department || '—';
            const team = row.team;
            const isSame = dept && team && dept.toLowerCase() === team.toLowerCase();
            const label = isSame ? dept : team;

            if (!deptMap.has(dept)) deptMap.set(dept, new Map());
            const teamMap = deptMap.get(dept);
            if (!teamMap.has(team)) {
                teamMap.set(team, { value: team, label, department: dept, organization: row.organization || '', count: 0 });
            }
            teamMap.get(team).count += 1;
        });

        return [...deptMap.entries()]
            .map(([dept, teamMap]) => ({
                dept,
                teams: [...teamMap.values()].sort((a, b) => a.label.localeCompare(b.label, 'nl')),
                totalCount: [...teamMap.values()].reduce((s, t) => s + t.count, 0),
            }))
            .sort((a, b) => a.dept.localeCompare(b.dept, 'nl'));
    }, [rows, selectedOrg]);

    const teamOptions = useMemo(() =>
        departmentGroups.flatMap((dg) => dg.teams)
        , [departmentGroups]);

    const inviteCodeOptions = useMemo(() => {
        if (storedCode) {
            const count = rows.filter((r) => String(r.invite_code).trim() === String(storedCode).trim()).length;
            return [{ value: storedCode, label: `Code: ${storedCode}`, count }];
        }
        const grouped = new Map();
        rows.filter((r) => r.invite_code).forEach((row) => {
            const code = String(row.invite_code).trim();
            if (!code) return;
            const org = row.organization || '';
            const dept = row.department || '';
            const label = org && dept ? `${code} — ${org} / ${dept}` : org ? `${code} — ${org}` : code;
            if (!grouped.has(code)) grouped.set(code, { value: code, label, count: 0 });
            grouped.get(code).count += 1;
        });
        return [...grouped.values()].sort((a, b) => a.label.localeCompare(b.label, 'nl'));
    }, [rows, storedCode]);

    const storedCodeTeamOptions = useMemo(() => {
        if (!activeInviteCode) return [];
        const filtered = rows.filter((r) => r.invite_code && String(r.invite_code).trim() === String(activeInviteCode).trim());
        const grouped = new Map();
        filtered.forEach((row) => {
            const team = String(row.team || '').trim();
            if (!team) return;
            const dept = row.department || '';
            const isSame = dept && team && dept.toLowerCase() === team.toLowerCase();
            const label = isSame ? `Afdeling: ${dept}` : dept ? `${dept} — ${team}` : team;
            if (!grouped.has(team)) grouped.set(team, { value: team, label, count: 0 });
            grouped.get(team).count += 1;
        });
        return [...grouped.values()].sort((a, b) => a.label.localeCompare(b.label, 'nl'));
    }, [rows, activeInviteCode]);

    const selectedInviteMeta = inviteCodeOptions.find((i) => i.value === activeInviteCode);

    // ── Side effects ──────────────────────────────────────────────────────────
    useEffect(() => { setSelectedTeams([]); }, [selectedOrg]);

    useEffect(() => {
        if (selectionMode === 'team') {
            setSelectedInviteCode('');
        } else {
            setSelectedTeams(storedTeam ? [storedTeam] : []);
            setSelectedOrg(canSeeAllOrgs ? '' : ownOrg);
            if (storedCode) setSelectedInviteCode(storedCode);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectionMode]);

    useEffect(() => {
        if (departmentGroups.length > 0 && Object.keys(openDepts).length === 0) {
            setOpenDepts({ [departmentGroups[0].dept]: true });
        }
    }, [departmentGroups]);

    // ── Handlers ──────────────────────────────────────────────────────────────
    function toggleTeam(teamValue) {
        setSelectedTeams((prev) =>
            prev.includes(teamValue) ? prev.filter((t) => t !== teamValue) : [...prev, teamValue]
        );
    }

    function toggleDept(dept) {
        setOpenDepts((prev) => ({ ...prev, [dept]: !prev[dept] }));
    }

    function handleSelectAllTeams() {
        const all = teamOptions.map((t) => t.value);
        setSelectedTeams(selectedTeams.length === all.length ? [] : all);
    }

    function buildTeamResultData(members, meta = {}) {
        const teamScores = {};
        members.forEach((row) => {
            if (row.primary_archetype) teamScores[row.primary_archetype] = (teamScores[row.primary_archetype] || 0) + 2;
            if (row.secondary_archetype) teamScores[row.secondary_archetype] = (teamScores[row.secondary_archetype] || 0) + 1;
            if (row.tertiary_archetype) teamScores[row.tertiary_archetype] = (teamScores[row.tertiary_archetype] || 0) + 0.5;
        });
        return {
            name: meta.name || '', organization: meta.organization || '',
            team_names: meta.team_names || [], team_labels: meta.team_labels || [],
            invite_code: meta.invite_code || '', scores: teamScores,
            members, member_count: members.length, source: meta.source || 'supabase_team',
        };
    }

    async function handleOpenDashboard() {
        if (!supabase) { setErrorMessage('Supabase is niet beschikbaar.'); return; }
        setOpeningDashboard(true);
        setErrorMessage('');

        if (selectionMode === 'team') {
            if (selectedTeams.length === 0) { setErrorMessage('Kies minstens één team.'); setOpeningDashboard(false); return; }

            let query = supabase.from('responses')
                .select('name, organization, department, team, invite_code, role, team_size, primary_archetype, secondary_archetype, tertiary_archetype, full_scores, created_at')
                .in('team', selectedTeams)
                .order('created_at', { ascending: true });
            if (selectedOrg) query = query.eq('organization', selectedOrg);
            // Extra veiligheid: niet-admins kunnen nooit buiten hun eigen org opvragen
            if (!canSeeAllOrgs && ownOrg) query = query.eq('organization', ownOrg);

            const { data, error } = await query;
            if (error) { console.error(error); setErrorMessage('Het teamdashboard kon niet worden opgebouwd.'); setOpeningDashboard(false); return; }

            const members = data || [];
            const selectedLabels = teamOptions.filter((t) => selectedTeams.includes(t.value)).map((t) => t.label);

            if (typeof setTeamResponses === 'function') setTeamResponses(members);
            if (typeof setSelectedTeam === 'function') setSelectedTeam({
                team: selectedTeams.length === 1 ? selectedTeams[0] : selectedLabels.join(', '),
                organization: selectedOrg || members[0]?.organization || '',
                code: '',
            });
            if (typeof setResultData === 'function') setResultData(buildTeamResultData(members, {
                name: selectedLabels.join(', '), organization: selectedOrg || '',
                team_names: selectedTeams, team_labels: selectedLabels, source: 'supabase_team',
            }));

            setOpeningDashboard(false);
            setPage('teamdashboard');
            return;
        }

        if (!activeInviteCode) { setErrorMessage('Kies een invite code.'); setOpeningDashboard(false); return; }

        let inviteQuery = supabase.from('responses')
            .select('name, organization, department, team, invite_code, role, team_size, primary_archetype, secondary_archetype, tertiary_archetype, full_scores, created_at')
            .eq('invite_code', activeInviteCode)
            .order('created_at', { ascending: true });
        if (selectedTeams.length === 1) inviteQuery = inviteQuery.eq('team', selectedTeams[0]);
        if (!canSeeAllOrgs && ownOrg) inviteQuery = inviteQuery.eq('organization', ownOrg);

        const { data, error } = await inviteQuery;
        if (error) { console.error(error); setErrorMessage('Het dashboard kon niet worden opgebouwd.'); setOpeningDashboard(false); return; }

        const members = data || [];
        const firstOrg = members[0]?.organization || '';

        if (typeof setTeamResponses === 'function') setTeamResponses(members);
        if (typeof setSelectedTeam === 'function') setSelectedTeam({
            team: selectedTeams.length === 1 ? selectedTeams[0] : 'Afdeling totaal',
            organization: firstOrg, code: activeInviteCode,
        });
        if (typeof setResultData === 'function') setResultData(buildTeamResultData(members, {
            name: selectedTeams.length === 1 ? `Team: ${selectedTeams[0]}` : 'Afdeling totaal',
            organization: firstOrg, invite_code: activeInviteCode,
            team_names: selectedTeams, team_labels: selectedTeams, source: 'supabase_invite_code',
        }));

        setOpeningDashboard(false);
        setPage('teamdashboard');
    }

    // ── Access guard ──────────────────────────────────────────────────────────
    if (!hasFullTeamAccess() && !makerMode) {
        return (
            <PageShell padding="20px 16px 32px">
                <SelectorCard borderTopColor="var(--tof-accent-rose)">
                    <SectionEyebrow>Team selecteren</SectionEyebrow>
                    <h1 style={s.headingXL}>🔒 Toegang vereist</h1>
                    <p style={s.body}>Deze omgeving is alleen beschikbaar met een geldige toegangscode.</p>
                    <PrimaryButton onClick={() => setPage('team')}>Terug naar uitleg</PrimaryButton>
                </SelectorCard>
            </PageShell>
        );
    }

    // ── RENDER ────────────────────────────────────────────────────────────────
    return (
        <PageShell padding="20px 16px 48px">
            <div style={{ display: 'grid', gap: 20 }}>

                {/* ─── HEADER ──────────────────────────────────────────── */}
                <SelectorCard borderTopColor="var(--tof-accent-rose)">
                    <div style={{ display: 'grid', gap: 14 }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                            <SectionEyebrow>Team selecteren</SectionEyebrow>
                            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                {makerMode && <RoleBadge label="Maker mode" color="var(--tof-accent-rose)" />}
                                {adminMode && <RoleBadge label="Beheerder" color="var(--tof-accent-sage)" />}
                                {!ownOrg && !canSeeAllOrgs && <RoleBadge label="Geen organisatie gevonden" color="#C7A24A" />}
                            </div>
                        </div>

                        <h1 style={s.headingXL}>
                            Kies een team{' '}
                            <span style={{ color: 'var(--tof-accent-rose)', fontStyle: 'italic' }}>
                                of afdeling.
                            </span>
                        </h1>

                        {/* Contextregel: wat ziet de gebruiker */}
                        <p style={{ ...s.body, maxWidth: 680 }}>
                            {canSeeAllOrgs
                                ? 'Je hebt toegang tot alle organisaties en teams.'
                                : ownOrg
                                    ? <>Je ziet de teams van <strong style={{ color: 'var(--tof-text)' }}>{ownOrg}</strong>.</>
                                    : 'Selecteer een team of afdeling om het dashboard te openen.'
                            }
                        </p>

                        {/* Mode toggle */}
                        <div style={{ display: 'flex', gap: 8 }}>
                            <ModeTab active={selectionMode === 'team'} onClick={() => setSelectionMode('team')}>
                                Teams &amp; afdelingen
                            </ModeTab>
                            <ModeTab active={selectionMode === 'invite'} onClick={() => setSelectionMode('invite')}>
                                Invite code
                            </ModeTab>
                        </div>

                        {/* Admin code invoerveld — discreet onderaan header */}
                        {!canSeeAllOrgs && (
                            <div>
                                {!showAdminField ? (
                                    <button
                                        onClick={() => setShowAdminField(true)}
                                        style={{
                                            fontSize: 12,
                                            color: 'var(--tof-text-muted)',
                                            background: 'none',
                                            border: 'none',
                                            cursor: 'pointer',
                                            padding: 0,
                                            fontFamily: 'var(--tof-font-body)',
                                            textDecoration: 'underline',
                                            textUnderlineOffset: 3,
                                        }}
                                    >
                                        Beheerder? Klik hier
                                    </button>
                                ) : (
                                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', marginTop: 4 }}>
                                        <input
                                            type="password"
                                            placeholder="Beheerderscode"
                                            value={adminInput}
                                            onChange={(e) => setAdminInput(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleAdminSubmit()}
                                            style={{
                                                padding: '8px 12px',
                                                borderRadius: 8,
                                                border: `1px solid ${adminError ? 'var(--tof-accent-rose)' : 'var(--tof-border)'}`,
                                                fontSize: 13,
                                                background: 'var(--tof-surface)',
                                                color: 'var(--tof-text)',
                                                outline: 'none',
                                                fontFamily: 'var(--tof-font-body)',
                                                width: 200,
                                            }}
                                        />
                                        <button
                                            onClick={handleAdminSubmit}
                                            style={{
                                                padding: '8px 14px',
                                                borderRadius: 8,
                                                border: '1px solid var(--tof-border)',
                                                background: 'var(--tof-surface-soft)',
                                                color: 'var(--tof-text)',
                                                fontSize: 13,
                                                fontWeight: 600,
                                                cursor: 'pointer',
                                                fontFamily: 'var(--tof-font-body)',
                                            }}
                                        >
                                            Bevestig
                                        </button>
                                        <button
                                            onClick={() => { setShowAdminField(false); setAdminInput(''); setAdminError(''); }}
                                            style={{ fontSize: 12, color: 'var(--tof-text-muted)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--tof-font-body)' }}
                                        >
                                            Annuleer
                                        </button>
                                        {adminError && (
                                            <span style={{ fontSize: 12, color: 'var(--tof-accent-rose)' }}>{adminError}</span>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </SelectorCard>

                {/* ─── LOADING ──────────────────────────────────────────── */}
                {loading && (
                    <SelectorCard borderTopColor="var(--tof-border)">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0' }}>
                            <div style={{
                                width: 16, height: 16, borderRadius: '50%',
                                border: '2px solid var(--tof-accent-sage)',
                                borderTopColor: 'transparent',
                                animation: 'spin 0.8s linear infinite',
                            }} />
                            <span style={{ fontSize: 14, color: 'var(--tof-text-soft)' }}>Teams laden…</span>
                        </div>
                        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                    </SelectorCard>
                )}

                {/* ─── TEAMS & AFDELINGEN ───────────────────────────────── */}
                {!loading && selectionMode === 'team' && (
                    <>
                        {/* Organisatie-filter — alleen zichtbaar voor admins/makers */}
                        {canSeeAllOrgs && organizations.length > 1 && (
                            <div style={{ display: 'grid', gap: 10 }}>
                                <SectionDivider label="Organisatie" />
                                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                    <OrgPill active={selectedOrg === ''} onClick={() => setSelectedOrg('')}>
                                        Alle organisaties
                                    </OrgPill>
                                    {organizations.map((org) => (
                                        <OrgPill
                                            key={org}
                                            active={selectedOrg === org}
                                            onClick={() => setSelectedOrg(org)}
                                        >
                                            {org}
                                        </OrgPill>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Afdelingen + teams */}
                        <div style={{ display: 'grid', gap: 10 }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                                <SectionDivider label={canSeeAllOrgs && selectedOrg ? `Teams · ${selectedOrg}` : 'Teams'} />
                                {teamOptions.length > 1 && (
                                    <button
                                        onClick={handleSelectAllTeams}
                                        style={{
                                            fontSize: 12, fontWeight: 600, color: 'var(--tof-accent-rose)',
                                            background: 'none', border: 'none', cursor: 'pointer',
                                            padding: '2px 0', fontFamily: 'var(--tof-font-body)', whiteSpace: 'nowrap',
                                        }}
                                    >
                                        {selectedTeams.length === teamOptions.length ? 'Deselecteer alles' : 'Selecteer alles'}
                                    </button>
                                )}
                            </div>

                            {departmentGroups.length === 0 && (
                                <SelectorCard borderTopColor="var(--tof-border)">
                                    <p style={{ ...s.body, fontSize: 14 }}>
                                        {ownOrg && !canSeeAllOrgs
                                            ? `Geen teams gevonden voor ${ownOrg}.`
                                            : 'Geen teams gevonden. Kies een organisatie of controleer de data.'
                                        }
                                    </p>
                                </SelectorCard>
                            )}

                            {departmentGroups.map((dg) => (
                                <DepartmentGroup
                                    key={dg.dept}
                                    group={dg}
                                    isOpen={!!openDepts[dg.dept]}
                                    onToggle={() => toggleDept(dg.dept)}
                                    selectedTeams={selectedTeams}
                                    onToggleTeam={toggleTeam}
                                />
                            ))}
                        </div>
                    </>
                )}

                {/* ─── INVITE CODE ──────────────────────────────────────── */}
                {!loading && selectionMode === 'invite' && (
                    <div style={{ display: 'grid', gap: 14 }}>
                        <SectionDivider label="Invite code" />

                        {!storedCode && (
                            <div style={{ display: 'grid', gap: 10 }}>
                                {inviteCodeOptions.length === 0 ? (
                                    <SelectorCard borderTopColor="var(--tof-border)">
                                        <p style={{ ...s.body, fontSize: 14 }}>Geen invite codes gevonden.</p>
                                    </SelectorCard>
                                ) : (
                                    inviteCodeOptions.map((item) => (
                                        <InviteCodeCard
                                            key={item.value}
                                            item={item}
                                            active={selectedInviteCode === item.value}
                                            reliability={reliabilityInfo(item.count)}
                                            onClick={() => setSelectedInviteCode(item.value)}
                                        />
                                    ))
                                )}
                            </div>
                        )}

                        {(storedCode || selectedInviteCode) && storedCodeTeamOptions.length > 0 && (
                            <div style={{ display: 'grid', gap: 10 }}>
                                <div style={{
                                    background: 'var(--tof-surface-soft)', borderRadius: 10,
                                    padding: '11px 14px', border: '1px solid var(--tof-border)',
                                    fontSize: 14, color: 'var(--tof-text-soft)', lineHeight: 1.6,
                                }}>
                                    Code <strong style={{ color: 'var(--tof-text)' }}>{activeInviteCode}</strong> is actief.
                                    Kies het afdelingsniveau of zoom in op één team.
                                </div>
                                <SectionDivider label="Niveau kiezen" />
                                <TeamLevelCard
                                    label="Afdeling totaal"
                                    desc="Alle responses binnen deze invite code samen"
                                    count={rows.filter((r) => r.invite_code === activeInviteCode).length}
                                    selected={selectedTeams.length === 0}
                                    onSelect={() => setSelectedTeams([])}
                                />
                                {storedCodeTeamOptions.map((item) => (
                                    <TeamLevelCard
                                        key={item.value}
                                        label={item.label}
                                        desc="Individueel team binnen de afdeling"
                                        count={item.count}
                                        selected={selectedTeams.length === 1 && selectedTeams.includes(item.value)}
                                        onSelect={() => setSelectedTeams([item.value])}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* ─── CTA ──────────────────────────────────────────────── */}
                {!loading && (
                    <SelectorCard borderTopColor="var(--tof-accent-rose)">
                        <div style={{ display: 'grid', gap: 14 }}>

                            {selectionMode === 'team' && selectedTeams.length > 0 && (
                                <SelectionSummary>
                                    <strong style={{ color: 'var(--tof-text)' }}>{selectedTeams.length}</strong>{' '}
                                    team{selectedTeams.length > 1 ? 's' : ''} geselecteerd
                                    {selectedOrg && <> · {selectedOrg}</>}
                                    {' — '}
                                    {teamOptions.filter((t) => selectedTeams.includes(t.value)).map((t) => t.label).join(', ')}
                                </SelectionSummary>
                            )}

                            {selectionMode === 'invite' && activeInviteCode && (
                                <SelectionSummary>
                                    Code <strong style={{ color: 'var(--tof-text)' }}>{activeInviteCode}</strong>
                                    {selectedTeams.length === 1
                                        ? <> · team <strong style={{ color: 'var(--tof-text)' }}>{selectedTeams[0]}</strong></>
                                        : <> · afdelingsniveau</>
                                    }
                                    {selectedInviteMeta && <> · {selectedInviteMeta.count} responsen</>}
                                </SelectionSummary>
                            )}

                            {errorMessage && (
                                <div style={{
                                    background: 'var(--tof-rose-soft)', borderRadius: 10,
                                    padding: '11px 14px', fontSize: 14,
                                    color: 'var(--tof-accent-rose)', border: '1px solid rgba(176,82,82,0.18)',
                                }}>
                                    {errorMessage}
                                </div>
                            )}

                            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                                <PrimaryButton onClick={handleOpenDashboard}>
                                    {openingDashboard ? 'Bezig…' : 'Open teamdashboard →'}
                                </PrimaryButton>
                                <SecondaryButton onClick={() => setPage('team')}>Terug</SecondaryButton>
                            </div>
                        </div>
                    </SelectorCard>
                )}

            </div>
        </PageShell>
    );
}

// ─── DEPARTMENT GROUP ─────────────────────────────────────────────────────────

function DepartmentGroup({ group, isOpen, onToggle, selectedTeams, onToggleTeam }) {
    const selectedInGroup = group.teams.filter((t) => selectedTeams.includes(t.value)).length;
    return (
        <div style={{ background: 'var(--tof-surface)', borderRadius: 14, border: '1px solid var(--tof-border)', boxShadow: 'var(--tof-shadow)', overflow: 'hidden' }}>
            <button
                onClick={onToggle}
                style={{
                    width: '100%', display: 'grid', gridTemplateColumns: '1fr auto', gap: 12,
                    alignItems: 'center', padding: '16px 20px', background: 'none', border: 'none',
                    cursor: 'pointer', borderTop: '3px solid var(--tof-accent-sage)',
                    fontFamily: 'var(--tof-font-body)', textAlign: 'left',
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                    <span style={{ fontFamily: 'var(--tof-font-heading)', fontSize: 18, fontWeight: 400, color: 'var(--tof-text)', lineHeight: 1.2 }}>
                        {group.dept === '—' ? 'Overig' : group.dept}
                    </span>
                    <span style={{ fontSize: 12, color: 'var(--tof-text-muted)', background: 'var(--tof-surface-soft)', border: '1px solid var(--tof-border)', borderRadius: 999, padding: '2px 9px' }}>
                        {group.teams.length} {group.teams.length === 1 ? 'team' : 'teams'}
                    </span>
                    {selectedInGroup > 0 && (
                        <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--tof-accent-rose)', background: 'rgba(176,82,82,0.08)', border: '1px solid rgba(176,82,82,0.2)', borderRadius: 999, padding: '2px 9px' }}>
                            {selectedInGroup} geselecteerd
                        </span>
                    )}
                </div>
                <span style={{ fontSize: 14, color: 'var(--tof-text-muted)', transform: isOpen ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s ease' }}>▾</span>
            </button>
            {isOpen && (
                <div style={{ padding: '4px 14px 16px', display: 'grid', gap: 8, borderTop: '1px solid var(--tof-border)', background: 'var(--tof-bg)' }}>
                    {group.teams.map((team) => (
                        <TeamCard
                            key={team.value}
                            team={team}
                            checked={selectedTeams.includes(team.value)}
                            reliability={reliabilityInfo(team.count)}
                            onToggle={() => onToggleTeam(team.value)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

function TeamCard({ team, checked, reliability, onToggle }) {
    return (
        <button
            onClick={onToggle}
            style={{
                display: 'grid', gridTemplateColumns: '20px 1fr auto', gap: 12, alignItems: 'center',
                padding: '13px 16px', marginTop: 4, borderRadius: 12,
                border: `1px solid ${checked ? 'rgba(176,82,82,0.3)' : 'var(--tof-border)'}`,
                background: checked ? 'rgba(176,82,82,0.05)' : 'var(--tof-surface)',
                cursor: 'pointer', textAlign: 'left', fontFamily: 'var(--tof-font-body)',
                transition: 'border-color 0.15s ease, background 0.15s ease',
            }}
        >
            <div style={{ width: 18, height: 18, borderRadius: 5, border: `2px solid ${checked ? 'var(--tof-accent-rose)' : 'var(--tof-border)'}`, background: checked ? 'var(--tof-accent-rose)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.15s ease' }}>
                {checked && <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>}
            </div>
            <div>
                <div style={{ fontSize: 14, fontWeight: checked ? 600 : 500, color: 'var(--tof-text)', lineHeight: 1.3 }}>{team.label}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: reliability.color, flexShrink: 0 }} />
                    <span style={{ fontSize: 12, color: 'var(--tof-text-muted)' }}>{reliability.label}</span>
                </div>
            </div>
            <div style={{ fontSize: 13, fontWeight: 600, color: reliability.color, background: `${reliability.color}15`, border: `1px solid ${reliability.color}35`, borderRadius: 999, padding: '3px 10px', flexShrink: 0, fontVariantNumeric: 'tabular-nums' }}>
                {team.count}
            </div>
        </button>
    );
}

function InviteCodeCard({ item, active, reliability, onClick }) {
    return (
        <button
            onClick={onClick}
            style={{
                display: 'grid', gridTemplateColumns: '20px 1fr auto', gap: 12, alignItems: 'center',
                padding: '14px 18px', borderRadius: 12,
                border: `1px solid ${active ? 'rgba(176,82,82,0.3)' : 'var(--tof-border)'}`,
                background: active ? 'rgba(176,82,82,0.05)' : 'var(--tof-surface)',
                cursor: 'pointer', textAlign: 'left', fontFamily: 'var(--tof-font-body)',
                boxShadow: 'var(--tof-shadow)', transition: 'all 0.15s ease',
                borderTop: active ? '3px solid var(--tof-accent-rose)' : '3px solid var(--tof-border)',
            }}
        >
            <div style={{ width: 18, height: 18, borderRadius: '50%', border: `2px solid ${active ? 'var(--tof-accent-rose)' : 'var(--tof-border)'}`, background: active ? 'var(--tof-accent-rose)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {active && <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#fff' }} />}
            </div>
            <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--tof-text)', lineHeight: 1.3 }}>{item.label}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: reliability.color }} />
                    <span style={{ fontSize: 12, color: 'var(--tof-text-muted)' }}>{reliability.label}</span>
                </div>
            </div>
            <div style={{ fontSize: 13, fontWeight: 600, color: reliability.color, background: `${reliability.color}15`, border: `1px solid ${reliability.color}35`, borderRadius: 999, padding: '3px 10px', flexShrink: 0 }}>
                {item.count}
            </div>
        </button>
    );
}

function TeamLevelCard({ label, desc, count, selected, onSelect }) {
    const rel = reliabilityInfo(count);
    return (
        <button
            onClick={onSelect}
            style={{
                display: 'grid', gridTemplateColumns: '20px 1fr auto', gap: 12, alignItems: 'center',
                padding: '13px 16px', borderRadius: 12,
                border: `1px solid ${selected ? 'rgba(176,82,82,0.3)' : 'var(--tof-border)'}`,
                background: selected ? 'rgba(176,82,82,0.05)' : 'var(--tof-surface)',
                cursor: 'pointer', textAlign: 'left', fontFamily: 'var(--tof-font-body)', transition: 'all 0.15s ease',
            }}
        >
            <div style={{ width: 18, height: 18, borderRadius: '50%', border: `2px solid ${selected ? 'var(--tof-accent-rose)' : 'var(--tof-border)'}`, background: selected ? 'var(--tof-accent-rose)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {selected && <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#fff' }} />}
            </div>
            <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--tof-text)', lineHeight: 1.3 }}>{label}</div>
                <div style={{ fontSize: 12, color: 'var(--tof-text-muted)', marginTop: 3 }}>{desc}</div>
            </div>
            <div style={{ fontSize: 13, fontWeight: 600, color: rel.color, background: `${rel.color}15`, border: `1px solid ${rel.color}35`, borderRadius: 999, padding: '3px 10px', flexShrink: 0 }}>
                {count}
            </div>
        </button>
    );
}

function SelectorCard({ children, borderTopColor = 'var(--tof-accent-sage)' }) {
    return (
        <div style={{ background: 'var(--tof-surface)', borderRadius: 16, padding: '22px 24px', borderTop: `4px solid ${borderTopColor}`, border: '1px solid var(--tof-border)', boxShadow: 'var(--tof-shadow)', display: 'grid', gap: 14, alignContent: 'start' }}>
            {children}
        </div>
    );
}

function SectionDivider({ label }) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 2, fontWeight: 700, color: 'var(--tof-text-muted)', whiteSpace: 'nowrap' }}>{label}</span>
            <div style={{ flex: 1, height: 1, background: 'var(--tof-border)' }} />
        </div>
    );
}

function ModeTab({ active, onClick, children }) {
    return (
        <button onClick={onClick} style={{ padding: '9px 18px', borderRadius: 999, border: active ? '1.5px solid var(--tof-accent-rose)' : '1px solid var(--tof-border)', background: active ? 'rgba(176,82,82,0.07)' : 'var(--tof-surface)', color: active ? 'var(--tof-accent-rose)' : 'var(--tof-text-soft)', fontWeight: active ? 700 : 500, fontSize: 13, cursor: 'pointer', transition: 'all 0.15s ease', fontFamily: 'var(--tof-font-body)', letterSpacing: 0.2 }}>
            {children}
        </button>
    );
}

function OrgPill({ active, onClick, children }) {
    return (
        <button onClick={onClick} style={{ padding: '7px 16px', borderRadius: 999, border: active ? '1.5px solid var(--tof-accent-sage)' : '1px solid var(--tof-border)', background: active ? 'rgba(110,136,114,0.1)' : 'var(--tof-surface)', color: active ? 'var(--tof-accent-sage)' : 'var(--tof-text-soft)', fontWeight: active ? 700 : 400, fontSize: 13, cursor: 'pointer', transition: 'all 0.15s ease', fontFamily: 'var(--tof-font-body)' }}>
            {children}
        </button>
    );
}

function RoleBadge({ label, color }) {
    return (
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: `${color}12`, border: `1px solid ${color}30`, borderRadius: 999, padding: '4px 12px', fontSize: 11, fontWeight: 700, color, letterSpacing: 0.5 }}>
            {label}
        </div>
    );
}

function SelectionSummary({ children }) {
    return (
        <div style={{ background: 'var(--tof-surface-soft)', borderRadius: 10, padding: '11px 14px', border: '1px solid var(--tof-border)', fontSize: 14, color: 'var(--tof-text-soft)', lineHeight: 1.6 }}>
            {children}
        </div>
    );
}

const s = {
    headingXL: { margin: 0, fontFamily: 'var(--tof-font-heading)', fontSize: 'clamp(30px, 4.5vw, 48px)', lineHeight: 1.04, color: 'var(--tof-text)' },
    body: { margin: 0, color: 'var(--tof-text-soft)', lineHeight: 1.7, fontSize: 15 },
};
