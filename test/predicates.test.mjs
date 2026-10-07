import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { isRfc, isCurp, isClabe, isNss, buildClabe, buildNss } from '../dist/index.js';

describe('isRfc / isCurp / isClabe / isNss', () => {
    it('true con valores válidos', () => {
        assert.equal(isRfc('GODE561231GR8'), true);
        assert.equal(isRfc('XAXX010101000'), true);
        assert.equal(isCurp('BOXW310820HNERXN09'), true);
        assert.equal(isClabe(buildClabe()), true);
        assert.equal(isNss(buildNss(1985)), true);
    });

    it('false con valores inválidos', () => {
        assert.equal(isRfc('GODE561231GR9'), false);
        assert.equal(isCurp('BOXW310820HNERXN00'), false);
        assert.equal(isClabe('123'), false);
        assert.equal(isNss('123'), false);
    });

    it('false, sin lanzar, con lo que no es cadena', () => {
        for (const fn of [isRfc, isCurp, isClabe, isNss]) {
            for (const v of [undefined, null, 123, {}, []]) assert.equal(fn(v), false);
        }
    });
});
