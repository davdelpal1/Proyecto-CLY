import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  applyNumbersAction,
  buildNumbersReview,
  createNumbersRound,
  createNumbersSession,
} from '@cly/game-engine';
import type { NumbersAction, NumbersRejectionCode } from '@cly/game-engine';
import { replaySteps } from '@cly/numbers-engine';
import type { Operator } from '@cly/numbers-engine';
import { systemClock } from '../../adapters/clock';
import { ACTIVE_RULESET } from '../../config/ruleset';

const TICK_MS = 200;

/**
 * Conecta el motor puro de cifras con React. Toda la lógica vive en `@cly/game-engine`:
 * este hook solo (1) inyecta el reloj, (2) mantiene el estado y (3) cierra la ronda al vencer el plazo.
 *
 * El ejercicio se fija al montar: para otro ejercicio hay que remontar el componente (`key`).
 * La solución del solver se guarda aquí pero solo se expone dentro de `review`, tras el cierre.
 */
export function useNumbersSession(seed: string, timed: boolean) {
  const round = useMemo(() => createNumbersRound(ACTIVE_RULESET, seed), [seed]);

  const [state, setState] = useState(() =>
    createNumbersSession({
      ruleset: ACTIVE_RULESET,
      puzzle: round.puzzle,
      config: { mode: 'TRAINING', timing: { kind: timed ? 'RULESET' : 'UNTIMED' } },
    }),
  );
  const stateRef = useRef(state);
  const [nowMs, setNowMs] = useState(() => systemClock.nowMs());

  const dispatch = useCallback((action: NumbersAction): NumbersRejectionCode | null => {
    const now = systemClock.nowMs();
    const result = applyNumbersAction(stateRef.current, action, now);
    stateRef.current = result.state;
    setState(result.state);
    setNowMs(now);
    return result.rejection?.code ?? null;
  }, []);

  // Reloj de pantalla + cierre automático al vencer el plazo (el deadline lo decide el motor).
  useEffect(() => {
    if (state.status !== 'RUNNING' || state.deadlineMs === null) return;
    const id = setInterval(() => {
      const now = systemClock.nowMs();
      setNowMs(now);
      const deadline = stateRef.current.deadlineMs;
      if (deadline !== null && now > deadline) dispatch({ type: 'TICK' });
    }, TICK_MS);
    return () => clearInterval(id);
  }, [state.status, state.deadlineMs, dispatch]);

  const entries = useMemo(() => {
    const replay = replaySteps(state.puzzle, state.steps, state.policy);
    return replay.ok ? replay.entries : [];
  }, [state.puzzle, state.steps, state.policy]);

  const review = useMemo(
    () => (state.status === 'FINISHED' ? buildNumbersReview(state, round.solution) : null),
    [state, round.solution],
  );

  let remainingMs: number | null = null;
  if (state.durationMs !== null) {
    if (state.status === 'READY') remainingMs = state.durationMs;
    else if (state.deadlineMs !== null) {
      remainingMs = Math.max(0, state.deadlineMs - (state.finishedAtMs ?? nowMs));
    }
  }

  const start = useCallback(() => {
    if (stateRef.current.status === 'READY') dispatch({ type: 'START' });
  }, [dispatch]);
  const applyStep = useCallback(
    (left: string, op: Operator, right: string) =>
      dispatch({ type: 'APPLY_STEP', left, op, right }),
    [dispatch],
  );
  const undo = useCallback(() => dispatch({ type: 'UNDO' }), [dispatch]);
  const reset = useCallback(() => dispatch({ type: 'RESET' }), [dispatch]);
  const submit = useCallback((itemId: string) => dispatch({ type: 'SUBMIT', itemId }), [dispatch]);
  const giveUp = useCallback(() => dispatch({ type: 'GIVE_UP' }), [dispatch]);

  return {
    state,
    entries,
    review,
    remainingMs,
    totalMs: state.durationMs,
    start,
    applyStep,
    undo,
    reset,
    submit,
    giveUp,
  };
}

export type NumbersSessionApi = ReturnType<typeof useNumbersSession>;
