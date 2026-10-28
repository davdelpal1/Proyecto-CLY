import type { LexiconTier, WordLookup } from '@cly/words-engine';
import { tileLetters } from './letters-round';
import type { LettersPuzzle } from './letters-round';
import { validateLettersAnswer } from './letters-validation';
import type { LettersErrorCode } from './letters-validation';
import type { TimingConfig } from './numbers-session';
import type { Ruleset } from './ruleset';
import type { GameMode } from './types';

/* -------------------------------------------------------------------------- */
/* Estado, acciones y eventos                                                  */
/* -------------------------------------------------------------------------- */

export type LettersRoundResult =
  | {
      readonly kind: 'SUBMITTED';
      /** La palabra tal como se escribe en el léxico («pingüino»). */
      readonly word: string;
      readonly length: number;
      readonly tier: LexiconTier;
      /** Fichas usadas, en orden. */
      readonly tileIds: readonly string[];
    }
  | { readonly kind: 'EXPIRED' }
  | { readonly kind: 'GAVE_UP' };

export interface LettersSessionState {
  readonly rulesetId: string;
  readonly rulesetRevision: string;
  /** Identifica el léxico exacto con el que se juzga (`ES_LEXICON_ID`): hace reproducible la partida. */
  readonly lexiconId: string;
  readonly mode: GameMode;
  readonly puzzle: LettersPuzzle;
  readonly minAnswerLength: number;
  readonly maxLexiconTier: LexiconTier;
  /** `null` = sin límite de tiempo. */
  readonly durationMs: number | null;
  readonly status: 'READY' | 'RUNNING' | 'FINISHED';
  readonly startedAtMs: number | null;
  readonly deadlineMs: number | null;
  readonly finishedAtMs: number | null;
  /** Fichas elegidas para formar la palabra, en orden. */
  readonly draft: readonly string[];
  readonly result: LettersRoundResult | null;
  readonly sequence: number;
}

export type LettersAction =
  | { readonly type: 'START' }
  | { readonly type: 'PICK'; readonly tileId: string }
  /** Quita una ficha de la palabra; sin `tileId`, la última. */
  | { readonly type: 'UNPICK'; readonly tileId?: string }
  | { readonly type: 'CLEAR' }
  | { readonly type: 'SUBMIT' }
  | { readonly type: 'GIVE_UP' }
  /** Permite al shell cerrar la ronda al vencer el plazo sin que el jugador haga nada. */
  | { readonly type: 'TICK' };

interface EventBase {
  readonly sequence: number;
  readonly atMs: number;
}

export type LettersEvent =
  | (EventBase & { readonly type: 'ROUND_STARTED'; readonly deadlineMs: number | null })
  | (EventBase & { readonly type: 'TILE_PICKED'; readonly tileId: string })
  | (EventBase & { readonly type: 'TILE_UNPICKED'; readonly tileId: string })
  | (EventBase & { readonly type: 'DRAFT_CLEARED' })
  | (EventBase & { readonly type: 'ANSWER_SUBMITTED'; readonly result: LettersRoundResult })
  | (EventBase & { readonly type: 'ROUND_EXPIRED' })
  | (EventBase & { readonly type: 'ROUND_GAVE_UP' });

type DistributiveOmit<T, K extends PropertyKey> = T extends unknown ? Omit<T, K> : never;

export type LettersRejectionCode =
  | LettersErrorCode
  | 'INVALID_STATE'
  | 'DEADLINE_EXPIRED'
  | 'UNKNOWN_TILE'
  | 'TILE_ALREADY_PICKED'
  | 'TILE_NOT_PICKED'
  | 'NOTHING_TO_UNDO';

export interface LettersRejection {
  readonly code: LettersRejectionCode;
}

export interface LettersApplyResult {
  readonly state: LettersSessionState;
  readonly events: readonly LettersEvent[];
  readonly rejection: LettersRejection | null;
}

export interface LettersSessionConfig {
  readonly mode: GameMode;
  readonly timing: TimingConfig;
}

/* -------------------------------------------------------------------------- */
/* Creación                                                                    */
/* -------------------------------------------------------------------------- */

export function createLettersSession(params: {
  readonly ruleset: Ruleset;
  readonly puzzle: LettersPuzzle;
  readonly lexiconId: string;
  readonly config: LettersSessionConfig;
}): LettersSessionState {
  const { ruleset, puzzle, lexiconId, config } = params;
  return {
    rulesetId: ruleset.rulesetId,
    rulesetRevision: ruleset.revision,
    lexiconId,
    mode: config.mode,
    puzzle,
    minAnswerLength: ruleset.letterRules.minAnswerLength,
    maxLexiconTier: ruleset.letterRules.maxLexiconTier,
    durationMs:
      config.timing.kind === 'UNTIMED' ? null : ruleset.stages.classic.letterDurationSeconds * 1000,
    status: 'READY',
    startedAtMs: null,
    deadlineMs: null,
    finishedAtMs: null,
    draft: [],
    result: null,
    sequence: 0,
  };
}

