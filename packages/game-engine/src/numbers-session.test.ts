import { describe, expect, it, vi } from 'vitest';
import { rational } from '@cly/numbers-engine';
import type { NumbersPuzzle } from '@cly/numbers-engine';
import {
  applyNumbersAction,
  createNumbersRound,
  createNumbersSession,
  replayNumbersEvents,
} from './numbers-session';
import type { NumbersAction, NumbersEvent, NumbersSessionState } from './numbers-session';
import { RTVE_2026_REFERENCE } from './ruleset';

// Ejemplo técnico de GAME_RULES.md: fichas [25, 7, 3, 2, 10, 5] → ids n1..n6, objetivo 150.
const PUZZLE: NumbersPuzzle = {
  tiles: [25, 7, 3, 2, 10, 5].map((value, i) => ({ id: `n${i + 1}`, value })),
  target: 150,
};

const fresh = (timing: 'RULESET' | 'UNTIMED' = 'RULESET'): NumbersSessionState =>
  createNumbersSession({
    ruleset: RTVE_2026_REFERENCE,
    puzzle: PUZZLE,
    config: { mode: 'TRAINING', timing: { kind: timing } },
  });

const T0 = 1_000;
const DEADLINE = T0 + 40_000;

/** Ejecuta acciones a tiempos dados acumulando eventos; se detiene si alguna se rechaza. */
function run(initial: NumbersSessionState, script: readonly [NumbersAction, number][]) {
  let state = initial;
  const events: NumbersEvent[] = [];
  const rejections: (string | null)[] = [];
  for (const [action, at] of script) {
    const result = applyNumbersAction(state, action, at);
    state = result.state;
    events.push(...result.events);
    rejections.push(result.rejection?.code ?? null);
  }
  return { state, events, rejections };
}

const step = (
  left: string,
  op: 'add' | 'subtract' | 'multiply' | 'divide',
  right: string,
): NumbersAction => ({
  type: 'APPLY_STEP',
  left,
  op,
  right,
});

describe('ciclo de la sesión', () => {
  it('START fija el deadline a partir del reloj inyectado (40 s en el perfil de referencia)', () => {
    const { state } = run(fresh(), [[{ type: 'START' }, T0]]);
    expect(state).toMatchObject({ status: 'RUNNING', startedAtMs: T0, deadlineMs: DEADLINE });
  });

  it('"Practicar sin presión" no tiene deadline', () => {
    const { state } = run(fresh('UNTIMED'), [[{ type: 'START' }, T0]]);
    expect(state.deadlineMs).toBeNull();
    const late = applyNumbersAction(state, step('n5', 'add', 'n6'), T0 + 10 * 3_600_000);
    expect(late.rejection).toBeNull();
  });

  it('antes de START solo se acepta START', () => {
    const result = applyNumbersAction(fresh(), step('n5', 'add', 'n6'), T0);
    expect(result.rejection).toEqual({ code: 'INVALID_STATE' });
    expect(result.events).toHaveLength(0);
    expect(applyNumbersAction(fresh(), { type: 'START' }, T0).rejection).toBeNull();
  });

  it('no se puede iniciar dos veces', () => {
    const { rejections } = run(fresh(), [
      [{ type: 'START' }, T0],
      [{ type: 'START' }, T0 + 1],
    ]);
    expect(rejections).toEqual([null, 'INVALID_STATE']);
  });

  it('no consulta nunca el reloj del sistema: el tiempo es solo el parámetro inyectado', () => {
    const spy = vi.spyOn(Date, 'now');
    run(fresh(), [
      [{ type: 'START' }, T0],
      [step('n5', 'add', 'n6'), T0 + 1],
      [{ type: 'SUBMIT', itemId: 'r1' }, T0 + 2],
    ]);
    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });
});

