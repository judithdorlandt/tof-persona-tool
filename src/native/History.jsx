import { useEffect, useRef, useState } from 'react';
import { useArchetypes } from '../i18n/archetypes';
import { useCopy } from '../i18n/LanguageContext';
import { PERSONA_COLORS } from '../lib/resultDerivations';
import {
    PageShell,
    PrimaryButton,
    SecondaryButton,
    SectionEyebrow,
} from '../ui/AppShell';
import { deleteEntry, getCurrentEntry, getHistory, selectEntry } from './localStore';
import { tap } from './nativeShell';
import PastConversation from './PastConversation';

/** Hoe ver de kaart meeschuift, en vanaf waar de veeg telt. */
const MAX_REVEAL = 104;
const SWIPE_THRESHOLD = 64;

/**
 * History — de profielen die op dit toestel bewaard zijn.
 *
 * Bestaat alleen in app-modus. Elk afgerond profiel komt hier te staan, zodat
 * je ziet wat er over de tijd verschuift. Je kunt een ouder profiel openen
 * (het wordt dan het actieve profiel) of het van je toestel verwijderen.
 *
 * Verwijderen gaat in twee stappen en nooit meteen: veeg de kaart naar links
 * (of gebruik de knop) en de kaart vraagt het eerst na. Dat is bewust geen
 * `window.confirm` — in een webview is dat een browserdialoog met de hostnaam
 * erin, precies het soort ding dat een app níet native laat voelen.
 *
 * Onder elk profiel hangen de gesprekken die je toen hebt gevoerd. Ze staan
 * dichtgeklapt: dit blijft een lijst profielen, en pas als je er één opent wil
 * je de gesprekken eronder lezen.
 */
export default function History({ setPage }) {
    const { native: copy, resultsCard } = useCopy();
    const ARCHETYPES = useArchetypes();
    const [entries, setEntries] = useState(() => getHistory());
    const [currentId, setCurrentId] = useState(() => getCurrentEntry()?.id || null);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 900);
    // Het profiel dat om een bevestiging staat te wachten; er is er altijd
    // maximaal één, zodat er nooit twee kaarten tegelijk staan te vragen.
    const [pendingId, setPendingId] = useState(null);

    useEffect(() => {
        const onResize = () => setIsMobile(window.innerWidth < 900);
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);

    const naamVan = (id) => ARCHETYPES.find((a) => a.id === id)?.name || '';
    const workplaceLabels = resultsCard.profile.workplaceLabels;

    const open = (id) => {
        selectEntry(id);
        setPage('results');
    };

    const vraagNa = (id) => {
        tap(true);
        setPendingId(id);
    };

    const verwijder = (id) => {
        deleteEntry(id);
        setEntries(getHistory());
        setCurrentId(getCurrentEntry()?.id || null);
        setPendingId(null);
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
                        <p
                            style={{
                                margin: 0,
                                fontSize: 13,
                                color: 'var(--tof-text-muted)',
                                lineHeight: 1.6,
                            }}
                        >
                            {copy.history.swipeHint}
                        </p>

                        {entries.map((entry) => (
                            <HistoryCard
                                key={entry.id}
                                copy={copy}
                                isMobile={isMobile}
                                kleur={PERSONA_COLORS[entry.result?.primary] || 'var(--tof-text)'}
                                datum={copy.history.formatDate(entry.savedAt)}
                                naam={naamVan(entry.result?.primary)}
                                mix={[entry.result?.secondary, entry.result?.tertiary]
                                    .map(naamVan)
                                    .filter(Boolean)
                                    .join(' · ')}
                                isCurrent={entry.id === currentId}
                                // Eén beantwoorde gespreksvraag is al genoeg
                                // voor het "met aantekening"-label.
                                heeftNotitie={Object.values(entry.notes || {}).some(
                                    (v) => v && v.trim()
                                )}
                                // De gesprekken die onder dít profiel zijn
                                // afgerond, nieuwste eerst. `primary` gaat als
                                // archetype mee (niet als naam): de
                                // vastgeprikte inzichten van toen worden
                                // daaruit teruggezocht.
                                gesprekken={entry.conversations || []}
                                primary={ARCHETYPES.find((a) => a.id === entry.result?.primary)}
                                workplaceLabels={workplaceLabels}
                                pending={entry.id === pendingId}
                                onOpen={() => open(entry.id)}
                                onAskRemove={() => vraagNa(entry.id)}
                                onConfirmRemove={() => verwijder(entry.id)}
                                onCancelRemove={() => setPendingId(null)}
                            />
                        ))}
                    </div>
                )}
            </div>
        </PageShell>
    );
}

