import { canSpell, isTileWord, lettersIn, toTileKey } from '@cly/words-engine';
import type { LexiconEntry, WordLookup } from '@cly/words-engine';
import type { Ruleset } from './ruleset';

/** Por qué se rechaza una palabra. Son causas técnicas seguras: no revelan ninguna solución. */
export type LettersErrorCode =
  | 'EMPTY_WORD'
  | 'INVALID_CHARACTERS'
  | 'LETTER_MULTIPLICITY_EXCEEDED'
  | 'TOO_SHORT'
  | 'NOT_IN_LEXICON';

export type LettersValidation =
  | { readonly ok: true; readonly entry: LexiconEntry }
  | { readonly ok: false; readonly code: LettersErrorCode };

/**
 * Valida una palabra contra las fichas y el léxico (GAME_RULES.md §4 LETTERS): solo letras del
 * juego, sin usar más fichas de las que hay, longitud mínima y presencia en el léxico admitido.
 * Es el validador canónico: el cliente lo usa en entrenamiento y el servidor lo usará en online.
 * Las tildes y la diéresis no necesitan ficha propia; la Ñ no equivale a la N.
 */
export function validateLettersAnswer(
  tiles: string,
  word: string,
  letterRules: Pick<Ruleset['letterRules'], 'minAnswerLength' | 'maxLexiconTier'>,
  lexicon: WordLookup,
): LettersValidation {
  const key = toTileKey(word);
  if (key.length === 0) return { ok: false, code: 'EMPTY_WORD' };
  if (!isTileWord(key)) return { ok: false, code: 'INVALID_CHARACTERS' };
  if (!canSpell(tiles, key)) return { ok: false, code: 'LETTER_MULTIPLICITY_EXCEEDED' };
  if (lettersIn(key) < letterRules.minAnswerLength) return { ok: false, code: 'TOO_SHORT' };
  const entry = lexicon.lookup(key, letterRules.maxLexiconTier);
  return entry === null ? { ok: false, code: 'NOT_IN_LEXICON' } : { ok: true, entry };
}
