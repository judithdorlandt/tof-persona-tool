/**
 * Pricing.jsx — aanbod pagina. Gemigreerd naar CSS Modules.
 */
import React from 'react';
import styles from './Pricing.module.css';
import { useCopy } from '../i18n/LanguageContext';

// Welke kaart visueel uitgelicht wordt (index in de copy-array).
const HIGHLIGHT_INDEX = 1;

export default function Pricing() {
    const { pricing: t } = useCopy();

    const openWebsite = () => {
        window.open('https://www.tof.services', '_blank', 'noopener,noreferrer');
    };

    return (
        <div className={styles.page}>
            <div className={styles.wrap}>
                <div className={styles.headerWrap}>
                    <div className={styles.eyebrow}>{t.eyebrow}</div>
                    <h1 className={styles.title}>
                        {t.titleLead}
                        <br />
                        <span className={styles.titleAccent}>{t.titleAccent}</span>
                    </h1>
                    <p className={styles.intro}>{t.intro}</p>
                </div>

                <div className={styles.grid}>
                    {t.cards.map((card, i) => (
                        <PricingCard
                            key={card.title}
                            eyebrow={card.eyebrow}
                            title={card.title}
                            price={card.price}
                            text={card.text}
                            bullets={card.bullets}
                            buttonLabel={card.buttonLabel}
                            onClick={openWebsite}
                            highlight={i === HIGHLIGHT_INDEX}
                        />
                    ))}
                </div>

                <div className={styles.note}>
                    <div className={styles.noteEyebrow}>{t.note.eyebrow}</div>
                    <h2 className={styles.noteTitle}>{t.note.title}</h2>
                    <p className={styles.noteBody}>{t.note.body}</p>
                </div>
            </div>
        </div>
    );
}

function PricingCard({
    eyebrow,
    title,
    price,
    text,
    bullets,
    buttonLabel,
    onClick,
    highlight = false,
}) {
    return (
        <div className={`${styles.card} ${highlight ? styles.cardHighlight : ''}`}>
            <div>
                <div className={`${styles.cardEyebrow} ${highlight ? styles.cardEyebrowHighlight : ''}`}>
                    {eyebrow}
                </div>
                <h3 className={`${styles.cardTitle} ${highlight ? styles.cardTitleHighlight : ''}`}>
                    {title}
                </h3>
                <div className={`${styles.cardPrice} ${highlight ? styles.cardPriceHighlight : ''}`}>
                    {price}
                </div>
                <p className={`${styles.cardText} ${highlight ? styles.cardTextHighlight : ''}`}>
                    {text}
                </p>
            </div>

            <ul className={`${styles.cardBullets} ${highlight ? styles.cardBulletsHighlight : ''}`}>
                {bullets.map((item) => (
                    <li key={item}>{item}</li>
                ))}
            </ul>

            <button
                type="button"
                onClick={onClick}
                className={`${styles.cardBtn} ${highlight ? styles.cardBtnHighlight : ''}`}
            >
                {buttonLabel}
            </button>
        </div>
    );
}
