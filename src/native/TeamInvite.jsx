import { useState } from 'react';
import { useCopy, useLang } from '../i18n/LanguageContext';
import { pagePath } from '../i18n/routes';
import { handoffUrl } from '../lib/profileHandoff';
import { getReadableTextOnColor } from '../lib/resultDerivations';
import { SectionEyebrow } from '../ui/AppShell';

/**
 * TeamInvite — de stap ná je eigen profiel.
 *
 * Staat onderaan je profiel, want dat is het moment waarop de vraag opkomt:
 * en hoe zit dat bij de rest? Jouw beeld is af; het teambeeld begint pas.
 *
 * Twee dingen die deze kaart bewust NIET doet:
 *
 * - niets verzamelen. Geen e-mailadres, geen "laat je gegevens achter". Beide
 *   routes lopen naar buiten: je profiel inbrengen gebeurt op de website, en de
 *   vraag aan je organisatie in de mail die jij zelf kiest, met een tekst die
 *   je nog kunt aanpassen. De app weet van geen van beide of je ze afmaakt, en dat
 *   hoort ook niet. Zonder dat zou het privacyscherm ("deze app stuurt niets")
 *   niet meer waar zijn.
 * - niets verkopen. Een teamomgeving wordt door een organisatie afgenomen, niet
 *   door jou hier in de app. Deze kaart wijst alleen de weg.
 *
 * Inbrengen werkt daarom als overhandigen, niet als versturen: de app bouwt een
 * adres met je persona en scores in het hash-deel (zie lib/profileHandoff.js)
 * en opent dat. Op de website zie je wat erin staat, vul je je teamcode in en
 * klik je zelf op versturen. Zonder afgerond profiel valt die route terug op de
 * website zelf — dan is er niets te overhandigen.
 *
 * De links gaan naar buiten en dus niet in de webview: Capacitor opent een
 * http-adres dat niet bij de app hoort in de systeembrowser, en een mailto in
 * de mail-app. `target="_blank"` maakt dat expliciet en houdt het op het web
 * (waar dit scherm niet komt, maar goed) net zo netjes.
 */
export default function TeamInvite({ isMobile, accent, resultData = null }) {
    const { native } = useCopy();
    const { lang } = useLang();
    const t = native.team;

    // De mailroute vouwt pas open als je hem kiest: zolang je niets vraagt,
    // hoeft er geen rijtje providers in beeld te staan.
    const [mailOpen, setMailOpen] = useState(false);
    const [kopie, setKopie] = useState('');

    // Naar de webapp (`appUrl`), niet naar de verhaalsite (`siteUrl`) — daar
    // bestaat /bijdragen niet. Zonder afgerond profiel gaat de knop naar
    // dezelfde pagina zonder profiel erin; die legt zelf uit wat er mist.
    const bijdragenPad = pagePath('bijdragen', lang);
    const inbrengen =
        handoffUrl(resultData, t.appUrl, bijdragenPad)
        || `${t.appUrl.replace(/\/+$/, '')}${bijdragenPad}`;

    const onderwerp = t.askOrg.subject;
    const tekst = t.askOrg.body.join('\n');

    // Dezelfde tekst, drie adressen. `mailto:` is de enige die een app op het
    // toestel nodig heeft; de andere twee openen een webformulier dat het al
    // ingevuld heeft staan. Welke er werkt weet alleen jij, dus kies zelf.
    const mailRoutes = [
        {
            key: 'app',
            label: t.askOrg.providers.app,
            href: `mailto:?subject=${encodeURIComponent(onderwerp)}&body=${encodeURIComponent(tekst)}`,
        },
        {
            key: 'gmail',
            label: t.askOrg.providers.gmail,
            href: `https://mail.google.com/mail/?view=cm&fs=1&su=${encodeURIComponent(
                onderwerp
            )}&body=${encodeURIComponent(tekst)}`,
        },
        {
            key: 'outlook',
            label: t.askOrg.providers.outlook,
            href: `https://outlook.office.com/mail/deeplink/compose?subject=${encodeURIComponent(
                onderwerp
            )}&body=${encodeURIComponent(tekst)}`,
        },
    ];

    async function kopieer() {
        try {
            await navigator.clipboard.writeText(`${onderwerp}\n\n${tekst}`);
            setKopie('ok');
        } catch (_e) {
            // Zonder https of zonder toestemming bestaat het klembord niet.
            setKopie('mislukt');
        }
    }

    return (
        <div
            style={{
                background: 'var(--tof-surface)',
                borderRadius: 18,
                padding: isMobile ? 20 : 26,
                borderTop: `3px solid ${accent}`,
                borderRight: '1px solid var(--tof-border)',
                borderBottom: '1px solid var(--tof-border)',
                borderLeft: '1px solid var(--tof-border)',
                boxShadow: 'var(--tof-shadow)',
                display: 'grid',
                gap: 14,
            }}
        >
            <SectionEyebrow>{t.eyebrow}</SectionEyebrow>

            <h2
                style={{
                    margin: 0,
                    fontFamily: "'Playfair Display', serif",
                    fontWeight: 500,
                    fontSize: isMobile ? 24 : 28,
                    lineHeight: 1.12,
                    color: 'var(--tof-text)',
                }}
            >
                {t.title}
            </h2>

            <p style={{ margin: 0, fontSize: 15, lineHeight: 1.7, color: 'var(--tof-text-soft)' }}>
                {t.intro}
            </p>

            <Route
                accent={accent}
                title={t.contribute.title}
                text={t.contribute.text}
                button={t.contribute.button}
                href={inbrengen}
                primair
            />

            <Route
                accent={accent}
                title={t.askOrg.title}
                text={t.askOrg.text}
                button={t.askOrg.button}
                onClick={() => setMailOpen((open) => !open)}
                expanded={mailOpen}
            >
                {mailOpen ? (
                    <div style={{ display: 'grid', gap: 8, marginTop: 2 }}>
                        <span
                            style={{
                                fontSize: 13,
                                fontWeight: 600,
                                color: 'var(--tof-text)',
                            }}
                        >
                            {t.askOrg.chooseLabel}
                        </span>

                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                            {mailRoutes.map((route) => (
                                <a
                                    key={route.key}
                                    href={route.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{ ...KEUZE, borderColor: accent, color: accent }}
                                >
                                    {route.label}
                                </a>
                            ))}

                            {/* Werkt ook als geen enkele mailroute iets opent. */}
                            <button
                                type="button"
                                onClick={kopieer}
                                style={{ ...KEUZE, borderColor: accent, color: accent }}
                            >
                                {t.askOrg.providers.copy}
                            </button>
                        </div>

                        {kopie ? (
                            <span
                                role="status"
                                style={{ fontSize: 13, color: 'var(--tof-text-soft)' }}
                            >
                                {kopie === 'ok' ? t.askOrg.copied : t.askOrg.copyFailed}
                            </span>
                        ) : null}
                    </div>
                ) : null}
            </Route>

            {/* Twee adressen, twee rollen: het verhaal achter de tool, en het
                bureau dat hem maakt. */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14 }}>
                <Voet href={t.siteUrl}>{t.siteLabel}</Voet>
                <Voet href={t.businessUrl}>{t.businessLabel}</Voet>
            </div>
        </div>
    );
}

