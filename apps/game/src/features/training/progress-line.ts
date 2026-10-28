import type { PuzzleStats } from '@cly/game-engine';

const plural = (n: number, one: string, many: string): string => (n === 1 ? one : many);

/**
 * Línea de progreso personal que acompaña al resultado de una práctica. `undefined` si todavía no
 * hay partidas. «Exactas» (el contador `exact`) significa, en cada prueba, lo mejor posible.
 */
export function describeProgress(
  puzzle: 'NUMBER' | 'LETTERS',
  stats: PuzzleStats,
): string | undefined {
  if (stats.played === 0) return undefined;
  const played = `${stats.played} ${plural(stats.played, 'jugada', 'jugadas')}`;

  if (puzzle === 'NUMBER') {
    return stats.currentExactStreak >= 2
      ? `Racha: ${stats.currentExactStreak} exactas seguidas.`
      : `Llevas ${stats.exact} ${plural(stats.exact, 'exacta', 'exactas')} en ${played}.`;
  }
  return stats.currentExactStreak >= 2
    ? `Racha: ${stats.currentExactStreak} veces seguidas con la palabra más larga.`
    : `Llevas ${stats.exact} ${plural(stats.exact, 'vez', 'veces')} la palabra más larga en ${played}.`;
}
