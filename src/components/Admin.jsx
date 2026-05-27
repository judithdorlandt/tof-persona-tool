/**
 * Admin.jsx — TOF interne admin-dashboard
 *
 * Doel: Judith kan in 1 plek nieuwe klant-teams aanmaken en de status
 * bekijken, zonder de Supabase-dashboard te openen.
 *
 * Gating: alleen ingelogde admins (zie isCurrentUserAdmin in supabase.js).
 * Niet-admin → redirect naar /home met melding.
 *
 * MVP-scope (deze versie):
 *  - Form: nieuwe team-toegangscode aanmaken (org, team, level)
 *  - Direct kant-en-klare welkomstmail-template tonen om te kopiëren
 *  - Lijst: alle aangemaakte teams met response-telling
 *
 * Toekomst (later):
 *  - Auto-versturen van magic-link naar leider
 *  - Pending-invites tabel
 *  - Voortgangsbalken per team
 */

import React, { useEffect, useState } from 'react';
import {
    isCurrentUserAdmin,
    getCurrentUser,
    getAllTeamAccessCodes,
    createTeamAccessCode,
    adminListTeamManagers,
    adminAddTeamManager,
    adminRemoveTeamManager,
} from '../supabase';
import {
    PageShell,
    PrimaryButton,
    SecondaryButton,
} from '../ui/AppShell';

// ─── HOOFDCOMPONENT ─────────────────────────────────────────────────────────

