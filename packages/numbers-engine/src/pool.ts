import { applyOperator } from './arithmetic';
import * as q from './rational';
import type { Rational } from './rational';
import type { ExpressionTree, NumbersError, NumbersPolicy, NumbersPuzzle, Operator } from './types';

/**
 * Modelo de "calculadora por pasos": cada paso combina dos elementos disponibles y produce uno nuevo.
 * Los operandos quedan consumidos, de modo que reutilizar una ficha es imposible por construcción
 * y además se rechaza explícitamente (`TILE_REUSED`) si llega una acción obsoleta.
 */
export interface CalcStep {
  readonly resultId: string;
  readonly left: string;
  readonly op: Operator;
  readonly right: string;
}

export interface PoolEntry {
  readonly id: string;
  readonly kind: 'tile' | 'result';
  readonly value: Rational;
  readonly expression: ExpressionTree;
  readonly consumed: boolean;
}

export type ReplayResult =
  | { readonly ok: true; readonly entries: readonly PoolEntry[] }
  | { readonly ok: false; readonly error: NumbersError; readonly stepIndex: number };

/** Id determinista del siguiente resultado. */
export const nextResultId = (stepCount: number): string => `r${stepCount + 1}`;

/** Reconstruye el estado de la calculadora desde cero. Pura y determinista. */
export function replaySteps(
  puzzle: NumbersPuzzle,
  steps: readonly CalcStep[],
  policy: NumbersPolicy,
): ReplayResult {
  let entries: PoolEntry[] = puzzle.tiles.map((t) => ({
    id: t.id,
    kind: 'tile',
    value: q.int(t.value),
    expression: { kind: 'tile', tileId: t.id },
    consumed: false,
  }));

  for (const [stepIndex, step] of steps.entries()) {
    const fail = (code: NumbersError['code']): ReplayResult => ({
      ok: false,
      error: { code },
      stepIndex,
    });
    if (entries.some((e) => e.id === step.resultId)) return fail('DUPLICATE_RESULT_ID');

    const left = entries.find((e) => e.id === step.left);
    const right = entries.find((e) => e.id === step.right);
    if (!left || !right) return fail('UNKNOWN_ITEM');
    if (left.consumed || right.consumed || left.id === right.id) return fail('TILE_REUSED');

    const outcome = applyOperator(left.value, step.op, right.value, policy);
    if (!outcome.ok) return fail(outcome.code);

    entries = entries.map((e) =>
      e.id === left.id || e.id === right.id ? { ...e, consumed: true } : e,
    );
    entries.push({
      id: step.resultId,
      kind: 'result',
      value: outcome.value,
      expression: { kind: 'op', op: step.op, left: left.expression, right: right.expression },
      consumed: false,
    });
  }
  return { ok: true, entries };
}

/** Elemento disponible cuyo valor queda más cerca del objetivo (primero en caso de empate). */
export function closestAvailable(
  entries: readonly PoolEntry[],
  target: number,
): PoolEntry | undefined {
  let best: PoolEntry | undefined;
  let bestDistance = Infinity;
  for (const entry of entries) {
    if (entry.consumed) continue;
    const distance = Math.abs(q.toNumber(entry.value) - target);
    if (distance < bestDistance) {
      best = entry;
      bestDistance = distance;
    }
  }
  return best;
}
