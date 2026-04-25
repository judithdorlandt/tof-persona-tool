/**
 * TeamIntro.jsx — Verkoopintro voor de drie modules
 *
 * UX-patroon: identiek aan Library/persona-kaarten.
 * - Één kaart open tegelijk
 * - Andere kaarten dimmen
 * - Korte, scherpe verkooptekst — geen lange lappen
 * - Elke kaart heeft een eigen accent en eigen CTA
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
    LEVEL_INSIGHT,
    LEVEL_DYNAMICS,
} from '../utils/access';
import { validateTeamAccessCode, validateAdminCode, getResponsesByTeam } from '../supabase';
import {
    PageShell,
    PrimaryButton,
    SecondaryButton,
} from '../ui/AppShell';

// ─── MODULE-DATA ───────────────────────────────────────────────────────────────

const MODULES = [
    {
        id: 'insight',
        eyebrow: 'Module 1 · Voor teams',
        title: 'Team Insight & Quick Wins',
        hook: 'Je weet wie er in je team zit. Maar weet je ook hoe het team écht werkt?',
        accent: 'var(--tof-accent-sage)',
        soft: '#EAF0EB',
        bullets: [
            'Zie in één oogopslag welke werkstijlen domineren',
            'Ontdek waar energie zit — en waar wrijving ontstaat',
            'Krijg directe werkplekbehoefte per team',
            'Vier concrete quick wins die je morgen kunt toepassen',
        ],
        what: 'Een teamdashboard klaar voor een teamoverleg, werkplek­beslissing of leiderschapsgesprek.',
        cta: 'Naar de teamomgeving',
        ctaType: 'access-insight',
    },
    {
        id: 'dynamics',
        eyebrow: 'Module 2 · Voor teams & organisaties',
        title: 'Team Dynamics Sessie',
        hook: 'Je ziet de verdeling. Maar waarom loopt de samenwerking soms vast?',
        accent: 'var(--tof-accent-rose)',
        soft: '#F4DFDF',
        bullets: [
            'Spanningsvelden tussen persona\'s zichtbaar gemaakt',
            'Inzicht in waarom tempo, structuur en besluitvorming botsen',
            'Concrete leiderschapsimplicaties per persona-combinatie',
            'Live toelichting — online of op locatie',
        ],
        what: 'Een verdiept dashboard, toegelicht in een sessie. Van inzicht naar actie.',
        cta: 'Naar Team Dynamics',
        ctaType: 'access-dynamics',
    },
    {
        id: 'strategic',
        eyebrow: 'Module 3 · Voor organisaties',
        title: 'Strategisch Team- & Werkplekinzicht',
        hook: 'Wat vraagt jouw organisatie over drie jaar van teams en werkplek?',
        accent: 'var(--tof-text)',
        soft: '#EDE5D8',
        bullets: [
            'Koppeling van teamdynamiek aan organisatieambitie',
            'Strategisch dashboard als kompas voor 3–5 jaar',
            'Onderbouwing voor werkplek­beleid en leiderschapskeuzes',
            'Gebaseerd op jouw visie én actuele externe inzichten',
        ],
        what: 'Een strategisch richting­document. Op aanvraag en volledig op maat.',
        cta: 'Neem contact op',
        ctaType: 'link',
        ctaHref: 'https://www.tof.services/contact',
    },
];

// ─── COMPONENT ────────────────────────────────────────────────────────────────

export default function TeamIntro({ setPage, setTeamResponses, setSelectedTeam, initialOpen = null }) {
    const [isMobile, setIsMobile] = useState(window.innerWidth < 900);
    const [openId, setOpenId] = useState(initialOpen);

    // Eén gezamenlijke modal-state — het "requiredLevel" bepaalt wat geaccepteerd wordt
    const [accessModal, setAccessModal] = useState(null);
    // accessModal: null | { requiredLevel: 'insight' | 'dynamics', destination: 'teamdashboard' | 'teamdynamics' }

    const [accessInput, setAccessInput] = useState('');
    const [accessError, setAccessError] = useState('');
    const [accessLoading, setAccessLoading] = useState(false);

    // Lijst met teams waar deze gebruiker al toegang toe heeft (uit localStorage).
    // Herladen wanneer de modal sluit, want na een succesvolle code-invoer is er iets bijgekomen.
    const [teamAccesses, setTeamAccesses] = useState(() => listTeamAccesses());

    useEffect(() => {
        if (!accessModal) {
            setTeamAccesses(listTeamAccesses());
        }
    }, [accessModal]);

    const cardRefs = useRef({});
    const makerMode = isMakerAccess();

    useEffect(() => {
        const onResize = () => setIsMobile(window.innerWidth < 900);
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);

    // Scroll naar opengestelde kaart
    useEffect(() => {
        if (!openId) return;
        const el = cardRefs.current[openId];
        if (!el) return;
        requestAnimationFrame(() => {
            el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        });
    }, [openId]);

    function handleToggle(id) {
        setOpenId((prev) => (prev === id ? null : id));
    }

    function openAccessModal(mode) {
        // mode: 'insight' | 'dynamics' | 'any'
        // 'any' = centrale code-invoer, modal accepteert beide en stuurt naar juiste dashboard
        if (mode === 'dynamics') {
            setAccessModal({ requiredLevel: LEVEL_DYNAMICS, destination: 'teamdynamics' });
        } else if (mode === 'any') {
            setAccessModal({ requiredLevel: null, destination: null });
        } else {
            setAccessModal({ requiredLevel: LEVEL_INSIGHT, destination: 'teamdashboard' });
        }
        setAccessInput('');
        setAccessError('');
    }

    function closeAccessModal() {
        setAccessModal(null);
        setAccessInput('');
        setAccessError('');
    }

    // Open een team dat al eerder is ontgrendeld — zonder opnieuw een code in te voeren.
    // Laadt de responses opnieuw (die kunnen gegroeid zijn sinds laatste bezoek).
    async function openExistingTeam(entry, targetLevel) {
        if (!entry) return;

        try {
            if (typeof setSelectedTeam === 'function') {
                setSelectedTeam({
                    team: entry.team,
                    organization: entry.organization,
                    code: entry.code,
                });
            }

            const responses = await getResponsesByTeam(entry.team, entry.organization);
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

    // ── Niveau-gebaseerde toegangsflow ─────────────────────────────────────────
    const handleAccessSubmit = async () => {
        if (!accessModal) return;
        const cleanedInput = accessInput.trim();
        if (!cleanedInput) {
            setAccessError('Voer eerst een toegangscode in.');
            return;
        }

        setAccessLoading(true);
        setAccessError('');

        try {
            // Bij 'any'-mode (centrale code-invoer) eerst proberen als admin-code.
            // Zo kan de beheerder dezelfde knop gebruiken als gewone gebruikers.
            const isAnyMode = accessModal.requiredLevel === null;

            if (isAnyMode) {
                const adminResult = await validateAdminCode(cleanedInput);
                if (adminResult) {
                    grantAdminAccess();
                    closeAccessModal();
                    // Beheerder gaat naar teamselector om uit alle teams te kiezen
                    setPage('teamselector');
                    setAccessLoading(false);
                    return;
                }
            }

            const accessResult = await validateTeamAccessCode(cleanedInput);
            if (!accessResult) {
                setAccessError('Onjuiste of onbekende code.');
                setAccessLoading(false);
                return;
            }

            const codeLevel = accessResult.level || LEVEL_INSIGHT;

            // Als Module 2 vraagt maar code is alleen insight → blokkeren
            if (accessModal.requiredLevel === LEVEL_DYNAMICS && codeLevel !== LEVEL_DYNAMICS) {
                setAccessError('Deze code geeft alleen toegang tot Team Insight, niet tot Team Dynamics.');
                setAccessLoading(false);
                return;
            }

            // Code geldig — niveau opslaan via het nieuwe access-model.
            // Dynamics-codes geven óók Insight (access.js doet de juiste priority).
            grantTeamLevel({
                team: accessResult.team,
                organization: accessResult.organization,
                level: codeLevel,
                code: accessResult.code,
            });

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
                accessResult.organization
            );
            if (typeof setTeamResponses === 'function') {
                setTeamResponses(responses || []);
            }

            closeAccessModal();

            // Destination: bij 'any' mode → op basis van wat de code ontgrendelt.
            // Bij specifieke mode → vooraf bepaalde destination.
            const destination = accessModal.destination
                || (codeLevel === LEVEL_DYNAMICS ? 'teamdynamics' : 'teamdashboard');
            setPage(destination);
        } catch (err) {
            console.error('Access flow error:', err);
            setAccessError('Er ging iets mis. Probeer het opnieuw.');
        } finally {
            setAccessLoading(false);
        }
    };

    // ── RENDER ────────────────────────────────────────────────────────────────
    return (
        <PageShell padding={isMobile ? '16px 16px 28px' : '20px 20px 32px'}>
            <div style={{ display: 'grid', gap: isMobile ? 16 : 20, animation: 'tofFadeIn 0.5s ease' }}>

                {/* ── HERO — rose identiteit ── */}
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
                            Voor teams &amp; organisaties
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
                                Jouw team heeft een patroon.
                                <br />
                                <em style={{ color: 'var(--tof-accent-rose)', fontStyle: 'italic' }}>
                                    Tijd om het te zien.
                                </em>
                            </h1>
                            {!isMobile && (
                                <p style={{ margin: 0, maxWidth: 260, fontSize: 14, lineHeight: 1.65, color: '#6F6A66', paddingBottom: 4, flexShrink: 0 }}>
                                    Elk team werkt anders — en dat patroon is zichtbaar te maken. Kies het niveau dat bij jouw vraag past.
                                </p>
                            )}
                        </div>
                        {isMobile && (
                            <p style={{ margin: 0, fontSize: 14, lineHeight: 1.65, color: '#6F6A66' }}>
                                Elk team werkt anders. Kies het niveau dat bij jouw vraag past.
                            </p>
                        )}
                        {makerMode && (
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'var(--tof-rose-soft)', border: '1px solid rgba(176,82,82,0.12)', borderRadius: 999, padding: '6px 12px', fontSize: 12, color: 'var(--tof-text-muted)', width: 'fit-content' }}>
                                🛠 Maker mode actief
                            </div>
                        )}
                    </div>
                </div>

                {/* ── MODULE KAARTEN ──────────────────────────────────── */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, minmax(0, 1fr))',
                    gap: isMobile ? 12 : 16,
                    alignItems: 'start',
                }}>
                    {MODULES.map((mod) => {
                        const isOpen = openId === mod.id;
                        const isDimmed = openId !== null && !isOpen;
                        return (
                            <ModuleCard
                                key={mod.id}
                                mod={mod}
                                isOpen={isOpen}
                                isDimmed={isDimmed}
                                isMobile={isMobile}
                                onToggle={() => handleToggle(mod.id)}
                                onCta={() => {
                                    if (mod.ctaType === 'access-insight') openAccessModal('insight');
                                    else if (mod.ctaType === 'access-dynamics') openAccessModal('dynamics');
                                    else if (mod.ctaType === 'link') window.open(mod.ctaHref, '_blank', 'noopener,noreferrer');
                                }}
                                cardRef={(el) => { cardRefs.current[mod.id] = el; }}
                            />
                        );
                    })}
                </div>

                {/* ── HEB JE EEN CODE? ────────────────────────────────── */}
                {/* Centrale code-invoer onder de modules. De modal detecteert */}
                {/* zelf of de code voor Insight of Dynamics is (stap 2: DB-level). */}
                <CodeEntryBlock
                    isMobile={isMobile}
                    onOpenCodeModal={() => openAccessModal('any')}
                />

                {/* ── JOUW TOEGANG — voor returning users of beheerder ───── */}
                {(teamAccesses.length > 0 || isAdminAccess()) && (
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
                )}

                {/* ── FOOTER NAVIGATIE ────────────────────────────────── */}
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                    <SecondaryButton onClick={() => setPage('home')}>Terug naar home</SecondaryButton>
                    <SecondaryButton onClick={() => window.open('https://www.tof.services/contact', '_blank', 'noopener,noreferrer')}>
                        Plan een gesprek
                    </SecondaryButton>
                </div>

                {/* ── SUBTIELE MANAGER-LINK ──────────────────────────── */}
                {/* Bewust klein en onopvallend — alleen relevant voor afdelingsmanagers */}
                {/* met een account. Teamleiders hebben hier niks aan en worden er niet */}
                {/* door afgeleid. */}
                <div
                    style={{
                        paddingTop: 8,
                        fontSize: 13,
                        color: 'var(--tof-text-muted)',
                        lineHeight: 1.6,
                    }}
                >
                    Afdelingsmanager met meerdere teams?{' '}
                    <button
                        type="button"
                        onClick={() => setPage('login')}
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
                        Manager login →
                    </button>
                </div>

            </div>

            {/* ── GEZAMENLIJKE TOEGANGSMODAL ──────────────────────── */}
            {accessModal && (
                <AccessModal
                    requiredLevel={accessModal.requiredLevel}
                    accessInput={accessInput}
                    setAccessInput={setAccessInput}
                    accessError={accessError}
                    accessLoading={accessLoading}
                    onSubmit={handleAccessSubmit}
                    onClose={closeAccessModal}
                />
            )}
        </PageShell>
    );
}

