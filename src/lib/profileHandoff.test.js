import { decodeHandoff, encodeHandoff, handoffUrl } from './profileHandoff';

// Verzonnen uitslag; geen deelnemersdata.
const SCORES = { maker: 4, groeier: 2, presteerder: 6, denker: 12, verbinder: 3, teamspeler: 1, zekerzoeker: 5, vernieuwer: 0 };
const PROFIEL = { primary: 'denker', secondary: 'presteerder', tertiary: 'zekerzoeker', scores: SCORES };

function hashVan(payload) {
    const b64 = window.btoa(JSON.stringify(payload)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    return `#p=${b64}`;
}

describe('pk (werkomgeving) in de overdracht', () => {
    test('een oude link zonder pk werkt nog, met prikkel null', () => {
        const oud = hashVan({ v: 1, p: 'denker', s: 'presteerder', t: 'zekerzoeker', sc: SCORES });
        expect(decodeHandoff(oud)).toEqual({ ...PROFIEL, prikkel: null });
    });

    test('een profiel zonder antwoord geeft een link zonder pk', () => {
        const encoded = encodeHandoff(PROFIEL);
        const payload = JSON.parse(window.atob(encoded.replace(/-/g, '+').replace(/_/g, '/')));
        expect(payload).not.toHaveProperty('pk');
        expect(payload.v).toBe(1);
    });

    test('heen en terug met een antwoord', () => {
        const url = handoffUrl({ ...PROFIEL, prikkel: 'reuring' }, 'https://team.persona-tool.nl/', '/bijdragen');
        const hash = url.slice(url.indexOf('#'));
        expect(decodeHandoff(hash)).toEqual({ ...PROFIEL, prikkel: 'reuring' });
    });

    test('een onbekende waarde gaat niet mee en wordt bij lezen null', () => {
        const encoded = encodeHandoff({ ...PROFIEL, prikkel: 'heel hard' });
        expect(decodeHandoff(`#p=${encoded}`).prikkel).toBeNull();

        const geknoeid = hashVan({ v: 1, p: 'denker', sc: SCORES, pk: '<script>' });
        expect(decodeHandoff(geknoeid)).toEqual({ primary: 'denker', secondary: null, tertiary: null, scores: SCORES, prikkel: null });
    });

    test('een andere versie wordt nog steeds geweigerd', () => {
        expect(decodeHandoff(hashVan({ v: 2, p: 'denker', sc: SCORES, pk: 'stil' }))).toBeNull();
    });
});
