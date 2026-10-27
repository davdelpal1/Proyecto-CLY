import { describe, expect, it } from 'vitest';
import { validateExpression } from './evaluate';
import { generateNumbersPuzzle } from './generator';
import { int } from './rational';
import { solveNumbers } from './solver';
import { puzzleOf, testRandom } from './test-helpers';
import { STRICT_POLICY } from './types';
import type { NumbersPolicy } from './types';

describe('solveNumbers', () => {
  it('encuentra una solución exacta conocida (952 con 25 50 75 100 3 6)', () => {
    const puzzle = puzzleOf([25, 50, 75, 100, 3, 6], 952);
    const solution = solveNumbers(puzzle, STRICT_POLICY);
    expect(solution.exact).toBe(true);
    expect(solution.bestDistance).toBe(0);
    const validated = validateExpression(puzzle, solution.witness, STRICT_POLICY);
    expect(validated.ok && validated.value).toEqual(int(952));
  });

  it('cuando no hay solución exacta devuelve la mejor aproximación demostrable', () => {
    // Con seis unos el máximo alcanzable es (1+1+1)×(1+1+1) = 9
    const puzzle = puzzleOf([1, 1, 1, 1, 1, 1], 999);
    const solution = solveNumbers(puzzle, STRICT_POLICY);
    expect(solution.exact).toBe(false);
    expect(solution.bestValue).toEqual(int(9));
    expect(solution.bestDistance).toBe(990);
  });

  it('si el objetivo es una de las fichas, la solución usa 0 operaciones', () => {
    const solution = solveNumbers(puzzleOf([100, 2, 3, 4, 5, 6], 100), STRICT_POLICY);
    expect(solution.exact).toBe(true);
    expect(solution.operationCount).toBe(0);
  });

  it('prefiere la solución de menos operaciones entre las exactas', () => {
    const solution = solveNumbers(puzzleOf([10, 5, 2, 7, 3, 25], 15), STRICT_POLICY);
    expect(solution.operationCount).toBe(1); // 10 + 5
  });

  it('stopAtExact detiene antes que la búsqueda completa', () => {
    const puzzle = puzzleOf([25, 50, 75, 100, 3, 6], 952);
    const full = solveNumbers(puzzle, STRICT_POLICY);
    const early = solveNumbers(puzzle, STRICT_POLICY, { stopAtExact: true });
    expect(early.exact).toBe(true);
    expect(early.exploredStates).toBeLessThanOrEqual(full.exploredStates);
  });

  it('una política menos restrictiva nunca empeora la mejor distancia', () => {
    const relaxed: NumbersPolicy = {
      ...STRICT_POLICY,
      requirePositiveIntegerIntermediates: false,
      requireExactDivision: false,
    };
    for (let seed = 1; seed <= 15; seed++) {
      const random = testRandom(seed);
      const values = Array.from({ length: 4 }, () => 1 + Math.floor(random() * 10));
      const puzzle = puzzleOf(values, 100 + Math.floor(random() * 900));
      const strict = solveNumbers(puzzle, STRICT_POLICY);
      const loose = solveNumbers(puzzle, relaxed);
      expect(loose.bestDistance).toBeLessThanOrEqual(strict.bestDistance);
    }
  });

  it('el testigo siempre supera el validador, no repite fichas y coincide con el valor óptimo (60 puzzles)', () => {
    for (let seed = 1; seed <= 60; seed++) {
      const random = testRandom(seed);
      const values = Array.from({ length: 6 }, () =>
        random() < 0.25
          ? [25, 50, 75, 100][Math.floor(random() * 4)]!
          : 1 + Math.floor(random() * 10),
      );
      const puzzle = puzzleOf(values, 100 + Math.floor(random() * 900));
      const solution = solveNumbers(puzzle, STRICT_POLICY);
      const validated = validateExpression(puzzle, solution.witness, STRICT_POLICY);
      expect(validated.ok).toBe(true);
      if (!validated.ok) continue;
      expect(validated.value).toEqual(solution.bestValue);
      expect(new Set(validated.tilesUsed).size).toBe(validated.tilesUsed.length);
      expect(Math.abs(validated.value.n / validated.value.d - puzzle.target)).toBe(
        solution.bestDistance,
      );
    }
  });

  it('resuelve un puzzle de seis fichas en un tiempo razonable', () => {
    const started = Date.now();
    solveNumbers(puzzleOf([100, 75, 50, 25, 10, 9], 999), STRICT_POLICY);
    expect(Date.now() - started).toBeLessThan(5000);
  });
});

describe('generateNumbersPuzzle', () => {
  const options = { policy: STRICT_POLICY };

  it('es determinista: misma semilla → mismo puzzle', () => {
    const a = generateNumbersPuzzle(testRandom(42), options);
    const b = generateNumbersPuzzle(testRandom(42), options);
    expect(a.puzzle).toEqual(b.puzzle);
  });

  it('semillas distintas suelen producir puzzles distintos', () => {
    const a = generateNumbersPuzzle(testRandom(1), options).puzzle;
    const b = generateNumbersPuzzle(testRandom(2), options).puzzle;
    expect(a).not.toEqual(b);
  });

  it('respeta la composición de fichas, el rango del objetivo y la resolubilidad exacta', () => {
    for (let seed = 1; seed <= 25; seed++) {
      const { puzzle, solution } = generateNumbersPuzzle(testRandom(seed), options);
      expect(puzzle.tiles).toHaveLength(6);
      expect(new Set(puzzle.tiles.map((t) => t.id)).size).toBe(6);
      expect(puzzle.target).toBeGreaterThanOrEqual(100);
      expect(puzzle.target).toBeLessThanOrEqual(999);
      expect(solution.exact).toBe(true);
      expect(solution.operationCount).toBeGreaterThanOrEqual(2);

      const counts = new Map<number, number>();
      for (const t of puzzle.tiles) counts.set(t.value, (counts.get(t.value) ?? 0) + 1);
      for (const [value, count] of counts) {
        const isBig = [25, 50, 75, 100].includes(value);
        expect(count).toBeLessThanOrEqual(isBig ? 1 : 2);
        expect(isBig || (value >= 1 && value <= 10)).toBe(true);
      }
      expect(puzzle.tiles.some((t) => t.value === puzzle.target)).toBe(false);
    }
  });

  it('bigTileCount fija el número de fichas grandes', () => {
    const { puzzle } = generateNumbersPuzzle(testRandom(7), { ...options, bigTileCount: 4 });
    expect(puzzle.tiles.filter((t) => [25, 50, 75, 100].includes(t.value))).toHaveLength(4);
  });
});
