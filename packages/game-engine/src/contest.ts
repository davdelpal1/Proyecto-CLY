import type { Ruleset } from './ruleset';
import type { DuelType, GameMode, PuzzleType, Stage } from './types';

export interface StagePlan {
  /** Posición 1-based en la secuencia del concurso. */
  readonly position: number;
  readonly stage: Stage;
  /** `null` en los duelos: se eligen entre `duelChoices`. */
  readonly puzzleType: PuzzleType | null;
  readonly durationSeconds: number | null;
  /** Solo en duelos: puntos en juego. */
  readonly points?: number;
  readonly duelChoices?: readonly DuelType[];
  /** Solo se juega si procede (desempate: hay igualdad; final: la disputa el ganador). */
  readonly conditional: boolean;
}

/**
 * Secuencia del concurso derivada del ruleset (UX_FLOWS.md §5): llave → 10 clásicas → 4 duelos →
 * desempate condicional → final. La UI la muestra tal cual y no la reconstruye con valores fijos.
 */
export function buildContestSchedule(ruleset: Ruleset): StagePlan[] {
  const { stages } = ruleset;
  const plan: Omit<StagePlan, 'position'>[] = [];

  if (stages.key.enabled) {
    plan.push({
      stage: 'KEY',
      puzzleType: 'KEY',
      durationSeconds: stages.key.durationSeconds,
      conditional: false,
    });
  }

  const other = stages.classic.firstType === 'NUMBER' ? 'LETTERS' : 'NUMBER';
  for (let i = 0; i < stages.classic.count; i++) {
    const puzzleType = i % 2 === 0 ? stages.classic.firstType : other;
    plan.push({
      stage: 'CLASSIC',
      puzzleType,
      durationSeconds:
        puzzleType === 'NUMBER'
          ? stages.classic.numberDurationSeconds
          : stages.classic.letterDurationSeconds,
      conditional: false,
    });
  }

  for (let i = 0; i < stages.duels.count; i++) {
    plan.push({
      stage: 'DUEL',
      puzzleType: null,
      durationSeconds: stages.duels.durationSeconds,
      points: stages.duels.pointValues[i] ?? 0,
      duelChoices: stages.duels.availableTypes,
      conditional: false,
    });
  }

  plan.push({
    stage: 'TIEBREAK',
    puzzleType: 'TIEBREAK',
    durationSeconds: null,
    conditional: true,
  });
  plan.push({
    stage: 'FINAL',
    puzzleType: 'FINAL',
    durationSeconds: stages.final.durationSeconds,
    conditional: true,
  });

  return plan.map((entry, index) => ({ ...entry, position: index + 1 }));
}

export type ContestOpponent = 'AI' | 'LOCAL' | 'ONLINE';

export interface ContestModeDefinition {
  readonly id: ContestOpponent;
  readonly gameMode: GameMode;
  readonly title: string;
  readonly description: string;
  /**
   * CONFIGURABLE: ya se puede abrir la pantalla de configuración, pero la partida aún no se puede jugar.
   * IN_PREPARATION: sin pantalla funcional todavía.
   */
  readonly availability: 'CONFIGURABLE' | 'IN_PREPARATION';
}

export const CONTEST_MODES: readonly ContestModeDefinition[] = [
  {
    id: 'AI',
    gameMode: 'SOLO_AI',
    title: 'Contra la IA',
    description: 'Una persona frente a un rival virtual, con todas las fases del concurso.',
    availability: 'CONFIGURABLE',
  },
  {
    id: 'LOCAL',
    gameMode: 'LOCAL_TWO',
    title: 'Dos jugadores',
    description: 'Compartiendo dispositivo, por turnos.',
    availability: 'IN_PREPARATION',
  },
  {
    id: 'ONLINE',
    gameMode: 'PRIVATE_ONLINE',
    title: 'Sala privada online',
    description: 'Invita a alguien con un código. Arbitra el servidor.',
    availability: 'IN_PREPARATION',
  },
];

export type AiDifficulty = 'BEGINNER' | 'NORMAL' | 'EXPERT';

export const AI_DIFFICULTIES: readonly { readonly id: AiDifficulty; readonly label: string }[] = [
  { id: 'BEGINNER', label: 'Principiante' },
  { id: 'NORMAL', label: 'Normal' },
  { id: 'EXPERT', label: 'Experto' },
];
