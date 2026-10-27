import { StyleSheet, View } from 'react-native';
import { colors, radii, spacing } from '@cly/design-tokens';
import type { NumbersOutcome, NumbersReview } from '@cly/game-engine';
import { AppText } from '../../components/AppText';
import type { TextTone } from '../../components/AppText';
import { Button } from '../../components/Button';
import { Panel } from '../../components/Panel';
import { ScoreBoard } from '../../components/ScoreBoard';
import { StepList } from '../../components/StepList';
import { formatDistance, formatSeconds } from '../../lib/format';

const HEADLINE: Record<NumbersOutcome, { title: string; mark: string; tone: TextTone }> = {
  EXACT: { title: '¡Exacto!', mark: '✓', tone: 'success' },
  CLOSE: { title: 'Casi', mark: '≈', tone: 'warning' },
  EXPIRED: { title: 'Tiempo agotado', mark: '⏱', tone: 'danger' },
  GAVE_UP: { title: 'Solución revelada', mark: '…', tone: 'muted' },
  INVALID: { title: 'Respuesta no válida', mark: '!', tone: 'danger' },
};

interface ResultPanelProps {
  review: NumbersReview;
  target: number;
  onRepeat: () => void;
  onNext: () => void;
  onExit: () => void;
}

/**
 * Resultado individual (UX_FLOWS.md §7): validación, tiempo, solución razonada y las tres salidas
 * obligatorias. No hay puntos de concurso ni rival: es una práctica.
 */
export function ResultPanel({ review, target, onRepeat, onNext, onExit }: ResultPanelProps) {
  const headline = HEADLINE[review.outcome];
  const { solution } = review;

  const detail =
    review.outcome === 'EXACT'
      ? 'Has llegado al objetivo.'
      : review.outcome === 'CLOSE' && review.distance !== null
        ? `Te has quedado ${formatDistance(review.distance)}.`
        : review.outcome === 'EXPIRED'
          ? 'No se confirmó ninguna respuesta a tiempo, así que no cuenta.'
          : review.outcome === 'GAVE_UP'
            ? 'Esta ronda no cuenta: aquí tienes cómo resolverla.'
            : 'La respuesta no superó la validación.';

  return (
    <View style={styles.root} testID="result">
      <View accessibilityLiveRegion="polite" style={styles.headline}>
        <View style={[styles.mark, { borderColor: toneColor(headline.tone) }]} aria-hidden>
          <AppText variant="headline" tone={headline.tone}>
            {headline.mark}
          </AppText>
        </View>
        <View style={styles.headlineText}>
          <AppText variant="display" tone={headline.tone} heading testID="result-title">
            {headline.title}
          </AppText>
          <AppText tone="muted" testID="result-detail">
            {detail}
          </AppText>
        </View>
      </View>

      <ScoreBoard
        items={[
          { label: 'Objetivo', value: String(target), testID: 'score-target' },
          { label: 'Tu resultado', value: review.yourValue ?? '—', testID: 'score-value' },
          {
            label: 'Diferencia',
            value: review.distance === null ? '—' : String(review.distance),
            tone: review.distance === 0 ? 'success' : 'default',
            testID: 'score-distance',
          },
          {
            label: 'Tiempo',
            value: review.elapsedMs === null ? '—' : formatSeconds(review.elapsedMs),
          },
        ]}
      />

      {review.yourSteps.length > 0 ? (
        <Panel>
          <AppText variant="title" heading>
            Tus pasos
          </AppText>
          <StepList steps={review.yourSteps} emptyText="" />
        </Panel>
      ) : null}

      <Panel tone="raised">
        <AppText variant="title" heading>
          Solución razonada
        </AppText>
        <AppText tone="muted" testID="solution-intro">
          {solution.exact
            ? `Una forma de llegar a ${target}:`
            : `Con estos números no se puede llegar exactamente. Lo más cerca posible es ${solution.value} (${formatDistance(solution.distance)}):`}
        </AppText>
        <StepList
          steps={solution.steps}
          emptyText="El objetivo coincide con uno de los números."
          testID="solution-steps"
        />
        <AppText variant="bodyLarge" tabular tone="accent" testID="solution-expression">
          {solution.expression}
        </AppText>
        <AppText variant="caption" tone="subtle">
          Puede haber otras soluciones válidas.
        </AppText>
      </Panel>

      <View style={styles.actions}>
        <Button
          testID="next"
          label="Siguiente ejercicio"
          variant="primary"
          size="lg"
          onPress={onNext}
        />
        <Button
          testID="repeat"
          label="Repetir este ejercicio"
          variant="secondary"
          onPress={onRepeat}
        />
        <Button testID="back-to-games" label="Volver a juegos" variant="ghost" onPress={onExit} />
      </View>
    </View>
  );
}

function toneColor(tone: TextTone): string {
  switch (tone) {
    case 'success':
      return colors.success;
    case 'warning':
      return colors.warning;
    case 'danger':
      return colors.danger;
    default:
      return colors.borderStrong;
  }
}

const styles = StyleSheet.create({
  root: { gap: spacing.lg },
  headline: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg },
  mark: {
    width: 64,
    height: 64,
    borderRadius: radii.pill,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headlineText: { flex: 1, gap: spacing.xs },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, alignItems: 'center' },
});
