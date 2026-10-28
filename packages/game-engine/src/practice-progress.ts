import type { NumbersOutcome } from './numbers-review';
import { PUZZLE_REGISTRY } from './puzzle-registry';
import type { PuzzleType } from './types';

/**
 * Progreso personal de ENTRENAMIENTO. Es local, sin cuenta y sin valor competitivo: nunca se
 * sube ni se firma (ARCHITECTURE.md §8). Es lógica pura; el almacenamiento vive en la app.
 */
export interface PuzzleStats {
  readonly played: number;
  readonly exact: number;
  readonly close: number;
  readonly expired: number;
  readonly gaveUp: number;
  /** Aciertos exactos consecutivos; se rompe con cualquier otro resultado, rendirse incluido. */
  readonly currentExactStreak: number;
  readonly bestExactStreak: number;
  readonly fastestExactMs: number | null;
}

export interface PracticeProgress {
  readonly version: 1;
  readonly byPuzzle: Readonly<Partial<Record<PuzzleType, PuzzleStats>>>;
  readonly last: { readonly puzzle: PuzzleType; readonly atEpochMs: number } | null;
}

export const EMPTY_PUZZLE_STATS: PuzzleStats = {
  played: 0,
  exact: 0,
  close: 0,
  expired: 0,
  gaveUp: 0,
  currentExactStreak: 0,
  bestExactStreak: 0,
  fastestExactMs: null,
};

export const EMPTY_PROGRESS: PracticeProgress = { version: 1, byPuzzle: {}, last: null };

export interface PracticeResult {
  readonly puzzle: PuzzleType;
  readonly outcome: NumbersOutcome;
  readonly elapsedMs: number | null;
  /** Marca de tiempo de calendario (ms desde epoch) aportada por la app; el motor no lee el reloj. */
  readonly atEpochMs: number;
}

export const getPuzzleStats = (progress: PracticeProgress, puzzle: PuzzleType): PuzzleStats =>
  progress.byPuzzle[puzzle] ?? EMPTY_PUZZLE_STATS;

/** Incorpora un resultado. Un resultado `INVALID` no se cuenta (no es una partida jugada). */
export function recordPracticeResult(
  progress: PracticeProgress,
  result: PracticeResult,
): PracticeProgress {
  if (result.outcome === 'INVALID') return progress;
  const stats = getPuzzleStats(progress, result.puzzle);
  const isExact = result.outcome === 'EXACT';

  const streak = isExact ? stats.currentExactStreak + 1 : 0;
  const fastest =
    isExact && result.elapsedMs !== null
      ? Math.min(stats.fastestExactMs ?? Infinity, result.elapsedMs)
      : stats.fastestExactMs;

  const next: PuzzleStats = {
    played: stats.played + 1,
    exact: stats.exact + (isExact ? 1 : 0),
    close: stats.close + (result.outcome === 'CLOSE' ? 1 : 0),
    expired: stats.expired + (result.outcome === 'EXPIRED' ? 1 : 0),
    gaveUp: stats.gaveUp + (result.outcome === 'GAVE_UP' ? 1 : 0),
    currentExactStreak: streak,
    bestExactStreak: Math.max(stats.bestExactStreak, streak),
    fastestExactMs: fastest,
  };

  return {
    version: 1,
    byPuzzle: { ...progress.byPuzzle, [result.puzzle]: next },
    last: { puzzle: result.puzzle, atEpochMs: result.atEpochMs },
  };
}

const KNOWN_PUZZLES = new Set<string>(PUZZLE_REGISTRY.map((p) => p.type));
const COUNT_KEYS = [
  'played',
  'exact',
  'close',
  'expired',
  'gaveUp',
  'currentExactStreak',
  'bestExactStreak',
] as const;

const isCount = (value: unknown): value is number =>
  typeof value === 'number' && Number.isSafeInteger(value) && value >= 0;

function parseStats(raw: unknown): PuzzleStats | null {
  if (typeof raw !== 'object' || raw === null) return null;
  const record = raw as Record<string, unknown>;
  if (!COUNT_KEYS.every((key) => isCount(record[key]))) return null;
  const fastest = record['fastestExactMs'];
  if (
    fastest !== null &&
    !(typeof fastest === 'number' && Number.isFinite(fastest) && fastest >= 0)
  ) {
    return null;
  }
  return {
    played: record['played'] as number,
    exact: record['exact'] as number,
    close: record['close'] as number,
    expired: record['expired'] as number,
    gaveUp: record['gaveUp'] as number,
    currentExactStreak: record['currentExactStreak'] as number,
    bestExactStreak: record['bestExactStreak'] as number,
    fastestExactMs: fastest as number | null,
  };
}

/**
 * Lee el progreso guardado. Tolera cualquier contenido: si falta, está corrupto o es de otra
 * versión devuelve el progreso vacío, y descarta solo las entradas inválidas.
 */
export function parsePracticeProgress(raw: string | null): PracticeProgress {
  if (raw === null) return EMPTY_PROGRESS;
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return EMPTY_PROGRESS;
  }
  if (typeof data !== 'object' || data === null) return EMPTY_PROGRESS;
  const record = data as Record<string, unknown>;
  if (record['version'] !== 1) return EMPTY_PROGRESS;

  const byPuzzle: Partial<Record<PuzzleType, PuzzleStats>> = {};
  const stored = record['byPuzzle'];
  if (typeof stored === 'object' && stored !== null) {
    for (const [key, value] of Object.entries(stored)) {
      const stats = KNOWN_PUZZLES.has(key) ? parseStats(value) : null;
      if (stats) byPuzzle[key as PuzzleType] = stats;
    }
  }

  let last: PracticeProgress['last'] = null;
  const storedLast = record['last'];
  if (typeof storedLast === 'object' && storedLast !== null) {
    const { puzzle, atEpochMs } = storedLast as Record<string, unknown>;
    if (typeof puzzle === 'string' && KNOWN_PUZZLES.has(puzzle) && isCount(atEpochMs)) {
      last = { puzzle: puzzle as PuzzleType, atEpochMs };
    }
  }
  return { version: 1, byPuzzle, last };
}

export const serializePracticeProgress = (progress: PracticeProgress): string =>
  JSON.stringify(progress);
