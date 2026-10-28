import { describe, expect, it } from 'vitest';
import { ES_LEXICON_TEXT } from '@cly/words-engine/data/es-ES';
import { canSpell, parseLexicon } from '@cly/words-engine';
import { createLettersRound, solveLetters, tileLetters } from './letters-round';
import { RTVE_2026_REFERENCE } from './ruleset';
import { shuffled } from './shuffle';
import { createSeededRandom } from './rng';

// Contra el léxico REAL: comprueba que el generador y el buscador funcionan con datos de verdad.
const lexicon = parseLexicon(ES_LEXICON_TEXT);
const { letterRules, letterTiles } = RTVE_2026_REFERENCE;
const VOWELS = 'aeiou';

const seeds = Array.from({ length: 40 }, (_, i) => `ronda-${i}`);

describe('shuffled', () => {
  it('conserva los elementos, no toca el original y es reproducible', () => {
    const items = [1, 2, 3, 4, 5, 6];
    const a = shuffled(items, createSeededRandom('x'));
    expect([...a].sort()).toEqual(items);
    expect(items).toEqual([1, 2, 3, 4, 5, 6]);
    expect(shuffled(items, createSeededRandom('x'))).toEqual(a);
  });
});

describe('createLettersRound', () => {
  it('es reproducible: misma semilla ⇒ mismo ejercicio y misma solución', () => {
    const a = createLettersRound(RTVE_2026_REFERENCE, 'semilla', lexicon);
    const b = createLettersRound(RTVE_2026_REFERENCE, 'semilla', lexicon);
    expect(b).toEqual(a);
    const c = createLettersRound(RTVE_2026_REFERENCE, 'otra', lexicon);
    expect(tileLetters(c.puzzle)).not.toBe(tileLetters(a.puzzle));
  });

  it('reparte diez fichas con 3–6 vocales, ids estables y sin pasar del máximo por letra', () => {
    for (const seed of seeds) {
      const { puzzle } = createLettersRound(RTVE_2026_REFERENCE, seed, lexicon);
      expect(puzzle.tiles.map((t) => t.id)).toEqual(
        Array.from({ length: letterRules.tileCount }, (_, i) => `l${i + 1}`),
      );
      const letters = tileLetters(puzzle);
      const vowels = [...letters].filter((l) => VOWELS.includes(l)).length;
      expect(vowels, `${seed}: ${letters}`).toBeGreaterThanOrEqual(letterRules.minVowels);
      expect(vowels, `${seed}: ${letters}`).toBeLessThanOrEqual(letterRules.maxVowels);
      for (const letter of new Set(letters)) {
        expect([...letters].filter((l) => l === letter).length).toBeLessThanOrEqual(
          letterTiles.maxCopiesPerLetter,
        );
      }
    }
  });

  it('solo reparte letras del alfabeto de juego', () => {
    const allowed = new Set([
      ...Object.keys(letterTiles.vowelWeights),
      ...Object.keys(letterTiles.consonantWeights),
    ]);
    for (const seed of seeds) {
      const letters = tileLetters(createLettersRound(RTVE_2026_REFERENCE, seed, lexicon).puzzle);
      for (const letter of letters) expect(allowed.has(letter)).toBe(true);
    }
  });

  it('siempre hay solución de al menos 6 letras y la solución es verdadera', () => {
    for (const seed of seeds) {
      const { puzzle, solution } = createLettersRound(RTVE_2026_REFERENCE, seed, lexicon);
      const letters = tileLetters(puzzle);
      expect(solution.bestLength, `${seed}: ${letters}`).toBeGreaterThanOrEqual(6);
      expect(solution.topWords[0]?.key.length).toBe(solution.bestLength);
      expect(solution.formableCount).toBeGreaterThanOrEqual(solution.topWords.length);
      for (const entry of solution.topWords) {
        expect(canSpell(letters, entry.key), entry.word).toBe(true);
        expect(entry.key.length).toBeGreaterThanOrEqual(letterRules.minAnswerLength);
        // El nivel admitido por el ruleset se respeta.
        expect(['BASE', 'INFLECTION', 'SUFFIX_DERIVATION']).toContain(entry.tier);
      }
    }
  });

  it('respeta el número de vocales pedido y rechaza uno fuera de rango', () => {
    for (const vowels of [3, 4, 5, 6]) {
      const { puzzle } = createLettersRound(RTVE_2026_REFERENCE, 'v', lexicon, { vowels });
      expect([...tileLetters(puzzle)].filter((l) => VOWELS.includes(l))).toHaveLength(vowels);
    }
    expect(() => createLettersRound(RTVE_2026_REFERENCE, 'v', lexicon, { vowels: 2 })).toThrow();
    expect(() => createLettersRound(RTVE_2026_REFERENCE, 'v', lexicon, { vowels: 7 })).toThrow();
    expect(() => createLettersRound(RTVE_2026_REFERENCE, 'v', lexicon, { vowels: 4.5 })).toThrow();
  });

  it('exigir una longitud mayor da rondas con soluciones más largas', () => {
    const { solution } = createLettersRound(RTVE_2026_REFERENCE, 'larga', lexicon, {
      minBestLength: 8,
    });
    expect(solution.bestLength).toBeGreaterThanOrEqual(8);
  });
});

