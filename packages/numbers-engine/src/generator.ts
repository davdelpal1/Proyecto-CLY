import { solveNumbers } from './solver';
import type { SolveResult } from './solver';
import type { NumberTile, NumbersPolicy, NumbersPuzzle, RandomSource } from './types';

/**
 * Composición del conjunto de fichas. Valores de GAME_RULES.md ([SECUNDARIA]): pequeñas 1–10 y
 * grandes 25/50/75/100. Que cada pequeña exista dos veces y cuántas grandes salen NO están
 * documentados: son decisiones [DISEÑO] y por eso se pueden sobrescribir.
 */
export interface GeneratorOptions {
  readonly policy: NumbersPolicy;
  readonly tilesPerRound?: number;
  readonly targetRange?: { readonly min: number; readonly max: number };
  readonly smallValues?: readonly number[];
  /** Copias de cada ficha pequeña disponibles en la bolsa. */
  readonly smallCopies?: number;
  readonly bigValues?: readonly number[];
  /** Número fijo de grandes; si se omite se elige al azar entre `bigCountRange`. */
  readonly bigTileCount?: number;
  readonly bigCountRange?: { readonly min: number; readonly max: number };
  /** Rechaza puzzles que se resuelven con menos operaciones que esta cifra (degenerados). */
  readonly minSolutionOperations?: number;
  /** Exige solución exacta (recomendado para entrenamiento). */
  readonly requireExactSolution?: boolean;
  readonly maxAttempts?: number;
}

export interface GeneratedNumbersPuzzle {
  readonly puzzle: NumbersPuzzle;
  /** Solución del solver. El cliente solo debe mostrarla tras el cierre de la ronda. */
  readonly solution: SolveResult;
  readonly attempts: number;
}

export const DEFAULT_SMALL_VALUES: readonly number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
export const DEFAULT_BIG_VALUES: readonly number[] = [25, 50, 75, 100];

function randomInt(random: RandomSource, min: number, max: number): number {
  return min + Math.floor(random() * (max - min + 1));
}

/** Extrae `count` elementos sin reemplazo (Fisher–Yates parcial). */
function draw<T>(random: RandomSource, source: readonly T[], count: number): T[] {
  const bag = [...source];
  const out: T[] = [];
  for (let i = 0; i < count && bag.length > 0; i++) {
    const index = randomInt(random, 0, bag.length - 1);
    out.push(bag.splice(index, 1)[0] as T);
  }
  return out;
}

export function generateNumbersPuzzle(
  random: RandomSource,
  options: GeneratorOptions,
): GeneratedNumbersPuzzle {
  const tilesPerRound = options.tilesPerRound ?? 6;
  const range = options.targetRange ?? { min: 100, max: 999 };
  const smallValues = options.smallValues ?? DEFAULT_SMALL_VALUES;
  const smallCopies = options.smallCopies ?? 2;
  const bigValues = options.bigValues ?? DEFAULT_BIG_VALUES;
  const bigRange = options.bigCountRange ?? { min: 1, max: 3 };
  const minOps = options.minSolutionOperations ?? 2;
  const requireExact = options.requireExactSolution ?? true;
  const maxAttempts = options.maxAttempts ?? 200;

  const smallBag = smallValues.flatMap((v) => Array.from({ length: smallCopies }, () => v));

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const bigCount = Math.min(
      options.bigTileCount ?? randomInt(random, bigRange.min, bigRange.max),
      bigValues.length,
      tilesPerRound,
    );
    const values = [
      ...draw(random, bigValues, bigCount).sort((a, b) => b - a),
      ...draw(random, smallBag, tilesPerRound - bigCount).sort((a, b) => a - b),
    ];
    const tiles: NumberTile[] = values.map((value, index) => ({ id: `n${index + 1}`, value }));
    const puzzle: NumbersPuzzle = {
      tiles,
      target: randomInt(random, range.min, range.max),
    };

    if (tiles.some((t) => t.value === puzzle.target)) continue;
    const solution = solveNumbers(puzzle, options.policy);
    if (requireExact && !solution.exact) continue;
    if (solution.exact && solution.operationCount < minOps) continue;
    return { puzzle, solution, attempts: attempt };
  }
  throw new Error(`No se pudo generar un puzzle válido en ${maxAttempts} intentos`);
}
