/**
 * PrikkelBlok — "Geluid en werkomgeving" in het Werkplek-paneel van het
 * teamdashboard, tussen "Let op de balans" en "Wat dit team naar kantoor
 * trekt".
 *
 * Het signaal komt kant-en-klaar uit SQL (public.prikkel_voor_code,
 * supabase/011_prikkel_antwoorden.sql): 'gemengd' | 'stil' | 'reuring' |
 * 'zonder_uitersten', of null bij minder dan vijf antwoorden met een
 * voorkeur. Aantallen bereiken de browser nooit.
 *
 * Opmaak zoals Blok en GeenUitgesproken in DienstenLaag.jsx: een lijn, een
 * eyebrow, een kop in Playfair 20 px, uitleg 13 px en een metaregel. Geen
 * kader, geen rose, geen getallen, geen personakleur.
 */

import React from 'react';
import { SPACING, TYPE, useIsMobile } from '../../ui/tokens';
import { useCopy } from '../../i18n/LanguageContext';
import { isPrikkelUitkomst } from './prikkelUitkomst';

const SLEUTEL = {
    gemengd: 'gemengd',
    stil: 'stil',
    reuring: 'reuring',
    zonder_uitersten: 'zonderUitersten',
};

export default function PrikkelBlok({ signaal }) {
    const isMobile = useIsMobile();
    const { workplaceProfile: COPY } = useCopy();
    const T = COPY.prikkelTeam;
    if (!T) return null;

    const rand = {
        paddingTop: isMobile ? SPACING.md : SPACING.lg,
        borderTop: '1px solid var(--tof-border)',
    };

    // Lege toestand: alleen de metaregel, zonder kop.
    if (!isPrikkelUitkomst(signaal)) {
        return (
            <div style={rand}>
                <p style={{ ...TYPE.meta, lineHeight: 1.5, margin: 0 }}>{T.leeg}</p>
            </div>
        );
    }

    const tekst = T[SLEUTEL[signaal]];

    return (
        <section
            aria-labelledby="prikkel-blok-titel"
            style={{ ...rand, display: 'grid', gap: SPACING.md }}
        >
            <h4 id="prikkel-blok-titel" style={{ ...TYPE.eyebrow, color: 'var(--tof-text-muted)', margin: 0 }}>
                {T.eyebrow}
            </h4>
            <div style={{ display: 'grid', gap: 6 }}>
                <p
                    style={{
                        margin: 0,
                        fontFamily: 'var(--tof-font-heading)',
                        fontSize: 20,
                        lineHeight: 1.2,
                        fontWeight: 500,
                        color: 'var(--tof-text)',
                    }}
                >
                    {tekst.kop}
                </p>
                <p
                    style={{
                        margin: 0,
                        fontFamily: 'var(--tof-font-body)',
                        fontSize: 13,
                        lineHeight: 1.5,
                        color: 'var(--tof-text-soft)',
                    }}
                >
                    {tekst.tekst}
                </p>
            </div>
            <p style={{ ...TYPE.meta, lineHeight: 1.5, margin: 0 }}>{T.meta}</p>
        </section>
    );
}
