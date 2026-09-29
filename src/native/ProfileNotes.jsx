import { useEffect, useRef, useState } from 'react';
import { useCopy } from '../i18n/LanguageContext';
import { SectionEyebrow } from '../ui/AppShell';
import { saveNote } from './localStore';

/**
 * ProfileNotes — persoonlijke aantekening bij een bewaard profiel.
 *
 * Alleen in app-modus zichtbaar. De tekst gaat naar de lokale opslag en
 * verlaat het toestel niet: geen netwerkcall, geen account, geen back-up.
 * Er is geen opslaan-knop — typen is opslaan (met een korte adempauze).
 */
export default function ProfileNotes({ entryId, initialNote = '', isMobile }) {
    const { native: copy } = useCopy();
    const [note, setNote] = useState(initialNote);
    const [bewaard, setBewaard] = useState(false);
    const timerRef = useRef(null);

    // Van profiel wisselen betekent: een andere notitie tonen.
    useEffect(() => {
        setNote(initialNote);
        setBewaard(false);
    }, [entryId, initialNote]);

    useEffect(() => () => clearTimeout(timerRef.current), []);

    const onChange = (e) => {
        const value = e.target.value;
        setNote(value);
        clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => {
            saveNote(entryId, value);
            setBewaard(true);
        }, 400);
    };

    return (
        <div
            style={{
                background: 'var(--tof-surface)',
                borderRadius: 18,
                padding: isMobile ? 20 : 26,
                border: '1px solid var(--tof-border)',
                boxShadow: 'var(--tof-shadow)',
                display: 'grid',
                gap: 14,
            }}
        >
            <SectionEyebrow>{copy.notes.eyebrow}</SectionEyebrow>

            <h2
                style={{
                    margin: 0,
                    fontFamily: "'Playfair Display', serif",
                    fontWeight: 500,
                    fontSize: isMobile ? 24 : 28,
                    lineHeight: 1.15,
                    color: 'var(--tof-text)',
                }}
            >
                {copy.notes.title}
            </h2>

            <p style={{ margin: 0, color: 'var(--tof-text-soft)', lineHeight: 1.7, fontSize: 15 }}>
                {copy.notes.intro}
            </p>

            <textarea
                value={note}
                onChange={onChange}
                rows={6}
                placeholder={copy.notes.placeholder}
                style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    resize: 'vertical',
                    padding: 14,
                    borderRadius: 12,
                    border: '1px solid var(--tof-border)',
                    background: 'var(--tof-bg)',
                    color: 'var(--tof-text)',
                    fontFamily: 'inherit',
                    fontSize: 15,
                    lineHeight: 1.6,
                }}
            />

            <span
                style={{
                    fontSize: 13,
                    color: 'var(--tof-text-soft)',
                    opacity: bewaard ? 1 : 0,
                    transition: 'opacity 0.2s ease',
                }}
            >
                {copy.notes.saved}
            </span>
        </div>
    );
}