export default function Admin({ setPage }) {
    const [isMobile, setIsMobile] = useState(window.innerWidth < 900);
    const [loading, setLoading] = useState(true);
    const [authorized, setAuthorized] = useState(false);
    const [teams, setTeams] = useState([]);

    // Form state
    const [orgInput, setOrgInput] = useState('');
    const [teamInput, setTeamInput] = useState('');
    const [levelInput, setLevelInput] = useState('insight');
    const [leaderEmail, setLeaderEmail] = useState('');
    const [createLoading, setCreateLoading] = useState(false);
    const [createError, setCreateError] = useState('');
    const [justCreated, setJustCreated] = useState(null);
    // justCreated: { code, organization, team, level, leaderEmail }

    // Managers state
    const [managers, setManagers] = useState([]);
    const [managerEmailInput, setManagerEmailInput] = useState('');
    const [managerCodeInput, setManagerCodeInput] = useState('');
    const [managerError, setManagerError] = useState('');
    const [managerBusy, setManagerBusy] = useState(false);

    useEffect(() => {
        const onResize = () => setIsMobile(window.innerWidth < 900);
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);

    // Gating + teams laden
    useEffect(() => {
        let cancelled = false;
        async function bootstrap() {
            const admin = await isCurrentUserAdmin();
            if (cancelled) return;
            setAuthorized(admin);
            if (admin) {
                const [list, mgrs] = await Promise.all([
                    getAllTeamAccessCodes(),
                    adminListTeamManagers(),
                ]);
                if (cancelled) return;
                setTeams(list);
                setManagers(mgrs);
            }
            setLoading(false);
        }
        bootstrap();
        return () => { cancelled = true; };
    }, []);

    async function handleCreate(e) {
        e?.preventDefault?.();
        setCreateError('');
        if (!orgInput.trim() || !teamInput.trim()) {
            setCreateError('Organisatie en teamnaam zijn verplicht.');
            return;
        }
        setCreateLoading(true);
        try {
            const result = await createTeamAccessCode({
                organization: orgInput.trim(),
                team: teamInput.trim(),
                level: levelInput,
            });
            if (result.error) {
                setCreateError(result.error.message || 'Aanmaken mislukt.');
                setCreateLoading(false);
                return;
            }
            // Bewaar voor de welkomstmail-preview
            setJustCreated({
                code: result.code,
                organization: orgInput.trim(),
                team: teamInput.trim(),
                level: levelInput,
                leaderEmail: leaderEmail.trim() || null,
            });
            // Form leegmaken
            setOrgInput('');
            setTeamInput('');
            setLeaderEmail('');
            setLevelInput('insight');
            // Lijst verversen
            const refreshed = await getAllTeamAccessCodes();
            setTeams(refreshed);
        } catch (err) {
            setCreateError(err?.message || 'Onbekende fout.');
        } finally {
            setCreateLoading(false);
        }
    }

    async function handleAddManager(e) {
        e?.preventDefault?.();
        setManagerError('');
        const email = managerEmailInput.trim().toLowerCase();
        const code = managerCodeInput.trim();
        if (!email || !code) {
            setManagerError('Email en teamcode zijn verplicht.');
            return;
        }
        if (!email.includes('@')) {
            setManagerError('Vul een geldig e-mailadres in.');
            return;
        }
        setManagerBusy(true);
        try {
            const { error } = await adminAddTeamManager({ email, teamCode: code });
            if (error) {
                setManagerError(error.message || 'Koppelen mislukt.');
                return;
            }
            setManagerEmailInput('');
            setManagerCodeInput('');
            const refreshed = await adminListTeamManagers();
            setManagers(refreshed);
        } catch (err) {
            setManagerError(err?.message || 'Onbekende fout.');
        } finally {
            setManagerBusy(false);
        }
    }

    async function handleRemoveManager(id) {
        setManagerBusy(true);
        try {
            const { error } = await adminRemoveTeamManager(id);
            if (error) {
                setManagerError(error.message || 'Verwijderen mislukt.');
                return;
            }
            const refreshed = await adminListTeamManagers();
            setManagers(refreshed);
        } finally {
            setManagerBusy(false);
        }
    }

    // ── Gated rendering ────────────────────────────────────────────────────
    if (loading) {
        return (
            <PageShell>
                <div style={{ padding: 48, textAlign: 'center', color: 'var(--tof-text-muted)' }}>
                    Toegangscheck loopt…
                </div>
            </PageShell>
        );
    }

    if (!authorized) {
        return (
            <PageShell>
                <div style={{
                    maxWidth: 600,
                    margin: '60px auto',
                    padding: 32,
                    background: 'var(--tof-surface)',
                    border: '1px solid var(--tof-border)',
                    borderRadius: 14,
                    textAlign: 'center',
                }}>
                    <div style={{
                        fontSize: 11,
                        textTransform: 'uppercase',
                        letterSpacing: 1.6,
                        fontWeight: 700,
                        color: 'var(--tof-accent-rose)',
                        marginBottom: 12,
                    }}>
                        Geen toegang
                    </div>
                    <h1 style={{
                        margin: '0 0 12px',
                        fontFamily: "'Playfair Display', serif",
                        fontWeight: 500,
                        fontSize: 28,
                    }}>
                        Deze pagina is alleen voor TOF-admins.
                    </h1>
                    <p style={{ color: 'var(--tof-text-soft)', lineHeight: 1.6, margin: '0 0 24px' }}>
                        Je bent ingelogd, maar je hebt geen admin-rechten op dit account.
                    </p>
                    <PrimaryButton onClick={() => setPage && setPage('home')}>
                        Terug naar Home
                    </PrimaryButton>
                </div>
            </PageShell>
        );
    }

    // ── Admin view ────────────────────────────────────────────────────────
    return (
        <PageShell>
            <div style={{ display: 'grid', gap: isMobile ? 20 : 28 }}>

                {/* Hero */}
                <div style={{
                    background: 'var(--tof-surface)',
                    border: '1px solid var(--tof-border)',
                    borderRadius: 18,
                    padding: isMobile ? '20px 22px' : '28px 32px',
                    position: 'relative',
                    overflow: 'hidden',
                }}>
                    <div style={{
                        position: 'absolute', left: 0, top: 0,
                        width: 4, height: '100%',
                        background: 'var(--tof-accent-rose)',
                        borderRadius: '4px 0 0 4px',
                    }} />
                    <div style={{ paddingLeft: isMobile ? 8 : 16, display: 'grid', gap: 8 }}>
                        <div style={{
                            color: 'var(--tof-accent-rose)',
                            letterSpacing: 2,
                            fontSize: 11,
                            textTransform: 'uppercase',
                            fontWeight: 700,
                        }}>
                            TOF — Admin
                        </div>
                        <h1 style={{
                            margin: 0,
                            fontFamily: "'Playfair Display', serif",
                            fontWeight: 500,
                            fontSize: isMobile ? 'clamp(24px, 5vw, 32px)' : 'clamp(28px, 2.8vw, 36px)',
                            lineHeight: 1.15,
                        }}>
                            Nieuwe klant in <em style={{ color: 'var(--tof-accent-rose)', fontStyle: 'italic' }}>één blik</em>
                        </h1>
                        <p style={{
                            margin: 0,
                            fontSize: 14,
                            lineHeight: 1.6,
                            color: 'var(--tof-text-soft)',
                            maxWidth: 560,
                        }}>
                            Maak een team-toegangscode aan, krijg een kant-en-klare welkomstmail, en houd je klantenlijst overzichtelijk.
                        </p>
                    </div>
                </div>

                {/* Form: nieuwe klant */}
                <CreateTeamCard
                    isMobile={isMobile}
                    orgInput={orgInput}
                    setOrgInput={setOrgInput}
                    teamInput={teamInput}
                    setTeamInput={setTeamInput}
                    levelInput={levelInput}
                    setLevelInput={setLevelInput}
                    leaderEmail={leaderEmail}
                    setLeaderEmail={setLeaderEmail}
                    createLoading={createLoading}
                    createError={createError}
                    onSubmit={handleCreate}
                />

                {/* Just-created preview */}
                {justCreated && (
                    <JustCreatedCard
                        isMobile={isMobile}
                        info={justCreated}
                        onDismiss={() => setJustCreated(null)}
                    />
                )}

                {/* Team-lijst */}
                <TeamsList
                    isMobile={isMobile}
                    teams={teams}
                />

                {/* Managers-koppelingen */}
                <ManagersSection
                    isMobile={isMobile}
                    teams={teams}
                    managers={managers}
                    emailInput={managerEmailInput}
                    setEmailInput={setManagerEmailInput}
                    codeInput={managerCodeInput}
                    setCodeInput={setManagerCodeInput}
                    busy={managerBusy}
                    error={managerError}
                    onAdd={handleAddManager}
                    onRemove={handleRemoveManager}
                />

            </div>
        </PageShell>
    );
}

// ─── SUB: Form ─────────────────────────────────────────────────────────────

function CreateTeamCard({
    isMobile, orgInput, setOrgInput, teamInput, setTeamInput,
    levelInput, setLevelInput, leaderEmail, setLeaderEmail,
    createLoading, createError, onSubmit,
}) {
    const inputStyle = {
        width: '100%',
        padding: '12px 14px',
        border: '1px solid var(--tof-border)',
        borderRadius: 10,
        fontSize: 15,
        fontFamily: 'inherit',
        background: 'var(--tof-bg)',
        color: 'var(--tof-text)',
        boxSizing: 'border-box',
    };
    const labelStyle = {
        display: 'block',
        fontSize: 11,
        textTransform: 'uppercase',
        letterSpacing: 1.2,
        fontWeight: 700,
        color: 'var(--tof-text-muted)',
        marginBottom: 6,
    };

    return (
        <form onSubmit={onSubmit} style={{
            background: 'var(--tof-surface)',
            border: '1px solid var(--tof-border)',
            borderRadius: 14,
            padding: isMobile ? '20px 22px' : '24px 28px',
            display: 'grid',
            gap: 16,
        }}>
            <div style={{
                fontSize: 11,
                textTransform: 'uppercase',
                letterSpacing: 1.4,
                fontWeight: 700,
                color: 'var(--tof-accent-rose)',
            }}>
                Nieuwe klant aanmaken
            </div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
                gap: 14,
            }}>
                <div>
                    <label style={labelStyle}>Organisatie</label>
                    <input
                        type="text"
                        value={orgInput}
                        onChange={(e) => setOrgInput(e.target.value)}
                        placeholder="Bv. Gemeente Nijkerk"
                        style={inputStyle}
                        autoFocus
                    />
                </div>
                <div>
                    <label style={labelStyle}>Team / Afdeling</label>
                    <input
                        type="text"
                        value={teamInput}
                        onChange={(e) => setTeamInput(e.target.value)}
                        placeholder="Bv. Bestuurszaken"
                        style={inputStyle}
                    />
                </div>
            </div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
                gap: 14,
            }}>
                <div>
                    <label style={labelStyle}>Module</label>
                    <select
                        value={levelInput}
                        onChange={(e) => setLevelInput(e.target.value)}
                        style={{ ...inputStyle, cursor: 'pointer' }}
                    >
                        <option value="insight">Module 01 — Insight (€1.500)</option>
                        <option value="dynamics">Module 02 — Dynamics (€8.500)</option>
                    </select>
                </div>
                <div>
                    <label style={labelStyle}>Leider e-mail (optioneel)</label>
                    <input
                        type="email"
                        value={leaderEmail}
                        onChange={(e) => setLeaderEmail(e.target.value)}
                        placeholder="l.janssen@nijkerk.nl"
                        style={inputStyle}
                    />
                </div>
            </div>

            {createError && (
                <div style={{
                    background: 'rgba(176,82,82,0.08)',
                    border: '1px solid rgba(176,82,82,0.24)',
                    borderRadius: 8,
                    padding: '10px 14px',
                    color: 'var(--tof-accent-rose)',
                    fontSize: 13,
                }}>
                    {createError}
                </div>
            )}

            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <PrimaryButton type="submit" disabled={createLoading}>
                    {createLoading ? 'Aanmaken…' : 'Team aanmaken'}
                </PrimaryButton>
                <span style={{ fontSize: 12, color: 'var(--tof-text-muted)' }}>
                    Code wordt automatisch gegenereerd.
                </span>
            </div>
        </form>
    );
}