describe('construcción, corrección y deshacer', () => {
  const started = run(fresh(), [[{ type: 'START' }, T0]]).state;

  it('aplica un paso, consume los operandos y crea el resultado', () => {
    const { state, rejections } = run(started, [[step('n5', 'add', 'n6'), T0 + 1]]);
    expect(rejections).toEqual([null]);
    expect(state.steps).toEqual([{ resultId: 'r1', left: 'n5', op: 'add', right: 'n6' }]);
  });

  it('deshacer retira el último paso y vuelve a liberar las fichas', () => {
    const { state, rejections } = run(started, [
      [step('n5', 'add', 'n6'), T0 + 1],
      [step('n2', 'add', 'n3'), T0 + 2],
      [{ type: 'UNDO' }, T0 + 3],
      [step('n2', 'multiply', 'n3'), T0 + 4], // n2 y n3 vuelven a estar disponibles
    ]);
    expect(rejections).toEqual([null, null, null, null]);
    expect(state.steps.map((s) => `${s.resultId}:${s.left}${s.op}${s.right}`)).toEqual([
      'r1:n5addn6',
      'r2:n2multiplyn3',
    ]);
  });

  it('deshacer sin pasos se rechaza sin cambiar el estado', () => {
    const result = applyNumbersAction(started, { type: 'UNDO' }, T0 + 1);
    expect(result.rejection).toEqual({ code: 'NOTHING_TO_UNDO' });
    expect(result.state).toBe(started);
  });

  it('reiniciar vacía todos los pasos', () => {
    const { state } = run(started, [
      [step('n5', 'add', 'n6'), T0 + 1],
      [{ type: 'RESET' }, T0 + 2],
    ]);
    expect(state.steps).toHaveLength(0);
  });

  it('NUM-01: reutilizar una ficha ya consumida se rechaza y no altera el estado', () => {
    const afterOne = run(started, [[step('n5', 'add', 'n6'), T0 + 1]]).state;
    const result = applyNumbersAction(afterOne, step('n5', 'multiply', 'n2'), T0 + 2);
    expect(result.rejection).toEqual({ code: 'TILE_REUSED' });
    expect(result.state).toBe(afterOne);
    expect(result.events).toHaveLength(0);
  });

  it('rechaza combinar una ficha consigo misma', () => {
    expect(applyNumbersAction(started, step('n1', 'add', 'n1'), T0 + 1).rejection).toEqual({
      code: 'TILE_REUSED',
    });
  });

  it('NUM-03: división no exacta rechazada por la política del ruleset', () => {
    expect(applyNumbersAction(started, step('n1', 'divide', 'n2'), T0 + 1).rejection).toEqual({
      code: 'NON_INTEGER_DIVISION',
    });
  });

  it('resta con resultado no positivo rechazada', () => {
    expect(applyNumbersAction(started, step('n3', 'subtract', 'n4'), T0 + 1).rejection).toBeNull(); // 3−2=1
    expect(applyNumbersAction(started, step('n3', 'subtract', 'n1'), T0 + 1).rejection).toEqual({
      code: 'NON_POSITIVE_RESULT',
    });
  });

  it('elementos inexistentes se rechazan', () => {
    expect(applyNumbersAction(started, step('n1', 'add', 'zz'), T0 + 1).rejection).toEqual({
      code: 'UNKNOWN_ITEM',
    });
  });
});

describe('confirmación', () => {
  const solved = [
    [{ type: 'START' }, T0],
    [step('n5', 'add', 'n6'), T0 + 1_000], // r1 = 10 + 5 = 15
    [step('n2', 'add', 'n3'), T0 + 2_000], // r2 = 7 + 3 = 10
    [step('r1', 'multiply', 'r2'), T0 + 3_000], // r3 = 150
  ] as const satisfies readonly [NumbersAction, number][];

  it('una solución exacta se valida y cierra la ronda', () => {
    const { state, rejections } = run(fresh(), [
      ...solved,
      [{ type: 'SUBMIT', itemId: 'r3' }, T0 + 5_000],
    ]);
    expect(rejections.every((r) => r === null)).toBe(true);
    expect(state.status).toBe('FINISHED');
    expect(state.finishedAtMs).toBe(T0 + 5_000);
    expect(state.result).toMatchObject({
      kind: 'SUBMITTED',
      itemId: 'r3',
      value: rational.rational(150),
      distance: 0,
      exact: true,
    });
  });

  it('una respuesta aproximada indica la distancia al objetivo', () => {
    const { state } = run(fresh(), [
      [{ type: 'START' }, T0],
      [step('n1', 'multiply', 'n3'), T0 + 1], // 25 × 3 = 75
      [{ type: 'SUBMIT', itemId: 'r1' }, T0 + 2],
    ]);
    expect(state.result).toMatchObject({ kind: 'SUBMITTED', distance: 75, exact: false });
  });

  it('se puede confirmar una ficha sin operar (se pueden dejar fichas sin usar)', () => {
    const { state } = run(fresh(), [
      [{ type: 'START' }, T0],
      [{ type: 'SUBMIT', itemId: 'n1' }, T0 + 1],
    ]);
    expect(state.result).toMatchObject({ kind: 'SUBMITTED', distance: 125 });
  });

  it('no se puede confirmar un elemento consumido ni inexistente', () => {
    const base = run(fresh(), solved).state;
    expect(
      applyNumbersAction(base, { type: 'SUBMIT', itemId: 'r1' }, T0 + 4_000).rejection,
    ).toEqual({
      code: 'TILE_REUSED',
    });
    expect(
      applyNumbersAction(base, { type: 'SUBMIT', itemId: 'nope' }, T0 + 4_000).rejection,
    ).toEqual({
      code: 'UNKNOWN_ITEM',
    });
  });

  it('tras terminar no se acepta ninguna acción de juego', () => {
    const finished = run(fresh(), [
      [{ type: 'START' }, T0],
      [{ type: 'SUBMIT', itemId: 'n1' }, T0 + 1],
    ]).state;
    for (const action of [
      step('n2', 'add', 'n3'),
      { type: 'UNDO' },
      { type: 'GIVE_UP' },
    ] as const) {
      expect(applyNumbersAction(finished, action, T0 + 2).rejection).toEqual({
        code: 'INVALID_STATE',
      });
    }
  });

  it('rendirse cierra la ronda sin respuesta', () => {
    const { state } = run(fresh('UNTIMED'), [
      [{ type: 'START' }, T0],
      [{ type: 'GIVE_UP' }, T0 + 9],
    ]);
    expect(state).toMatchObject({ status: 'FINISHED', result: { kind: 'GAVE_UP' } });
  });
});

