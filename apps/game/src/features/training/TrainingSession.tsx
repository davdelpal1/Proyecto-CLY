import { LettersTraining } from './LettersTraining';
import { NumbersTraining } from './NumbersTraining';

export interface TrainingSessionProps {
  /** Pruebas con modo de entrenamiento implementado. */
  puzzle: TrainablePuzzle;
  seed: string;
  timed: boolean;
  onRepeat: () => void;
  onNext: () => void;
  onExit: () => void;
}

export type TrainablePuzzle = 'NUMBER' | 'LETTERS';

export const isTrainable = (type: string): type is TrainablePuzzle =>
  type === 'NUMBER' || type === 'LETTERS';

/**
 * TrainingShell (ARCHITECTURE.md §3.1): marco de una prueba suelta. Sin rival ni marcador de
 * concurso; reloj opcional; solución tras el cierre; Repetir / Siguiente / Volver.
 * Cada prueba aporta su tablero y su panel de resultado; el marco y la cuenta atrás son comunes.
 *
 * Con reloj hay una cuenta atrás de 3 s con el ejercicio oculto: así nadie lo lee antes de que
 * corra su tiempo. La cuenta atrás no consume tiempo de respuesta.
 */
export function TrainingSession(props: TrainingSessionProps) {
  return props.puzzle === 'NUMBER' ? (
    <NumbersTraining {...props} />
  ) : (
    <LettersTraining {...props} />
  );
}
