import { applyOperator } from './arithmetic';
import * as q from './rational';
import type { Rational } from './rational';
import type {
  ExpressionTree,
  NumbersError,
  NumbersErrorCode,
  NumbersPolicy,
  NumbersPuzzle,
  Operator,
  TileId,
} from './types';

/** Un paso de cálculo ya evaluado, útil para explicar una solución. */
export interface ExplainedStep {
  readonly left: Rational;
  readonly op: Operator;
  readonly right: Rational;
  readonly result: Rational;
}

export type ValidationResult =
  | {
      readonly ok: true;
      readonly value: Rational;
      readonly steps: readonly ExplainedStep[];
      readonly tilesUsed: readonly TileId[];
    }
  | { readonly ok: false; readonly error: NumbersError };

const fail = (code: NumbersErrorCode): { ok: false; error: NumbersError } => ({
  ok: false,
  error: { code },
});

/**
 * Valida y evalúa una expresión contra un puzzle y una política.
 * Es el validador canónico: lo usa la UI de entrenamiento y lo usará el servidor en partidas online.
 * Cada ficha (por `tileId`) puede aparecer como máximo una vez; no se usa `eval`.
 */
export function validateExpression(
  puzzle: NumbersPuzzle,
  expression: ExpressionTree,
  policy: NumbersPolicy,
): ValidationResult {
  const tiles = new Map(puzzle.tiles.map((t) => [t.id, t.value]));
  const used = new Set<TileId>();
  const steps: ExplainedStep[] = [];

  function evaluate(node: ExpressionTree): { value: Rational } | { code: NumbersErrorCode } {
    if (typeof node !== 'object' || node === null) return { code: 'MALFORMED_EXPRESSION' };
    if (node.kind === 'tile') {
      const value = tiles.get(node.tileId);
      if (value === undefined) return { code: 'UNKNOWN_TILE' };
      if (used.has(node.tileId)) return { code: 'TILE_REUSED' };
      used.add(node.tileId);
      return { value: q.int(value) };
    }
    if (node.kind !== 'op') return { code: 'MALFORMED_EXPRESSION' };

    const left = evaluate(node.left);
    if ('code' in left) return left;
    const right = evaluate(node.right);
    if ('code' in right) return right;

    const result = applyOperator(left.value, node.op, right.value, policy);
    if (!result.ok) return { code: result.code };
    steps.push({ left: left.value, op: node.op, right: right.value, result: result.value });
    return { value: result.value };
  }

  const outcome = evaluate(expression);
  if ('code' in outcome) return fail(outcome.code);
  return { ok: true, value: outcome.value, steps, tilesUsed: [...used] };
}
