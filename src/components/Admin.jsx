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
import { useAuth } from '../auth/AuthContext';
import {
    isCurrentUserAdmin,
    sendMagicLink,
    signInWithPassword,
    logPdfDownload,
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
import { generateOrganisatieLandschapPDF as generateOrganizationInsightPDF } from '../utils/organisatieLandschap/OrganisatieLandschap';
import { buildTiles } from './TeamDashboard.jsx';
import TeamDynamics from './TeamDynamics.jsx';
import { useCopy, useLang } from '../i18n/LanguageContext';

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
    const { admin: t, common } = useCopy();
    const { user, loading: authLoading } = useAuth();
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
            a.name.localeCompare(b.name, common.locale, { sensitivity: 'base' })
        );
    }, [teams, managers, common.locale]);

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

    // Gating + teams laden. Re-runt zodra de sessie verandert (bv. na
    // wachtwoord-login hieronder), zodat de admin-check opnieuw draait.
    useEffect(() => {
        let cancelled = false;
        async function bootstrap() {
            // Wacht tot AuthContext de sessie heeft bepaald.
            if (authLoading) return;
            setLoading(true);
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
    }, [user, authLoading]);

    async function handleCreate(e) {
        e?.preventDefault?.();
        setCreateError('');
        if (!orgInput.trim() || !teamInput.trim()) {
            setCreateError(t.createTeam.errors.required);
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
                setCreateError(result.error.message || t.createTeam.errors.failed);
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
            setCreateError(err?.message || t.createTeam.errors.unknown);
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
            setManagerError(t.managers.errors.required);
            return;
        }
        if (!email.includes('@')) {
            setManagerError(t.managers.errors.invalidEmail);
            return;
        }
        setManagerBusy(true);
        try {
            const { error } = await adminAddTeamManager({ email, teamCode: code });
            if (error) {
                setManagerError(error.message || t.managers.errors.linkFailed);
                return;
            }
            setManagerEmailInput('');
            setManagerCodeInput('');
            const refreshed = await adminListTeamManagers();
            setManagers(refreshed);
        } catch (err) {
            setManagerError(err?.message || t.managers.errors.unknown);
        } finally {
            setManagerBusy(false);
        }
    }

    async function handleRemoveManager(id) {
        setManagerBusy(true);
        try {
            const { error } = await adminRemoveTeamManager(id);
            if (error) {
                setManagerError(error.message || t.managers.errors.removeFailed);
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
                    {t.gate.checking}
                </div>
            </PageShell>
        );
    }

    if (!authorized) {
        // Niet ingelogd → toon wachtwoord-login (alleen op de admin-pagina).
        if (!user) {
            return <AdminLogin />;
        }
        // Wel ingelogd, maar geen admin-rechten.
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
                        {t.noAccess.eyebrow}
                    </div>
                    <h1 style={{
                        margin: '0 0 12px',
                        fontFamily: "'Playfair Display', serif",
                        fontWeight: 500,
                        fontSize: 28,
                    }}>
                        {t.noAccess.title}
                    </h1>
                    <p style={{ color: 'var(--tof-text-soft)', lineHeight: 1.6, margin: '0 0 24px' }}>
                        {t.noAccess.body}
                    </p>
                    <PrimaryButton onClick={() => setPage && setPage('home')}>
                        {t.noAccess.backHome}
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
                            {t.hero.eyebrow}
                        </div>
                        <h1 style={{
                            margin: 0,
                            fontFamily: "'Playfair Display', serif",
                            fontWeight: 500,
                            fontSize: isMobile ? 'clamp(24px, 5vw, 32px)' : 'clamp(28px, 2.8vw, 36px)',
                            lineHeight: 1.15,
                        }}>
                            {t.hero.titleLead}
                            <em style={{ color: 'var(--tof-accent-rose)', fontStyle: 'italic' }}>{t.hero.titleAccent}</em>
                        </h1>
                        <p style={{
                            margin: 0,
                            fontSize: 14,
                            lineHeight: 1.6,
                            color: 'var(--tof-text-soft)',
                            maxWidth: 560,
                        }}>
                            {t.hero.lead}
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

                {/* Individuele tester uitnodigen — los van teams */}
                <InviteTesterCard isMobile={isMobile} />

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

// ─── SUB: Admin-login (e-mail + wachtwoord) ─────────────────────────────────
// Alleen op /admin. Na een geslaagde login werkt AuthContext de sessie bij,
// waardoor de admin-check in Admin opnieuw draait en het dashboard verschijnt.

function AdminLogin() {
    const { admin: { login: t } } = useCopy();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');

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

    async function handleSubmit(e) {
        e?.preventDefault?.();
        setError('');
        setBusy(true);
        const result = await signInWithPassword(email, password);
        if (!result.ok) {
            setError(result.error || t.failed);
            setBusy(false);
            return;
        }
        // Geslaagd: AuthContext pikt de sessie op → Admin re-runt de check.
        // busy bewust aan laten zodat de knop niet flikkert tijdens de overgang.
    }

    return (
        <PageShell>
            <div style={{
                maxWidth: 460,
                margin: '60px auto',
                padding: 32,
                background: 'var(--tof-surface)',
                border: '1px solid var(--tof-border)',
                borderRadius: 14,
            }}>
                <div style={{
                    fontSize: 11,
                    textTransform: 'uppercase',
                    letterSpacing: 1.6,
                    fontWeight: 700,
                    color: 'var(--tof-accent-rose)',
                    marginBottom: 12,
                }}>
                    {t.eyebrow}
                </div>
                <h1 style={{
                    margin: '0 0 20px',
                    fontFamily: "'Playfair Display', serif",
                    fontWeight: 500,
                    fontSize: 28,
                }}>
                    {t.title}
                </h1>

                <form onSubmit={handleSubmit} noValidate>
                    <label htmlFor="admin-email" style={labelStyle}>{t.emailLabel}</label>
                    <input
                        id="admin-email"
                        type="email"
                        inputMode="email"
                        autoComplete="username"
                        autoFocus
                        value={email}
                        onChange={(e) => { setEmail(e.target.value); if (error) setError(''); }}
                        placeholder={t.emailPlaceholder}
                        style={{ ...inputStyle, marginBottom: 16 }}
                    />

                    <label htmlFor="admin-password" style={labelStyle}>{t.passwordLabel}</label>
                    <input
                        id="admin-password"
                        type="password"
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => { setPassword(e.target.value); if (error) setError(''); }}
                        placeholder={t.passwordPlaceholder}
                        style={{ ...inputStyle, marginBottom: error ? 8 : 20 }}
                    />

                    {error ? (
                        <p role="alert" style={{
                            color: 'var(--tof-accent-rose)',
                            fontSize: 13,
                            margin: '0 0 16px',
                        }}>
                            {error}
                        </p>
                    ) : null}

                    <PrimaryButton type="submit" disabled={busy}>
                        {busy ? t.submitting : t.submit}
                    </PrimaryButton>
                </form>
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
    const { admin: { createTeam: t } } = useCopy();
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
                {t.eyebrow}
            </div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
                gap: 14,
            }}>
                <div>
                    <label style={labelStyle}>{t.organizationLabel}</label>
                    <input
                        type="text"
                        value={orgInput}
                        onChange={(e) => setOrgInput(e.target.value)}
                        placeholder={t.organizationPlaceholder}
                        style={inputStyle}
                        autoFocus
                    />
                </div>
                <div>
                    <label style={labelStyle}>{t.teamLabel}</label>
                    <input
                        type="text"
                        value={teamInput}
                        onChange={(e) => setTeamInput(e.target.value)}
                        placeholder={t.teamPlaceholder}
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
                    <label style={labelStyle}>{t.moduleLabel}</label>
                    <select
                        value={levelInput}
                        onChange={(e) => setLevelInput(e.target.value)}
                        style={{ ...inputStyle, cursor: 'pointer' }}
                    >
                        <option value="insight">{t.moduleOptions.insight}</option>
                        <option value="dynamics">{t.moduleOptions.dynamics}</option>
                    </select>
                </div>
                <div>
                    <label style={labelStyle}>{t.leaderEmailLabel}</label>
                    <input
                        type="email"
                        value={leaderEmail}
                        onChange={(e) => setLeaderEmail(e.target.value)}
                        placeholder={t.leaderEmailPlaceholder}
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
                    {createLoading ? t.submitting : t.submit}
                </PrimaryButton>
                <span style={{ fontSize: 12, color: 'var(--tof-text-muted)' }}>
                    {t.hint}
                </span>
            </div>
        </form>
    );
}

