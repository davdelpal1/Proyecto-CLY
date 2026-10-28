/**
 * Clasificación de las formas de un diccionario Hunspell por su fiabilidad como palabra de juego.
 *
 * Un diccionario ortográfico NO es el criterio del programa ni de la RAE (ESPECIFICACION_FUNCIONAL §13):
 * contiene formas que genera por reglas (p. ej. «preguerras», «rehazla») que no todos los léxicos
 * recogen. En lugar de decidir a ciegas, cada palabra lleva el nivel de la ruta de derivación MÁS
 * FIABLE por la que se puede obtener, y cada ruleset decide qué niveles admite (GAME_RULES.md §4 LETTERS:
 * plurales, flexiones y clíticos están [PENDIENTE]).
 *
 * Este archivo no importa nada a propósito: lo usan tanto el paquete como el script de construcción
 * (`scripts/lexicon/build-lexicon.ts`, ejecutado directamente por Node).
 */

/** De más a menos fiable. El orden importa: el índice es el "rango" del nivel. */
export const LEXICON_TIERS = [
  'BASE', // entrada del diccionario tal cual (lema o forma listada)
  'INFLECTION', // plural/femenino y conjugación verbal generados por reglas
  'SUFFIX_DERIVATION', // derivados con sufijo: -mente, -ción, diminutivos, -ísimo…
  'PREFIX_DERIVATION', // derivados con prefijo: anti-, re-, pre-, sub-…
  'PRONOUN_ATTACHED', // verbo con pronombre pegado: dámelo, comiéndolo
] as const;

export type LexiconTier = (typeof LEXICON_TIERS)[number];

export const tierRank = (tier: LexiconTier): number => LEXICON_TIERS.indexOf(tier);

export type AffixKind = 'PFX' | 'SFX';

/** Qué grupo de afijos es cada flag: `PFX x Y n` / `SFX x Y n`. Soporta flags de un símbolo Unicode. */
export function parseAffixKinds(affText: string): Map<string, AffixKind> {
  const kinds = new Map<string, AffixKind>();
  for (const match of affText.matchAll(/^(PFX|SFX)[ \t]+(\S+)[ \t]+[YN][ \t]+\d+[ \t]*$/gm)) {
    kinds.set(match[2] as string, match[1] as AffixKind);
  }
  return kinds;
}

/**
 * Qué flags de sufijo son flexión y cuáles derivación. Es específico de RLA-ES v2.9 (revisado a mano
 * contra su `.aff`); cualquier otro sufijo se considera pronombre pegado, que es lo más conservador.
 */
export interface FlagTable {
  readonly inflection: ReadonlySet<string>;
  readonly suffixDerivation: ReadonlySet<string>;
}

export const RLA_ES_FLAGS: FlagTable = {
  // S = plural/femenino; R, E, I, X, D, G = conjugación, participio y subjuntivo
  inflection: new Set(['S', 'R', 'E', 'I', 'X', 'D', 'G']),
  suffixDerivation: new Set([
    ...'ABCFHJKLMNOPQTU',
    '🧠', // -mente
    '🥇', // -ísimo
    '🏅', // -ísimo (variantes)
  ]),
};

export interface DerivationClass {
  readonly tier: LexiconTier;
  /** Flags que no figuran en el `.aff`: señal de que el diccionario cambió y hay que revisar la tabla. */
  readonly unknownFlags: readonly string[];
}

/**
 * Nivel de UNA ruta de derivación (`rulesApplied` de hunspell-reader, flags separados por espacios).
 * Si la ruta combina varias reglas, vale el nivel menos fiable de todas.
 */
export function classifyDerivation(
  rulesApplied: string,
  kinds: ReadonlyMap<string, AffixKind>,
  table: FlagTable = RLA_ES_FLAGS,
): DerivationClass {
  let worst: LexiconTier = 'BASE';
  const unknownFlags: string[] = [];

  for (const flag of rulesApplied.split(/\s+/).filter(Boolean)) {
    const kind = kinds.get(flag);
    let tier: LexiconTier;
    if (kind === undefined) {
      unknownFlags.push(flag);
      tier = 'PRONOUN_ATTACHED'; // lo desconocido no se cuela como fiable
    } else if (kind === 'PFX') tier = 'PREFIX_DERIVATION';
    else if (table.inflection.has(flag)) tier = 'INFLECTION';
    else if (table.suffixDerivation.has(flag)) tier = 'SUFFIX_DERIVATION';
    else tier = 'PRONOUN_ATTACHED';

    if (tierRank(tier) > tierRank(worst)) worst = tier;
  }
  return { tier: worst, unknownFlags };
}

export const moreReliableTier = (a: LexiconTier, b: LexiconTier): LexiconTier =>
  tierRank(a) <= tierRank(b) ? a : b;

export interface WordFilter {
  readonly minLength: number;
  readonly maxLength: number;
}

/** Letras de las fichas: a–z, ñ, vocales con tilde y ü, todas en minúscula. */
const GAME_LETTERS = /^[a-zñáéíóúü]+$/;

/**
 * ¿Es una palabra que puede salir en un juego de letras? Descarta mayúsculas (nombres propios y
 * siglas), guiones, apóstrofos, dígitos y espacios, y limita la longitud (en letras, no en unidades UTF-16).
 */
export function isGameWord(word: string, filter: WordFilter): boolean {
  if (!GAME_LETTERS.test(word)) return false;
  const length = [...word].length;
  return length >= filter.minLength && length <= filter.maxLength;
}
