export {
  LEXICON_TIERS,
  RLA_ES_FLAGS,
  classifyDerivation,
  isGameWord,
  moreReliableTier,
  parseAffixKinds,
  tierRank,
} from './lexicon-tiers';
export type {
  AffixKind,
  DerivationClass,
  FlagTable,
  LexiconTier,
  WordFilter,
} from './lexicon-tiers';
export {
  TILE_ALPHABET,
  VOWEL_LETTERS,
  canSpell,
  countLetters,
  isTileWord,
  lettersIn,
  toTileKey,
} from './tile-letters';
export { buildLexiconText } from './lexicon-text';
export type { BuiltLexiconText, RankedWord } from './lexicon-text';
export { parseLexicon } from './lexicon';
export type { FormableOptions, Lexicon, LexiconEntry, WordLookup } from './lexicon';
