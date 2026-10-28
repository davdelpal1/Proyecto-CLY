import type { Ruleset } from './ruleset';
import type { PuzzleType } from './types';

export type PuzzleGroup = 'CLASSIC' | 'OPENING' | 'DUELS' | 'FINAL' | 'EXTRA' | 'SPECIAL';

export const PUZZLE_GROUPS: readonly { readonly id: PuzzleGroup; readonly label: string }[] = [
  { id: 'CLASSIC', label: 'Clásicas' },
  { id: 'OPENING', label: 'Apertura' },
  { id: 'DUELS', label: 'Duelos' },
  { id: 'FINAL', label: 'Final' },
  { id: 'EXTRA', label: 'Extra' },
  { id: 'SPECIAL', label: 'Especiales' },
];

export interface PuzzleDefinition {
  readonly type: PuzzleType;
  /** Segmento de URL: /juegos/[slug]. */
  readonly slug: string;
  readonly group: PuzzleGroup;
  readonly title: string;
  readonly tagline: string;
  readonly howToPlay: readonly string[];
  /** Solo `AVAILABLE` puede mostrar un botón de jugar. Una build incompleta nunca simula disponibilidad. */
  readonly availability: 'AVAILABLE' | 'IN_PREPARATION';
  /** Cuándo se compromete la prueba (UX_FLOWS.md §4). */
  readonly release: 'CORE' | 'EXTENDED_BETA';
  /** PENDING_VERIFICATION: la mecánica concreta consta como PENDIENTE/ALTO RIESGO en GAME_RULES.md. */
  readonly ruleStatus: 'PROVISIONAL' | 'PENDING_VERIFICATION';
}

const inPreparation = {
  availability: 'IN_PREPARATION',
  release: 'CORE',
  ruleStatus: 'PROVISIONAL',
} as const;

/**
 * Las 13 modalidades seleccionables por separado, en el orden del catálogo de UX_FLOWS.md §4.
 * Los textos de "cómo se juega" son originales y describen únicamente lo recogido en GAME_RULES.md.
 */
