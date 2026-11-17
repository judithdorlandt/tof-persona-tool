import { PRIKKEL_IDS, isPrikkel, prikkelRegelSoort } from './prikkel';

describe('isPrikkel', () => {
    test('kent alleen de vier sleutels', () => {
        PRIKKEL_IDS.forEach((id) => expect(isPrikkel(id)).toBe(true));
        ['', 'hard', 'Stil', null, undefined, 3].forEach((w) => expect(isPrikkel(w)).toBe(false));
    });
});

describe('prikkelRegelSoort', () => {
    test('Denker en Presteerder: alleen een regel bij reuring', () => {
        ['denker', 'presteerder'].forEach((id) => {
            expect(prikkelRegelSoort(id, 'reuring')).toBe('reuringBijStil');
            ['stil', 'geroezemoes', 'maakt_niet_uit', null].forEach((p) =>
                expect(prikkelRegelSoort(id, p)).toBeNull());
        });
    });

    test('Verbinder en Vernieuwer: alleen een regel bij stil', () => {
        ['verbinder', 'vernieuwer'].forEach((id) => {
            expect(prikkelRegelSoort(id, 'stil')).toBe('stilBijLeven');
            ['reuring', 'geroezemoes', 'maakt_niet_uit', null].forEach((p) =>
                expect(prikkelRegelSoort(id, p)).toBeNull());
        });
    });

    test('Maker, Groeier, Teamspeler en Zekerzoeker krijgen nooit een regel', () => {
        ['maker', 'groeier', 'teamspeler', 'zekerzoeker'].forEach((id) => {
            PRIKKEL_IDS.forEach((p) => expect(prikkelRegelSoort(id, p)).toBeNull());
        });
    });
});

describe('prikkelmarkering', () => {
    const { heeftPrikkelMarkering, zetPrikkelMarkering, prikkelMarkeringSleutel } = require('./prikkel');
    beforeEach(() => window.localStorage.clear());

    test('sleutel per teamcode', () => {
        expect(prikkelMarkeringSleutel('ABC123')).toBe('tof_prikkel_ABC123');
    });
    test('zonder markering: niet binnen; erna wel, alleen voor die code', () => {
        expect(heeftPrikkelMarkering('ABC123')).toBe(false);
        zetPrikkelMarkering('ABC123');
        expect(heeftPrikkelMarkering('ABC123')).toBe(true);
        expect(heeftPrikkelMarkering('XYZ999')).toBe(false);
        expect(window.localStorage.getItem('tof_prikkel_ABC123')).toBe('1');
    });
    test('lege code: niets zetten, niets lezen', () => {
        zetPrikkelMarkering('');
        expect(window.localStorage.length).toBe(0);
        expect(heeftPrikkelMarkering('')).toBe(false);
    });
});
