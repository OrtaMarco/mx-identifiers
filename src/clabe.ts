/**
 * CLABE — Clave Bancaria Estandarizada (Banxico, Circular 3/2012).
 *
 * 18 dígitos: 3 de banco + 3 de plaza + 11 de cuenta + 1 de control.
 * El dígito de control pondera con 3-7-1 cíclico, reduciendo cada producto módulo 10
 * antes de sumar (ese paso intermedio es el que suelen omitir las implementaciones
 * incorrectas).
 */

import { CLABE_BANKS } from './catalogs';

const WEIGHTS = [3, 7, 1, 3, 7, 1, 3, 7, 1, 3, 7, 1, 3, 7, 1, 3, 7];

export interface ClabeResult {
    valid: boolean;
    normalized: string;
    parts: {
        banco: string;
        plaza: string;
        cuenta: string;
        digito: string;
    } | null;
    bankName: string | null;
    expectedCheckDigit: string | null;
    errors: string[];
}

export function normalizeClabe(input: string): string {
    return input.replace(/[\s\-]/g, '');
}

/** Calcula el dígito de control a partir de los 17 dígitos anteriores. */
export function clabeCheckDigit(base: string): string {
    let sum = 0;
    for (let i = 0; i < 17; i++) {
        const digit = Number(base[i]);
        if (Number.isNaN(digit)) return '?';
        sum += (digit * WEIGHTS[i]) % 10;
    }
    return String((10 - (sum % 10)) % 10);
}

export function validateClabe(input: string): ClabeResult {
    const normalized = normalizeClabe(input);
    const errors: string[] = [];
    const fail = (msg: string): ClabeResult => ({
        valid: false, normalized, parts: null, bankName: null,
        expectedCheckDigit: null, errors: [...errors, msg],
    });

    if (!normalized) return fail('empty');
    if (!/^[0-9]+$/.test(normalized)) return fail('digits');
    if (normalized.length !== 18) return fail('length');

    const banco = normalized.slice(0, 3);
    const plaza = normalized.slice(3, 6);
    const cuenta = normalized.slice(6, 17);
    const digito = normalized[17];

    const bankName = CLABE_BANKS[banco] ?? null;
    const expected = clabeCheckDigit(normalized.slice(0, 17));
    if (expected !== digito) errors.push('checksum');

    return {
        valid: errors.length === 0,
        normalized,
        parts: { banco, plaza, cuenta, digito },
        bankName,
        expectedCheckDigit: expected,
        errors,
    };
}

/** Agrupa la CLABE en bloques legibles: 012 180 01234567890 1 */
export function formatClabe(clabe: string): string {
    const c = normalizeClabe(clabe);
    if (c.length !== 18) return c;
    return `${c.slice(0, 3)} ${c.slice(3, 6)} ${c.slice(6, 17)} ${c.slice(17)}`;
}
