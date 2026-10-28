import { describe, expect, it } from 'vitest';
import { AI_DIFFICULTIES, CONTEST_MODES, buildContestSchedule } from './contest';
import {
  PUZZLE_REGISTRY,
  defaultDurationSeconds,
  findPuzzleBySlug,
  getCatalogGroups,
  isPlayable,
} from './puzzle-registry';
import { RTVE_2026_REFERENCE } from './ruleset';
import type { Ruleset } from './ruleset';

describe('registro de pruebas', () => {
  it('contiene las 13 modalidades: 11 habituales (con desempate) y 2 especiales', () => {
    expect(PUZZLE_REGISTRY).toHaveLength(13);
    expect(PUZZLE_REGISTRY.filter((p) => p.release === 'CORE')).toHaveLength(11);
    expect(PUZZLE_REGISTRY.filter((p) => p.group === 'SPECIAL')).toHaveLength(2);
    expect(new Set(PUZZLE_REGISTRY.map((p) => p.type)).size).toBe(13);
    expect(new Set(PUZZLE_REGISTRY.map((p) => p.slug)).size).toBe(13);
  });

  it('incluye la llave, las seis variantes de duelo, desempate y gran final', () => {
    const types = PUZZLE_REGISTRY.map((p) => p.type);
    for (const expected of [
      'KEY',
      'THREE_IN_ONE',
      'DOUBLE_WORD',
      'TWO_FOR_TWO',
      'DOUBLE_MEANING',
      'MENTAL_CALCULATION',
      'NUMBER_SPRINT',
      'TIEBREAK',
      'FINAL',
    ] as const) {
      expect(types).toContain(expected);
    }
    expect(PUZZLE_REGISTRY.filter((p) => p.group === 'DUELS')).toHaveLength(6);
  });

  it('solo la cifra exacta y la palabra más larga están disponibles en esta build; el resto es "En preparación"', () => {
    const playable = PUZZLE_REGISTRY.filter(isPlayable).map((p) => p.type);
    expect(playable).toEqual(['NUMBER', 'LETTERS']);
  });

  it('marca 2 para 2 y Esprint numérico como pendientes de verificación (GAME_RULES: alto riesgo)', () => {
    const pending = PUZZLE_REGISTRY.filter((p) => p.ruleStatus === 'PENDING_VERIFICATION').map(
      (p) => p.type,
    );
    expect(pending.sort()).toEqual(['NUMBER_SPRINT', 'TWO_FOR_TWO']);
  });

  it('los especiales son de beta ampliada', () => {
    expect(PUZZLE_REGISTRY.filter((p) => p.release === 'EXTENDED_BETA').map((p) => p.type)).toEqual(
      ['SPECIAL_DECIPHER', 'SPECIAL_MASTER_WORD'],
    );
  });

  it('busca por slug', () => {
    expect(findPuzzleBySlug('cifras')?.type).toBe('NUMBER');
    expect(findPuzzleBySlug('no-existe')).toBeUndefined();
  });

  it('las duraciones salen del ruleset, no están duplicadas en el registro', () => {
    expect(defaultDurationSeconds('NUMBER', RTVE_2026_REFERENCE)).toBe(40);
    expect(defaultDurationSeconds('LETTERS', RTVE_2026_REFERENCE)).toBe(30);
    expect(defaultDurationSeconds('FINAL', RTVE_2026_REFERENCE)).toBe(180);
    expect(defaultDurationSeconds('TIEBREAK', RTVE_2026_REFERENCE)).toBeNull();
    const custom: Ruleset = {
      ...RTVE_2026_REFERENCE,
      stages: {
        ...RTVE_2026_REFERENCE.stages,
        classic: { ...RTVE_2026_REFERENCE.stages.classic, numberDurationSeconds: 55 },
      },
    };
    expect(defaultDurationSeconds('NUMBER', custom)).toBe(55);
  });

  it('el catálogo agrupa en el orden de UX_FLOWS.md', () => {
    const groups = getCatalogGroups();
    expect(groups.map((g) => g.label)).toEqual([
      'Clásicas',
      'Apertura',
      'Duelos',
      'Final',
      'Extra',
      'Especiales',
    ]);
    expect(groups.flatMap((g) => g.puzzles)).toHaveLength(13);
  });
});

describe('secuencia del concurso', () => {
  const schedule = buildContestSchedule(RTVE_2026_REFERENCE);

  it('sigue llave → 10 clásicas → 4 duelos → desempate → final', () => {
    expect(schedule).toHaveLength(17);
    expect(schedule.map((s) => s.position)).toEqual(Array.from({ length: 17 }, (_, i) => i + 1));
    expect(schedule.map((s) => s.stage)).toEqual([
      'KEY',
      ...Array<string>(10).fill('CLASSIC'),
      ...Array<string>(4).fill('DUEL'),
      'TIEBREAK',
      'FINAL',
    ]);
  });

  it('alterna 5 cifras y 5 letras empezando por el tipo configurado', () => {
    const classic = schedule.filter((s) => s.stage === 'CLASSIC').map((s) => s.puzzleType);
    expect(classic).toEqual([
      'NUMBER',
      'LETTERS',
      'NUMBER',
      'LETTERS',
      'NUMBER',
      'LETTERS',
      'NUMBER',
      'LETTERS',
      'NUMBER',
      'LETTERS',
    ]);

    const flipped: Ruleset = {
      ...RTVE_2026_REFERENCE,
      stages: {
        ...RTVE_2026_REFERENCE.stages,
        classic: { ...RTVE_2026_REFERENCE.stages.classic, firstType: 'LETTERS' },
      },
    };
    expect(buildContestSchedule(flipped).filter((s) => s.stage === 'CLASSIC')[0]?.puzzleType).toBe(
      'LETTERS',
    );
  });

  it('los duelos valen 10/20/30/50 y se eligen entre seis modalidades', () => {
    const duels = schedule.filter((s) => s.stage === 'DUEL');
    expect(duels.map((d) => d.points)).toEqual([10, 20, 30, 50]);
    expect(duels.every((d) => d.puzzleType === null && d.duelChoices?.length === 6)).toBe(true);
  });

  it('desempate y final son condicionales; las duraciones salen del ruleset', () => {
    expect(schedule.filter((s) => s.conditional).map((s) => s.stage)).toEqual([
      'TIEBREAK',
      'FINAL',
    ]);
    expect(schedule.find((s) => s.stage === 'FINAL')?.durationSeconds).toBe(180);
    expect(schedule.find((s) => s.stage === 'KEY')?.durationSeconds).toBe(30);
  });
});

describe('modos de concurso', () => {
  it('solo contra IA ofrece configuración; local y online siguen en preparación', () => {
    expect(CONTEST_MODES.map((m) => [m.id, m.availability])).toEqual([
      ['AI', 'CONFIGURABLE'],
      ['LOCAL', 'IN_PREPARATION'],
      ['ONLINE', 'IN_PREPARATION'],
    ]);
  });

  it('hay tres niveles de IA', () => {
    expect(AI_DIFFICULTIES.map((d) => d.id)).toEqual(['BEGINNER', 'NORMAL', 'EXPERT']);
  });
});
