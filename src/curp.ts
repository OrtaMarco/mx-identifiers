/**
 * CURP — Clave Única de Registro de Población.
 *
 * 18 caracteres; el último es un dígito verificador base-37 módulo 10.
 * Algoritmo comprobado contra el vector BOXW310820HNERXN09
 * (suma 2551 → 2551 % 10 = 1 → (10-1) % 10 = 9).
 */

import { CURP_STATES, INCONVENIENT_WORDS } from './catalogs';

/** Igual que en el RFC, el «&» ocupa el hueco 24; la CURP nunca lo usa. */
const ALPHABET = '0123456789ABCDEFGHIJKLMN&OPQRSTUVWXYZ';

const CURP_SHAPE = /^[A-Z][AEIOUX][A-Z]{2}[0-9]{6}[HMX][A-Z]{2}[B-DF-HJ-NP-TV-ZX]{3}[0-9A-Z][0-9]$/;

export interface CurpResult {
    valid: boolean;
    normalized: string;
    parts: {
        iniciales: string;
        fecha: string;
        sexo: string;
        entidad: string;
        consonantes: string;
        homoclave: string;
        digito: string;
    } | null;
    birthDate: string | null;
    sexLabel: 'H' | 'M' | 'X' | null;
    stateName: string | null;
    expectedCheckDigit: string | null;
    errors: string[];
}

export function normalizeCurp(input: string): string {
    return input.toUpperCase().replace(/[\s\-_.]/g, '');
}

/** Calcula el dígito verificador sobre los 17 primeros caracteres. */
export function curpCheckDigit(base: string): string {
    let sum = 0;
    for (let i = 0; i < 17; i++) {
        const value = ALPHABET.indexOf(base[i]);
        if (value < 0) return '?';
        sum += value * (18 - i);
    }
    return String((10 - (sum % 10)) % 10);
}

/**
 * La CURP codifica el siglo en la homoclave (posición 17): dígito para nacimientos
 * anteriores al año 2000, letra a partir de 2000. Eso resuelve la ambigüedad del
 * año de dos cifras sin heurísticas.
 */
function parseCurpDate(yy: string, mm: string, dd: string, homoclave: string): string | null {
    const month = Number(mm);
    const day = Number(dd);
    if (month < 1 || month > 12 || day < 1 || day > 31) return null;
    const century = /[0-9]/.test(homoclave) ? 1900 : 2000;
    const date = new Date(Date.UTC(century + Number(yy), month - 1, day));
    if (date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return null;
    return date.toISOString().slice(0, 10);
}

export function validateCurp(input: string): CurpResult {
    const normalized = normalizeCurp(input);
    const errors: string[] = [];
    const fail = (msg: string): CurpResult => ({
        valid: false, normalized, parts: null, birthDate: null, sexLabel: null,
        stateName: null, expectedCheckDigit: null, errors: [...errors, msg],
    });

    if (!normalized) return fail('empty');
    if (normalized.length !== 18) return fail('length');
    if (!CURP_SHAPE.test(normalized)) return fail('shape');

    const iniciales = normalized.slice(0, 4);
    const fecha = normalized.slice(4, 10);
    const sexo = normalized[10];
    const entidad = normalized.slice(11, 13);
    const consonantes = normalized.slice(13, 16);
    const homoclave = normalized[16];
    const digito = normalized[17];

    if (INCONVENIENT_WORDS.has(iniciales)) errors.push('inconvenient');

    const stateName = CURP_STATES[entidad] ?? null;
    if (!stateName) errors.push('state');

    const birthDate = parseCurpDate(fecha.slice(0, 2), fecha.slice(2, 4), fecha.slice(4, 6), homoclave);
    if (!birthDate) errors.push('date');

    const expected = curpCheckDigit(normalized.slice(0, 17));
    if (expected !== digito) errors.push('checksum');

    return {
        valid: errors.length === 0,
        normalized,
        parts: { iniciales, fecha, sexo, entidad, consonantes, homoclave, digito },
        birthDate,
        sexLabel: sexo as 'H' | 'M' | 'X',
        stateName,
        expectedCheckDigit: expected,
        errors,
    };
}
