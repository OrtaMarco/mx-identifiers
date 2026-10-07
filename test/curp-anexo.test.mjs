/**
 * CURP — casos tomados del Instructivo Normativo de RENAPO (marzo 2006):
 * Anexo 2 (palabras inconvenientes), criterios de excepción y Anexo 4 (entidades).
 * http://www.ordenjuridico.gob.mx/Federal/PE/APF/APC/SEGOB/Instructivos/InstructivoNormativo.pdf
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { buildCurp, validateCurp, INCONVENIENT_WORDS, CURP_STATES } from '../dist/index.js';

const persona = (over = {}) => ({
    nombre: 'JUAN',
    apellidoPaterno: 'GARCIA',
    apellidoMaterno: 'LOPEZ',
    fechaNacimiento: '1985-06-15',
    sexo: 'H',
    entidad: 'DF',
    ...over,
});

describe('Anexo 2 — palabras inconvenientes', () => {
    it('son las 81 del anexo, con JETA incluida', () => {
        assert.equal(INCONVENIENT_WORDS.size, 81);
        assert.ok(INCONVENIENT_WORDS.has('JETA'));
    });

    it('JETA se sustituye por JXTA', () => {
        const curp = buildCurp(persona({ apellidoPaterno: 'JEREZ', apellidoMaterno: 'TORRES', nombre: 'ANA', sexo: 'M' }));
        assert.equal(curp.slice(0, 4), 'JXTA');
        assert.equal(validateCurp(curp).valid, true);
    });

    it('el validador rechaza una CURP que empieza por JETA', () => {
        assert.ok(validateCurp('JETA850615HDFRRN09').errors.includes('inconvenient'));
    });

    it('ejemplo del instructivo: OFELIA PEDRERO DOMINGUEZ → PXDO', () => {
        const curp = buildCurp(persona({ nombre: 'OFELIA', apellidoPaterno: 'PEDRERO', apellidoMaterno: 'DOMINGUEZ', sexo: 'M' }));
        assert.equal(curp.slice(0, 4), 'PXDO');
    });
});

describe('Criterios de excepción del instructivo', () => {
    it('MARIA LUISA PEREZ HERNANDEZ → PEHL; consonante interna del nombre: la de LUISA', () => {
        const curp = buildCurp(persona({ nombre: 'MARIA LUISA', apellidoPaterno: 'PEREZ', apellidoMaterno: 'HERNANDEZ', sexo: 'M' }));
        assert.equal(curp.slice(0, 4), 'PEHL');
        assert.equal(curp[15], 'S');
    });

    it('LUIS ENRIQUE ROMERO PALAZUELOS → ROPL', () => {
        assert.equal(buildCurp(persona({ nombre: 'LUIS ENRIQUE', apellidoPaterno: 'ROMERO', apellidoMaterno: 'PALAZUELOS' })).slice(0, 4), 'ROPL');
    });

    it('CARLOS MC GREGOR LOPEZ → GELC (el apellido empieza por partícula)', () => {
        assert.equal(buildCurp(persona({ nombre: 'CARLOS', apellidoPaterno: 'MC GREGOR', apellidoMaterno: 'LOPEZ' })).slice(0, 4), 'GELC');
    });

    it('ROCIO RIVA PALACIO CRUZ → RICR (apellido compuesto: primera palabra)', () => {
        assert.equal(buildCurp(persona({ nombre: 'ROCIO', apellidoPaterno: 'RIVA PALACIO', apellidoMaterno: 'CRUZ', sexo: 'M' })).slice(0, 4), 'RICR');
    });

    it('ALBERTO ÑANDO RODRIGUEZ → XARA… la Ñ inicial pasa a X', () => {
        // El instructivo escribe «XARA» para PATERNO=ÑANDO, MATERNO=RODRIGUEZ, NOMBRE=ALBERTO.
        assert.equal(buildCurp(persona({ nombre: 'ALBERTO', apellidoPaterno: 'ÑANDO', apellidoMaterno: 'RODRIGUEZ' })).slice(0, 4), 'XARA');
    });

    it('ALBERTO OÑATE RODRIGUEZ → consonante interna X (la Ñ no cuenta como consonante)', () => {
        assert.equal(buildCurp(persona({ nombre: 'ALBERTO', apellidoPaterno: 'OÑATE', apellidoMaterno: 'RODRIGUEZ' }))[13], 'X');
    });

    it('ANDRES ICH RODRIGUEZ → IXRA (sin vocal interna en el primer apellido)', () => {
        assert.equal(buildCurp(persona({ nombre: 'ANDRES', apellidoPaterno: 'ICH', apellidoMaterno: 'RODRIGUEZ' })).slice(0, 4), 'IXRA');
    });

    it('LUIS PEREZ (sin materno) → PEXL y X en la posición 15', () => {
        const curp = buildCurp(persona({ nombre: 'LUIS', apellidoPaterno: 'PEREZ', apellidoMaterno: '' }));
        assert.equal(curp.slice(0, 4), 'PEXL');
        assert.equal(curp[14], 'X');
    });

    it('ANDRES PO BARRIOS → consonantes XRN (sin consonante interna en el apellido)', () => {
        assert.equal(buildCurp(persona({ nombre: 'ANDRES', apellidoPaterno: 'PO', apellidoMaterno: 'BARRIOS' })).slice(13, 16), 'XRN');
    });

    it('LETICIA LUNA (sin materno) → NXT', () => {
        assert.equal(buildCurp(persona({ nombre: 'LETICIA', apellidoPaterno: 'LUNA', apellidoMaterno: '', sexo: 'M' })).slice(13, 16), 'NXT');
    });

    it('«DER», «DD», «EL», «LE» y «LES» se omiten como partículas', () => {
        for (const part of ['DER', 'DD', 'EL', 'LE', 'LES']) {
            const curp = buildCurp(persona({ apellidoPaterno: `${part} BLANC` }));
            assert.equal(curp.slice(0, 2), 'BA', part);
        }
    });
});

describe('Anexo 4 — entidades', () => {
    const oficial = {
        AS: 'Aguascalientes', BC: 'Baja California', BS: 'Baja California Sur', CC: 'Campeche',
        CL: 'Coahuila', CM: 'Colima', CS: 'Chiapas', CH: 'Chihuahua', DF: 'Ciudad de México',
        DG: 'Durango', GT: 'Guanajuato', GR: 'Guerrero', HG: 'Hidalgo', JC: 'Jalisco', MC: 'México',
        MN: 'Michoacán', MS: 'Morelos', NT: 'Nayarit', NL: 'Nuevo León', OC: 'Oaxaca', PL: 'Puebla',
        QT: 'Querétaro', QR: 'Quintana Roo', SP: 'San Luis Potosí', SL: 'Sinaloa', SR: 'Sonora',
        TC: 'Tabasco', TS: 'Tamaulipas', TL: 'Tlaxcala', VZ: 'Veracruz', YN: 'Yucatán', ZS: 'Zacatecas',
    };

    it('las 32 claves del anexo y NE están en el catálogo', () => {
        for (const k of Object.keys(oficial)) assert.ok(CURP_STATES[k], k);
        assert.equal(Object.keys(CURP_STATES).length, 33);
        assert.ok(CURP_STATES.NE);
    });
});
