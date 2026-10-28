/** Palabra ya validada (válida, a tiempo y con fichas legales). Las no válidas o no enviadas no entran: puntúan cero. */
export interface ValidatedLettersAnswer {
  readonly playerId: string;
  readonly length: number;
}

export interface LettersAward {
  readonly playerId: string;
  readonly points: number;
  readonly reason: 'LONGEST' | 'NONE';
}

/**
 * Puntuación de una ronda de letras en concurso (GAME_RULES.md §4 LETTERS): puntúa quien alcanza la
 * máxima longitud validada, un punto por letra, y todos los empatados a esa longitud (LET-04).
 * El resto recibe 0. El entrenamiento individual NO usa esta función: no hay marcador de concurso.
 */
export function scoreLettersRound(answers: readonly ValidatedLettersAnswer[]): LettersAward[] {
  if (answers.length === 0) return [];
  const longest = Math.max(...answers.map((a) => a.length));
  return answers.map((answer) =>
    answer.length === longest
      ? { playerId: answer.playerId, points: longest, reason: 'LONGEST' }
      : { playerId: answer.playerId, points: 0, reason: 'NONE' },
  );
}