/**
 * Eén bewaard profiel, met de veeg erin.
 *
 * Op module-niveau en niet inline: een component die bij elke render een nieuwe
 * identiteit krijgt wordt door React opnieuw opgebouwd, en dan valt de
 * veegstand halverwege weg.
 */
function HistoryCard({
    copy, isMobile, kleur, datum, naam, mix, isCurrent, heeftNotitie,
    gesprekken, primary, workplaceLabels,
    pending, onOpen, onAskRemove, onConfirmRemove, onCancelRemove,
}) {
    const [dx, setDx] = useState(0);
    const [dragging, setDragging] = useState(false);
    const [toontGesprekken, setToontGesprekken] = useState(false);
    // Waar de vinger begon, en of deze beweging horizontaal of verticaal is.
    // `richting` blijft 'v' zodra je verticaal bent begonnen, zodat scrollen
    // nooit halverwege in een veeg verandert.
    const startRef = useRef(null);
    // Een veeg die op een knop begint eindigt in een klik. Zonder deze vlag
    // opent "Bekijken" het profiel zodra je over die knop hebt geveegd.
    const gesleeptRef = useRef(false);

    const beginVeeg = (event) => {
        // Elke nieuwe aanraking wist de vlag, óók als er niet geveegd mag
        // worden: anders blijft hij staan na de veeg die de vraag opriep en
        // slikt de kaart de eerstvolgende tik op "Laat maar staan" in.
        gesleeptRef.current = false;
        if (pending) return;
        startRef.current = { x: event.clientX, y: event.clientY, richting: null };
    };

    const volgVeeg = (event) => {
        const start = startRef.current;
        if (!start || start.richting === 'v') return;

        const dixX = event.clientX - start.x;
        const dixY = event.clientY - start.y;

        if (!start.richting) {
            if (Math.abs(dixX) < 6 && Math.abs(dixY) < 6) return;
            start.richting = Math.abs(dixX) > Math.abs(dixY) ? 'h' : 'v';
            if (start.richting === 'v') return;
            setDragging(true);
        }

        // Alleen naar links, en niet verder dan de strook eronder breed is.
        setDx(Math.max(Math.min(dixX, 0), -MAX_REVEAL));
    };

    const eindigVeeg = () => {
        const start = startRef.current;
        startRef.current = null;
        setDragging(false);

        if (start?.richting === 'h') {
            gesleeptRef.current = true;
            if (dx <= -SWIPE_THRESHOLD) onAskRemove();
        }

        // De kaart schuift altijd terug: de vraag staat in de kaart zelf, dus
        // er is niets om open te laten staan.
        setDx(0);
    };

    const onderdrukKlikNaVeeg = (event) => {
        if (!gesleeptRef.current) return;
        gesleeptRef.current = false;
        event.stopPropagation();
        event.preventDefault();
    };

    return (
        <div
            style={{
                position: 'relative',
                borderRadius: 18,
                overflow: 'hidden',
                boxShadow: 'var(--tof-shadow)',
            }}
        >
            {/* De strook die onder de kaart tevoorschijn komt: alleen een
                aankondiging, geen knop — er hoort niets bereikbaars achter
                een kaart te zitten. */}
            <div
                aria-hidden="true"
                style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'var(--tof-accent-rose)',
                    color: '#F7F3EE',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    gap: 8,
                    paddingRight: 20,
                    fontSize: 13,
                    fontWeight: 600,
                    opacity: Math.min(dx / -SWIPE_THRESHOLD, 1),
                }}
            >
                <span aria-hidden="true" style={{ fontSize: 16 }}>×</span>
                {copy.history.remove}
            </div>

            <div
                onPointerDown={beginVeeg}
                onPointerMove={volgVeeg}
                onPointerUp={eindigVeeg}
                onPointerCancel={eindigVeeg}
                // Een vinger houdt zijn eigen pointer vast, een muis niet:
                // zonder dit blijft de kaart halfgeschoven staan als de cursor
                // eraf glijdt.
                onPointerLeave={eindigVeeg}
                onClickCapture={onderdrukKlikNaVeeg}
                style={{
                    position: 'relative',
                    transform: `translateX(${dx}px)`,
                    transition: dragging ? 'none' : 'transform 220ms var(--tof-ease)',
                    // Verticaal scrollen blijft van de browser, horizontaal is
                    // van ons — zonder dit vecht de veeg met de pagina.
                    touchAction: 'pan-y',
                    background: 'var(--tof-surface)',
                    padding: isMobile ? 18 : 22,
                    borderTop: '1px solid var(--tof-border)',
                    borderRight: '1px solid var(--tof-border)',
                    borderBottom: '1px solid var(--tof-border)',
                    borderLeft: `4px solid ${kleur}`,
                    display: 'grid',
                    gap: 12,
                }}
            >
                <div style={{ display: 'grid', gap: 4 }}>
                    <span style={{ fontSize: 13, color: 'var(--tof-text-soft)' }}>
                        {datum}
                    </span>

                    <span
                        style={{
                            fontFamily: "'Playfair Display', serif",
                            fontSize: isMobile ? 22 : 26,
                            fontWeight: 500,
                            color: kleur,
                        }}
                    >
                        {naam}
                    </span>

                    <span style={{ fontSize: 14, color: 'var(--tof-text-soft)' }}>
                        {copy.history.mixLabel}: {mix}
                    </span>
                </div>

                {(heeftNotitie || isCurrent || gesprekken.length > 0) && (
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        {isCurrent && <Badge>{copy.history.current}</Badge>}
                        {heeftNotitie ? <Badge>{copy.history.hasNote}</Badge> : null}
                        {gesprekken.length > 0 ? (
                            <Badge>{copy.history.conversations.count(gesprekken.length)}</Badge>
                        ) : null}
                    </div>
                )}

                {pending ? (
                    <div style={{ display: 'grid', gap: 10 }}>
                        <span
                            style={{
                                fontSize: 14,
                                fontWeight: 600,
                                color: 'var(--tof-accent-rose)',
                            }}
                        >
                            {copy.history.confirmRemove}
                        </span>

                        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                            <PrimaryButton onClick={onConfirmRemove}>
                                {copy.history.confirmYes}
                            </PrimaryButton>

                            <SecondaryButton onClick={onCancelRemove}>
                                {copy.history.confirmCancel}
                            </SecondaryButton>
                        </div>
                    </div>
                ) : (
                    <div
                        style={{
                            display: 'flex',
                            gap: 16,
                            flexWrap: 'wrap',
                            alignItems: 'center',
                        }}
                    >
                        <PrimaryButton onClick={onOpen}>
                            {copy.history.view}
                        </PrimaryButton>

                        {/* Stiller dan de veeg-strook, maar altijd bereikbaar:
                            vegen is niet te zien en niet te doen met een
                            schermlezer. */}
                        <button
                            type="button"
                            onClick={onAskRemove}
                            style={{
                                background: 'none',
                                border: 'none',
                                padding: 0,
                                cursor: 'pointer',
                                fontSize: 14,
                                fontFamily: 'var(--tof-font-body)',
                                color: 'var(--tof-text-muted)',
                                textDecoration: 'underline',
                                textUnderlineOffset: 3,
                            }}
                        >
                            {copy.history.remove}
                        </button>
                    </div>
                )}

                {/* De gesprekken onder dit profiel. Dicht tenzij je ze opent —
                    acht gesprekken uitgeklapt maken van elke kaart een pagina. */}
                {gesprekken.length > 0 && !pending && (
                    <div style={{ display: 'grid', gap: 12 }}>
                        <button
                            type="button"
                            onClick={() => {
                                tap();
                                setToontGesprekken((open) => !open);
                            }}
                            aria-expanded={toontGesprekken}
                            style={{
                                justifySelf: 'start',
                                background: 'none',
                                border: 'none',
                                padding: 0,
                                cursor: 'pointer',
                                fontSize: 14,
                                fontFamily: 'var(--tof-font-body)',
                                color: 'var(--tof-text-muted)',
                                textDecoration: 'underline',
                                textUnderlineOffset: 3,
                            }}
                        >
                            {toontGesprekken
                                ? copy.history.conversations.hide
                                : copy.history.conversations.show}
                        </button>

                        {toontGesprekken &&
                            gesprekken.map((gesprek) => (
                                <PastConversation
                                    key={gesprek.id}
                                    isMobile={isMobile}
                                    color={kleur}
                                    gesprek={gesprek}
                                    primary={primary}
                                    workplaceLabels={workplaceLabels}
                                    compact
                                />
                            ))}
                    </div>
                )}
            </div>
        </div>
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
