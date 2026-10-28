import { describe, expect, it } from 'vitest';
import { buildLexiconText, parseLexicon, tierRank, toTileKey } from '@cly/words-engine';
import type { LexiconTier } from '@cly/words-engine';
import { buildLettersReview, practiceOutcomeOfLetters } from './letters-review';
import { solveLetters } from './letters-round';
import type { LettersPuzzle } from './letters-round';
import { scoreLettersRound } from './letters-scoring';
import {
  applyLettersAction,
  createLettersSession,
  draftLetters,
  replayLettersEvents,
} from './letters-session';
import type { LettersAction, LettersEvent, LettersSessionState } from './letters-session';
import { validateLettersAnswer } from './letters-validation';
import { RTVE_2026_REFERENCE } from './ruleset';

// Léxico sintético y pequeño: así los tests no dependen de la riqueza del diccionario real.
const WORDS: ReadonlyArray<readonly [string, LexiconTier]> = [
  ['casas', 'INFLECTION'],
  ['casona', 'BASE'],
  ['canción', 'BASE'],
  ['cocinas', 'INFLECTION'],
  ['pingüino', 'BASE'],
  ['pequeño', 'BASE'],
  ['dámelo', 'PRONOUN_ATTACHED'],
  ['cana', 'BASE'],
];
const lexicon = parseLexicon(
  buildLexiconText(
    WORDS.map(([word, tier]) => ({ word, rank: tierRank(tier) })),
    toTileKey,
  ).text,
);

const rules = RTVE_2026_REFERENCE.letterRules; // mínimo 5 letras, hasta SUFFIX_DERIVATION
const puzzleOf = (letters: string): LettersPuzzle => ({
  tiles: [...letters].map((letter, i) => ({ id: `l${i + 1}`, letter })),
});
const TILES = 'cansoaicpl';
// Reparto de los tests: c a s o n a x s i l → l1 c, l2 a, l3 s, l4 o, l5 n, l6 a, l7 x, l8 s, l9 i, l10 l
// «casona» = l1 l2 l3 l4 l5 l6 · «casas» = l1 l2 l3 l6 l8 · «cana» = l1 l2 l5 l6
const FIXTURE = 'casonaxsil';
const CASAS = ['l1', 'l2', 'l3', 'l6', 'l8'];

const newSession = (letters = TILES, timing: 'RULESET' | 'UNTIMED' = 'RULESET') =>
  createLettersSession({
    ruleset: RTVE_2026_REFERENCE,
    puzzle: puzzleOf(letters),
    lexiconId: 'test-lexicon',
    config: { mode: 'TRAINING', timing: { kind: timing } },
  });

/** Aplica acciones en cadena con tiempos explícitos; devuelve el estado, los eventos y los rechazos. */
function play(
  initial: LettersSessionState,
  steps: ReadonlyArray<readonly [number, LettersAction]>,
): { state: LettersSessionState; events: LettersEvent[]; rejections: (string | null)[] } {
  let state = initial;
  const events: LettersEvent[] = [];
  const rejections: (string | null)[] = [];
  for (const [nowMs, action] of steps) {
    const result = applyLettersAction(state, action, nowMs, lexicon);
    state = result.state;
    events.push(...result.events);
    rejections.push(result.rejection?.code ?? null);
  }
  return { state, events, rejections };
}

const pick = (...ids: string[]): ReadonlyArray<readonly [number, LettersAction]> =>
  ids.map((tileId) => [1000, { type: 'PICK', tileId }] as const);

