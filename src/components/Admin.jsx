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

import React, { useEffect, useMemo, useState } from 'react';
import {
    isCurrentUserAdmin,
    getCurrentUser,
    getAllTeamAccessCodes,
    createTeamAccessCode,
    adminListTeamManagers,
    adminAddTeamManager,
    adminRemoveTeamManager,
    getResponsesByTeam,
    getResponsesByOrganization,
    adminListOrgObservations,
    adminAddOrgObservation,
    adminRemoveOrgObservation,
} from '../supabase';
import {
    PageShell,
    HeroBlock,
    PrimaryButton,
    SecondaryButton,
    SectionCard,
    SectionEyebrow,
    TileGrid,
    Tile,
} from '../ui/AppShell';
import { SPACING, TYPE, RADIUS, MODULE } from '../ui/tokens';

import { buildTeamAggregate } from '../utils/TeamAggregation';
import { buildTeamInsights } from '../utils/TeamInsights';
import { generateTeamInsightPDF } from '../utils/teamInsightPDF';
import { generateOrganisatieLandschapPDF as generateOrganizationInsightPDF } from '../utils/organisatieLandschap/OrganisatieLandschap';
import { TILES } from './TeamDashboard.jsx';
import TeamDynamics from './TeamDynamics.jsx';

const INSIGHT_ACCENT = MODULE.insight.accent;
const DYNAMICS_ACCENT = MODULE.dynamics.accent;

// Genormaliseerde sleutel voor team-matching: lege waarden → '', anders
// getrimd + lowercase. Zo gelden "TEAM-A ", "team-a" en "Team-A" als gelijk.
function normKey(s) {
    return String(s ?? '').trim().toLowerCase();
}

// Bepaalt of een response bij een team hoort. Match op team-code óf op teamnaam
// (binnen dezelfde organisatie), beide genormaliseerd zodat hoofdletter- en
// spatieverschillen geen responses meer "los" laten vallen.
function responseMatchesTeam(r, t) {
    const rCode = normKey(r.invite_code);
    const tCode = normKey(t.code);
    if (rCode && tCode && rCode === tCode) return true;

    const rTeam = normKey(r.team);
    const tTeam = normKey(t.team);
    if (rTeam && tTeam && rTeam === tTeam) {
        const rOrg = normKey(r.organization);
        const tOrg = normKey(t.organization);
        if (!rOrg || rOrg === tOrg) return true;
    }
    return false;
}

// ─── HOOFDCOMPONENT ─────────────────────────────────────────────────────────

