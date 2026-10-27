import type { NumbersRejectionCode } from '@cly/game-engine';

/** Mensajes de error del motor en lenguaje llano. El tipo `Record` obliga a cubrir todos los códigos. */
export const REJECTION_MESSAGES: Record<NumbersRejectionCode, string> = {
  TILE_REUSED: 'Esa ficha ya está usada: cada número solo se puede usar una vez.',
  UNKNOWN_TILE: 'Esa ficha no existe.',
  UNKNOWN_ITEM: 'Ese número no está disponible.',
  OPERATOR_NOT_ALLOWED: 'Esa operación no está permitida.',
  DIVISION_BY_ZERO: 'No se puede dividir entre cero.',
  NON_INTEGER_DIVISION: 'La división debe ser exacta (sin decimales).',
  NON_INTEGER_RESULT: 'El resultado debe ser un número entero.',
  NON_POSITIVE_RESULT: 'El resultado debe ser mayor que cero.',
  ARITHMETIC_OVERFLOW: 'El resultado es demasiado grande.',
  MALFORMED_EXPRESSION: 'La operación no es válida.',
  DUPLICATE_RESULT_ID: 'No se pudo crear el resultado. Inténtalo de nuevo.',
  INVALID_STATE: 'Esa acción no está disponible ahora.',
  DEADLINE_EXPIRED: 'Se acabó el tiempo.',
  NOTHING_TO_UNDO: 'No hay nada que deshacer.',
};
