/**
 * TeamIntro.jsx — de toegang tot de teamomgeving (/team)
 *
 * Sinds 21 okt 2026 alleen nog toegang: teamcode invoeren, inloggen als
 * leidinggevende, en de welkom voor wie al teams heeft. De verkoopintro met
 * de module-kaarten is weg — uitleg en aanvraag staan op
 * www.persona-tool.nl/voor-je-team (advies TOF-marketingteam).
 *
 * ACCESS MODEL (stap 3):
 * - Code-validatie loopt voor beide modules via validateTeamAccessCode.
 * - De DB bepaalt welk niveau een code geeft (level: 'insight' | 'dynamics').
 * - Dynamics-codes ontgrendelen ook Insight automatisch (via access.js).
 * - Module 1 modal accepteert beide niveaus.
 * - Module 2 modal accepteert alleen codes met level 'dynamics'.
 */

import React, { useEffect, useRef, useState } from 'react';
import {
    isMakerAccess,
    isAdminAccess,
    grantTeamLevel,
    grantAdminAccess,
    revokeAdminAccess,
    revokeTeamAccess,
    listTeamAccesses,
    isManagerOf,
    levelFromCode,
    LEVEL_INSIGHT,
    LEVEL_DYNAMICS,
    LEVEL_STRATEGIC,
} from '../utils/access';
import {
    validateTeamAccessCode,
    validateAdminCode,
    getResponsesByTeam,
    getCurrentUser,
    joinTeamByCode,
    getMyMemberships,
    getMyManagedTeams,
} from '../supabase';
import {
    PageShell,
    PrimaryButton,
    SecondaryButton,
} from '../ui/AppShell';
import { useCopy } from '../i18n/LanguageContext';
import { useAuth } from '../auth/AuthContext';
import { BOOKING_URL } from '../config/contact';

// Uitleg en aanvraag van TOF Persona Team staan op de verhaalsite.
const REQUEST_URL = 'https://www.persona-tool.nl/voor-je-team';

// ─── COMPONENT ────────────────────────────────────────────────────────────────

