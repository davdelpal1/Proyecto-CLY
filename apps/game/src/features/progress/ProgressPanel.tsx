import type { PuzzleType } from '@cly/game-engine';
import { getPuzzleStats } from '@cly/game-engine';
import { AppText } from '../../components/AppText';
import { Panel } from '../../components/Panel';
import { ScoreBoard } from '../../components/ScoreBoard';
import { formatSeconds } from '../../lib/format';
import { useProgress } from '../../state/ProgressProvider';

/**
 * "Tu progreso" en una prueba (UX_FLOWS.md §7). Datos solo locales: sin cuenta ni ranking.
 * No se muestra hasta leer el almacén, para evitar que aparezca "0 jugadas" y luego salte.
 */
export function ProgressPanel({ puzzle }: { puzzle: PuzzleType }) {
  const { progress, loaded } = useProgress();
  if (!loaded) return null;
  const stats = getPuzzleStats(progress, puzzle);

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
                label: 'Exactas',
                value: String(stats.exact),
                tone: stats.exact > 0 ? 'success' : 'default',
                testID: 'stat-exact',
              },
              { label: 'Mejor racha', value: String(stats.bestExactStreak), testID: 'stat-streak' },
              {
                label: 'Exacto más rápido',
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
