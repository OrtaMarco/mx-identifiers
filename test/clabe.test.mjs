/**
 * CLABE — algoritmo Banxico (ponderación 3-7-1).
 *
 * Los dígitos de control de abajo están calculados a mano en el comentario de cada
 * caso, para no comparar el código contra sí mismo.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { validateClabe, clabeCheckDigit, normalizeClabe, formatClabe, CLABE_BANKS } from '../dist/index.js';

describe('clabeCheckDigit', () => {
    it('032180000118359719 → productos mod 10 suman 61, (10 - 61%10) % 10 = 9', () => {
        assert.equal(clabeCheckDigit('03218000011835971'), '9');
    });

    it('002180000000000009 → 0+0+2+3+6 = 11, (10 - 11%10) % 10 = 9', () => {
        assert.equal(clabeCheckDigit('00218000000000000'), '9');
    });

    it('reduce cada producto módulo 10, no suma sus cifras como Luhn', () => {
        // Aquí es donde se equivocan las implementaciones que copian Luhn: el 9 en la
        // posición de peso 7 da 63, y de 63 se toma el módulo 10 (→ 3), no la suma de
        // sus cifras (6+3 = 9). Con el módulo el dígito sale 7; con Luhn saldría 1.
        assert.equal(clabeCheckDigit('09000000000000000'), '7');
    });

    it('devuelve «?» si hay algo que no es dígito', () => {
        assert.equal(clabeCheckDigit('0321800001183597X'), '?');
    });
});

describe('validateClabe', () => {
    it('acepta una CLABE correcta y la descompone', () => {
        const r = validateClabe('032180000118359719');
        assert.equal(r.valid, true);
        assert.deepEqual(r.parts, {
            banco: '032', plaza: '180', cuenta: '00011835971', digito: '9',
        });
    });

    it('identifica el banco por los tres primeros dígitos', () => {
        assert.equal(validateClabe('002180000000000009').bankName, 'Banamex');
    });

    it('no inventa nombre para un código fuera del catálogo', () => {
        const base = '99918000000000000';
        const r = validateClabe(base + clabeCheckDigit(base));
        assert.equal(r.bankName, null);
        assert.equal(r.valid, true); // el banco desconocido no invalida la CLABE
    });

    it('rechaza un dígito de control alterado', () => {
        assert.equal(validateClabe('032180000118359718').valid, false);
        assert.ok(validateClabe('032180000118359718').errors.includes('checksum'));
    });

    it('rechaza longitudes distintas de 18', () => {
        assert.ok(validateClabe('01218001234567890').errors.includes('length'));
    });

    it('rechaza caracteres no numéricos', () => {
        assert.ok(validateClabe('01218001234567890X').errors.includes('digits'));
    });

    it('normaliza espacios y guiones', () => {
        assert.equal(validateClabe('0321 8000 0118 3597 19').valid, true);
        assert.equal(normalizeClabe('032-180-000118359719'), '032180000118359719');
    });
});

describe('formatClabe', () => {
    it('agrupa en banco, plaza, cuenta y dígito', () => {
        assert.equal(formatClabe('032180000118359719'), '032 180 00011835971 9');
    });

    it('devuelve la entrada intacta si no mide 18', () => {
        assert.equal(formatClabe('0321800001'), '0321800001');
    });
});

describe('CLABE_BANKS', () => {
    it('todas las claves son de tres dígitos', () => {
        for (const code of Object.keys(CLABE_BANKS)) {
            assert.match(code, /^[0-9]{3}$/, `código inesperado: ${code}`);
        }
    });
});