// ─── SUB: Just-created (welkomstmail preview) ──────────────────────────────

function JustCreatedCard({ isMobile, info, onDismiss }) {
    const { admin: { justCreated: t } } = useCopy();
    const [copied, setCopied] = useState(false);

    const moduleLabel = info.level === 'dynamics'
        ? t.moduleLabels.dynamics
        : t.moduleLabels.insight;
    const recipientName = info.leaderEmail
        ? info.leaderEmail.split('@')[0].split('.')[0]
        : t.fallbackRecipient; // voorbeeldnaam
    const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);

    // Persoonlijke deelnemer-link: organisatie én teamcode zitten in de URL,
    // zodat de quiz die automatisch herkent en voorvult. Teamleden hoeven
    // niets meer over te typen.
    const quizUrl =
        `https://tof-persona-tool.netlify.app/quiz` +
        `?org=${encodeURIComponent(info.organization || '')}` +
        `&code=${encodeURIComponent(info.code || '')}`;

    const mailBody = t.mailBody({
        recipient: capitalize(recipientName),
        code: info.code,
        quizUrl,
    });

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
                        {t.eyebrow}
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
                <SecondaryButton onClick={onDismiss}>{t.dismiss}</SecondaryButton>
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
                        {t.codeLabel}
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
                    {t.copyCode}
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
                    {t.toggleMail}
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
                            {copied ? t.copied : t.copyMail}
                        </PrimaryButton>
                    </div>
                </div>
            </details>
        </div>
    );
}

