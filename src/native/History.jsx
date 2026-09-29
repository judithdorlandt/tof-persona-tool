import { useEffect, useState } from 'react';
import { useArchetypes } from '../i18n/archetypes';
import { useCopy } from '../i18n/LanguageContext';
import {
    PageShell,
    PrimaryButton,
    SecondaryButton,
    SectionEyebrow,
} from '../ui/AppShell';
import { deleteEntry, getCurrentEntry, getHistory, selectEntry } from './localStore';

const COLOR_MAP = {
    maker: '#B05252',
    groeier: '#C28D6B',
    presteerder: '#C7A24A',
    denker: '#6F7F92',
    verbinder: '#7F9A8A',
    teamspeler: '#8B7F9A',
    zekerzoeker: '#7D8A6B',
    vernieuwer: '#D08C5B',
};

/**
 * History — de profielen die op dit toestel bewaard zijn.
 *
 * Bestaat alleen in app-modus. Elk afgerond profiel komt hier te staan, zodat
 * je ziet wat er over de tijd verschuift. Je kunt een ouder profiel openen
 * (het wordt dan het actieve profiel) of het van je toestel verwijderen.
 */
export default function History({ setPage }) {
    const { native: copy } = useCopy();
    const ARCHETYPES = useArchetypes();
    const [entries, setEntries] = useState(() => getHistory());
    const [currentId, setCurrentId] = useState(() => getCurrentEntry()?.id || null);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 900);

    useEffect(() => {
        const onResize = () => setIsMobile(window.innerWidth < 900);
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);

    const naamVan = (id) => ARCHETYPES.find((a) => a.id === id)?.name || '';

    const open = (id) => {
        selectEntry(id);
        setPage('results');
    };

    const verwijder = (id) => {
        // eslint-disable-next-line no-alert
        if (!window.confirm(copy.history.confirmRemove)) return;
        deleteEntry(id);
        setEntries(getHistory());
        setCurrentId(getCurrentEntry()?.id || null);
    };

    return (
        <PageShell padding={isMobile ? '16px 16px 28px' : '20px 20px 36px'}>
            <div
                style={{
                    animation: 'tofFadeIn 0.5s ease',
                    display: 'grid',
                    alignSelf: 'start',
                    gap: isMobile ? 20 : 28,
                    width: '100%',
                    maxWidth: 920,
                }}
            >
                <div style={{ display: 'grid', gap: 12 }}>
                    <SectionEyebrow>{copy.history.eyebrow}</SectionEyebrow>

                    <h1
                        style={{
                            margin: 0,
                            fontFamily: "'Playfair Display', serif",
                            fontWeight: 500,
                            fontSize: 'clamp(30px, 4vw, 44px)',
                            lineHeight: 1.08,
                            color: 'var(--tof-text)',
                        }}
                    >
                        {copy.history.title}
                    </h1>

                    <p
                        style={{
                            margin: 0,
                            color: 'var(--tof-text-soft)',
                            lineHeight: 1.7,
                            fontSize: 15,
                            maxWidth: 620,
                        }}
                    >
                        {copy.history.intro}
                    </p>
                </div>

                {entries.length === 0 ? (
                    <div
                        style={{
                            background: 'var(--tof-surface)',
                            borderRadius: 18,
                            padding: isMobile ? 20 : 28,
                            border: '1px solid var(--tof-border)',
                            boxShadow: 'var(--tof-shadow)',
                            display: 'grid',
                            gap: 18,
                        }}
                    >
                        <p style={{ margin: 0, color: 'var(--tof-text-soft)', lineHeight: 1.7, fontSize: 15 }}>
                            {copy.history.empty}
                        </p>

                        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                            <PrimaryButton onClick={() => setPage('quiz')}>
                                {copy.history.startTest}
                            </PrimaryButton>

                            <SecondaryButton onClick={() => setPage('home')}>
                                {copy.history.backHome}
                            </SecondaryButton>
                        </div>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gap: 14 }}>
                        {entries.map((entry) => {
                            const kleur = COLOR_MAP[entry.result?.primary] || 'var(--tof-text)';
                            const isCurrent = entry.id === currentId;

                            return (
                                <div
                                    key={entry.id}
                                    style={{
                                        background: 'var(--tof-surface)',
                                        borderRadius: 18,
                                        padding: isMobile ? 18 : 22,
                                        border: '1px solid var(--tof-border)',
                                        borderLeft: `4px solid ${kleur}`,
                                        boxShadow: 'var(--tof-shadow)',
                                        display: 'grid',
                                        gap: 12,
                                    }}
                                >
                                    <div style={{ display: 'grid', gap: 4 }}>
                                        <span style={{ fontSize: 13, color: 'var(--tof-text-soft)' }}>
                                            {copy.history.formatDate(entry.savedAt)}
                                        </span>

                                        <span
                                            style={{
                                                fontFamily: "'Playfair Display', serif",
                                                fontSize: isMobile ? 22 : 26,
                                                fontWeight: 500,
                                                color: kleur,
                                            }}
                                        >
                                            {naamVan(entry.result?.primary)}
                                        </span>

                                        <span style={{ fontSize: 14, color: 'var(--tof-text-soft)' }}>
                                            {copy.history.mixLabel}:{' '}
                                            {[entry.result?.secondary, entry.result?.tertiary]
                                                .map(naamVan)
                                                .filter(Boolean)
                                                .join(' · ')}
                                        </span>
                                    </div>

                                    {(entry.note || isCurrent) && (
                                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                            {isCurrent && (
                                                <Badge>{copy.history.current}</Badge>
                                            )}
                                            {entry.note ? <Badge>{copy.history.hasNote}</Badge> : null}
                                        </div>
                                    )}

                                    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                                        <PrimaryButton onClick={() => open(entry.id)}>
                                            {copy.history.view}
                                        </PrimaryButton>

                                        <SecondaryButton onClick={() => verwijder(entry.id)}>
                                            {copy.history.remove}
                                        </SecondaryButton>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </PageShell>
    );
}

function Badge({ children }) {
    return (
        <span
            style={{
                fontSize: 12,
                padding: '4px 10px',
                borderRadius: 999,
                background: 'var(--tof-bg)',
                border: '1px solid var(--tof-border)',
                color: 'var(--tof-text-soft)',
            }}
        >
            {children}
        </span>
    );
}