// ─── CODE ENTRY BLOCK ────────────────────────────────────────────────────────
// Onder de modules: één duidelijke ingang voor wie een code heeft ontvangen.
// Dit vervangt de onduidelijkheid van "welke module-knop moet ik?" — je voert
// gewoon je code in en het systeem brengt je naar het juiste dashboard.

function CodeEntryBlock({ isMobile, onOpenCodeModal }) {
    return (
        <div
            style={{
                background: 'var(--tof-surface)',
                border: '1px solid var(--tof-border)',
                borderLeft: '3px solid var(--tof-accent-rose)',
                borderRadius: 14,
                padding: isMobile ? '14px 16px' : '16px 22px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 16,
                flexWrap: 'wrap',
            }}
        >
            <div style={{ display: 'grid', gap: 4, minWidth: 220 }}>
                <div
                    style={{
                        fontSize: 11,
                        textTransform: 'uppercase',
                        letterSpacing: 1.6,
                        fontWeight: 700,
                        color: 'var(--tof-accent-rose)',
                    }}
                >
                    Heb je een toegangscode ontvangen?
                </div>
                <p
                    style={{
                        margin: 0,
                        fontSize: 14,
                        lineHeight: 1.6,
                        color: 'var(--tof-text-soft)',
                    }}
                >
                    Voer hem hier in — je komt automatisch op het juiste dashboard.
                </p>
            </div>
            <PrimaryButton onClick={onOpenCodeModal}>
                Code invoeren
            </PrimaryButton>
        </div>
    );
}

