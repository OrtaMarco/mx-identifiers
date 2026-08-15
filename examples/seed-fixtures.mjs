/**
 * Generar fixtures para sembrar una base de datos de desarrollo.
 *
 *   node examples/seed-fixtures.mjs            # 5 personas y 2 empresas, a stdout
 *   node examples/seed-fixtures.mjs 100 20     # 100 personas y 20 empresas
 *   node examples/seed-fixtures.mjs 50 5 > seed.json
 *
 * Todo lo que sale de aquí es ficticio: pasa cualquier validación de formato y de
 * dígito verificador, pero no corresponde a ninguna persona real ni a ningún registro
 * del SAT, RENAPO, IMSS o Banxico.
 */

import {
    generatePerson, generateCompany,
    validateRfc, validateCurp, validateClabe, validateNss,
} from 'mx-identifiers';

const personas = Number(process.argv[2] ?? 5);
const empresas = Number(process.argv[3] ?? 2);

const seed = {
    _aviso: 'Datos ficticios generados con mx-identifiers. No corresponden a ninguna persona ni registro real.',
    personas: Array.from({ length: personas }, generatePerson),
    empresas: Array.from({ length: empresas }, generateCompany),
};

// Comprobación de cordura: si algo generado no valida, mejor enterarse aquí que en el
// seeder. No debería ocurrir nunca —es justo la invariante que fija la suite de tests.
const rotos = [
    ...seed.personas.flatMap((p) => [
        validateRfc(p.rfc).valid ? null : `RFC ${p.rfc}`,
        validateCurp(p.curp).valid ? null : `CURP ${p.curp}`,
        validateClabe(p.clabe).valid ? null : `CLABE ${p.clabe}`,
        validateNss(p.nss).valid ? null : `NSS ${p.nss}`,
    ]),
    ...seed.empresas.map((e) => (validateRfc(e.rfc).valid ? null : `RFC moral ${e.rfc}`)),
].filter(Boolean);

if (rotos.length) {
    console.error('Se generaron identificadores que no validan:', rotos);
    process.exit(1);
}

console.log(JSON.stringify(seed, null, 2));
