import { useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { spacing } from '@cly/design-tokens';
import { getPuzzleStats, practiceOutcomeOfLetters } from '@cly/game-engine';
import { epochNowMs } from '../../adapters/calendar';
import { useSpanishLexicon } from '../../adapters/lexicon';
import type { LoadedLexicon } from '../../adapters/lexicon';
import { AppText } from '../../components/AppText';
import { Button } from '../../components/Button';
import { Countdown } from '../../components/Countdown';
import { Panel } from '../../components/Panel';
import { ACTIVE_RULESET } from '../../config/ruleset';
import { LettersBoard } from '../letters/LettersBoard';
import { LettersResultPanel } from '../letters/LettersResultPanel';
import { useLettersSession } from '../letters/useLettersSession';
import { useProgress } from '../../state/ProgressProvider';
import { useFeedback } from '../../state/useFeedback';
import { describeProgress } from './progress-line';
import { GetReady, TrainingFrame } from './TrainingFrame';
import type { TrainingSessionProps } from './TrainingSession';
import { useGetReady } from './useGetReady';

const TITLE = 'La palabra más larga';

/**
 * La palabra más larga dentro del marco de entrenamiento. El léxico se carga una vez y, mientras
 * llega, se muestra un estado de carga honesto; la cuenta atrás y el reloj empiezan después.
 */
export function LettersTraining(props: TrainingSessionProps) {
  const { state, retry } = useSpanishLexicon();

  if (state.status === 'ready') return <LettersRound {...props} loaded={state} />;

  return (
    <TrainingFrame title={TITLE}>
      <Panel testID="lexicon-status">
        <View accessibilityLiveRegion="polite" style={styles.status}>
          {state.status === 'loading' ? (
            <AppText tone="muted" center testID="lexicon-loading">
              Preparando el diccionario…
            </AppText>
          ) : (
            <>
              <AppText tone="danger" center testID="lexicon-error">
                ⚠ No se pudo cargar el diccionario.
              </AppText>
              <Button testID="lexicon-retry" label="Reintentar" onPress={retry} />
            </>
          )}
        </View>
      </Panel>
    </TrainingFrame>
  );
}

function LettersRound({
  seed,
  timed,
  loaded,
  onRepeat,
  onNext,
  onExit,
}: TrainingSessionProps & { loaded: LoadedLexicon }) {
  const session = useLettersSession(seed, timed, loaded);
  const countdown = useGetReady(timed, session.start);
  const { state, review } = session;

  // Se anota el resultado una sola vez por partida y se da la respuesta táctil acorde.
  const { progress, record } = useProgress();
  const feedback = useFeedback();
  const recorded = useRef(false);
  useEffect(() => {
    if (!review || recorded.current) return;
    recorded.current = true;
    record({
      puzzle: 'LETTERS',
      outcome: practiceOutcomeOfLetters(review.outcome),
      elapsedMs: review.elapsedMs,
      atEpochMs: epochNowMs(),
    });
    if (review.outcome === 'BEST') feedback.success();
    else if (review.outcome === 'VALID') feedback.tap();
    else if (review.outcome === 'EXPIRED') feedback.error();
  }, [review, record, feedback]);

  return (
    <TrainingFrame
      title={TITLE}
      right={
        countdown === null && state.status === 'RUNNING' ? (
          <Countdown remainingMs={session.remainingMs} totalMs={session.totalMs} />
        ) : null
      }
    >
      {countdown !== null ? (
        <GetReady
          count={countdown}
          message="Diez letras para formar la palabra más larga. El tiempo empieza al terminar la cuenta atrás."
        />
      ) : state.status === 'RUNNING' ? (
        <LettersBoard session={session} />
      ) : review ? (
        <LettersResultPanel
          review={review}
          minLength={ACTIVE_RULESET.letterRules.minAnswerLength}
          progressLine={describeProgress('LETTERS', getPuzzleStats(progress, 'LETTERS'))}
          onRepeat={onRepeat}
          onNext={onNext}
          onExit={onExit}
        />
      ) : null}
    </TrainingFrame>
  );
}

const styles = StyleSheet.create({
  status: { alignItems: 'center', gap: spacing.md, paddingVertical: spacing.xl },
});
