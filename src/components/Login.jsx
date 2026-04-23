import React, { useState } from 'react';
import { signInWithEmail, getUserMemberships } from '../supabase';
import {
    PageShell,
    SectionCard,
    PrimaryButton,
    SecondaryButton,
    SectionEyebrow,
} from '../ui/AppShell';

export default function Login({ setPage, setCurrentUser }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const handleSubmit = async () => {
        setErrorMessage('');

        const cleanEmail = email.trim();
        const cleanPassword = password;

        if (!cleanEmail || !cleanPassword) {
            setErrorMessage('Vul zowel je e-mailadres als wachtwoord in.');
            return;
        }

        setLoading(true);

        try {
            const { user, error } = await signInWithEmail(cleanEmail, cleanPassword);

            if (error || !user) {
                setErrorMessage(
                    'Inloggen is niet gelukt. Controleer je e-mailadres en wachtwoord.'
                );
                setLoading(false);
                return;
            }

            const memberships = await getUserMemberships(user.id);

            if (typeof setCurrentUser === 'function') {
                setCurrentUser(user);
            }

            if (!memberships || memberships.length === 0) {
                setErrorMessage(
                    'Je bent ingelogd, maar aan dit account zijn nog geen teams gekoppeld. Neem contact op met TOF.'
                );
                setLoading(false);
                return;
            }

            setLoading(false);
            setPage('managerteams');
        } catch (err) {
            console.error('Login flow error:', err);
            setErrorMessage('Er ging iets mis. Probeer het opnieuw.');
            setLoading(false);
        }
    };

    return (
        <PageShell padding="24px 20px 36px">
            <SectionCard
                padding={28}
                borderTopColor="var(--tof-accent-rose)"
                style={{ maxWidth: 520, margin: '0 auto' }}
            >
                <SectionEyebrow>Inloggen · managertoegang</SectionEyebrow>

                <h1
                    style={{
                        margin: 0,
                        fontFamily: 'var(--tof-font-heading)',
                        fontSize: 'clamp(28px, 4vw, 38px)',
                        lineHeight: 1.1,
                        color: 'var(--tof-text)',
                    }}
                >
                    Welkom terug.
                </h1>

                <p
                    style={{
                        margin: 0,
                        color: 'var(--tof-text-soft)',
                        lineHeight: 1.7,
                        fontSize: 15,
                    }}
                >
                    Log in met je e-mailadres om jouw teams en dashboards te bekijken.
                </p>

                <div style={{ display: 'grid', gap: 12, marginTop: 4 }}>
                    <label style={labelStyle}>
                        E-mailadres
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="naam@organisatie.nl"
                            autoComplete="email"
                            style={inputStyle}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSubmit();
                            }}
                        />
                    </label>

                    <label style={labelStyle}>
                        Wachtwoord
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            autoComplete="current-password"
                            style={inputStyle}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSubmit();
                            }}
                        />
                    </label>
                </div>

                {errorMessage ? (
                    <div
                        style={{
                            background: 'rgba(176, 82, 82, 0.08)',
                            border: '1px solid rgba(176, 82, 82, 0.2)',
                            color: '#7A2F2F',
                            borderRadius: 10,
                            padding: '10px 14px',
                            fontSize: 13,
                            lineHeight: 1.55,
                        }}
                    >
                        {errorMessage}
                    </div>
                ) : null}

                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 4 }}>
                    <PrimaryButton
                        onClick={handleSubmit}
                        style={{ opacity: loading ? 0.6 : 1, cursor: loading ? 'wait' : 'pointer' }}
                    >
                        {loading ? 'Bezig met inloggen…' : 'Inloggen'}
                    </PrimaryButton>

                    <SecondaryButton onClick={() => setPage('team')}>
                        Terug
                    </SecondaryButton>
                </div>

                <p
                    style={{
                        margin: 0,
                        fontSize: 12,
                        color: 'var(--tof-text-muted)',
                        lineHeight: 1.6,
                        marginTop: 6,
                    }}
                >
                    Nog geen managertoegang? Neem contact op via{' '}
                    <a
                        href="https://www.tof.services/contact"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: 'var(--tof-accent-rose)', textDecoration: 'none' }}
                    >
                        tof.services
                    </a>
                    .
                </p>
            </SectionCard>
        </PageShell>
    );
}

const labelStyle = {
    display: 'grid',
    gap: 6,
    fontSize: 12,
    fontWeight: 600,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    color: 'var(--tof-text-muted)',
};

const inputStyle = {
    padding: '12px 14px',
    borderRadius: 10,
    border: '1px solid #E5D9CD',
    fontSize: 14,
    outline: 'none',
    background: '#FFFFFF',
    color: 'var(--tof-text)',
    fontFamily: 'inherit',
};
