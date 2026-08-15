/**
 * Validar identificadores y explicar por qué fallan.
 *
 *   node examples/validate.mjs
 *   node examples/validate.mjs GODE561231GR8 XAXX010101000
 *
 * Lo interesante no es el `valid`, es el `errors`: son códigos estables que puedes
 * traducir a tu copy. Aquí se traducen al español a modo de ejemplo.
 */

import {
    validateRfc, validateCurp, validateClabe, validateNss,
} from 'mx-identifiers';

const MENSAJES = {
    empty: 'no hay nada que validar',
    length: 'la longitud no es la que corresponde',
    shape: 'la estructura no encaja con el patrón',
    digits: 'hay caracteres que no son dígitos',
    date: 'la fecha embebida no existe en el calendario',
    state: 'la entidad no está en el catálogo oficial',
    inconvenient: 'las iniciales forman una palabra que RENAPO no permite',
    checksum: 'el dígito verificador no coincide',
};

/** Adivina qué es cada cadena por su forma, para no pedirle el tipo a quien la escribe. */
function validar(entrada) {
    const limpio = entrada.toUpperCase().replace(/[\s\-_.]/g, '');
    if (/^[0-9]{18}$/.test(limpio)) return ['CLABE', validateClabe(entrada)];
    if (/^[0-9]{11}$/.test(limpio)) return ['NSS', validateNss(entrada)];
    if (limpio.length === 18) return ['CURP', validateCurp(entrada)];
    return ['RFC', validateRfc(entrada)];
}

const ENTRADAS = process.argv.slice(2).length
    ? process.argv.slice(2)
    : [
        'GODE561231GR8',        // RFC de persona física (vector del SAT)
        'MAB9307148T4',         // RFC de persona moral
        'XAXX010101000',        // genérico: sólo vale porque está en la allowlist
        'VACE460910SX6',        // dígito verificador incorrecto
        'GODE560231GR8',        // 31 de febrero
        'BOXW310820HNERXN09',   // CURP
        'BOXW310820HZZRXN09',   // CURP con entidad inexistente
        '032180000118359719',   // CLABE
        '032180000118359718',   // CLABE con el dígito alterado
        '01234567897',          // NSS
    ];

for (const entrada of ENTRADAS) {
    const [tipo, r] = validar(entrada);
    const marca = r.valid ? '✓' : '✗';
    const detalle = [];

    if (r.kind === 'generico') detalle.push(r.genericNote);
    if (r.birthDate) detalle.push(`fecha ${r.birthDate}`);
    if (r.stateName) detalle.push(r.stateName);
    if (r.bankName) detalle.push(r.bankName);
    // Un código fuera del catálogo no invalida la CLABE: se dice que no se reconoce
    // en vez de inventarle un nombre.
    else if (tipo === 'CLABE' && r.valid) detalle.push('banco no identificado');
    if (!r.valid) {
        detalle.push(r.errors.map((e) => MENSAJES[e] ?? e).join('; '));
        if (r.errors.includes('checksum') && r.expectedCheckDigit) {
            detalle.push(`esperaba «${r.expectedCheckDigit}»`);
        }
    }

    console.log(`${marca} ${tipo.padEnd(5)} ${entrada.padEnd(20)} ${detalle.join(' · ')}`.trimEnd());
}
