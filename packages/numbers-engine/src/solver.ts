import { applyOperator } from './arithmetic';
import * as q from './rational';
import type { Rational } from './rational';
import type { ExpressionTree, NumbersPolicy, NumbersPuzzle, Operator } from './types';

export interface SolveResult {
  /** Valor alcanzable más cercano al objetivo. */
  readonly bestValue: Rational;
  readonly bestDistance: number;
  readonly exact: boolean;
  /** Expresión testigo que alcanza `bestValue` (entre las empatadas, la de menos operaciones explorada). */
  readonly witness: ExpressionTree;
  readonly operationCount: number;
  /** Estados distintos (multiconjuntos de valores) explorados; sirve de métrica de auditoría. */
  readonly exploredStates: number;
}

export interface SolveOptions {
  /** Detener la búsqueda al encontrar una solución exacta. Más rápido, pero no minimiza operaciones. */
  readonly stopAtExact?: boolean;
}

interface Node {
  readonly value: Rational;
  readonly expression: ExpressionTree;
  readonly operations: number;
}

const COMMUTATIVE_PAIRS: readonly Operator[] = ['add', 'multiply'];
const ORDERED_PAIRS: readonly Operator[] = ['subtract', 'divide'];

/**
 * Búsqueda exhaustiva por subconjuntos con memoización por multiconjunto de valores.
 * Respeta la misma política aritmética que el validador (`applyOperator`).
 * Se omiten ×1 y ÷1 porque no producen valores nuevos.
 */
export function solveNumbers(
  puzzle: NumbersPuzzle,
  policy: NumbersPolicy,
  options: SolveOptions = {},
): SolveResult {
  const initial: Node[] = puzzle.tiles.map((t) => ({
    value: q.int(t.value),
    expression: { kind: 'tile', tileId: t.id },
    operations: 0,
  }));

  let best: Node = initial[0] as Node;
  let bestDistance = Infinity;
  let done = false;
  const seen = new Set<string>();

  const consider = (node: Node): void => {
    const distance = Math.abs(q.toNumber(node.value) - puzzle.target);
    if (
      distance < bestDistance ||
      (distance === bestDistance && node.operations < best.operations)
    ) {
      best = node;
      bestDistance = distance;
      if (distance === 0 && options.stopAtExact) done = true;
    }
  };

  const search = (nodes: readonly Node[]): void => {
    const key = nodes
      .map((n) => q.formatRational(n.value))
      .sort()
      .join(',');
    if (seen.has(key)) return;
    seen.add(key);

    for (let i = 0; i < nodes.length && !done; i++) {
      for (let j = i + 1; j < nodes.length && !done; j++) {
        const a = nodes[i] as Node;
        const b = nodes[j] as Node;
        const rest = nodes.filter((_, index) => index !== i && index !== j);

        const attempt = (left: Node, op: Operator, right: Node): void => {
          if (done) return;
          if (
            (op === 'multiply' && (isOne(left) || isOne(right))) ||
            (op === 'divide' && isOne(right))
          ) {
            return;
          }
          const outcome = applyOperator(left.value, op, right.value, policy);
          if (!outcome.ok) return;
          const node: Node = {
            value: outcome.value,
            expression: { kind: 'op', op, left: left.expression, right: right.expression },
            operations: left.operations + right.operations + 1,
          };
          consider(node);
          if (rest.length > 0) search([...rest, node]);
        };

        for (const op of COMMUTATIVE_PAIRS) attempt(a, op, b);
        for (const op of ORDERED_PAIRS) {
          attempt(a, op, b);
          attempt(b, op, a);
        }
      }
    }
  };

  for (const node of initial) consider(node);
  if (!done) search(initial);

  return {
    bestValue: best.value,
    bestDistance,
    exact: bestDistance === 0,
    witness: best.expression,
    operationCount: best.operations,
    exploredStates: seen.size,
  };
}

const isOne = (node: Node): boolean => node.value.n === 1 && node.value.d === 1;