// ─── JOUW TOEGANG PANEEL ─────────────────────────────────────────────────────
// Alleen teams + openen. Geen upgrade-knoppen — die verwarren gebruikers die
// niet weten wat een "Dynamics-code" is. Upgrade loopt via contact (aparte regel).

function YourAccessPanel({ teamAccesses, isMobile, onOpenTeam, onLogout, adminMode = false, onLogoutAdmin }) {
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
                            Jouw toegang
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
                                    BEHEERDER
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
                                ? 'Je bent ingelogd als beheerder en hebt toegang tot alle teams via de teamselector.'
                                : teamAccesses.length === 1
                                    ? 'Je hebt toegang tot dit team.'
                                    : `Je hebt toegang tot ${teamAccesses.length} teams.`}
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
                        Uitloggen
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
                                Kies een team uit het overzicht om te openen.
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
                    Meer dan Team Insight nodig?{' '}
                    <a
                        href="https://www.tof.services/contact"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                            color: 'var(--tof-accent-rose)',
                            fontWeight: 600,
                            textDecoration: 'underline',
                            textUnderlineOffset: 3,
                        }}
                    >
                        Vraag Dynamics-toegang aan →
                    </a>
                </div>
            )}
        </div>
    );
}

function AccessRow({ entry, isMobile, onOpen }) {
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
                    {entry.team || 'Team'}
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
                    {isDynamics ? 'Team Insight + Dynamics' : 'Team Insight'}
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
                    Insight →
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
                        Dynamics →
                    </button>
                )}
            </div>
        </div>
    );
}