/** Stille link onderaan de kaart. */
function Voet({ href, children }) {
    return (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            style={{
                fontSize: 13,
                color: 'var(--tof-text-muted)',
                textDecoration: 'underline',
                textUnderlineOffset: 3,
            }}
        >
            {children}
        </a>
    );
}

/** Eén mailroute. Zelfde maat als de hoofdknoppen, maar rustiger. */
const KEUZE = {
    minHeight: 44,
    display: 'inline-flex',
    alignItems: 'center',
    padding: '0 16px',
    borderRadius: 999,
    fontFamily: 'var(--tof-font-body)',
    fontSize: 14,
    fontWeight: 600,
    textDecoration: 'none',
    background: 'var(--tof-surface)',
    border: '1px solid',
    cursor: 'pointer',
};

/**
 * Eén van de twee routes.
 *
 * Met `href` is de knop een `<a>` en geen `<button>`: hij verlaat de app, en
 * dan hoort er ook een adres achter te zitten — voor wie lang indrukt, en voor
 * een schermlezer die "link" wil zeggen in plaats van "knop". Met `onClick`
 * gebeurt het omgekeerde: er gaat niets open, er vouwt iets uit, en dan is het
 * een echte knop die zegt of hij open staat.
 */
function Route({
    accent,
    title,
    text,
    button,
    href,
    onClick,
    expanded,
    primair = false,
    children = null,
}) {
    const knopStijl = {
        justifySelf: 'start',
        // Apples ondergrens voor raakvlakken; een link is hier een knop.
        minHeight: 44,
        display: 'inline-flex',
        alignItems: 'center',
        padding: '0 18px',
        borderRadius: 999,
        fontFamily: 'var(--tof-font-body)',
        fontSize: 14,
        fontWeight: 600,
        textDecoration: 'none',
        cursor: 'pointer',
        background: primair ? accent : 'transparent',
        // Elke persona heeft een eigen kleur, en niet elke kleur verdraagt
        // witte tekst.
        color: primair ? getReadableTextOnColor(accent) : accent,
        border: `1px solid ${accent}`,
    };

    return (
        <div
            style={{
                background: 'var(--tof-bg)',
                borderRadius: 14,
                padding: '14px 16px',
                border: '1px solid var(--tof-border)',
                display: 'grid',
                gap: 8,
            }}
        >
            <span
                style={{
                    fontFamily: "'Playfair Display', serif",
                    fontWeight: 500,
                    fontSize: 18,
                    lineHeight: 1.15,
                    color: 'var(--tof-text)',
                }}
            >
                {title}
            </span>

            <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: 'var(--tof-text-soft)' }}>
                {text}
            </p>

            {href ? (
                <a href={href} target="_blank" rel="noopener noreferrer" style={knopStijl}>
                    {button}
                </a>
            ) : (
                <button
                    type="button"
                    onClick={onClick}
                    aria-expanded={expanded}
                    style={knopStijl}
                >
                    {button}
                </button>
            )}

            {children}
        </div>
    );
}
