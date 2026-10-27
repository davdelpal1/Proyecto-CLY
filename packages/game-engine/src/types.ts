/** Fases de una partida de concurso (ARCHITECTURE.md §5). */
export type Stage = 'KEY' | 'CLASSIC' | 'DUEL' | 'TIEBREAK' | 'FINAL';

/** Modos de ejecución. `TRAINING` es una prueba suelta, no una partida completa. */
export type GameMode = 'TRAINING' | 'SOLO_AI' | 'LOCAL_TWO' | 'PRIVATE_ONLINE';

export type DuelType =
  | 'THREE_IN_ONE'
  | 'DOUBLE_WORD'
  | 'TWO_FOR_TWO'
  | 'DOUBLE_MEANING'
  | 'MENTAL_CALCULATION'
  | 'NUMBER_SPRINT';

/** Las 13 modalidades seleccionables por separado (UX_FLOWS.md §4). Nombres según GAME_RULES.md. */
export type PuzzleType =
  | 'KEY'
  | 'NUMBER'
  | 'LETTERS'
  | DuelType
  | 'TIEBREAK'
  | 'FINAL'
  | 'SPECIAL_DECIPHER'
  | 'SPECIAL_MASTER_WORD';