export default function TeamIntro({ setPage, setTeamResponses, setSelectedTeam }) {
    const { teamIntro: t, common } = useCopy();
    const { user, loading: authLoading } = useAuth();

    const [isMobile, setIsMobile] = useState(window.innerWidth < 900);

    // Het codeveld staat direct op de pagina (route 1), niet meer in een venster.
    const [accessInput, setAccessInput] = useState('');
    const [accessError, setAccessError] = useState('');
    const [accessLoading, setAccessLoading] = useState(false);

    // Lijst met teams waar deze gebruiker al toegang toe heeft (uit localStorage).
    const [teamAccesses, setTeamAccesses] = useState(() => listTeamAccesses());
    // Pas na de eerste ronde hieronder weten we of je leidinggevende bent.
    const [accessesReady, setAccessesReady] = useState(false);


    // Combineer localStorage-toegang (anonieme code-flow) met DB-memberships
    // (ingelogde flow). DB-only entries krijgen later automatisch een localStorage
    // grant op het moment dat de user op het team klikt (zie openExistingTeam).
    useEffect(() => {
        let cancelled = false;

        async function refreshAccesses() {
            // Lokaal bewaard niveau telt hooguit als codeniveau (zie
            // getTeamLevel); Dynamiek komt hieronder uit de rol.
            const localAccesses = listTeamAccesses().map((a) => ({
                ...a,
                level: levelFromCode(a.level),
            }));

            // Niet ingelogd? alleen lokale toegang.
            let dbMemberships = [];
            let managedTeams = [];
            let user = null;
            try {
                user = await getCurrentUser();
                if (user) {
                    dbMemberships = await getMyMemberships();
                    managedTeams = await getMyManagedTeams();
                }
            } catch (e) {
                // niet-kritiek, val terug op alleen-localStorage
            }

            if (cancelled) return;

            // Merge: localStorage entries hebben priority (ze hebben het juiste
            // level uit het oorspronkelijke code-moment). DB-only entries worden
            // toegevoegd met fromDB-vlag zodat we ze bij click kunnen granten.
            const seen = new Set(
                localAccesses.map((a) => `${a.organization || ''}|${a.team || ''}`)
            );
            const merged = [...localAccesses];
            dbMemberships.forEach((m) => {
                const key = `${m.organization || ''}|${m.team || ''}`;
                if (!seen.has(key)) {
                    seen.add(key);
                    merged.push({
                        team: m.team,
                        organization: m.organization,
                        code: m.code || null,
                        level: m.level || LEVEL_INSIGHT,
                        fromDB: true,
                    });
                }
            });

            // Manager-toegang via team_managers: koppel teams aan ingelogde
            // user zonder code-invoer. Krijgt fromManager-vlag zodat het
            // UI-laagje (YourAccessPanel) er later een badge bij kan tonen.
            // Als hetzelfde team al via localStorage of memberships in de
            // lijst staat, voegen we de vlag toe op het bestaande record —
            // anders verliezen we manager-mode bij duplicaten.
            managedTeams.forEach((m) => {
                const key = `${m.organization || ''}|${m.team || ''}`;
                if (seen.has(key)) {
                    const existing = merged.find(
                        (a) => `${a.organization || ''}|${a.team || ''}` === key
                    );
                    if (existing) {
                        existing.fromManager = true;
                        existing.fromDB = true;
                        if (!existing.code && m.code) existing.code = m.code;
                    }
                    return;
                }
                seen.add(key);
                merged.push({
                    team: m.team,
                    organization: m.organization,
                    code: m.code || null,
                    level: m.level || LEVEL_INSIGHT,
                    fromDB: true,
                    fromManager: true,
                });
            });

            // De rol wint van het codeniveau: ben je manager van dit team,
            // dan staat het op Dynamiek — ongeacht met welke code je binnenkwam.
            merged.forEach((a) => {
                if (a.fromManager || isManagerOf(a.team, a.organization)) {
                    a.fromManager = true;
                    a.level = LEVEL_DYNAMICS;
                }
            });

            setTeamAccesses(merged);
            setAccessesReady(true);
        }

        refreshAccesses();
        return () => { cancelled = true; };
    }, []);

    const makerMode = isMakerAccess();

    // Auto-open: als de ingelogde manager precies ÉÉN gekoppeld team heeft,
    // sla deze tussenpagina over en open direct het team-dashboard. Voor
    // managers met meerdere teams (zoals admin-test) blijft de keuze staan.
    const autoOpenedRef = useRef(false);

    useEffect(() => {
        const onResize = () => setIsMobile(window.innerWidth < 900);
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);

    // Auto-open dashboard voor single-team manager (zie ref hierboven).
    useEffect(() => {
        if (autoOpenedRef.current) return;
        const managerTeams = teamAccesses.filter((a) => a.fromManager);
        if (managerTeams.length === 1) {
            autoOpenedRef.current = true;
            openExistingTeam(managerTeams[0]);
        }
    }, [teamAccesses]); // eslint-disable-line react-hooks/exhaustive-deps

    // Open een team dat al eerder is ontgrendeld — zonder opnieuw een code in te voeren.
    // Laadt de responses opnieuw (die kunnen gegroeid zijn sinds laatste bezoek).
    async function openExistingTeam(entry, targetLevel) {
        if (!entry) return;

        try {
            // DB-only entry? Grant ook localStorage zodat TeamDashboard/TeamDynamics
            // de toegang correct herkent (die componenten lezen access uit localStorage).
            if (entry.fromDB) {
                // Lokaal alleen wat een code geeft; Dynamiek hangt aan de rol.
                grantTeamLevel({
                    team: entry.team,
                    organization: entry.organization,
                    level: levelFromCode(entry.level),
                    code: entry.code,
                });
            }

            if (typeof setSelectedTeam === 'function') {
                setSelectedTeam({
                    team: entry.team,
                    organization: entry.organization,
                    code: entry.code,
                });
            }

            const responses = await getResponsesByTeam(entry.team, entry.organization, entry.code);
            if (typeof setTeamResponses === 'function') {
                setTeamResponses(responses || []);
            }

            // targetLevel = 'insight' | 'dynamics' | undefined
            // Als niet opgegeven: val terug op entry.level
            // Bij Dynamics-toegang kun je óók Insight kiezen (Dynamics omvat Insight).
            const wantsDynamics = targetLevel === 'dynamics'
                || (!targetLevel && entry.level === LEVEL_DYNAMICS);

            setPage(wantsDynamics ? 'teamdynamics' : 'teamdashboard');
        } catch (err) {
            console.error('Open existing team error:', err);
        }
    }

    // ── Toegang met een code ───────────────────────────────────────────────────
    // Eén veld voor iedereen: een beheerderscode gaat naar de teamselector, een
    // teamcode naar het teambeeld (of Teamdynamiek als je dat team leidt).
    const handleAccessSubmit = async () => {
        if (accessLoading) return;
        const cleanedInput = accessInput.trim();
        if (!cleanedInput) {
            setAccessError(t.errors.empty);
            return;
        }

        setAccessLoading(true);
        setAccessError('');

        try {
            // Eerst proberen als admin-code, zodat de beheerder hetzelfde veld
            // gebruikt als ieder ander.
            const adminResult = await validateAdminCode(cleanedInput);
            if (adminResult) {
                grantAdminAccess();
                // Beheerder gaat naar teamselector om uit alle teams te kiezen
                setPage('teamselector');
                setAccessLoading(false);
                return;
            }

            const accessResult = await validateTeamAccessCode(cleanedInput);
            if (!accessResult) {
                setAccessError(t.errors.unknownCode);
                setAccessLoading(false);
                return;
            }

            const codeLevel = accessResult.level || LEVEL_INSIGHT;

            // De code geeft het teambeeld; Teamdynamiek hangt aan de rol.
            const isManager = isManagerOf(accessResult.team, accessResult.organization);

            // Code geldig — niveau opslaan via het nieuwe access-model.
            grantTeamLevel({
                team: accessResult.team,
                organization: accessResult.organization,
                level: levelFromCode(codeLevel),
                code: accessResult.code,
            });

            // Dual-write: als gebruiker is ingelogd, óók membership in DB aanmaken.
            // Dit is non-blocking — fouten worden gelogd maar onderbreken de flow niet.
            // Op termijn (na admin-dashboard) wordt dit de primaire bron van toegang.
            (async () => {
                try {
                    const currentUser = await getCurrentUser();
                    if (currentUser) {
                        await joinTeamByCode(cleanedInput);
                    }
                } catch (e) {
                    console.warn('Membership dual-write skipped:', e?.message || e);
                }
            })();

            // Team-data alvast klaarzetten voor het dashboard
            if (typeof setSelectedTeam === 'function') {
                setSelectedTeam({
                    team: accessResult.team,
                    organization: accessResult.organization,
                    code: accessResult.code,
                });
            }

            // Module 1 heeft de team-responses nodig voor het dashboard.
            // Module 2 leunt op hetzelfde dataset, dus we laden sowieso.
            const responses = await getResponsesByTeam(
                accessResult.team,
                accessResult.organization,
                accessResult.code
            );
            if (typeof setTeamResponses === 'function') {
                setTeamResponses(responses || []);
            }

            // Strategic-codes gaan naar het Strategisch Kompas; verder bepaalt
            // de rol of je op Teaminzicht of Teamdynamiek uitkomt.
            let destination;
            if (codeLevel === LEVEL_STRATEGIC) {
                destination = 'teamstrategic';
            } else {
                destination = isManager ? 'teamdynamics' : 'teamdashboard';
            }
            setPage(destination);
        } catch (err) {
            console.error('Access flow error:', err);
            setAccessError(t.errors.generic);
        } finally {
            setAccessLoading(false);
        }
    };

    // ── RENDER ────────────────────────────────────────────────────────────────
    // Manager-mode: minstens één toegang komt uit team_managers (auto-koppeling
    // via email). Zo'n user is geen prospect — hij komt voor zijn team-resultaten.
    // We verbergen dan de sales-hero, de drie module-kaarten en het code-invoer-
    // blok, en laten alleen YourAccessPanel zien.
    const isManagerMode = teamAccesses.some((a) => a.fromManager);

    // Ingelogd en de teams nog niet binnen: even niets tonen. Anders zag een
    // leidinggevende eerst kort het scherm voor bezoekers zonder team (kop +
    // codeveld), dat daarna verdween zodra zijn teams bekend waren.
    if (authLoading || (user && !accessesReady)) {
        return (
            <PageShell padding={isMobile ? '16px 16px 28px' : '20px 20px 32px'}>
                <p style={{ color: 'var(--tof-text-soft)', fontSize: 15, margin: 0 }}>
                    {common.loading}
                </p>
            </PageShell>
        );
    }

    return (
        <PageShell padding={isMobile ? '16px 16px 28px' : '20px 20px 32px'}>
            <div style={{ display: 'grid', gap: isMobile ? 16 : 20, animation: 'tofFadeIn 0.5s ease' }}>

                {/* ── MANAGER WELKOM (alleen in manager-mode) ── */}
                {isManagerMode && (
                    <div style={{
                        background: 'linear-gradient(145deg, #FDF6F6 0%, #F7F0ED 100%)',
                        borderRadius: 20,
                        border: '1px solid rgba(176,82,82,0.14)',
                        padding: isMobile ? '22px 20px' : '28px 36px',
                        position: 'relative',
                        overflow: 'hidden',
                    }}>
                        <div style={{ position: 'absolute', left: 0, top: 0, width: 4, height: '100%', background: 'var(--tof-accent-rose)', borderRadius: '4px 0 0 4px' }} />
                        <div style={{ paddingLeft: isMobile ? 8 : 16, display: 'grid', gap: 8 }}>
                            <div style={{ color: 'var(--tof-accent-rose)', letterSpacing: 2, fontSize: 11, textTransform: 'uppercase', fontWeight: 700 }}>
                                {t.managerWelcome.eyebrow}
                            </div>
                            <h1 style={{
                                margin: 0,
                                fontFamily: "'Playfair Display', serif",
                                fontWeight: 500,
                                fontSize: isMobile ? 'clamp(22px, 5vw, 28px)' : 'clamp(24px, 2.4vw, 30px)',
                                lineHeight: 1.2,
                                color: '#1f1b18',
                            }}>
                                {/* Geen naam: er is nergens een voornaam van de
                                    leidinggevende opgeslagen, en raden uit het
                                    mailadres gaf "Hoi Judithdorlandt". */}
                                {t.managerWelcome.titleLead}<em style={{ color: 'var(--tof-accent-rose)', fontStyle: 'italic' }}>{t.managerWelcome.titleHighlight}</em>
                            </h1>
                            <p style={{ margin: 0, fontSize: 14, lineHeight: 1.65, color: '#6F6A66', maxWidth: 560 }}>
                                {t.managerWelcome.lead}
                            </p>
                        </div>
                    </div>
                )}

                {/* ── HERO + TOEGANG (verborgen in manager-mode) ── */}
                {!isManagerMode && (
                <>
                <div style={{
                    background: 'linear-gradient(145deg, #FDF6F6 0%, #F7F0ED 100%)',
                    borderRadius: 20,
                    border: '1px solid rgba(176,82,82,0.14)',
                    boxShadow: '0 10px 28px rgba(176,82,82,0.06)',
                    padding: isMobile ? '24px 20px 22px' : '36px 40px 32px',
                    position: 'relative',
                    overflow: 'hidden',
                }}>
                    <div style={{ position: 'absolute', left: 0, top: 0, width: 4, height: '100%', background: 'var(--tof-accent-rose)', borderRadius: '4px 0 0 4px' }} />
                    <div style={{ paddingLeft: isMobile ? 8 : 16, display: 'grid', gap: isMobile ? 12 : 14 }}>
                        <div style={{ color: 'var(--tof-accent-rose)', letterSpacing: 2, fontSize: 11, textTransform: 'uppercase', fontWeight: 700 }}>
                            {t.hero.eyebrow}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap' }}>
                            <h1 style={{
                                margin: 0,
                                fontFamily: "'Playfair Display', serif",
                                fontWeight: 500,
                                fontSize: isMobile ? 'clamp(26px, 5vw, 34px)' : 'clamp(28px, 2.8vw, 38px)',
                                lineHeight: 1.15,
                                color: '#1f1b18',
                                maxWidth: 620,
                            }}>
                                {t.hero.titleLead}
                                <br />
                                <em style={{ color: 'var(--tof-accent-rose)', fontStyle: 'italic' }}>
                                    {t.hero.titleHighlight}
                                </em>
                            </h1>
                            {!isMobile && (
                                <p style={{ margin: 0, maxWidth: 260, fontSize: 14, lineHeight: 1.65, color: '#6F6A66', paddingBottom: 4, flexShrink: 0 }}>
                                    {t.hero.leadDesktop}
                                </p>
                            )}
                        </div>
                        {isMobile && (
                            <p style={{ margin: 0, fontSize: 14, lineHeight: 1.65, color: '#6F6A66' }}>
                                {t.hero.leadMobile}
                            </p>
                        )}
                        {makerMode && (
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'var(--tof-rose-soft)', border: '1px solid rgba(176,82,82,0.12)', borderRadius: 999, padding: '6px 12px', fontSize: 12, color: 'var(--tof-text-muted)', width: 'fit-content' }}>
                                🛠 {t.hero.makerMode}
                            </div>
                        )}
                    </div>
                </div>

                {/* ── TOEGANG ─────────────────────────────────────────── */}
                <AccessStrip
                    copy={t.entry}
                    isMobile={isMobile}
                    codeInput={accessInput}
                    onCodeInput={(value) => { setAccessInput(value); setAccessError(''); }}
                    codeError={accessError}
                    codeLoading={accessLoading}
                    onSubmitCode={handleAccessSubmit}
                    onLogin={() => setPage('login')}
                    onApp={() => setPage('quiz')}
                />
                </>
                )}

                {/* ── CONTEXTUELE VOLGORDE ─────────────────────────────── */}
                {/* Returning users (al toegang) zien hun teams eerst — dat is */}
                {/* waar ze voor komen. New users zien de code-invoer eerst. */}
                {/* Manager-mode (auto-koppeling via team_managers) toont */}
                {/* alleen YourAccessPanel — geen sales-hero, geen module-kaarten, */}
                {/* geen code-invoer-blok. */}
                {(teamAccesses.length > 0 || isAdminAccess()) && (
                    <>
                        <YourAccessPanel
                            teamAccesses={teamAccesses}
                            isMobile={isMobile}
                            onOpenTeam={openExistingTeam}
                            onLogout={() => {
                                revokeTeamAccess();
                                setTeamAccesses([]);
                            }}
                            adminMode={isAdminAccess()}
                            onLogoutAdmin={() => {
                                revokeAdminAccess();
                                setTeamAccesses(listTeamAccesses());
                            }}
                        />
                    </>
                )}

                {/* ── FOOTER NAVIGATIE ────────────────────────────────── */}
                <div style={{
                    display: 'flex',
                    gap: 16,
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingTop: 4,
                }}>
                    <SecondaryButton onClick={() => setPage('home')}>{t.footer.backHome}</SecondaryButton>
                    <button
                        type="button"
                        onClick={() => window.open(BOOKING_URL, '_blank', 'noopener,noreferrer')}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            padding: 0,
                            color: 'var(--tof-accent-rose)',
                            fontFamily: 'var(--tof-font-body)',
                            fontSize: 13,
                            fontWeight: 600,
                            cursor: 'pointer',
                            textDecoration: 'underline',
                            textUnderlineOffset: 3,
                        }}
                    >
                        {t.footer.contact}
                    </button>
                </div>

            </div>

        </PageShell>
    );
}