describe('tiempo límite', () => {
  const running = run(fresh(), [[{ type: 'START' }, T0]]).state;

  it('una confirmación exactamente en el deadline todavía es válida', () => {
    const result = applyNumbersAction(running, { type: 'SUBMIT', itemId: 'n1' }, DEADLINE);
    expect(result.rejection).toBeNull();
    expect(result.state.result?.kind).toBe('SUBMITTED');
  });

  it('DEADLINE_EXPIRED: una confirmación tardía no cuenta y la ronda queda como EXPIRED', () => {
    const result = applyNumbersAction(running, { type: 'SUBMIT', itemId: 'n1' }, DEADLINE + 1);
    expect(result.rejection).toEqual({ code: 'DEADLINE_EXPIRED' });
    expect(result.state).toMatchObject({
      status: 'FINISHED',
      finishedAtMs: DEADLINE,
      result: { kind: 'EXPIRED' },
    });
  });

  it('una operación tardía tampoco se aplica', () => {
    const result = applyNumbersAction(running, step('n5', 'add', 'n6'), DEADLINE + 500);
    expect(result.rejection).toEqual({ code: 'DEADLINE_EXPIRED' });
    expect(result.state.steps).toHaveLength(0);
  });

  it('TICK cierra la ronda al vencer el plazo y no hace nada antes', () => {
    expect(applyNumbersAction(running, { type: 'TICK' }, DEADLINE - 1).events).toHaveLength(0);
    const expired = applyNumbersAction(running, { type: 'TICK' }, DEADLINE + 5_000);
    expect(expired.rejection).toBeNull();
    expect(expired.state.result).toEqual({ kind: 'EXPIRED' });
    expect(expired.state.finishedAtMs).toBe(DEADLINE); // el instante lógico, no cuándo llegó el TICK
  });
});

describe('reproducibilidad (log de eventos)', () => {
  const script: [NumbersAction, number][] = [
    [{ type: 'START' }, T0],
    [step('n5', 'add', 'n6'), T0 + 1_000],
    [step('n2', 'add', 'n3'), T0 + 2_000],
    [{ type: 'UNDO' }, T0 + 2_500],
    [step('n2', 'multiply', 'n3'), T0 + 3_000],
    [step('r1', 'multiply', 'r2'), T0 + 4_000],
    [{ type: 'SUBMIT', itemId: 'r3' }, T0 + 6_000],
  ];

  it('replay del log desde el estado inicial reproduce exactamente el estado final', () => {
    const { state, events } = run(fresh(), script);
    expect(replayNumbersEvents(fresh(), events)).toEqual(state);
  });

  it('mismas acciones y tiempos ⇒ mismos eventos (determinismo)', () => {
    expect(run(fresh(), script).events).toEqual(run(fresh(), script).events);
  });

  it('las secuencias de eventos son consecutivas desde 1', () => {
    const { events } = run(fresh(), script);
    expect(events.map((e) => e.sequence)).toEqual(events.map((_, i) => i + 1));
  });

  it('los rechazos no generan eventos', () => {
    const { events } = run(fresh(), [
      [{ type: 'START' }, T0],
      [step('n1', 'divide', 'n2'), T0 + 1],
      [{ type: 'UNDO' }, T0 + 2],
    ]);
    expect(events.map((e) => e.type)).toEqual(['ROUND_STARTED']);
  });
});

describe('createNumbersRound', () => {
  it('es reproducible por semilla y cumple el ruleset', () => {
    const a = createNumbersRound(RTVE_2026_REFERENCE, 'semilla-1');
    const b = createNumbersRound(RTVE_2026_REFERENCE, 'semilla-1');
    const c = createNumbersRound(RTVE_2026_REFERENCE, 'semilla-2');
    expect(a.puzzle).toEqual(b.puzzle);
    expect(a.puzzle).not.toEqual(c.puzzle);
    expect(a.puzzle.tiles).toHaveLength(RTVE_2026_REFERENCE.numberRules.tilesPerRound);
    expect(a.puzzle.target).toBeGreaterThanOrEqual(RTVE_2026_REFERENCE.numberRules.minTarget);
    expect(a.puzzle.target).toBeLessThanOrEqual(RTVE_2026_REFERENCE.numberRules.maxTarget);
  });
});
