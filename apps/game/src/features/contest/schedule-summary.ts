import type { StagePlan } from '@cly/game-engine';
import { formatDuration } from '../../lib/format';

export interface ScheduleRow {
  id: string;
  title: string;
  detail: string;
}

/**
 * Resume la secuencia del concurso en filas legibles. Todo sale del plan (que a su vez sale del
 * ruleset): la interfaz no contiene números de reglas escritos a mano.
 */
export function summarizeSchedule(plan: readonly StagePlan[]): ScheduleRow[] {
  const rows: ScheduleRow[] = [];

  const key = plan.find((s) => s.stage === 'KEY');
  if (key) {
    rows.push({ id: 'KEY', title: 'La llave', detail: formatDuration(key.durationSeconds) });
  }

  const classic = plan.filter((s) => s.stage === 'CLASSIC');
  if (classic.length > 0) {
    const numbers = classic.filter((s) => s.puzzleType === 'NUMBER');
    const letters = classic.filter((s) => s.puzzleType === 'LETTERS');
    rows.push({
      id: 'CLASSIC',
      title: `${classic.length} rondas clásicas`,
      detail:
        `${numbers.length} de cifras (${formatDuration(numbers[0]?.durationSeconds ?? null)}) y ` +
        `${letters.length} de letras (${formatDuration(letters[0]?.durationSeconds ?? null)}), alternadas`,
    });
  }

  const duels = plan.filter((s) => s.stage === 'DUEL');
  if (duels.length > 0) {
    const points = duels.map((d) => d.points ?? 0).join(' · ');
    rows.push({
      id: 'DUEL',
      title: `${duels.length} duelos`,
      detail: `${points} puntos · ${formatDuration(duels[0]?.durationSeconds ?? null)} cada uno`,
    });
  }

  if (plan.some((s) => s.stage === 'TIEBREAK')) {
    rows.push({ id: 'TIEBREAK', title: 'Desempate', detail: 'Solo si hay igualdad' });
  }

  const final = plan.find((s) => s.stage === 'FINAL');
  if (final) {
    rows.push({
      id: 'FINAL',
      title: 'Gran final',
      detail: `La juega quien gana · ${formatDuration(final.durationSeconds)}`,
    });
  }

  return rows;
}
