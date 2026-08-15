/**
 * Generador — ida y vuelta contra los validadores.
 *
 * Lo que se prueba no es que el generador produzca un valor concreto (usa Math.random),
 * sino la invariante: todo lo que sale de aquí pasa la validación, y el RFC y la CURP
 * de una misma persona cuentan la misma historia.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
    buildRfcFisica, buildRfcMoral, buildCurp, buildClabe, buildNss,
    generatePerson, generateCompany,
    validateRfc, validateCurp, validateClabe, validateNss,
    CURP_STATES, CLABE_BANKS,
} from '../dist/index.js';

const persona = (over = {}) => ({
    nombre: 'JUAN',
    apellidoPaterno: 'GARCIA',
    apellidoMaterno: 'LOPEZ',
    fechaNacimiento: '1985-06-15',
    sexo: 'H',
    entidad: 'DF',
    ...over,
});

describe('generatePerson — 500 iteraciones', () => {
    const gente = Array.from({ length: 500 }, () => generatePerson());

    it('todos los RFC generados validan', () => {
        const malos = gente.filter((p) => !validateRfc(p.rfc).valid);
        assert.deepEqual(malos.map((p) => p.rfc), []);
    });

    it('todas las CURP generadas validan', () => {
        const malas = gente.filter((p) => !validateCurp(p.curp).valid);
        assert.deepEqual(malas.map((p) => p.curp), []);
    });

    it('todas las CLABE generadas validan y tienen banco real', () => {
        const malas = gente.filter((p) => !validateClabe(p.clabe).valid || !validateClabe(p.clabe).bankName);
        assert.deepEqual(malas.map((p) => p.clabe), []);
    });

    it('todos los NSS generados validan', () => {
        const malos = gente.filter((p) => !validateNss(p.nss).valid);
        assert.deepEqual(malos.map((p) => p.nss), []);
    });

    it('el RFC y la CURP comparten iniciales y fecha', () => {
        const desajustes = gente.filter((p) => p.rfc.slice(0, 10) !== p.curp.slice(0, 10));
        assert.deepEqual(desajustes.map((p) => `${p.rfc} vs ${p.curp}`), []);
    });

    it('la entidad y el banco vienen de los catálogos', () => {
        for (const p of gente) {
            assert.equal(CURP_STATES[p.entidad], p.entidadNombre);
            assert.ok(Object.values(CLABE_BANKS).includes(p.banco));
        }
    });

    it('la CURP codifica el sexo declarado', () => {
        for (const p of gente) assert.equal(p.curp[10], p.sexo);
    });
});

describe('generateCompany — 200 iteraciones', () => {
    it('todos los RFC son morales y validan', () => {
        const malos = [];
        for (let i = 0; i < 200; i++) {
            const c = generateCompany();
            const r = validateRfc(c.rfc);
            if (!r.valid || r.kind !== 'moral') malos.push(`${c.rfc} ${JSON.stringify(r.errors)}`);
        }
        assert.deepEqual(malos, []);
    });
});

describe('buildRfcFisica / buildCurp — nombres que rompen las reglas ingenuas', () => {
    const casos = [
        ['Ñ en el apellido', persona({ apellidoPaterno: 'MUÑOZ' })],
        ['Ñ en el nombre', persona({ nombre: 'IÑIGO' })],
        ['acentos', persona({ apellidoPaterno: 'HERNÁNDEZ', apellidoMaterno: 'PÉREZ', nombre: 'JOSÉ ANTONIO' })],
        ['partículas «de la»', persona({ apellidoPaterno: 'DE LA CRUZ' })],
        ['partícula «del»', persona({ apellidoPaterno: 'DEL VALLE', apellidoMaterno: 'DE LOS SANTOS' })],
        ['nombre compuesto con José', persona({ nombre: 'JOSE LUIS' })],
        ['nombre compuesto con María', persona({ nombre: 'MARIA GUADALUPE', sexo: 'M' })],
        ['apellido materno ausente', persona({ apellidoMaterno: '' })],
        ['apellido de una sola sílaba sin vocal interna', persona({ apellidoPaterno: 'NG' })],
        ['nacido después del 2000', persona({ fechaNacimiento: '2010-01-05' })],
        ['minúsculas', persona({ nombre: 'juan', apellidoPaterno: 'garcia', apellidoMaterno: 'lopez' })],
    ];

    for (const [etiqueta, p] of casos) {
        it(`${etiqueta} → RFC válido`, () => {
            const rfc = buildRfcFisica(p);
            const r = validateRfc(rfc);
            assert.equal(r.valid, true, `${rfc}: ${JSON.stringify(r.errors)}`);
            assert.equal(r.kind, 'fisica');
        });

        it(`${etiqueta} → CURP válida`, () => {
            const curp = buildCurp(p);
            const r = validateCurp(curp);
            assert.equal(r.valid, true, `${curp}: ${JSON.stringify(r.errors)}`);
        });
    }

    it('sustituye por «X» las iniciales altisonantes', () => {
        // PUENTES + TORRES + OSCAR daría «PUTO»; RENAPO obliga a «PXTO».
        const p = persona({ apellidoPaterno: 'PUENTES', apellidoMaterno: 'TORRES', nombre: 'OSCAR' });
        assert.equal(buildRfcFisica(p).slice(0, 4), 'PXTO');
        assert.equal(buildCurp(p).slice(0, 4), 'PXTO');
        assert.equal(validateRfc(buildRfcFisica(p)).valid, true);
    });

    it('la fecha embebida es la que se pidió', () => {
        const rfc = buildRfcFisica(persona({ fechaNacimiento: '1985-06-15' }));
        assert.equal(validateRfc(rfc).birthDate, '1985-06-15');
        assert.equal(validateCurp(buildCurp(persona({ fechaNacimiento: '1985-06-15' }))).birthDate, '1985-06-15');
    });

    it('respeta la entidad pedida', () => {
        assert.equal(validateCurp(buildCurp(persona({ entidad: 'JC' }))).stateName, 'Jalisco');
    });
});

describe('buildRfcMoral — razones sociales de cualquier largo', () => {
    const casos = [
        ['una palabra', 'CONSTRUCTORA', 'CON'],
        ['dos palabras', 'GRUPO MODELO', 'GRM'],
        ['tres palabras', 'SERVICIOS INTEGRALES MEXICANOS', 'SIM'],
        ['con partículas que no cuentan', 'CONSTRUCTORA DE LA PAZ', 'COP'],
        ['con acentos', 'TECNOLOGÍAS ÁGILES', 'TEA'],
        ['vacía', '', 'XXX'],
    ];

    for (const [etiqueta, razon, esperado] of casos) {
        it(`${etiqueta} → «${esperado}» y RFC moral válido`, () => {
            const rfc = buildRfcMoral(razon, '2015-03-20');
            assert.equal(rfc.slice(0, 3), esperado);
            const r = validateRfc(rfc);
            assert.equal(r.valid, true, `${rfc}: ${JSON.stringify(r.errors)}`);
            assert.equal(r.kind, 'moral');
            assert.equal(r.birthDate, '2015-03-20');
        });
    }
});

describe('buildClabe / buildNss', () => {
    it('respeta el banco pedido', () => {
        const clabe = buildClabe('012');
        assert.equal(validateClabe(clabe).bankName, 'BBVA México');
    });

    it('genera 100 CLABE válidas sin banco pedido', () => {
        for (let i = 0; i < 100; i++) assert.equal(validateClabe(buildClabe()).valid, true);
    });

    it('el NSS codifica el año de nacimiento y valida', () => {
        for (const year of [1960, 1985, 1999, 2000, 2005]) {
            const nss = buildNss(year);
            const r = validateNss(nss);
            assert.equal(r.valid, true, `${nss}: ${JSON.stringify(r.errors)}`);
            assert.equal(r.parts.anioNacimiento, String(year % 100).padStart(2, '0'));
        }
    });
});
