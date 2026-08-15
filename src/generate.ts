/**
 * Generación de identificadores mexicanos ESTRUCTURALMENTE VÁLIDOS para pruebas.
 *
 * Importante: los datos que salen de aquí no corresponden a ninguna persona real ni
 * a ningún registro del SAT, RENAPO, IMSS o Banxico. Lo que sí garantizan es pasar
 * cualquier validación de formato y de dígito verificador, que es justo lo que hace
 * falta para poblar entornos de desarrollo y suites de tests.
 *
 * La homoclave del RFC y las tres consonantes de la CURP se derivan del nombre con
 * las reglas públicas; los caracteres que el SAT asigna con su propio algoritmo
 * interno se generan al azar y después se recalcula el dígito verificador, de modo
 * que el resultado es consistente aunque no sea el RFC que emitiría el SAT.
 */

import { CURP_STATES, INCONVENIENT_WORDS, CLABE_BANKS } from './catalogs';
import { rfcCheckDigit } from './rfc';
import { curpCheckDigit } from './curp';
import { clabeCheckDigit } from './clabe';
import { nssCheckDigit } from './nss';

const NOMBRES_H = ['JOSE', 'LUIS', 'CARLOS', 'MIGUEL', 'DIEGO', 'JAVIER', 'ANDRES', 'PABLO', 'SERGIO', 'HUGO', 'IVAN', 'RICARDO', 'ALEJANDRO', 'FERNANDO', 'RAUL', 'ARTURO'];
const NOMBRES_M = ['MARIA', 'ANA', 'SOFIA', 'LUCIA', 'ELENA', 'MARTA', 'LAURA', 'VALERIA', 'DANIELA', 'CARMEN', 'PAULA', 'ADRIANA', 'PATRICIA', 'GABRIELA', 'ROSA', 'BEATRIZ'];
const APELLIDOS = ['GARCIA', 'MARTINEZ', 'LOPEZ', 'HERNANDEZ', 'GONZALEZ', 'PEREZ', 'RODRIGUEZ', 'SANCHEZ', 'RAMIREZ', 'TORRES', 'FLORES', 'RIVERA', 'GOMEZ', 'DIAZ', 'CRUZ', 'MORALES', 'ORTIZ', 'REYES', 'CASTRO', 'ROMERO', 'VAZQUEZ', 'JIMENEZ', 'MENDOZA', 'AGUILAR'];
const RAZON_SOCIAL = ['CONSTRUCTORA', 'DISTRIBUIDORA', 'SERVICIOS', 'COMERCIALIZADORA', 'INMOBILIARIA', 'TECNOLOGIAS', 'CONSULTORES', 'TRANSPORTES', 'ALIMENTOS', 'INDUSTRIAS', 'LOGISTICA', 'SOLUCIONES'];
const RAZON_SUFIJO = ['DEL BAJIO', 'DEL NORTE', 'MEXICANA', 'NACIONAL', 'DEL PACIFICO', 'INTEGRAL', 'GLOBAL', 'DEL CENTRO'];

const VOWELS = 'AEIOU';
const CONSONANTS = 'BCDFGHJKLMNPQRSTVWXYZ';
const HOMOCLAVE_CHARS = '0123456789ABCDEFGHIJKLMNPQRSTUVWXYZ';

/** Partículas que las reglas del SAT y de RENAPO ignoran al formar la clave. */
const PARTICLES = new Set(['DE', 'DEL', 'LA', 'LAS', 'LOS', 'Y', 'MC', 'MAC', 'VAN', 'VON', 'DA', 'DAS', 'DI', 'DIE']);

const ri = (a: number, b: number) => Math.floor(Math.random() * (b - a + 1)) + a;
const choice = <T,>(arr: readonly T[]): T => arr[Math.floor(Math.random() * arr.length)];

/** Quita acentos, pasa Ñ a X y descarta partículas y caracteres no alfabéticos. */
function cleanWord(word: string): string {
    const stripped = word
        .toUpperCase()
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .replace(/Ñ/g, 'X')
        .replace(/[^A-Z ]/g, '');
    const parts = stripped.split(/\s+/).filter((p) => p && !PARTICLES.has(p));
    return parts.join(' ') || stripped.replace(/\s+/g, '');
}