describe('validateLettersAnswer (LET-01…LET-03)', () => {
  it('LET-01: cinco letras válidas son admisibles', () => {
    const result = validateLettersAnswer('casasxxxxx', 'casas', rules, lexicon);
    expect(result).toMatchObject({ ok: true, entry: { word: 'casas' } });
  });

  it('LET-02: cuatro letras no son admisibles en una clásica, aunque la palabra exista', () => {
    expect(validateLettersAnswer('canaxxxxxx', 'cana', rules, lexicon)).toEqual({
      ok: false,
      code: 'TOO_SHORT',
    });
  });

  it('LET-03: usar más veces una letra de las que hay se rechaza', () => {
    expect(validateLettersAnswer('casxxxxxxx', 'casas', rules, lexicon)).toEqual({
      ok: false,
      code: 'LETTER_MULTIPLICITY_EXCEEDED',
    });
  });

  it('las tildes y la diéresis no necesitan ficha propia; se muestra la forma correcta', () => {
    expect(validateLettersAnswer('pinguinoxx', 'pingüino', rules, lexicon)).toMatchObject({
      ok: true,
      entry: { word: 'pingüino' },
    });
    expect(validateLettersAnswer('cancionxxx', 'CANCION', rules, lexicon)).toMatchObject({
      ok: true,
      entry: { word: 'canción' },
    });
  });

  it('la Ñ no equivale a la N', () => {
    expect(validateLettersAnswer('pequenoxxx', 'pequeño', rules, lexicon)).toEqual({
      ok: false,
      code: 'LETTER_MULTIPLICITY_EXCEEDED',
    });
    expect(validateLettersAnswer('pequeñoxxx', 'pequeño', rules, lexicon).ok).toBe(true);
    expect(validateLettersAnswer('pequeñoxxx', 'pequeno', rules, lexicon)).toEqual({
      ok: false,
      code: 'LETTER_MULTIPLICITY_EXCEEDED',
    });
  });

  it('distingue palabra vacía, caracteres no válidos y palabra desconocida', () => {
    expect(validateLettersAnswer(TILES, '', rules, lexicon)).toEqual({
      ok: false,
      code: 'EMPTY_WORD',
    });
    expect(validateLettersAnswer(TILES, 'ca-sas', rules, lexicon)).toEqual({
      ok: false,
      code: 'INVALID_CHARACTERS',
    });
    expect(validateLettersAnswer('ccccnnnnaa', 'caccna', rules, lexicon)).toEqual({
      ok: false,
      code: 'NOT_IN_LEXICON',
    });
  });

  it('respeta el nivel de léxico del ruleset', () => {
    const strict = { ...rules, maxLexiconTier: 'BASE' as const };
    expect(validateLettersAnswer('casasxxxxx', 'casas', strict, lexicon)).toEqual({
      ok: false,
      code: 'NOT_IN_LEXICON',
    });
    // Con los pronombres pegados fuera (el ruleset por defecto) «dámelo» tampoco entra
    expect(validateLettersAnswer('damelooooo', 'dámelo', rules, lexicon)).toEqual({
      ok: false,
      code: 'NOT_IN_LEXICON',
    });
    expect(
      validateLettersAnswer(
        'damelooooo',
        'dámelo',
        { ...rules, maxLexiconTier: 'PRONOUN_ATTACHED' },
        lexicon,
      ).ok,
    ).toBe(true);
  });
});

