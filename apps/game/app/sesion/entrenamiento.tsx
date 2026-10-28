import { useState } from 'react';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { findPuzzleBySlug, isPlayable } from '@cly/game-engine';
import { newExerciseSeed } from '../../src/adapters/random-seed';
import { MissingScreen } from '../../src/components/MissingScreen';
import { TrainingSession, isTrainable } from '../../src/features/training/TrainingSession';

/**
 * /sesion/entrenamiento?prueba=cifras&reloj=programa|libre&semilla=…&n=…
 *
 * La semilla vive en la URL: "Repetir" conserva la semilla (mismo ejercicio), "Siguiente ejercicio"
 * pone una nueva. El resultado es un estado de esta pantalla, no una ruta aparte
 * (decisión documentada en docs/UX_FLOWS.md — «Estado de implementación»).
 */
export default function Entrenamiento() {
  const params = useLocalSearchParams<{
    prueba?: string;
    reloj?: string;
    semilla?: string;
    n?: string;
  }>();
  const router = useRouter();
  const [fallbackSeed] = useState(newExerciseSeed);

  const puzzle = params.prueba ? findPuzzleBySlug(params.prueba) : undefined;
  if (!puzzle || !isPlayable(puzzle) || !isTrainable(puzzle.type)) {
    return (
      <MissingScreen
        title="Esta prueba aún no se puede jugar"
        message="Elige una prueba disponible en el catálogo."
        backLabel="Volver a juegos"
        backHref="/juegos"
      />
    );
  }

  const seed = params.semilla ?? fallbackSeed;
  const attempt = Number(params.n ?? 0) || 0;
  const timed = params.reloj !== 'libre';

  return (
    <>
      <Stack.Screen options={{ title: `${puzzle.title} · Proyecto CLY` }} />
      <TrainingSession
        key={`${puzzle.type}:${seed}:${attempt}:${timed}`}
        puzzle={puzzle.type}
        seed={seed}
        timed={timed}
        onRepeat={() => router.setParams({ semilla: seed, n: String(attempt + 1) })}
        onNext={() => router.setParams({ semilla: newExerciseSeed(), n: '0' })}
        onExit={() => router.replace('/juegos')}
      />
    </>
  );
}
