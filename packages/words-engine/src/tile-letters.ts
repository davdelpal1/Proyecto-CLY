/**
 * Letras de ficha y normalización de palabras (GAME_RULES.md §4 LETTERS, «Normalización»).
 *
 * Una ficha es una letra del alfabeto de juego: a–z y ñ. Las tildes y la diéresis NO tienen ficha
 * propia: «cigüeña» se forma con c-i-g-u-e-ñ-a. La Ñ es una letra distinta de la N.
 *
 * Este archivo no importa nada a propósito: lo usan el paquete, el motor de partidas y el script de
 * construcción del léxico (`scripts/lexicon/build-lexicon.ts`, ejecutado directamente por Node).
 */

/** Alfabeto de las fichas, en minúscula. */
export const TILE_ALPHABET = 'abcdefghijklmnopqrstuvwxyzñ';

export const VOWEL_LETTERS = 'aeiou';

const FOLD: Readonly<Record<string, string>> = {
  á: 'a',
  é: 'e',
  í: 'i',
  ó: 'o',
  ú: 'u',
  ü: 'u',
};

/**
 * Forma de ficha de una palabra: minúsculas y sin tildes ni diéresis (la ñ se conserva).
 * No usa `String.prototype.normalize` para no depender de ICU en el motor de JavaScript de cada
 * plataforma. Los caracteres que no son letras del juego se dejan como están: ver `isTileWord`.
 */
export function toTileKey(word: string): string {
  let out = '';
  for (const char of word.toLowerCase()) out += FOLD[char] ?? char;
  return out;
}

const TILE_WORD = /^[a-zñ]+$/;

/** ¿Está formada solo por letras de ficha? (Sirve sobre una forma ya plegada con `toTileKey`.) */
export const isTileWord = (key: string): boolean => TILE_WORD.test(key);

/** Longitud en letras (no en unidades UTF-16). Todas las letras de ficha caben en una unidad. */
export const lettersIn = (key: string): number => [...key].length;

/** Cuántas veces aparece cada letra. */
export function countLetters(letters: string): Map<string, number> {
  const counts = new Map<string, number>();
  for (const letter of letters) counts.set(letter, (counts.get(letter) ?? 0) + 1);
  return counts;
}

/** ¿Se puede escribir `word` (ya plegada) con las fichas `tiles`, usando cada una como máximo una vez? */
export function canSpell(tiles: string, word: string): boolean {
  const available = countLetters(tiles);
  for (const letter of word) {
    const left = available.get(letter) ?? 0;
    if (left === 0) return false;
    available.set(letter, left - 1);
  }
  return true;
}
