import type { RandomSource } from '@cly/numbers-engine';
import type { Lexicon, LexiconEntry } from '@cly/words-engine';
import { createSeededRandom } from './rng';
import type { Ruleset } from './ruleset';
import { shuffled } from './shuffle';

export interface LettersTile {
  /** Identificador estable de la ficha (`l1`…): dos fichas con la misma letra son fichas distintas. */
  readonly id: string;
  /** Letra en minúscula, de a–z o ñ. */
  readonly letter: string;
}

export interface LettersPuzzle {
  readonly tiles: readonly LettersTile[];
}

/** Las letras de las fichas como texto, para el buscador y el validador. */
export const tileLetters = (puzzle: LettersPuzzle): string =>
  puzzle.tiles.map((tile) => tile.letter).join('');

/** Qué se podía hacer con las fichas. Solo se enseña tras cerrar la ronda. */
export interface LettersSolution {
  /** Longitud de la palabra más larga posible. */
  readonly bestLength: number;
  /** Las mejores palabras, de más largas a más cortas y por orden alfabético dentro de cada longitud. */
  readonly topWords: readonly LexiconEntry[];
  /** Cuántas palabras de la longitud mínima en adelante se podían formar. */
  readonly formableCount: number;
}

export interface GeneratedLettersPuzzle {
  readonly puzzle: LettersPuzzle;
  readonly solution: LettersSolution;
}

export interface LettersGeneratorOptions {
  /** Número de vocales; sin indicar, se elige al azar dentro del rango del ruleset. */
  readonly vowels?: number;
  /**
   * Longitud que debe poder alcanzarse como mínimo. [DISEÑO] Es una exigencia del entrenamiento
   * (para que la ronda merezca la pena), no una regla del programa.
   */
  readonly minBestLength?: number;
  readonly topWords?: number;
}

const DEFAULT_MIN_BEST_LENGTH = 6;
const DEFAULT_TOP_WORDS = 8;
const MAX_ATTEMPTS = 100;

type LetterRules = Pick<Ruleset['letterRules'], 'minAnswerLength' | 'maxLexiconTier'>;

const byLengthThenAlphabet = (a: LexiconEntry, b: LexiconEntry): number =>
  b.key.length - a.key.length || (a.word < b.word ? -1 : a.word > b.word ? 1 : 0);

/** Resuelve el ejercicio: todas las palabras formables con los niveles de léxico del ruleset. */
export function solveLetters(
  puzzle: LettersPuzzle,
  lexicon: Lexicon,
  letterRules: LetterRules,
  topWords = DEFAULT_TOP_WORDS,
): LettersSolution {
  const found = lexicon.findFormable(tileLetters(puzzle), {
    minLength: letterRules.minAnswerLength,
    maxTier: letterRules.maxLexiconTier,
  });
  found.sort(byLengthThenAlphabet);
  return {
    bestLength: found[0]?.key.length ?? 0,
    topWords: found.slice(0, topWords),
    formableCount: found.length,
  };
}

function drawLetter(
  random: RandomSource,
  weights: Readonly<Record<string, number>>,
  taken: ReadonlyMap<string, number>,
  cap: number,
): string {
  const open = Object.entries(weights).filter(([letter]) => (taken.get(letter) ?? 0) < cap);
  const total = open.reduce((sum, [, weight]) => sum + weight, 0);
  let point = random() * total;
  for (const [letter, weight] of open) {
    point -= weight;
    if (point < 0) return letter;
  }
  return (open[open.length - 1] as [string, number])[0];
}

function dealTiles(ruleset: Ruleset, random: RandomSource, vowels: number): LettersTile[] {
  const { letterRules, letterTiles } = ruleset;
  const taken = new Map<string, number>();
  const letters: string[] = [];
  const take = (weights: Readonly<Record<string, number>>) => {
    const letter = drawLetter(random, weights, taken, letterTiles.maxCopiesPerLetter);
    taken.set(letter, (taken.get(letter) ?? 0) + 1);
    letters.push(letter);
  };
  for (let i = 0; i < vowels; i++) take(letterTiles.vowelWeights);
  for (let i = vowels; i < letterRules.tileCount; i++) take(letterTiles.consonantWeights);
  return shuffled(letters, random).map((letter, index) => ({ id: `l${index + 1}`, letter }));
}

/**
 * Reparte un ejercicio reproducible: misma semilla, mismo ruleset y mismo léxico ⇒ mismas fichas en
 * cualquier plataforma. Se descartan los repartos en los que no se llega a `minBestLength`.
 */
export function createLettersRound(
  ruleset: Ruleset,
  seed: string | number,
  lexicon: Lexicon,
  options: LettersGeneratorOptions = {},
): GeneratedLettersPuzzle {
  const { letterRules } = ruleset;
  const random = createSeededRandom(seed);
  const wantedBest = Math.max(
    options.minBestLength ?? DEFAULT_MIN_BEST_LENGTH,
    letterRules.minAnswerLength,
  );
  if (
    options.vowels !== undefined &&
    !(
      Number.isInteger(options.vowels) &&
      options.vowels >= letterRules.minVowels &&
      options.vowels <= letterRules.maxVowels
    )
  ) {
    throw new Error(
      `El número de vocales debe estar entre ${letterRules.minVowels} y ${letterRules.maxVowels}`,
    );
  }

  let fallback: GeneratedLettersPuzzle | null = null;
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const vowels =
      options.vowels ??
      letterRules.minVowels +
        Math.floor(random() * (letterRules.maxVowels - letterRules.minVowels + 1));
    const puzzle: LettersPuzzle = { tiles: dealTiles(ruleset, random, vowels) };
    const solution = solveLetters(puzzle, lexicon, letterRules, options.topWords);
    if (solution.bestLength >= wantedBest) return { puzzle, solution };
    if (solution.bestLength >= letterRules.minAnswerLength && fallback === null) {
      fallback = { puzzle, solution };
    }
  }
  if (fallback !== null) return fallback;
  throw new Error('No se pudo repartir un ejercicio de letras con solución');
}
