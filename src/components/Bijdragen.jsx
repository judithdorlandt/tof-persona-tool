/**
 * Bijdragen.jsx — waar een profiel uit de app bij een team terechtkomt.
 *
 * Dit is de web-helft van de brug die in lib/profileHandoff.js staat. De app
 * bewaart alles op het toestel en stuurt zelf niets; wie zijn beeld tóch in zijn
 * team wil leggen, krijgt daar een knop die deze pagina opent met het profiel in
 * het hash-deel van de URL. Hier gebeurt de rest:
 *
 *   1. het profiel uit de hash lezen en letterlijk tonen wat er in staat,
 *   2. de teamcode laten controleren, zodat je ziet aan welke organisatie en
 *      welk team je bijdraagt vóórdat je het doet,
 *   3. pas op de knop: één rij in private.responses via het bestaande
 *      saveResponse — dezelfde weg als een respondent op het web.
 *
 * Daarmee rolt een app-gebruiker automatisch mee in het teaminzicht en in het
 * organisatie-landschap, want die rekenen allebei op `invite_code` +
 * `organization`. Er is dus niets nieuws nodig boven teamniveau.
 *
 * De code-controle loopt bewust via `validateTeamAccessCode` (team_access_codes)
 * en niet via responses: bezoekers hebben geen leesrecht op responses, en dat
 * moet zo blijven.
 *
 * Twee kleine dingen die het verschil maken:
 * - het profiel komt uit een URL en is dus te bewerken. `decodeHandoff` laat
 *   alleen bekende persona's en echte getallen door; de rest wordt `null` en
 *   levert het lege scherm op in plaats van rommel in de database.
 * - na een gelukte bijdrage halen we de hash uit de adresbalk. Het profiel heeft
 *   zijn werk gedaan en hoeft niet in de geschiedenis van de browser te blijven
 *   staan.
 */

import { useMemo, useState } from 'react';

import { useArchetypes } from '../i18n/archetypes';
import { useCopy, useLang } from '../i18n/LanguageContext';
import { pagePath } from '../i18n/routes';
import { DEFAULT_PERSONA_COLOR, PERSONA_COLORS } from '../lib/resultDerivations';
import { decodeHandoff } from '../lib/profileHandoff';
import { saveResponse, validateTeamAccessCode } from '../supabase';
import {
    HeroBlock,
    PageShell,
    PrimaryButton,
    SecondaryButton,
    SectionCard,
} from '../ui/AppShell';
import { SPACING, TYPE } from '../ui/tokens';
import { Field, Input } from './StrategischKompasIntake';

// Twee keer hetzelfde profiel inbrengen levert twee rijen op, en dus een
// vertekend teambeeld: één persoon die voor twee telt. Deze browser onthoudt
// daarom welke combinatie van profiel en teamcode al is ingebracht.
//
// Bewust lokaal, en bewust niet in de database. Dubbel inbrengen tegenhouden
// aan de serverkant zou een toestel-id in de link vragen, en dus een vast
// kenmerk per gebruiker in private.responses. Dat is een te hoge prijs voor een
// teller. Wat hier overblijft is een smalle rest: wie de link op een ánder
// toestel nog eens opent, telt alsnog dubbel. Dat weegt niet op tegen een
// profiel dat herkenbaar wordt.
const INGEBRACHT_KEY = 'tof_bijdragen_ingebracht';

// Het profiel zelf is de vingerafdruk — er is niets anders om op te herkennen.
// Dezelfde persona, dezelfde acht scores, dezelfde teamcode = dezelfde bijdrage.
function vingerafdruk(profiel, teamcode) {
    const werkstijl = Object.keys(profiel.scores)
        .sort()
        .map((id) => `${id}:${profiel.scores[id]}`)
        .join(',');
    return [
        teamcode,
        profiel.primary,
        profiel.secondary || '-',
        profiel.tertiary || '-',
        werkstijl,
    ].join('|');
}

function gelezen() {
    try {
        const lijst = JSON.parse(window.localStorage.getItem(INGEBRACHT_KEY) || '[]');
        return Array.isArray(lijst) ? lijst : [];
    } catch (_e) {
        // Privémodus of volle opslag. Dan blijft alleen de knopbewaking over.
        return [];
    }
}

function onthoud(afdruk) {
    try {
        const lijst = gelezen().filter((rij) => rij !== afdruk);
        // Twintig is ruim: het gaat om één profiel per team, niet om een archief.
        window.localStorage.setItem(
            INGEBRACHT_KEY,
            JSON.stringify([...lijst, afdruk].slice(-20))
        );
    } catch (_e) {
        /* zie gelezen() */
    }
}

// Tekstknop — gebruikt voor "andere code" en voor "toch opnieuw".
const LINK_KNOP = {
    justifySelf: 'start',
    background: 'none',
    border: 'none',
    padding: 0,
    cursor: 'pointer',
    fontFamily: 'var(--tof-font-body)',
    fontSize: 13,
    color: 'var(--tof-text-muted)',
    textDecoration: 'underline',
};

