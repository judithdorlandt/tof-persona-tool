import React, { useEffect, useState } from 'react';
import tofLogo from '../assets/tof-logo.png';
import { supabase } from '../supabase';
import { grantTeamAccess } from '../utils/access';
import {
  PageShell,
  SectionCard,
  PrimaryButton,
  SecondaryButton,
  SectionEyebrow,
} from '../ui/AppShell';

export default function Home({ setPage }) {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 900);
  const [showLock, setShowLock] = useState(false);
  const [accessCode, setAccessCode] = useState('');
  const [lockError, setLockError] = useState('');
  const [checkingCode, setCheckingCode] = useState(false);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 900);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  function openTeamLock() {
    setShowLock(true);
    setAccessCode('');
    setLockError('');
    setCheckingCode(false);
  }

  function closeTeamLock() {
    setShowLock(false);
    setAccessCode('');
    setLockError('');
    setCheckingCode(false);
  }

  async function handleUnlock() {
    const code = accessCode.trim();

    if (!code) {
      setLockError('Voer eerst een toegangscode in');
      return;
    }

    setCheckingCode(true);
    setLockError('');

    const { data, error } = await supabase
      .from('responses')
      .select('invite_code')
      .eq('invite_code', code)
      .limit(1);

    if (error) {
      console.error(error);
      setLockError('Er ging iets mis bij het controleren van de code');
      setCheckingCode(false);
      return;
    }

    if (!data || data.length === 0) {
      setLockError('Onjuiste of onbekende code');
      setCheckingCode(false);
      return;
    }

    grantTeamAccess(code);
    closeTeamLock();
    setPage('teamintro');
  }

  return (
    <PageShell padding={isMobile ? '16px 16px 28px' : '20px 20px 32px'}>
      <div
        style={{
          animation: 'tofFadeIn 0.5s ease',
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: isMobile ? 14 : 18,
          width: '100%',
        }}
      >
        {/* ── HERO ───────────────────────────────────────────────── */}
        <div style={{
          background: 'var(--tof-surface)',
          borderRadius: 20,
          border: '1px solid var(--tof-border)',
          boxShadow: 'var(--tof-shadow)',
          padding: isMobile ? '24px 20px 22px' : '36px 40px 32px',
          position: 'relative',
          overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', left: 0, top: 0, width: 4, height: '100%', background: 'var(--tof-accent-rose)', borderRadius: '4px 0 0 4px' }} />
          <div style={{ display: 'grid', gap: isMobile ? 16 : 20, paddingLeft: isMobile ? 8 : 16 }}>
            <div style={{ color: 'var(--tof-accent-rose)', letterSpacing: 2, fontSize: 11, textTransform: 'uppercase', fontWeight: 700 }}>
              01 — TOF Persona Tool
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap' }}>
              <h1 style={{
                margin: 0,
                fontFamily: "'Playfair Display', serif",
                fontWeight: 500,
                fontSize: isMobile ? 'clamp(30px, 7vw, 42px)' : 'clamp(38px, 4vw, 56px)',
                lineHeight: 1.06,
                color: '#1f1b18',
                maxWidth: 580,
              }}>
                Ontdek hoe jij werkt —{' '}
                <em style={{ color: 'var(--tof-accent-rose)', fontStyle: 'italic' }}>
                  en waarom dat in teams soms schuurt.
                </em>
              </h1>
              {!isMobile && (
                <p style={{ margin: 0, maxWidth: 260, fontSize: 14, lineHeight: 1.7, color: '#6F6A66', paddingBottom: 6, flexShrink: 0 }}>
                  Start bij jezelf. Krijg inzicht in jouw werkstijl, jouw energie en wat jij nodig hebt om goed tot je recht te komen.
                </p>
              )}
            </div>
            {isMobile && (
              <p style={{ margin: 0, fontSize: 14, lineHeight: 1.65, color: '#6F6A66' }}>
                Start bij jezelf. Krijg inzicht in jouw werkstijl en wat jij nodig hebt.
              </p>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <button
                onClick={() => setPage('intro')}
                style={{
                  background: 'var(--tof-accent-rose)', color: '#fff', border: 'none',
                  padding: '13px 24px', borderRadius: 12, cursor: 'pointer',
                  fontSize: 15, fontWeight: 600, fontFamily: 'var(--tof-font-body)',
                  boxShadow: '0 4px 14px rgba(176,82,82,0.30)',
                  transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(176,82,82,0.38)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(176,82,82,0.30)'; }}
              >
                Start de Persona test
              </button>
              <SecondaryButton onClick={() => setPage('team')}>Voor teams &amp; organisaties</SecondaryButton>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                background: 'var(--tof-rose-soft)', border: '1px solid rgba(176,82,82,0.12)',
                borderRadius: 999, padding: '6px 12px', fontSize: 12, color: 'var(--tof-text-muted)',
              }}>
                <span>⏱</span><span>~15 min</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── AANBOD KAARTEN ─────────────────────────────────────── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, minmax(0, 1fr))',
          gap: isMobile ? 12 : 14,
          alignItems: 'stretch',
        }}>
          <div role="button" tabIndex={0} onClick={() => setPage('intro')} onKeyDown={(e) => { if (e.key === 'Enter') setPage('intro'); }}
            style={{ background: 'var(--tof-surface)', borderRadius: 16, padding: '22px 22px 20px', borderTop: '4px solid var(--tof-accent-sage)', border: '1px solid var(--tof-border)', boxShadow: 'var(--tof-shadow)', display: 'flex', flexDirection: 'column', gap: 10, cursor: 'pointer', transition: 'transform 0.2s ease, box-shadow 0.2s ease' }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 12px 28px rgba(0,0,0,0.08)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'var(--tof-shadow)'; }}
          >
            <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 1.6, color: 'var(--tof-accent-sage)', fontWeight: 700 }}>Jouw werkstijl</div>
            <h3 style={{ fontFamily: "'Playfair Display', serif", fontWeight: 500, margin: 0, fontSize: 21, lineHeight: 1.12, color: '#1f1b18' }}>Persona Insight</h3>
            <p style={{ margin: 0, color: 'var(--tof-text-soft)', fontSize: 14, lineHeight: 1.7, flex: 1 }}>Inzicht in hoe jij werkt, waar jouw energie zit en wat jij nodig hebt om goed tot je recht te komen.</p>
            <div style={{ fontSize: 12, color: 'var(--tof-accent-sage)', fontWeight: 600 }}>Start de test →</div>
          </div>

          <div role="button" tabIndex={0} onClick={() => setPage('team')} onKeyDown={(e) => { if (e.key === 'Enter') setPage('team'); }}
            style={{ background: 'linear-gradient(145deg, #FDF6F6 0%, #F7F0ED 100%)', borderRadius: 16, padding: '22px 22px 20px', borderTop: '4px solid var(--tof-accent-rose)', border: '1px solid rgba(176,82,82,0.14)', boxShadow: 'var(--tof-shadow)', display: 'flex', flexDirection: 'column', gap: 10, cursor: 'pointer', transition: 'transform 0.2s ease, box-shadow 0.2s ease' }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 12px 28px rgba(176,82,82,0.10)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'var(--tof-shadow)'; }}
          >
            <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 1.6, color: 'var(--tof-accent-rose)', fontWeight: 700 }}>Voor teams</div>
            <h3 style={{ fontFamily: "'Playfair Display', serif", fontWeight: 500, margin: 0, fontSize: 21, lineHeight: 1.12, color: '#1f1b18' }}>Team Insight &amp; Quick Wins</h3>
            <p style={{ margin: 0, color: 'var(--tof-text-soft)', fontSize: 14, lineHeight: 1.7, flex: 1 }}>Van losse profielen naar helder teaminzicht — inclusief werkplekbehoefte en directe kansen.</p>
            <div style={{ fontSize: 12, color: 'var(--tof-accent-rose)', fontWeight: 600 }}>Bekijk de modules →</div>
          </div>

          <div role="button" tabIndex={0} onClick={() => setPage('team')} onKeyDown={(e) => { if (e.key === 'Enter') setPage('team'); }}
            style={{ background: 'var(--tof-accent-sage)', borderRadius: 16, padding: '22px 22px 20px', borderTop: '4px solid #5a7560', border: '1px solid var(--tof-accent-sage)', boxShadow: 'var(--tof-shadow)', display: 'flex', flexDirection: 'column', gap: 10, cursor: 'pointer', transition: 'transform 0.2s ease, box-shadow 0.2s ease', position: 'relative', overflow: 'hidden' }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 12px 28px rgba(110,136,114,0.25)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'var(--tof-shadow)'; }}
          >
            <div aria-hidden style={{ position: 'absolute', top: -40, right: -40, width: 160, height: 160, borderRadius: '50%', background: 'rgba(255,255,255,0.07)', pointerEvents: 'none' }} />
            <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 1.6, color: 'rgba(255,255,255,0.6)', fontWeight: 700 }}>Voor organisaties</div>
            <h3 style={{ fontFamily: "'Playfair Display', serif", fontWeight: 500, margin: 0, fontSize: 21, lineHeight: 1.12, color: '#fff' }}>Team Dynamics &amp; Strategie</h3>
            <p style={{ margin: 0, color: 'rgba(255,255,255,0.78)', fontSize: 14, lineHeight: 1.7, flex: 1 }}>Spanningsvelden, leiderschapsimplicaties en werkplekstrategie voor de lange termijn.</p>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)', fontWeight: 600 }}>Meer informatie →</div>
          </div>
        </div>

        {/* ── WAAROM + FOOTER ─────────────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? 12 : 14, alignItems: 'stretch' }}>
          <FeatureCard label="Waarom dit werkt" title="Van inzicht naar beweging." background="var(--tof-surface-soft)" borderTopColor="var(--tof-accent-sage)">
            <p style={{ margin: 0, color: 'var(--tof-text-soft)', fontSize: 14, lineHeight: 1.7 }}>
              Niet alleen zien hoe iemand werkt — maar begrijpen waar energie ontstaat, waar het schuurt en wat dat vraagt van samenwerking en werkplek.
            </p>
            <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', marginTop: 4 }}>
              {['Individueel profiel', 'Teamdynamiek', 'Bricks · Bytes · Behavior', 'Concrete acties'].map((t) => (
                <span key={t} style={{ fontSize: 12, color: 'var(--tof-text-muted)', background: 'var(--tof-surface)', border: '1px solid var(--tof-border)', borderRadius: 999, padding: '3px 10px' }}>{t}</span>
              ))}
            </div>
          </FeatureCard>

          <div style={{ background: 'var(--tof-surface)', borderRadius: 16, padding: '20px 22px', border: '1px solid var(--tof-border)', boxShadow: 'var(--tof-shadow)', display: 'grid', gap: 14, alignContent: 'start' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <img src={tofLogo} alt="TOF logo" style={{ width: 28, height: 28, objectFit: 'contain', flexShrink: 0 }} />
              <div style={{ fontFamily: '"Playfair Display", serif', fontWeight: 300, fontSize: '1rem', color: '#1F1F1F', display: 'inline-flex', gap: 0 }}>
                <span style={{ marginRight: '0.15em' }}>The Office</span>
                <span style={{ fontStyle: 'italic', color: '#B05252' }}>Factory</span>
              </div>
            </div>
            <p style={{ margin: 0, fontSize: 13, lineHeight: 1.65, color: 'var(--tof-text-soft)' }}>Wij helpen organisaties om werkplek, gedrag en samenwerking beter op elkaar te laten aansluiten.</p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <button type="button" onClick={() => window.open('https://www.tof.services', '_blank', 'noopener,noreferrer')} style={footerLinkRose}>Ga naar website →</button>
              <button type="button" onClick={() => window.open('https://www.tof.services/contact', '_blank', 'noopener,noreferrer')} style={footerLinkDark}>Contact</button>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, paddingTop: 8, borderTop: '1px solid var(--tof-border)' }}>
              <span style={{ fontSize: 13, flexShrink: 0 }}>🔒</span>
              <p style={{ fontSize: 11, color: 'var(--tof-text-muted)', lineHeight: 1.6, margin: 0 }}>Data wordt anoniem gebruikt en niet gedeeld met derden. Naam is optioneel.</p>
            </div>
          </div>
        </div>

      </div>
      {showLock && (
        <div
          onClick={closeTeamLock}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.35)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: 20,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: 420,
              background: '#fff',
              borderRadius: 24,
              border: '1px solid #E5D9CD',
              boxShadow: '0 24px 70px rgba(40, 28, 22, 0.18)',
              padding: isMobile ? '20px 18px' : '24px 24px',
              display: 'grid',
              gap: 14,
            }}
          >
            <div
              style={{
                fontSize: 11,
                textTransform: 'uppercase',
                letterSpacing: 1.8,
                color: 'var(--tof-text-muted)',
                fontWeight: 700,
              }}
            >
              Teamomgeving
            </div>

            <div
              style={{
                fontFamily: "'Playfair Display', serif",
                fontWeight: 500,
                fontSize: isMobile ? 28 : 32,
                lineHeight: 1.05,
                color: 'var(--tof-text)',
              }}
            >
              Voer je toegangscode in
            </div>

            <p
              style={{
                margin: 0,
                color: 'var(--tof-text-soft)',
                fontSize: 14,
                lineHeight: 1.65,
              }}
            >
              De teamomgeving is alleen toegankelijk met een persoonlijke code.
            </p>

            <input
              type="text"
              value={accessCode}
              onChange={(e) => setAccessCode(e.target.value)}
              placeholder="Voer code in"
              autoFocus
              style={{
                width: '100%',
                padding: '14px 16px',
                borderRadius: 14,
                border: '1px solid #E2D8CC',
                fontSize: 15,
                outline: 'none',
                boxSizing: 'border-box',
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !checkingCode) {
                  handleUnlock();
                }
              }}
            />

            {lockError ? (
              <div
                style={{
                  fontSize: 13,
                  color: '#B05252',
                  lineHeight: 1.5,
                }}
              >
                {lockError}
              </div>
            ) : null}

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <PrimaryButton
                onClick={handleUnlock}
                style={{ flex: 1 }}
                disabled={checkingCode}
              >
                {checkingCode ? 'Controleren...' : 'Ga verder'}
              </PrimaryButton>

              <SecondaryButton onClick={closeTeamLock}>
                Sluiten
              </SecondaryButton>
            </div>
          </div>
        </div>
      )}
    </PageShell>
  );
}

function OfferCard({
  eyebrow,
  title,
  text,
  accent = 'var(--tof-text)',
  onClick,
  clickable = false,
  subtle = false,
}) {
  return (
    <div
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
      onClick={clickable ? onClick : undefined}
      onKeyDown={
        clickable
          ? (e) => {
            if (e.key === 'Enter' || e.key === ' ') onClick?.();
          }
          : undefined
      }
      style={{
        background: subtle ? '#FBF8F4' : 'var(--tof-surface)',
        borderRadius: 16,
        padding: 22,
        borderTop: `4px solid ${accent}`,
        border: '1px solid var(--tof-border)',
        display: 'grid',
        gridTemplateRows: 'auto auto 1fr',
        gap: 10,
        boxShadow: subtle ? 'none' : 'var(--tof-shadow)',
        minHeight: 210,
        alignContent: 'start',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        cursor: clickable ? 'pointer' : 'default',
        opacity: subtle ? 0.96 : 1,
      }}
      onMouseEnter={(e) => {
        if (!clickable) return;
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = '0 16px 32px rgba(0,0,0,0.06)';
      }}
      onMouseLeave={(e) => {
        if (!clickable) return;
        e.currentTarget.style.transform = 'translateY(0px)';
        e.currentTarget.style.boxShadow = subtle ? 'none' : 'var(--tof-shadow)';
      }}
    >
      <div
        style={{
          fontSize: 11,
          textTransform: 'uppercase',
          letterSpacing: 1.6,
          color: accent,
          fontWeight: 700,
        }}
      >
        {eyebrow}
      </div>

      <h3
        style={{
          fontFamily: "'Playfair Display', serif",
          fontWeight: 500,
          margin: 0,
          fontSize: 22,
          lineHeight: 1.12,
          color: 'var(--tof-text)',
        }}
      >
        {title}
      </h3>

      <p
        style={{
          margin: 0,
          color: 'var(--tof-text-soft)',
          fontSize: 14,
          lineHeight: 1.7,
          maxWidth: 560,
        }}
      >
        {text}
      </p>
    </div>
  );
}

function GreenTeamCard({ onClick }) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') onClick?.();
      }}
      style={{
        background: 'linear-gradient(135deg, #6E8872 0%, #5F7763 100%)',
        borderRadius: 16,
        padding: 22,
        borderTop: '4px solid #5F7763',
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: 'var(--tof-shadow)',
        display: 'grid',
        gap: 12,
        minHeight: 210,
        alignContent: 'start',
        position: 'relative',
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = '0 16px 32px rgba(0,0,0,0.06)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0px)';
        e.currentTarget.style.boxShadow = 'var(--tof-shadow)';
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: 220,
          height: 220,
          background:
            'radial-gradient(circle at top right, rgba(255,255,255,.10) 0%, transparent 68%)',
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          position: 'relative',
          zIndex: 1,
          fontSize: 11,
          textTransform: 'uppercase',
          letterSpacing: 1.6,
          color: '#EDE5D8',
          fontWeight: 700,
        }}
      >
        Alleen voor organisaties
      </div>

      <h2
        style={{
          position: 'relative',
          zIndex: 1,
          margin: 0,
          fontFamily: "'Playfair Display', serif",
          fontWeight: 500,
          fontSize: 24,
          lineHeight: 1.08,
          color: '#F7F3EE',
          maxWidth: 360,
        }}
      >
        Je team werkt.
        <br />
        Werkt het ook samen?
      </h2>

      <p
        style={{
          position: 'relative',
          zIndex: 1,
          margin: 0,
          fontSize: 15,
          lineHeight: 1.7,
          color: '#F7F3EE',
          maxWidth: 470,
        }}
      >
        Bekijk wat Team Insight, Team Dynamics en strategisch werkplekinzicht voor
        jouw organisatie kunnen betekenen.
      </p>
    </div>
  );
}

function FeatureCard({
  label,
  title,
  children,
  background = 'var(--tof-surface-soft)',
  borderTopColor = 'var(--tof-accent-sage)',
}) {
  return (
    <div
      style={{
        background,
        borderRadius: 16,
        padding: 22,
        borderTop: `4px solid ${borderTopColor}`,
        border: '1px solid var(--tof-border)',
        boxShadow: 'var(--tof-shadow)',
        display: 'grid',
        gap: 12,
        alignContent: 'start',
      }}
    >
      <div
        style={{
          fontSize: 11,
          textTransform: 'uppercase',
          letterSpacing: 1.6,
          color: 'var(--tof-text-muted)',
          fontWeight: 700,
        }}
      >
        {label}
      </div>

      <h2
        style={{
          fontFamily: "'Playfair Display', serif",
          fontWeight: 500,
          fontSize: 24,
          lineHeight: 1.08,
          margin: 0,
          color: 'var(--tof-text)',
        }}
      >
        {title}
      </h2>

      {children}
    </div>
  );
}

const footerLinkRose = {
  background: 'transparent',
  border: 'none',
  color: 'var(--tof-accent-rose)',
  cursor: 'pointer',
  fontWeight: 500,
  padding: 0,
  fontSize: 14,
};

const footerLinkDark = {
  background: 'transparent',
  border: 'none',
  color: 'var(--tof-text)',
  cursor: 'pointer',
  padding: 0,
  fontSize: 14,
};