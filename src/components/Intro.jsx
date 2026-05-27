/**
 * Intro.jsx — Pagina 02: Voor je begint
 * Identiteit: sage groen — kalm, voorbereidend, menselijk
 *
 * Gemigreerd naar CSS Modules (Intro.module.css). Inline style alleen voor
 * dynamische waarden (kleur-prop op InfoCard).
 */
import React from 'react';
import styles from './Intro.module.css';

export default function Intro({ setPage }) {
    return (
        <div className={`fade-up ${styles.page}`}>
            <div className={styles.stack}>

                {/* ── HERO — sage identiteit ─────────────────────────── */}
                <div className={styles.hero}>
                    <div className={styles.heroAccent} />
                    <div className={styles.heroInner}>
                        <div className={styles.heroEyebrow}>02 — Voor je begint</div>

                        <div className={styles.heroHeading}>
                            <h1 className={styles.heroTitle}>
                                Kort voordat{' '}
                                <em className={styles.heroTitleAccent}>je start.</em>
                            </h1>
                            <p className={styles.heroSubDesktop}>
                                Je krijgt vragen over hoe jij werkt en energie krijgt. Kies steeds wat het meest bij jou past — niet wat goed klinkt.
                            </p>
                        </div>
                        <p className={styles.heroSubMobile}>
                            Je krijgt vragen over hoe jij werkt. Kies steeds wat het meest bij jou past.
                        </p>
                    </div>
                </div>

                {/* ── DRIE INFO-KAARTEN ──────────────────────────────── */}
                <div className={styles.cards}>
                    <InfoCard
                        accent="#b85c5c"
                        soft="#FDF6F6"
                        title="Hoe kies je?"
                        text="Kies wat het meest op jou lijkt. Twijfel je? Ga voor wat het sterkst voelt — niet wat 'goed' klinkt."
                    />
                    <InfoCard
                        accent="#6b8f7b"
                        soft="#EDF4EF"
                        title="Meerdere passend?"
                        text="Normaal. Je bent geen hokje. Het resultaat laat juist ook je mix van persona's zien."
                    />
                    <InfoCard
                        accent="#c7a24a"
                        soft="#FBF5E9"
                        title="Hoe lang duurt het?"
                        text="Ongeveer 15 minuten. Niets voorbereiden nodig. Gewoon eerlijk invullen."
                    />
                </div>

                {/* ── ACTIE-BALK ─────────────────────────────────────── */}
                <div className={styles.actionBar}>
                    <p className={styles.actionText}>
                        <strong>Belangrijk:</strong> dit is geen goed-fout test. Het gaat om wat het meest natuurlijk bij jou past.
                    </p>
                    <div className={styles.actionButtons}>
                        <button
                            type="button"
                            onClick={() => setPage('quiz')}
                            className={styles.btnPrimary}
                        >
                            Start met de vragen
                        </button>
                        <button
                            type="button"
                            onClick={() => setPage('home')}
                            className={styles.btnSecondary}
                        >
                            Terug
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
