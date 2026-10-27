import { describe, expect, it } from 'vitest';
import { formatExpression, formatStep } from './format';
import { int } from './rational';
import { op, puzzleOf, tile } from './test-helpers';

const puzzle = puzzleOf([100, 6, 3, 2, 10, 5], 0);

describe('formatExpression', () => {
  it('no añade paréntesis innecesarios por precedencia', () => {
    expect(
      formatExpression(puzzle, op('add', tile('n1'), op('multiply', tile('n2'), tile('n3')))),
    ).toBe('100 + 6 × 3');
  });

  it('añade paréntesis cuando la precedencia lo exige', () => {
    expect(
      formatExpression(puzzle, op('multiply', op('add', tile('n1'), tile('n2')), tile('n3'))),
    ).toBe('(100 + 6) × 3');
  });

  it('conserva el orden de evaluación en operaciones no asociativas', () => {
    expect(
      formatExpression(puzzle, op('subtract', tile('n1'), op('subtract', tile('n2'), tile('n3')))),
    ).toBe('100 − (6 − 3)');
    expect(
      formatExpression(puzzle, op('divide', tile('n1'), op('multiply', tile('n2'), tile('n3')))),
    ).toBe('100 ÷ (6 × 3)');
  });
});

describe('formatStep', () => {
  it('formatea un paso como igualdad', () => {
    expect(formatStep({ left: int(25), op: 'multiply', right: int(4), result: int(100) })).toBe(
      '25 × 4 = 100',
    );
  });
});
