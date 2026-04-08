import React from 'react';
import { ARCHETYPES } from '../lib/data';

export default function Results({ profile, scores, onRedo }) {
  const srt       = scores.map((s, i) => ({ s, i })).sort((a, b) => b.s - a.s);
  const top       = srt.slice(0, 3).map(x => ARCHETYPES[x.i]);
  const tot       = scores.reduce((a, b) => a + b, 0);
  const primary   = top[0];
  const secondary = top[1];
  const tertiary  = top[2];

  const S = {
    eyebrow: (color = 'var(--rose)') => ({
      fontSize: 10, fontWeight: 600, letterSpacing: 2.5,
      textTransform: 'uppercase', color,
      display: 'block', marginBottom: 12,
    }),
    card: (extra = {}) => ({
      background: 'var(--white)', borderRadius: 10,
      border: '1px solid var(--border)', marginBottom: 14, ...extra,
    }),
    serif: (size, extra = {}) => ({
      fontFamily: "'Playfair Display', serif",
      fontWeight: 400, fontSize: size, ...extra,
    }),
  };

  return (
    <div className="fade-up">
      <div style={{ maxWidth: 660, margin: '0 auto', padding: '40px 44px 68px' }}>

        <span style={S.eyebrow()}>Jouw profiel</span>

        {/* Context badge */}
        {(profile.org || (profile.team && profile.team !== 'Onbekend')) && (
          <div style={{
            background: 'var(--green-xlt)', border: '1px solid var(--green-lt)',
            borderRadius: 7, padding: '10px 15px', marginBottom: 16,
            display: 'flex', gap: 9, alignItems: 'flex-start',
          }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green)', flexShrink: 0, marginTop: 5 }} />
            <div>
              <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--green-dk)', marginBottom: 3 }}>
                Anoniem opgeslagen voor teamanalyse
              </div>
              <div style={{ fontSize: 12, color: 'var(--text)' }}>
                {[
                  profile.org  && <strong key="o">{profile.org}</strong>,
                  profile.dept,
                  profile.team && <React.Fragment key="t">Team: <strong>{profile.team}</strong></React.Fragment>,
                ]
                  .filter(Boolean)
                  .reduce((acc, el, i) =>
                    i === 0 ? [el] : [...acc, <span key={`s${i}`}> · </span>, el], []
                  )}
              </div>
            </div>
          </div>
        )}

        {/* ── 1. PRIMARY PERSONA ── */}
        <div style={S.card({ textAlign: 'center', padding: '48px 40px' })}>
          <span style={S.eyebrow()}>Primaire persona</span>
          <div style={S.serif('clamp(44px, 7vw, 72px)', { color: 'var(--dark)', lineHeight: 1, marginBottom: 12 })}>
            {primary.name}
          </div>
          <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: 2.5, textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 18 }}>
            {primary.kw.join(' · ')}
          </div>
          <p style={S.serif(16, { fontStyle: 'italic', color: 'var(--text)', maxWidth: 400, margin: '0 auto', lineHeight: 1.65 })}>
            {primary.short}
          </p>
        </div>

        {/* ── 2. SECONDARY + TERTIARY ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 13, marginBottom: 14 }}>
          {[
            { a: secondary, label: 'Secundaire persona' },
            { a: tertiary,  label: 'Tertiaire persona'  },
          ].map(({ a, label }) => (
            <div key={a.id} style={S.card({ padding: 22, marginBottom: 0 })}>
              <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 8 }}>
                {label}
              </div>
              <div style={S.serif(22, { color: 'var(--dark)', marginBottom: 6 })}>{a.name}</div>
              <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--rose)' }}>
                {a.kw.join(' · ')}
              </div>
            </div>
          ))}
        </div>

        {/* ── 3. DISTRIBUTION ── */}
        <div style={S.card({ padding: '20px 22px' })}>
          <span style={S.eyebrow()}>Verdeling over alle persona's</span>
          {ARCHETYPES.map((a, i) => {
            const p    = tot ? Math.round((scores[i] / tot) * 100) : 0;
            const rank = i === srt[0].i ? 'p' : i === srt[1].i ? 's' : i === srt[2].i ? 't' : 'r';
            return (
              <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 9 }}>
                <div style={{ width: 96, fontSize: 11, color: 'var(--muted)', flexShrink: 0 }}>{a.name}</div>
                <div style={{ flex: 1, height: 4, background: 'var(--beige)', borderRadius: 2, overflow: 'hidden' }}>
                  <div
                    className={`dist-fill ${rank}`}
                    style={{ width: `${p}%`, height: '100%', borderRadius: 2, transition: 'width 0.9s ease' }}
                  />
                </div>
                <div style={{ width: 28, fontSize: 10, color: 'var(--muted)', textAlign: 'right' }}>{p}%</div>
              </div>
            );
          })}
        </div>

        {/* ── 4. ZO WERK JIJ HET LIEFST ── */}
        <div style={S.card({ padding: '20px 22px' })}>
          <span style={S.eyebrow()}>Zo werk jij het liefst</span>
          <ul className="insight-list">
            {top.map(a => <li key={a.id}>{a.energy_from}</li>)}
          </ul>
        </div>

        {/* ── 5. WAT JOU ENERGIE KOST ── */}
        <div style={S.card({ padding: '20px 22px' })}>
          <span style={S.eyebrow()}>Wat jou energie kost</span>
          <ul className="insight-list">
            {top.map(a => <li key={a.id}>{a.frustration}</li>)}
          </ul>
        </div>

        {/* ── TEASER ── */}
        <div style={{
          background: 'var(--dark)', borderRadius: 10,
          padding: '24px 26px', marginBottom: 20,
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', top: 0, right: 0, width: 160, height: 160,
            background: 'radial-gradient(circle at top right, rgba(176,82,82,.13) 0%, transparent 65%)',
            pointerEvents: 'none',
          }} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <p style={S.serif(16, { fontStyle: 'italic', color: 'white', lineHeight: 1.65, marginBottom: 16 })}>
              Wil je deze inzichten vertalen naar team- of organisatieanalyse?
              Vraag de uitgebreide versie aan.
            </p>
            <a
              href="mailto:info@tof.services?subject=TOF Persona Tool — uitgebreide analyse"
              style={{
                display: 'inline-block',
                background: 'var(--rose)', color: 'white',
                padding: '10px 20px', borderRadius: 6,
                fontFamily: "'Inter', sans-serif",
                fontSize: 12, fontWeight: 600,
                textDecoration: 'none',
                transition: 'background 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--rose-dk)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'var(--rose)'; }}
            >
              Neem contact op →
            </a>
          </div>
        </div>

        {/* Redo */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
          <button className="btn btn-ghost" onClick={onRedo}>
            Opnieuw doen
          </button>
        </div>

        {/* Privacy footnote */}
        <p style={{ fontSize: 11, color: 'var(--muted)', textAlign: 'center', lineHeight: 1.7 }}>
          🔒 Jouw antwoorden zijn anoniem opgeslagen en worden alleen gebruikt voor teamanalyse.
          Ze worden niet gedeeld met derden.
        </p>

      </div>
    </div>
  );
}
