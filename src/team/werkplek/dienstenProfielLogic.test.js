// TeamAggregation haalt via i18n react-router-dom binnen; dat laadt Jest hier
// niet (ESM). De logica zelf heeft de router niet nodig.
jest.mock('react-router-dom', () => ({ useLocation: jest.fn(), useNavigate: jest.fn() }), { virtual: true });

import { buildDienstenProfiel, waaromWerkstijlen, SPRONG_DREMPEL } from './dienstenProfielLogic';
import { DIENSTTYPEN } from './dienstenmix';

// Alleen verzonnen samenstellingen: de rekenvoorbeelden uit v2 punt 6.

const ids = (list) => list.map((d) => d.id);
const ALLE = ['maker', 'groeier', 'presteerder', 'denker', 'verbinder', 'teamspeler', 'zekerzoeker', 'vernieuwer'];

describe('buildDienstenProfiel — rekenvoorbeelden v2', () => {
    test('één van elke werkstijl: geen uitgesproken dienst, alle zeven onder Helpt ook', () => {
        const p = buildDienstenProfiel(Object.fromEntries(ALLE.map((id) => [id, 1])));
        expect(p.geenUitgesproken).toBe(true);
        expect(p.top).toEqual([]);
        expect(ids(p.helptOok)).toEqual(['ontmoeting', 'focus', 'eten', 'leren', 'gemak', 'ontvangst', 'welzijn']);
    });

    test('3 Verbinders, 1 Teamspeler, 1 Denker: Ontmoeting, Eten, Ontvangst', () => {
        const p = buildDienstenProfiel({ verbinder: 3, teamspeler: 1, denker: 1 });
        expect(p.geenUitgesproken).toBe(false);
        expect(ids(p.top)).toEqual(['ontmoeting', 'eten', 'ontvangst']);
        expect(ids(p.helptOok)).toEqual(['welzijn', 'leren', 'focus', 'gemak']);
    });

    test('2 Presteerders, 2 Denkers, 1 Zekerzoeker: Focus, Gemak, Welzijn', () => {
        const p = buildDienstenProfiel({ presteerder: 2, denker: 2, zekerzoeker: 1 });
        expect(p.geenUitgesproken).toBe(false);
        expect(ids(p.top)).toEqual(['focus', 'gemak', 'welzijn']);
        expect(ids(p.helptOok)).toEqual(['ontvangst', 'leren', 'eten', 'ontmoeting']);
    });
});

describe('buildDienstenProfiel — regels', () => {
    test('IT staat nooit in top of Helpt ook', () => {
        const samenstellingen = [
            { maker: 5 },
            { presteerder: 5 },
            { verbinder: 2, vernieuwer: 3 },
            Object.fromEntries(ALLE.map((id) => [id, 1])),
        ];
        samenstellingen.forEach((a) => {
            const p = buildDienstenProfiel(a);
            expect([...ids(p.top), ...ids(p.helptOok)]).not.toContain('it');
            expect(p.top.length + p.helptOok.length).toBe(7);
        });
    });

    test('top heeft hoogstens drie diensten', () => {
        // Eén persona: veel sprongen, maar nooit meer dan drie bovenaan.
        ALLE.forEach((id) => {
            const p = buildDienstenProfiel({ [id]: 5 });
            expect(p.top.length).toBeLessThanOrEqual(3);
        });
    });

    test('gelijke stand: volgorde van de lijst', () => {
        // Presteerder: Focus 3 en Gemak 3 gelijk → Focus (4) vóór Gemak (8).
        const p = buildDienstenProfiel({ presteerder: 5 });
        expect(ids(p.top)).toEqual(['focus', 'gemak']);
    });

    test('een sprong van precies de drempel telt mee', () => {
        expect(SPRONG_DREMPEL).toBe(0.25);
        // 3 Makers, 1 Groeier: Ontmoeting 2,00 · Focus 2,00 · Eten 1,75 · …
        // De enige sprong in de eerste drie is precies 0,25, na plaats 2.
        const p = buildDienstenProfiel({ maker: 3, groeier: 1 });
        expect(p.geenUitgesproken).toBe(false);
        expect(ids(p.top)).toEqual(['ontmoeting', 'focus']);
    });

    test('Maker heeft buiten IT geen topdienst', () => {
        const p = buildDienstenProfiel({ maker: 6 });
        expect(p.geenUitgesproken).toBe(true);
        expect(p.helptOok).toHaveLength(7);
    });

    test('leeg team: geen data', () => {
        expect(buildDienstenProfiel({}).heeftData).toBe(false);
        expect(buildDienstenProfiel(null).heeftData).toBe(false);
    });

    test('elke dienst in de lijst heeft een wie', () => {
        DIENSTTYPEN.forEach((d) => expect(['team', 'organisatie', 'beide']).toContain(d.wie));
    });
});

describe('waaromWerkstijlen — elke werkstijl in het team', () => {
    // personasByPrimary komt gesorteerd uit TeamAggregation (meeste eerst,
    // daarna archetypevolgorde); de test geeft hem in die vorm mee.
    const agg = (lijst) => ({ personasByPrimary: lijst.map(([id, count]) => ({ id, count })) });

    test('alle werkstijlen, meeste mensen eerst', () => {
        expect(waaromWerkstijlen(agg([['verbinder', 3], ['teamspeler', 1], ['denker', 1]]))).toEqual(['verbinder', 'teamspeler', 'denker']);
    });

    test('alle acht aanwezig → acht zinnen', () => {
        expect(waaromWerkstijlen(agg(ALLE.map((id) => [id, 1])))).toEqual(ALLE);
    });

    test('werkstijl met nul mensen telt niet mee', () => {
        expect(waaromWerkstijlen(agg([['presteerder', 2], ['denker', 0]]))).toEqual(['presteerder']);
    });

    test('leeg team → geen zinnen', () => {
        expect(waaromWerkstijlen({})).toEqual([]);
    });
});
