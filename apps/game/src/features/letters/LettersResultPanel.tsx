import { StyleSheet, View } from 'react-native';
import { colors, radii, spacing } from '@cly/design-tokens';
import type { LettersOutcome, LettersReview } from '@cly/game-engine';
import { AppText } from '../../components/AppText';
import type { TextTone } from '../../components/AppText';
import { Button } from '../../components/Button';
import { Panel } from '../../components/Panel';
import { ScoreBoard } from '../../components/ScoreBoard';
import { formatSeconds } from '../../lib/format';

const HEADLINE: Record<LettersOutcome, { title: string; mark: string; tone: TextTone }> = {
  BEST: { title: '¡Palabra más larga!', mark: '✓', tone: 'success' },
  VALID: { title: 'Buena palabra', mark: '≈', tone: 'warning' },
  EXPIRED: { title: 'Tiempo agotado', mark: '⏱', tone: 'danger' },
  GAVE_UP: { title: 'Solución revelada', mark: '…', tone: 'muted' },
};

interface LettersResultPanelProps {
  review: LettersReview;
  minLength: number;
  onRepeat: () => void;
  onNext: () => void;
  onExit: () => void;
  /** Línea opcional de progreso personal ("Racha: 3 palabras óptimas seguidas."). */
  progressLine?: string | undefined;
}

/**
 * Resultado individual (UX_FLOWS.md §7): validación, tiempo, las palabras más largas posibles y las
 * tres salidas obligatorias. No hay puntos de concurso ni rival: es una práctica.
 */
export function LettersResultPanel({
  review,
  minLength,
  progressLine,
  onRepeat,
  onNext,
  onExit,
}: LettersResultPanelProps) {
  const headline = HEADLINE[review.outcome];

  const detail =
    review.outcome === 'BEST'
      ? 'No había ninguna palabra más larga con estas letras.'
      : review.outcome === 'VALID' && review.yourLength !== null
        ? `Tu palabra tiene ${review.yourLength} letras; se podía llegar a ${review.bestLength}.`
        : review.outcome === 'EXPIRED'
          ? 'No se confirmó ninguna palabra a tiempo, así que no cuenta.'
          : 'Esta ronda no cuenta: aquí tienes las palabras más largas que había.';

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

      <View
        accessible
        accessibilityLabel={`Tu palabra: ${review.yourWord ?? 'ninguna'}`}
        testID="score-word"
        style={styles.yourWord}
      >
        <AppText variant="label" tone="muted">
          Tu palabra
        </AppText>
        <AppText variant="headline" tone={review.yourWord === null ? 'subtle' : headline.tone}>
          {review.yourWord === null ? '—' : review.yourWord.toUpperCase()}
        </AppText>
      </View>

      <ScoreBoard
        items={[
          {
            label: 'Letras',
            value: review.yourLength === null ? '—' : String(review.yourLength),
            tone: review.outcome === 'BEST' ? 'success' : 'default',
            testID: 'score-length',
          },
          { label: 'Mejor posible', value: String(review.bestLength), testID: 'score-best' },
          {
            label: 'Tiempo',
            value: review.elapsedMs === null ? '—' : formatSeconds(review.elapsedMs),
          },
        ]}
      />

      {progressLine ? (
        <AppText tone="muted" testID="progress-line">
          {progressLine}
        </AppText>
      ) : null}

      <Panel tone="raised">
        <AppText variant="title" heading>
          Palabras más largas
        </AppText>
        <AppText tone="muted" testID="solution-intro">
          {`Con estas letras se podían formar ${review.formableCount} palabras de ${minLength} letras o más. Estas son las más largas:`}
        </AppText>
        <View accessibilityRole="list" style={styles.words} testID="solution-words">
          {review.topWords.map((entry) => (
            <View
              key={entry.word}
              accessibilityRole="listitem"
              accessible
              accessibilityLabel={`${entry.word}, ${entry.length} letras`}
              style={styles.wordRow}
            >
              <AppText variant="bodyLarge" tone="accent" tabular style={styles.wordText}>
                {entry.word.toUpperCase()}
              </AppText>
              <AppText tone="muted" tabular>
                {entry.length}
              </AppText>
            </View>
          ))}
        </View>
        <AppText variant="caption" tone="subtle">
          Según nuestro diccionario, que no es el de la RAE. Puede haber otras palabras válidas.
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
  yourWord: {
    gap: spacing.xs,
    padding: spacing.md,
    borderRadius: radii.md,
    backgroundColor: colors.surfaceRaised,
    borderWidth: 1,
    borderColor: colors.border,
  },
  words: { gap: spacing.xs },
  wordRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  wordText: { flex: 1, letterSpacing: 1.5 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, alignItems: 'center' },
});
