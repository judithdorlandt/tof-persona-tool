import React, { useEffect, useState } from 'react';

export default function Home({ setPage }) {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 900);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 900);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return (
    <div
      style={{
        minHeight: 'calc(100vh - 88px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: isMobile ? '28px 16px 36px' : '20px 16px',
        background: '#f7f2ec',
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 1100,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          gap: isMobile ? 18 : 22,
        }}
      >
        <div>
          <div
            style={{
              color: '#b85c5c',
              letterSpacing: 2,
              fontSize: 12,
              marginBottom: 12,
              textTransform: 'uppercase',
            }}
          >
            01 — TOF Persona Tool
          </div>

          <h1
            style={{
              fontSize: 'clamp(34px, 4.8vw, 66px)',
              lineHeight: 1.08,
              fontFamily: 'Playfair Display',
              fontWeight: 500,
              margin: 0,
              maxWidth: 860,
              color: '#1f1b18',
            }}
          >
            Je werkplek klopt.
            <br />
            <span style={{ color: '#b85c5c', fontStyle: 'italic' }}>
              Maar past die ook bij je mensen?
            </span>
          </h1>

          <p
            style={{
              marginTop: 16,
              maxWidth: 680,
              lineHeight: 1.62,
              color: '#444',
              fontSize: 16,
            }}
          >
            Deze tool maakt zichtbaar hoe iemand van nature werkt, waar energie ontstaat
            en wat nodig is om goed tot zijn recht te komen. Zo wordt gedrag, werkomgeving
            en samenwerking concreet bespreekbaar — voor jezelf, voor teams en voor leidinggevenden.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
          <ActionButton
            onClick={() => setPage('intro')}
            fullWidth={isMobile}
          >
            Eerst even uitleg
          </ActionButton>

          <ActionButton
            onClick={() => setPage('quiz')}
            primary
            fullWidth={isMobile}
          >
            Start de test
          </ActionButton>
        </div>

        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            background: 'rgba(184,92,92,.08)',
            border: '1px solid rgba(184,92,92,.16)',
            borderRadius: 999,
            padding: '8px 14px',
            fontSize: 12,
            color: '#6c625c',
            width: 'fit-content',
          }}
        >
          <span>⏱</span>
          <span>Duurt ongeveer 5 minuten</span>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
            gap: 16,
          }}
        >
          <FeatureCard
            accent="#b85c5c"
            title="Voor jezelf"
            text="Krijg zicht op jouw natuurlijke werkstijl, energiebronnen en wat jij nodig hebt om sterk te functioneren."
          />

          <FeatureCard
            accent="#6b8f7b"
            title="Voor teams"
            text="Maak zichtbaar waar verschil in werkstijlen elkaar versterkt — of juist spanning en energielek veroorzaakt."
            locked
            lockColor="#6b8f7b"
          />

          <FeatureCard
            accent="#c7a24a"
            title="Voor leiding"
            text="Gebruik persona-inzichten om gerichter te sturen op samenwerking, leiderschap en passende werkomgevingen."
            locked
            lockColor="#c7a24a"
          />
        </div>

        <div
          style={{
            background: '#1f1b18',
            borderRadius: 14,
            padding: isMobile ? '22px 20px' : '28px 30px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 22,
            flexWrap: 'wrap',
            position: 'relative',
            overflow: 'hidden',
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
                'radial-gradient(circle at top right, rgba(176,82,82,.14) 0%, transparent 68%)',
              pointerEvents: 'none',
            }}
          />

          <div style={{ position: 'relative', zIndex: 1, maxWidth: 560 }}>
            <div
              style={{
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: 3,
                textTransform: 'uppercase',
                color: '#d8a8a8',
                marginBottom: 10,
              }}
            >
              Premium
            </div>

            <p
              style={{
                fontFamily: 'Playfair Display',
                fontStyle: 'italic',
                fontSize: isMobile ? 17 : 20,
                lineHeight: 1.6,
                color: '#fff',
                margin: 0,
              }}
            >
              Wil je van individueel inzicht naar team- of organisatie-inzicht? Dan vertalen
              we persona’s naar teamdynamiek, leiderschap en werkplekkeuzes die echt passen.
            </p>
          </div>

          <a
            href="mailto:info@tof.services?subject=TOF Persona Tool — uitgebreide analyse"
            style={{
              flexShrink: 0,
              display: 'inline-block',
              background: '#b85c5c',
              color: '#fff',
              padding: '12px 24px',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 600,
              textDecoration: 'none',
              position: 'relative',
              zIndex: 1,
              whiteSpace: 'nowrap',
              width: isMobile ? '100%' : 'auto',
              textAlign: 'center',
              boxSizing: 'border-box',
            }}
          >
            Neem contact op →
          </a>
        </div>

        <div
          style={{
            background: '#efe5db',
            borderRadius: 10,
            padding: '14px 18px',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <span style={{ fontSize: 14, flexShrink: 0 }}>🔒</span>
          <p
            style={{
              fontSize: 12,
              color: '#6b625d',
              lineHeight: 1.7,
              margin: 0,
            }}
          >
            <strong style={{ color: '#2e2a27' }}>Privacy:</strong> data wordt
            anoniem gebruikt voor analyse en niet gedeeld met derden. Jouw naam
            blijft optioneel.
          </p>
        </div>
      </div>
    </div>
  );
}

function ActionButton({ children, onClick, primary = false, fullWidth = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        background: primary ? '#b85c5c' : 'transparent',
        color: primary ? 'white' : '#1a1a1a',
        border: primary ? 'none' : '1px solid #1a1a1a',
        padding: '14px 22px',
        borderRadius: 10,
        cursor: 'pointer',
        fontSize: 15,
        fontWeight: 500,
        minWidth: fullWidth ? '100%' : 180,
      }}
    >
      {children}
    </button>
  );
}

function FeatureCard({ accent, title, text, locked = false, lockColor = '#999' }) {
  return (
    <div
      style={{
        background: 'white',
        borderRadius: 14,
        padding: 20,
        borderTop: `4px solid ${accent}`,
        border: '1px solid #e7ddd4',
        minHeight: 140,
        position: 'relative',
      }}
    >
      {locked && (
        <div
          style={{
            position: 'absolute',
            top: 10,
            right: 10,
            background: lockColor,
            color: 'white',
            fontSize: 10,
            padding: '3px 6px',
            borderRadius: 6,
          }}
        >
          🔒
        </div>
      )}

      <h3
        style={{
          fontFamily: 'Playfair Display',
          marginTop: 0,
          fontSize: 20,
          color: '#1f1b18',
          marginBottom: 10,
        }}
      >
        {title}
      </h3>

      <p
        style={{
          color: '#555',
          marginBottom: 0,
          fontSize: 14,
          lineHeight: 1.7,
        }}
      >
        {text}
      </p>
    </div>
  );
}