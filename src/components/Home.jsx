import React, { useEffect, useState } from 'react';
import tofLogo from '../assets/tof-logo.png';
import { supabase } from '../supabase';
import { grantTeamAccess } from '../utils/access';
import {
  PageShell,
  PrimaryButton,
  SecondaryButton,
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
      .schema('private').from('responses')
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
    <PageShell padding={isMobile ? '20px 16px 28px' : '24px 20px 36px'}>
      <div
        style={{
          animation: 'tofFadeIn 0.5s ease',
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: isMobile ? 24 : 36,
          width: '100%',
        }}
      >
        <div
          style={{
            background: '#ffffff',
            borderRadius: 18,
            borderLeft: '4px solid var(--tof-accent-rose)',
            boxShadow: '0 10px 26px rgba(70, 45, 35, 0.05)',
            padding: isMobile ? '22px 20px 22px 22px' : '32px 36px 32px 36px',
            display: 'grid',
            gap: isMobile ? 18 : 22,
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'minmax(0, 1fr) 300px',
              gap: isMobile ? 14 : 36,
              alignItems: 'start',
            }}
          >
            <div>
              <div
                style={{
                  color: 'var(--tof-accent-rose)',
                  letterSpacing: 2,
                  fontSize: 12,
                  marginBottom: 12,
                  textTransform: 'uppercase',
                  fontWeight: 600,
                }}
              >
                01 — TOF Persona Tool
              </div>

              <h1
                style={{
                  fontSize: isMobile ? 34 : 44,
                  lineHeight: 1.05,
                  fontFamily: 'Playfair Display',
                  fontWeight: 500,
                  margin: 0,
                  color: '#1f1b18',
                }}
              >
                Ontdek hoe jij werkt —{' '}
                <span
                  style={{
                    color: 'var(--tof-accent-rose)',
                    fontStyle: 'italic',
                  }}
                >
                  en waarom dat in teams soms schuurt.
                </span>
              </h1>
            </div>

            <p
              style={{
                margin: 0,
                lineHeight: 1.6,
                color: '#444',
                fontSize: isMobile ? 15 : 16,
              }}
            >
              Start bij jezelf. Krijg inzicht in jouw werkstijl, waar jij energie
              van krijgt en wat jij nodig hebt om goed tot je recht te komen.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <PrimaryButton onClick={() => setPage('intro')}>
              Start de Persona test
            </PrimaryButton>

            <PrimaryButton
              onClick={() => setPage('team')}
              style={{ background: 'var(--tof-accent-sage)' }}
            >
              Voor teams & organisaties
            </PrimaryButton>

            <SecondaryButton onClick={openTeamLock}>
              Teamomgeving
            </SecondaryButton>
          </div>

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              background: 'var(--tof-rose-soft)',
              border: '1px solid rgba(176, 82, 82, 0.12)',
              borderRadius: 999,
              padding: '8px 14px',
              fontSize: 12,
              color: 'var(--tof-text-muted)',
              width: 'fit-content',
            }}
          >
            <span>⏱</span>
            <span>Duurt ongeveer 15 minuten</span>
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, minmax(0, 1fr))',
            gap: isMobile ? 14 : 24,
            alignItems: 'stretch',
          }}
        >
          <OfferCard
            eyebrow="Jouw werkstijl"
            title="Persona Insight"
            text="Voor individueel inzicht in hoe jij werkt, waar jouw energie zit en wat jij nodig hebt om tot je recht te komen."
            accent="var(--tof-accent-sage)"
            onClick={() => setPage('intro')}
            clickable
          />

          <GreenTeamCard onClick={() => setPage('team')} />
        </div>

        <div
          style={{
            marginTop: isMobile ? 4 : 10,
            paddingTop: isMobile ? 18 : 24,
            borderTop: '1px solid var(--tof-border)',
            display: 'grid',
            gap: 14,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              flexWrap: 'wrap',
            }}
          >
            <img
              src={tofLogo}
              alt="TOF logo"
              style={{
                width: 34,
                height: 34,
                objectFit: 'contain',
                flexShrink: 0,
              }}
            />

            <div
              style={{
                fontFamily: '"Playfair Display", serif',
                fontWeight: 300,
                fontSize: '1.125rem',
                letterSpacing: '-0.025em',
                lineHeight: 1.25,
                color: '#1F1F1F',
                display: 'inline-flex',
                alignItems: 'baseline',
                gap: 0,
              }}
            >
              <span
                style={{
                  fontFamily: '"Playfair Display", serif',
                  fontWeight: 300,
                  fontStyle: 'normal',
                  color: '#1F1F1F',
                  marginRight: '0.15em',
                }}
              >
                The Office
              </span>

              <span
                style={{
                  fontFamily: '"Playfair Display", serif',
                  fontWeight: 300,
                  fontStyle: 'italic',
                  color: '#B05252',
                }}
              >
                Factory
              </span>
            </div>
          </div>

          <p
            style={{
              margin: 0,
              maxWidth: 640,
              fontSize: 14,
              lineHeight: 1.7,
              color: 'var(--tof-text-soft)',
            }}
          >
            Wij helpen organisaties om werkplek, gedrag en samenwerking beter op elkaar
            te laten aansluiten. Vanuit inzicht naar concrete beweging.
          </p>

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() =>
                window.open('https://www.tof.services', '_blank', 'noopener,noreferrer')
              }
              style={footerLinkRose}
            >
              Ga naar website →
            </button>

            <button
              type="button"
              onClick={() =>
                window.open(
                  'https://www.tof.services/contact',
                  '_blank',
                  'noopener,noreferrer'
                )
              }
              style={footerLinkDark}
            >
              Contact
            </button>
          </div>

          <p
            style={{
              margin: 0,
              fontSize: 11,
              lineHeight: 1.6,
              color: 'var(--tof-text-muted)',
            }}
          >
            🔒 Data wordt anoniem gebruikt voor analyse en niet gedeeld met derden. Naam is optioneel.
          </p>
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
                fontFamily: 'var(--tof-font-heading)',
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
          fontFamily: 'var(--tof-font-heading)',
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
          fontFamily: 'var(--tof-font-heading)',
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