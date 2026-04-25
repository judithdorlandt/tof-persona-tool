import React from 'react';
import { ARCHETYPES } from '../../data';

function getPersonaName(id) {
    if (!id) return '—';
    return ARCHETYPES.find((item) => item.id === id)?.name || '—';
}

export default function TeamMembersTable({ teamResponses = [] }) {
    return (
        <div style={{ display: 'grid', gap: 18 }}>
            <SectionHeading
                eyebrow="Teamleden"
                title="Overzicht van ingevulde profielen"
                lead="Per teamlid zie je de primaire, secundaire en tertiaire werkstijl. Dit helpt om gesprekken te voeren over verschillen en overlap binnen het team."
            />

            <div
                style={{
                    overflowX: 'auto',
                    borderRadius: 16,
                    border: '1px solid var(--tof-border)',
                    background: 'var(--tof-surface)',
                    boxShadow: 'var(--tof-shadow)',
                }}
            >
                <table
                    style={{
                        width: '100%',
                        borderCollapse: 'collapse',
                        minWidth: 720,
                    }}
                >
                    <thead>
                        <tr style={{ background: 'var(--tof-bg)', textAlign: 'left' }}>
                            <th style={thStyle}>Naam</th>
                            <th style={thStyle}>Rol</th>
                            <th style={thStyle}>Primair</th>
                            <th style={thStyle}>Secundair</th>
                            <th style={thStyle}>Tertiair</th>
                        </tr>
                    </thead>

                    <tbody>
                        {teamResponses.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={5}
                                    style={{
                                        padding: 24,
                                        textAlign: 'center',
                                        color: 'var(--tof-text-muted)',
                                        fontSize: 14,
                                    }}
                                >
                                    Nog geen ingevulde profielen.
                                </td>
                            </tr>
                        ) : (
                            teamResponses.map((member, index) => {
                                const primary = member?.primary || member?.primary_archetype;
                                const secondary = member?.secondary || member?.secondary_archetype;
                                const tertiary = member?.tertiary || member?.tertiary_archetype;

                                return (
                                    <tr key={`${member?.name || 'member'}-${index}`}>
                                        <td style={tdStyle}>
                                            <span style={{ fontWeight: 600, color: 'var(--tof-text)' }}>
                                                {member?.name || '—'}
                                            </span>
                                        </td>
                                        <td style={tdStyle}>{member?.role || '—'}</td>
                                        <td style={tdStyleEmphasis}>{getPersonaName(primary)}</td>
                                        <td style={tdStyle}>{getPersonaName(secondary)}</td>
                                        <td style={tdStyle}>{getPersonaName(tertiary)}</td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function SectionHeading({ eyebrow, title, lead }) {
    return (
        <div style={{ display: 'grid', gap: 8 }}>
            <div
                style={{
                    fontSize: 11,
                    textTransform: 'uppercase',
                    letterSpacing: 1.8,
                    color: 'var(--tof-text-muted)',
                    fontWeight: 700,
                }}
            >
                {eyebrow}
            </div>

            <h2
                style={{
                    margin: 0,
                    fontFamily: 'var(--tof-font-heading)',
                    fontSize: 'clamp(22px, 2.6vw, 30px)',
                    lineHeight: 1.08,
                    color: 'var(--tof-text)',
                }}
            >
                {title}
            </h2>

            {lead ? (
                <p
                    style={{
                        margin: 0,
                        fontSize: 14,
                        lineHeight: 1.7,
                        color: 'var(--tof-text-soft)',
                        maxWidth: 680,
                    }}
                >
                    {lead}
                </p>
            ) : null}
        </div>
    );
}

const thStyle = {
    padding: '14px 18px',
    fontSize: 11,
    color: 'var(--tof-text-muted)',
    textTransform: 'uppercase',
    letterSpacing: 1.4,
    fontWeight: 700,
    borderBottom: '1px solid var(--tof-border)',
};

const tdStyle = {
    padding: '14px 18px',
    fontSize: 14,
    color: 'var(--tof-text-soft)',
    borderBottom: '1px solid var(--tof-border)',
    lineHeight: 1.5,
};

const tdStyleEmphasis = {
    ...tdStyle,
    color: 'var(--tof-text)',
    fontWeight: 600,
};
