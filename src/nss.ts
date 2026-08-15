/**
 * NSS — Número de Seguridad Social del IMSS.
 *
 * 11 dígitos: 2 de subdelegación + 2 de año de afiliación + 2 de año de nacimiento
 * + 4 de folio + 1 dígito verificador Luhn sobre los diez anteriores.
 */

export interface NssResult {
    valid: boolean;
    normalized: string;
    parts: {
        subdelegacion: string;
        anioAlta: string;
        anioNacimiento: string;
        folio: string;
        digito: string;
    } | null;
    expectedCheckDigit: string | null;
    errors: string[];
}

export function normalizeNss(input: string): string {
    return input.replace(/[\s\-]/g, '');
}

/** Luhn sobre los diez primeros dígitos (el más a la derecha se duplica). */
export function nssCheckDigit(base: string): string {
    let sum = 0;
    for (let i = 0; i < 10; i++) {
        const digit = Number(base[i]);
        if (Number.isNaN(digit)) return '?';
        // Índices impares (0-based) ocupan las posiciones pares, que son las que se duplican.
        const product = i % 2 === 1 ? digit * 2 : digit;
        sum += product > 9 ? product - 9 : product;
    }
    return String((10 - (sum % 10)) % 10);
}

export function validateNss(input: string): NssResult {
    const normalized = normalizeNss(input);
    const errors: string[] = [];
    const fail = (msg: string): NssResult => ({
        valid: false, normalized, parts: null, expectedCheckDigit: null, errors: [...errors, msg],
    });

    if (!normalized) return fail('empty');
    if (!/^[0-9]+$/.test(normalized)) return fail('digits');
    if (normalized.length !== 11) return fail('length');

    const expected = nssCheckDigit(normalized.slice(0, 10));
    if (expected !== normalized[10]) errors.push('checksum');

    return {
        valid: errors.length === 0,
        normalized,
        parts: {
            subdelegacion: normalized.slice(0, 2),
            anioAlta: normalized.slice(2, 4),
            anioNacimiento: normalized.slice(4, 6),
            folio: normalized.slice(6, 10),
            digito: normalized[10],
        },
        expectedCheckDigit: expected,
        errors,
    };
}
