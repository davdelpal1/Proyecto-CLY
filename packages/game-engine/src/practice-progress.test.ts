import { describe, expect, it } from 'vitest';
import {
  EMPTY_PROGRESS,
  getPuzzleStats,
  parsePracticeProgress,
  recordPracticeResult,
  serializePracticeProgress,
} from './practice-progress';
import type { PracticeProgress, PracticeResult } from './practice-progress';

const result = (patch: Partial<PracticeResult> = {}): PracticeResult => ({
  puzzle: 'NUMBER',
  outcome: 'EXACT',
  elapsedMs: 10_000,
  atEpochMs: 1_000,
  ...patch,
});

const play = (outcomes: PracticeResult[]): PracticeProgress =>
  outcomes.reduce(recordPracticeResult, EMPTY_PROGRESS);

describe('recordPracticeResult', () => {
  it('cuenta cada resultado y guarda la última práctica', () => {
    const progress = play([
      result({ outcome: 'EXACT' }),
      result({ outcome: 'CLOSE', atEpochMs: 2_000 }),
      result({ outcome: 'EXPIRED', atEpochMs: 3_000 }),
      result({ outcome: 'GAVE_UP', atEpochMs: 4_000 }),
    ]);
    expect(getPuzzleStats(progress, 'NUMBER')).toMatchObject({
      played: 4,
      exact: 1,
      close: 1,
      expired: 1,
      gaveUp: 1,
    });
    expect(progress.last).toEqual({ puzzle: 'NUMBER', atEpochMs: 4_000 });
  });

  it('la racha de exactos se rompe con cualquier otro resultado y se conserva la mejor', () => {
    const progress = play([result(), result(), result(), result({ outcome: 'CLOSE' }), result()]);
    expect(getPuzzleStats(progress, 'NUMBER')).toMatchObject({
      currentExactStreak: 1,
      bestExactStreak: 3,
    });
    expect(
      getPuzzleStats(play([result(), result({ outcome: 'GAVE_UP' })]), 'NUMBER').currentExactStreak,
    ).toBe(0);
  });

  it('guarda el exacto más rápido y no lo empeora', () => {
    const progress = play([
      result({ elapsedMs: 20_000 }),
      result({ elapsedMs: 8_000 }),
      result({ elapsedMs: 30_000 }),
      result({ outcome: 'CLOSE', elapsedMs: 1_000 }),
    ]);
    expect(getPuzzleStats(progress, 'NUMBER').fastestExactMs).toBe(8_000);
  });

  it('un resultado INVALID no cuenta como partida', () => {
    expect(recordPracticeResult(EMPTY_PROGRESS, result({ outcome: 'INVALID' }))).toBe(
      EMPTY_PROGRESS,
    );
  });

  it('es inmutable: no modifica el progreso anterior', () => {
    const before = play([result()]);
    const snapshot = JSON.stringify(before);
    recordPracticeResult(before, result());
    expect(JSON.stringify(before)).toBe(snapshot);
  });

  it('una prueba sin jugar devuelve estadísticas vacías', () => {
    expect(getPuzzleStats(EMPTY_PROGRESS, 'LETTERS').played).toBe(0);
  });
});

describe('parsePracticeProgress', () => {
  it('ida y vuelta sin pérdida', () => {
    const progress = play([result(), result({ outcome: 'CLOSE', atEpochMs: 5 })]);
    expect(parsePracticeProgress(serializePracticeProgress(progress))).toEqual(progress);
  });

  it.each([
    ['null', null],
    ['texto que no es JSON', '{no es json'],
    ['JSON no objeto', '42'],
    ['JSON null', 'null'],
    ['otra versión', '{"version":2,"byPuzzle":{},"last":null}'],
  ])('devuelve progreso vacío ante %s', (_name, raw) => {
    expect(parsePracticeProgress(raw)).toEqual(EMPTY_PROGRESS);
  });

  it('descarta solo las entradas inválidas y conserva las buenas', () => {
    const good = serializePracticeProgress(play([result()]));
    const parsed = JSON.parse(good) as PracticeProgress;
    const tampered = JSON.stringify({
      ...parsed,
      byPuzzle: {
        ...parsed.byPuzzle,
        LETTERS: { played: -3 },
        NO_EXISTE: parsed.byPuzzle.NUMBER,
        KEY: { ...parsed.byPuzzle.NUMBER, played: 'muchas' },
      },
      last: { puzzle: 'NO_EXISTE', atEpochMs: 1 },
    });
    const result2 = parsePracticeProgress(tampered);
    expect(Object.keys(result2.byPuzzle)).toEqual(['NUMBER']);
    expect(result2.last).toBeNull();
  });
});
