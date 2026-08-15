/**
 * CURP — vector público de python-stdnum (BOXW310820HNERXN09).
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { validateCurp, curpCheckDigit, normalizeCurp, CURP_STATES } from '../dist/index.js';

describe('curpCheckDigit', () => {
    it('calcula el vector de python-stdnum (suma 2551 → resto 1 → 10-1 = 9)', () => {
        assert.equal(curpCheckDigit('BOXW310820HNERXN0'), '9');
    });

    it('devuelve «?» ante un carácter fuera del alfabeto', () => {
        assert.equal(curpCheckDigit('BOXW310820HNERXN*'), '?');
    });
});

describe('normalizeCurp', () => {
    it('pasa a mayúsculas y quita separadores', () => {
        assert.equal(normalizeCurp('boxw-310820 hnerxn09'), 'BOXW310820HNERXN09');
    });
});

describe('validateCurp', () => {
    it('acepta el vector y lo descompone', () => {
        const r = validateCurp('BOXW310820HNERXN09');
        assert.equal(r.valid, true);
        assert.equal(r.birthDate, '1931-08-20');
        assert.equal(r.sexLabel, 'H');
        assert.equal(r.stateName, 'Nacido en el extranjero');
        assert.deepEqual(r.errors, []);
    });

    it('rechaza el dígito verificador alterado', () => {
        const r = validateCurp('BOXW310820HNERXN08');
        assert.equal(r.valid, false);
        assert.ok(r.errors.includes('checksum'));
        assert.equal(r.expectedCheckDigit, '9');
    });

    it('rechaza una entidad que no está en el catálogo', () => {
        assert.ok(validateCurp('BOXW310820HZZRXN09').errors.includes('state'));
    });

    it('rechaza longitudes distintas de 18', () => {
        assert.ok(validateCurp('BOXW310820').errors.includes('length'));
    });

    it('rechaza la cadena vacía', () => {
        assert.ok(validateCurp('').errors.includes('empty'));
    });
});

describe('validateCurp — siglo codificado en la homoclave', () => {
    // La posición 17 resuelve la ambigüedad del año de dos cifras sin heurísticas:
    // dígito = siglo XX, letra = siglo XXI.
    it('lee un dígito como nacimiento anterior al 2000', () => {
        const base = 'MAAL050315HDFRPS0';
        assert.equal(validateCurp(base + curpCheckDigit(base)).birthDate, '1905-03-15');
    });

    it('lee una letra como nacimiento posterior al 2000', () => {
        const base = 'MAAL050315HDFRPSA';
        assert.equal(validateCurp(base + curpCheckDigit(base)).birthDate, '2005-03-15');
    });
});

describe('CURP_STATES', () => {
    it('cubre las 32 entidades más la clave de extranjero', () => {
        assert.equal(Object.keys(CURP_STATES).length, 33);
        assert.equal(CURP_STATES.DF, 'Ciudad de México');
        assert.equal(CURP_STATES.NE, 'Nacido en el extranjero');
    });
});