// ─── TOEGANGSMODAL ─────────────────────────────────────────────────────────────

function AccessModal({
    requiredLevel,
    accessInput,
    setAccessInput,
    accessError,
    accessLoading,
    onSubmit,
    onClose,
}) {
    const isDynamics = requiredLevel === LEVEL_DYNAMICS;
    const isAny = requiredLevel === null || requiredLevel === undefined;

    let eyebrow, title, lead, accentColor;

    if (isAny) {
        eyebrow = 'Toegangscode';
        title = 'Voer je toegangscode in';
        lead = 'We herkennen zelf of je toegang hebt tot Team Insight of Team Dynamics — je komt automatisch op het juiste dashboard.';
        accentColor = 'var(--tof-text)';
    } else if (isDynamics) {
        eyebrow = 'Module 2';
        title = 'Toegangscode Team Dynamics';
        lead = 'Voer je toegangscode voor Team Dynamics in. Deze code geeft ook toegang tot Team Insight.';
        accentColor = 'var(--tof-accent-rose)';
    } else {
        eyebrow = 'Module 1';
        title = 'Toegangscode Team Insight';
        lead = 'Voer je toegangscode voor Team Insight in.';
        accentColor = 'var(--tof-accent-sage)';
    }

    return (
        <div style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.28)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1000, padding: 16,
        }}>
            <div style={{
                background: '#fff', borderRadius: 18, padding: 26,
                width: '100%', maxWidth: 380,
                display: 'grid', gap: 14,
                boxShadow: '0 24px 64px rgba(0,0,0,0.14)',
                border: '1px solid #E5D9CD',
            }}>
                <div style={{
                    fontSize: 11,
                    textTransform: 'uppercase',
                    letterSpacing: 1.6,
                    color: accentColor,
                    fontWeight: 700,
                }}>
                    {eyebrow}
                </div>

                <div style={{
                    fontFamily: 'var(--tof-font-heading)',
                    fontSize: 22, lineHeight: 1.15,
                    color: 'var(--tof-text)',
                }}>
                    {title}
                </div>

                <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: 'var(--tof-text-soft)' }}>
                    {lead}
                </p>

                <input
                    value={accessInput}
                    onChange={(e) => setAccessInput(e.target.value)}
                    placeholder="Voer code in"
                    autoFocus
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !accessLoading) onSubmit();
                    }}
                    style={{
                        padding: '10px 13px', borderRadius: 10,
                        border: `1px solid ${accessError ? 'var(--tof-accent-rose)' : '#E5D9CD'}`,
                        fontSize: 14, outline: 'none',
                        fontFamily: 'var(--tof-font-body)',
                    }}
                />

                {accessError && (
                    <p style={{ margin: 0, fontSize: 13, color: 'var(--tof-accent-rose)', lineHeight: 1.5 }}>
                        {accessError}
                    </p>
                )}

                <div style={{ display: 'flex', gap: 10 }}>
                    <PrimaryButton
                        onClick={onSubmit}
                        style={{
                            flex: 1,
                            background: accentColor,
                        }}
                    >
                        {accessLoading ? 'Bezig…' : 'Ga verder'}
                    </PrimaryButton>
                    <SecondaryButton onClick={onClose}>
                        Sluiten
                    </SecondaryButton>
                </div>
            </div>
        </div>
    );
}

