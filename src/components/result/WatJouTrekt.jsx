/**
 * WatJouTrekt — "Wat jou naar kantoor trekt", individuele weergave.
 *
 * Eén zin in de jij-vorm voor de eigen (primaire) werkstijl, met de
 * disclaimerregel. Staat onder de Bricks: in de app binnen de Werkplek-sectie
 * (native/ProfileScreen.jsx), op het web onderaan de Bricks-kaart
 * (ResultsProfileCard.jsx). Hangt aan DIENSTENPROFIEL_ENABLED; de aanroeper
 * controleert de schakelaar.
 *
 * Bewust niet: dienstnamen, niveaus, een pin, een scorepil of een linkerrand in
 * de personakleur (dan leest de zin als een vierde brick).
 * Opmaak: tof-marketingteam/ontwerp/2026-11-04-dienstenprofiel.md, punt 3.
 *
 * `labelStyle`: de labelstijl van de omringende kaart (LABEL in de app,
 * INFO_LABEL_STYLE op het web), zodat de kop dezelfde stem heeft.
 */

import React from 'react';
import { useCopy } from '../../i18n/LanguageContext';

export default function WatJouTrekt({ personaId, labelStyle }) {
    const { servicesProfile } = useCopy();
    const copy = servicesProfile.individueel;
    const zin = copy.zin[personaId];
    if (!zin) return null;

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
            <div style={labelStyle}>{copy.kop}</div>
            <p
                style={{
                    margin: 0,
                    fontFamily: 'var(--tof-font-heading)',
                    fontSize: 18,
                    lineHeight: 1.35,
                    fontWeight: 500,
                    color: 'var(--tof-text)',
                }}
            >
                {zin}
            </p>
            <p
                style={{
                    margin: 0,
                    fontFamily: 'var(--tof-font-body)',
                    fontSize: 12,
                    lineHeight: 1.5,
                    color: 'var(--tof-text-muted)',
                }}
            >
                {copy.disclaimer}
            </p>
        </div>
    );
}
