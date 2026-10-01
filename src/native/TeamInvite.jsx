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
 *   vraag aan je organisatie via je eigen mail-app met een tekst die je nog
 *   kunt aanpassen. De app weet van geen van beide of je ze afmaakt, en dat
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

    const mailto = `mailto:?subject=${encodeURIComponent(t.askOrg.subject)}&body=${encodeURIComponent(
        t.askOrg.body.join('\n')
    )}`;

    // Naar de webapp (`appUrl`), niet naar de verhaalsite (`siteUrl`) — daar
    // bestaat /bijdragen niet. Zonder afgerond profiel gaat de knop naar
    // dezelfde pagina zonder profiel erin; die legt zelf uit wat er mist.
    const bijdragenPad = pagePath('bijdragen', lang);
    const inbrengen =
        handoffUrl(resultData, t.appUrl, bijdragenPad)
        || `${t.appUrl.replace(/\/+$/, '')}${bijdragenPad}`;

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
                href={mailto}
            />

            <a
                href={t.siteUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                    justifySelf: 'start',
                    fontSize: 13,
                    color: 'var(--tof-text-muted)',
                    textDecoration: 'underline',
                    textUnderlineOffset: 3,
                }}
            >
                {t.siteLabel}
            </a>
        </div>
    );
}

/**
 * Eén van de twee routes. De knop is een `<a>` en geen `<button>`: hij verlaat
 * de app, en dan hoort er ook een adres achter te zitten — voor wie lang
 * indrukt, en voor een schermlezer die "link" wil zeggen in plaats van "knop".
 */
function Route({ accent, title, text, button, href, primair = false }) {
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

            <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                    justifySelf: 'start',
                    // Apples ondergrens voor raakvlakken; een link is hier een knop.
                    minHeight: 44,
                    display: 'inline-flex',
                    alignItems: 'center',
                    padding: '0 18px',
                    borderRadius: 999,
                    fontSize: 14,
                    fontWeight: 600,
                    textDecoration: 'none',
                    background: primair ? accent : 'transparent',
                    // Elke persona heeft een eigen kleur, en niet elke kleur
                    // verdraagt witte tekst.
                    color: primair ? getReadableTextOnColor(accent) : accent,
                    border: `1px solid ${accent}`,
                }}
            >
                {button}
            </a>
        </div>
    );
}
