/**
 * Entradas hostiles: lo que no es una cadena de dígitos no debe lanzar ni dar un dígito falso.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
    validateRfc, validateCurp, validateClabe, validateNss,
    clabeCheckDigit, nssCheckDigit,
} from '../dist/index.js';

const validators = { validateRfc, validateCurp, validateClabe, validateNss };

describe('entradas que no son cadena', () => {
    for (const [name, fn] of Object.entries(validators)) {
        for (const input of [undefined, null, 123, {}, []]) {
            it(`${name}(${JSON.stringify(input)}) no lanza y devuelve inválido`, () => {
                const r = fn(input);
                assert.equal(r.valid, false);
                assert.deepEqual(r.errors, ['empty']);
            });
        }
    }
});

describe('dígito de control con base que no es sólo dígitos', () => {
    it('clabeCheckDigit devuelve «?» si hay espacios', () => {
        assert.equal(clabeCheckDigit('0 0000000000000000'), '?');
    });

    it('nssCheckDigit devuelve «?» si hay espacios', () => {
        assert.equal(nssCheckDigit('          '), '?');
    });

    it('nssCheckDigit devuelve «?» con notación exponencial o signo', () => {
        assert.equal(nssCheckDigit('+123456789'), '?');
        assert.equal(nssCheckDigit('1e12345678'), '?');
    });
});
