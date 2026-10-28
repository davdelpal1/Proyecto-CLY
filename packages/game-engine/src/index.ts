export * from './types';
export type { Clock } from './clock';
export { createSeededRandom } from './rng';
export {
  RTVE_2026_REFERENCE,
  createRulesetSnapshot,
  pendingFields,
  rulesetSnapshotHash,
  validateRuleset,
} from './ruleset';
export type { Evidence, Ruleset, RulesetSnapshot } from './ruleset';
export {
  applyNumbersAction,
  createNumbersRound,
  createNumbersSession,
  numbersPolicyFromRuleset,
  reduceNumbersEvent,
  replayNumbersEvents,
} from './numbers-session';
export type {
  NumbersAction,
  NumbersApplyResult,
  NumbersEvent,
  NumbersRejection,
  NumbersRejectionCode,
  NumbersRoundResult,
  NumbersSessionConfig,
  NumbersSessionState,
  TimingConfig,
} from './numbers-session';
export { buildNumbersReview } from './numbers-review';
export type { ExplainedSolution, NumbersOutcome, NumbersReview } from './numbers-review';
export { scoreNumbersRound } from './numbers-scoring';
export type { NumbersAward, ValidatedNumbersAnswer } from './numbers-scoring';
export {
  EMPTY_PROGRESS,
  EMPTY_PUZZLE_STATS,
  getPuzzleStats,
  parsePracticeProgress,
  recordPracticeResult,
  serializePracticeProgress,
} from './practice-progress';
export type {
  PracticeOutcome,
  PracticeProgress,
  PracticeResult,
  PuzzleStats,
} from './practice-progress';
export { shuffled } from './shuffle';
export { createLettersRound, solveLetters, tileLetters } from './letters-round';
export type {
  GeneratedLettersPuzzle,
  LettersGeneratorOptions,
  LettersPuzzle,
  LettersSolution,
  LettersTile,
} from './letters-round';
export { validateLettersAnswer } from './letters-validation';
export type { LettersErrorCode, LettersValidation } from './letters-validation';
export {
  applyLettersAction,
  createLettersSession,
  draftLetters,
  reduceLettersEvent,
  replayLettersEvents,
} from './letters-session';
export type {
  LettersAction,
  LettersApplyResult,
  LettersEvent,
  LettersRejection,
  LettersRejectionCode,
  LettersRoundResult,
  LettersSessionConfig,
  LettersSessionState,
} from './letters-session';
export { buildLettersReview, practiceOutcomeOfLetters } from './letters-review';
export type { LettersOutcome, LettersReview, ReviewedWord } from './letters-review';
export { scoreLettersRound } from './letters-scoring';
export type { LettersAward, ValidatedLettersAnswer } from './letters-scoring';
export {
  PUZZLE_GROUPS,
  PUZZLE_REGISTRY,
  defaultDurationSeconds,
  findPuzzleBySlug,
  getCatalogGroups,
  isPlayable,
} from './puzzle-registry';
export type { CatalogGroup, PuzzleDefinition, PuzzleGroup } from './puzzle-registry';
export { AI_DIFFICULTIES, CONTEST_MODES, buildContestSchedule } from './contest';
export type { AiDifficulty, ContestModeDefinition, ContestOpponent, StagePlan } from './contest';
