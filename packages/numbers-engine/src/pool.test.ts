import { describe, expect, it } from 'vitest';
import { validateExpression } from './evaluate';
import { formatExpression } from './format';
import { closestAvailable, nextResultId, replaySteps } from './pool';
import type { CalcStep } from './pool';
import { int } from './rational';
import { puzzleOf } from './test-helpers';
import { STRICT_POLICY } from './types';

const puzzle = puzzleOf([25, 7, 3, 2, 10, 5], 150);

const step = (index: number, left: string, op: CalcStep['op'], right: string): CalcStep => ({
  resultId: nextResultId(index),
  left,
  op,
  right,
});

describe('replaySteps', () => {
  it('sin pasos devuelve las seis fichas disponibles', () => {
    const replay = replaySteps(puzzle, [], STRICT_POLICY);
    expect(replay.ok && replay.entries).toHaveLength(6);
    expect(replay.ok && replay.entries.every((e) => !e.consumed)).toBe(true);
  });

  it('consume los operandos y añade el resultado', () => {
    const replay = replaySteps(puzzle, [step(0, 'n5', 'add', 'n6')], STRICT_POLICY);
    if (!replay.ok) throw new Error('inesperado');
    const byId = Object.fromEntries(replay.entries.map((e) => [e.id, e]));
    expect(byId['n5']?.consumed).toBe(true);
    expect(byId['n6']?.consumed).toBe(true);
    expect(byId['r1']).toMatchObject({ kind: 'result', value: int(15), consumed: false });
  });

  it('rechaza reutilizar una ficha ya consumida (TILE_REUSED)', () => {
    const steps = [step(0, 'n5', 'add', 'n6'), step(1, 'n5', 'multiply', 'n2')];
    const replay = replaySteps(puzzle, steps, STRICT_POLICY);
    expect(replay).toEqual({ ok: false, error: { code: 'TILE_REUSED' }, stepIndex: 1 });
  });

  it('rechaza combinar un elemento consigo mismo', () => {
    const replay = replaySteps(puzzle, [step(0, 'n1', 'add', 'n1')], STRICT_POLICY);
    expect(replay).toEqual({ ok: false, error: { code: 'TILE_REUSED' }, stepIndex: 0 });
  });

  it('rechaza elementos desconocidos y ids de resultado duplicados', () => {
    expect(replaySteps(puzzle, [step(0, 'n1', 'add', 'x9')], STRICT_POLICY)).toMatchObject({
      ok: false,
      error: { code: 'UNKNOWN_ITEM' },
    });
    const duplicated: CalcStep = { resultId: 'n1', left: 'n2', op: 'add', right: 'n3' };
    expect(replaySteps(puzzle, [duplicated], STRICT_POLICY)).toMatchObject({
      ok: false,
      error: { code: 'DUPLICATE_RESULT_ID' },
    });
  });

  it('propaga errores aritméticos con el índice del paso', () => {
    const replay = replaySteps(puzzle, [step(0, 'n1', 'divide', 'n2')], STRICT_POLICY);
    expect(replay).toEqual({ ok: false, error: { code: 'NON_INTEGER_DIVISION' }, stepIndex: 0 });
  });

  it('deshacer equivale a reproducir con un paso menos', () => {
    const steps = [step(0, 'n5', 'add', 'n6'), step(1, 'n2', 'add', 'n3')];
    const undone = replaySteps(puzzle, steps.slice(0, 1), STRICT_POLICY);
    const fresh = replaySteps(puzzle, [step(0, 'n5', 'add', 'n6')], STRICT_POLICY);
    expect(undone).toEqual(fresh);
  });

  it('la expresión acumulada de cada resultado supera el validador canónico con el mismo valor', () => {
    const steps = [
      step(0, 'n5', 'add', 'n6'), // r1 = 15
      step(1, 'n2', 'add', 'n3'), // r2 = 10
      step(2, 'r1', 'multiply', 'r2'), // r3 = 150
    ];
    const replay = replaySteps(puzzle, steps, STRICT_POLICY);
    if (!replay.ok) throw new Error('inesperado');
    const r3 = replay.entries.find((e) => e.id === 'r3');
    if (!r3) throw new Error('falta r3');
    const validated = validateExpression(puzzle, r3.expression, STRICT_POLICY);
    expect(validated.ok && validated.value).toEqual(int(150));
    expect(formatExpression(puzzle, r3.expression)).toBe('(10 + 5) × (7 + 3)');
  });
});

describe('closestAvailable', () => {
  it('elige el elemento disponible más cercano e ignora los consumidos', () => {
    const replay = replaySteps(puzzle, [step(0, 'n5', 'multiply', 'n6')], STRICT_POLICY); // r1 = 50
    if (!replay.ok) throw new Error('inesperado');
    expect(closestAvailable(replay.entries, 150)?.id).toBe('r1');
    expect(closestAvailable(replay.entries, 10)?.id).toBe('n2'); // 7; el 10 (n5) está consumido
  });
});
