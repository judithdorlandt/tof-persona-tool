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
