/**
 * DienstenLaag — "Wat dit team naar kantoor trekt"
 *
 * Tweede laag in het Werkplek-paneel van het teamdashboard, onder "Let op de
 * balans". Alleen zichtbaar als WerkplekProfielInline hem aanzet (schakelaar
 * DIENSTENPROFIEL_ENABLED + prop `metDiensten` + drempel van vijf).
 *
 * Opmaak: tof-marketingteam/ontwerp/2026-11-04-dienstenprofiel.md (punt 1 en 2).
 * Geen kaart, geen achtergrond, geen badge, geen icoon, geen personakleur:
 * alleen een lijn en lucht. De maten zijn die van SecondaryItem en
 * BelowAverageNote in WerkplekProfielInline.jsx (overgenomen, niet gedeeld,
 * zodat het werkplekprofiel zelf onaangeraakt blijft).
 *
 * Volgorde: titel · waarom dit team komt · wat een kantoordag de moeite waard
 * maakt (of de toestand "geen uitgesproken dienst") · helpt ook · IT-voetregel ·
 * disclaimer. Volgorde = rangorde; er komen geen nummers of getallen bij.
 */

import React from 'react';
import { SPACING, TYPE, useIsMobile, useIsNarrow } from '../../ui/tokens';
import { useCopy } from '../../i18n/LanguageContext';
import { DIENSTTYPEN } from './dienstenmix';
import { buildDienstenProfiel, waaromWerkstijlen } from './dienstenProfielLogic';
import { aantallenUitAggregate } from './werkplekProfielLogic';

const WIE_PER_DIENST = Object.fromEntries(DIENSTTYPEN.map((d) => [d.id, d.wie]));

const LIJN_ZACHT = '1px solid rgba(230, 221, 210, 0.6)';
const LIJN_RASTER = '1px solid rgba(230, 221, 210, 0.4)';

const KOP = { ...TYPE.eyebrow, color: 'var(--tof-text-muted)' };

const UITLEG = {
    fontFamily: 'var(--tof-font-body)',
    fontSize: 13,
    lineHeight: 1.5,
    color: 'var(--tof-text-soft)',
    margin: 0,
};

const DIENSTNAAM = {
    margin: 0,
    fontFamily: 'var(--tof-font-heading)',
    fontSize: 20,
    lineHeight: 1.1,
    fontWeight: 500,
    color: 'var(--tof-text)',
};

export default function DienstenLaag({ aggregate }) {
    const isMobile = useIsMobile();
    const { servicesProfile: COPY } = useCopy();

    const profiel = buildDienstenProfiel(aantallenUitAggregate(aggregate));
    if (!profiel.heeftData) return null;

    const waarom = waaromWerkstijlen(aggregate);
    const namen = Object.fromEntries(
        (aggregate?.personasByPrimary || []).map((p) => [p.id, p.name])
    );

    return (
        <section
            aria-labelledby="diensten-laag-titel"
            style={{
                display: 'grid',
                gap: isMobile ? SPACING.lg : SPACING['2xl'],
                // Laaggrens: zelfde lijn als de secties, maar meer lucht —
                // 40 px boven en onder op desktop, 24 op mobiel.
                marginTop: isMobile ? SPACING.sm : SPACING.lg,
                paddingTop: isMobile ? SPACING['2xl'] : SPACING['3xl'],
                borderTop: '1px solid var(--tof-border)',
            }}
        >
            <h3 id="diensten-laag-titel" style={TYPE.subhead}>
                {COPY.titel}
            </h3>

            {waarom.length > 0 ? (
                <Blok kop={COPY.waaromKop}>
                    <WaaromLijst ids={waarom} namen={namen} zinnen={COPY.waarom} />
                </Blok>
            ) : null}

            <Blok kop={COPY.dienstenKop}>
                {profiel.geenUitgesproken ? (
                    <GeenUitgesproken copy={COPY.geenUitgesproken} />
                ) : (
                    <DienstenLijst items={profiel.top} copy={COPY} isMobile={isMobile} />
                )}
            </Blok>

            {profiel.helptOok.length > 0 ? (
                <Blok kop={COPY.helptOokKop}>
                    <HelptOok items={profiel.helptOok} copy={COPY} isMobile={isMobile} />
                </Blok>
            ) : null}

            <div style={{ display: 'grid', gap: 0 }}>
                <p
                    style={{
                        fontFamily: 'var(--tof-font-body)',
                        fontSize: 13,
                        lineHeight: 1.55,
                        color: 'var(--tof-text-soft)',
                        maxWidth: 760,
                        margin: 0,
                    }}
                >
                    <strong style={{ fontWeight: 600, color: 'var(--tof-text)' }}>
                        {COPY.diensten.it.naam}.
                    </strong>{' '}
                    {COPY.itVoetregel}
                </p>
                <p
                    style={{
                        ...TYPE.meta,
                        lineHeight: 1.5,
                        maxWidth: 620,
                        // Hangt aan de voetregel, zodat het één slotblok
                        // wordt: 12 px (mobiel 8) in plaats van de gridgap.
                        marginTop: isMobile ? SPACING.sm : SPACING.md,
                    }}
                >
                    {COPY.disclaimer}
                </p>
            </div>
        </section>
    );
}