describe('solveLetters', () => {
  const puzzleOf = (letters: string) => ({
    tiles: [...letters].map((letter, i) => ({ id: `l${i + 1}`, letter })),
  });

  it('encuentra la palabra más larga en un reparto conocido', () => {
    const solution = solveLetters(puzzleOf('murcielago'), lexicon, letterRules);
    expect(solution.bestLength).toBe(10);
    // Hay otra palabra de diez letras con las mismas fichas («morceguila»): basta con que esté la buscada.
    expect(solution.topWords.map((e) => e.word)).toContain('murciélago');
  });

  it('ordena de más larga a más corta y, a igualdad, alfabéticamente', () => {
    const { topWords } = solveLetters(puzzleOf('aeorcsnmtl'), lexicon, letterRules, 30);
    for (let i = 1; i < topWords.length; i++) {
      const prev = topWords[i - 1]!;
      const cur = topWords[i]!;
      expect(prev.key.length).toBeGreaterThanOrEqual(cur.key.length);
      if (prev.key.length === cur.key.length) expect(prev.word <= cur.word).toBe(true);
    }
  });

  it('la ñ solo se usa con una ficha ñ', () => {
    expect(
      solveLetters(puzzleOf('cañaxxxxxx'), lexicon, letterRules).topWords.map((e) => e.word),
    ).toEqual([]); // «caña» tiene 4 letras: bajo el mínimo
    const withEnye = solveLetters(puzzleOf('pequeñoaxx'), lexicon, letterRules);
    expect(withEnye.topWords.map((e) => e.word)).toContain('pequeño');
    const withoutEnye = solveLetters(puzzleOf('pequenoaxx'), lexicon, letterRules);
    expect(withoutEnye.topWords.map((e) => e.word)).not.toContain('pequeño');
  });

  it('un reparto sin palabras de la longitud mínima da una solución vacía', () => {
    const solution = solveLetters(puzzleOf('qqqqqwwwww'.replace(/w/g, 'x')), lexicon, letterRules);
    expect(solution).toEqual({ bestLength: 0, topWords: [], formableCount: 0 });
  });

  it('un nivel de léxico más estricto no amplía las soluciones', () => {
    const wide = solveLetters(puzzleOf('aeorcsnmtl'), lexicon, {
      ...letterRules,
      maxLexiconTier: 'PRONOUN_ATTACHED',
    });
    const strict = solveLetters(puzzleOf('aeorcsnmtl'), lexicon, {
      ...letterRules,
      maxLexiconTier: 'BASE',
    });
    expect(strict.formableCount).toBeLessThan(wide.formableCount);
  });
});
