/**
 * TeamIntro.jsx — Verkoopintro voor de drie modules
 *
 * UX-patroon: identiek aan Library/persona-kaarten.
 * - Één kaart open tegelijk
 * - Andere kaarten dimmen
 * - Korte, scherpe verkooptekst — geen lange lappen
 * - Elke kaart heeft een eigen accent en eigen CTA
 */

import React, { useEffect, useRef, useState } from 'react';
import { isMakerAccess, grantTeamAccess } from '../utils/access';
import { validateTeamAccessCode, getResponsesByTeam } from '../supabase';
import {
    PageShell,
    PrimaryButton,
    SecondaryButton,
    SectionEyebrow,
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
        ctaType: 'access', // opent toegangsmodal
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
        ctaType: 'dynamics-modal',
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
    const [showAccessModal, setShowAccessModal] = useState(false);
    const [showModule2Modal, setShowModule2Modal] = useState(false);
    const [accessInput, setAccessInput] = useState('');
    const [accessError, setAccessError] = useState('');
    const [accessLoading, setAccessLoading] = useState(false);
    const [m2Input, setM2Input] = useState('');
    const [m2Error, setM2Error] = useState('');
    const MODULE2_CODE = '1980!T03g4ngPERSONA';
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

    // ── Toegangsflow (ongewijzigd) ─────────────────────────────────────────────
    const handleAccessSubmit = async () => {
        const cleanedInput = accessInput.trim();
        if (!cleanedInput) { setAccessError('Voer eerst een toegangscode in.'); return; }

        setAccessLoading(true);
        setAccessError('');

        try {
            const accessResult = await validateTeamAccessCode(cleanedInput);
            if (!accessResult) { setAccessError('Onjuiste of onbekende code.'); setAccessLoading(false); return; }

            const responses = await getResponsesByTeam(accessResult.team, accessResult.organization);

            grantTeamAccess({ code: accessResult.code, team: accessResult.team, organization: accessResult.organization });

            setShowAccessModal(false);
            setAccessInput('');
            setAccessError('');

            if (typeof setSelectedTeam === 'function') {
                setSelectedTeam({ team: accessResult.team, organization: accessResult.organization, code: accessResult.code });
            }
            if (typeof setTeamResponses === 'function') {
                setTeamResponses(responses || []);
            }

            setPage('teamdashboard');
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

                {/* ── HERO — rose identiteit (commercieel, activerend) ── */}
                <div style={{
                    background: 'linear-gradient(145deg, #FDF6F6 0%, #F7F0ED 100%)',
                    borderRadius: 20,
                    border: '1px solid rgba(176,82,82,0.14)',
                    boxShadow: '0 10px 28px rgba(176,82,82,0.06)',
                    padding: isMobile ? '24px 20px 22px' : '36px 40px 32px',
                    position: 'relative',
                    overflow: 'hidden',
                }}>
                    {/* Rose accentlijn links */}
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
                                    if (mod.ctaType === 'access') setShowAccessModal(true);
                                    else if (mod.ctaType === 'dynamics-modal') setShowModule2Modal(true);
                                    else if (mod.ctaType === 'mail') window.open(mod.ctaHref, '_blank', 'noopener,noreferrer');
                                    else if (mod.ctaType === 'link') window.open(mod.ctaHref, '_blank', 'noopener,noreferrer');
                                }}
                                cardRef={(el) => { cardRefs.current[mod.id] = el; }}
                            />
                        );
                    })}
                </div>

                {/* ── FOOTER NAVIGATIE ────────────────────────────────── */}
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                    <SecondaryButton onClick={() => setPage('home')}>Terug naar home</SecondaryButton>
                    <SecondaryButton onClick={() => window.open('https://www.tof.services/contact', '_blank', 'noopener,noreferrer')}>
                        Plan een gesprek
                    </SecondaryButton>
                </div>

            </div>

            {/* ── TOEGANGSMODAL (ongewijzigd) ──────────────────────── */}
            {showAccessModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.28)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16 }}>
                    <div style={{ background: '#fff', borderRadius: 18, padding: 26, width: '100%', maxWidth: 360, display: 'grid', gap: 14, boxShadow: '0 24px 64px rgba(0,0,0,0.14)', border: '1px solid #E5D9CD' }}>
                        <div style={{ fontFamily: 'var(--tof-font-heading)', fontSize: 22, lineHeight: 1.1, color: 'var(--tof-text)' }}>
                            Toegangscode
                        </div>
                        <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: 'var(--tof-text-soft)' }}>
                            Voer je persoonlijke code in om naar de teamomgeving te gaan.
                        </p>
                        <input
                            value={accessInput}
                            onChange={(e) => { setAccessInput(e.target.value); setAccessError(''); }}
                            placeholder="Voer code in"
                            autoFocus
                            onKeyDown={(e) => e.key === 'Enter' && handleAccessSubmit()}
                            style={{ padding: '10px 13px', borderRadius: 10, border: `1px solid ${accessError ? 'var(--tof-accent-rose)' : '#E5D9CD'}`, fontSize: 14, outline: 'none', fontFamily: 'var(--tof-font-body)' }}
                        />
                        {accessError && (
                            <p style={{ margin: 0, fontSize: 13, color: 'var(--tof-accent-rose)', lineHeight: 1.5 }}>{accessError}</p>
                        )}
                        <div style={{ display: 'flex', gap: 10 }}>
                            <PrimaryButton onClick={handleAccessSubmit} style={{ flex: 1 }}>
                                {accessLoading ? 'Bezig…' : 'Ga verder'}
                            </PrimaryButton>
                            <SecondaryButton onClick={() => { setShowAccessModal(false); setAccessInput(''); setAccessError(''); }}>
                                Sluiten
                            </SecondaryButton>
                        </div>
                    </div>
                </div>
            )}
            {/* ── MODULE 2 MODAL ───────────────────────────────────── */}
            {showModule2Modal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.28)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16 }}>
                    <div style={{ background: '#fff', borderRadius: 18, padding: 26, width: '100%', maxWidth: 360, display: 'grid', gap: 14, boxShadow: '0 24px 64px rgba(0,0,0,0.14)', border: '1px solid #E5D9CD' }}>
                        <div style={{ fontFamily: 'var(--tof-font-heading)', fontSize: 22, lineHeight: 1.1, color: 'var(--tof-text)' }}>
                            Toegangscode
                        </div>
                        <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: 'var(--tof-text-soft)' }}>
                            Voer je persoonlijke code in om naar Team Dynamics te gaan.
                        </p>
                        <input
                            type="password"
                            value={m2Input}
                            onChange={(e) => { setM2Input(e.target.value); setM2Error(''); }}
                            placeholder="Voer code in"
                            autoFocus
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    if (m2Input.trim() === MODULE2_CODE) {
                                        try { localStorage.setItem('tof_module2_access', '1'); } catch { }
                                        setShowModule2Modal(false);
                                        setPage('teamdynamics');
                                    } else {
                                        setM2Error('Onjuiste toegangscode.');
                                    }
                                }
                            }}
                            style={{ padding: '10px 13px', borderRadius: 10, border: `1px solid ${m2Error ? 'var(--tof-accent-rose)' : '#E5D9CD'}`, fontSize: 14, outline: 'none', fontFamily: 'var(--tof-font-body)' }}
                        />
                        {m2Error && (
                            <p style={{ margin: 0, fontSize: 13, color: 'var(--tof-accent-rose)', lineHeight: 1.5 }}>{m2Error}</p>
                        )}
                        <div style={{ display: 'flex', gap: 10 }}>
                            <PrimaryButton
                                onClick={() => {
                                    if (m2Input.trim() === MODULE2_CODE) {
                                        try { localStorage.setItem('tof_module2_access', '1'); } catch { }
                                        setShowModule2Modal(false);
                                        setPage('teamdynamics');
                                    } else {
                                        setM2Error('Onjuiste toegangscode.');
                                    }
                                }}
                                style={{ flex: 1 }}
                            >
                                Ga verder
                            </PrimaryButton>
                            <SecondaryButton onClick={() => { setShowModule2Modal(false); setM2Input(''); setM2Error(''); }}>
                                Sluiten
                            </SecondaryButton>
                        </div>
                    </div>
                </div>
            )}
        </PageShell>
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
                {/* ── Kaart-header ──────────────────────────────────── */}
                <div style={{ padding: isMobile ? '18px 16px 16px' : '20px 22px 18px', display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                        <div style={{ display: 'grid', gap: 10 }}>
                            {/* Eyebrow */}
                            <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 1.8, fontWeight: 700, color: mod.accent === 'var(--tof-text)' ? 'var(--tof-text-muted)' : mod.accent }}>
                                {mod.eyebrow}
                            </div>

                            {/* Titel */}
                            <h2 style={{ margin: 0, fontFamily: 'var(--tof-font-heading)', fontSize: isMobile ? 22 : 23, lineHeight: 1.1, color: 'var(--tof-text)' }}>
                                {mod.title}
                            </h2>

                            {/* Hook — de verkoopzin */}
                            <p style={{ margin: 0, fontSize: isMobile ? 14 : 15, lineHeight: 1.6, color: 'var(--tof-text-soft)', maxWidth: 340 }}>
                                {mod.hook}
                            </p>
                        </div>

                        {/* +/- knop */}
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

                    {/* Expanded content */}
                    {isOpen && (
                        <div style={{ marginTop: 18, display: 'grid', gap: 12 }}>

                            {/* Bullets */}
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

                            {/* Wat je krijgt */}
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

                    {/* Hint-tekst */}
                    <div style={{ fontSize: 12, color: 'var(--tof-text-muted)', fontWeight: 500, marginTop: 'auto', paddingTop: 12 }}>
                        {isOpen ? 'Minder tonen' : 'Ontdek wat dit inhoudt →'}
                    </div>
                </div>
            </button>

            {/* CTA buiten de button — voorkomt click-conflict */}
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
