/**
 * Atajos booleanos sobre los validadores, para cuando solo importa si es válido.
 * Aceptan cualquier valor: lo que no es cadena da `false` en vez de lanzar.
 */

import { validateRfc } from './rfc';
import { validateCurp } from './curp';
import { validateClabe } from './clabe';
import { validateNss } from './nss';

export const isRfc = (input: unknown): boolean => validateRfc(input as string).valid;
export const isCurp = (input: unknown): boolean => validateCurp(input as string).valid;
export const isClabe = (input: unknown): boolean => validateClabe(input as string).valid;
export const isNss = (input: unknown): boolean => validateNss(input as string).valid;