// ─── SUB: Just-created (welkomstmail preview) ──────────────────────────────

function JustCreatedCard({ isMobile, info, onDismiss }) {
    const [copied, setCopied] = useState(false);

    const moduleLabel = info.level === 'dynamics' ? 'Module 02 — Dynamics' : 'Module 01 — Insight';
    const recipientName = info.leaderEmail
        ? info.leaderEmail.split('@')[0].split('.')[0]
        : 'Livia'; // placeholder voorbeeld
    const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);

    const mailBody = `Beste ${capitalize(recipientName)},

Fijn dat we deze stap samen zetten. Hieronder alles wat je nodig hebt om jouw team aan de slag te laten gaan.

JULLIE TEAMCODE
${info.code}

Deze code vraag je elk teamlid in te vullen bij de persona-tool. Daardoor weet de tool dat hun antwoorden bij jullie team horen.

WAT JE TEAMLEDEN DOEN (15 minuten per persoon)
1. Open: https://app.tof.services/quiz
2. Vul de quiz in — ze beantwoorden ~30 stellingen
3. Bij "Teamcode" vullen ze in: ${info.code}
4. Ze krijgen direct hun persoonlijke persona als resultaat

WAT JIJ ALS LEIDINGGEVENDE STRAKS DOET
Zodra iedereen heeft ingevuld krijg je van mij een persoonlijke link om het team-resultaat in te zien.

Vragen? Bel of mail gerust.

Hartelijke groet,
Judith
The Office Factory
+31 6 8389 4556 · judith@tof.services`;

    function handleCopy() {
        navigator.clipboard.writeText(mailBody).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    }

    return (
        <div style={{
            background: 'var(--tof-surface)',
            border: '1px solid var(--tof-border)',
            borderLeft: '3px solid var(--tof-accent-sage)',
            borderRadius: 14,
            padding: isMobile ? '18px 20px' : '22px 26px',
            display: 'grid',
            gap: 14,
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
                <div>
                    <div style={{
                        fontSize: 11,
                        textTransform: 'uppercase',
                        letterSpacing: 1.4,
                        fontWeight: 700,
                        color: 'var(--tof-accent-sage)',
                        marginBottom: 4,
                    }}>
                        Team aangemaakt
                    </div>
                    <h3 style={{
                        margin: 0,
                        fontFamily: "'Playfair Display', serif",
                        fontWeight: 500,
                        fontSize: 22,
                    }}>
                        {info.organization} — {info.team}
                    </h3>
                    <div style={{ fontSize: 13, color: 'var(--tof-text-muted)', marginTop: 4 }}>
                        {moduleLabel}
                    </div>
                </div>
                <SecondaryButton onClick={onDismiss}>Sluiten</SecondaryButton>
            </div>

            <div style={{
                background: 'var(--tof-bg)',
                border: '1px dashed var(--tof-border)',
                borderRadius: 10,
                padding: '14px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12,
                flexWrap: 'wrap',
            }}>
                <div>
                    <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 1.4, color: 'var(--tof-text-muted)' }}>
                        Code
                    </div>
                    <div style={{
                        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                        fontSize: 18,
                        fontWeight: 600,
                        color: 'var(--tof-text)',
                        letterSpacing: 1.5,
                    }}>
                        {info.code}
                    </div>
                </div>
                <SecondaryButton onClick={() => navigator.clipboard.writeText(info.code)}>
                    Kopieer code
                </SecondaryButton>
            </div>

            <details style={{ marginTop: 4 }}>
                <summary style={{
                    cursor: 'pointer',
                    fontSize: 13,
                    fontWeight: 600,
                    color: 'var(--tof-accent-rose)',
                    listStyle: 'none',
                }}>
                    Kant-en-klare welkomstmail tonen ↓
                </summary>
                <div style={{ marginTop: 14, display: 'grid', gap: 10 }}>
                    <textarea
                        value={mailBody}
                        readOnly
                        rows={isMobile ? 12 : 16}
                        style={{
                            width: '100%',
                            padding: 14,
                            fontFamily: 'inherit',
                            fontSize: 13,
                            lineHeight: 1.5,
                            border: '1px solid var(--tof-border)',
                            borderRadius: 8,
                            background: 'var(--tof-bg)',
                            color: 'var(--tof-text)',
                            resize: 'vertical',
                            boxSizing: 'border-box',
                        }}
                    />
                    <div>
                        <PrimaryButton onClick={handleCopy}>
                            {copied ? '✓ Gekopieerd' : 'Kopieer mail-tekst'}
                        </PrimaryButton>
                    </div>
                </div>
            </details>
        </div>
    );
}

