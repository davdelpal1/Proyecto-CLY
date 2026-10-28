import { defineConfig } from 'vitest/config';

// Los tests que resuelven decenas de puzzles de 6 fichas tardan ~2 s en un equipo libre, pero
// bastante más con la CPU ocupada (servidor de desarrollo, antivirus…): el límite por defecto de
// 5 s daba falsos fallos.
export default defineConfig({
  test: { testTimeout: 60_000 },
});
