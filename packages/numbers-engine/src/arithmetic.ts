import * as q from './rational';
import type { Rational } from './rational';
import type { NumbersErrorCode, NumbersPolicy, Operator } from './types';

export type OperatorResult =
  | { readonly ok: true; readonly value: Rational }
  | { readonly ok: false; readonly code: NumbersErrorCode };

/** Aplica una operación binaria respetando la política. Única fuente de verdad aritmética del motor. */
export function applyOperator(
  left: Rational,
  op: Operator,
  right: Rational,
  policy: NumbersPolicy,
): OperatorResult {
  if (!policy.allowedOperators.includes(op)) return { ok: false, code: 'OPERATOR_NOT_ALLOWED' };

  let value: Rational | null;
  switch (op) {
    case 'add':
      value = q.add(left, right);
      break;
    case 'subtract':
      value = q.subtract(left, right);
      break;
    case 'multiply':
      value = q.multiply(left, right);
      break;
    case 'divide':
      if (right.n === 0) return { ok: false, code: 'DIVISION_BY_ZERO' };
      if (
        policy.requireExactDivision &&
        (!q.isInteger(left) || !q.isInteger(right) || left.n % right.n !== 0)
      ) {
        return { ok: false, code: 'NON_INTEGER_DIVISION' };
      }
      value = q.divide(left, right);
      break;
  }

  if (value === null) return { ok: false, code: 'ARITHMETIC_OVERFLOW' };

  if (policy.requirePositiveIntegerIntermediates) {
    if (!q.isInteger(value)) return { ok: false, code: 'NON_INTEGER_RESULT' };
    if (value.n <= 0) return { ok: false, code: 'NON_POSITIVE_RESULT' };
  }
  return { ok: true, value };
}
