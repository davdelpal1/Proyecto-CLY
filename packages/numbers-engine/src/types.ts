/** Identificador estable de una ficha dentro de un puzzle. Dos fichas con el mismo valor tienen ids distintos. */
export type TileId = string;

export type Operator = 'add' | 'subtract' | 'multiply' | 'divide';

export const OPERATORS: readonly Operator[] = ['add', 'subtract', 'multiply', 'divide'];

export const OPERATOR_SYMBOL: Readonly<Record<Operator, string>> = {
  add: '+',
  subtract: '−',
  multiply: '×',
  divide: '÷',
};

export interface NumberTile {
  readonly id: TileId;
  readonly value: number;
}

export interface NumbersPuzzle {
  readonly tiles: readonly NumberTile[];
  readonly target: number;
}

/**
 * Política aritmética. Las dos banderas booleanas reflejan `numberRules` de GAME_RULES.md,
 * marcadas [PENDIENTE]/[DISEÑO] hasta verificarlas con emisiones: por eso son parámetros y no constantes.
 */
export interface NumbersPolicy {
  readonly allowedOperators: readonly Operator[];
  /** Todo resultado intermedio debe ser un entero > 0. */
  readonly requirePositiveIntegerIntermediates: boolean;
  /** Una división solo es válida si ambos operandos son enteros y el cociente es entero. */
  readonly requireExactDivision: boolean;
}

/** Política estricta usada como valor por defecto en tests y solver. */
export const STRICT_POLICY: NumbersPolicy = {
  allowedOperators: OPERATORS,
  requirePositiveIntegerIntermediates: true,
  requireExactDivision: true,
};

/**
 * Expresión serializable (apta para red). Las hojas referencian fichas por `tileId`;
 * nunca se evalúa texto, por lo que no existe ningún `eval`.
 */
export type ExpressionTree =
  | { readonly kind: 'tile'; readonly tileId: TileId }
  | {
      readonly kind: 'op';
      readonly op: Operator;
      readonly left: ExpressionTree;
      readonly right: ExpressionTree;
    };

export type NumbersErrorCode =
  | 'TILE_REUSED'
  | 'UNKNOWN_TILE'
  | 'UNKNOWN_ITEM'
  | 'OPERATOR_NOT_ALLOWED'
  | 'DIVISION_BY_ZERO'
  | 'NON_INTEGER_DIVISION'
  | 'NON_INTEGER_RESULT'
  | 'NON_POSITIVE_RESULT'
  | 'ARITHMETIC_OVERFLOW'
  | 'MALFORMED_EXPRESSION'
  | 'DUPLICATE_RESULT_ID';

export interface NumbersError {
  readonly code: NumbersErrorCode;
}

/** Fuente de aleatoriedad inyectada: devuelve un número en [0, 1). */
export type RandomSource = () => number;