/** La palabra que forman ahora las fichas elegidas (en minúscula y sin tildes). */
export function draftLetters(state: LettersSessionState): string {
  const letterOf = new Map(state.puzzle.tiles.map((tile) => [tile.id, tile.letter]));
  return state.draft.map((id) => letterOf.get(id) ?? '').join('');
}

/* -------------------------------------------------------------------------- */
/* Reducer de eventos (puro y determinista) y replay                           */
/* -------------------------------------------------------------------------- */

export function reduceLettersEvent(
  state: LettersSessionState,
  event: LettersEvent,
): LettersSessionState {
  const next = { ...state, sequence: event.sequence };
  switch (event.type) {
    case 'ROUND_STARTED':
      return { ...next, status: 'RUNNING', startedAtMs: event.atMs, deadlineMs: event.deadlineMs };
    case 'TILE_PICKED':
      return { ...next, draft: [...state.draft, event.tileId] };
    case 'TILE_UNPICKED':
      return { ...next, draft: state.draft.filter((id) => id !== event.tileId) };
    case 'DRAFT_CLEARED':
      return { ...next, draft: [] };
    case 'ANSWER_SUBMITTED':
      return { ...next, status: 'FINISHED', finishedAtMs: event.atMs, result: event.result };
    case 'ROUND_EXPIRED':
      return { ...next, status: 'FINISHED', finishedAtMs: event.atMs, result: { kind: 'EXPIRED' } };
    case 'ROUND_GAVE_UP':
      return { ...next, status: 'FINISHED', finishedAtMs: event.atMs, result: { kind: 'GAVE_UP' } };
  }
}

/** Reconstruye el estado final desde el inicial y el log de eventos. */
export function replayLettersEvents(
  initial: LettersSessionState,
  events: readonly LettersEvent[],
): LettersSessionState {
  return events.reduce(reduceLettersEvent, initial);
}

/* -------------------------------------------------------------------------- */
/* Aplicación de acciones                                                      */
/* -------------------------------------------------------------------------- */

/**
 * Valida una acción y produce los eventos resultantes. El tiempo entra por `nowMs` y el léxico por
 * `lexicon` (ambos inyectados: el motor no lee reloj ni carga datos). Una acción recibida después
 * del deadline cierra la ronda como `EXPIRED` y se rechaza con `DEADLINE_EXPIRED`.
 *
 * Una palabra que no supera la validación se RECHAZA sin cerrar la ronda (GAME_RULES.md §3.2:
 * «error de forma»): se puede corregir mientras quede tiempo. Cuando haya servidor, cada intento
 * rechazado debe contar para un límite de frecuencia, porque el rechazo revela si una palabra existe.
 */
export function applyLettersAction(
  state: LettersSessionState,
  action: LettersAction,
  nowMs: number,
  lexicon: WordLookup,
): LettersApplyResult {
  let current = state;
  const events: LettersEvent[] = [];

  const emit = (event: DistributiveOmit<LettersEvent, 'sequence'>): void => {
    const full = { ...event, sequence: current.sequence + 1 } as LettersEvent;
    events.push(full);
    current = reduceLettersEvent(current, full);
  };
  const reject = (code: LettersRejectionCode): LettersApplyResult => ({
    state: current,
    events,
    rejection: { code },
  });
  const done = (): LettersApplyResult => ({ state: current, events, rejection: null });

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

    case 'PICK':
      if (!current.puzzle.tiles.some((tile) => tile.id === action.tileId)) {
        return reject('UNKNOWN_TILE');
      }
      if (current.draft.includes(action.tileId)) return reject('TILE_ALREADY_PICKED');
      emit({ type: 'TILE_PICKED', atMs: nowMs, tileId: action.tileId });
      return done();

    case 'UNPICK': {
      const tileId = action.tileId ?? current.draft[current.draft.length - 1];
      if (tileId === undefined) return reject('NOTHING_TO_UNDO');
      if (!current.draft.includes(tileId)) return reject('TILE_NOT_PICKED');
      emit({ type: 'TILE_UNPICKED', atMs: nowMs, tileId });
      return done();
    }

    case 'CLEAR':
      if (current.draft.length === 0) return done();
      emit({ type: 'DRAFT_CLEARED', atMs: nowMs });
      return done();

    case 'GIVE_UP':
      emit({ type: 'ROUND_GAVE_UP', atMs: nowMs });
      return done();

    case 'SUBMIT': {
      // Se revalida con el validador canónico: el mismo que usará el servidor online.
      const word = draftLetters(current);
      const validation = validateLettersAnswer(
        tileLetters(current.puzzle),
        word,
        { minAnswerLength: current.minAnswerLength, maxLexiconTier: current.maxLexiconTier },
        lexicon,
      );
      if (!validation.ok) return reject(validation.code);
      emit({
        type: 'ANSWER_SUBMITTED',
        atMs: nowMs,
        result: {
          kind: 'SUBMITTED',
          word: validation.entry.word,
          length: validation.entry.key.length,
          tier: validation.entry.tier,
          tileIds: current.draft,
        },
      });
      return done();
    }
  }
}