// ─── JOUW TOEGANG PANEEL ─────────────────────────────────────────────────────
// Alleen teams + openen. Geen upgrade-knoppen — die verwarren gebruikers die
// niet weten wat een "Dynamics-code" is. Upgrade loopt via contact (aparte regel).

function YourAccessPanel({ teamAccesses, isMobile, onOpenTeam, onLogout, adminMode = false, onLogoutAdmin }) {
    const t = useCopy().teamIntro.access;

    // Zijn er teams die nog op Insight-niveau staan? Alleen dan tonen we de upgrade-regel.
    const hasInsightOnly = teamAccesses.some((e) => e.level !== LEVEL_DYNAMICS);

    return (
        <div style={{ display: 'grid', gap: 8 }}>
            <div
                style={{
                    background: 'var(--tof-surface)',
                    border: '1px solid var(--tof-border)',
                    borderLeft: `3px solid ${adminMode ? 'var(--tof-accent-rose)' : 'var(--tof-accent-sage)'}`,
                    borderRadius: 14,
                    padding: isMobile ? '14px 16px' : '16px 20px',
                    display: 'grid',
                    gap: 12,
                }}
            >
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    gap: 12,
                    flexWrap: 'wrap',
                }}>
                    <div style={{ display: 'grid', gap: 2, flex: '1 1 auto' }}>
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 8,
                                fontSize: 11,
                                textTransform: 'uppercase',
                                letterSpacing: 1.6,
                                fontWeight: 700,
                                color: adminMode ? 'var(--tof-accent-rose)' : 'var(--tof-accent-sage)',
                            }}
                        >
                            {t.title}
                            {adminMode && (
                                <span style={{
                                    fontSize: 10,
                                    letterSpacing: 1.2,
                                    padding: '2px 8px',
                                    background: 'var(--tof-accent-rose)',
                                    color: '#fff',
                                    borderRadius: 999,
                                    fontWeight: 700,
                                }}>
                                    {t.adminBadge}
                                </span>
                            )}
                        </div>
                        <p
                            style={{
                                margin: 0,
                                fontSize: 13,
                                lineHeight: 1.55,
                                color: 'var(--tof-text-muted)',
                            }}
                        >
                            {adminMode
                                ? t.adminLead
                                : teamAccesses.length === 1
                                    ? t.oneTeam
                                    : t.manyTeams(teamAccesses.length)}
                        </p>
                    </div>

                    {/* Uitlog-knop rechtsboven */}
                    <button
                        type="button"
                        onClick={adminMode ? onLogoutAdmin : onLogout}
                        style={{
                            background: 'transparent',
                            border: '1px solid var(--tof-border)',
                            borderRadius: 999,
                            padding: '4px 12px',
                            fontSize: 12,
                            color: 'var(--tof-text-muted)',
                            cursor: 'pointer',
                            fontFamily: 'var(--tof-font-body)',
                            fontWeight: 500,
                            whiteSpace: 'nowrap',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'var(--tof-bg)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent';
                        }}
                    >
                        {t.logout}
                    </button>
                </div>

                <div style={{ display: 'grid', gap: 8 }}>
                    {teamAccesses.map((entry, index) => (
                        <AccessRow
                            key={`${entry.team}|${entry.organization}|${index}`}
                            entry={entry}
                            isMobile={isMobile}
                            onOpen={(destination) => onOpenTeam(entry, destination)}
                        />
                    ))}

                    {/* Admin zonder per-team toegang: directe doorgang naar teamselector */}
                    {adminMode && teamAccesses.length === 0 && (
                        <div style={{
                            padding: '12px 14px',
                            background: 'var(--tof-bg)',
                            border: '1px solid var(--tof-border)',
                            borderRadius: 10,
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            gap: 10,
                            flexWrap: 'wrap',
                        }}>
                            <span style={{ fontSize: 13, color: 'var(--tof-text-soft)' }}>
                                {t.adminNoTeams}
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* Upgrade-regel — subtiel, geen knop, alleen als relevant (en niet in admin-mode) */}
            {hasInsightOnly && !adminMode && (
                <div
                    style={{
                        paddingLeft: isMobile ? 16 : 20,
                        fontSize: 12,
                        lineHeight: 1.6,
                        color: 'var(--tof-text-muted)',
                    }}
                >
                    {t.upgradeLead}{' '}
                    <a
                        href={BOOKING_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                            color: 'var(--tof-accent-rose)',
                            fontWeight: 600,
                            textDecoration: 'underline',
                            textUnderlineOffset: 3,
                        }}
                    >
                        {t.upgradeLink}
                    </a>
                </div>
            )}
        </div>
    );
}

