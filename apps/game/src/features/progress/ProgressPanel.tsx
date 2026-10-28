import type { PuzzleType } from '@cly/game-engine';
import { getPuzzleStats } from '@cly/game-engine';
import { AppText } from '../../components/AppText';
import { Panel } from '../../components/Panel';
import { ScoreBoard } from '../../components/ScoreBoard';
import { formatSeconds } from '../../lib/format';
import { useProgress } from '../../state/ProgressProvider';

/** Qué significa «exacto» (lo mejor posible) en cada prueba. */
const LABELS: Partial<Record<PuzzleType, { exact: string; fastest: string }>> = {
  NUMBER: { exact: 'Exactas', fastest: 'Exacto más rápido' },
  LETTERS: { exact: 'Palabra más larga', fastest: 'Más rápida' },
};
const DEFAULT_LABELS = LABELS.NUMBER as { exact: string; fastest: string };

/**
 * "Tu progreso" en una prueba (UX_FLOWS.md §7). Datos solo locales: sin cuenta ni ranking.
 * No se muestra hasta leer el almacén, para evitar que aparezca "0 jugadas" y luego salte.
 */
export function ProgressPanel({ puzzle }: { puzzle: PuzzleType }) {
  const { progress, loaded } = useProgress();
  if (!loaded) return null;
  const stats = getPuzzleStats(progress, puzzle);
  const labels = LABELS[puzzle] ?? DEFAULT_LABELS;

  return (
    <Panel testID="progress-panel">
      <AppText variant="title" heading>
        Tu progreso
      </AppText>
      {stats.played === 0 ? (
        <AppText tone="muted" testID="progress-empty">
          Aún no has jugado esta prueba. Tu progreso se guarda solo en este dispositivo.
        </AppText>
      ) : (
        <>
          <ScoreBoard
            items={[
              { label: 'Jugadas', value: String(stats.played), testID: 'stat-played' },
              {
                label: labels.exact,
                value: String(stats.exact),
                tone: stats.exact > 0 ? 'success' : 'default',
                testID: 'stat-exact',
              },
              { label: 'Mejor racha', value: String(stats.bestExactStreak), testID: 'stat-streak' },
              {
                label: labels.fastest,
                value: stats.fastestExactMs === null ? '—' : formatSeconds(stats.fastestExactMs),
                testID: 'stat-fastest',
              },
            ]}
          />
          <AppText variant="caption" tone="subtle">
            Solo cuenta lo que juegas aquí; no puntúa ni compite con nadie.
          </AppText>
        </>
      )}
    </Panel>
  );
}
