import { useEffect, useRef } from 'react';
import { getPuzzleStats } from '@cly/game-engine';
import { epochNowMs } from '../../adapters/calendar';
import { Countdown } from '../../components/Countdown';
import { useProgress } from '../../state/ProgressProvider';
import { useFeedback } from '../../state/useFeedback';
import { NumbersBoard } from '../numbers/NumbersBoard';
import { ResultPanel } from '../numbers/ResultPanel';
import { useNumbersSession } from '../numbers/useNumbersSession';
import { describeProgress } from './progress-line';
import { GetReady, TrainingFrame } from './TrainingFrame';
import type { TrainingSessionProps } from './TrainingSession';
import { useGetReady } from './useGetReady';

/** La cifra exacta dentro del marco de entrenamiento. */
export function NumbersTraining({ seed, timed, onRepeat, onNext, onExit }: TrainingSessionProps) {
  const session = useNumbersSession(seed, timed);
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
      puzzle: 'NUMBER',
      outcome: review.outcome,
      elapsedMs: review.elapsedMs,
      atEpochMs: epochNowMs(),
    });
    if (review.outcome === 'EXACT') feedback.success();
    else if (review.outcome === 'CLOSE') feedback.tap();
    else if (review.outcome === 'EXPIRED') feedback.error();
  }, [review, record, feedback]);

  return (
    <TrainingFrame
      title="La cifra exacta"
      right={
        countdown === null && state.status === 'RUNNING' ? (
          <Countdown remainingMs={session.remainingMs} totalMs={session.totalMs} />
        ) : null
      }
    >
      {countdown !== null ? (
        <GetReady
          count={countdown}
          message="Seis números y un objetivo. El tiempo empieza al terminar la cuenta atrás."
        />
      ) : state.status === 'RUNNING' ? (
        <NumbersBoard session={session} />
      ) : review ? (
        <ResultPanel
          review={review}
          progressLine={describeProgress('NUMBER', getPuzzleStats(progress, 'NUMBER'))}
          target={state.puzzle.target}
          onRepeat={onRepeat}
          onNext={onNext}
          onExit={onExit}
        />
      ) : null}
    </TrainingFrame>
  );
}
