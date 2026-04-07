import React from 'react';

export default function Home({ setPage }) {
  const isMobile = window.innerWidth < 900;

  return (
    <div
      className="fade-up"
      style={{
        minHeight: 'calc(100vh - 88px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: isMobile ? '24px 16px 36px' : '20px 16px',
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
          gap: isMobile ? 18 : 24,
        }}
      >
        {/* HEADER */}
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
              fontSize: isMobile ? 'clamp(42px, 10vw, 58px)' : 'clamp(56px, 7vw, 92px)',
              lineHeight: isMobile ? 1.02 : 0.96,
              fontFamily: 'Playfair Display',
              fontWeight: 500,
              letterSpacing: '-0.03em',
              margin: 0,
              maxWidth: 900,
            }}
          >
            Je werkplek klopt.
            <br />
            <span style={{ color: '#b85c5c', fontStyle: 'italic' }}>
              Je mensen nog niet altijd.
            </span>
          </h1>

          <p
            style={{
              marginTop: 18,
              maxWidth: 700,
              lineHeight: 1.6,
              color: '#444',
              fontSize: isMobile ? 17 : 17,
            }}
          >
            Niet omdat ze niet willen — maar omdat de omgeving niet altijd aansluit
            op hoe ze werken. Dit instrument maakt zichtbaar wat iemand nodig heeft
            in gedrag, werkomgeving en ondersteuning.
          </p>
        </div>

        {/* CTA */}
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
          <button
            onClick={() => setPage('quiz')}
            style={{
              background: '#b85c5c',
              color: 'white',
              padding: '14px 22px',
              borderRadius: 10,
              border: 'none',
              cursor: 'pointer',
              fontSize: 15,
              fontWeight: 500,
              minWidth: isMobile ? '100%' : 180,
            }}
          >
            Start de test
          </button>

          <button
            onClick={() => setPage('intro')}
            style={{
              background: 'transparent',
              border: '1px solid #1a1a1a',
              padding: '14px 22px',
              borderRadius: 10,
              cursor: 'pointer',
              fontSize: 15,
              fontWeight: 500,
              minWidth: isMobile ? '100%' : 180,
            }}
          >
            Eerst even uitleg
          </button>
        </div>

        {/* TIJD BADGE */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            background: 'rgba(176,82,82,.08)',
            border: '1px solid rgba(176,82,82,.16)',
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

        {/* CARDS */}
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
            text="Ontdek hoe jij werkt, waar je energie van krijgt en wat jij nodig hebt om goed tot je recht te komen."
          />

          <FeatureCard
            accent="#6b8f7b"
            title="Voor teams"
            text="Zie waar energie lekt, waar het schuurt en welke werkstijlen elkaar versterken of juist tegenwerken."
          />

          <FeatureCard
            accent="#c7a24a"
            title="Voor leiding"
            text="Gebruik persona-inzichten om beter te sturen op gedrag, samenwerking en de juiste werkomgeving."
          />
        </div>

        {/* PREMIUM */}
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
                fontFamily: "'Playfair Display', serif",
                fontStyle: 'italic',
                fontSize: isMobile ? 17 : 20,
                lineHeight: 1.6,
                color: '#fff',
                margin: 0,
              }}
            >
              Wil je dit vertalen naar team- of organisatie-inzicht? Dan bouwen
              we door op gedrag, dynamiek en werkplekkeuzes.
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

        {/* FOOTER / PRIVACY */}
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

function FeatureCard({ accent, title, text }) {
  return (
    <div
      style={{
        background: 'white',
        borderRadius: 14,
        padding: 20,
        borderTop: `4px solid ${accent}`,
        border: '1px solid #e7ddd4',
        minHeight: 140,
      }}
    >
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