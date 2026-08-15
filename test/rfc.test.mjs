/**
 * RFC — vectores canónicos del SAT.
 *
 * Los dos primeros vectores son los que el propio SAT publica como ejemplo del
 * algoritmo; el resto cubre las ramas que el validador puede tomar.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { validateRfc, rfcCheckDigit, normalizeRfc, GENERIC_RFCS } from '../dist/index.js';

describe('rfcCheckDigit', () => {
    it('calcula el vector del SAT para persona física (suma 1026 → resto 3 → 11-3 = 8)', () => {
        assert.equal(rfcCheckDigit('GODE561231GR'), '8');
    });

    it('rellena a doce con espacios para persona moral', () => {
        assert.equal(rfcCheckDigit('MAB9307148T'), '4');
    });

    it('devuelve «?» ante un carácter fuera del alfabeto', () => {
        assert.equal(rfcCheckDigit('GODE561231G*'), '?');
    });
});

describe('normalizeRfc', () => {
    it('pasa a mayúsculas y quita separadores', () => {
        assert.equal(normalizeRfc('gode-561231 gr8'), 'GODE561231GR8');
        assert.equal(normalizeRfc('mab.930714_8t4'), 'MAB9307148T4');
    });
});

describe('validateRfc — válidos', () => {
    it('acepta el RFC de persona física del SAT', () => {
        const r = validateRfc('GODE561231GR8');
        assert.equal(r.valid, true);
        assert.equal(r.kind, 'fisica');
        assert.equal(r.birthDate, '1956-12-31');
        assert.deepEqual(r.errors, []);
        assert.deepEqual(r.parts, {
            iniciales: 'GODE', fecha: '561231', homoclave: 'GR', digito: '8',
        });
    });

    it('acepta el RFC de persona moral del SAT', () => {
        const r = validateRfc('MAB9307148T4');
        assert.equal(r.valid, true);
        assert.equal(r.kind, 'moral');
        assert.equal(r.birthDate, '1993-07-14');
    });

    it('normaliza antes de validar', () => {
        assert.equal(validateRfc('GODE 561231 GR8').normalized, 'GODE561231GR8');
        assert.equal(validateRfc('MAB-930714-8T4').valid, true);
    });
});

describe('validateRfc — genéricos del SAT', () => {
    for (const [rfc, nota] of Object.entries(GENERIC_RFCS)) {
        it(`acepta ${rfc} y explica cuál es`, () => {
            const r = validateRfc(rfc);
            assert.equal(r.valid, true);
            assert.equal(r.kind, 'generico');
            assert.equal(r.genericNote, nota);
        });
    }

    it('XAXX010101000 NO satisface el algoritmo: la allowlist es lo único que lo salva', () => {
        // Se asignó por decreto. Sin la allowlist, toda factura al público en general
        // saldría inválida —el algoritmo pide «4» donde el SAT puso «0».
        assert.equal(rfcCheckDigit('XAXX01010100'), '4');
        assert.equal(validateRfc('XAXX010101000').valid, true);
    });

    it('XEXX010101000 sí lo satisface: la allowlist sólo lo clasifica', () => {
        // Al contrario que el nacional, éste pasa el módulo 11 por sí solo (suma 1342,
        // resto 0 → «0»). Validaría igual sin la allowlist, pero como persona física y
        // sin la nota que dice qué es.
        assert.equal(rfcCheckDigit('XEXX01010100'), '0');
        assert.equal(validateRfc('XEXX010101000').kind, 'generico');
    });
});

describe('validateRfc — inválidos', () => {
    it('detecta un dígito verificador incorrecto', () => {
        const r = validateRfc('VACE460910SX6');
        assert.equal(r.valid, false);
        assert.ok(r.errors.includes('checksum'));
        assert.equal(r.expectedCheckDigit, rfcCheckDigit('VACE460910SX'));
    });

    it('detecta una fecha que no existe en el calendario', () => {
        const r = validateRfc('GODE560231GR8');
        assert.equal(r.valid, false);
        assert.ok(r.errors.includes('date'));
        assert.equal(r.birthDate, null);
    });

    it('rechaza longitudes que no son 12 ni 13', () => {
        assert.equal(validateRfc('GODE5612').valid, false);
        assert.equal(validateRfc('GODE5612').errors.includes('length'), true);
    });

    it('rechaza una forma que no encaja con el patrón', () => {
        assert.ok(validateRfc('1ODE561231GR8').errors.includes('shape'));
    });

    it('rechaza la cadena vacía', () => {
        assert.ok(validateRfc('   ').errors.includes('empty'));
    });

    it('marca las iniciales altisonantes aunque el checksum sea correcto', () => {
        // El validador no las corrige, las señala: RENAPO y el SAT sustituyen la
        // segunda letra por «X» al emitir, así que un RFC así no debería existir.
        const base = 'PUTO561231AB';
        const rfc = base + rfcCheckDigit(base);
        const r = validateRfc(rfc);
        assert.ok(r.errors.includes('inconvenient'));
        assert.equal(r.errors.includes('checksum'), false);
        assert.equal(r.valid, false);
    });
});
