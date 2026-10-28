import { describe, expect, it } from 'vitest';
import { ES_LEXICON_ID, ES_LEXICON_SIZE, ES_LEXICON_TEXT } from '../data/es-ES';
import { parseLexicon } from './lexicon';
import { canSpell } from './tile-letters';

// Contra el léxico REAL empaquetado (RLA-ES). Comprobaciones puntuales, no una medida de cobertura:
// ADR-005 «Calidad» recoge lo que no se ha podido medir.
const lexicon = parseLexicon(ES_LEXICON_TEXT);

describe('léxico real es-ES', () => {
  it('se carga completo y su identificador es estable', () => {
    expect(lexicon.size).toBe(ES_LEXICON_SIZE);
    expect(ES_LEXICON_SIZE).toBeGreaterThan(300_000);
    expect(ES_LEXICON_ID).toMatch(/^rla-es-2\.9-[0-9a-f]{7}-[0-9a-f]{8}$/);
  });

  it('reconoce palabras corrientes con y sin tilde o diéresis, y devuelve la forma correcta', () => {
    for (const word of ['casa', 'perro', 'ventana', 'ordenador', 'canté', 'lápices']) {
      expect(lexicon.lookup(word), word).not.toBeNull();
    }
    expect(lexicon.lookup('cigueña')?.word).toBe('cigüeña');
    expect(lexicon.lookup('murcielago')?.word).toBe('murciélago');
    expect(lexicon.lookup('pinguino')?.word).toBe('pingüino');
  });

  it('rechaza inventos y secuencias sin sentido', () => {
    for (const word of ['asdfg', 'perroz', 'antiárbol', 'qqqqq', 'xyzxy']) {
      expect(lexicon.lookup(word), word).toBeNull();
    }
  });

  it('distingue la ñ de la n', () => {
    expect(lexicon.lookup('caña')?.word).toBe('caña');
    expect(lexicon.lookup('cana')?.word).toBe('cana'); // otra palabra distinta
    expect(lexicon.lookup('cañon')?.word).toBe('cañón');
    expect(lexicon.lookup('canon')?.word).toBe('canon'); // otra palabra, no «cañón»
  });

  it('conjugaciones y plurales son nivel 1; los pronombres pegados, nivel 4', () => {
    expect(lexicon.lookup('mesas')?.tier).toBe('INFLECTION');
    expect(lexicon.lookup('evacuarlo')?.tier).toBe('PRONOUN_ATTACHED');
    expect(lexicon.lookup('evacuarlo', 'SUFFIX_DERIVATION')).toBeNull();
    expect(lexicon.lookup('mesas', 'BASE')).toBeNull();
  });

  it('el buscador solo devuelve palabras formables con las fichas y encuentra las conocidas', () => {
    const tiles = 'aeorcsnmtl';
    const found = lexicon.findFormable(tiles, { minLength: 5, maxTier: 'SUFFIX_DERIVATION' });
    expect(found.length).toBeGreaterThan(100);
    for (const entry of found) {
      expect(canSpell(tiles, entry.key), entry.word).toBe(true);
      expect(entry.key.length).toBeGreaterThanOrEqual(5);
    }
    const words = new Set(found.map((e) => e.word));
    expect(words.has('calmo') || words.has('canoas') || words.has('cetros')).toBe(true);
  });

  it('buscar sobre diez fichas es lo bastante rápido para hacerlo al repartir', () => {
    const started = Date.now();
    for (let i = 0; i < 10; i++) lexicon.findFormable('aeiorsntcl', { minLength: 5 });
    const perSearchMs = (Date.now() - started) / 10;
    // Margen amplio a propósito (CI lento); en este equipo ronda los 10-20 ms.
    expect(perSearchMs).toBeLessThan(300);
  });
});