export const PUZZLE_REGISTRY: readonly PuzzleDefinition[] = [
  {
    type: 'NUMBER',
    slug: 'cifras',
    group: 'CLASSIC',
    title: 'La cifra exacta',
    tagline: 'Alcanza el objetivo combinando seis números.',
    howToPlay: [
      'Verás seis números y un objetivo de tres cifras.',
      'Combina dos números con + − × ÷ para crear uno nuevo. Cada número se puede usar una sola vez.',
      'No hace falta usarlos todos. La solución exacta es la mejor; si no, vale la más cercana.',
      'Regla provisional: los resultados intermedios deben ser enteros positivos y las divisiones, exactas.',
      'Confirma tu respuesta antes de que se acabe el tiempo.',
    ],
    availability: 'AVAILABLE',
    release: 'CORE',
    ruleStatus: 'PROVISIONAL',
  },
  {
    type: 'LETTERS',
    slug: 'letras',
    group: 'CLASSIC',
    title: 'La palabra más larga',
    tagline: 'Forma la palabra más larga con diez letras.',
    howToPlay: [
      'Verás diez letras.',
      'Forma la palabra más larga que puedas. Cada letra se puede usar una sola vez.',
      'Debe tener al menos cinco letras y estar en nuestro diccionario. Las tildes se ponen solas; la Ñ es una letra aparte.',
      'Regla provisional: valen plurales, femeninos y conjugaciones. Las palabras con pronombre pegado (dámelo) o con prefijo (antiguerra) no se admiten por ahora.',
      'Confirma tu palabra antes de que se acabe el tiempo.',
    ],
    availability: 'AVAILABLE',
    release: 'CORE',
    ruleStatus: 'PROVISIONAL',
  },
  {
    type: 'KEY',
    slug: 'llave',
    group: 'OPENING',
    title: 'La llave',
    tagline: 'Adivina la palabra a partir de su definición.',
    howToPlay: [
      'Lee la definición y la longitud de la palabra.',
      'A mitad de tiempo se revela una letra de ayuda.',
    ],
    ...inPreparation,
  },
  {
    type: 'THREE_IN_ONE',
    slug: '3-en-1',
    group: 'DUELS',
    title: '3 en 1',
    tagline: 'Una definición y letras que aparecen poco a poco.',
    howToPlay: [
      'Lee la definición.',
      'Se irán revelando letras de la palabra a lo largo del tiempo.',
    ],
    ...inPreparation,
  },
  {
    type: 'DOUBLE_WORD',
    slug: 'doble-palabra',
    group: 'DUELS',
    title: 'Doble palabra',
    tagline: 'Reparte diez letras entre dos palabras.',
    howToPlay: [
      'Resuelve las dos pistas usando entre las dos las diez letras, sin repetir ninguna.',
    ],
    ...inPreparation,
  },
  {
    type: 'TWO_FOR_TWO',
    slug: '2-para-2',
    group: 'DUELS',
    title: '2 para 2',
    tagline: 'Dos definiciones y un panel de letras.',
    howToPlay: ['Resuelve dos definiciones con ayuda de un panel de letras.'],
    availability: 'IN_PREPARATION',
    release: 'CORE',
    ruleStatus: 'PENDING_VERIFICATION',
  },
  {
    type: 'DOUBLE_MEANING',
    slug: 'doble-sentido',
    group: 'DUELS',
    title: 'Doble sentido',
    tagline: 'Una palabra que encaja con dos significados.',
    howToPlay: ['Lee las dos definiciones y encuentra la palabra que cumple ambas.'],
    ...inPreparation,
  },
  {
    type: 'MENTAL_CALCULATION',
    slug: 'calculo',
    group: 'DUELS',
    title: 'El cálculo',
    tagline: 'Resuelve una operación de cabeza, contrarreloj.',
    howToPlay: ['Calcula el resultado de una expresión con paréntesis y escribe el número.'],
    ...inPreparation,
  },
  {
    type: 'NUMBER_SPRINT',
    slug: 'esprint',
    group: 'DUELS',
    title: 'Esprint numérico',
    tagline: 'Un reto numérico rápido.',
    howToPlay: ['Resuelve un reto numérico lo más rápido posible.'],
    availability: 'IN_PREPARATION',
    release: 'CORE',
    ruleStatus: 'PENDING_VERIFICATION',
  },
  {
    type: 'FINAL',
    slug: 'gran-final',
    group: 'FINAL',
    title: 'Gran final',
    tagline: 'Doce palabras de un mismo tema en tres minutos.',
    howToPlay: [
      'Resuelve palabras de un tema común antes de que acabe el tiempo.',
      'Puedes pasar y volver a las pendientes.',
    ],
    ...inPreparation,
  },
  {
    type: 'TIEBREAK',
    slug: 'desempate',
    group: 'EXTRA',
    title: 'Desempate',
    tagline: 'Un reto rápido de palabras.',
    howToPlay: ['Resuelve cuanto antes una palabra a partir de unas letras.'],
    ...inPreparation,
  },
  {
    type: 'SPECIAL_DECIPHER',
    slug: 'descifra',
    group: 'SPECIAL',
    title: 'Descifra',
    tagline: 'Respuestas numéricas desordenadas.',
    howToPlay: ['Prueba especial: se activará en la beta ampliada.'],
    availability: 'IN_PREPARATION',
    release: 'EXTENDED_BETA',
    ruleStatus: 'PROVISIONAL',
  },
  {
    type: 'SPECIAL_MASTER_WORD',
    slug: 'palabra-maestra',
    group: 'SPECIAL',
    title: 'La palabra maestra',
    tagline: 'Forma palabras a partir de una palabra base.',
    howToPlay: ['Prueba especial: se activará en la beta ampliada.'],
    availability: 'IN_PREPARATION',
    release: 'EXTENDED_BETA',
    ruleStatus: 'PROVISIONAL',
  },
];

export function findPuzzleBySlug(slug: string): PuzzleDefinition | undefined {
  return PUZZLE_REGISTRY.find((p) => p.slug === slug);
}

export const isPlayable = (puzzle: PuzzleDefinition): boolean =>
  puzzle.availability === 'AVAILABLE';

/** Tiempo predeterminado del perfil de reglas; `null` cuando aún no está definido para esa prueba. */
export function defaultDurationSeconds(type: PuzzleType, ruleset: Ruleset): number | null {
  switch (type) {
    case 'KEY':
      return ruleset.stages.key.durationSeconds;
    case 'NUMBER':
      return ruleset.stages.classic.numberDurationSeconds;
    case 'LETTERS':
      return ruleset.stages.classic.letterDurationSeconds;
    case 'THREE_IN_ONE':
    case 'DOUBLE_WORD':
    case 'TWO_FOR_TWO':
    case 'DOUBLE_MEANING':
    case 'MENTAL_CALCULATION':
    case 'NUMBER_SPRINT':
      return ruleset.stages.duels.durationSeconds;
    case 'FINAL':
      return ruleset.stages.final.durationSeconds;
    case 'TIEBREAK': // PENDIENTE: duración sin documentar
    case 'SPECIAL_DECIPHER': // depende de la edición (SPECIAL_2024/2025)
    case 'SPECIAL_MASTER_WORD':
      return null;
  }
}

export interface CatalogGroup {
  readonly id: PuzzleGroup;
  readonly label: string;
  readonly puzzles: readonly PuzzleDefinition[];
}

/** Catálogo agrupado en el orden de `PUZZLE_GROUPS`, sin grupos vacíos. */
export function getCatalogGroups(): CatalogGroup[] {
  return PUZZLE_GROUPS.map((group) => ({
    ...group,
    puzzles: PUZZLE_REGISTRY.filter((p) => p.group === group.id),
  })).filter((group) => group.puzzles.length > 0);
}
