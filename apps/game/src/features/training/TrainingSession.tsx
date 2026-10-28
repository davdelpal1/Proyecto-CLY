import { useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { spacing } from '@cly/design-tokens';
import { getPuzzleStats } from '@cly/game-engine';
import { epochNowMs } from '../../adapters/calendar';
import { useFeedback } from '../../state/useFeedback';
import { useProgress } from '../../state/ProgressProvider';
import { AppText } from '../../components/AppText';
import { Countdown } from '../../components/Countdown';
import { GameHeader } from '../../components/GameHeader';
import { Screen } from '../../components/Screen';
import { StatusBadge } from '../../components/StatusBadge';
import { NumbersBoard } from '../numbers/NumbersBoard';
import { ResultPanel } from '../numbers/ResultPanel';
import { useNumbersSession } from '../numbers/useNumbersSession';

const COUNTDOWN_FROM = 3;
const COUNTDOWN_STEP_MS = 800;

interface TrainingSessionProps {
  seed: string;
  timed: boolean;
  onRepeat: () => void;
  onNext: () => void;
  onExit: () => void;
}

/**
 * TrainingShell (ARCHITECTURE.md §3.1): marco de una prueba suelta. Sin rival ni marcador de
 * concurso; reloj opcional; solución tras el cierre; Repetir / Siguiente / Volver.
 * Hoy aloja la cifra exacta; otras pruebas reutilizarán el mismo marco con su propio tablero.
 *
 * Con reloj hay una cuenta atrás de 3 s con el ejercicio oculto: así nadie lo lee antes de que
 * corra su tiempo. La cuenta atrás no consume tiempo de respuesta.
 */
export function TrainingSession({ seed, timed, onRepeat, onNext, onExit }: TrainingSessionProps) {
  const session = useNumbersSession(seed, timed);
  const { start } = session;
  const [countdown, setCountdown] = useState<number | null>(timed ? COUNTDOWN_FROM : null);

  useEffect(() => {
    if (!timed) {
      start();
      return;
    }
    let remaining = COUNTDOWN_FROM;
    setCountdown(remaining);
    const id = setInterval(() => {
      remaining -= 1;
      if (remaining <= 0) {
        clearInterval(id);
        setCountdown(null);
        start();
      } else {
        setCountdown(remaining);
      }
    }, COUNTDOWN_STEP_MS);
    return () => clearInterval(id);
  }, [timed, start]);

  const { state, review } = session;

  // Se anota el resultado una sola vez por partida y se da la respuesta táctil acorde.
  const { progress, record } = useProgress();
  const feedback = useFeedback();
  const recorded = useRef(false);
  useEffect(() => {
    if (!review || recorded.current) return;
    recorded.current = true;
    record({
      puzzle: 'NUMBER',
      outcome: review.outcome,
      elapsedMs: review.elapsedMs,
      atEpochMs: epochNowMs(),
    });
    if (review.outcome === 'EXACT') feedback.success();
    else if (review.outcome === 'CLOSE') feedback.tap();
    else if (review.outcome === 'EXPIRED') feedback.error();
  }, [review, record, feedback]);

  const stats = getPuzzleStats(progress, 'NUMBER');
  const progressLine =
    review && stats.played > 0
      ? stats.currentExactStreak >= 2
        ? `Racha: ${stats.currentExactStreak} exactas seguidas.`
        : `Llevas ${stats.exact} ${stats.exact === 1 ? 'exacta' : 'exactas'} en ${stats.played} ${stats.played === 1 ? 'jugada' : 'jugadas'}.`
      : undefined;

  return (
    <Screen>
      <GameHeader
        title="La cifra exacta"
        eyebrow="Práctica"
        fallbackHref="/juegos"
        right={
          countdown === null && state.status === 'RUNNING' ? (
            <Countdown remainingMs={session.remainingMs} totalMs={session.totalMs} />
          ) : null
        }
      />

      {countdown !== null ? (
        <View style={styles.getReady} accessibilityLiveRegion="polite" testID="get-ready">
          <AppText variant="label" tone="accent" center>
            Prepárate
          </AppText>
          <AppText center tabular style={styles.bigCount}>
            {countdown}
          </AppText>
          <AppText tone="muted" center>
            Seis números y un objetivo. El tiempo empieza al terminar la cuenta atrás.
          </AppText>
        </View>
      ) : state.status === 'RUNNING' ? (
        <NumbersBoard session={session} />
      ) : review ? (
        <ResultPanel
          review={review}
          progressLine={progressLine}
          target={state.puzzle.target}
          onRepeat={onRepeat}
          onNext={onNext}
          onExit={onExit}
        />
      ) : null}

      <StatusBadge tone="provisional" label="Práctica: no puntúa ni cuenta para ningún ranking" />
    </Screen>
  );
}

const styles = StyleSheet.create({
  getReady: { alignItems: 'center', gap: spacing.md, paddingVertical: spacing.xxxl },
  bigCount: { fontSize: 120, fontWeight: '800', lineHeight: 130 },
});
