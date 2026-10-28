import { describe, expect, it } from 'vitest';
import { EMPTY_PUZZLE_STATS } from '@cly/game-engine';
import type { PuzzleStats } from '@cly/game-engine';
import { describeProgress } from './progress-line';

const stats = (patch: Partial<PuzzleStats>): PuzzleStats => ({ ...EMPTY_PUZZLE_STATS, ...patch });

describe('describeProgress', () => {
  it('no dice nada si todavía no hay partidas', () => {
    expect(describeProgress('NUMBER', EMPTY_PUZZLE_STATS)).toBeUndefined();
    expect(describeProgress('LETTERS', EMPTY_PUZZLE_STATS)).toBeUndefined();
  });

  it('cifras: singular, plural y racha', () => {
    expect(describeProgress('NUMBER', stats({ played: 1, exact: 1, currentExactStreak: 1 }))).toBe(
      'Llevas 1 exacta en 1 jugada.',
    );
    expect(describeProgress('NUMBER', stats({ played: 3, exact: 2, currentExactStreak: 1 }))).toBe(
      'Llevas 2 exactas en 3 jugadas.',
    );
    expect(describeProgress('NUMBER', stats({ played: 3, exact: 3, currentExactStreak: 3 }))).toBe(
      'Racha: 3 exactas seguidas.',
    );
  });

  it('letras: singular, plural y racha', () => {
    expect(describeProgress('LETTERS', stats({ played: 1, exact: 1, currentExactStreak: 1 }))).toBe(
      'Llevas 1 vez la palabra más larga en 1 jugada.',
    );
    expect(describeProgress('LETTERS', stats({ played: 4, exact: 0 }))).toBe(
      'Llevas 0 veces la palabra más larga en 4 jugadas.',
    );
    expect(describeProgress('LETTERS', stats({ played: 3, exact: 2, currentExactStreak: 2 }))).toBe(
      'Racha: 2 veces seguidas con la palabra más larga.',
    );
  });
});
