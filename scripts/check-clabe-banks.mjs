#!/usr/bin/env node
/**
 * Compara CLABE_BANKS con el listado de instituciones de Banxico.
 *
 * Necesita red y el paquete compilado (`npm run build`), así que NO corre en CI.
 *   node scripts/check-clabe-banks.mjs [--strict]
 *
 * El listado trae claves de cinco cifras (40012, 90601, 37006…); la CLABE usa las tres
 * últimas. Se ignoran las filas de pruebas y las «GEM-…» (97xxx y 91xxx), que no son
 * instituciones. Sin --strict la salida es informativa; con --strict, cualquier
 * diferencia sale con código 1.
 */

import { CLABE_BANKS } from '../dist/index.js';

const URL = 'https://www.banxico.org.mx/cep-scl-beta/listaInstituciones.do';

const res = await fetch(URL);
if (!res.ok) {
    console.error(`No se pudo leer ${URL}: HTTP ${res.status}`);
    process.exit(2);
}
const html = await res.text();

const filas = [...html.matchAll(/<td>(\d{5})<\/td><td>([^<]*)<\/td>/g)].map((m) => ({ clave: m[1], nombre: m[2].trim() }));
if (filas.length === 0) {
    console.error('El listado no tiene el formato esperado (0 filas).');
    process.exit(2);
}

const esInstitucion = ({ clave, nombre }) =>
    !/^(97|91)/.test(clave) && !/prueba/i.test(nombre) && !/^(BanCobro|Banco Facil|Banco Fácil|CoDi|MEMBER)/i.test(nombre);

const banxico = new Map();
for (const f of filas.filter(esInstitucion)) banxico.set(f.clave.slice(-3), f);

const sinBanxico = Object.entries(CLABE_BANKS).filter(([codigo]) => !banxico.has(codigo));
const sinCatalogo = [...banxico].filter(([codigo]) => !(codigo in CLABE_BANKS));

console.log(`Consultado ${new Date().toISOString().slice(0, 10)}: ${filas.length} filas, ${banxico.size} instituciones, ${Object.keys(CLABE_BANKS).length} en el catálogo.`);

console.log(`\nEn el catálogo y NO en el listado (${sinBanxico.length}):`);
for (const [codigo, nombre] of sinBanxico) console.log(`  ${codigo}  ${nombre}`);

console.log(`\nEn el listado y NO en el catálogo (${sinCatalogo.length}):`);
for (const [codigo, f] of sinCatalogo) console.log(`  ${codigo}  ${f.nombre}  (${f.clave})`);

console.log('\nNombres: catálogo ↔ Banxico, para revisar a ojo los cambios de marca:');
for (const [codigo, nombre] of Object.entries(CLABE_BANKS)) {
    const f = banxico.get(codigo);
    if (f) console.log(`  ${codigo}  ${nombre}  ↔  ${f.nombre}`);
}

if (process.argv.includes('--strict') && (sinBanxico.length || sinCatalogo.length)) process.exit(1);
