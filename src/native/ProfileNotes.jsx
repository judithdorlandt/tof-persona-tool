import { useEffect, useRef, useState } from 'react';
import { useCopy } from '../i18n/LanguageContext';
import { SectionEyebrow } from '../ui/AppShell';
import { EMPTY_NOTES, saveNote } from './localStore';

/**
 * ProfileNotes — open vragen bij een bewaard profiel.
 *
 * Alleen in app-modus zichtbaar. De antwoorden gaan naar de lokale opslag en
 * verlaten het toestel niet: geen netwerkcall, geen account, geen back-up.
 * Er is geen opslaan-knop — typen is opslaan (met een korte adempauze).
 *
 * `fields` en `head` komen van buiten, want het gespreksscherm gebruikt dit
 * blok twee keer op twee momenten: de drie vragen waarmee je je gesprek
 * voorbereidt, en daaronder wat er uit het gesprek kwam. Dezelfde opslag,
 * dezelfde adempauze, een ander kopje.
 */
const SAVE_DELAY = 500;

export default function ProfileNotes({ entryId, initialNotes, isMobile, fields, head }) {
    const { native: copy } = useCopy();
    const [notes, setNotes] = useState({ ...EMPTY_NOTES, ...initialNotes });
    const [bewaard, setBewaard] = useState(false);
    // Eén timer per vraag: typen in de ene mag het opslaan van de andere niet
    // afbreken.
    const timersRef = useRef({});

    // Van profiel wisselen betekent: andere antwoorden tonen.
    useEffect(() => {
        setNotes({ ...EMPTY_NOTES, ...initialNotes });
        setBewaard(false);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [entryId]);

    useEffect(() => {
        const timers = timersRef.current;
        return () => Object.values(timers).forEach(clearTimeout);
    }, []);

    const onChange = (field) => (e) => {
        const value = e.target.value;
        setNotes((prev) => ({ ...prev, [field]: value }));
        clearTimeout(timersRef.current[field]);
        timersRef.current[field] = setTimeout(() => {
            saveNote(entryId, field, value);
            setBewaard(true);
        }, SAVE_DELAY);
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
            <SectionEyebrow>{head.eyebrow}</SectionEyebrow>

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
                {head.title}
            </h2>

            <p style={{ margin: 0, color: 'var(--tof-text-soft)', lineHeight: 1.7, fontSize: 15 }}>
                {head.intro}
            </p>

            {fields.map((field) => (
                <label key={field} style={{ display: 'grid', gap: 8 }}>
                    <span
                        style={{
                            fontSize: 14,
                            fontWeight: 600,
                            color: 'var(--tof-text)',
                            lineHeight: 1.45,
                        }}
                    >
                        {copy.notes.fields[field].label}
                    </span>
                    <textarea
                        value={notes[field]}
                        onChange={onChange(field)}
                        rows={4}
                        placeholder={copy.notes.fields[field].placeholder}
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
                </label>
            ))}

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
