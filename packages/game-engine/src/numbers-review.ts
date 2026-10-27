import { formatExpression, formatStep, rational, validateExpression } from '@cly/numbers-engine';
import type {
  ExpressionTree,
  NumbersPolicy,
  NumbersPuzzle,
  SolveResult,
} from '@cly/numbers-engine';
import type { NumbersSessionState } from './numbers-session';

export type NumbersOutcome = 'EXACT' | 'CLOSE' | 'EXPIRED' | 'GAVE_UP' | 'INVALID';

export interface ExplainedSolution {
  readonly exact: boolean;
  readonly value: string;
  readonly distance: number;
  readonly expression: string;
  /** "25 × 4 = 100", un paso por línea. */
  readonly steps: readonly string[];
}

export interface NumbersReview {
  readonly outcome: NumbersOutcome;
  readonly distance: number | null;
  readonly yourValue: string | null;
  readonly yourExpression: string | null;
  readonly yourSteps: readonly string[];
  readonly elapsedMs: number | null;
  readonly solution: ExplainedSolution;
}

function explain(
  puzzle: NumbersPuzzle,
  expression: ExpressionTree,
  policy: NumbersPolicy,
): { expression: string; steps: string[] } {
  const validation = validateExpression(puzzle, expression, policy);
  return {
    expression: formatExpression(puzzle, expression),
    steps: validation.ok ? validation.steps.map(formatStep) : [],
  };
}

/**
 * Resumen posterior al cierre: resultado validado y solución razonada.
 * Lanza si la ronda no ha terminado, para que ninguna capa pueda filtrar la solución antes de tiempo.
 */
export function buildNumbersReview(state: NumbersSessionState, solved: SolveResult): NumbersReview {
  const { result, puzzle, policy } = state;
  if (state.status !== 'FINISHED' || result === null) {
    throw new Error('La revisión solo está disponible cuando la ronda ha terminado');
  }

  const solutionExplained = explain(puzzle, solved.witness, policy);
  const solution: ExplainedSolution = {
    exact: solved.exact,
    value: rational.formatRational(solved.bestValue),
    distance: solved.bestDistance,
    ...solutionExplained,
  };

  const elapsedMs =
    state.startedAtMs !== null && state.finishedAtMs !== null
      ? state.finishedAtMs - state.startedAtMs
      : null;

  if (result.kind === 'SUBMITTED') {
    const yours = explain(puzzle, result.expression, policy);
    return {
      outcome: result.exact ? 'EXACT' : 'CLOSE',
      distance: result.distance,
      yourValue: rational.formatRational(result.value),
      yourExpression: yours.expression,
      yourSteps: yours.steps,
      elapsedMs,
      solution,
    };
  }

  return {
    outcome: result.kind,
    distance: null,
    yourValue: null,
    yourExpression: null,
    yourSteps: [],
    elapsedMs,
    solution,
  };
}
