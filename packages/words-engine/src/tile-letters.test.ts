import { describe, expect, it } from 'vitest';
import { canSpell, countLetters, isTileWord, lettersIn, toTileKey } from './tile-letters';

describe('toTileKey', () => {
  it('quita tildes y diéresis pero conserva la ñ', () => {
    expect(toTileKey('cigüeña')).toBe('cigueña');
    expect(toTileKey('murciélago')).toBe('murcielago');
    expect(toTileKey('Canción')).toBe('cancion');
    expect(toTileKey('ÁÉÍÓÚÜ')).toBe('aeiouu');
  });

  it('la Ñ no equivale a la N', () => {
    expect(toTileKey('año')).toBe('año');
    expect(toTileKey('año')).not.toBe(toTileKey('ano'));
    expect(toTileKey('AÑO')).toBe('año');
  });

  it('deja intactos los caracteres que no son letras de juego, para que se rechacen después', () => {
    expect(toTileKey('co-op')).toBe('co-op');
    expect(isTileWord(toTileKey('co-op'))).toBe(false);
    expect(isTileWord(toTileKey('Ab1'))).toBe(false);
  });
});

describe('isTileWord / lettersIn', () => {
  it('acepta solo a–z y ñ', () => {
    expect(isTileWord('niño')).toBe(true);
    expect(isTileWord('')).toBe(false);
    expect(isTileWord('ñandú')).toBe(false); // sin plegar: la tilde no es una ficha
    expect(lettersIn('ñandu')).toBe(5);
  });
});

describe('multiconjuntos', () => {
  it('cuenta las letras repetidas', () => {
    expect([...countLetters('casa')]).toEqual([
      ['c', 1],
      ['a', 2],
      ['s', 1],
    ]);
  });

  it('canSpell respeta cuántas fichas hay de cada letra (LET-03)', () => {
    expect(canSpell('casaxxxxxx', 'casa')).toBe(true);
    expect(canSpell('casxxxxxxx', 'casa')).toBe(false); // solo hay una «a»
    expect(canSpell('abcdefghij', 'jabs')).toBe(false); // falta la «s»
    expect(canSpell('', 'a')).toBe(false);
    expect(canSpell('abc', '')).toBe(true);
  });
});
