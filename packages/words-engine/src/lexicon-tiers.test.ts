import { describe, expect, it } from 'vitest';
import {
  LEXICON_TIERS,
  classifyDerivation,
  isGameWord,
  moreReliableTier,
  parseAffixKinds,
  tierRank,
} from './lexicon-tiers';

// .aff sintético con la misma estructura que RLA-ES (no se usa el diccionario real en los tests).
const AFF = [
  'SET UTF-8',
  'FLAG UTF-8',
  'PFX a Y 2',
  'PFX a 0 a [^aeiou]',
  'PFX a 0 an [aeiou]',
  'PFX 🔭 Y 1',
  'PFX 🔭 0 macro .',
  'SFX T Y 2',
  'SFX T r ble ar',
  'SFX T er ible er',
  'SFX S Y 1',
  'SFX S 0 s [aeiou]',
  'SFX R Y 1',
  'SFX R r mos [aei]r',
  'SFX À Y 1',
  'SFX À 0 lo r',
  'SFX 🧠 N 1',
  'SFX 🧠 0 mente [^o]',
].join('\n');

const kinds = parseAffixKinds(AFF);

describe('parseAffixKinds', () => {
  it('lee solo las cabeceras de grupo, no las reglas', () => {
    expect([...kinds.keys()].sort()).toEqual(['S', 'R', 'T', 'a', 'À', '🔭', '🧠'].sort());
  });

  it('distingue prefijos de sufijos, incluidos flags Unicode', () => {
    expect(kinds.get('a')).toBe('PFX');
    expect(kinds.get('🔭')).toBe('PFX');
    expect(kinds.get('S')).toBe('SFX');
    expect(kinds.get('À')).toBe('SFX');
    expect(kinds.get('🧠')).toBe('SFX');
  });

  it('admite saltos de línea de Windows', () => {
    expect(parseAffixKinds('SFX S Y 1\r\nSFX S 0 s .\r\n').get('S')).toBe('SFX');
  });
});

describe('classifyDerivation', () => {
  const tier = (rules: string) => classifyDerivation(rules, kinds).tier;

  it('sin reglas es BASE', () => {
    expect(tier('')).toBe('BASE');
    expect(tier('   ')).toBe('BASE');
  });

  it('plural y conjugación son INFLECTION', () => {
    expect(tier(' S')).toBe('INFLECTION');
    expect(tier(' R')).toBe('INFLECTION');
  });

  it('sufijos derivativos son SUFFIX_DERIVATION, aunque lleven plural', () => {
    expect(tier(' T')).toBe('SUFFIX_DERIVATION');
    expect(tier(' T S')).toBe('SUFFIX_DERIVATION');
    expect(tier(' 🧠')).toBe('SUFFIX_DERIVATION');
  });

  it('prefijos son PREFIX_DERIVATION', () => {
    expect(tier(' a')).toBe('PREFIX_DERIVATION');
    expect(tier(' a S')).toBe('PREFIX_DERIVATION');
    expect(tier(' 🔭')).toBe('PREFIX_DERIVATION');
  });

  it('un sufijo no clasificado se trata como pronombre pegado (lo más conservador)', () => {
    expect(tier(' À')).toBe('PRONOUN_ATTACHED');
  });

  it('con varias reglas manda la menos fiable', () => {
    expect(tier(' R À')).toBe('PRONOUN_ATTACHED');
    expect(tier(' a T')).toBe('PREFIX_DERIVATION');
  });

  it('un flag que no está en el .aff no se cuela como fiable y se avisa', () => {
    const result = classifyDerivation(' Ж', kinds);
    expect(result.tier).toBe('PRONOUN_ATTACHED');
    expect(result.unknownFlags).toEqual(['Ж']);
  });
});

describe('niveles', () => {
  it('están ordenados de más a menos fiable', () => {
    expect(LEXICON_TIERS[0]).toBe('BASE');
    expect(tierRank('INFLECTION')).toBeLessThan(tierRank('PREFIX_DERIVATION'));
  });

  it('moreReliableTier elige el más fiable', () => {
    expect(moreReliableTier('PRONOUN_ATTACHED', 'INFLECTION')).toBe('INFLECTION');
    expect(moreReliableTier('BASE', 'SUFFIX_DERIVATION')).toBe('BASE');
  });
});

describe('isGameWord', () => {
  const filter = { minLength: 2, maxLength: 10 };

  it('acepta minúsculas con ñ, tildes y ü', () => {
    for (const word of ['casa', 'ñandú', 'cigüeña', 'murciélago', 'sí']) {
      expect(isGameWord(word, filter)).toBe(true);
    }
  });

  it('descarta mayúsculas, siglas, guiones, apóstrofos, dígitos, espacios y otros alfabetos', () => {
    for (const word of [
      'Casa',
      'ADN',
      'aire-acondicionado',
      "d'or",
      'abc1',
      'dos palabras',
      'café☕',
      'привет',
      '',
    ]) {
      expect(isGameWord(word, filter)).toBe(false);
    }
  });

  it('respeta la longitud en letras, no en unidades UTF-16', () => {
    expect(isGameWord('ñ', filter)).toBe(false); // 1 letra
    expect(isGameWord('ñu', filter)).toBe(true);
    expect(isGameWord('electrodomestico', filter)).toBe(false);
    expect(isGameWord('abcdefghij', filter)).toBe(true); // 10
    expect(isGameWord('abcdefghijk', filter)).toBe(false); // 11
    expect(isGameWord('ñandú', { minLength: 5, maxLength: 5 })).toBe(true);
  });
});
