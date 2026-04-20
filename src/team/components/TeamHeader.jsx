import React from 'react';
import { PrimaryButton, SecondaryButton, SectionEyebrow } from '../../ui/AppShell';

export default function TeamHeader({ selectedTeam, teamCount, setPage }) {
    return (
        <div style={{ display: 'grid', gap: 14 }}>
            <SectionEyebrow>Teamdashboard</SectionEyebrow>

            <h1
                style={{
                    margin: 0,
                    fontFamily: 'var(--tof-font-heading)',
                    fontSize: 'clamp(34px, 5vw, 62px)',
                    lineHeight: 1.04,
                    color: 'var(--tof-text)',
                }}
            >
                Teaminzicht voor{' '}
                <span style={{ color: 'var(--tof-accent-rose)', fontStyle: 'italic' }}>
                    {selectedTeam || 'jouw team'}
                </span>
            </h1>

            <p
                style={{
                    margin: 0,
                    fontSize: 16,
                    lineHeight: 1.7,
                    color: 'var(--tof-text-soft)',
                    maxWidth: 760,
                }}
            >
                Dit dashboard laat zien hoe werkstijlen zich in het team verdelen, wat het team nodig heeft in de werkplek en waar directe kansen liggen voor betere samenwerking.
            </p>

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <PrimaryButton onClick={() => setPage('teamselector')}>
                    Ander team kiezen
                </PrimaryButton>

                <SecondaryButton onClick={() => setPage('home')}>
                    Terug naar home
                </SecondaryButton>
            </div>

            <div
                style={{
                    fontSize: 14,
                    color: 'var(--tof-text-muted)',
                }}
            >
                {teamCount} reacties in dit dashboard
            </div>
        </div>
    );
}