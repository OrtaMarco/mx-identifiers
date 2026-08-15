/**
 * El paquete tal y como lo recibe quien lo instala.
 *
 * Este archivo es CommonJS a propósito: comprueba que `require('mx-identifiers')`
 * funciona y expone lo mismo que el `import`. Un build dual que sólo se prueba por
 * el lado ESM deja fuera a la mitad de los consumidores.
 */

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');

const cjs = require('../dist/index.cjs');
const root = path.join(__dirname, '..');

const API = [
    'validateRfc', 'rfcCheckDigit', 'normalizeRfc', 'GENERIC_RFCS',
    'validateCurp', 'curpCheckDigit', 'normalizeCurp',
    'validateClabe', 'clabeCheckDigit', 'normalizeClabe', 'formatClabe',
    'validateNss', 'nssCheckDigit', 'normalizeNss',
    'buildRfcFisica', 'buildRfcMoral', 'buildCurp', 'buildClabe', 'buildNss',
    'generatePerson', 'generateCompany',
    'CURP_STATES', 'CLABE_BANKS', 'INCONVENIENT_WORDS',
    'CFDI_REGIMEN', 'CFDI_USO', 'CFDI_TIPO', 'CFDI_METODO_PAGO',
    'CFDI_FORMA_PAGO', 'CFDI_OBJETO_IMP', 'CFDI_IMPUESTOS',
];

describe('require() — build CommonJS', () => {
    it('expone toda la API pública', () => {
        const faltan = API.filter((name) => !(name in cjs));
        assert.deepEqual(faltan, []);
    });

    it('valida los vectores canónicos igual que el build ESM', () => {
        assert.equal(cjs.validateRfc('GODE561231GR8').valid, true);
        assert.equal(cjs.validateCurp('BOXW310820HNERXN09').valid, true);
        assert.equal(cjs.validateClabe('032180000118359719').valid, true);
        assert.equal(cjs.validateNss('01234567897').valid, true);
    });

    it('genera datos que pasan su propia validación', () => {
        const p = cjs.generatePerson();
        assert.equal(cjs.validateRfc(p.rfc).valid, true);
        assert.equal(cjs.validateCurp(p.curp).valid, true);
    });
});

describe('import — build ESM', () => {
    it('expone exactamente la misma superficie que require()', async () => {
        const esm = await import('../dist/index.js');
        const faltan = API.filter((name) => !(name in esm));
        assert.deepEqual(faltan, []);

        // Nada de más por un lado que falte por el otro (salvo el `default` que
        // esbuild añade al interop de CJS).
        const soloEsm = Object.keys(esm).filter((k) => !(k in cjs));
        const soloCjs = Object.keys(cjs).filter((k) => !(k in esm) && k !== 'default' && k !== '__esModule');
        assert.deepEqual(soloEsm, []);
        assert.deepEqual(soloCjs, []);
    });
});

describe('artefactos publicados', () => {
    const pkg = require('../package.json');

    it('existen los archivos que declara package.json', () => {
        for (const rel of [pkg.main, pkg.module, pkg.types, './dist/index.d.cts']) {
            assert.ok(fs.existsSync(path.join(root, rel)), `falta ${rel}`);
        }
    });

    it('los exports condicionales apuntan a archivos reales', () => {
        for (const target of Object.values(pkg.exports['.'])) {
            assert.ok(fs.existsSync(path.join(root, target)), `falta ${target}`);
        }
    });

    it('no arrastra dependencias de runtime', () => {
        assert.equal(pkg.dependencies, undefined);
    });

    it('los tipos declaran la API pública', () => {
        const dts = fs.readFileSync(path.join(root, 'dist/index.d.ts'), 'utf8');
        for (const name of API) {
            assert.ok(dts.includes(name), `el .d.ts no menciona ${name}`);
        }
    });
});
