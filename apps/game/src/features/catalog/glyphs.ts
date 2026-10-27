import type { PuzzleGroup, PuzzleType } from '@cly/game-engine';
import { colors } from '@cly/design-tokens';

/**
 * Símbolo tipográfico propio de cada modalidad (sin imágenes ni licencias). Es decorativo: el
 * nombre de la prueba siempre va en texto.
 */
export const PUZZLE_GLYPH: Record<PuzzleType, string> = {
  NUMBER: '123',
  LETTERS: 'ABC',
  KEY: 'A__',
  THREE_IN_ONE: '3·1',
  DOUBLE_WORD: 'A+B',
  TWO_FOR_TWO: '2·2',
  DOUBLE_MEANING: '↔',
  MENTAL_CALCULATION: '=?',
  NUMBER_SPRINT: '9»',
  FINAL: '12',
  TIEBREAK: 'VS',
  SPECIAL_DECIPHER: '#?',
  SPECIAL_MASTER_WORD: '8L',
};

export const GROUP_COLOR: Record<PuzzleGroup, string> = {
  CLASSIC: colors.accent,
  OPENING: colors.gold,
  DUELS: colors.highlight,
  FINAL: colors.success,
  EXTRA: colors.danger,
  SPECIAL: colors.borderStrong,
};
