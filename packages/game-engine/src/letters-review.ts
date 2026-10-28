import type { LexiconTier } from '@cly/words-engine';
import type { LettersSolution } from './letters-round';
import type { LettersSessionState } from './letters-session';
import type { PracticeOutcome } from './practice-progress';

/**
 * `BEST`: la palabra más larga que había. `VALID`: palabra válida pero más corta.
 * (No hay `INVALID`: una palabra no válida se rechaza sin cerrar la ronda.)
 */
export type LettersOutcome = 'BEST' | 'VALID' | 'EXPIRED' | 'GAVE_UP';

export interface ReviewedWord {
  readonly word: string;
  readonly length: number;
}

export interface LettersReview {
  readonly outcome: LettersOutcome;
  readonly yourWord: string | null;
  readonly yourLength: number | null;
  readonly yourTier: LexiconTier | null;
  /** Longitud de la mejor palabra posible. */
  readonly bestLength: number;
  readonly elapsedMs: number | null;
  readonly topWords: readonly ReviewedWord[];
  readonly formableCount: number;
}

/**
 * Resumen posterior al cierre: resultado validado y mejores palabras posibles.
 * Lanza si la ronda no ha terminado, para que ninguna capa pueda filtrar la solución antes de tiempo.
 */
export function buildLettersReview(
  state: LettersSessionState,
  solution: LettersSolution,
): LettersReview {
  const { result } = state;
  if (state.status !== 'FINISHED' || result === null) {
    throw new Error('La revisión solo está disponible cuando la ronda ha terminado');
  }

  const elapsedMs =
    state.startedAtMs !== null && state.finishedAtMs !== null
      ? state.finishedAtMs - state.startedAtMs
      : null;
  const shared = {
    bestLength: solution.bestLength,
    elapsedMs,
    topWords: solution.topWords.map((entry) => ({ word: entry.word, length: entry.key.length })),
    formableCount: solution.formableCount,
  };

  if (result.kind === 'SUBMITTED') {
    return {
      ...shared,
      outcome: result.length >= solution.bestLength ? 'BEST' : 'VALID',
      yourWord: result.word,
      yourLength: result.length,
      yourTier: result.tier,
    };
  }
  return {
    ...shared,
    outcome: result.kind,
    yourWord: null,
    yourLength: null,
    yourTier: null,
  };
}

/** El progreso local usa un vocabulario común: «exacto» = lo mejor posible, «cerca» = válido pero no lo mejor. */
export function practiceOutcomeOfLetters(outcome: LettersOutcome): PracticeOutcome {
  switch (outcome) {
    case 'BEST':
      return 'EXACT';
    case 'VALID':
      return 'CLOSE';
    case 'EXPIRED':
      return 'EXPIRED';
    case 'GAVE_UP':
      return 'GAVE_UP';
  }
}
