import { generateNumbersPuzzle, replaySteps, validateExpression } from '@cly/numbers-engine';
import type {
  CalcStep,
  ExpressionTree,
  GeneratedNumbersPuzzle,
  NumbersErrorCode,
  NumbersPolicy,
  NumbersPuzzle,
  Operator,
  Rational,
} from '@cly/numbers-engine';
import { createSeededRandom } from './rng';
import type { Ruleset } from './ruleset';
import type { GameMode } from './types';

/* -------------------------------------------------------------------------- */
/* Configuración derivada del ruleset                                          */
/* -------------------------------------------------------------------------- */

export function numbersPolicyFromRuleset(ruleset: Ruleset): NumbersPolicy {
  const { allowedOperators, requirePositiveIntegerIntermediates, requireExactDivision } =
    ruleset.numberRules;
  return { allowedOperators, requirePositiveIntegerIntermediates, requireExactDivision };
}

/** Genera un ejercicio reproducible: misma semilla y mismo ruleset ⇒ mismo puzzle en cualquier plataforma. */
export function createNumbersRound(
  ruleset: Ruleset,
  seed: string | number,
): GeneratedNumbersPuzzle {
  const { numberRules, numberTiles } = ruleset;
  return generateNumbersPuzzle(createSeededRandom(seed), {
    policy: numbersPolicyFromRuleset(ruleset),
    tilesPerRound: numberRules.tilesPerRound,
    targetRange: { min: numberRules.minTarget, max: numberRules.maxTarget },
    smallValues: numberTiles.smallValues,
    smallCopies: numberTiles.smallCopies,
    bigValues: numberTiles.bigValues,
    bigCountRange: numberTiles.bigCountRange,
  });
}

/**
 * Temporización de la sesión. Es una variación de práctica explícita: nunca modifica el ruleset
 * (GAME_RULES.md §3.4). `UNTIMED` es "Practicar sin presión".
 */
export type TimingConfig = { readonly kind: 'RULESET' } | { readonly kind: 'UNTIMED' };

export interface NumbersSessionConfig {
  readonly mode: GameMode;
  readonly timing: TimingConfig;
}

/* -------------------------------------------------------------------------- */
/* Estado, acciones y eventos                                                  */
/* -------------------------------------------------------------------------- */

export type NumbersRoundResult =
  | {
      readonly kind: 'SUBMITTED';
      readonly itemId: string;
      readonly value: Rational;
      readonly distance: number;
      readonly exact: boolean;
      readonly expression: ExpressionTree;
    }
  | { readonly kind: 'INVALID'; readonly code: NumbersErrorCode }
  | { readonly kind: 'EXPIRED' }
  | { readonly kind: 'GAVE_UP' };

export interface NumbersSessionState {
  readonly rulesetId: string;
  readonly rulesetRevision: string;
  readonly mode: GameMode;
  readonly puzzle: NumbersPuzzle;
  readonly policy: NumbersPolicy;
  /** `null` = sin límite de tiempo. */
  readonly durationMs: number | null;
  readonly status: 'READY' | 'RUNNING' | 'FINISHED';
  readonly startedAtMs: number | null;
  readonly deadlineMs: number | null;
  readonly finishedAtMs: number | null;
  readonly steps: readonly CalcStep[];
  readonly result: NumbersRoundResult | null;
  readonly sequence: number;
}

export type NumbersAction =
  | { readonly type: 'START' }
  | {
      readonly type: 'APPLY_STEP';
      readonly left: string;
      readonly op: Operator;
      readonly right: string;
    }
  | { readonly type: 'UNDO' }
  | { readonly type: 'RESET' }
  | { readonly type: 'SUBMIT'; readonly itemId: string }
  | { readonly type: 'GIVE_UP' }
  /** Permite al shell cerrar la ronda al vencer el plazo sin que el jugador haga nada. */
  | { readonly type: 'TICK' };

interface EventBase {
  readonly sequence: number;
  readonly atMs: number;
}

export type NumbersEvent =
  | (EventBase & { readonly type: 'ROUND_STARTED'; readonly deadlineMs: number | null })
  | (EventBase & { readonly type: 'STEP_APPLIED'; readonly step: CalcStep })
  | (EventBase & { readonly type: 'STEP_UNDONE' })
  | (EventBase & { readonly type: 'STEPS_RESET' })
  | (EventBase & { readonly type: 'ANSWER_SUBMITTED'; readonly result: NumbersRoundResult })
  | (EventBase & { readonly type: 'ROUND_EXPIRED' })
  | (EventBase & { readonly type: 'ROUND_GAVE_UP' });

type DistributiveOmit<T, K extends PropertyKey> = T extends unknown ? Omit<T, K> : never;

export type NumbersRejectionCode =
  NumbersErrorCode | 'INVALID_STATE' | 'DEADLINE_EXPIRED' | 'NOTHING_TO_UNDO';

export interface NumbersRejection {
  readonly code: NumbersRejectionCode;
}

export interface NumbersApplyResult {
  readonly state: NumbersSessionState;
  readonly events: readonly NumbersEvent[];
  readonly rejection: NumbersRejection | null;
}

/* -------------------------------------------------------------------------- */
/* Creación                                                                    */
/* -------------------------------------------------------------------------- */

export function createNumbersSession(params: {
  readonly ruleset: Ruleset;
  readonly puzzle: NumbersPuzzle;
  readonly config: NumbersSessionConfig;
}): NumbersSessionState {
  const { ruleset, puzzle, config } = params;
  return {
    rulesetId: ruleset.rulesetId,
    rulesetRevision: ruleset.revision,
    mode: config.mode,
    puzzle,
    policy: numbersPolicyFromRuleset(ruleset),
    durationMs:
      config.timing.kind === 'UNTIMED' ? null : ruleset.stages.classic.numberDurationSeconds * 1000,
    status: 'READY',
    startedAtMs: null,
    deadlineMs: null,
    finishedAtMs: null,
    steps: [],
    result: null,
    sequence: 0,
  };
}

