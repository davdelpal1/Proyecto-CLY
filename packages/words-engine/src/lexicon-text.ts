/**
 * Formato de texto del léxico de juego, lado de construcción.
 *
 * Una línea por forma de ficha (la palabra sin tildes ni diéresis), ordenadas por clave en orden de
 * unidades UTF-16:
 *
 *   clave<TAB>nivel            la palabra canónica es la propia clave («casa»)
 *   clave<TAB>nivel<TAB>palabra   la canónica lleva tilde o diéresis («pinguino» → «pingüino»)
 *
 * `nivel` es el rango de fiabilidad (0 = más fiable, ver `lexicon-tiers.ts`) del mejor camino por el
 * que se obtiene alguna palabra con esa clave. Varias palabras pueden compartir clave («canto»,
 * «cantó»): se guarda la de menor rango y, a igualdad, la que coincide con la clave.
 *
 * Este archivo no importa nada a propósito: lo ejecuta Node directamente desde el script de
 * construcción (`scripts/lexicon/build-lexicon.ts`). El módulo que lo lee es `lexicon.ts`.
 */

export interface RankedWord {
  readonly word: string;
  /** Rango de fiabilidad (índice en `LEXICON_TIERS`). */
  readonly rank: number;
}

export interface BuiltLexiconText {
  readonly text: string;
  /** Número de claves distintas (líneas). */
  readonly count: number;
}

/** Agrupa por clave de ficha, elige la mejor palabra de cada una y escribe el texto ordenado. */
export function buildLexiconText(
  words: Iterable<RankedWord>,
  keyOf: (word: string) => string,
): BuiltLexiconText {
  const best = new Map<string, RankedWord>();
  for (const candidate of words) {
    const key = keyOf(candidate.word);
    const current = best.get(key);
    if (current === undefined || isBetter(candidate, current, key)) best.set(key, candidate);
  }

  const keys = [...best.keys()].sort();
  const lines = keys.map((key) => {
    const { word, rank } = best.get(key) as RankedWord;
    return word === key ? `${key}\t${rank}` : `${key}\t${rank}\t${word}`;
  });
  return { text: lines.length === 0 ? '' : `${lines.join('\n')}\n`, count: keys.length };
}

function isBetter(candidate: RankedWord, current: RankedWord, key: string): boolean {
  if (candidate.rank !== current.rank) return candidate.rank < current.rank;
  if ((candidate.word === key) !== (current.word === key)) return candidate.word === key;
  return candidate.word < current.word;
}
