import type { LettersRejectionCode } from '@cly/game-engine';

/** Mensajes de error del motor en lenguaje llano. El tipo `Record` obliga a cubrir todos los códigos. */
export const lettersRejectionMessage = (code: LettersRejectionCode, minLength: number): string =>
  LETTERS_REJECTIONS(minLength)[code];

const LETTERS_REJECTIONS = (minLength: number): Record<LettersRejectionCode, string> => ({
  EMPTY_WORD: 'Forma una palabra con las letras de abajo.',
  INVALID_CHARACTERS: 'Solo se pueden usar letras.',
  LETTER_MULTIPLICITY_EXCEEDED: 'Esa palabra usa más letras de las que tienes.',
  TOO_SHORT: `Es demasiado corta: necesita al menos ${minLength} letras.`,
  NOT_IN_LEXICON: 'Esa palabra no está en nuestro diccionario. Prueba con otra.',
  INVALID_STATE: 'Esa acción no está disponible ahora.',
  DEADLINE_EXPIRED: 'Se acabó el tiempo.',
  UNKNOWN_TILE: 'Esa letra no existe.',
  TILE_ALREADY_PICKED: 'Esa letra ya está en tu palabra.',
  TILE_NOT_PICKED: 'Esa letra no está en tu palabra.',
  NOTHING_TO_UNDO: 'No hay nada que borrar.',
});
