/**
 * NSS — dígito verificador Luhn sobre los diez primeros dígitos.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { validateNss, nssCheckDigit, normalizeNss } from '../dist/index.js';

describe('nssCheckDigit', () => {
    it('0123456789 → 0+2+2+6+4+1+6+5+8+9 = 43, (10 - 43%10) % 10 = 7', () => {
        assert.equal(nssCheckDigit('0123456789'), '7');
    });

    it('resta 9 cuando el duplicado pasa de 9', () => {
        // Posición 1 (peso doble): 9*2 = 18 → 1+8 = 9. Suma total 9 → 10-9 = 1.
        assert.equal(nssCheckDigit('0900000000'), '1');
    });

    it('devuelve «?» si hay algo que no es dígito', () => {
        assert.equal(nssCheckDigit('01234X6789'), '?');
    });
});

describe('validateNss', () => {
    it('acepta un NSS correcto y lo descompone', () => {
        const r = validateNss('01234567897');
        assert.equal(r.valid, true);
        assert.deepEqual(r.parts, {
            subdelegacion: '01', anioAlta: '23', anioNacimiento: '45', folio: '6789', digito: '7',
        });
    });

    it('rechaza el dígito verificador incorrecto', () => {
        const r = validateNss('01234567890');
        assert.equal(r.valid, false);
        assert.ok(r.errors.includes('checksum'));
        assert.equal(r.expectedCheckDigit, '7');
    });

    it('rechaza longitudes distintas de 11', () => {
        assert.ok(validateNss('0123456789').errors.includes('length'));
    });

    it('rechaza caracteres no numéricos', () => {
        assert.ok(validateNss('0123456789X').errors.includes('digits'));
    });

    it('rechaza la cadena vacía', () => {
        assert.ok(validateNss('').errors.includes('empty'));
    });

    it('normaliza espacios y guiones', () => {
        assert.equal(normalizeNss('01-23 45 6789-7'), '01234567897');
        assert.equal(validateNss('01 2345 6789 7').valid, true);
    });
});
