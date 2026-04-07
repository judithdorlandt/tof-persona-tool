import React from 'react';

export default function Home({ setPage }) {
  const isMobile = window.innerWidth < 900;

  return (
    <div className="fade-up">
      {/* ── HERO ── */}
      <div
        style={{
          padding: isMobile ? '40px 18px 28px' : '72px 44px 52px',
          maxWidth: 880,
          margin: '0 auto',
        }}
      >
        <span className="eyebrow">TOF Persona Tool</span>

        <h1
          style={{
            maxWidth: 760,
            marginBottom: 20,
            fontSize: isMobile ? 54 : undefined,
            lineHeight: isMobile ? 1.02 : undefined,
          }}
        >
          Je werkplek klopt.<br />
          <em>Je mensen nog niet altijd.</em>
        </h1>

        <div className="rule" />

        <p
          style={{
            fontSize: isMobile ? 18 : 15,
            lineHeight: 1.85,
            color: 'var(--text)',
            maxWidth: 620,
            borderLeft: '3px solid var(--rose-lt)',
            paddingLeft: 18,
            marginBottom: 28,
          }}
        >
          Niet omdat ze niet willen — maar omdat de omgeving niet altijd aansluit
          op hoe ze werken. Dit instrument maakt zichtbaar wat iemand nodig heeft
          in gedrag, werkomgeving en ondersteuning.
        </p>

        <div
          style={{
            display: 'flex',
            gap: 12,
            flexWrap: 'wrap',
            marginBottom: 18,
          }}
        >
          <button
            className="btn btn-rose"
            onClick={() => setPage('intro')}
            style={{
              width: isMobile ? '100%' : 'auto',
            }}
          >
            Start de test
          </button>
        </div>

        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            background: 'rgba(176,82,82,.08)',
            border: '1px solid rgba(176,82,82,.18)',
            borderRadius: 999,
            padding: '8px 14px',
            fontSize: 12,
            color: 'var(--muted)',
          }}
        >
          <span>⏱</span>
          <span>Duurt ongeveer 5 minuten</span>
        </div>
      </div>

      {/* ── WHAT IT DOES ── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
          gap: 18,
          padding: isMobile ? '0 18px 36px' : '0 44px 56px',
          maxWidth: 880,
          margin: '0 auto',
        }}
      >
        <InfoCard
          accent="var(--rose)"
          title="Voor jezelf"
          text="Ontdek hoe jij werkt, waar je energie van krijgt en wat jij nodig hebt om goed tot je recht te komen."
        />

        <InfoCard
          accent="var(--green)"
          title="Voor teams"
          text="Zie waar energie lekt, waar het schuurt en welke werkstijlen elkaar versterken of juist tegenwerken."
        />

        <InfoCard
          accent="var(--amber)"
          title="Voor leiding"
          text="Gebruik persona-inzichten om beter te sturen op gedrag, samenwerking en de juiste werkomgeving."
        />
      </div>

      {/* ── PREMIUM STRIP ── */}
      <div
        style={{
          maxWidth: 880,
          margin: '0 auto',
          padding: isMobile ? '0 18px 36px' : '0 44px 56px',
        }}
      >
        <div
          style={{
            background: 'var(--dark)',
            borderRadius: 12,
            padding: isMobile ? '22px 20px' : '28px 32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 24,
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
              width: 200,
              height: 200,
              background:
                'radial-gradient(circle at top right, rgba(176,82,82,.12) 0%, transparent 65%)',
              pointerEvents: 'none',
            }}
          />

          <div style={{ position: 'relative', zIndex: 1, maxWidth: 520 }}>
            <div
              style={{
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: 3,
                textTransform: 'uppercase',
                color: 'var(--rose-lt)',
                marginBottom: 9,
              }}
            >
              Premium
            </div>

            <p
              style={{
                fontFamily: "'Playfair Display', serif",
                fontStyle: 'italic',
                fontSize: isMobile ? 16 : 18,
                color: 'white',
                lineHeight: 1.6,
                marginBottom: 0,
              }}
            >
              Wil je dit vertalen naar team- of organisatie-inzicht?
              Dan bouwen we door op gedrag, dynamiek en werkplekkeuzes.
            </p>
          </div>

          <a
            href="mailto:info@tof.services?subject=TOF Persona Tool — uitgebreide analyse"
            style={{
              flexShrink: 0,
              display: 'inline-block',
              background: 'var(--rose)',
              color: 'white',
              padding: '12px 24px',
              borderRadius: 6,
              fontFamily: "'Inter', sans-serif",
              fontSize: 13,
              fontWeight: 600,
              textDecoration: 'none',
              position: 'relative',
              zIndex: 1,
              whiteSpace: 'nowrap',
              transition: 'background 0.2s',
              width: isMobile ? '100%' : 'auto',
              textAlign: 'center',
              boxSizing: 'border-box',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--rose-dk)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'var(--rose)';
            }}
          >
            Neem contact op →
          </a>
        </div>
      </div>

      {/* ── PRIVACY NOTICE ── */}
      <div
        style={{
          maxWidth: 880,
          margin: '0 auto 56px',
          padding: isMobile ? '0 18px' : '0 44px',
        }}
      >
        <div
          style={{
            background: 'var(--beige)',
            borderRadius: 8,
            padding: '14px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <span style={{ fontSize: 14, flexShrink: 0 }}>🔒</span>
          <p
            style={{
              fontSize: 12,
              color: 'var(--muted)',
              lineHeight: 1.7,
              margin: 0,
            }}
          >
            <strong style={{ color: 'var(--text)' }}>Privacy:</strong>{' '}
            Data wordt anoniem gebruikt voor analyse en wordt niet gedeeld met derden.
            Jouw naam blijft optioneel.
          </p>
        </div>
      </div>
    </div>
  );
}

function InfoCard({ accent, title, text }) {
  return (
    <div
      style={{
        background: 'var(--white)',
        borderRadius: 10,
        padding: 26,
        position: 'relative',
        overflow: 'hidden',
        border: '1px solid var(--border)',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          background: accent,
        }}
      />
      <h3
        style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 20,
          color: 'var(--dark)',
          marginBottom: 10,
          lineHeight: 1.25,
        }}
      >
        {title}
      </h3>
      <p
        style={{
          fontSize: 14,
          color: 'var(--muted)',
          lineHeight: 1.75,
          margin: 0,
        }}
      >
        {text}
      </p>
    </div>
  );
}