// ─── SUB: Individuele tester uitnodigen ────────────────────────────────────
// Voor "kom de tool zelf even proberen"-uitnodigingen: geen team, geen code,
// alleen een persoonlijke inlog. De uitgenodigde krijgt een account met
// user_metadata.invite_kind = 'individual', waardoor AuthCallback hem na het
// inloggen direct de quiz in stuurt.

const TESTER_LOGIN_URL = 'https://tof-persona-tool.netlify.app/start';
const INVITE_COOLDOWN_SECONDS = 60;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Bouwt de kopieerbare uitnodigingsmail met de teksten van de actieve taal. */
function buildTesterMail(copy, name, email) {
    return copy.mailBody({
        recipient: name.trim() || copy.mailFallbackName,
        email: email || copy.mailFallbackEmail,
        loginUrl: TESTER_LOGIN_URL,
    });
}

function InviteTesterCard({ isMobile }) {
    const { admin: { inviteTester: t } } = useCopy();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState('idle'); // idle | sending | sent | error
    const [message, setMessage] = useState('');
    const [cooldown, setCooldown] = useState(0);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (cooldown <= 0) return undefined;
        const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
        return () => clearTimeout(timer);
    }, [cooldown]);

    const cleanEmail = email.trim().toLowerCase();
    const mailBody = buildTesterMail(t, name, cleanEmail);

    async function handleSend() {
        if (!EMAIL_PATTERN.test(cleanEmail)) {
            setStatus('error');
            setMessage(t.errors.invalidEmail);
            return;
        }

        setStatus('sending');
        setMessage('');

        const result = await sendMagicLink(cleanEmail, {
            invite_kind: 'individual',
            full_name: name.trim() || null,
        });

        if (result.ok) {
            setStatus('sent');
            setMessage(t.sent(cleanEmail));
            setCooldown(INVITE_COOLDOWN_SECONDS);
        } else {
            setStatus('error');
            setMessage(result.error || t.errors.sendFailed);
        }
    }

    function handleCopyMail() {
        navigator.clipboard.writeText(mailBody).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    }

    const sending = status === 'sending';
    const disabled = sending || cooldown > 0;

    let buttonLabel = t.send;
    if (sending) buttonLabel = t.sending;
    else if (cooldown > 0) buttonLabel = t.cooldown(cooldown);

    const inputStyle = {
        width: '100%',
        padding: '11px 14px',
        border: '1px solid var(--tof-border)',
        borderRadius: 10,
        background: 'var(--tof-bg)',
        fontSize: 14,
        fontFamily: 'inherit',
        color: 'var(--tof-text)',
        boxSizing: 'border-box',
        outline: 'none',
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
        <div style={{
            background: 'var(--tof-surface)',
            border: '1px solid var(--tof-border)',
            borderRadius: 14,
            padding: isMobile ? '20px 22px' : '24px 28px',
            display: 'grid',
            gap: 16,
        }}>
            <div>
                <div style={{
                    fontSize: 11,
                    textTransform: 'uppercase',
                    letterSpacing: 1.4,
                    fontWeight: 700,
                    color: 'var(--tof-accent-rose)',
                    marginBottom: 6,
                }}>
                    {t.eyebrow}
                </div>
                <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: 'var(--tof-text-soft)', maxWidth: 620 }}>
                    {t.lead}
                </p>
            </div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
                gap: 14,
            }}>
                <div>
                    <label style={labelStyle}>{t.nameLabel}</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder={t.namePlaceholder}
                        style={inputStyle}
                    />
                </div>
                <div>
                    <label style={labelStyle}>{t.emailLabel}</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => {
                            setEmail(e.target.value);
                            if (status !== 'idle') {
                                setStatus('idle');
                                setMessage('');
                            }
                        }}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !disabled) handleSend();
                        }}
                        placeholder={t.emailPlaceholder}
                        style={inputStyle}
                    />
                </div>
            </div>

            {message && (
                <div style={{
                    background: status === 'error'
                        ? 'rgba(176,82,82,0.08)'
                        : 'rgba(110,136,114,0.12)',
                    border: `1px solid ${status === 'error' ? 'rgba(176,82,82,0.24)' : 'transparent'}`,
                    borderRadius: 8,
                    padding: '10px 14px',
                    fontSize: 13,
                    color: status === 'error' ? 'var(--tof-accent-rose)' : 'var(--tof-text)',
                }}>
                    {message}
                </div>
            )}

            <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                <PrimaryButton type="button" onClick={handleSend} disabled={disabled}>
                    {buttonLabel}
                </PrimaryButton>
                <span style={{ fontSize: 12, color: 'var(--tof-text-muted)' }}>
                    {t.hint}
                </span>
            </div>

            <details>
                <summary style={{
                    cursor: 'pointer',
                    fontSize: 13,
                    fontWeight: 600,
                    color: 'var(--tof-accent-rose)',
                    listStyle: 'none',
                }}>
                    {t.toggleMail}
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
                    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                        <PrimaryButton type="button" onClick={handleCopyMail}>
                            {copied ? t.copied : t.copyMail}
                        </PrimaryButton>
                        <SecondaryButton
                            type="button"
                            onClick={() => navigator.clipboard.writeText(TESTER_LOGIN_URL)}
                        >
                            {t.copyLink}
                        </SecondaryButton>
                    </div>
                </div>
            </details>
        </div>
    );
}