/* -------------------------------------------------------------------------- */
/* Reducer de eventos (puro y determinista) y replay                           */
/* -------------------------------------------------------------------------- */

export function reduceNumbersEvent(
  state: NumbersSessionState,
  event: NumbersEvent,
): NumbersSessionState {
  const next = { ...state, sequence: event.sequence };
  switch (event.type) {
    case 'ROUND_STARTED':
      return { ...next, status: 'RUNNING', startedAtMs: event.atMs, deadlineMs: event.deadlineMs };
    case 'STEP_APPLIED':
      return { ...next, steps: [...state.steps, event.step] };
    case 'STEP_UNDONE':
      return { ...next, steps: state.steps.slice(0, -1) };
    case 'STEPS_RESET':
      return { ...next, steps: [] };
    case 'ANSWER_SUBMITTED':
      return { ...next, status: 'FINISHED', finishedAtMs: event.atMs, result: event.result };
    case 'ROUND_EXPIRED':
      return { ...next, status: 'FINISHED', finishedAtMs: event.atMs, result: { kind: 'EXPIRED' } };
    case 'ROUND_GAVE_UP':
      return { ...next, status: 'FINISHED', finishedAtMs: event.atMs, result: { kind: 'GAVE_UP' } };
  }
}

/** Reconstruye el estado final desde el inicial y el log de eventos. */
export function replayNumbersEvents(
  initial: NumbersSessionState,
  events: readonly NumbersEvent[],
): NumbersSessionState {
  return events.reduce(reduceNumbersEvent, initial);
}

/* -------------------------------------------------------------------------- */
/* Aplicación de acciones                                                      */
/* -------------------------------------------------------------------------- */

/**
 * Valida una acción y produce los eventos resultantes. El tiempo entra por `nowMs`
 * (reloj inyectado) y nunca se lee de la plataforma. Una acción recibida después del
 * deadline cierra la ronda como `EXPIRED` y se rechaza con `DEADLINE_EXPIRED`.
 */
export function applyNumbersAction(
  state: NumbersSessionState,
  action: NumbersAction,
  nowMs: number,
): NumbersApplyResult {
  let current = state;
  const events: NumbersEvent[] = [];

  const emit = (event: DistributiveOmit<NumbersEvent, 'sequence'>): void => {
    const full = { ...event, sequence: current.sequence + 1 } as NumbersEvent;
    events.push(full);
    current = reduceNumbersEvent(current, full);
  };
  const reject = (code: NumbersRejectionCode): NumbersApplyResult => ({
    state: current,
    events,
    rejection: { code },
  });
  const done = (): NumbersApplyResult => ({ state: current, events, rejection: null });

  if (action.type === 'START') {
    if (current.status !== 'READY') return reject('INVALID_STATE');
    emit({
      type: 'ROUND_STARTED',
      atMs: nowMs,
      deadlineMs: current.durationMs === null ? null : nowMs + current.durationMs,
    });
    return done();
  }

  if (current.status !== 'RUNNING') {
    return action.type === 'TICK' ? done() : reject('INVALID_STATE');
  }

  if (current.deadlineMs !== null && nowMs > current.deadlineMs) {
    emit({ type: 'ROUND_EXPIRED', atMs: current.deadlineMs });
    return action.type === 'TICK' ? done() : reject('DEADLINE_EXPIRED');
  }

  switch (action.type) {
    case 'TICK':
      return done();

    case 'APPLY_STEP': {
      const step: CalcStep = {
        resultId: `r${current.steps.length + 1}`,
        left: action.left,
        op: action.op,
        right: action.right,
      };
      const replay = replaySteps(current.puzzle, [...current.steps, step], current.policy);
      if (!replay.ok) return reject(replay.error.code);
      emit({ type: 'STEP_APPLIED', atMs: nowMs, step });
      return done();
    }

    case 'UNDO':
      if (current.steps.length === 0) return reject('NOTHING_TO_UNDO');
      emit({ type: 'STEP_UNDONE', atMs: nowMs });
      return done();

    case 'RESET':
      if (current.steps.length === 0) return done();
      emit({ type: 'STEPS_RESET', atMs: nowMs });
      return done();

    case 'GIVE_UP':
      emit({ type: 'ROUND_GAVE_UP', atMs: nowMs });
      return done();

    case 'SUBMIT': {
      const replay = replaySteps(current.puzzle, current.steps, current.policy);
      if (!replay.ok) return reject(replay.error.code);
      const entry = replay.entries.find((e) => e.id === action.itemId);
      if (!entry) return reject('UNKNOWN_ITEM');
      if (entry.consumed) return reject('TILE_REUSED');

      // Se revalida la expresión con el validador canónico: el mismo que usará el servidor online.
      const validation = validateExpression(current.puzzle, entry.expression, current.policy);
      let result: NumbersRoundResult;
      if (validation.ok) {
        const distance = Math.abs(validation.value.n / validation.value.d - current.puzzle.target);
        result = {
          kind: 'SUBMITTED',
          itemId: entry.id,
          value: validation.value,
          distance,
          exact: distance === 0,
          expression: entry.expression,
        };
      } else {
        result = { kind: 'INVALID', code: validation.error.code };
      }
      emit({ type: 'ANSWER_SUBMITTED', atMs: nowMs, result });
      return done();
    }
  }
}
