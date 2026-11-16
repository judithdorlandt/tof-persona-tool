/**
 * PrikkelRegel — "Geluid om je heen", individuele weergave.
 *
 * Eén zin onder de drie Bricks, alleen als je antwoord op de werkomgevings-
 * vraag aan de andere kant zit dan je primaire werkstijl doet verwachten
 * (regels in src/lib/prikkel.js). Anders niets: een bevestiging is een blok
 * zonder nieuws. Staat vóór WatJouTrekt, in de app (native/ProfileScreen.jsx)
 * en op het web (ResultsProfileCard.jsx).
 *
 * Opmaak als WatJouTrekt (lijn erboven, label in de labelstijl van de kaart),
 * maar de zin in broodtekst (14 px, --tof-text-soft) in plaats van de koptekst
 * van 18 px, zodat hij niet concurreert met "Wat jou naar kantoor trekt".
 * Geen personakleur, geen pin (UX-uitwerking §2).
 */

import React from 'react';
import { useArchetypes } from '../../i18n/archetypes';
import { useCopy } from '../../i18n/LanguageContext';
import { prikkelRegelSoort } from '../../lib/prikkel';

export default function PrikkelRegel({ personaId, prikkel, labelStyle }) {
    const { prikkelRegel: copy } = useCopy();
    const archetypes = useArchetypes();

    const soort = prikkelRegelSoort(personaId, prikkel);
    if (!soort) return null;
    const werkstijlMv = archetypes.find((a) => a.id === personaId)?.naamMv;
    if (!werkstijlMv) return null;

    return (
        <div
            style={{
                display: 'grid',
                gap: 8,
                marginTop: 4,
                paddingTop: 16,
                borderTop: '1px solid var(--tof-border)',
            }}
        >
            <div style={labelStyle}>{copy.label}</div>
            <p
                style={{
                    margin: 0,
                    fontFamily: 'var(--tof-font-body)',
                    fontSize: 14,
                    lineHeight: 1.55,
                    color: 'var(--tof-text-soft)',
                }}
            >
                {copy[soort](werkstijlMv)}
            </p>
        </div>
    );
}
