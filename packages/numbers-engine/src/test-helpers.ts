import type { ExpressionTree, NumbersPuzzle, Operator, RandomSource } from './types';

/** PRNG determinista mínimo para tests (mulberry32). El PRNG de producción vive en game-engine. */
export function testRandom(seed: number): RandomSource {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const tile = (tileId: string): ExpressionTree => ({ kind: 'tile', tileId });
export const op = (o: Operator, left: ExpressionTree, right: ExpressionTree): ExpressionTree => ({
  kind: 'op',
  op: o,
  left,
  right,
});

export function puzzleOf(values: readonly number[], target: number): NumbersPuzzle {
  return { tiles: values.map((value, i) => ({ id: `n${i + 1}`, value })), target };
}
