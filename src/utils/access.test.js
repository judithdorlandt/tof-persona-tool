import { namesByPersona, namesVisibility } from './access';

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

describe('namesVisibility — de stand voor /admin', () => {
    // /admin krijgt geen namen, alleen has_name.
    const flagged = (total, named) => team(total, named).map((r) => ({
        primary_archetype: r.primary_archetype,
        has_name: r.name !== '',
    }));

    test('de vier voorbeelden, ook met alleen has_name', () => {
        expect(namesVisibility(flagged(8, 8)).state).toBe('visible');
        expect(namesVisibility(flagged(8, 7))).toEqual({ state: 'rule', profiles: 8, unnamed: 1 });
        expect(namesVisibility(flagged(12, 7)).state).toBe('visible');
        expect(namesVisibility(flagged(12, 8))).toEqual({ state: 'rule', profiles: 12, unnamed: 4 });
    });

    test('niemand een naam, vijf of meer profielen: none', () => {
        expect(namesVisibility(flagged(8, 0)).state).toBe('none');
    });

    test('onder vijf profielen: tooFew', () => {
        expect(namesVisibility(flagged(4, 4)).state).toBe('tooFew');
    });
});
