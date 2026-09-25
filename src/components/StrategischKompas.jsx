/**
 * StrategischKompas.jsx — Module 3 in de Persona Tool.
 *
 * Premium scrollbare pagina die uitlegt wat het Strategisch Kompas is,
 * welke 8 trends we volgen, de 5-staps methodiek, de deliverable en
 * de plek van Module 3 in het bredere TOF-aanbod.
 *
 * Design-keuzes:
 * - Eigen scoped styles (sk-*) zodat we het premium-gevoel van een echte
 *   landing page hebben zonder het bestaande tool-design te raken.
 * - Uses TOF design tokens uit index.css (--tof-*) voor kleur-consistentie.
 * - Reveal-on-scroll via IntersectionObserver — subtiel, niet druk.
 */
import React, { useEffect, useRef } from 'react';
import { useCopy } from '../i18n/LanguageContext';

// Welke module-kaart als "huidige" wordt uitgelicht (index in copy.stack).
const CURRENT_STACK_INDEX = 2;

export default function StrategischKompas({ setPage }) {
    const { strategicCompass: t } = useCopy();
    const rootRef = useRef(null);

    // Reveal-on-scroll: animeer secties in als ze in beeld komen.
    // Gebruikt IntersectionObserver — geen jQuery, geen animatie-libraries.
    useEffect(() => {
        const root = rootRef.current;
        if (!root) return;
        const io = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('sk-visible');
                        io.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.12 }
        );
        root.querySelectorAll('[data-sk-reveal]').forEach((el) => io.observe(el));
        return () => io.disconnect();
    }, []);

    const goPlanGesprek = () => {
        window.open('https://zeeg.me/judith-tof/30min', '_blank', 'noopener');
    };

    return (
        <div className="sk-root" ref={rootRef}>
            <style>{`
              .sk-root {
                background: var(--tof-bg);
                color: var(--tof-text);
                font-family: var(--tof-font-body);
                line-height: 1.55;
                -webkit-font-smoothing: antialiased;
              }
              .sk-container { max-width: 1100px; margin: 0 auto; padding: 0 32px; }
              .sk-section { padding: 96px 0; border-bottom: 1px solid rgba(31,31,31,0.06); }
              .sk-eye {
                font-size: 11px; font-weight: 700; letter-spacing: 1.6px;
                color: var(--tof-accent-rose); text-transform: uppercase;
                margin-bottom: 24px;
              }
              .sk-title {
                font-family: var(--tof-font-heading);
                font-size: clamp(32px, 4vw, 48px); font-weight: 400; line-height: 1.1;
                letter-spacing: -0.8px; margin: 0 0 24px;
                color: var(--tof-text);
              }
              .sk-title em { font-style: italic; color: var(--tof-accent-rose); }
              .sk-lead {
                font-size: 18px; line-height: 1.65; color: var(--tof-text-soft);
                max-width: 720px; margin: 0 0 40px; font-weight: 300;
              }

              /* Hero */
              .sk-hero { padding: 100px 0 100px; }
              .sk-hero-title {
                font-family: var(--tof-font-heading);
                font-size: clamp(28px, 2.8vw, 40px); font-weight: 400;
                line-height: 1.15; letter-spacing: -0.6px; margin: 0 0 32px;
                max-width: none;
                color: var(--tof-text);
              }
              .sk-hero-title em { font-style: italic; color: var(--tof-accent-rose); }
              .sk-hero-sub {
                font-size: clamp(17px, 1.4vw, 20px); line-height: 1.55; color: var(--tof-text-soft);
                max-width: 720px; margin: 0 0 48px; font-weight: 300;
              }
              .sk-btn {
                display: inline-block; padding: 16px 36px;
                background: var(--tof-accent-rose); color: #fff;
                text-decoration: none; font-size: 13px; font-weight: 600;
                letter-spacing: 0.6px; border-radius: 999px;
                cursor: pointer; border: none; font-family: inherit;
                transition: background 0.3s var(--tof-ease), transform 0.3s var(--tof-ease);
              }
              .sk-btn:hover { background: #963F3F; transform: translateY(-1px); }
              .sk-btn.is-ghost {
                background: transparent; color: var(--tof-text);
                border: 1px solid var(--tof-border);
              }
              .sk-btn.is-ghost:hover { border-color: var(--tof-accent-rose); color: var(--tof-accent-rose); background: transparent; transform: none; }
              .sk-hero-meta {
                margin-top: 80px; display: flex; align-items: center; gap: 24px;
                font-size: 12px; color: var(--tof-text-muted); letter-spacing: 0.4px;
              }
              .sk-hero-meta::before, .sk-hero-meta::after {
                content: ''; flex: 1; height: 1px; background: rgba(31,31,31,0.1);
              }

              /* Comparison table */
              .sk-compare {
                display: grid; grid-template-columns: 200px 1fr 1fr 1fr;
                gap: 0; border-top: 1px solid var(--tof-border); margin-top: 32px; font-size: 14px;
              }
              .sk-compare > div { padding: 20px 16px; border-bottom: 1px solid var(--tof-border); }
              .sk-compare-label {
                font-weight: 600; color: var(--tof-text-muted);
                font-size: 11px; letter-spacing: 0.6px; text-transform: uppercase;
              }
              .sk-compare-head {
                font-family: var(--tof-font-heading);
                font-size: 16px; font-weight: 600;
                background: rgba(176,82,82,0.04);
                color: var(--tof-text);
              }
              .sk-compare-head.is-active { background: var(--tof-accent-rose); color: #fff; }
              .sk-compare-cell { color: var(--tof-text-soft); }
              .sk-compare-cell.is-active {
                color: var(--tof-text); background: rgba(176,82,82,0.04);
              }

              /* Trends grid */
              .sk-trends { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin-top: 16px; }
              .sk-trend-card {
                background: var(--tof-surface); border: 1px solid var(--tof-border);
                border-left: 3px solid var(--tof-accent-rose);
                border-radius: 8px; padding: 28px 28px 24px;
                transition: transform 0.4s var(--tof-ease), box-shadow 0.4s var(--tof-ease);
              }
              .sk-trend-card:hover {
                transform: translateY(-2px);
                box-shadow: var(--tof-shadow);
              }
              .sk-trend-num {
                font-family: var(--tof-font-heading);
                font-size: 28px; color: var(--tof-accent-rose);
                line-height: 1; margin-bottom: 12px; font-style: italic;
              }
              .sk-trend-title {
                font-family: var(--tof-font-heading);
                font-size: 20px; font-weight: 500; margin: 0 0 12px; line-height: 1.2;
                color: var(--tof-text);
              }
              .sk-trend-body { font-size: 14px; line-height: 1.6; color: var(--tof-text-soft); margin: 0; }

              /* Steps */
              .sk-steps { margin-top: 32px; border-top: 1px solid var(--tof-border); }
              .sk-step {
                display: grid; grid-template-columns: 80px 220px 1fr; gap: 32px;
                padding: 36px 0; border-bottom: 1px solid var(--tof-border); align-items: baseline;
              }
              .sk-step-num {
                font-family: var(--tof-font-heading);
                font-size: 36px; color: var(--tof-accent-rose);
                font-style: italic; line-height: 1;
              }
              .sk-step-name {
                font-family: var(--tof-font-heading);
                font-size: 22px; font-weight: 500; line-height: 1.2;
                color: var(--tof-text);
              }
              .sk-step-meta {
                font-size: 11px; font-weight: 600; letter-spacing: 0.8px;
                color: var(--tof-text-muted); text-transform: uppercase; margin-top: 6px;
              }
              .sk-step-body { font-size: 16px; line-height: 1.65; color: var(--tof-text-soft); }

              /* Deliverable */
              .sk-deliverable { display: grid; grid-template-columns: 1fr 1fr; gap: 64px; align-items: center; margin-top: 32px; }
              .sk-deliverable-visual {
                background: var(--tof-surface-soft); border: 1px solid var(--tof-border);
                border-radius: 8px; padding: 48px 36px;
                position: relative; overflow: hidden;
              }
              .sk-deliverable-visual::before {
                content: ''; position: absolute; top: 0; left: 0;
                width: 4px; height: 100%; background: var(--tof-accent-rose);
              }
              .sk-chapter {
                display: flex; justify-content: space-between;
                padding: 10px 0; border-bottom: 1px solid rgba(31,31,31,0.08);
              }
              .sk-chapter:last-child { border-bottom: none; }
              .sk-chapter-name {
                font-family: var(--tof-font-heading);
                font-size: 14px; font-weight: 500; color: var(--tof-text);
              }
              .sk-chapter-num { color: var(--tof-text-muted); font-size: 11px; letter-spacing: 0.4px; }
              .sk-deliver-list { list-style: none; padding: 0; margin: 0; }
              .sk-deliver-list li {
                position: relative; padding: 12px 0 12px 32px;
                font-size: 15px; color: var(--tof-text-soft);
                border-bottom: 1px solid rgba(31,31,31,0.06);
              }
              .sk-deliver-list li::before {
                content: ''; position: absolute; left: 0; top: 18px;
                width: 16px; height: 1px; background: var(--tof-accent-rose);
              }
              .sk-deliver-list li strong { color: var(--tof-text); font-weight: 600; }

              /* Stack */
              .sk-stack { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; margin-top: 32px; }
              .sk-stack-card {
                background: var(--tof-surface); border: 1px solid var(--tof-border);
                border-radius: 8px; padding: 36px 28px;
              }
              .sk-stack-card.is-current {
                border: 2px solid var(--tof-accent-rose);
                background: linear-gradient(135deg, var(--tof-surface) 0%, #FFF5F0 100%);
              }
              .sk-stack-num {
                font-family: var(--tof-font-heading);
                font-size: 13px; font-weight: 600; letter-spacing: 1px;
                color: var(--tof-text-muted); text-transform: uppercase; margin-bottom: 16px;
              }
              .sk-stack-card.is-current .sk-stack-num { color: var(--tof-accent-rose); }
              .sk-stack-title {
                font-family: var(--tof-font-heading);
                font-size: 22px; font-weight: 500; margin: 0 0 12px;
                color: var(--tof-text);
              }
              .sk-stack-body { font-size: 14px; line-height: 1.6; color: var(--tof-text-soft); margin: 0 0 20px; }
              .sk-stack-price {
                font-family: var(--tof-font-heading);
                font-size: 18px; font-style: italic; color: var(--tof-accent-rose);
              }

              /* CTA */
              .sk-cta-section {
                text-align: center; padding: 120px 0; background: var(--tof-surface-soft);
                border-top: 1px solid var(--tof-border);
              }
              .sk-cta-title {
                font-family: var(--tof-font-heading);
                font-size: clamp(32px, 4vw, 48px); font-weight: 400;
                line-height: 1.15; margin: 0 0 24px;
                color: var(--tof-text);
              }
              .sk-cta-title em { font-style: italic; color: var(--tof-accent-rose); }
              .sk-cta-sub {
                font-size: 18px; color: var(--tof-text-soft); max-width: 560px;
                margin: 0 auto 40px; font-weight: 300;
              }
              .sk-cta-actions { display: flex; gap: 16px; justify-content: center; flex-wrap: wrap; }

              /* Back link */
              .sk-back {
                position: relative; padding: 24px 0;
                font-size: 12px; font-weight: 600; letter-spacing: 0.6px;
                color: var(--tof-text-muted); cursor: pointer; background: none; border: none;
                font-family: inherit;
                transition: color 0.3s var(--tof-ease);
              }
              .sk-back:hover { color: var(--tof-accent-rose); }

              /* Reveal */
              [data-sk-reveal] { opacity: 0; transform: translateY(20px); transition: opacity 0.8s, transform 0.8s; }
              [data-sk-reveal].sk-visible { opacity: 1; transform: none; }

              /* Mobile */
              @media (max-width: 768px) {
                .sk-container { padding: 0 20px; }
                .sk-section { padding: 64px 0; }
                .sk-compare { grid-template-columns: 1fr 1fr; font-size: 13px; }
                .sk-compare-label { display: none; }
                .sk-compare > div { padding: 14px 10px; }
                .sk-trends { grid-template-columns: 1fr; }
                .sk-step { grid-template-columns: 1fr; gap: 8px; padding: 24px 0; }
                .sk-step-num { font-size: 24px; }
                .sk-deliverable { grid-template-columns: 1fr; gap: 32px; }
                .sk-stack { grid-template-columns: 1fr; }
              }
            `}</style>

            {/* Back to /team */}
            <div className="sk-container">
                <button type="button" className="sk-back" onClick={() => setPage('team')}>
                    {t.back}
                </button>
            </div>

            {/* Hero */}
            <header className="sk-hero">
                <div className="sk-container">
                    <div className="sk-eye">{t.hero.eyebrow}</div>
                    <h1 className="sk-hero-title">
                        {t.hero.titleLead}<em>{t.hero.titleAccent}</em>{t.hero.titleTail}
                    </h1>
                    <p className="sk-hero-sub">{t.hero.sub}</p>
                    <a href="#sk-methodiek" className="sk-btn">{t.hero.cta}</a>
                    <div className="sk-hero-meta">{t.hero.meta}</div>
                </div>
            </header>

            {/* Why */}
            <section className="sk-section" data-sk-reveal>
                <div className="sk-container">
                    <div className="sk-eye">{t.why.eyebrow}</div>
                    <h2 className="sk-title">
                        {t.why.titleLead}<em>{t.why.titleAccent}</em>{t.why.titleTail}
                    </h2>
                    <p className="sk-lead">{t.why.lead}</p>
                    <div className="sk-compare">
                        <div className="sk-compare-label"></div>
                        {t.why.compareHeads.map((head, i) => (
                            <div
                                key={head}
                                className={`sk-compare-head${i === 2 ? ' is-active' : ''}`}
                            >
                                {head}
                            </div>
                        ))}

                        {t.why.compareRows.map((row) => (
                            <React.Fragment key={row.label}>
                                <div className="sk-compare-label">{row.label}</div>
                                {row.cells.map((cell, i) => (
                                    <div
                                        key={`${row.label}-${i}`}
                                        className={`sk-compare-cell${i === 2 ? ' is-active' : ''}`}
                                    >
                                        {cell}
                                    </div>
                                ))}
                            </React.Fragment>
                        ))}
                    </div>
                </div>
            </section>

            {/* 8 Trends */}
            <section className="sk-section" data-sk-reveal>
                <div className="sk-container">
                    <div className="sk-eye">{t.trendsSection.eyebrow}</div>
                    <h2 className="sk-title">
                        {t.trendsSection.titleLead}
                        <em>{t.trendsSection.titleAccent}</em>
                        {t.trendsSection.titleTail}
                    </h2>
                    <p className="sk-lead">{t.trendsSection.lead}</p>
                    <div className="sk-trends">
                        {t.trends.map((trend) => (
                            <div className="sk-trend-card" key={trend.num}>
                                <div className="sk-trend-num">{trend.num}</div>
                                <h3 className="sk-trend-title">{trend.title}</h3>
                                <p className="sk-trend-body">{trend.body}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Methodiek */}
            <section className="sk-section" id="sk-methodiek" data-sk-reveal>
                <div className="sk-container">
                    <div className="sk-eye">{t.methodSection.eyebrow}</div>
                    <h2 className="sk-title">
                        {t.methodSection.titleLead}
                        <em>{t.methodSection.titleAccent}</em>
                        {t.methodSection.titleTail}
                    </h2>
                    <p className="sk-lead">{t.methodSection.lead}</p>
                    <div className="sk-steps">
                        {t.steps.map((s) => (
                            <div className="sk-step" key={s.num}>
                                <div className="sk-step-num">{s.num}</div>
                                <div>
                                    <div className="sk-step-name">{s.name}</div>
                                    <div className="sk-step-meta">{s.meta}</div>
                                </div>
                                <div className="sk-step-body">{s.body}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Deliverable */}
            <section className="sk-section" data-sk-reveal>
                <div className="sk-container">
                    <div className="sk-eye">{t.deliverableSection.eyebrow}</div>
                    <h2 className="sk-title">
                        {t.deliverableSection.titleLead}
                        <em>{t.deliverableSection.titleAccent}</em>
                        {t.deliverableSection.titleTail}
                    </h2>
                    <div className="sk-deliverable">
                        <div className="sk-deliverable-visual">
                            {t.chapters.map((c, i) => (
                                <div className="sk-chapter" key={i}>
                                    <span className="sk-chapter-name">{c}</span>
                                    <span className="sk-chapter-num">{String(i + 1).padStart(2, '0')}</span>
                                </div>
                            ))}
                        </div>
                        <ul className="sk-deliver-list">
                            {t.deliverables.map((d, i) => (
                                <li key={i}>
                                    <strong>{d.strong}</strong> — {d.text}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </section>

            {/* Module stack */}
            <section className="sk-section" data-sk-reveal>
                <div className="sk-container">
                    <div className="sk-eye">{t.stackSection.eyebrow}</div>
                    <h2 className="sk-title">
                        {t.stackSection.titleLead}
                        <em>{t.stackSection.titleAccent}</em>
                        {t.stackSection.titleTail}
                    </h2>
                    <p className="sk-lead">{t.stackSection.lead}</p>
                    <div className="sk-stack">
                        {t.stack.map((card, i) => (
                            <div
                                key={card.num}
                                className={`sk-stack-card${i === CURRENT_STACK_INDEX ? ' is-current' : ''}`}
                            >
                                <div className="sk-stack-num">{card.num}</div>
                                <h3 className="sk-stack-title">{card.title}</h3>
                                <p className="sk-stack-body">{card.body}</p>
                                <div className="sk-stack-price">{card.price}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="sk-cta-section" data-sk-reveal>
                <div className="sk-container">
                    <h2 className="sk-cta-title">
                        {t.cta.titleLead}<em>{t.cta.titleAccent}</em>{t.cta.titleTail}
                    </h2>
                    <p className="sk-cta-sub">{t.cta.sub}</p>
                    <div className="sk-cta-actions">
                        <button type="button" className="sk-btn" onClick={goPlanGesprek}>
                            {t.cta.primary}
                        </button>
                        <button type="button" className="sk-btn is-ghost" onClick={() => setPage('team')}>
                            {t.cta.secondary}
                        </button>
                    </div>
                </div>
            </section>
        </div>
    );
}
