import { describe, expect, it } from 'vitest';
import { RTVE_2026_REFERENCE, buildContestSchedule } from '@cly/game-engine';
import type { Ruleset } from '@cly/game-engine';
import { summarizeSchedule } from './schedule-summary';

describe('summarizeSchedule', () => {
  it('resume la secuencia del perfil de referencia en cinco filas', () => {
    const rows = summarizeSchedule(buildContestSchedule(RTVE_2026_REFERENCE));
    expect(rows.map((r) => r.title)).toEqual([
      'La llave',
      '10 rondas clásicas',
      '4 duelos',
      'Desempate',
      'Gran final',
    ]);
    expect(rows[0]?.detail).toBe('30 s');
    expect(rows[1]?.detail).toBe('5 de cifras (40 s) y 5 de letras (30 s), alternadas');
    expect(rows[2]?.detail).toBe('10 · 20 · 30 · 50 puntos · 30 s cada uno');
    expect(rows[4]?.detail).toContain('3 min');
  });

  it('refleja cambios del ruleset sin tocar la interfaz', () => {
    const custom: Ruleset = {
      ...RTVE_2026_REFERENCE,
      stages: {
        ...RTVE_2026_REFERENCE.stages,
        classic: { ...RTVE_2026_REFERENCE.stages.classic, numberDurationSeconds: 60 },
      },
    };
    const rows = summarizeSchedule(buildContestSchedule(custom));
    expect(rows[1]?.detail).toContain('5 de cifras (1 min)');
  });
});