function AccessRow({ entry, isMobile, onOpen }) {
    const t = useCopy().teamIntro.access;
    const isDynamics = entry.level === LEVEL_DYNAMICS;

    return (
        <div
            style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12,
                flexWrap: 'wrap',
                padding: '10px 12px',
                background: 'var(--tof-bg)',
                border: '1px solid var(--tof-border)',
                borderRadius: 10,
            }}
        >
            {/* Team-info */}
            <div style={{ display: 'grid', gap: 3, minWidth: 180, flex: '1 1 200px' }}>
                <div
                    style={{
                        fontSize: 14,
                        fontWeight: 600,
                        color: 'var(--tof-text)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                    }}
                >
                    {entry.team || t.teamFallback}
                    {entry.organization ? (
                        <span
                            style={{
                                color: 'var(--tof-text-muted)',
                                fontWeight: 400,
                                marginLeft: 6,
                            }}
                        >
                            · {entry.organization}
                        </span>
                    ) : null}
                </div>

                <div
                    style={{
                        fontSize: 11,
                        textTransform: 'uppercase',
                        letterSpacing: 1.2,
                        fontWeight: 700,
                        color: isDynamics ? 'var(--tof-accent-rose)' : 'var(--tof-accent-sage)',
                    }}
                >
                    {isDynamics ? t.levelDynamics : t.levelInsight}
                </div>
            </div>

            {/* Acties — bij Dynamics twee knoppen (Insight én Dynamics), anders één */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button
                    type="button"
                    onClick={() => onOpen('insight')}
                    style={{
                        background: 'var(--tof-accent-sage)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 10,
                        padding: '8px 14px',
                        fontSize: 13,
                        fontWeight: 600,
                        cursor: 'pointer',
                        fontFamily: 'var(--tof-font-body)',
                    }}
                >
                    {t.openInsight}
                </button>

                {isDynamics && (
                    <button
                        type="button"
                        onClick={() => onOpen('dynamics')}
                        style={{
                            background: 'var(--tof-accent-rose)',
                            color: '#fff',
                            border: 'none',
                            borderRadius: 10,
                            padding: '8px 14px',
                            fontSize: 13,
                            fontWeight: 600,
                            cursor: 'pointer',
                            fontFamily: 'var(--tof-font-body)',
                        }}
                    >
                        {t.openDynamics}
                    </button>
                )}
            </div>
        </div>
    );
}

// ─── TOEGANG: TWEE ROUTES ─────────────────────────────────────────────────────
// Wie ben je? Een teamlid opent het teambeeld met de code, een leidinggevende
// logt in (opdracht C2). Het codeveld staat direct in beeld, zonder venster.

function AccessStrip({
    copy,
    isMobile,
    codeInput,
    onCodeInput,
    codeError,
    codeLoading,
    onSubmitCode,
    onLogin,
    onApp,
}) {
    const accent = 'var(--tof-accent-sage)';
    const routeLabel = { margin: 0, fontSize: 15, fontWeight: 600, lineHeight: 1.4, color: 'var(--tof-text)' };
    const smallNote = { margin: 0, fontSize: 13, lineHeight: 1.6, color: 'var(--tof-text-muted)' };

    return (
        <div style={{
            background: 'var(--tof-surface)',
            border: '1px solid var(--tof-border)',
            borderTop: `4px solid ${accent}`,
            borderRadius: 18,
            boxShadow: 'var(--tof-shadow)',
            padding: isMobile ? '20px 18px' : '26px 30px',
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'minmax(0, 1fr) minmax(0, 1fr)',
            gap: isMobile ? 18 : 32,
            alignItems: 'start',
        }}>
            <div style={{ display: 'grid', gap: 14 }}>
                <div style={{ display: 'grid', gap: 10 }}>
                    <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 1.8, fontWeight: 700, color: accent }}>
                        {copy.eyebrow}
                    </div>
                    <h2 style={{ margin: 0, fontFamily: 'var(--tof-font-heading)', fontSize: isMobile ? 24 : 27, lineHeight: 1.1, color: 'var(--tof-text)' }}>
                        {copy.title}
                    </h2>
                </div>

                {/* Route 1 — teamlid */}
                <form
                    onSubmit={(e) => { e.preventDefault(); onSubmitCode(); }}
                    style={{ display: 'grid', gap: 8 }}
                >
                    <label htmlFor="team-code" style={routeLabel}>{copy.codeRoute.label}</label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
                        <input
                            id="team-code"
                            value={codeInput}
                            onChange={(e) => onCodeInput(e.target.value)}
                            placeholder={copy.codeRoute.placeholder}
                            autoComplete="off"
                            autoCapitalize="characters"
                            spellCheck={false}
                            style={{
                                flex: '1 1 180px',
                                minWidth: 0,
                                padding: '11px 13px',
                                borderRadius: 10,
                                border: `1px solid ${codeError ? 'var(--tof-accent-rose)' : '#E5D9CD'}`,
                                fontSize: 15,
                                outline: 'none',
                                fontFamily: 'var(--tof-font-body)',
                                background: '#fff',
                            }}
                        />
                        <PrimaryButton type="submit" disabled={codeLoading}>
                            {codeLoading ? copy.codeRoute.busy : copy.codeRoute.submit}
                        </PrimaryButton>
                    </div>
                    {codeError && (
                        <p role="alert" style={{ margin: 0, fontSize: 13, color: 'var(--tof-accent-rose)', lineHeight: 1.5 }}>
                            {codeError}
                        </p>
                    )}
                    <p style={smallNote}>{copy.codeRoute.noCode}</p>
                </form>

                <div style={{ height: 1, background: 'var(--tof-border)' }} />

                {/* Route 2 — leidinggevende */}
                <div style={{ display: 'grid', gap: 8 }}>
                    <p style={routeLabel}>{copy.managerRoute.label}</p>
                    <div>
                        <SecondaryButton onClick={onLogin}>{copy.managerRoute.cta}</SecondaryButton>
                    </div>
                    <p style={smallNote}>{copy.managerRoute.note}</p>
                </div>

                <div style={{ height: 1, background: 'var(--tof-border)' }} />

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
                    <SecondaryButton onClick={onApp}>{copy.appCta}</SecondaryButton>
                </div>
                <p style={{ margin: 0, fontSize: 12.5, lineHeight: 1.6, color: 'var(--tof-text-muted)' }}>
                    {copy.requestLead}{' '}
                    <a href={REQUEST_URL} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--tof-accent-rose)', fontWeight: 600 }}>
                        {copy.requestLink}
                    </a>
                </p>
            </div>

            <div style={{ display: 'grid', gap: 8 }}>
                {copy.bullets.map((b, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                        <div style={{
                            width: 20, height: 20, borderRadius: 999,
                            background: '#EAF0EB',
                            border: `1.5px solid ${accent}`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 10, fontWeight: 700, color: accent,
                            flexShrink: 0, marginTop: 1,
                        }}>✓</div>
                        <span style={{ fontSize: 14, lineHeight: 1.65, color: 'var(--tof-text-soft)' }}>{b}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
