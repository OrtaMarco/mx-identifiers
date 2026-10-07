/**
 * CLABE_BANKS — entradas respaldadas por el listado de instituciones de Banxico,
 * consultado el 2026-10-06: https://www.banxico.org.mx/cep-scl-beta/listaInstituciones.do
 * (la CLABE usa las tres últimas cifras de la clave de cinco: 40128 → 128).
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { CLABE_BANKS, validateClabe, buildClabe } from '../dist/index.js';

describe('CLABE_BANKS — revisión del 2026-10-06', () => {
    const esperados = {
        '124': 'Citi México', '126': 'Credit Suisse', '128': 'Kapital', '138': 'Uala',
        '147': 'Bankaool', '148': 'Pagatodo', '150': 'Inmobiliario', '151': 'Donde',
        '152': 'Bancrea', '154': 'Banco Covalto', '155': 'ICBC', '156': 'Sabadell',
        '157': 'Shinhan', '158': 'Mizuho Bank', '159': 'Bank of China', '160': 'Banco S3',
        '169': 'Openbank', '170': 'Revolut', '171': 'Banco Plata',
        '708': 'Stori', '721': 'albo', '730': 'Clip',
    };

    for (const [codigo, nombre] of Object.entries(esperados)) {
        it(`${codigo} → ${nombre}`, () => {
            assert.equal(CLABE_BANKS[codigo], nombre);
            assert.equal(validateClabe(buildClabe(codigo)).bankName, nombre);
        });
    }

    it('el 128 ya no es Autofin: el listado lo da a Kapital', () => {
        assert.notEqual(CLABE_BANKS['128'], 'Autofin');
    });
});
