/**
 * Pricing.jsx — aanbod pagina. Gemigreerd naar CSS Modules.
 */
import React from 'react';
import styles from './Pricing.module.css';

export default function Pricing() {
    const openWebsite = () => {
        window.open('https://www.tof.services', '_blank', 'noopener,noreferrer');
    };

    return (
        <div className={styles.page}>
            <div className={styles.wrap}>
                <div className={styles.headerWrap}>
                    <div className={styles.eyebrow}>Aanbod</div>
                    <h1 className={styles.title}>
                        Van inzicht naar echte
                        <br />
                        <span className={styles.titleAccent}>beweging in je team</span>
                    </h1>
                    <p className={styles.intro}>
                        Niet alleen zien hoe mensen werken — maar begrijpen waar het schuurt,
                        waarom het schuurt en wat je morgen anders doet.
                    </p>
                </div>

                <div className={styles.grid}>
                    <PricingCard
                        eyebrow="Instap"
                        title="Persona Insight"
                        price="Gratis"
                        text="Voor individueel inzicht in hoe jij werkt en waar jouw energie zit."
                        bullets={[
                            'Inzicht in jouw werkstijl',
                            'Waar je energie van krijgt en verliest',
                            'Eerste vertaalslag naar gedrag en werkomgeving',
                        ]}
                        buttonLabel="Start de test"
                        onClick={openWebsite}
                    />

                    <PricingCard
                        eyebrow="Team"
                        title="Team Insight & Quick Wins"
                        price="€1.250"
                        text="Van losse profielen naar helder teaminzicht — inclusief wat je morgen al anders kunt doen."
                        bullets={[
                            'Verdeling van persona’s in je team',
                            'Waar energie ontstaat en waar het schuurt',
                            'Bricks, Bytes, Behaviour vertaald naar team',
                            'Direct toepasbare interventies',
                        ]}
                        buttonLabel="Maak dit zichtbaar in je team"
                        onClick={openWebsite}
                        highlight
                    />

                    <PricingCard
                        eyebrow="Sessie"
                        title="Team Dynamics Sessie"
                        price="€2.500"
                        text="Hier ontstaat het echte gesprek over samenwerking, spanningen en wat dit vraagt van leiderschap."
                        bullets={[
                            'Live sessie met team of MT',
                            'Duiding van patronen en spanningen',
                            'Concrete interventies voor samenwerking',
                            'Vertaling naar leiderschap en teamritme',
                        ]}
                        buttonLabel="Plan een teamsessie"
                        onClick={openWebsite}
                    />

                    <PricingCard
                        eyebrow="Strategisch"
                        title="Strategisch Team- & Werkplekinzicht"
                        price="vanaf €3.950"
                        text="Voor organisaties die teamdynamiek willen koppelen aan visie, ambitie en werkplekstrategie."
                        bullets={[
                            'Alles uit Team Insight + sessie',
                            'Verdieping op visie en richting',
                            'Vertaling naar samenwerking, leiderschap en werkplek',
                            'Concrete strategische interventies',
                        ]}
                        buttonLabel="Plan een strategisch gesprek"
                        onClick={openWebsite}
                    />
                </div>

                <div className={styles.note}>
                    <div className={styles.noteEyebrow}>Twijfel waar je moet starten?</div>
                    <h2 className={styles.noteTitle}>Begin klein.</h2>
                    <p className={styles.noteBody}>
                        De meeste organisaties starten met een Team Insight Scan en gebruiken dat
                        als basis voor verdere keuzes. Je hoeft het nog niet groot te maken om het
                        goed te doen.
                    </p>
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
