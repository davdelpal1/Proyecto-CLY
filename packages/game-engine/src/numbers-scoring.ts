import type { Ruleset } from './ruleset';

/** Respuesta ya validada (jugada legal y a tiempo). Las no válidas o no enviadas no entran: puntúan cero. */
export interface ValidatedNumbersAnswer {
  readonly playerId: string;
  readonly distance: number;
}

export interface NumbersAward {
  readonly playerId: string;
  readonly points: number;
  readonly reason: 'EXACT' | 'CLOSEST' | 'NONE';
}

/**
 * Puntuación de una ronda de cifras en concurso (GAME_RULES.md §4 NUMBER):
 * 1. Si alguna respuesta es exacta, todas las exactas reciben `exactPoints`.
 * 2. Si no, todas las de distancia mínima reciben `closestPoints`
 *    (salvo que se supere `maxApproxDistance`, parámetro [PENDIENTE]).
 * El entrenamiento individual NO usa esta función: no hay marcador de concurso.
 */
export function scoreNumbersRound(
  answers: readonly ValidatedNumbersAnswer[],
  scoring: Ruleset['numberScoring'],
): NumbersAward[] {
  if (answers.length === 0) return [];
  const best = Math.min(...answers.map((a) => a.distance));
  const withinThreshold = scoring.maxApproxDistance === null || best <= scoring.maxApproxDistance;

  return answers.map((answer) => {
    if (answer.distance !== best) return { playerId: answer.playerId, points: 0, reason: 'NONE' };
    if (best === 0)
      return { playerId: answer.playerId, points: scoring.exactPoints, reason: 'EXACT' };
    return withinThreshold
      ? { playerId: answer.playerId, points: scoring.closestPoints, reason: 'CLOSEST' }
      : { playerId: answer.playerId, points: 0, reason: 'NONE' };
  });
}