function Blok({ kop, children }) {
    return (
        <div style={{ display: 'grid', gap: SPACING.md }}>
            <h4 style={KOP}>{kop}</h4>
            {children}
        </div>
    );
}

// Kop 1 — de werkstijl in 600, de zin ernaast (onder 600 px eronder).
// Geen personakleur: de Maker-rood leest hier als het rose van "let op".
function WaaromLijst({ ids, namen, zinnen }) {
    const isNarrow = useIsNarrow();
    return (
        <dl style={{ display: 'grid', gap: SPACING.md, maxWidth: 760, margin: 0 }}>
            {ids.map((id) =>
                zinnen[id] ? (
                    <div
                        key={id}
                        style={{
                            display: 'grid',
                            gridTemplateColumns: isNarrow ? '1fr' : '140px minmax(0, 1fr)',
                            columnGap: SPACING.xl,
                            rowGap: 2,
                        }}
                    >
                        <dt
                            style={{
                                fontFamily: 'var(--tof-font-body)',
                                fontSize: 14,
                                lineHeight: 1.55,
                                fontWeight: 600,
                                color: 'var(--tof-text)',
                            }}
                        >
                            {namen[id] || id}
                        </dt>
                        <dd
                            style={{
                                fontFamily: 'var(--tof-font-body)',
                                fontSize: 14,
                                lineHeight: 1.55,
                                color: 'var(--tof-text-soft)',
                                margin: 0,
                            }}
                        >
                            {zinnen[id]}
                        </dd>
                    </div>
                ) : null
            )}
        </dl>
    );
}

// Kop 2 — één kolom, rijen met de lijn van SecondaryItem. Links naam + wie,
// rechts uitleg + voorbeelden; op mobiel alles onder elkaar.
function DienstenLijst({ items, copy, isMobile }) {
    return (
        <div style={{ display: 'grid', gap: SPACING.lg }}>
            {items.map(({ id }) => {
                const d = copy.diensten[id];
                if (!d) return null;
                return (
                    <div
                        key={id}
                        style={{
                            display: 'grid',
                            gridTemplateColumns: isMobile
                                ? '1fr'
                                : 'minmax(180px, 240px) minmax(0, 1fr)',
                            columnGap: SPACING.xl,
                            rowGap: SPACING.xs + 2,
                            paddingBottom: SPACING.sm + 2,
                            borderBottom: LIJN_ZACHT,
                        }}
                    >
                        <div>
                            <h5 style={DIENSTNAAM}>{d.naam}</h5>
                            <div
                                style={{
                                    marginTop: 6,
                                    fontFamily: 'var(--tof-font-body)',
                                    fontSize: 12,
                                    lineHeight: 1.4,
                                    fontWeight: 600,
                                    color: 'var(--tof-text-soft)',
                                }}
                            >
                                {copy.wie[WIE_PER_DIENST[id]]}
                            </div>
                        </div>
                        <div>
                            <p style={UITLEG}>{d.uitleg}</p>
                            {d.voorbeelden?.length > 0 ? (
                                <p style={{ ...UITLEG, color: 'var(--tof-text-muted)', marginTop: 4 }}>
                                    {d.voorbeelden.join(' · ')}
                                </p>
                            ) : null}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

// Toestand zonder uitgesproken dienst: op de plek van de diensten nog steeds
// een regel met gewicht — geen grijze melding, geen rose, geen kader.
function GeenUitgesproken({ copy }) {
    return (
        <div style={{ display: 'grid', gap: 6, maxWidth: 620 }}>
            <p style={{ ...DIENSTNAAM, lineHeight: 1.2 }}>{copy.kop}</p>
            <p style={UITLEG}>{copy.tekst}</p>
        </div>
    );
}

// Helpt ook — alleen de namen, in het raster van BelowAverageNote.
function HelptOok({ items, copy, isMobile }) {
    return (
        <ul
            style={{
                listStyle: 'none',
                margin: 0,
                padding: 0,
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(3, minmax(0, 1fr))',
                columnGap: SPACING.lg,
                rowGap: SPACING.sm,
            }}
        >
            {items.map(({ id }) =>
                copy.diensten[id] ? (
                    <li
                        key={id}
                        style={{
                            fontFamily: 'var(--tof-font-body)',
                            fontSize: 14,
                            color: 'var(--tof-text-soft)',
                            paddingBottom: 6,
                            borderBottom: LIJN_RASTER,
                        }}
                    >
                        {copy.diensten[id].naam}
                    </li>
                ) : null
            )}
        </ul>
    );
}