describe('sesión de letras', () => {
  it('nace lista, con la duración del ruleset y la huella del léxico', () => {
    const state = newSession();
    expect(state).toMatchObject({
      status: 'READY',
      durationMs: 30_000,
      lexiconId: 'test-lexicon',
      rulesetId: 'RTVE_2026_REFERENCE',
      rulesetRevision: RTVE_2026_REFERENCE.revision,
      draft: [],
    });
    expect(newSession(TILES, 'UNTIMED').durationMs).toBeNull();
  });

  it('flujo completo: empezar, formar «casas» y confirmar', () => {
    const picked = play(newSession(FIXTURE), [[0, { type: 'START' }], ...pick(...CASAS)]);
    expect(draftLetters(picked.state)).toBe('casas');
    expect(picked.state.status).toBe('RUNNING');

    const { state: end, events, rejections } = play(picked.state, [[5000, { type: 'SUBMIT' }]]);
    expect(rejections).toEqual([null]);
    expect(end.status).toBe('FINISHED');
    expect(end.result).toEqual({
      kind: 'SUBMITTED',
      word: 'casas',
      length: 5,
      tier: 'INFLECTION',
      tileIds: CASAS,
    });
    expect(end.finishedAtMs).toBe(5000);
    expect([...picked.events, ...events].map((e) => e.sequence)).toEqual(
      [...picked.events, ...events].map((_, i) => i + 1),
    );
  });

  it('no se puede actuar antes de empezar ni después de terminar', () => {
    expect(play(newSession(), [[0, { type: 'PICK', tileId: 'l1' }]]).rejections).toEqual([
      'INVALID_STATE',
    ]);
    const finished = play(newSession(), [
      [0, { type: 'START' }],
      [1, { type: 'GIVE_UP' }],
    ]).state;
    expect(play(finished, [[2, { type: 'PICK', tileId: 'l1' }]]).rejections).toEqual([
      'INVALID_STATE',
    ]);
    expect(play(finished, [[2, { type: 'START' }]]).rejections).toEqual(['INVALID_STATE']);
  });

  it('una ficha no se puede usar dos veces ni existir si no está en el reparto', () => {
    const { rejections } = play(newSession(), [
      [0, { type: 'START' }],
      [1, { type: 'PICK', tileId: 'l1' }],
      [2, { type: 'PICK', tileId: 'l1' }],
      [3, { type: 'PICK', tileId: 'l99' }],
    ]);
    expect(rejections).toEqual([null, null, 'TILE_ALREADY_PICKED', 'UNKNOWN_TILE']);
  });

  it('quitar la última, quitar una concreta y vaciar la palabra', () => {
    const { state, rejections } = play(newSession(), [
      [0, { type: 'START' }],
      ...pick('l1', 'l2', 'l3', 'l4'),
      [2, { type: 'UNPICK' }], // quita l4
      [3, { type: 'UNPICK', tileId: 'l1' }], // quita l1 de en medio
      [4, { type: 'UNPICK', tileId: 'l9' }], // no estaba elegida
    ]);
    expect(state.draft).toEqual(['l2', 'l3']);
    expect(rejections.slice(-3)).toEqual([null, null, 'TILE_NOT_PICKED']);

    const cleared = play(state, [
      [5, { type: 'CLEAR' }],
      [6, { type: 'CLEAR' }],
      [7, { type: 'UNPICK' }],
    ]);
    expect(cleared.state.draft).toEqual([]);
    expect(cleared.events).toHaveLength(1); // el segundo CLEAR no genera evento
    expect(cleared.rejections).toEqual([null, null, 'NOTHING_TO_UNDO']);
  });

  it('una palabra corta o inexistente se rechaza SIN cerrar la ronda, y se puede corregir', () => {
    const { state, rejections } = play(newSession(FIXTURE), [
      [0, { type: 'START' }],
      ...pick('l1', 'l2', 'l5', 'l6'), // «cana», 4 letras
      [10, { type: 'SUBMIT' }],
      ...pick('l8'), // «canas»: 5 letras que no están en el léxico
      [11, { type: 'SUBMIT' }],
    ]);
    expect(rejections.filter((r) => r === 'TOO_SHORT')).toHaveLength(1);
    expect(rejections.at(-1)).toBe('NOT_IN_LEXICON');
    expect(state.status).toBe('RUNNING');
    expect(state.result).toBeNull();
    expect(state.draft).toHaveLength(5);

    const corrected = play(state, [
      [12, { type: 'CLEAR' }],
      ...pick(...CASAS),
      [13, { type: 'SUBMIT' }],
    ]);
    expect(corrected.state.status).toBe('FINISHED');
    expect(corrected.state.result).toMatchObject({ kind: 'SUBMITTED', word: 'casas' });
  });

  it('con reloj, una acción tras el deadline cierra la ronda como EXPIRED y se rechaza', () => {
    const { state, rejections } = play(newSession(), [
      [1000, { type: 'START' }],
      ...pick('l1'),
      [31_001, { type: 'PICK', tileId: 'l2' }], // deadline = 31 000
    ]);
    expect(rejections.at(-1)).toBe('DEADLINE_EXPIRED');
    expect(state.status).toBe('FINISHED');
    expect(state.result).toEqual({ kind: 'EXPIRED' });
    expect(state.finishedAtMs).toBe(31_000);
  });

  it('el deadline es inclusivo: en el último instante todavía vale', () => {
    const { state } = play(newSession(FIXTURE), [
      [1000, { type: 'START' }],
      ...pick(...CASAS),
      [31_000, { type: 'SUBMIT' }],
    ]);
    expect(state.result?.kind).toBe('SUBMITTED');
  });

  it('TICK cierra la ronda al vencer el plazo sin que el jugador haga nada', () => {
    const { state, rejections } = play(newSession(), [
      [0, { type: 'START' }],
      [30_000, { type: 'TICK' }],
      [30_001, { type: 'TICK' }],
    ]);
    expect(rejections).toEqual([null, null, null]);
    expect(state.result).toEqual({ kind: 'EXPIRED' });
  });

  it('sin reloj nunca caduca', () => {
    const { state } = play(newSession(TILES, 'UNTIMED'), [
      [0, { type: 'START' }],
      [9_999_999_999, { type: 'TICK' }],
    ]);
    expect(state.status).toBe('RUNNING');
    expect(state.deadlineMs).toBeNull();
  });

  it('rendirse cierra la ronda sin respuesta', () => {
    const { state } = play(newSession(), [
      [0, { type: 'START' }],
      [5, { type: 'GIVE_UP' }],
    ]);
    expect(state.result).toEqual({ kind: 'GAVE_UP' });
  });

  it('el log de eventos reconstruye exactamente el estado final (replay)', () => {
    const initial = newSession(FIXTURE);
    const { state, events } = play(initial, [
      [100, { type: 'START' }],
      ...pick('l1', 'l2', 'l3'),
      [200, { type: 'UNPICK' }],
      [300, { type: 'CLEAR' }],
      ...pick(...CASAS),
      [900, { type: 'SUBMIT' }],
    ]);
    expect(replayLettersEvents(initial, events)).toEqual(state);
  });
});

