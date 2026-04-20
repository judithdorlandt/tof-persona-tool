import React from 'react';
import { ARCHETYPES } from '../../data';

function getPersonaName(id) {
    return ARCHETYPES.find((item) => item.id === id)?.name || '-';
}

export default function TeamMembersTable({ teamResponses = [] }) {
    return (
        <div style={{ display: 'grid', gap: 16 }}>
            <div
                style={{
                    fontSize: 11,
                    textTransform: 'uppercase',
                    letterSpacing: 1.6,
                    color: 'var(--tof-text-muted)',
                    fontWeight: 700,
                }}
            >
                Teamleden
            </div>

            <h3
                style={{
                    margin: 0,
                    fontFamily: 'var(--tof-font-heading)',
                    fontSize: 24,
                    lineHeight: 1.08,
                    color: 'var(--tof-text)',
                }}
            >
                Overzicht van ingevulde profielen
            </h3>

            <div
                style={{
                    overflowX: 'auto',
                    borderRadius: 16,
                    border: '1px solid #E8DDD2',
                    background: '#fff',
                    boxShadow: '0 10px 24px rgba(60, 38, 28, 0.04)',
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
                        <tr style={{ background: '#F8F2EC', textAlign: 'left' }}>
                            <th style={thStyle}>Naam</th>
                            <th style={thStyle}>Rol</th>
                            <th style={thStyle}>Primair</th>
                            <th style={thStyle}>Secundair</th>
                            <th style={thStyle}>Tertiair</th>
                        </tr>
                    </thead>

                    <tbody>
                        {teamResponses.map((member, index) => (
                            <tr key={`${member?.name || 'member'}-${index}`}>
                                <td style={tdStyle}>{member?.name || '-'}</td>
                                <td style={tdStyle}>{member?.role || '-'}</td>
                                <td style={tdStyle}>{getPersonaName(member?.primary)}</td>
                                <td style={tdStyle}>{getPersonaName(member?.secondary)}</td>
                                <td style={tdStyle}>{getPersonaName(member?.tertiary)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

const thStyle = {
    padding: '14px 16px',
    fontSize: 12,
    color: '#7A6D66',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    fontWeight: 700,
    borderBottom: '1px solid #EADFD4',
};

const tdStyle = {
    padding: '14px 16px',
    fontSize: 14,
    color: '#3F342F',
    borderBottom: '1px solid #F1E8DF',
};