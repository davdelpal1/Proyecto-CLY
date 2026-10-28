import type { RandomSource } from '@cly/numbers-engine';

/** Copia mezclada (Fisher–Yates) con una fuente de azar inyectada: misma semilla ⇒ mismo orden. */
export function shuffled<T>(items: readonly T[], random: RandomSource): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [copy[i], copy[j]] = [copy[j] as T, copy[i] as T];
  }
  return copy;
}
