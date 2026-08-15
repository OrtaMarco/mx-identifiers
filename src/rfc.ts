/**
 * RFC — Registro Federal de Contribuyentes.
 *
 * El último carácter es un dígito verificador módulo 11 sobre los doce anteriores.
 * Algoritmo comprobado contra los vectores canónicos del SAT:
 *   GODE561231GR8  (persona física, suma 1026 → resto 3 → 11-3 = 8)
 *   MAB9307148T4   (persona moral, se rellena a doce con un espacio a la izquierda)
 */

import { INCONVENIENT_WORDS } from './catalogs';

/** El espacio vale 37 y la Ñ 38; el «&» ocupa el hueco 24 entre la N y la O. */
const ALPHABET = '0123456789ABCDEFGHIJKLMN&OPQRSTUVWXYZ Ñ';

/**
 * RFC genéricos publicados por el SAT, aceptados explícitamente.
 *
 * Los dos se asignaron por decreto, pero no se comportan igual y conviene no
 * confundirlos: XAXX010101000 NO satisface el dígito verificador (el módulo 11 pide
 * «4» donde el SAT puso «0»), así que sin esta allowlist el validador marcaría como
 * inválido lo que lleva toda factura al público en general. XEXX010101000 sí lo
 * satisface por su cuenta —validaría igual sin estar aquí—, y aparece para que se
 * clasifique como genérico en vez de como una persona física cualquiera.
 */
export const GENERIC_RFCS: Record<string, string> = {
    XAXX010101000: 'RFC genérico nacional (público en general)',
    XEXX010101000: 'RFC genérico para residentes en el extranjero',
};

export type RfcKind = 'fisica' | 'moral' | 'generico';

export interface RfcResult {
    valid: boolean;
    normalized: string;
    kind: RfcKind | null;
    /** Sólo cuando el RFC es uno de los genéricos del SAT. */
    genericNote?: string;
    parts: {
        iniciales: string;
        fecha: string;
        homoclave: string;
        digito: string;
    } | null;
    /** Fecha de nacimiento o constitución, en ISO, si es coherente. */
    birthDate: string | null;
    expectedCheckDigit: string | null;
    errors: string[];
}

/** Quita separadores y espacios, y pasa a mayúsculas. */
export function normalizeRfc(input: string): string {
    return input.toUpperCase().replace(/[\s\-_.]/g, '');
}

/**
 * Calcula el dígito verificador a partir de los caracteres que lo preceden
 * (11 para persona moral, 12 para persona física).
 */
export function rfcCheckDigit(base: string): string {
    const padded = ('   ' + base).slice(-12);
    let sum = 0;
    for (let i = 0; i < 12; i++) {
        const value = ALPHABET.indexOf(padded[i]);
        if (value < 0) return '?';
        sum += value * (13 - i);
    }
    const remainder = sum % 11;
    if (remainder === 0) return '0';
    if (remainder === 1) return 'A';
    return String(11 - remainder);
}

/**
 * Valida la fecha embebida (AAMMDD). Devuelve la fecha en ISO o null si no existe
 * en el calendario —el 31 de febrero pasa el regex pero no es una fecha.
 */
function parseRfcDate(yy: string, mm: string, dd: string): string | null {
    const month = Number(mm);
    const day = Number(dd);
    if (month < 1 || month > 12 || day < 1 || day > 31) return null;
    // Ventana de siglo: el SAT no la codifica, así que se asume que un año por
    // encima del actual pertenece al siglo XX.
    const currentYY = new Date().getFullYear() % 100;
    const year = Number(yy) > currentYY ? 1900 + Number(yy) : 2000 + Number(yy);
    const date = new Date(Date.UTC(year, month - 1, day));
    if (date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return null;
    return date.toISOString().slice(0, 10);
}

export function validateRfc(input: string): RfcResult {
    const normalized = normalizeRfc(input);
    const errors: string[] = [];
    const fail = (msg: string): RfcResult => ({
        valid: false, normalized, kind: null, parts: null,
        birthDate: null, expectedCheckDigit: null, errors: [...errors, msg],
    });

    if (!normalized) return fail('empty');

    if (GENERIC_RFCS[normalized]) {
        return {
            valid: true,
            normalized,
            kind: 'generico',
            genericNote: GENERIC_RFCS[normalized],
            parts: null,
            birthDate: null,
            expectedCheckDigit: normalized.slice(-1),
            errors: [],
        };
    }

    if (normalized.length !== 12 && normalized.length !== 13) return fail('length');

    const kind: RfcKind = normalized.length === 13 ? 'fisica' : 'moral';
    const letterCount = kind === 'fisica' ? 4 : 3;

    const shape = kind === 'fisica'
        ? /^[A-ZÑ&]{4}[0-9]{6}[A-Z0-9]{3}$/
        : /^[A-ZÑ&]{3}[0-9]{6}[A-Z0-9]{3}$/;
    if (!shape.test(normalized)) return fail('shape');

    const iniciales = normalized.slice(0, letterCount);
    const fecha = normalized.slice(letterCount, letterCount + 6);
    const homoclave = normalized.slice(letterCount + 6, letterCount + 8);
    const digito = normalized.slice(-1);

    if (kind === 'fisica' && INCONVENIENT_WORDS.has(iniciales)) errors.push('inconvenient');

    const birthDate = parseRfcDate(fecha.slice(0, 2), fecha.slice(2, 4), fecha.slice(4, 6));
    if (!birthDate) errors.push('date');

    const expected = rfcCheckDigit(normalized.slice(0, -1));
    if (expected !== digito) errors.push('checksum');

    return {
        valid: errors.length === 0,
        normalized,
        kind,
        parts: { iniciales, fecha, homoclave, digito },
        birthDate,
        expectedCheckDigit: expected,
        errors,
    };
}
