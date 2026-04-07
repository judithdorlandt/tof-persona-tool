import React from 'react';

export default function Home({ setPage }) {
  const isMobile = window.innerWidth < 900;

  return (
    <div className="fade-up">
      <div
        style={{
          padding: isMobile ? '40px 18px 28px' : '76px 44px 44px',
          maxWidth: 980,
          margin: '0 auto',
        }}
      >
        <div
          style={{
            color: 'var(--rose)',
            fontSize: 12,
            letterSpacing: 3,
            textTransform: 'uppercase',
            marginBottom: 18,
          }}
        >
          01 — TOF Persona Tool
        </div>

        <h1
          style={{
            maxWidth: 900,
            margin: 0,
            fontSize: isMobile ? 54 : 92,
            lineHeight: isMobile ? 0.98 : 0.92,
            letterSpacing: '-0.03em',
          }}
        >
          Je werkplek klopt.
          <br />
          <em style={{ color: 'var(--rose)' }}>Je mensen nog niet altijd.</em>
        </h1>

        <p
          style={{
            marginTop: 26,
            maxWidth: 700,
            fontSize: isMobile ? 19 : 17,
            lineHeight: 1.65,
            color: 'var(--text)',
          }}
        >
          Niet omdat ze niet willen — maar omdat de omgeving niet altijd aansluit
          op hoe ze werken. Dit instrument maakt zichtbaar wat iemand nodig heeft
          in gedrag, werkomgeving en ondersteuning.
        </p>

        <div
          style={{
            display: 'flex',
            gap: 14,
            flexWrap: 'wrap',
            marginTop: 30,
          }}
        >
          <button
            className="btn btn-rose"
            onClick={() => setPage('quiz')}
            style={{
              width: isMobile ? '100%' : 'auto',
              minWidth: 180,
            }}
          >
            Start de test
          </button>

          <button
            className="btn btn-ghost"
            onClick={() => setPage('intro')}
            style={{
              width: isMobile ? '100%' : 'auto',
              minWidth: 180,
            }}
          >
            Eerst even uitleg
          </button>
        </div>

        <div
          style={{
            marginTop: 18,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            background: 'rgba(176,82,82,.08)',
            border: '1px solid rgba(176,82,82,.16)',
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

      <div
        style={{
          maxWidth: 980,
          margin: '0 auto',
          padding: isMobile ? '0 18px 36px' : '0 44px 44px',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
            gap: 18,
          }}
        >
          <FeatureCard
            accent="var(--rose)"
            title="Voor jezelf"
            text="Ontdek hoe jij werkt, waar je energie van krijgt en wat jij nodig hebt om goed tot je recht te komen."
          />
          <FeatureCard
            accent="var(--green)"
            title="Voor teams"
            text="Zie waar energie lekt, waar het schuurt en welke werkstijlen elkaar versterken of juist tegenwerken."
          />
          <FeatureCard
            accent="var(--amber)"
            title="Voor leiding"
            text="Gebruik persona-inzichten om beter te sturen op gedrag, samenwerking en de juiste werkomgeving."
          />
        </div>
      </div>

      <div
        style={{
          maxWidth: 980,
          margin: '0 auto',
          padding: isMobile ? '0 18px 36px' : '0 44px 52px',
        }}
      >
        <div
          style={{
            background: 'var(--dark)',
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
                color: 'var(--rose-lt)',
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
              background: 'var(--rose)',
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
      </div>

      <div
        style={{
          maxWidth: 980,
          margin: '0 auto 52px',
          padding: isMobile ? '0 18px' : '0 44px',
        }}
      >
        <div
          style={{
            background: 'var(--beige)',
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
              color: 'var(--muted)',
              lineHeight: 1.7,
              margin: 0,
            }}
          >
            <strong style={{ color: 'var(--text)' }}>Privacy:</strong> data wordt
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
        background: 'var(--white)',
        borderRadius: 14,
        padding: 24,
        border: '1px solid var(--border)',
        position: 'relative',
        overflow: 'hidden',
        minHeight: 150,
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 4,
          background: accent,
        }}
      />

      <h3
        style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 20,
          lineHeight: 1.2,
          color: 'var(--dark)',
          marginBottom: 10,
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