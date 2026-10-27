import { describe, expect, it } from 'vitest';
import { solveNumbers } from '@cly/numbers-engine';
import type { NumbersPuzzle } from '@cly/numbers-engine';
import { buildNumbersReview } from './numbers-review';
import {
  applyNumbersAction,
  createNumbersSession,
  numbersPolicyFromRuleset,
} from './numbers-session';
import type { NumbersAction, NumbersSessionState } from './numbers-session';
import { RTVE_2026_REFERENCE } from './ruleset';

const PUZZLE: NumbersPuzzle = {
  tiles: [25, 7, 3, 2, 10, 5].map((value, i) => ({ id: `n${i + 1}`, value })),
  target: 150,
};
const solved = solveNumbers(PUZZLE, numbersPolicyFromRuleset(RTVE_2026_REFERENCE));

function play(actions: readonly [NumbersAction, number][]): NumbersSessionState {
  let state = createNumbersSession({
    ruleset: RTVE_2026_REFERENCE,
    puzzle: PUZZLE,
    config: { mode: 'TRAINING', timing: { kind: 'RULESET' } },
  });
  for (const [action, at] of actions) state = applyNumbersAction(state, action, at).state;
  return state;
}

describe('buildNumbersReview', () => {
  it('no revela la solución mientras la ronda sigue abierta', () => {
    expect(() => buildNumbersReview(play([[{ type: 'START' }, 0]]), solved)).toThrow();
    expect(() => buildNumbersReview(play([]), solved)).toThrow();
  });

  it('acierto exacto: resultado, pasos del jugador y tiempo empleado', () => {
    const state = play([
      [{ type: 'START' }, 100],
      [{ type: 'APPLY_STEP', left: 'n5', op: 'add', right: 'n6' }, 200],
      [{ type: 'APPLY_STEP', left: 'n2', op: 'add', right: 'n3' }, 300],
      [{ type: 'APPLY_STEP', left: 'r1', op: 'multiply', right: 'r2' }, 400],
      [{ type: 'SUBMIT', itemId: 'r3' }, 4_100],
    ]);
    const review = buildNumbersReview(state, solved);
    expect(review).toMatchObject({
      outcome: 'EXACT',
      distance: 0,
      yourValue: '150',
      yourExpression: '(10 + 5) × (7 + 3)',
      elapsedMs: 4_000,
    });
    expect(review.yourSteps).toEqual(['10 + 5 = 15', '7 + 3 = 10', '15 × 10 = 150']);
  });

  it('aproximación: outcome CLOSE con la distancia', () => {
    const state = play([
      [{ type: 'START' }, 0],
      [{ type: 'SUBMIT', itemId: 'n1' }, 10],
    ]);
    expect(buildNumbersReview(state, solved)).toMatchObject({
      outcome: 'CLOSE',
      distance: 125,
      yourValue: '25',
    });
  });

  it('tiempo agotado y rendición no tienen valor propio pero sí solución', () => {
    const expired = play([
      [{ type: 'START' }, 0],
      [{ type: 'TICK' }, 99_999],
    ]);
    const gaveUp = play([
      [{ type: 'START' }, 0],
      [{ type: 'GIVE_UP' }, 5],
    ]);
    expect(buildNumbersReview(expired, solved)).toMatchObject({
      outcome: 'EXPIRED',
      yourValue: null,
      elapsedMs: 40_000,
    });
    expect(buildNumbersReview(gaveUp, solved)).toMatchObject({
      outcome: 'GAVE_UP',
      yourValue: null,
      elapsedMs: 5,
    });
  });

  it('la solución explicada es coherente: el último paso produce el valor óptimo', () => {
    const state = play([
      [{ type: 'START' }, 0],
      [{ type: 'GIVE_UP' }, 1],
    ]);
    const { solution } = buildNumbersReview(state, solved);
    expect(solution.exact).toBe(true);
    expect(solution.value).toBe('150');
    expect(solution.steps.length).toBeGreaterThan(0);
    expect(solution.steps.at(-1)?.endsWith('= 150')).toBe(true);
  });
});