// ─── SUB: Organisaties lijst (overzicht) ───────────────────────────────────

function OrganizationsList({ isMobile, organizations, responseCounts = {}, onSelect }) {
    const { admin } = useCopy();
    const t = admin.organizations;
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
                {t.heading(organizations.length)}
            </div>

            {organizations.length === 0 ? (
                <div style={{
                    padding: 24,
                    color: 'var(--tof-text-muted)',
                    fontSize: 14,
                    textAlign: 'center',
                }}>
                    {t.empty}
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
                                {admin.counts.teams(org.teamCount)}
                            </div>
                            <div style={{ fontSize: 13, color: 'var(--tof-text-muted)' }}>
                                {admin.counts.responses(responseCounts[org.name] ?? org.responseCount)}
                            </div>
                            <div style={{ fontSize: 13, color: 'var(--tof-text-muted)' }}>
                                {admin.counts.managers(org.managerCount)}
                            </div>
                            <div style={{
                                fontSize: 13,
                                fontWeight: 600,
                                color: INSIGHT_ACCENT,
                                textAlign: 'right',
                            }}>
                                {t.view}
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
    const { lang } = useLang();
    const { admin, teamDashboard } = useCopy();
    const t = admin.detail;
    const tiles = useMemo(() => buildTiles(teamDashboard), [teamDashboard]);

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
            setObsError(error.message || admin.observations.errors.addFailed);
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
            setObsError(error.message || admin.observations.errors.removeFailed);
            return;
        }
        setObservations((prev) => prev.filter((o) => o.id !== id));
    }

    const aggregate = useMemo(() => buildTeamAggregate(responses, lang), [responses, lang]);
    const insights = useMemo(() => buildTeamInsights(aggregate, lang), [aggregate, lang]);

    // Per-team aggregaten voor vergelijkings-blok.
    const teamSummaries = useMemo(() => {
        return (org?.teams || []).map((teamRow) => {
            const forTeam = responses.filter((r) => responseMatchesTeam(r, teamRow));
            const agg = buildTeamAggregate(forTeam, lang);
            const top = agg?.topPersonaByPrimary || agg?.personasByPrimary?.[0];
            return {
                team: teamRow,
                responseCount: forTeam.length,
                dominant: top ? `${top.name} ${top.countPercentage}%` : t.empty,
                responses: forTeam,
                aggregate: agg,
            };
        }).sort((a, b) => b.responseCount - a.responseCount);
    }, [org, responses, lang, t.empty]);

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

    const activeTile = tiles.find((tile) => tile.id === activeTileId);

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
                {t.back}
            </button>

            <HeroBlock
                compact
                eyebrow={t.eyebrow}
                title={t.title}
                titleAccent={org.name}
                titleAccentColor={moduleAccent}
                lead={t.lead(org.teamCount, responses.length)}
                actions={
                    moduleSel === 'insight' && responses.length > 0 ? (
                        <PrimaryButton
                            onClick={() => {
                                generateOrganizationInsightPDF({
                                    aggregate,
                                    insights,
                                    teamSummaries,
                                    organizationName: org.name,
                                    observations,
                                    lang,
                                });
                                // Log op de achtergrond — mag stil falen.
                                logPdfDownload(`admin-rapport-${org.name}`);
                            }}
                            style={{ background: INSIGHT_ACCENT }}
                        >
                            {t.downloadPdf}
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
                    {t.loadingResponses}
                </div>
            ) : (
                <>
                    {moduleSel === 'insight' ? (
                        <>
                            <TileGrid columns={4}>
                                {tiles.map((tile) => (
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
                                            {t.closeTile}
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
                                {t.teamsHeading(teamSummaries.length)}
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
                                                    {s.team.team || t.empty}
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
                                                {admin.counts.responses(s.responseCount)}
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
                                                {busy ? t.viewTeamBusy : t.viewTeam}
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
    const { admin: { moduleToggle: t } } = useCopy();
    const options = [
        { id: 'insight', label: t.options.insight, accent: INSIGHT_ACCENT },
        { id: 'dynamics', label: t.options.dynamics, accent: DYNAMICS_ACCENT },
    ];

    return (
        <div
            role="tablist"
            aria-label={t.ariaLabel}
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
    const { admin: { director: t } } = useCopy();
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
                {t.eyebrow}
            </div>
            <div style={{
                fontFamily: 'var(--tof-font-heading)',
                fontSize: 18,
                color: 'var(--tof-text)',
            }}>
                {t.title}
            </div>
            <p style={{
                margin: 0,
                fontSize: 13,
                lineHeight: 1.55,
                color: 'var(--tof-text-soft)',
                maxWidth: 620,
            }}>
                {t.bodyBefore}
                <strong> {orgName}</strong>
                {t.bodyAfter}
            </p>
        </div>
    );
}

// ─── SUB: Eigen observaties ───────────────────────────────────────────────
// Handmatige input naast data-driven inzichten. Twee categorieën: leegloper
// (akoestiek, no-shows, niet nakomen afspraken) en werkt_goed (sterktes,
// patronen). Verschijnen in de organisatie-PDF.

// `key` is de databasewaarde van de kolom `category` — label, helper en
// placeholder komen uit de copy (admin.observations.categories[key]).
const OBSERVATION_CATEGORIES = [
    { key: 'leegloper', accent: 'var(--tof-accent-rose)' },
    { key: 'werkt_goed', accent: 'var(--tof-accent-sage)' },
];

function ObservationsSection({ observations, form, setForm, busy, error, onAdd, onRemove }) {
    const { admin: { observations: t } } = useCopy();
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
                    {t.eyebrow}
                </div>
                <p style={{
                    margin: 0,
                    fontSize: 13,
                    lineHeight: 1.6,
                    color: 'var(--tof-text-soft)',
                }}>
                    {t.lead}
                </p>
            </div>

            {OBSERVATION_CATEGORIES.map((cat) => {
                const catCopy = t.categories[cat.key];
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
                                {catCopy.label}
                            </div>
                            <div style={{
                                fontSize: 12,
                                color: 'var(--tof-text-muted)',
                            }}>
                                {catCopy.helper}
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
                                            title={t.removeTitle}
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
                                placeholder={catCopy.placeholder}
                                style={inputStyle}
                                disabled={busy}
                            />
                            <PrimaryButton type="submit" disabled={busy || !(form[cat.key] || '').trim()}>
                                {t.add}
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
    const { admin: { managers: t } } = useCopy();
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

    const activeTeams = (teams || []).filter((team) => team.active);

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
                {t.eyebrow}
            </div>
            <p style={{
                margin: 0,
                fontSize: 13,
                lineHeight: 1.6,
                color: 'var(--tof-text-soft)',
            }}>
                {t.lead}
            </p>

            {/* Form: nieuwe koppeling */}
            <form onSubmit={onAdd} style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : '1.4fr 1fr auto',
                gap: 12,
                alignItems: 'end',
            }}>
                <div>
                    <label style={labelStyle}>{t.emailLabel}</label>
                    <input
                        type="email"
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                        placeholder={t.emailPlaceholder}
                        style={inputStyle}
                    />
                </div>
                <div>
                    <label style={labelStyle}>{t.codeLabel}</label>
                    <select
                        value={codeInput}
                        onChange={(e) => setCodeInput(e.target.value)}
                        style={{ ...inputStyle, cursor: 'pointer' }}
                    >
                        <option value="">{t.codePlaceholder}</option>
                        {activeTeams.map((team) => (
                            <option key={team.code} value={team.code}>
                                {team.code} — {team.team || t.teamWithoutName}
                            </option>
                        ))}
                    </select>
                </div>
                <PrimaryButton type="submit" disabled={busy}>
                    {busy ? t.submitting : t.submit}
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
                {t.linkedHeading(managers.length)}
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
                    {t.empty}
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
    const { admin: { managers: { row: t } } } = useCopy();
    const [linkStatus, setLinkStatus] = useState('idle'); // idle | sending | sent | error
    const [linkMessage, setLinkMessage] = useState('');

    async function handleSendLink() {
        setLinkStatus('sending');
        setLinkMessage('');
        const { ok, error } = await sendMagicLink(manager.email);
        if (ok) {
            setLinkStatus('sent');
            setLinkMessage(t.sent);
        } else {
            setLinkStatus('error');
            setLinkMessage(error || t.sendFailed);
        }
    }

    const sending = linkStatus === 'sending';

    let linkLabel = t.sendLink;
    if (sending) linkLabel = t.sending;
    else if (linkStatus === 'sent') linkLabel = t.resend;

    return (
        <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'minmax(0, 1.6fr) minmax(0, 1.4fr) 110px 150px 100px',
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
                {manager.team || t.noTeam}
            </div>
            <div style={{
                fontSize: 11,
                color: 'var(--tof-text-muted)',
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                letterSpacing: 0.5,
            }}>
                {manager.team_code}
            </div>
            <div style={{ display: 'grid', gap: 4 }}>
                <SecondaryButton onClick={handleSendLink} disabled={busy || sending}>
                    {linkLabel}
                </SecondaryButton>
                {linkMessage && (
                    <span style={{
                        fontSize: 11,
                        color: linkStatus === 'error'
                            ? 'var(--tof-accent-rose)'
                            : 'var(--tof-text-muted)',
                    }}>
                        {linkMessage}
                    </span>
                )}
            </div>
            <SecondaryButton onClick={onRemove} disabled={busy}>
                {t.remove}
            </SecondaryButton>
        </div>
    );
}
