import { describe, expect, it } from 'vitest';
import { scoreNumbersRound } from './numbers-scoring';
import { RTVE_2026_REFERENCE } from './ruleset';

const scoring = RTVE_2026_REFERENCE.numberScoring;

describe('scoreNumbersRound', () => {
  it('NUM-04: si ambos alcanzan el exacto, 10 puntos a ambos', () => {
    expect(
      scoreNumbersRound(
        [
          { playerId: 'a', distance: 0 },
          { playerId: 'b', distance: 0 },
        ],
        scoring,
      ),
    ).toEqual([
      { playerId: 'a', points: 10, reason: 'EXACT' },
      { playerId: 'b', points: 10, reason: 'EXACT' },
    ]);
  });

  it('un exacto elimina a los aproximados', () => {
    const awards = scoreNumbersRound(
      [
        { playerId: 'a', distance: 0 },
        { playerId: 'b', distance: 1 },
      ],
      scoring,
    );
    expect(awards.map((a) => a.points)).toEqual([10, 0]);
  });

  it('NUM-05: sin exactos, 7 puntos a la mejor aproximación (1 frente a 2)', () => {
    const awards = scoreNumbersRound(
      [
        { playerId: 'a', distance: 1 },
        { playerId: 'b', distance: 2 },
      ],
      scoring,
    );
    expect(awards).toEqual([
      { playerId: 'a', points: 7, reason: 'CLOSEST' },
      { playerId: 'b', points: 0, reason: 'NONE' },
    ]);
  });

  it('empate en la mejor aproximación: puntúan ambos', () => {
    const awards = scoreNumbersRound(
      [
        { playerId: 'a', distance: 3 },
        { playerId: 'b', distance: 3 },
      ],
      scoring,
    );
    expect(awards.map((a) => a.points)).toEqual([7, 7]);
  });

  it('con umbral configurado [PENDIENTE], una aproximación demasiado lejana no puntúa', () => {
    const withThreshold = { ...scoring, maxApproxDistance: 10 };
    expect(scoreNumbersRound([{ playerId: 'a', distance: 11 }], withThreshold)[0]?.points).toBe(0);
    expect(scoreNumbersRound([{ playerId: 'a', distance: 10 }], withThreshold)[0]?.points).toBe(7);
  });

  it('sin respuestas válidas no hay puntos', () => {
    expect(scoreNumbersRound([], scoring)).toEqual([]);
  });

  it('el perfil de referencia no define umbral de aproximación (sigue pendiente)', () => {
    expect(scoring.maxApproxDistance).toBeNull();
  });
});
