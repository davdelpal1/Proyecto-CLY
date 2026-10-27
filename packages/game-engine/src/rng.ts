import type { RandomSource } from '@cly/numbers-engine';

/** Hash de cadena → semilla de 32 bits (xmur3). */
function seedFromString(text: string): number {
  let h = 1779033703 ^ text.length;
  for (let i = 0; i < text.length; i++) {
    h = Math.imul(h ^ text.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  h = Math.imul(h ^ (h >>> 16), 2246822507);
  h = Math.imul(h ^ (h >>> 13), 3266489909);
  return (h ^ (h >>> 16)) >>> 0;
}

/**
 * PRNG determinista (mulberry32). Misma semilla ⇒ misma secuencia en web, iOS y Android.
 * La semilla se decide en el borde de la app (UI o servidor); el motor nunca llama a `Math.random`.
 * No es criptográficamente seguro y no debe usarse para nada competitivo que dependa del secreto.
 */
export function createSeededRandom(seed: string | number): RandomSource {
  let state = typeof seed === 'number' ? seed >>> 0 : seedFromString(seed);
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
