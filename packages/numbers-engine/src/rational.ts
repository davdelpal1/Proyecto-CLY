/**
 * Racionales exactos sobre enteros seguros de JS. Evitan errores de coma flotante cuando
 * una política relaja `requireExactDivision`. Todas las operaciones devuelven `null` ante desbordamiento.
 */
export interface Rational {
  readonly n: number;
  readonly d: number;
}

function gcd(a: number, b: number): number {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y !== 0) {
    [x, y] = [y, x % y];
  }
  return x === 0 ? 1 : x;
}

/** Crea un racional normalizado (denominador > 0, fracción irreducible). */
export function rational(n: number, d = 1): Rational | null {
  if (!Number.isSafeInteger(n) || !Number.isSafeInteger(d) || d === 0) return null;
  const sign = d < 0 ? -1 : 1;
  const g = gcd(n, d);
  return { n: (sign * n) / g, d: (sign * d) / g };
}

export function int(n: number): Rational {
  return { n, d: 1 };
}

export const isInteger = (r: Rational): boolean => r.d === 1;
export const toNumber = (r: Rational): number => r.n / r.d;
export const equals = (a: Rational, b: Rational): boolean => a.n === b.n && a.d === b.d;
export const formatRational = (r: Rational): string => (r.d === 1 ? String(r.n) : `${r.n}/${r.d}`);

function safeMul(a: number, b: number): number | null {
  const p = a * b;
  return Number.isSafeInteger(p) ? p : null;
}

export function add(a: Rational, b: Rational): Rational | null {
  const x = safeMul(a.n, b.d);
  const y = safeMul(b.n, a.d);
  const d = safeMul(a.d, b.d);
  if (x === null || y === null || d === null) return null;
  return rational(x + y, d);
}

export function subtract(a: Rational, b: Rational): Rational | null {
  return add(a, { n: -b.n, d: b.d });
}

export function multiply(a: Rational, b: Rational): Rational | null {
  const n = safeMul(a.n, b.n);
  const d = safeMul(a.d, b.d);
  if (n === null || d === null) return null;
  return rational(n, d);
}

/** El divisor debe ser distinto de cero (lo comprueba quien llama). */
export function divide(a: Rational, b: Rational): Rational | null {
  const n = safeMul(a.n, b.d);
  const d = safeMul(a.d, b.n);
  if (n === null || d === null) return null;
  return rational(n, d);
}
