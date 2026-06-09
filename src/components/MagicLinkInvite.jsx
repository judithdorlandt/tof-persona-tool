import React, { useEffect, useRef, useState } from 'react';
import { sendMagicLink } from '../supabase';
import { SectionCard, SectionEyebrow } from '../ui/AppShell';

const COOLDOWN_SECONDS = 60;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function MagicLinkInvite() {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState('idle'); // idle | sending | sent | error
    const [message, setMessage] = useState('');
    const [cooldown, setCooldown] = useState(0);
    const timerRef = useRef(null);

    useEffect(() => {
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, []);

    function startCooldown() {
        setCooldown(COOLDOWN_SECONDS);
        if (timerRef.current) clearInterval(timerRef.current);

        timerRef.current = setInterval(() => {
            setCooldown((prev) => {
                if (prev <= 1) {
                    clearInterval(timerRef.current);
                    timerRef.current = null;
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    }

    async function handleSend() {
        const cleanEmail = email.trim().toLowerCase();

        if (!EMAIL_PATTERN.test(cleanEmail)) {
            setStatus('error');
            setMessage('Vul een geldig e-mailadres in.');
            return;
        }

        setStatus('sending');
        setMessage('');

        const result = await sendMagicLink(cleanEmail);

        if (result.ok) {
            setStatus('sent');
            setMessage(`Toegangslink verstuurd naar ${cleanEmail}.`);
            startCooldown();
        } else {
            setStatus('error');
            setMessage(result.error || 'Versturen mislukt. Probeer het later opnieuw.');
        }
    }

    const sending = status === 'sending';
    const onCooldown = cooldown > 0;
    const disabled = sending || onCooldown;

    let buttonLabel = 'Magic link mailen';
    if (sending) buttonLabel = 'Bezig…';
    else if (onCooldown) buttonLabel = `Opnieuw over ${cooldown}s`;

    return (
        <SectionCard padding={24}>
            <div style={{ display: 'grid', gap: 14 }}>
                <SectionEyebrow>Manager toegang geven</SectionEyebrow>

                <p
                    style={{
                        margin: 0,
                        maxWidth: 620,
                        color: 'var(--tof-text-soft)',
                        lineHeight: 1.7,
                        fontSize: 15,
                    }}
                >
                    Stuur een manager een persoonlijke toegangslink. De link is eenmalig geldig.
                    Het e-mailadres moet al als gebruiker bekend zijn — onbekende adressen krijgen
                    geen mail.
                </p>

                <div
                    style={{
                        display: 'flex',
                        gap: 10,
                        flexWrap: 'wrap',
                        alignItems: 'flex-start',
                    }}
                >
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => {
                            setEmail(e.target.value);
                            if (status !== 'idle') {
                                setStatus('idle');
                                setMessage('');
                            }
                        }}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !disabled) handleSend();
                        }}
                        placeholder="naam@organisatie.nl"
                        autoComplete="off"
                        style={{
                            flex: '1 1 260px',
                            minWidth: 0,
                            padding: '12px 14px',
                            borderRadius: 10,
                            border: '1px solid var(--tof-border)',
                            background: 'white',
                            fontSize: 14,
                            color: 'var(--tof-text)',
                            outline: 'none',
                        }}
                    />

                    <button
                        type="button"
                        onClick={handleSend}
                        disabled={disabled}
                        style={{
                            padding: '12px 18px',
                            borderRadius: 10,
                            border: 'none',
                            background: disabled ? 'rgba(176,82,82,0.45)' : '#B05252',
                            color: 'white',
                            fontSize: 14,
                            fontWeight: 600,
                            cursor: disabled ? 'default' : 'pointer',
                            whiteSpace: 'nowrap',
                            transition: 'background 0.2s ease',
                        }}
                    >
                        {buttonLabel}
                    </button>
                </div>

                {message ? (
                    <div
                        style={{
                            background:
                                status === 'error'
                                    ? 'var(--tof-rose-soft)'
                                    : 'rgba(110,136,114,0.12)',
                            borderRadius: 12,
                            padding: '12px 14px',
                            fontSize: 14,
                            color: 'var(--tof-text)',
                        }}
                    >
                        {message}
                    </div>
                ) : null}
            </div>
        </SectionCard>
    );
}