/** Primera vocal después de la letra inicial; «X» si la palabra no tiene ninguna. */
function firstInternalVowel(word: string): string {
    for (let i = 1; i < word.length; i++) {
        if (VOWELS.includes(word[i])) return word[i];
    }
    return 'X';
}

/** Primera consonante después de la letra inicial; «X» si no hay. */
function firstInternalConsonant(word: string): string {
    for (let i = 1; i < word.length; i++) {
        if (CONSONANTS.includes(word[i])) return word[i];
    }
    return 'X';
}

/**
 * Nombre de pila que cuenta para la clave: si el primero es José o María y hay más,
 * se usa el siguiente.
 */
function significantGivenName(nombre: string): string {
    const parts = cleanWord(nombre).split(' ').filter(Boolean);
    if (parts.length > 1 && (parts[0] === 'JOSE' || parts[0] === 'MARIA')) return parts[1];
    return parts[0] ?? 'X';
}

function pad(n: number, len = 2): string {
    return String(n).padStart(len, '0');
}

export interface PersonInput {
    nombre: string;
    apellidoPaterno: string;
    apellidoMaterno: string;
    /** Fecha en ISO (YYYY-MM-DD). */
    fechaNacimiento: string;
    sexo: 'H' | 'M';
    /** Clave de entidad de dos letras, p. ej. «DF». */
    entidad: string;
}

/** RFC de persona física con dígito verificador correcto. */
export function buildRfcFisica(p: PersonInput): string {
    const paterno = cleanWord(p.apellidoPaterno).split(' ')[0] || 'X';
    const materno = cleanWord(p.apellidoMaterno).split(' ')[0] || '';
    const nombre = significantGivenName(p.nombre);

    let iniciales = paterno[0] + firstInternalVowel(paterno) + (materno[0] ?? 'X') + nombre[0];
    if (INCONVENIENT_WORDS.has(iniciales)) iniciales = iniciales[0] + 'X' + iniciales.slice(2);

    const [y, m, d] = p.fechaNacimiento.split('-');
    const fecha = y.slice(2) + m + d;
    const homoclave = choice(HOMOCLAVE_CHARS.split('')) + choice(HOMOCLAVE_CHARS.split(''));
    const base = iniciales + fecha + homoclave;
    return base + rfcCheckDigit(base);
}

/** CURP de 18 caracteres con dígito verificador correcto. */
export function buildCurp(p: PersonInput): string {
    const paterno = cleanWord(p.apellidoPaterno).split(' ')[0] || 'X';
    const materno = cleanWord(p.apellidoMaterno).split(' ')[0] || '';
    const nombre = significantGivenName(p.nombre);

    let iniciales = paterno[0] + firstInternalVowel(paterno) + (materno[0] ?? 'X') + nombre[0];
    if (INCONVENIENT_WORDS.has(iniciales)) iniciales = iniciales[0] + 'X' + iniciales.slice(2);

    const [y, m, d] = p.fechaNacimiento.split('-');
    const fecha = y.slice(2) + m + d;
    const consonantes =
        firstInternalConsonant(paterno) +
        (materno ? firstInternalConsonant(materno) : 'X') +
        firstInternalConsonant(nombre);

    // Posición 17: dígito para nacidos antes de 2000, letra a partir de 2000.
    const homoclave = Number(y) < 2000 ? String(ri(0, 9)) : String.fromCharCode(65 + ri(0, 25));
    const base = iniciales + fecha + p.sexo + p.entidad + consonantes + homoclave;
    return base + curpCheckDigit(base);
}

/** RFC de persona moral (12 caracteres) a partir de una razón social. */
export function buildRfcMoral(razonSocial: string, fechaConstitucion: string): string {
    const words = cleanWord(razonSocial).split(' ').filter(Boolean);
    let iniciales = '';
    if (words.length >= 3) iniciales = words[0][0] + words[1][0] + words[2][0];
    else if (words.length === 2) iniciales = words[0].slice(0, 2) + words[1][0];
    else iniciales = (words[0] ?? 'XXX').slice(0, 3).padEnd(3, 'X');

    const [y, m, d] = fechaConstitucion.split('-');
    const fecha = y.slice(2) + m + d;
    const homoclave = choice(HOMOCLAVE_CHARS.split('')) + choice(HOMOCLAVE_CHARS.split(''));
    const base = iniciales + fecha + homoclave;
    return base + rfcCheckDigit(base);
}