export default function Bijdragen({ setPage }) {
    const { contribute: t } = useCopy();
    const { lang } = useLang();
    const ARCHETYPES = useArchetypes();

    // De link is bij het openen van de pagina compleet; hij verandert daarna
    // niet meer. Eén keer lezen is dus genoeg.
    const [profiel] = useState(() => decodeHandoff(window.location.hash));
    const [code, setCode] = useState(
        () => new URLSearchParams(window.location.search).get('code') || ''
    );
    const [access, setAccess] = useState(null); // de gecontroleerde code-rij
    const [naam, setNaam] = useState('');
    const [status, setStatus] = useState('idle'); // idle | checking | saving | done
    const [fout, setFout] = useState('');
    const [nogmaals, setNogmaals] = useState(false); // bewust door de blokkade heen

    const naamVan = (id) => ARCHETYPES.find((a) => a.id === id)?.name || null;
    const accent = PERSONA_COLORS[profiel?.primary] || DEFAULT_PERSONA_COLOR;

    // Pas als de code gecontroleerd is, weten we waar het profiel heen zou gaan
    // — en dus of die bijdrage al bestaat.
    const afdruk = access && profiel ? vingerafdruk(profiel, access.code) : null;
    const alIngebracht = !!afdruk && !nogmaals && gelezen().includes(afdruk);

    // Hoogste score eerst — dan leest de lijst als een rangorde en niet als een
    // tabel waarin je zelf moet zoeken.
    const scores = useMemo(() => {
        if (!profiel) return [];
        return Object.entries(profiel.scores)
            .map(([id, score]) => ({ id, score, name: naamVan(id) }))
            .filter((r) => r.name)
            .sort((a, b) => b.score - a.score);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [profiel, ARCHETYPES]);

    async function controleerCode() {
        const schoon = code.trim();
        if (!schoon) {
            setFout(t.errors.codeRequired);
            return;
        }

        setStatus('checking');
        setFout('');

        let rij = null;
        try {
            rij = await validateTeamAccessCode(schoon);
        } catch (err) {
            console.error(err);
            setStatus('idle');
            setFout(t.errors.codeCheckFailed);
            return;
        }

        setStatus('idle');
        if (!rij) {
            setFout(t.errors.codeUnknown);
            return;
        }
        setAccess(rij);
    }

    async function breng() {
        if (!access || !profiel) return;
        // De knop is dan al weg; dit is het vangnet tegen een dubbele klik.
        if (alIngebracht) return;

        setStatus('saving');
        setFout('');

        // Exact de vorm die saveResponse verwacht, en dezelfde velden als een
        // respondent op het web: de afdeling uit de code-rij is het team waar
        // het teaminzicht op filtert.
        try {
            await saveResponse({
                name: naam.trim(),
                org: access.organization,
                dept: access.team,
                team: access.team,
                invite_code: access.code,
                primary: profiel.primary,
                secondary: profiel.secondary,
                tertiary: profiel.tertiary,
                scores: profiel.scores,
            });
        } catch (err) {
            setStatus('idle');
            setFout(err?.message || t.errors.saveFailed);
            return;
        }

        // Vanaf hier is deze bijdrage gedaan. Eerst onthouden, dan pas de hash
        // weghalen — anders is de vingerafdruk weg als het opslaan nog loopt.
        onthoud(afdruk);
        setNogmaals(false);

        // Het profiel is binnen; het hoeft niet meer in de adresbalk te staan.
        window.history.replaceState(null, '', pagePath('bijdragen', lang));
        setStatus('done');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // ── Geen profiel in de link ───────────────────────────────────────────────
    if (!profiel) {
        return (
            <PageShell compact>
                <HeroBlock compact eyebrow={t.empty.eyebrow} title={t.empty.title} />
                <SectionCard accent={DEFAULT_PERSONA_COLOR}>
                    <p style={{ ...TYPE.bodyLarge, margin: 0 }}>{t.empty.body}</p>
                    <div style={{ display: 'flex', gap: SPACING.sm + 2, flexWrap: 'wrap' }}>
                        <PrimaryButton onClick={() => setPage && setPage('quiz')}>
                            {t.empty.startTest}
                        </PrimaryButton>
                        <SecondaryButton onClick={() => setPage && setPage('intro')}>
                            {t.empty.backHome}
                        </SecondaryButton>
                    </div>
                </SectionCard>
            </PageShell>
        );
    }

    // ── Gelukt ────────────────────────────────────────────────────────────────
    if (status === 'done') {
        return (
            <PageShell compact>
                <HeroBlock
                    compact
                    eyebrow={t.done.eyebrow}
                    title={t.done.title}
                    titleAccentColor={accent}
                />
                <SectionCard accent={accent}>
                    <p style={{ ...TYPE.bodyLarge, margin: 0 }}>{t.done.body(access.team)}</p>
                    <p style={{ ...TYPE.bodySmall, color: 'var(--tof-text-muted)', margin: 0 }}>
                        {t.done.once}
                    </p>
                </SectionCard>
            </PageShell>
        );
    }

    // ── Het formulier ─────────────────────────────────────────────────────────
    return (
        <PageShell compact>
            <HeroBlock
                compact
                eyebrow={t.eyebrow}
                title={t.title}
                titleAccent={t.titleAccent}
                titleAccentColor={accent}
                lead={t.intro}
            />

            {/* 1 — wat er meegaat. Eerst zien, dan beslissen. */}
            <SectionCard accent={accent} eyebrow={t.payload.heading}>
                <div style={{ display: 'grid', gap: SPACING.xs + 2 }}>
                    <span style={{ ...TYPE.bodySmall, color: 'var(--tof-text-muted)' }}>
                        {t.payload.personaHeading}
                    </span>
                    <span
                        style={{
                            fontFamily: "'Playfair Display', serif",
                            fontWeight: 500,
                            fontSize: 28,
                            lineHeight: 1.1,
                            color: accent,
                        }}
                    >
                        {naamVan(profiel.primary)}
                    </span>
                    <span style={{ ...TYPE.body, color: 'var(--tof-text-soft)' }}>
                        {[
                            profiel.secondary && `${t.payload.secondaryLabel}: ${naamVan(profiel.secondary)}`,
                            profiel.tertiary && `${t.payload.tertiaryLabel}: ${naamVan(profiel.tertiary)}`,
                        ]
                            .filter(Boolean)
                            .join(' · ')}
                    </span>
                </div>

                <div style={{ display: 'grid', gap: SPACING.xs + 2 }}>
                    <span style={{ ...TYPE.bodySmall, color: 'var(--tof-text-muted)' }}>
                        {t.payload.scoresHeading}
                    </span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {scores.map((rij) => (
                            <span
                                key={rij.id}
                                style={{
                                    ...TYPE.bodySmall,
                                    padding: '5px 12px',
                                    borderRadius: 999,
                                    border: '1px solid var(--tof-border)',
                                    background: 'var(--tof-bg)',
                                    color: 'var(--tof-text-soft)',
                                }}
                            >
                                {rij.name} {rij.score}
                            </span>
                        ))}
                    </div>
                </div>

                <p style={{ ...TYPE.bodySmall, color: 'var(--tof-text-muted)', margin: 0 }}>
                    {t.payload.note}
                </p>
            </SectionCard>

            {/* 2 — naar welk team. De code wordt gecontroleerd zodat je de
                organisatie en het team ziet voordat je iets verstuurt. */}
            <SectionCard accent={accent}>
                <Field label={t.code.label} hint={t.code.hint}>
                    {access ? (
                        <div style={{ display: 'grid', gap: SPACING.xs + 2 }}>
                            <span style={{ ...TYPE.bodySmall, color: 'var(--tof-text-muted)' }}>
                                {t.resolved.label}
                            </span>
                            <span style={{ ...TYPE.bodyLarge, color: 'var(--tof-text)', fontWeight: 600 }}>
                                {[access.organization, access.team].filter(Boolean).join(' · ')}
                            </span>
                            <button
                                type="button"
                                onClick={() => {
                                    setAccess(null);
                                    setFout('');
                                }}
                                style={LINK_KNOP}
                            >
                                {t.code.change}
                            </button>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gap: SPACING.sm, justifyItems: 'start' }}>
                            <Input
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                placeholder={t.code.placeholder}
                            />
                            <SecondaryButton
                                onClick={controleerCode}
                                style={{ opacity: status === 'checking' ? 0.6 : 1 }}
                            >
                                {status === 'checking' ? t.code.checking : t.code.check}
                            </SecondaryButton>
                        </div>
                    )}
                </Field>

                {/* De naam blijft optioneel, net als in de vragenlijst op het web. */}
                {access && !alIngebracht ? (
                    <Field label={t.name.label} hint={t.name.hint}>
                        <Input
                            value={naam}
                            onChange={(e) => setNaam(e.target.value)}
                            placeholder={t.name.placeholder}
                        />
                    </Field>
                ) : null}

                {fout ? (
                    <p style={{ ...TYPE.body, color: 'var(--tof-accent-rose)', margin: 0 }}>{fout}</p>
                ) : null}

                {/* Staat deze bijdrage er al, dan is er geen knop — alleen de
                    uitleg waarom, met een uitweg voor wie het écht nog eens wil. */}
                {access && alIngebracht ? (
                    <div style={{ display: 'grid', gap: SPACING.xs + 2, justifyItems: 'start' }}>
                        <p style={{ ...TYPE.body, color: 'var(--tof-text-soft)', margin: 0 }}>
                            {t.already.body(access.team)}
                        </p>
                        <button type="button" onClick={() => setNogmaals(true)} style={LINK_KNOP}>
                            {t.already.anyway}
                        </button>
                    </div>
                ) : null}

                {access && !alIngebracht ? (
                    <div>
                        <PrimaryButton
                            onClick={breng}
                            disabled={status === 'saving'}
                            style={{ background: accent }}
                        >
                            {status === 'saving' ? t.submitting : t.submit}
                        </PrimaryButton>
                    </div>
                ) : null}
            </SectionCard>
        </PageShell>
    );
}