export default function Admin({ setPage, setSelectedTeam, setTeamResponses }) {
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

    // Organisatie-detail state — null = overzicht, anders = detail-view
    const [selectedOrg, setSelectedOrg] = useState(null);

    // Echte (gededupliceerde) response-telling per organisatie, opgehaald via
    // getResponsesByOrganization zodat de overzichtslijst hetzelfde getal toont
    // als de organisatie-detailpagina. Keyed op org-naam.
    const [orgResponseCounts, setOrgResponseCounts] = useState({});

    // Organisaties afgeleid uit teams + managers — één entry per unieke
    // organisation-naam, met team-, response- en manager-tellingen.
    const organizations = useMemo(() => {
        const map = new Map();
        (teams || []).forEach((t) => {
            const org = (t.organization || '').trim();
            if (!org) return;
            if (!map.has(org)) {
                map.set(org, {
                    name: org,
                    teamCount: 0,
                    responseCount: 0,
                    managerCount: 0,
                    teams: [],
                });
            }
            const entry = map.get(org);
            entry.teamCount += 1;
            entry.responseCount += Number(t.response_count || 0);
            entry.teams.push(t);
        });
        (managers || []).forEach((m) => {
            const org = (m.organization || '').trim();
            if (org && map.has(org)) {
                map.get(org).managerCount += 1;
            }
        });
        return Array.from(map.values()).sort((a, b) =>
            a.name.localeCompare(b.name, 'nl', { sensitivity: 'base' })
        );
    }, [teams, managers]);

    // Haal per organisatie de echte (over de hele org gededupliceerde)
    // response-telling op. Dit komt overeen met wat de detailpagina toont,
    // i.t.t. de som van per-team-tellingen (die org-getagde responses zonder
    // matchende teamcode mist en dubbeltellingen kan bevatten).
    useEffect(() => {
        let cancelled = false;
        async function loadCounts() {
            const entries = await Promise.all(
                organizations.map(async (org) => {
                    const codes = (org.teams || []).map((t) => t.code).filter(Boolean);
                    const data = await getResponsesByOrganization(org.name, codes);
                    return [org.name, (data || []).length];
                })
            );
            if (cancelled) return;
            setOrgResponseCounts(Object.fromEntries(entries));
        }
        if (organizations.length > 0) loadCounts();
        return () => { cancelled = true; };
    }, [organizations]);

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

    // ── Detail-weergave per organisatie ────────────────────────────────
    if (selectedOrg) {
        const orgEntry = organizations.find((o) => o.name === selectedOrg);
        if (orgEntry) {
            return (
                <OrganizationDetail
                    org={orgEntry}
                    managers={managers}
                    managerForm={{
                        emailInput: managerEmailInput,
                        setEmailInput: setManagerEmailInput,
                        codeInput: managerCodeInput,
                        setCodeInput: setManagerCodeInput,
                        busy: managerBusy,
                        error: managerError,
                        onAdd: handleAddManager,
                        onRemove: handleRemoveManager,
                    }}
                    isMobile={isMobile}
                    onBack={() => setSelectedOrg(null)}
                    setPage={setPage}
                    setSelectedTeam={setSelectedTeam}
                    setTeamResponses={setTeamResponses}
                />
            );
        }
    }

    // ── Admin overzicht ────────────────────────────────────────────────
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

                {/* Organisaties — klik om in te duiken */}
                <OrganizationsList
                    isMobile={isMobile}
                    organizations={organizations}
                    responseCounts={orgResponseCounts}
                    onSelect={setSelectedOrg}
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

    // Persoonlijke deelnemer-link: organisatie én teamcode zitten in de URL,
    // zodat de quiz die automatisch herkent en voorvult. Teamleden hoeven
    // niets meer over te typen.
    const quizUrl =
        `https://tof-persona-tool.netlify.app/quiz` +
        `?org=${encodeURIComponent(info.organization || '')}` +
        `&code=${encodeURIComponent(info.code || '')}`;

    const mailBody = `Beste ${capitalize(recipientName)},

Fijn dat we deze stap samen zetten. Hieronder alles wat je nodig hebt om jouw team aan de slag te laten gaan.

JULLIE TEAMCODE
${info.code}

Deze code zit al verwerkt in de link hieronder, zodat de tool de antwoorden automatisch aan jullie team koppelt.

WAT JE TEAMLEDEN DOEN (15 minuten per persoon)
1. Open de persoonlijke teamlink: ${quizUrl}
2. Organisatie, afdeling en teamcode staan al ingevuld — alleen voornaam toevoegen
3. Vul de quiz in — ze beantwoorden ~30 stellingen
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

// ─── SUB: Organisaties lijst (overzicht) ───────────────────────────────────

function OrganizationsList({ isMobile, organizations, responseCounts = {}, onSelect }) {
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
                Organisaties ({organizations.length})
            </div>

            {organizations.length === 0 ? (
                <div style={{
                    padding: 24,
                    color: 'var(--tof-text-muted)',
                    fontSize: 14,
                    textAlign: 'center',
                }}>
                    Nog geen organisaties met teams.
                </div>
            ) : (
                <div style={{ display: 'grid', gap: 10 }}>
                    {organizations.map((org) => (
                        <button
                            key={org.name}
                            type="button"
                            onClick={() => onSelect(org.name)}
                            style={{
                                textAlign: 'left',
                                background: 'var(--tof-bg)',
                                border: '1px solid var(--tof-border)',
                                borderRadius: 10,
                                padding: '14px 16px',
                                cursor: 'pointer',
                                display: 'grid',
                                gridTemplateColumns: isMobile
                                    ? '1fr'
                                    : 'minmax(0, 1.4fr) 90px 110px 110px 80px',
                                gap: 12,
                                alignItems: 'center',
                                fontFamily: 'inherit',
                            }}
                        >
                            <div style={{
                                fontFamily: 'var(--tof-font-heading)',
                                fontSize: 18,
                                color: 'var(--tof-text)',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                            }}>
                                {org.name}
                            </div>
                            <div style={{ fontSize: 13, color: 'var(--tof-text-muted)' }}>
                                {org.teamCount} {org.teamCount === 1 ? 'team' : 'teams'}
                            </div>
                            <div style={{ fontSize: 13, color: 'var(--tof-text-muted)' }}>
                                {(() => {
                                    const count = responseCounts[org.name] ?? org.responseCount;
                                    return `${count} ${count === 1 ? 'response' : 'responses'}`;
                                })()}
                            </div>
                            <div style={{ fontSize: 13, color: 'var(--tof-text-muted)' }}>
                                {org.managerCount} {org.managerCount === 1 ? 'manager' : 'managers'}
                            </div>
                            <div style={{
                                fontSize: 13,
                                fontWeight: 600,
                                color: INSIGHT_ACCENT,
                                textAlign: 'right',
                            }}>
                                Bekijk →
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

// ─── SUB: Organisatie-detail ───────────────────────────────────────────────

function OrganizationDetail({
    org, managers, managerForm, isMobile, onBack,
    setPage, setSelectedTeam, setTeamResponses,
}) {
    const [responses, setResponses] = useState([]);
    const [loadingResponses, setLoadingResponses] = useState(true);
    const [activeTileId, setActiveTileId] = useState('personas');
    const [openingTeamCode, setOpeningTeamCode] = useState(null);
    const [moduleSel, setModuleSel] = useState('insight');
    // Eigen observaties per organisatie — handmatige input naast data-driven inzichten.
    const [observations, setObservations] = useState([]);
    const [obsForm, setObsForm] = useState({ leegloper: '', werkt_goed: '' });
    const [obsBusy, setObsBusy] = useState(false);
    const [obsError, setObsError] = useState(null);

    const moduleAccent = moduleSel === 'dynamics' ? DYNAMICS_ACCENT : INSIGHT_ACCENT;

    useEffect(() => {
        let cancelled = false;
        setLoadingResponses(true);
        (async () => {
            const codes = (org?.teams || []).map((t) => t.code).filter(Boolean);
            const data = await getResponsesByOrganization(org.name, codes);
            if (cancelled) return;
            setResponses(data || []);
            setLoadingResponses(false);
        })();
        return () => { cancelled = true; };
    }, [org]);

    // Laad observaties wanneer organisatie wijzigt.
    useEffect(() => {
        let cancelled = false;
        (async () => {
            const data = await adminListOrgObservations(org.name);
            if (cancelled) return;
            setObservations(data || []);
        })();
        return () => { cancelled = true; };
    }, [org]);

    async function handleAddObservation(category) {
        const content = (obsForm[category] || '').trim();
        if (!content) return;
        setObsBusy(true);
        setObsError(null);
        const { row, error } = await adminAddOrgObservation({
            organization: org.name,
            category,
            content,
        });
        setObsBusy(false);
        if (error) {
            setObsError(error.message || 'Toevoegen mislukt.');
            return;
        }
        if (row) {
            setObservations((prev) => [...prev, row]);
            setObsForm((prev) => ({ ...prev, [category]: '' }));
        }
    }

    async function handleRemoveObservation(id) {
        setObsBusy(true);
        const { error } = await adminRemoveOrgObservation(id);
        setObsBusy(false);
        if (error) {
            setObsError(error.message || 'Verwijderen mislukt.');
            return;
        }
        setObservations((prev) => prev.filter((o) => o.id !== id));
    }

    const aggregate = useMemo(() => buildTeamAggregate(responses), [responses]);
    const insights = useMemo(() => buildTeamInsights(aggregate), [aggregate]);

    // Per-team aggregaten voor vergelijkings-blok.
    const teamSummaries = useMemo(() => {
        return (org?.teams || []).map((t) => {
            const forTeam = responses.filter((r) => responseMatchesTeam(r, t));
            const agg = buildTeamAggregate(forTeam);
            const top = agg?.topPersonaByPrimary || agg?.personasByPrimary?.[0];
            return {
                team: t,
                responseCount: forTeam.length,
                dominant: top ? `${top.name} ${top.countPercentage}%` : '—',
                responses: forTeam,
                aggregate: agg,
            };
        }).sort((a, b) => b.responseCount - a.responseCount);
    }, [org, responses]);

    // ── TIJDELIJKE DIAGNOSE: welke responses koppelen NIET aan een team?
    // Toont per niet-gematchte response waarom de match faalt, zodat de
    // "X niet aan een team gekoppeld" in het rapport te verklaren is.
    // TODO: verwijderen zodra de oorzaak bekend is.
    useEffect(() => {
        const teams = org?.teams || [];
        if (!teams.length || !responses.length) return;

        const unmatched = responses.filter(
            (r) => !teams.some((t) => responseMatchesTeam(r, t)),
        );
        // eslint-disable-next-line no-console
        console.log(
            `[ORG-DIAGNOSE] ${org?.name || '?'} — totaal ${responses.length}, `
            + `niet gekoppeld: ${unmatched.length}`,
        );
        if (unmatched.length > 0) {
            // eslint-disable-next-line no-console
            console.table(unmatched.map((r) => ({
                name: r.name || '(anoniem)',
                invite_code: r.invite_code ?? '(leeg)',
                team: r.team ?? '(leeg)',
                organization: r.organization ?? '(leeg)',
            })));
            const codeSet = new Set(teams.map((t) => t.code).filter(Boolean));
            const teamSet = new Set(teams.map((t) => t.team).filter(Boolean));
            // eslint-disable-next-line no-console
            console.log('[ORG-DIAGNOSE] geregistreerde team-codes:', [...codeSet]);
            // eslint-disable-next-line no-console
            console.log('[ORG-DIAGNOSE] geregistreerde team-namen:', [...teamSet]);
        }
    }, [org, responses]);

    // Managers en team-codes gefilterd op deze organisatie.
    const orgCodes = useMemo(
        () => new Set((org?.teams || []).map((t) => t.code).filter(Boolean)),
        [org]
    );
    const orgManagers = useMemo(
        () => (managers || []).filter((m) => orgCodes.has(m.team_code)),
        [managers, orgCodes]
    );

    const activeTile = TILES.find((t) => t.id === activeTileId);

    function handleTileClick(id) {
        setActiveTileId((prev) => (prev === id ? null : id));
    }

    async function handleViewTeam(summary) {
        if (openingTeamCode) return;
        setOpeningTeamCode(summary.team.code);
        try {
            if (typeof setSelectedTeam === 'function') {
                setSelectedTeam({
                    team: summary.team.team,
                    organization: summary.team.organization,
                    code: summary.team.code,
                    level: summary.team.level,
                });
            }
            const data = summary.responses && summary.responses.length > 0
                ? summary.responses
                : await getResponsesByTeam(summary.team.team, summary.team.organization, summary.team.code);
            if (typeof setTeamResponses === 'function') {
                setTeamResponses(data || []);
            }
            if (typeof setPage === 'function') {
                setPage(summary.team.level === 'dynamics' ? 'teamdynamics' : 'teamdashboard');
            }
        } finally {
            setOpeningTeamCode(null);
        }
    }

    return (
        <PageShell compact>
            <button
                type="button"
                onClick={onBack}
                style={{
                    background: 'transparent',
                    border: 'none',
                    padding: 0,
                    fontSize: 13,
                    color: 'var(--tof-text-muted)',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    textAlign: 'left',
                    width: 'fit-content',
                }}
            >
                ← Terug naar Admin
            </button>

            <HeroBlock
                compact
                eyebrow="TOF — ADMIN · ORGANISATIE"
                title="Organisatie-inzicht voor"
                titleAccent={org.name}
                titleAccentColor={moduleAccent}
                lead={`Geaggregeerd over ${org.teamCount} ${org.teamCount === 1 ? 'team' : 'teams'} en ${responses.length} ${responses.length === 1 ? 'response' : 'responses'}.`}
                actions={
                    moduleSel === 'insight' && responses.length > 0 ? (
                        <PrimaryButton
                            onClick={() => generateOrganizationInsightPDF({
                                aggregate,
                                insights,
                                teamSummaries,
                                organizationName: org.name,
                                observations,
                            })}
                            style={{ background: INSIGHT_ACCENT }}
                        >
                            Download als PDF
                        </PrimaryButton>
                    ) : null
                }
            />

            <ModuleToggle
                value={moduleSel}
                onChange={setModuleSel}
                isMobile={isMobile}
            />

            {loadingResponses ? (
                <div style={{ padding: 32, textAlign: 'center', color: 'var(--tof-text-muted)' }}>
                    Responses laden…
                </div>
            ) : (
                <>
                    {moduleSel === 'insight' ? (
                        <>
                            <TileGrid columns={4}>
                                {TILES.map((tile) => (
                                    <Tile
                                        key={tile.id}
                                        eyebrow={tile.eyebrow}
                                        value={tile.buildValue(aggregate, insights)}
                                        hint={tile.buildHint(aggregate, insights)}
                                        accent={INSIGHT_ACCENT}
                                        isActive={activeTileId === tile.id}
                                        onClick={() => handleTileClick(tile.id)}
                                    />
                                ))}
                            </TileGrid>

                            {activeTile ? (
                                <SectionCard accent={INSIGHT_ACCENT} padding={0}>
                                    <div style={{
                                        padding: '22px 22px 8px',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'flex-start',
                                        gap: SPACING.md,
                                    }}>
                                        <div style={{ display: 'grid', gap: SPACING.sm, flex: 1 }}>
                                            <SectionEyebrow color={INSIGHT_ACCENT}>
                                                {activeTile.eyebrow}
                                            </SectionEyebrow>
                                            <h2 style={{ ...TYPE.heading, fontSize: 24 }}>
                                                {activeTile.detailTitle}
                                            </h2>
                                            {activeTile.detailLead(aggregate, insights) ? (
                                                <p style={{ ...TYPE.body, maxWidth: 620 }}>
                                                    {activeTile.detailLead(aggregate, insights)}
                                                </p>
                                            ) : null}
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setActiveTileId(null)}
                                            style={{
                                                background: 'transparent',
                                                border: '1px solid var(--tof-border)',
                                                borderRadius: RADIUS.pill,
                                                padding: '4px 12px',
                                                fontSize: 12,
                                                color: 'var(--tof-text-muted)',
                                                cursor: 'pointer',
                                                fontFamily: 'var(--tof-font-body)',
                                                fontWeight: 500,
                                                flexShrink: 0,
                                            }}
                                        >
                                            Sluiten ✕
                                        </button>
                                    </div>
                                    <div style={{ padding: '0 22px 22px' }}>
                                        {activeTile.render(aggregate, insights)}
                                    </div>
                                </SectionCard>
                            ) : null}
                        </>
                    ) : (
                        <TeamDynamics
                            embedded
                            forceAccess
                            teamResponses={responses}
                            selectedTeam={{
                                team: org.name,
                                organization: org.name,
                                code: null,
                                level: 'dynamics',
                            }}
                            setPage={setPage}
                        />
                    )}

                    {/* ── Teams in deze organisatie ── */}
                    <SectionCard padding={isMobile ? '20px 22px' : '24px 28px'}>
                        <div style={{ display: 'grid', gap: 14 }}>
                            <div style={{
                                fontSize: 11,
                                textTransform: 'uppercase',
                                letterSpacing: 1.4,
                                fontWeight: 700,
                                color: 'var(--tof-text-muted)',
                            }}>
                                Teams in deze organisatie ({teamSummaries.length})
                            </div>

                            <div style={{ display: 'grid', gap: 10 }}>
                                {teamSummaries.map((s) => {
                                    const inactive = !s.team.active;
                                    const busy = openingTeamCode === s.team.code;
                                    return (
                                        <div
                                            key={s.team.code}
                                            style={{
                                                display: 'grid',
                                                gridTemplateColumns: isMobile
                                                    ? '1fr'
                                                    : 'minmax(0, 1.4fr) 120px 160px 110px',
                                                gap: 12,
                                                alignItems: 'center',
                                                padding: '12px 14px',
                                                background: 'var(--tof-bg)',
                                                border: '1px solid var(--tof-border)',
                                                borderRadius: 10,
                                                opacity: inactive ? 0.5 : 1,
                                            }}
                                        >
                                            <div style={{ display: 'grid', gap: 2, minWidth: 0 }}>
                                                <div style={{
                                                    fontSize: 14,
                                                    fontWeight: 600,
                                                    color: 'var(--tof-text)',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap',
                                                }}>
                                                    {s.team.team || '—'}
                                                </div>
                                                <div style={{
                                                    fontSize: 11,
                                                    color: 'var(--tof-text-muted)',
                                                    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                                                    letterSpacing: 0.5,
                                                }}>
                                                    {s.team.code}
                                                </div>
                                            </div>
                                            <div style={{ fontSize: 13, color: 'var(--tof-text-muted)' }}>
                                                {s.responseCount} {s.responseCount === 1 ? 'response' : 'responses'}
                                            </div>
                                            <div style={{ fontSize: 13, color: 'var(--tof-text)' }}>
                                                {s.dominant}
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => handleViewTeam(s)}
                                                disabled={inactive || busy || s.responseCount === 0}
                                                style={{
                                                    padding: '8px 12px',
                                                    fontSize: 12,
                                                    fontWeight: 600,
                                                    background: 'var(--tof-surface)',
                                                    border: '1px solid var(--tof-border)',
                                                    borderRadius: 8,
                                                    cursor: (inactive || busy || s.responseCount === 0)
                                                        ? 'not-allowed'
                                                        : 'pointer',
                                                    color: 'var(--tof-text)',
                                                    fontFamily: 'inherit',
                                                    whiteSpace: 'nowrap',
                                                }}
                                            >
                                                {busy ? '…' : 'Bekijk team →'}
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </SectionCard>

                    {/* ── Eigen observaties (handmatig per organisatie) ── */}
                    <ObservationsSection
                        observations={observations}
                        form={obsForm}
                        setForm={setObsForm}
                        busy={obsBusy}
                        error={obsError}
                        onAdd={handleAddObservation}
                        onRemove={handleRemoveObservation}
                    />

                    {/* ── Managers van deze organisatie ── */}
                    <ManagersSection
                        isMobile={isMobile}
                        teams={org.teams}
                        managers={orgManagers}
                        emailInput={managerForm.emailInput}
                        setEmailInput={managerForm.setEmailInput}
                        codeInput={managerForm.codeInput}
                        setCodeInput={managerForm.setCodeInput}
                        busy={managerForm.busy}
                        error={managerForm.error}
                        onAdd={managerForm.onAdd}
                        onRemove={managerForm.onRemove}
                    />

                    {/* ── Bestuurder (placeholder voor toekomstige functie) ── */}
                    <BestuurderPlaceholder isMobile={isMobile} orgName={org.name} />
                </>
            )}
        </PageShell>
    );
}

// ─── SUB: Module-toggle ────────────────────────────────────────────────────

function ModuleToggle({ value, onChange, isMobile }) {
    const options = [
        { id: 'insight', label: '01 — Team Insight', accent: INSIGHT_ACCENT },
        { id: 'dynamics', label: '02 — Team Dynamics', accent: DYNAMICS_ACCENT },
    ];

    return (
        <div
            role="tablist"
            aria-label="Module"
            style={{
                display: 'inline-flex',
                gap: 4,
                padding: 4,
                background: 'var(--tof-surface)',
                border: '1px solid var(--tof-border)',
                borderRadius: 999,
                width: 'fit-content',
            }}
        >
            {options.map((opt) => {
                const active = value === opt.id;
                return (
                    <button
                        key={opt.id}
                        type="button"
                        role="tab"
                        aria-selected={active}
                        onClick={() => onChange(opt.id)}
                        style={{
                            padding: isMobile ? '8px 14px' : '10px 18px',
                            fontSize: 12,
                            fontWeight: 600,
                            fontFamily: 'inherit',
                            border: 'none',
                            borderRadius: 999,
                            cursor: 'pointer',
                            background: active ? opt.accent : 'transparent',
                            color: active ? '#fff' : 'var(--tof-text-muted)',
                            letterSpacing: 0.3,
                            transition: 'background 0.15s, color 0.15s',
                        }}
                    >
                        {opt.label}
                    </button>
                );
            })}
        </div>
    );
}

// ─── SUB: Bestuurder placeholder ───────────────────────────────────────────

function BestuurderPlaceholder({ isMobile, orgName }) {
    return (
        <div style={{
            background: 'var(--tof-surface)',
            border: '1px dashed var(--tof-border)',
            borderRadius: 14,
            padding: isMobile ? '20px 22px' : '24px 28px',
            display: 'grid',
            gap: 8,
        }}>
            <div style={{
                fontSize: 11,
                textTransform: 'uppercase',
                letterSpacing: 1.4,
                fontWeight: 700,
                color: 'var(--tof-text-muted)',
            }}>
                Bestuurder
            </div>
            <div style={{
                fontFamily: 'var(--tof-font-heading)',
                fontSize: 18,
                color: 'var(--tof-text)',
            }}>
                Komt binnenkort
            </div>
            <p style={{
                margin: 0,
                fontSize: 13,
                lineHeight: 1.55,
                color: 'var(--tof-text-soft)',
                maxWidth: 620,
            }}>
                Hier kun je straks een bestuurder of directielid koppelen aan
                <strong> {orgName}</strong>. Hij of zij krijgt op organisatie-niveau
                dezelfde inzichten als een manager binnen één team.
            </p>
        </div>
    );
}

// ─── SUB: Eigen observaties ───────────────────────────────────────────────
// Handmatige input naast data-driven inzichten. Twee categorieën: leegloper
// (akoestiek, no-shows, niet nakomen afspraken) en werkt_goed (sterktes,
// patronen). Verschijnen in de organisatie-PDF.

const OBSERVATION_CATEGORIES = [
    {
        key: 'leegloper',
        label: 'Waar de organisatie op leegloopt',
        helper: 'Bv. akoestiek, no-shows, niet nakomen van afspraken.',
        accent: 'var(--tof-accent-rose)',
        placeholder: 'akoestiek op de werkvloer',
    },
    {
        key: 'werkt_goed',
        label: 'Wat werkt goed in de organisatie',
        helper: 'Bv. open feedbackcultuur, snelle besluitvorming.',
        accent: 'var(--tof-accent-sage)',
        placeholder: 'open feedbackcultuur tussen teams',
    },
];

function ObservationsSection({ observations, form, setForm, busy, error, onAdd, onRemove }) {
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

    return (
        <div style={{
            background: 'var(--tof-surface)',
            border: '1px solid var(--tof-border)',
            borderRadius: 14,
            padding: '24px 28px',
            display: 'grid',
            gap: 20,
        }}>
            <div>
                <div style={{
                    fontSize: 11,
                    textTransform: 'uppercase',
                    letterSpacing: 1.4,
                    fontWeight: 700,
                    color: '#A37A4E',
                    marginBottom: 4,
                }}>
                    Eigen observaties — handmatig per organisatie
                </div>
                <p style={{
                    margin: 0,
                    fontSize: 13,
                    lineHeight: 1.6,
                    color: 'var(--tof-text-soft)',
                }}>
                    Naast de data-driven inzichten uit de persona-responses kun je
                    hier zelf observaties toevoegen die in de organisatie-PDF
                    verschijnen.
                </p>
            </div>

            {OBSERVATION_CATEGORIES.map((cat) => {
                const items = (observations || []).filter((o) => o.category === cat.key);
                return (
                    <div key={cat.key} style={{
                        display: 'grid',
                        gap: 12,
                        paddingTop: 8,
                        borderTop: '1px dashed var(--tof-border)',
                    }}>
                        <div>
                            <div style={{
                                fontSize: 11,
                                textTransform: 'uppercase',
                                letterSpacing: 1.2,
                                fontWeight: 700,
                                color: cat.accent,
                                marginBottom: 4,
                            }}>
                                {cat.label}
                            </div>
                            <div style={{
                                fontSize: 12,
                                color: 'var(--tof-text-muted)',
                            }}>
                                {cat.helper}
                            </div>
                        </div>

                        {items.length > 0 && (
                            <ul style={{
                                listStyle: 'none',
                                margin: 0,
                                padding: 0,
                                display: 'grid',
                                gap: 6,
                            }}>
                                {items.map((it) => (
                                    <li key={it.id} style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        gap: 12,
                                        padding: '10px 14px',
                                        background: 'var(--tof-bg)',
                                        border: '1px solid var(--tof-border)',
                                        borderRadius: 10,
                                    }}>
                                        <span style={{ fontSize: 14, color: 'var(--tof-text)' }}>
                                            {it.content}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => onRemove(it.id)}
                                            disabled={busy}
                                            style={{
                                                background: 'transparent',
                                                border: 'none',
                                                color: 'var(--tof-text-muted)',
                                                fontSize: 13,
                                                cursor: busy ? 'not-allowed' : 'pointer',
                                                padding: '4px 8px',
                                            }}
                                            title="Verwijderen"
                                        >
                                            ✕
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}

                        <form
                            onSubmit={(e) => { e.preventDefault(); onAdd(cat.key); }}
                            style={{
                                display: 'grid',
                                gridTemplateColumns: '1fr auto',
                                gap: 10,
                            }}
                        >
                            <input
                                type="text"
                                value={form[cat.key] || ''}
                                onChange={(e) => setForm((p) => ({ ...p, [cat.key]: e.target.value }))}
                                placeholder={cat.placeholder}
                                style={inputStyle}
                                disabled={busy}
                            />
                            <PrimaryButton type="submit" disabled={busy || !(form[cat.key] || '').trim()}>
                                Toevoegen
                            </PrimaryButton>
                        </form>
                    </div>
                );
            })}

            {error && (
                <div style={{
                    fontSize: 13,
                    color: 'var(--tof-accent-rose)',
                    padding: '8px 12px',
                    background: 'rgba(192, 95, 95, 0.08)',
                    borderRadius: 8,
                }}>
                    {error}
                </div>
            )}
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
