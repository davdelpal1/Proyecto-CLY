import { describe, expect, it } from 'vitest';
import {
  RTVE_2026_REFERENCE,
  createRulesetSnapshot,
  pendingFields,
  rulesetSnapshotHash,
  validateRuleset,
} from './ruleset';
import type { Ruleset } from './ruleset';

describe('RTVE_2026_REFERENCE', () => {
  it('es consistente y sigue sin verificar', () => {
    expect(validateRuleset(RTVE_2026_REFERENCE)).toEqual([]);
    expect(RTVE_2026_REFERENCE.releaseStatus).toBe('UNVERIFIED');
  });

  it('mantiene como PENDIENTE las reglas de cifras que GAME_RULES.md no ha verificado', () => {
    const pending = pendingFields(RTVE_2026_REFERENCE);
    expect(pending).toContain('numberRules.requirePositiveIntegerIntermediates');
    expect(pending).toContain('numberRules.requireExactDivision');
    expect(pending).toContain('numberScoring.maxApproxDistance');
    expect(pendingFields(RTVE_2026_REFERENCE, 'numberRules')).toHaveLength(2);
  });

  it('tiene todos los valores de GAME_RULES.md §1', () => {
    expect(RTVE_2026_REFERENCE.stages.key.durationSeconds).toBe(30);
    expect(RTVE_2026_REFERENCE.stages.classic.numberDurationSeconds).toBe(40);
    expect(RTVE_2026_REFERENCE.stages.classic.letterDurationSeconds).toBe(30);
    expect(RTVE_2026_REFERENCE.stages.duels.pointValues).toEqual([10, 20, 30, 50]);
    expect(RTVE_2026_REFERENCE.stages.final.durationSeconds).toBe(180);
    expect(RTVE_2026_REFERENCE.numberRules.minTarget).toBe(100);
    expect(RTVE_2026_REFERENCE.numberRules.maxTarget).toBe(999);
    expect(RTVE_2026_REFERENCE.numberRules.allowRepeatTile).toBe(false);
  });
});

describe('validateRuleset', () => {
  const withNumbers = (patch: Partial<Ruleset['numberRules']>): Ruleset => ({
    ...RTVE_2026_REFERENCE,
    numberRules: { ...RTVE_2026_REFERENCE.numberRules, ...patch },
  });

  it('detecta objetivo mínimo mayor que el máximo', () => {
    expect(validateRuleset(withNumbers({ minTarget: 500, maxTarget: 100 }))).toHaveLength(1);
  });

  it('detecta un recuento de rondas clásicas incoherente', () => {
    const broken: Ruleset = {
      ...RTVE_2026_REFERENCE,
      stages: {
        ...RTVE_2026_REFERENCE.stages,
        classic: { ...RTVE_2026_REFERENCE.stages.classic, count: 9 },
      },
    };
    expect(validateRuleset(broken)[0]).toContain('stages.classic.count');
  });

  it('un ruleset VERIFIED no puede tener campos PENDIENTE', () => {
    const lying: Ruleset = { ...RTVE_2026_REFERENCE, releaseStatus: 'VERIFIED' };
    expect(validateRuleset(lying)).toContain('Un ruleset VERIFIED no puede tener campos PENDIENTE');
  });
});

describe('snapshot', () => {
  it('el hash es estable y sensible a cualquier cambio de regla', () => {
    const hash = rulesetSnapshotHash(RTVE_2026_REFERENCE);
    expect(hash).toBe(rulesetSnapshotHash({ ...RTVE_2026_REFERENCE }));
    const changed: Ruleset = {
      ...RTVE_2026_REFERENCE,
      numberRules: { ...RTVE_2026_REFERENCE.numberRules, requireExactDivision: false },
    };
    expect(rulesetSnapshotHash(changed)).not.toBe(hash);
  });

  it('el snapshot es inmutable y no comparte referencias con el original', () => {
    const snapshot = createRulesetSnapshot(RTVE_2026_REFERENCE);
    expect(snapshot.ruleset).toEqual(RTVE_2026_REFERENCE);
    expect(Object.isFrozen(snapshot.ruleset.stages.duels.pointValues)).toBe(true);
    expect(snapshot.ruleset).not.toBe(RTVE_2026_REFERENCE);
  });

  it('no permite crear un snapshot de un ruleset inválido', () => {
    const invalid: Ruleset = {
      ...RTVE_2026_REFERENCE,
      numberRules: { ...RTVE_2026_REFERENCE.numberRules, minTarget: 999, maxTarget: 100 },
    };
    expect(() => createRulesetSnapshot(invalid)).toThrow(/inválido/);
  });
});
