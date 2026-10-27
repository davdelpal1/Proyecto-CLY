import { describe, expect, it } from 'vitest';
import { validateExpression } from './evaluate';
import { int } from './rational';
import { op, puzzleOf, tile } from './test-helpers';
import { STRICT_POLICY } from './types';
import type { ExpressionTree } from './types';

// Ejemplo técnico de GAME_RULES.md §4 (NUMBER): fichas [25, 7, 3, 2, 10, 5], objetivo 150.
const SPEC = puzzleOf([25, 7, 3, 2, 10, 5], 150);
const [T25, T7, T3, T2, T10, T5] = ['n1', 'n2', 'n3', 'n4', 'n5', 'n6'].map(tile) as [
  ExpressionTree,
  ExpressionTree,
  ExpressionTree,
  ExpressionTree,
  ExpressionTree,
  ExpressionTree,
];

describe('validateExpression', () => {
  it('NUM-01: la expresión del ejemplo técnico es numéricamente 150 pero inválida porque reutiliza el 5', () => {
    // 25 × (7 − (5 − 3)) + (10 × 2 + 5), con el MISMO 5 (n6) usado dos veces
    const expression = op(
      'add',
      op('multiply', T25, op('subtract', T7, op('subtract', T5, T3))),
      op('add', op('multiply', T10, T2), T5),
    );
    const result = validateExpression(SPEC, expression, STRICT_POLICY);
    expect(result).toEqual({ ok: false, error: { code: 'TILE_REUSED' } });
  });

  it('acepta una solución legítima que alcanza 150 sin reutilizar fichas', () => {
    // (10 + 5) × (7 + 3) = 150 usando fichas distintas; el 25 y el 2 quedan sin usar
    const expression = op('multiply', op('add', T10, T5), op('add', T7, T3));
    const result = validateExpression(SPEC, expression, STRICT_POLICY);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value).toEqual(int(150));
    expect(result.tilesUsed).toEqual(['n5', 'n6', 'n2', 'n3']);
    expect(result.steps).toHaveLength(3);
  });

  it('NUM-02: dos fichas distintas con el mismo valor son ambas utilizables', () => {
    const puzzle = puzzleOf([5, 5, 100, 1, 2, 3], 10);
    const result = validateExpression(puzzle, op('add', tile('n1'), tile('n2')), STRICT_POLICY);
    expect(result.ok && result.value).toEqual(int(10));
  });

  it('no permite usar dos veces la misma ficha aunque el valor sí exista duplicado', () => {
    const puzzle = puzzleOf([5, 5, 100, 1, 2, 3], 10);
    const result = validateExpression(puzzle, op('add', tile('n1'), tile('n1')), STRICT_POLICY);
    expect(result).toEqual({ ok: false, error: { code: 'TILE_REUSED' } });
  });

  it('rechaza fichas inexistentes', () => {
    const result = validateExpression(SPEC, op('add', tile('n1'), tile('zzz')), STRICT_POLICY);
    expect(result).toEqual({ ok: false, error: { code: 'UNKNOWN_TILE' } });
  });

  it('NUM-03: propaga el rechazo de división no exacta', () => {
    const result = validateExpression(SPEC, op('divide', T25, T7), STRICT_POLICY);
    expect(result).toEqual({ ok: false, error: { code: 'NON_INTEGER_DIVISION' } });
  });

  it('rechaza resultados intermedios no positivos aunque el total fuese válido', () => {
    // (3 − 7) + 10 = 6, pero 3 − 7 es negativo
    const result = validateExpression(SPEC, op('add', op('subtract', T3, T7), T10), STRICT_POLICY);
    expect(result).toEqual({ ok: false, error: { code: 'NON_POSITIVE_RESULT' } });
  });

  it('una sola ficha es una expresión válida (se pueden dejar fichas sin usar)', () => {
    const result = validateExpression(SPEC, T25, STRICT_POLICY);
    expect(result.ok && result.value).toEqual(int(25));
  });

  it('rechaza estructuras mal formadas procedentes de la red', () => {
    const bad = { kind: 'eval', code: 'process.exit()' } as unknown as ExpressionTree;
    expect(validateExpression(SPEC, bad, STRICT_POLICY)).toEqual({
      ok: false,
      error: { code: 'MALFORMED_EXPRESSION' },
    });
    expect(validateExpression(SPEC, null as unknown as ExpressionTree, STRICT_POLICY)).toEqual({
      ok: false,
      error: { code: 'MALFORMED_EXPRESSION' },
    });
  });
});
