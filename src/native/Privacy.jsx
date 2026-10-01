import { useEffect, useState } from 'react';
import { riseIn } from '../components/result/motion';
import { useCopy } from '../i18n/LanguageContext';
import { PageShell, PrimaryButton, SecondaryButton, SectionEyebrow } from '../ui/AppShell';
import { clearAll, countEntries } from './localStore';
import { tap } from './nativeShell';

/**
 * Privacy — wat de app over je bewaart, en de knop om het weg te halen.
 *
 * Beide stores eisen een privacyverklaring op een publieke URL; die staat op
 * tof.services/privacy. Dit scherm is de versie in de app zelf, en dat is
 * bewust: de app werkt volledig offline, dus een link naar buiten zou in een
 * vliegtuig of zonder bereik op niets uitlopen. De tekst hoort te staan waar
 * de gegevens staan.
 *
 * "Alles verwijderen" maakt het recht op wissen uit de AVG iets wat je zelf
 * kunt uitvoeren, zonder ons erbij. Dat kan hier ook, want er is nergens
 * anders een kopie.
 *
 * Bestaat alleen in app-modus (NATIVE_ONLY_PAGES in src/config/platform.js).
 */
export default function Privacy({ setPage }) {
    const { native: copy } = useCopy();
    const t = copy.privacy;
    const [isMobile, setIsMobile] = useState(window.innerWidth < 900);
    const [aantal, setAantal] = useState(() => countEntries());
    const [vraagt, setVraagt] = useState(false);
    const [gewist, setGewist] = useState(false);

    useEffect(() => {
        const onResize = () => setIsMobile(window.innerWidth < 900);
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);

    const vraagNa = () => {
        tap(true);
        setVraagt(true);
    };

    const wisAlles = () => {
        clearAll();
        setAantal(0);
        setVraagt(false);
        setGewist(true);
    };

    return (
        <PageShell padding={isMobile ? '16px 16px 28px' : '20px 20px 36px'}>
            <div
                style={{
                    display: 'grid',
                    alignSelf: 'start',
                    gap: isMobile ? 20 : 26,
                    width: '100%',
                    maxWidth: 720,
                }}
            >
                <div style={{ display: 'grid', gap: 12, ...riseIn(0) }}>
                    <SectionEyebrow>{t.eyebrow}</SectionEyebrow>

                    <h1
                        style={{
                            margin: 0,
                            fontFamily: "'Playfair Display', serif",
                            fontWeight: 500,
                            fontSize: 'clamp(28px, 4vw, 40px)',
                            lineHeight: 1.1,
                            color: 'var(--tof-text)',
                        }}
                    >
                        {t.title}
                    </h1>

                    <p
                        style={{
                            margin: 0,
                            color: 'var(--tof-text-soft)',
                            lineHeight: 1.7,
                            fontSize: 15,
                        }}
                    >
                        {t.intro}
                    </p>
                </div>

                {t.sections.map((sectie, i) => (
                    <Blok key={sectie.title} isMobile={isMobile} style={riseIn(i + 1)}>
                        <h2
                            style={{
                                margin: 0,
                                fontFamily: "'Playfair Display', serif",
                                fontWeight: 500,
                                fontSize: 20,
                                lineHeight: 1.2,
                                color: 'var(--tof-text)',
                            }}
                        >
                            {sectie.title}
                        </h2>

                        <p
                            style={{
                                margin: 0,
                                color: 'var(--tof-text-soft)',
                                lineHeight: 1.7,
                                fontSize: 15,
                            }}
                        >
                            {sectie.text}
                        </p>

                        {sectie.items && (
                            <ul
                                style={{
                                    margin: 0,
                                    paddingLeft: 18,
                                    display: 'grid',
                                    gap: 8,
                                    color: 'var(--tof-text-soft)',
                                    fontSize: 15,
                                    lineHeight: 1.6,
                                }}
                            >
                                {sectie.items.map((item) => (
                                    <li key={item}>{item}</li>
                                ))}
                            </ul>
                        )}
                    </Blok>
                ))}

                {/* Het wisblok krijgt de waarschuwende kleur, niet de huisaccent. */}
                <Blok
                    isMobile={isMobile}
                    accent="var(--tof-accent-rose)"
                    style={riseIn(t.sections.length + 1)}
                >
                    <h2
                        style={{
                            margin: 0,
                            fontFamily: "'Playfair Display', serif",
                            fontWeight: 500,
                            fontSize: 20,
                            lineHeight: 1.2,
                            color: 'var(--tof-text)',
                        }}
                    >
                        {t.eraseTitle}
                    </h2>

                    <p
                        style={{
                            margin: 0,
                            color: 'var(--tof-text-soft)',
                            lineHeight: 1.7,
                            fontSize: 15,
                        }}
                    >
                        {t.eraseText}
                    </p>

                    <p style={{ margin: 0, fontSize: 13, color: 'var(--tof-text-muted)' }}>
                        {aantal > 0 ? t.eraseCount(aantal) : t.eraseEmpty}
                    </p>

                    {gewist && (
                        <p
                            style={{
                                margin: 0,
                                fontSize: 14,
                                lineHeight: 1.6,
                                color: 'var(--tof-accent-rose)',
                            }}
                        >
                            {t.eraseDone}
                        </p>
                    )}

                    {vraagt ? (
                        <>
                            <p
                                style={{
                                    margin: 0,
                                    fontSize: 15,
                                    lineHeight: 1.6,
                                    color: 'var(--tof-accent-rose)',
                                }}
                            >
                                {t.eraseConfirm}
                            </p>

                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                                <PrimaryButton
                                    onClick={wisAlles}
                                    style={{ background: 'var(--tof-accent-rose)' }}
                                >
                                    {t.eraseYes}
                                </PrimaryButton>

                                <SecondaryButton onClick={() => setVraagt(false)}>
                                    {t.eraseCancel}
                                </SecondaryButton>
                            </div>
                        </>
                    ) : (
                        aantal > 0 && (
                            <div>
                                <SecondaryButton onClick={vraagNa}>
                                    {t.eraseButton}
                                </SecondaryButton>
                            </div>
                        )
                    )}
                </Blok>

                <div
                    style={{
                        display: 'grid',
                        gap: 14,
                        justifyItems: 'start',
                        ...riseIn(t.sections.length + 2),
                    }}
                >
                    <SecondaryButton
                        onClick={() => {
                            tap();
                            setPage('home');
                        }}
                    >
                        {t.backHome}
                    </SecondaryButton>

                    <span style={{ fontSize: 12, color: 'var(--tof-text-muted)' }}>
                        {t.updated}
                    </span>
                </div>
            </div>
        </PageShell>
    );
}

/**
 * Eén blok tekst met een gekleurde bovenrand.
 *
 * Vier losse borderzijden, geen `border`-shorthand: zodra één zijde afwijkt
 * botst shorthand met longhand en wist React de shorthand.
 */
function Blok({ children, isMobile, accent = 'var(--tof-border)', style = {} }) {
    return (
        <div
            style={{
                background: 'var(--tof-surface)',
                borderRadius: 18,
                padding: isMobile ? 20 : 24,
                borderTop: `3px solid ${accent}`,
                borderRight: '1px solid var(--tof-border)',
                borderBottom: '1px solid var(--tof-border)',
                borderLeft: '1px solid var(--tof-border)',
                boxShadow: 'var(--tof-shadow)',
                display: 'grid',
                gap: 12,
                ...style,
            }}
        >
            {children}
        </div>
    );
}