/** CLABE de 18 dígitos con banco real del catálogo y dígito de control correcto. */
export function buildClabe(bankCode?: string): string {
    const banco = bankCode ?? choice(Object.keys(CLABE_BANKS));
    const plaza = pad(ri(1, 999), 3);
    const cuenta = Array.from({ length: 11 }, () => ri(0, 9)).join('');
    const base = banco + plaza + cuenta;
    return base + clabeCheckDigit(base);
}

/** NSS de 11 dígitos con verificador Luhn correcto. */
export function buildNss(birthYear: number): string {
    const subdelegacion = pad(ri(1, 97));
    const anioAlta = pad(ri(Math.max(0, (birthYear + 16) % 100), 99));
    const anioNacimiento = pad(birthYear % 100);
    const folio = pad(ri(0, 9999), 4);
    const base = subdelegacion + anioAlta + anioNacimiento + folio;
    return base + nssCheckDigit(base);
}

export interface GeneratedPerson {
    nombre: string;
    apellidoPaterno: string;
    apellidoMaterno: string;
    sexo: 'H' | 'M';
    fechaNacimiento: string;
    entidad: string;
    entidadNombre: string;
    rfc: string;
    curp: string;
    clabe: string;
    banco: string;
    nss: string;
    codigoPostal: string;
    telefono: string;
    email: string;
}

/** Una persona ficticia completa y coherente: la CURP y el RFC salen del mismo nombre y fecha. */
export function generatePerson(): GeneratedPerson {
    const sexo: 'H' | 'M' = Math.random() < 0.5 ? 'H' : 'M';
    const nombre = choice(sexo === 'H' ? NOMBRES_H : NOMBRES_M);
    const apellidoPaterno = choice(APELLIDOS);
    const apellidoMaterno = choice(APELLIDOS);
    const year = ri(1960, 2005);
    const month = ri(1, 12);
    const day = ri(1, 28);
    const fechaNacimiento = `${year}-${pad(month)}-${pad(day)}`;
    const entidad = choice(Object.keys(CURP_STATES).filter((k) => k !== 'NE'));

    const person: PersonInput = { nombre, apellidoPaterno, apellidoMaterno, fechaNacimiento, sexo, entidad };
    const bankCode = choice(Object.keys(CLABE_BANKS));

    const slug = (s: string) => s.toLowerCase().replace(/[^a-z]/g, '');

    return {
        nombre,
        apellidoPaterno,
        apellidoMaterno,
        sexo,
        fechaNacimiento,
        entidad,
        entidadNombre: CURP_STATES[entidad],
        rfc: buildRfcFisica(person),
        curp: buildCurp(person),
        clabe: buildClabe(bankCode),
        banco: CLABE_BANKS[bankCode],
        nss: buildNss(year),
        codigoPostal: pad(ri(1000, 99999), 5),
        telefono: `+52 ${ri(55, 99)} ${pad(ri(0, 9999), 4)} ${pad(ri(0, 9999), 4)}`,
        email: `${slug(nombre)}.${slug(apellidoPaterno)}@example.com`,
    };
}

export interface GeneratedCompany {
    razonSocial: string;
    rfc: string;
    clabe: string;
    banco: string;
    codigoPostal: string;
    fechaConstitucion: string;
}

/** Una empresa ficticia con RFC de persona moral coherente. */
export function generateCompany(): GeneratedCompany {
    const razonSocial = `${choice(RAZON_SOCIAL)} ${choice(RAZON_SUFIJO)} SA DE CV`;
    const year = ri(1990, 2024);
    const fechaConstitucion = `${year}-${pad(ri(1, 12))}-${pad(ri(1, 28))}`;
    const bankCode = choice(Object.keys(CLABE_BANKS));
    return {
        razonSocial,
        rfc: buildRfcMoral(razonSocial, fechaConstitucion),
        clabe: buildClabe(bankCode),
        banco: CLABE_BANKS[bankCode],
        codigoPostal: pad(ri(1000, 99999), 5),
        fechaConstitucion,
    };
}
