import React from 'react';

export function PageShell({ children, maxWidth = 1120, padding = '40px 20px' }) {
    return (
        <div
            style={{
                minHeight: 'calc(100vh - 88px)',
                background: 'var(--tof-bg)',
                padding,
            }}
        >
            <div
                style={{
                    maxWidth,
                    margin: '0 auto',
                    display: 'grid',
                    gap: 24,
                }}
            >
                {children}
            </div>
        </div>
    );
}

export function SectionCard({
    children,
    label,
    title,
    background = 'var(--tof-surface)',
    borderTopColor = 'var(--tof-accent-rose)',
    padding = 22,
    style = {}, //
}) {
    return (
        <div
            style={{
                background,
                borderRadius: 18,
                padding,
                borderTop: `4px solid ${borderTopColor}`,
                border: '1px solid var(--tof-border)',
                boxShadow: 'var(--tof-shadow)',
                display: 'grid',
                gap: 16,
            }}
        >
            {label && <SectionEyebrow>{label}</SectionEyebrow>}

            {title && (
                <h2
                    style={{
                        fontFamily: 'var(--tof-font-heading)',
                        fontSize: 30,
                        lineHeight: 1.08,
                        margin: 0,
                        color: 'var(--tof-text)',
                    }}
                >
                    {title}
                </h2>
            )}

            {children}
        </div>
    );
}

export function SectionEyebrow({ children, dark = false }) {
    return (
        <div
            style={{
                fontSize: 11,
                textTransform: 'uppercase',
                letterSpacing: 1.8,
                color: dark ? '#EDE5D8' : 'var(--tof-text-muted)',
                fontWeight: 700,
                marginBottom: 2,
            }}
        >
            {children}
        </div>
    );
}

export function PrimaryButton({ children, onClick, type = 'button', style = {} }) {
    return (
        <button
            type={type}
            onClick={onClick}
            style={{
                background: 'var(--tof-accent-rose)',
                color: 'white',
                border: 'none',
                padding: '12px 18px',
                borderRadius: 10,
                cursor: 'pointer',
                fontSize: 14,
                fontWeight: 600,
                ...style,
            }}
        >
            {children}
        </button>
    );
}

export function SecondaryButton({ children, onClick, type = 'button', style = {} }) {
    return (
        <button
            type={type}
            onClick={onClick}
            style={{
                background: 'transparent',
                color: 'var(--tof-text)',
                border: '1px solid #d8cec4',
                padding: '12px 18px',
                borderRadius: 10,
                cursor: 'pointer',
                fontSize: 14,
                fontWeight: 500,
                ...style, //
            }}
        >
            {children}
        </button>
    );
}