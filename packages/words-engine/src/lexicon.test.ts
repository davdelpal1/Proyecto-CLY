import { describe, expect, it } from 'vitest';
import { parseLexicon } from './lexicon';
import { buildLexiconText } from './lexicon-text';
import { tierRank } from './lexicon-tiers';
import type { LexiconTier } from './lexicon-tiers';
import { canSpell, toTileKey } from './tile-letters';

// Léxico sintético: el real se prueba aparte (real-lexicon.test.ts).
const WORDS: ReadonlyArray<readonly [string, LexiconTier]> = [
  ['casa', 'BASE'],
  ['casas', 'INFLECTION'],
  ['cantó', 'INFLECTION'],
  ['canto', 'BASE'],
  ['pingüino', 'BASE'],
  ['año', 'BASE'],
  ['ano', 'BASE'],
  ['antiguerra', 'PREFIX_DERIVATION'],
  ['dámelo', 'PRONOUN_ATTACHED'],
  ['serísimo', 'SUFFIX_DERIVATION'],
];

const built = buildLexiconText(
  WORDS.map(([word, tier]) => ({ word, rank: tierRank(tier) })),
  toTileKey,
);
const lexicon = parseLexicon(built.text);

describe('buildLexiconText', () => {
  it('agrupa por clave de ficha: una línea por clave, ordenadas', () => {
    expect(built.count).toBe(9); // «canto» y «cantó» comparten clave
    const keys = built.text
      .trim()
      .split('\n')
      .map((line) => line.split('\t')[0]);
    expect(keys).toEqual([...keys].sort());
  });

  it('para una clave compartida gana el nivel más fiable y, a igualdad, la palabra sin tilde', () => {
    expect(lexicon.lookup('canto')?.word).toBe('canto'); // BASE frente a «cantó» (INFLECTION)
    const tied = buildLexiconText(
      [
        { word: 'cantó', rank: 0 },
        { word: 'canto', rank: 0 },
      ],
      toTileKey,
    );
    expect(tied.text).toBe('canto\t0\n');
  });

  it('es determinista, sea cual sea el orden de entrada', () => {
    const forward = buildLexiconText(
      WORDS.map(([word, tier]) => ({ word, rank: tierRank(tier) })),
      toTileKey,
    );
    const backward = buildLexiconText(
      WORDS.map(([word, tier]) => ({ word, rank: tierRank(tier) })).reverse(),
      toTileKey,
    );
    expect(backward.text).toBe(forward.text);
  });

  it('un léxico vacío da un texto vacío', () => {
    expect(buildLexiconText([], toTileKey)).toEqual({ text: '', count: 0 });
    expect(parseLexicon('').size).toBe(0);
  });
});

describe('lookup', () => {
  it('encuentra palabras sin tilde y devuelve la forma canónica', () => {
    expect(lexicon.lookup('pinguino')).toEqual({
      key: 'pinguino',
      word: 'pingüino',
      tier: 'BASE',
    });
    expect(lexicon.lookup('PINGUINO')?.word).toBe('pingüino');
    expect(lexicon.lookup('pingüino')?.word).toBe('pingüino');
  });

  it('no confunde la ñ con la n', () => {
    expect(lexicon.lookup('año')?.word).toBe('año');
    expect(lexicon.lookup('ano')?.word).toBe('ano');
    expect(lexicon.lookup('ñ')).toBeNull();
  });

  it('rechaza lo que no está, lo vacío y lo que no son letras', () => {
    expect(lexicon.lookup('asdfg')).toBeNull();
    expect(lexicon.lookup('')).toBeNull();
    expect(lexicon.lookup('ca sa')).toBeNull();
    expect(lexicon.lookup('cas')).toBeNull(); // prefijo de una palabra, no una palabra
    expect(lexicon.lookup('casasa')).toBeNull();
  });

  it('respeta el nivel máximo admitido', () => {
    expect(lexicon.lookup('casas', 'BASE')).toBeNull();
    expect(lexicon.lookup('casas', 'INFLECTION')?.tier).toBe('INFLECTION');
    expect(lexicon.lookup('antiguerra', 'SUFFIX_DERIVATION')).toBeNull();
    expect(lexicon.lookup('antiguerra', 'PREFIX_DERIVATION')?.word).toBe('antiguerra');
    expect(lexicon.lookup('damelo', 'PREFIX_DERIVATION')).toBeNull();
    expect(lexicon.lookup('damelo')?.word).toBe('dámelo'); // sin tope, todos los niveles
  });

  it('encuentra todas las claves, primera y última incluidas', () => {
    for (const [word] of WORDS) expect(lexicon.lookup(word)).not.toBeNull();
  });
});

describe('findFormable', () => {
  it('devuelve solo palabras que caben en las fichas, con multiplicidad', () => {
    const found = lexicon.findFormable('casasxxxxx', { minLength: 4 });
    expect(found.map((e) => e.word).sort()).toEqual(['casa', 'casas']);
    for (const entry of found) expect(canSpell('casasxxxxx', entry.key)).toBe(true);
  });

  it('no usa una letra más veces de las que hay (LET-03)', () => {
    // «casas» necesita dos «s»; con una sola solo sale «casa»
    const found = lexicon.findFormable('casaxxxxxx', { minLength: 4 });
    expect(found.map((e) => e.word)).toEqual(['casa']);
  });

  it('aplica la longitud mínima y el nivel máximo', () => {
    expect(lexicon.findFormable('casasxxxxx', { minLength: 5 }).map((e) => e.word)).toEqual([
      'casas',
    ]);
    expect(
      lexicon.findFormable('casasxxxxx', { minLength: 4, maxTier: 'BASE' }).map((e) => e.word),
    ).toEqual(['casa']);
  });

  it('forma palabras con tilde o diéresis usando la letra base', () => {
    const found = lexicon.findFormable('ixpnguinox', { minLength: 5 });
    expect(found.map((e) => e.word)).toEqual(['pingüino']);
  });

  it('distingue la ñ de la n', () => {
    expect(lexicon.findFormable('anxxxxxxxx', { minLength: 3 })).toEqual([]);
    expect(lexicon.findFormable('añoxxxxxxx', { minLength: 3 }).map((e) => e.word)).toEqual([
      'año',
    ]);
  });

  it('rechaza fichas que no son letras del juego', () => {
    expect(() => lexicon.findFormable('ab1', { minLength: 1 })).toThrow(/Ficha no válida/);
  });
});

describe('parseLexicon', () => {
  it('lanza ante un texto mal formado', () => {
    expect(() => parseLexicon('casa\n')).toThrow(/mal formado/);
    expect(() => parseLexicon('casa\t9\n')).toThrow(/mal formado/); // nivel inexistente
    expect(() => parseLexicon('casa\t0x\n')).toThrow(/mal formado/);
    expect(() => parseLexicon('\t0\n')).toThrow(/mal formado/);
  });
});