describe('revisión y progreso', () => {
  const puzzle = puzzleOf(FIXTURE);
  const solution = solveLetters(puzzle, lexicon, rules);

  it('hay solución: «casona» (6) y «casas» (5)', () => {
    expect(solution.bestLength).toBe(6);
    expect(solution.topWords.map((w) => w.word)).toEqual(['casona', 'casas']);
  });

  const finish = (steps: ReadonlyArray<readonly [number, LettersAction]>) =>
    play(newSession(FIXTURE), [[0, { type: 'START' }], ...steps]).state;

  it('BEST si alcanza la longitud máxima; VALID si es más corta', () => {
    const best = finish([...pick('l1', 'l2', 'l3', 'l4', 'l5', 'l6'), [9, { type: 'SUBMIT' }]]);
    expect(draftLetters(best)).toBe('casona');
    expect(buildLettersReview(best, solution)).toMatchObject({
      outcome: 'BEST',
      yourWord: 'casona',
      yourLength: 6,
      bestLength: 6,
      elapsedMs: 9,
    });

    const valid = finish([...pick(...CASAS), [9, { type: 'SUBMIT' }]]);
    expect(buildLettersReview(valid, solution)).toMatchObject({
      outcome: 'VALID',
      yourWord: 'casas',
      yourLength: 5,
      yourTier: 'INFLECTION',
    });
  });

  it('EXPIRED y GAVE_UP no tienen palabra propia pero sí solución', () => {
    const gaveUp = buildLettersReview(finish([[4, { type: 'GIVE_UP' }]]), solution);
    expect(gaveUp).toMatchObject({ outcome: 'GAVE_UP', yourWord: null, yourLength: null });
    expect(gaveUp.topWords[0]).toEqual({ word: 'casona', length: 6 });
    const expired = buildLettersReview(finish([[40_000, { type: 'TICK' }]]), solution);
    expect(expired.outcome).toBe('EXPIRED');
  });

  it('no se puede pedir la solución antes de cerrar la ronda', () => {
    const running = play(newSession(FIXTURE), [[0, { type: 'START' }]]).state;
    expect(() => buildLettersReview(running, solution)).toThrow(/ha terminado/);
    expect(() => buildLettersReview(newSession(), solution)).toThrow(/ha terminado/);
  });

  it('el progreso local traduce BEST→EXACT y VALID→CLOSE', () => {
    expect(practiceOutcomeOfLetters('BEST')).toBe('EXACT');
    expect(practiceOutcomeOfLetters('VALID')).toBe('CLOSE');
    expect(practiceOutcomeOfLetters('EXPIRED')).toBe('EXPIRED');
    expect(practiceOutcomeOfLetters('GAVE_UP')).toBe('GAVE_UP');
  });
});

describe('scoreLettersRound (LET-04)', () => {
  it('puntúa solo la longitud máxima, una por letra', () => {
    expect(
      scoreLettersRound([
        { playerId: 'a', length: 7 },
        { playerId: 'b', length: 5 },
      ]),
    ).toEqual([
      { playerId: 'a', points: 7, reason: 'LONGEST' },
      { playerId: 'b', points: 0, reason: 'NONE' },
    ]);
  });

  it('con empate en la máxima puntúan ambos', () => {
    const awards = scoreLettersRound([
      { playerId: 'a', length: 6 },
      { playerId: 'b', length: 6 },
    ]);
    expect(awards.map((a) => a.points)).toEqual([6, 6]);
  });

  it('un único participante puntúa su longitud; sin respuestas no hay puntos', () => {
    expect(scoreLettersRound([{ playerId: 'a', length: 5 }])[0]?.points).toBe(5);
    expect(scoreLettersRound([])).toEqual([]);
  });
});
