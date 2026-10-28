import type { Operator } from '@cly/numbers-engine';
import { LEXICON_TIERS } from '@cly/words-engine';
import type { LexiconTier } from '@cly/words-engine';
import type { DuelType } from './types';

/** Claves de evidencia de GAME_RULES.md §0. */
export type Evidence = 'RTVE' | 'SECUNDARIA' | 'DISEÑO' | 'PENDIENTE';

export interface Ruleset {
  readonly rulesetId: string;
  readonly revision: string;
  readonly releaseStatus: 'UNVERIFIED' | 'VERIFIED';
  readonly locale: string;
  readonly stages: {
    readonly key: {
      readonly enabled: boolean;
      readonly durationSeconds: number;
      readonly firstLetterRevealAt: number;
    };
    readonly classic: {
      readonly count: number;
      readonly numberRounds: number;
      readonly letterRounds: number;
      readonly order: 'alternating';
      /** Tipo de la primera ronda clásica. [PENDIENTE]: añadido en la implementación, ver GAME_RULES.md §1. */
      readonly firstType: 'NUMBER' | 'LETTERS';
      readonly numberDurationSeconds: number;
      readonly letterDurationSeconds: number;
    };
    readonly duels: {
      readonly count: number;
      readonly pointValues: readonly number[];
      readonly durationSeconds: number;
      readonly availableTypes: readonly DuelType[];
    };
    readonly final: {
      readonly durationSeconds: number;
      readonly words: number;
      readonly panelLetterTiles: number;
      readonly rewardUnits: 'simulated';
      readonly baseRewardPerWord: number;
      readonly elevenWordReward: number;
      readonly jackpotIncrement: 'configurable';
    };
  };
  readonly numberRules: {
    readonly minTarget: number;
    readonly maxTarget: number;
    readonly tilesPerRound: number;
    readonly allowedOperators: readonly Operator[];
    readonly allowRepeatTile: false;
    readonly requirePositiveIntegerIntermediates: boolean;
    readonly requireExactDivision: boolean;
    readonly allowUnusedTiles: boolean;
  };
  /** Composición de la bolsa de fichas. [DISEÑO]: añadido en la implementación, ver GAME_RULES.md §1. */
  readonly numberTiles: {
    readonly smallValues: readonly number[];
    readonly smallCopies: number;
    readonly bigValues: readonly number[];
    readonly bigCountRange: { readonly min: number; readonly max: number };
  };
  /** Puntuación de la cifra exacta (GAME_RULES.md §4 NUMBER, pasos 2–5). */
  readonly numberScoring: {
    readonly exactPoints: number;
    readonly closestPoints: number;
    /** Distancia máxima que aún puntúa; `null` = sin umbral. [PENDIENTE] confirmar en emisión. */
    readonly maxApproxDistance: number | null;
  };
  readonly letterRules: {
    readonly tileCount: number;
    readonly minVowels: number;
    readonly maxVowels: number;
    readonly minAnswerLength: number;
    readonly winnerOnlyScores: boolean;
    readonly bothScoreOnBestTie: boolean;
    /**
     * Nivel menos fiable del léxico que se admite (ADR-005). [PENDIENTE]: añadido en la
     * implementación, ver GAME_RULES.md §1.1. 0–2 admite plurales, conjugaciones y sufijos.
     */
    readonly maxLexiconTier: LexiconTier;
  };
  /** Bolsa de letras: frecuencias relativas por letra. [DISEÑO]: añadido en la implementación, ver GAME_RULES.md §1.1. */
  readonly letterTiles: {
    readonly vowelWeights: Readonly<Record<string, number>>;
    readonly consonantWeights: Readonly<Record<string, number>>;
    /** Máximo de fichas iguales en una ronda. */
    readonly maxCopiesPerLetter: number;
  };
  /** Nivel de evidencia por ruta de campo (`stages.key.durationSeconds`). Lo que no aparece no está contrastado. */
  readonly evidence: Readonly<Record<string, Evidence>>;
}

/**
 * Perfil de referencia de GAME_RULES.md §1. Sigue siendo `UNVERIFIED`: no marcar como `VERIFIED`
 * hasta completar los criterios de desbloqueo de §6.
 */