// ─── SUB: Lijst ────────────────────────────────────────────────────────────

function TeamsList({ isMobile, teams }) {
    return (
        <div style={{
            background: 'var(--tof-surface)',
            border: '1px solid var(--tof-border)',
            borderRadius: 14,
            padding: isMobile ? '20px 22px' : '24px 28px',
            display: 'grid',
            gap: 14,
        }}>
            <div style={{
                fontSize: 11,
                textTransform: 'uppercase',
                letterSpacing: 1.4,
                fontWeight: 700,
                color: 'var(--tof-text-muted)',
            }}>
                Alle teams ({teams.length})
            </div>

            {teams.length === 0 ? (
                <div style={{
                    padding: 24,
                    color: 'var(--tof-text-muted)',
                    fontSize: 14,
                    textAlign: 'center',
                }}>
                    Nog geen teams aangemaakt.
                </div>
            ) : (
                <div style={{ display: 'grid', gap: 10 }}>
                    {teams.map((t) => (
                        <TeamRow key={t.code} isMobile={isMobile} team={t} />
                    ))}
                </div>
            )}
        </div>
    );
}

function TeamRow({ isMobile, team }) {
    const moduleLabel = team.level === 'dynamics' ? 'Dynamics' : 'Insight';
    const moduleColor = team.level === 'dynamics' ? 'var(--tof-accent-rose)' : 'var(--tof-accent-sage)';
    const inactiveStyle = !team.active ? { opacity: 0.45 } : {};

    return (
        <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'minmax(0, 1.4fr) 120px 120px 100px',
            gap: 12,
            alignItems: 'center',
            padding: '12px 14px',
            background: 'var(--tof-bg)',
            border: '1px solid var(--tof-border)',
            borderRadius: 10,
            ...inactiveStyle,
        }}>
            <div style={{ display: 'grid', gap: 2, minWidth: 0 }}>
                <div style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: 'var(--tof-text)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                }}>
                    {team.organization || '—'} {team.team ? `· ${team.team}` : ''}
                </div>
                <div style={{
                    fontSize: 11,
                    color: 'var(--tof-text-muted)',
                    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                    letterSpacing: 0.5,
                }}>
                    {team.code}
                </div>
            </div>
            <div style={{
                fontSize: 11,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: 1.2,
                color: moduleColor,
            }}>
                {moduleLabel}
            </div>
            <div style={{ fontSize: 13, color: 'var(--tof-text-muted)' }}>
                {team.response_count} {team.response_count === 1 ? 'response' : 'responses'}
            </div>
            <div style={{
                fontSize: 11,
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: 1.2,
                color: team.active ? 'var(--tof-accent-sage)' : 'var(--tof-text-muted)',
            }}>
                {team.active ? '● Actief' : '○ Inactief'}
            </div>
        </div>
    );
}

