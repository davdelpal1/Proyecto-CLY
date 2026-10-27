import { formatRational } from './rational';
import type { ExplainedStep } from './evaluate';
import { OPERATOR_SYMBOL } from './types';
import type { ExpressionTree, NumbersPuzzle, Operator } from './types';

const precedence = (op: Operator): number => (op === 'add' || op === 'subtract' ? 1 : 2);
const isNonAssociative = (op: Operator): boolean => op === 'subtract' || op === 'divide';

/** Expresión en notación infija con los paréntesis mínimos que preservan el orden de evaluación. */
export function formatExpression(puzzle: NumbersPuzzle, expression: ExpressionTree): string {
  const values = new Map(puzzle.tiles.map((t) => [t.id, t.value]));

  function render(node: ExpressionTree, parentOp: Operator | null, isRight: boolean): string {
    if (node.kind === 'tile') return String(values.get(node.tileId) ?? '?');
    const text = `${render(node.left, node.op, false)} ${OPERATOR_SYMBOL[node.op]} ${render(node.right, node.op, true)}`;
    if (parentOp === null) return text;
    const needsParens =
      precedence(node.op) < precedence(parentOp) ||
      (precedence(node.op) === precedence(parentOp) &&
        isRight &&
        (isNonAssociative(parentOp) || isNonAssociative(node.op)));
    return needsParens ? `(${text})` : text;
  }
  return render(expression, null, false);
}

/** "25 × 4 = 100" */
export function formatStep(step: ExplainedStep): string {
  return `${formatRational(step.left)} ${OPERATOR_SYMBOL[step.op]} ${formatRational(step.right)} = ${formatRational(step.result)}`;
}