export const RTVE_2026_REFERENCE: Ruleset = {
  rulesetId: 'RTVE_2026_REFERENCE',
  revision: '0.1.2',
  releaseStatus: 'UNVERIFIED',
  locale: 'es-ES',
  stages: {
    key: { enabled: true, durationSeconds: 30, firstLetterRevealAt: 15 },
    classic: {
      count: 10,
      numberRounds: 5,
      letterRounds: 5,
      order: 'alternating',
      firstType: 'NUMBER',
      numberDurationSeconds: 40,
      letterDurationSeconds: 30,
    },
    duels: {
      count: 4,
      pointValues: [10, 20, 30, 50],
      durationSeconds: 30,
      availableTypes: [
        'THREE_IN_ONE',
        'DOUBLE_WORD',
        'TWO_FOR_TWO',
        'DOUBLE_MEANING',
        'MENTAL_CALCULATION',
        'NUMBER_SPRINT',
      ],
    },
    final: {
      durationSeconds: 180,
      words: 12,
      panelLetterTiles: 10,
      rewardUnits: 'simulated',
      baseRewardPerWord: 100,
      elevenWordReward: 1500,
      jackpotIncrement: 'configurable',
    },
  },
  numberRules: {
    minTarget: 100,
    maxTarget: 999,
    tilesPerRound: 6,
    allowedOperators: ['add', 'subtract', 'multiply', 'divide'],
    allowRepeatTile: false,
    requirePositiveIntegerIntermediates: true,
    requireExactDivision: true,
    allowUnusedTiles: true,
  },
  numberTiles: {
    smallValues: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    smallCopies: 2,
    bigValues: [25, 50, 75, 100],
    bigCountRange: { min: 1, max: 3 },
  },
  numberScoring: { exactPoints: 10, closestPoints: 7, maxApproxDistance: null },
  letterRules: {
    tileCount: 10,
    minVowels: 3,
    maxVowels: 6,
    minAnswerLength: 5,
    winnerOnlyScores: true,
    bothScoreOnBestTie: true,
    maxLexiconTier: 'SUFFIX_DERIVATION',
  },
  // Frecuencias aproximadas del español escrito (por mil), sin K ni W: no son letras patrimoniales y
  // casi no forman palabras jugables. Elección de diseño, no del programa.
  letterTiles: {
    vowelWeights: { a: 125, e: 137, i: 63, o: 87, u: 39 },
    consonantWeights: {
      b: 14,
      c: 47,
      d: 59,
      f: 7,
      g: 10,
      h: 7,
      j: 4,
      l: 50,
      m: 31,
      n: 67,
      ñ: 3,
      p: 25,
      q: 9,
      r: 69,
      s: 79,
      t: 46,
      v: 10,
      x: 2,
      y: 9,
      z: 5,
    },
    maxCopiesPerLetter: 3,
  },
  evidence: {
    'stages.key.durationSeconds': 'RTVE',
    'stages.key.firstLetterRevealAt': 'SECUNDARIA',
    'stages.classic.order': 'PENDIENTE',
    'stages.classic.firstType': 'PENDIENTE',
    'stages.classic.numberDurationSeconds': 'SECUNDARIA',
    'stages.classic.letterDurationSeconds': 'SECUNDARIA',
    'stages.duels.count': 'RTVE',
    'stages.duels.pointValues': 'SECUNDARIA',
    'stages.duels.durationSeconds': 'SECUNDARIA',
    'stages.final.durationSeconds': 'RTVE',
    'stages.final.words': 'RTVE',
    'stages.final.panelLetterTiles': 'SECUNDARIA',
    'numberRules.minTarget': 'SECUNDARIA',
    'numberRules.maxTarget': 'SECUNDARIA',
    'numberRules.tilesPerRound': 'SECUNDARIA',
    'numberRules.requirePositiveIntegerIntermediates': 'PENDIENTE',
    'numberRules.requireExactDivision': 'PENDIENTE',
    'numberTiles.smallValues': 'SECUNDARIA',
    'numberTiles.bigValues': 'SECUNDARIA',
    'numberTiles.smallCopies': 'DISEÑO',
    'numberTiles.bigCountRange': 'DISEÑO',
    'numberScoring.exactPoints': 'SECUNDARIA',
    'numberScoring.closestPoints': 'SECUNDARIA',
    'numberScoring.maxApproxDistance': 'PENDIENTE',
    'letterRules.tileCount': 'SECUNDARIA',
    'letterRules.minVowels': 'SECUNDARIA',
    'letterRules.maxVowels': 'SECUNDARIA',
    'letterRules.minAnswerLength': 'SECUNDARIA',
    'letterRules.maxLexiconTier': 'PENDIENTE',
    'letterTiles.vowelWeights': 'DISEÑO',
    'letterTiles.consonantWeights': 'DISEÑO',
    'letterTiles.maxCopiesPerLetter': 'DISEÑO',
  },
};

/** Rutas de campo aún sin verificar, para mostrarlas honestamente en la interfaz. */
export function pendingFields(ruleset: Ruleset, prefix = ''): string[] {
  return Object.entries(ruleset.evidence)
    .filter(([path, level]) => level === 'PENDIENTE' && path.startsWith(prefix))
    .map(([path]) => path);
}

