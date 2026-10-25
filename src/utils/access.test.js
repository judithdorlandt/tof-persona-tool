import { namesByPersona } from './access';

// Namenregel (K2, 25 okt 2026): namen alleen als iedereen een naam heeft, of
// als de mensen zonder naam samen minstens vijf zijn.

const PERSONAS = ['maker', 'groeier', 'denker', 'verbinder'];

function team(total, named) {
    return Array.from({ length: total }, (_, i) => ({
        primary_archetype: PERSONAS[i % PERSONAS.length],
        name: i < named ? `Naam${i + 1}` : '',
    }));
}

describe('namesByPersona — namenregel', () => {
    test('8 profielen, 8 met naam: namen zichtbaar', () => {
        const result = namesByPersona(team(8, 8));
        expect(result).not.toBeNull();
        const names = Object.values(result).flatMap((e) => e.names);
        expect(names).toHaveLength(8);
    });

    test('8 profielen, 7 met naam: geen namen', () => {
        expect(namesByPersona(team(8, 7))).toBeNull();
    });

    test('12 profielen, 7 met naam: namen zichtbaar (5 zonder naam)', () => {
        const result = namesByPersona(team(12, 7));
        expect(result).not.toBeNull();
        const unnamed = Object.values(result).reduce((sum, e) => sum + e.unnamed, 0);
        expect(unnamed).toBe(5);
    });

    test('12 profielen, 8 met naam: geen namen (maar 4 zonder naam)', () => {
        expect(namesByPersona(team(12, 8))).toBeNull();
    });

    test('alleen spaties telt als geen naam', () => {
        const rows = team(8, 8);
        rows[0].name = '   ';
        expect(namesByPersona(rows)).toBeNull();
    });

    test('schakelaar uit (geen enkele naam): geen namen', () => {
        expect(namesByPersona(team(8, 0))).toBeNull();
    });
});