// ─── MODULE KAART ─────────────────────────────────────────────────────────────

function ModuleCard({ mod, isOpen, isDimmed, isMobile, onToggle, onCta, cardRef }) {
    return (
        <div
            ref={cardRef}
            style={{
                scrollMarginTop: 24,
                transition: 'opacity 0.25s ease, transform 0.25s ease',
                opacity: isDimmed ? 0.55 : 1,
                transform: isOpen ? 'translateY(-2px)' : 'translateY(0)',
            }}
        >
            <button
                type="button"
                onClick={onToggle}
                onMouseLeave={(e) => e.currentTarget.blur()}
                style={{
                    width: '100%',
                    textAlign: 'left',
                    background: isOpen
                        ? `linear-gradient(145deg, ${mod.soft} 0%, #F7F3EE 100%)`
                        : 'var(--tof-surface)',
                    border: isOpen ? `1px solid ${mod.accent}` : '1px solid var(--tof-border)',
                    borderTop: `4px solid ${mod.accent}`,
                    borderRadius: 18,
                    padding: 0,
                    cursor: 'pointer',
                    boxShadow: isOpen
                        ? '0 16px 36px rgba(40,25,20,0.10)'
                        : 'var(--tof-shadow)',
                    overflow: 'hidden',
                    transition: 'all 0.25s ease',
                    outline: 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    minHeight: isOpen ? undefined : 220,
                }}
            >
                <div style={{ padding: isMobile ? '18px 16px 16px' : '20px 22px 18px', display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                        <div style={{ display: 'grid', gap: 10 }}>
                            <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 1.8, fontWeight: 700, color: mod.accent === 'var(--tof-text)' ? 'var(--tof-text-muted)' : mod.accent }}>
                                {mod.eyebrow}
                            </div>

                            <h2 style={{ margin: 0, fontFamily: 'var(--tof-font-heading)', fontSize: isMobile ? 22 : 23, lineHeight: 1.1, color: 'var(--tof-text)' }}>
                                {mod.title}
                            </h2>

                            <p style={{ margin: 0, fontSize: isMobile ? 14 : 15, lineHeight: 1.6, color: 'var(--tof-text-soft)', maxWidth: 340 }}>
                                {mod.hook}
                            </p>
                        </div>

                        <div style={{
                            minWidth: 34, height: 34,
                            borderRadius: 999,
                            background: isOpen ? mod.accent : mod.soft,
                            color: isOpen ? '#fff' : mod.accent === 'var(--tof-text)' ? 'var(--tof-text)' : mod.accent,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 20, lineHeight: 1, fontWeight: 500,
                            flexShrink: 0,
                            transition: 'all 0.2s ease',
                        }}>
                            {isOpen ? '–' : '+'}
                        </div>
                    </div>

                    {isOpen && (
                        <div style={{ marginTop: 18, display: 'grid', gap: 12 }}>
                            <div style={{ display: 'grid', gap: 8 }}>
                                {mod.bullets.map((b, i) => (
                                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                                        <div style={{
                                            width: 20, height: 20, borderRadius: 999,
                                            background: mod.soft,
                                            border: `1.5px solid ${mod.accent === 'var(--tof-text)' ? 'var(--tof-border)' : mod.accent}`,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontSize: 10, fontWeight: 700,
                                            color: mod.accent === 'var(--tof-text)' ? 'var(--tof-text-muted)' : mod.accent,
                                            flexShrink: 0, marginTop: 1,
                                        }}>✓</div>
                                        <span style={{ fontSize: 14, lineHeight: 1.65, color: 'var(--tof-text-soft)' }}>{b}</span>
                                    </div>
                                ))}
                            </div>

                            <div style={{
                                background: mod.soft,
                                borderRadius: 12,
                                padding: '12px 14px',
                                fontSize: 13,
                                color: 'var(--tof-text)',
                                lineHeight: 1.65,
                                border: `1px solid ${mod.accent === 'var(--tof-text)' ? 'var(--tof-border)' : `${mod.accent}30`}`,
                            }}>
                                <strong style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 1.4, color: mod.accent === 'var(--tof-text)' ? 'var(--tof-text-muted)' : mod.accent, display: 'block', marginBottom: 5 }}>
                                    Wat je krijgt
                                </strong>
                                {mod.what}
                            </div>
                        </div>
                    )}

                    <div style={{ fontSize: 12, color: 'var(--tof-text-muted)', fontWeight: 500, marginTop: 'auto', paddingTop: 12 }}>
                        {isOpen ? 'Minder tonen' : 'Ontdek wat dit inhoudt →'}
                    </div>
                </div>
            </button>

            {isOpen && (
                <div style={{ padding: '12px 4px 0' }}>
                    <PrimaryButton onClick={(e) => { e.stopPropagation(); onCta(); }}>
                        {mod.cta}
                    </PrimaryButton>
                </div>
            )}
        </div>
    );
}