/** Comprobaciones de consistencia previas a publicar un ruleset. Devuelve los problemas encontrados. */
export function validateRuleset(ruleset: Ruleset): string[] {
  const problems: string[] = [];
  const { classic, duels } = ruleset.stages;
  const { numberRules, numberTiles, numberScoring, letterRules, letterTiles } = ruleset;

  if (classic.count !== classic.numberRounds + classic.letterRounds) {
    problems.push('stages.classic.count debe ser numberRounds + letterRounds');
  }
  if (duels.pointValues.length !== duels.count) {
    problems.push('stages.duels.pointValues debe tener una entrada por duelo');
  }
  if (duels.count > duels.availableTypes.length) {
    problems.push('stages.duels.count no puede superar los tipos de duelo disponibles');
  }
  if (numberRules.minTarget > numberRules.maxTarget) {
    problems.push('numberRules.minTarget no puede superar maxTarget');
  }
  if (numberRules.tilesPerRound < 1) problems.push('numberRules.tilesPerRound debe ser ≥ 1');
  if (numberRules.allowedOperators.length === 0) {
    problems.push('numberRules.allowedOperators no puede estar vacío');
  }
  if (numberTiles.bigCountRange.min > numberTiles.bigCountRange.max) {
    problems.push('numberTiles.bigCountRange.min no puede superar max');
  }
  if (
    numberTiles.bigCountRange.max >
    Math.min(numberTiles.bigValues.length, numberRules.tilesPerRound)
  ) {
    problems.push('numberTiles.bigCountRange.max excede las fichas grandes disponibles');
  }
  if (numberScoring.closestPoints > numberScoring.exactPoints) {
    problems.push('numberScoring.closestPoints no puede superar exactPoints');
  }
  if (letterRules.minVowels > letterRules.maxVowels) {
    problems.push('letterRules.minVowels no puede superar maxVowels');
  }
  if (letterRules.maxVowels > letterRules.tileCount) {
    problems.push('letterRules.maxVowels no puede superar tileCount');
  }
  if (letterRules.minAnswerLength > letterRules.tileCount) {
    problems.push('letterRules.minAnswerLength no puede superar tileCount');
  }
  if (!LEXICON_TIERS.includes(letterRules.maxLexiconTier)) {
    problems.push('letterRules.maxLexiconTier no es un nivel de léxico conocido');
  }
  const weights = [
    ...Object.entries(letterTiles.vowelWeights),
    ...Object.entries(letterTiles.consonantWeights),
  ];
  if (weights.some(([, weight]) => !(weight > 0))) {
    problems.push('letterTiles: todos los pesos deben ser positivos');
  }
  const vowelCapacity =
    Object.keys(letterTiles.vowelWeights).length * letterTiles.maxCopiesPerLetter;
  const consonantCapacity =
    Object.keys(letterTiles.consonantWeights).length * letterTiles.maxCopiesPerLetter;
  if (
    vowelCapacity < letterRules.maxVowels ||
    consonantCapacity < letterRules.tileCount - letterRules.minVowels
  ) {
    problems.push('letterTiles.maxCopiesPerLetter es demasiado bajo para repartir las fichas');
  }
  if (ruleset.releaseStatus === 'VERIFIED' && pendingFields(ruleset).length > 0) {
    problems.push('Un ruleset VERIFIED no puede tener campos PENDIENTE');
  }
  return problems;
}

function stableStringify(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`;
  if (value !== null && typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>)
      .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
      .map(([k, v]) => `${JSON.stringify(k)}:${stableStringify(v)}`);
    return `{${entries.join(',')}}`;
  }
  return JSON.stringify(value) ?? 'null';
}

/** Hash no criptográfico (cyrb53) para identificar un snapshot de reglas en logs y replays. */
export function rulesetSnapshotHash(ruleset: Ruleset): string {
  const text = stableStringify(ruleset);
  let h1 = 0xdeadbeef;
  let h2 = 0x41c6ce57;
  for (let i = 0; i < text.length; i++) {
    const ch = text.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  const n = 4294967296 * (2097151 & h2) + (h1 >>> 0);
  return n.toString(16).padStart(14, '0');
}

function deepFreeze<T>(value: T): T {
  if (value !== null && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const child of Object.values(value as Record<string, unknown>)) deepFreeze(child);
  }
  return value;
}

export interface RulesetSnapshot {
  readonly ruleset: Ruleset;
  readonly hash: string;
}

/** Copia inmutable del ruleset con su hash: lo que se guarda con cada partida. */
export function createRulesetSnapshot(ruleset: Ruleset): RulesetSnapshot {
  const problems = validateRuleset(ruleset);
  if (problems.length > 0) throw new Error(`Ruleset inválido: ${problems.join('; ')}`);
  // Los rulesets son datos JSON puros, así que un viaje por JSON es una copia profunda suficiente.
  const frozen = deepFreeze(JSON.parse(JSON.stringify(ruleset)) as Ruleset);
  return Object.freeze({ ruleset: frozen, hash: rulesetSnapshotHash(frozen) });
}
