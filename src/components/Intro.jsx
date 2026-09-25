/**
 * Intro.jsx — Pagina 02: Voor je begint
 * Identiteit: sage groen — kalm, voorbereidend, menselijk
 *
 * Gemigreerd naar CSS Modules (Intro.module.css). Inline style alleen voor
 * dynamische waarden (kleur-prop op InfoCard).
 */
import React from 'react';
import styles from './Intro.module.css';
import { useCopy } from '../i18n/LanguageContext';

// Alleen de kleuren blijven hier; de teksten komen uit de copy-laag.
const CARD_COLORS = [
    { accent: '#b85c5c', soft: '#FDF6F6' },
    { accent: '#6b8f7b', soft: '#EDF4EF' },
    { accent: '#c7a24a', soft: '#FBF5E9' },
];

export default function Intro({ setPage }) {
    const { intro: t } = useCopy();

    return (
        <div className={`fade-up ${styles.page}`}>
            <div className={styles.stack}>

                {/* ── HERO — sage identiteit ─────────────────────────── */}
                <div className={styles.hero}>
                    <div className={styles.heroAccent} />
                    <div className={styles.heroInner}>
                        <div className={styles.heroEyebrow}>{t.eyebrow}</div>

                        <div className={styles.heroHeading}>
                            <h1 className={styles.heroTitle}>
                                {t.titleLead}{' '}
                                <em className={styles.heroTitleAccent}>{t.titleAccent}</em>
                            </h1>
                            <p className={styles.heroSubDesktop}>{t.subDesktop}</p>
                        </div>
                        <p className={styles.heroSubMobile}>{t.subMobile}</p>
                    </div>
                </div>

                {/* ── DRIE INFO-KAARTEN ──────────────────────────────── */}
                <div className={styles.cards}>
                    {t.cards.map((card, i) => (
                        <InfoCard
                            key={card.title}
                            accent={CARD_COLORS[i].accent}
                            soft={CARD_COLORS[i].soft}
                            title={card.title}
                            text={card.text}
                        />
                    ))}
                </div>

                {/* ── ACTIE-BALK ─────────────────────────────────────── */}
                <div className={styles.actionBar}>
                    <p className={styles.actionText}>
                        <strong>{t.actionStrong}</strong> {t.actionText}
                    </p>
                    <div className={styles.actionButtons}>
                        <button
                            type="button"
                            onClick={() => setPage('quiz')}
                            className={styles.btnPrimary}
                        >
                            {t.btnStart}
                        </button>
                        <button
                            type="button"
                            onClick={() => setPage('home')}
                            className={styles.btnSecondary}
                        >
                            {t.btnBack}
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}

function InfoCard({ accent, soft, title, text }) {
    // Dynamische kleuren (accent/soft) blijven inline omdat ze per-instance
    // anders zijn. De rest van de styling komt uit de module.
    return (
        <div
            className={styles.card}
            style={{
                background: soft,
                borderTop: `4px solid ${accent}`,
                border: `1px solid ${accent}22`,
            }}
        >
            <h3 className={styles.cardTitle}>{title}</h3>
            <p className={styles.cardText}>{text}</p>
        </div>
    );
}
