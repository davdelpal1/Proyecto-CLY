import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  applyLettersAction,
  buildLettersReview,
  createLettersRound,
  createLettersSession,
  draftLetters,
} from '@cly/game-engine';
import type { LettersAction, LettersRejectionCode } from '@cly/game-engine';
import { systemClock } from '../../adapters/clock';
import type { LoadedLexicon } from '../../adapters/lexicon';
import { ACTIVE_RULESET } from '../../config/ruleset';

const TICK_MS = 200;

/**
 * Conecta el motor puro de letras con React. Toda la lógica vive en `@cly/game-engine`: este hook
 * solo (1) inyecta el reloj y el léxico, (2) mantiene el estado y (3) cierra la ronda al vencer el plazo.
 *
 * El ejercicio se fija al montar: para otro ejercicio hay que remontar el componente (`key`).
 * La solución se calcula al repartir pero solo se expone dentro de `review`, tras el cierre.
 */
export function useLettersSession(seed: string, timed: boolean, loaded: LoadedLexicon) {
  const { lexicon, id: lexiconId } = loaded;
  const round = useMemo(() => createLettersRound(ACTIVE_RULESET, seed, lexicon), [seed, lexicon]);

  const [state, setState] = useState(() =>
    createLettersSession({
      ruleset: ACTIVE_RULESET,
      puzzle: round.puzzle,
      lexiconId,
      config: { mode: 'TRAINING', timing: { kind: timed ? 'RULESET' : 'UNTIMED' } },
    }),
  );
  const stateRef = useRef(state);
  const [nowMs, setNowMs] = useState(() => systemClock.nowMs());

  const dispatch = useCallback(
    (action: LettersAction): LettersRejectionCode | null => {
      const now = systemClock.nowMs();
      const result = applyLettersAction(stateRef.current, action, now, lexicon);
      stateRef.current = result.state;
      setState(result.state);
      setNowMs(now);
      return result.rejection?.code ?? null;
    },
    [lexicon],
  );

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

  const review = useMemo(
    () => (state.status === 'FINISHED' ? buildLettersReview(state, round.solution) : null),
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
  const pick = useCallback((tileId: string) => dispatch({ type: 'PICK', tileId }), [dispatch]);
  const unpick = useCallback(
    (tileId?: string) =>
      dispatch(tileId === undefined ? { type: 'UNPICK' } : { type: 'UNPICK', tileId }),
    [dispatch],
  );
  const clear = useCallback(() => dispatch({ type: 'CLEAR' }), [dispatch]);
  const submit = useCallback(() => dispatch({ type: 'SUBMIT' }), [dispatch]);
  const giveUp = useCallback(() => dispatch({ type: 'GIVE_UP' }), [dispatch]);

  return {
    state,
    word: draftLetters(state),
    review,
    remainingMs,
    totalMs: state.durationMs,
    start,
    pick,
    unpick,
    clear,
    submit,
    giveUp,
  };
}

export type LettersSessionApi = ReturnType<typeof useLettersSession>;
