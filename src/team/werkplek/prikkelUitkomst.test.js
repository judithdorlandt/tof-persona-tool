import { prikkelUitkomst, isPrikkelUitkomst } from './prikkelUitkomst';

// Verzonnen verdelingen; dezelfde als CONTROLE 3 in
// supabase/011_prikkel_antwoorden.sql. 'maakt niet uit' telt niet mee en
// zit daarom niet in de invoer.
describe('prikkelUitkomst', () => {
    test('4x maakt niet uit + 1 stil: n = 1, dus geen signaal', () => {
        expect(prikkelUitkomst({ stil: 1 })).toBeNull();
    });
    test('n = 4 tegenover n = 5', () => {
        expect(prikkelUitkomst({ stil: 2, reuring: 2 })).toBeNull();
        expect(prikkelUitkomst({ stil: 3, reuring: 2 })).toBe('gemengd');
    });
    test('3 stil + 2 reuring: gemengd', () => {
        expect(prikkelUitkomst({ stil: 3, reuring: 2 })).toBe('gemengd');
    });
    test('3 stil + 2 geroezemoes: stil', () => {
        expect(prikkelUitkomst({ stil: 3, geroezemoes: 2 })).toBe('stil');
    });
    test('3 reuring + 2 geroezemoes: reuring', () => {
        expect(prikkelUitkomst({ geroezemoes: 2, reuring: 3 })).toBe('reuring');
    });
    test('1 stil + 3 geroezemoes + 1 reuring: zonder uitersten', () => {
        expect(prikkelUitkomst({ stil: 1, geroezemoes: 3, reuring: 1 })).toBe('zonder_uitersten');
    });
    test('grens 30 %: precies 30 % stil en reuring is gemengd, net eronder niet', () => {
        expect(prikkelUitkomst({ stil: 3, geroezemoes: 4, reuring: 3 })).toBe('gemengd');
        expect(prikkelUitkomst({ stil: 3, geroezemoes: 5, reuring: 3 })).toBe('zonder_uitersten');
    });
    test('grens 50 %: precies de helft stil is stil', () => {
        expect(prikkelUitkomst({ stil: 5, geroezemoes: 3, reuring: 2 })).toBe('stil');
        expect(prikkelUitkomst({ stil: 4, geroezemoes: 4, reuring: 2 })).toBe('zonder_uitersten');
    });
    test('gemengd gaat vóór stil', () => {
        // 60 % stil en 40 % reuring: beide boven 30 %, dus gemengd.
        expect(prikkelUitkomst({ stil: 6, reuring: 4 })).toBe('gemengd');
    });
    test('2 stil + 6 geroezemoes + 2 reuring: zonder uitersten', () => {
        expect(prikkelUitkomst({ stil: 2, geroezemoes: 6, reuring: 2 })).toBe('zonder_uitersten');
    });
    test('niets of geen invoer: geen signaal', () => {
        expect(prikkelUitkomst({})).toBeNull();
        expect(prikkelUitkomst()).toBeNull();
    });
});

describe('isPrikkelUitkomst', () => {
    test('alleen de vier bekende waarden', () => {
        expect(isPrikkelUitkomst('gemengd')).toBe(true);
        expect(isPrikkelUitkomst('zonder_uitersten')).toBe(true);
        expect(isPrikkelUitkomst('maakt_niet_uit')).toBe(false);
        expect(isPrikkelUitkomst(null)).toBe(false);
    });
});
