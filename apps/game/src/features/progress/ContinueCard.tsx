import { StyleSheet, View } from 'react-native';
import { spacing } from '@cly/design-tokens';
import { PUZZLE_REGISTRY, isPlayable } from '@cly/game-engine';
import { epochNowMs } from '../../adapters/calendar';
import { AppText } from '../../components/AppText';
import { Button } from '../../components/Button';
import { Panel } from '../../components/Panel';
import { formatAgo } from '../../lib/format';
import { useProgress } from '../../state/ProgressProvider';

/** "Continuar" (UX_FLOWS.md §7): lleva a la última prueba practicada. Solo aparece si hay historial. */
export function ContinueCard() {
  const { progress, loaded } = useProgress();
  const last = progress.last;
  const puzzle = last ? PUZZLE_REGISTRY.find((p) => p.type === last.puzzle) : undefined;
  if (!loaded || !last || !puzzle || !isPlayable(puzzle)) return null;

  return (
    <Panel tone="raised" testID="continue-card">
      <View style={styles.row}>
        <View style={styles.text}>
          <AppText variant="label" tone="accent">
            Seguir practicando
          </AppText>
          <AppText variant="title" heading>
            {puzzle.title}
          </AppText>
          <AppText variant="caption" tone="muted">
            Última práctica {formatAgo(epochNowMs(), last.atEpochMs)}
          </AppText>
        </View>
        <Button
          testID="continue-button"
          label="Continuar"
          href={{ pathname: '/juegos/[prueba]', params: { prueba: puzzle.slug } }}
        />
      </View>
    </Panel>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: spacing.lg },
  text: { flex: 1, minWidth: 180, gap: spacing.xs },
});