// ─── SUB: Managers ─────────────────────────────────────────────────────────

function ManagersSection({
    isMobile, teams, managers,
    emailInput, setEmailInput, codeInput, setCodeInput,
    busy, error, onAdd, onRemove,
}) {
    const inputStyle = {
        width: '100%',
        padding: '12px 14px',
        border: '1px solid var(--tof-border)',
        borderRadius: 10,
        fontSize: 15,
        fontFamily: 'inherit',
        background: 'var(--tof-bg)',
        color: 'var(--tof-text)',
        boxSizing: 'border-box',
    };
    const labelStyle = {
        display: 'block',
        fontSize: 11,
        textTransform: 'uppercase',
        letterSpacing: 1.2,
        fontWeight: 700,
        color: 'var(--tof-text-muted)',
        marginBottom: 6,
    };

    const activeTeams = (teams || []).filter((t) => t.active);

    return (
        <div style={{
            background: 'var(--tof-surface)',
            border: '1px solid var(--tof-border)',
            borderRadius: 14,
            padding: isMobile ? '20px 22px' : '24px 28px',
            display: 'grid',
            gap: 16,
        }}>
            <div style={{
                fontSize: 11,
                textTransform: 'uppercase',
                letterSpacing: 1.4,
                fontWeight: 700,
                color: 'var(--tof-accent-rose)',
            }}>
                Managers — directe team-toegang via email
            </div>
            <p style={{
                margin: 0,
                fontSize: 13,
                lineHeight: 1.6,
                color: 'var(--tof-text-soft)',
            }}>
                Koppel een manager-email aan een team-code. Bij hun eerste magic-link
                login zien ze het team(s) automatisch in hun toegangs-overzicht — zonder
                code in te voeren.
            </p>

            {/* Form: nieuwe koppeling */}
            <form onSubmit={onAdd} style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : '1.4fr 1fr auto',
                gap: 12,
                alignItems: 'end',
            }}>
                <div>
                    <label style={labelStyle}>Email manager</label>
                    <input
                        type="email"
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                        placeholder="a.kempeneers@nijkerk.eu"
                        style={inputStyle}
                    />
                </div>
                <div>
                    <label style={labelStyle}>Team-code</label>
                    <select
                        value={codeInput}
                        onChange={(e) => setCodeInput(e.target.value)}
                        style={{ ...inputStyle, cursor: 'pointer' }}
                    >
                        <option value="">— kies een team —</option>
                        {activeTeams.map((t) => (
                            <option key={t.code} value={t.code}>
                                {t.code} — {t.team || '(zonder naam)'}
                            </option>
                        ))}
                    </select>
                </div>
                <PrimaryButton type="submit" disabled={busy}>
                    {busy ? 'Bezig…' : 'Koppel'}
                </PrimaryButton>
            </form>

            {error && (
                <div style={{
                    background: 'rgba(176,82,82,0.08)',
                    border: '1px solid rgba(176,82,82,0.24)',
                    borderRadius: 8,
                    padding: '10px 14px',
                    color: 'var(--tof-accent-rose)',
                    fontSize: 13,
                }}>
                    {error}
                </div>
            )}

            {/* Lijst gekoppelde managers */}
            <div style={{
                fontSize: 11,
                textTransform: 'uppercase',
                letterSpacing: 1.4,
                fontWeight: 700,
                color: 'var(--tof-text-muted)',
                marginTop: 6,
            }}>
                Gekoppeld ({managers.length})
            </div>

            {managers.length === 0 ? (
                <div style={{
                    padding: 24,
                    color: 'var(--tof-text-muted)',
                    fontSize: 14,
                    textAlign: 'center',
                    border: '1px dashed var(--tof-border)',
                    borderRadius: 10,
                }}>
                    Nog geen managers gekoppeld. (Of de SQL-migratie is nog niet gedraaid.)
                </div>
            ) : (
                <div style={{ display: 'grid', gap: 8 }}>
                    {managers.map((m) => (
                        <ManagerRow
                            key={m.id}
                            isMobile={isMobile}
                            manager={m}
                            busy={busy}
                            onRemove={() => onRemove(m.id)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

function ManagerRow({ isMobile, manager, busy, onRemove }) {
    return (
        <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'minmax(0, 1.6fr) minmax(0, 1.4fr) 110px 100px',
            gap: 12,
            alignItems: 'center',
            padding: '12px 14px',
            background: 'var(--tof-bg)',
            border: '1px solid var(--tof-border)',
            borderRadius: 10,
        }}>
            <div style={{
                fontSize: 14,
                fontWeight: 600,
                color: 'var(--tof-text)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
            }}>
                {manager.email}
            </div>
            <div style={{
                fontSize: 13,
                color: 'var(--tof-text-muted)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
            }}>
                {manager.team || '—'}
            </div>
            <div style={{
                fontSize: 11,
                color: 'var(--tof-text-muted)',
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                letterSpacing: 0.5,
            }}>
                {manager.team_code}
            </div>
            <SecondaryButton onClick={onRemove} disabled={busy}>
                Verwijder
            </SecondaryButton>
        </div>
    );
}
