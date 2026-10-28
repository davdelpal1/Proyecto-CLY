import { LEXICON_TIERS, tierRank } from './lexicon-tiers';
import type { LexiconTier } from './lexicon-tiers';
import { toTileKey } from './tile-letters';

export interface LexiconEntry {
  /** Forma de ficha: minúsculas, sin tildes ni diéresis. */
  readonly key: string;
  /** Palabra tal como se escribe («pingüino»). */
  readonly word: string;
  /** Nivel de fiabilidad más alto con el que figura la palabra (ver `lexicon-tiers.ts`). */
  readonly tier: LexiconTier;
}

export interface FormableOptions {
  /** Longitud mínima de las palabras buscadas. */
  readonly minLength: number;
  /** Nivel menos fiable que se admite; sin indicar, todos. */
  readonly maxTier?: LexiconTier;
}

/** Lo único que necesita una partida para juzgar una palabra: se inyecta, el motor no carga datos. */
export interface WordLookup {
  lookup(input: string, maxTier?: LexiconTier): LexiconEntry | null;
}

export interface Lexicon extends WordLookup {
  /** Número de formas de ficha distintas. */
  readonly size: number;
  /** Todas las palabras que se pueden formar con las fichas (letras ya plegadas), sin orden de relevancia. */
  findFormable(tiles: string, options: FormableOptions): LexiconEntry[];
}

const LAST_RANK = LEXICON_TIERS.length - 1;
const ALPHABET_SIZE = 27; // a–z y ñ
const CHAR_0 = 48;

/** Posición de una letra de ficha en el contador, o -1 si no es una letra del juego. */
function letterIndex(code: number): number {
  if (code >= 97 && code <= 122) return code - 97;
  return code === 241 ? 26 : -1; // ñ
}

/**
 * Carga el texto generado por `buildLexiconText`. No crea un objeto por palabra: conserva el texto y
 * unos índices de posición (≈ 12 bytes por forma), lo que importa en móviles con poca memoria.
 * Lanza si el texto está mal formado, para no jugar con un léxico corrupto.
 */
export function parseLexicon(text: string): Lexicon {
  const starts: number[] = [];
  const tabs: number[] = [];
  const ends: number[] = [];

  let position = 0;
  while (position < text.length) {
    const newline = text.indexOf('\n', position);
    const end = newline === -1 ? text.length : newline;
    const tab = text.indexOf('\t', position);
    const rank = text.charCodeAt(tab + 1) - CHAR_0;
    const separator = text.charAt(tab + 2);
    if (
      tab === -1 ||
      tab >= end ||
      tab === position ||
      !(rank >= 0 && rank <= LAST_RANK) ||
      (tab + 2 < end && separator !== '\t')
    ) {
      throw new Error(`Léxico mal formado en la posición ${position}`);
    }
    starts.push(position);
    tabs.push(tab);
    ends.push(end);
    position = end + 1;
  }

  const lineStart = Int32Array.from(starts);
  const keyEnd = Int32Array.from(tabs);
  const lineEnd = Int32Array.from(ends);
  const size = lineStart.length;

  const rankAt = (index: number): number => text.charCodeAt((keyEnd[index] as number) + 1) - CHAR_0;

  const entryAt = (index: number): LexiconEntry => {
    const start = lineStart[index] as number;
    const tab = keyEnd[index] as number;
    const end = lineEnd[index] as number;
    const key = text.slice(start, tab);
    return {
      key,
      word: end > tab + 2 ? text.slice(tab + 3, end) : key,
      tier: LEXICON_TIERS[rankAt(index)] as LexiconTier,
    };
  };

  /** <0 si la clave de la línea es menor que `key`, >0 si es mayor (orden de unidades UTF-16). */
  const compareKeyAt = (index: number, key: string): number => {
    const start = lineStart[index] as number;
    const length = (keyEnd[index] as number) - start;
    const common = Math.min(length, key.length);
    for (let k = 0; k < common; k++) {
      const diff = text.charCodeAt(start + k) - key.charCodeAt(k);
      if (diff !== 0) return diff;
    }
    return length - key.length;
  };

  return {
    size,

    lookup(input, maxTier = LEXICON_TIERS[LAST_RANK] as LexiconTier) {
      const key = toTileKey(input);
      if (key.length === 0) return null;
      let low = 0;
      let high = size - 1;
      while (low <= high) {
        const middle = (low + high) >>> 1;
        const order = compareKeyAt(middle, key);
        if (order === 0) return rankAt(middle) <= tierRank(maxTier) ? entryAt(middle) : null;
        if (order < 0) low = middle + 1;
        else high = middle - 1;
      }
      return null;
    },

    findFormable(tiles, { minLength, maxTier }) {
      const available = new Int8Array(ALPHABET_SIZE);
      for (let k = 0; k < tiles.length; k++) {
        const slot = letterIndex(tiles.charCodeAt(k));
        if (slot < 0) throw new Error(`Ficha no válida: «${tiles.charAt(k)}»`);
        available[slot]!++;
      }
      const maxLength = tiles.length;
      const maxRank = maxTier === undefined ? LAST_RANK : tierRank(maxTier);
      const remaining = new Int8Array(ALPHABET_SIZE);
      const found: LexiconEntry[] = [];

      for (let index = 0; index < size; index++) {
        const start = lineStart[index] as number;
        const length = (keyEnd[index] as number) - start;
        if (length < minLength || length > maxLength || rankAt(index) > maxRank) continue;

        remaining.set(available);
        let fits = true;
        for (let k = 0; k < length; k++) {
          const slot = letterIndex(text.charCodeAt(start + k));
          if (slot < 0 || --remaining[slot]! < 0) {
            fits = false;
            break;
          }
        }
        if (fits) found.push(entryAt(index));
      }
      return found;
    },
  };
}
