import { describe, expect, it } from 'vitest';
import { createSeededRandom } from './rng';

describe('createSeededRandom', () => {
  it('misma semilla ⇒ misma secuencia', () => {
    const a = createSeededRandom('abc');
    const b = createSeededRandom('abc');
    expect(Array.from({ length: 20 }, a)).toEqual(Array.from({ length: 20 }, b));
  });

  it('semillas distintas (texto o número) ⇒ secuencias distintas', () => {
    const first = (seed: string | number) => createSeededRandom(seed)();
    expect(first('abc')).not.toBe(first('abd'));
    expect(first(1)).not.toBe(first(2));
  });

  it('produce valores en [0, 1) con una distribución razonable', () => {
    const random = createSeededRandom('distribucion');
    const values = Array.from({ length: 10_000 }, random);
    expect(values.every((v) => v >= 0 && v < 1)).toBe(true);
    const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
    expect(mean).toBeGreaterThan(0.48);
    expect(mean).toBeLessThan(0.52);
  });
});
