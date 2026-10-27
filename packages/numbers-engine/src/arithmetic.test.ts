import { describe, expect, it } from 'vitest';
import { applyOperator } from './arithmetic';
import { int, rational } from './rational';
import { STRICT_POLICY } from './types';
import type { NumbersPolicy } from './types';

const RELAXED: NumbersPolicy = {
  ...STRICT_POLICY,
  requirePositiveIntegerIntermediates: false,
  requireExactDivision: false,
};

describe('applyOperator (política estricta)', () => {
  it('suma, multiplica y resta con resultados enteros positivos', () => {
    expect(applyOperator(int(7), 'add', int(5), STRICT_POLICY)).toEqual({
      ok: true,
      value: int(12),
    });
    expect(applyOperator(int(7), 'multiply', int(5), STRICT_POLICY)).toEqual({
      ok: true,
      value: int(35),
    });
    expect(applyOperator(int(7), 'subtract', int(5), STRICT_POLICY)).toEqual({
      ok: true,
      value: int(2),
    });
  });

  it('rechaza restas con resultado cero o negativo', () => {
    expect(applyOperator(int(5), 'subtract', int(5), STRICT_POLICY)).toEqual({
      ok: false,
      code: 'NON_POSITIVE_RESULT',
    });
    expect(applyOperator(int(3), 'subtract', int(7), STRICT_POLICY)).toEqual({
      ok: false,
      code: 'NON_POSITIVE_RESULT',
    });
  });

  it('NUM-03: división no exacta → NON_INTEGER_DIVISION', () => {
    expect(applyOperator(int(7), 'divide', int(2), STRICT_POLICY)).toEqual({
      ok: false,
      code: 'NON_INTEGER_DIVISION',
    });
  });

  it('acepta división exacta y rechaza dividir entre cero', () => {
    expect(applyOperator(int(100), 'divide', int(4), STRICT_POLICY)).toEqual({
      ok: true,
      value: int(25),
    });
    expect(applyOperator(int(100), 'divide', int(0), STRICT_POLICY)).toEqual({
      ok: false,
      code: 'DIVISION_BY_ZERO',
    });
  });

  it('respeta los operadores permitidos', () => {
    const noMultiply: NumbersPolicy = { ...STRICT_POLICY, allowedOperators: ['add'] };
    expect(applyOperator(int(2), 'multiply', int(3), noMultiply)).toEqual({
      ok: false,
      code: 'OPERATOR_NOT_ALLOWED',
    });
  });

  it('detecta desbordamiento en lugar de devolver un valor impreciso', () => {
    const big = int(Number.MAX_SAFE_INTEGER);
    expect(applyOperator(big, 'multiply', big, RELAXED)).toEqual({
      ok: false,
      code: 'ARITHMETIC_OVERFLOW',
    });
  });
});

describe('applyOperator (política relajada, reglas [PENDIENTE])', () => {
  it('permite cocientes fraccionarios exactos sin error de coma flotante', () => {
    const third = applyOperator(int(7), 'divide', int(3), RELAXED);
    expect(third).toEqual({ ok: true, value: rational(7, 3) });
    if (!third.ok) throw new Error('inesperado');
    // (7/3) × 3 = 7 exacto, algo que con floats daría 7.000000000000001 en otros casos
    expect(applyOperator(third.value, 'multiply', int(3), RELAXED)).toEqual({
      ok: true,
      value: int(7),
    });
  });

  it('permite resultados cero o negativos', () => {
    expect(applyOperator(int(3), 'subtract', int(7), RELAXED)).toEqual({
      ok: true,
      value: int(-4),
    });
  });

  it('exactDivision=true con positiveInteger=false admite enteros no positivos pero no cocientes fraccionarios', () => {
    const policy: NumbersPolicy = { ...STRICT_POLICY, requirePositiveIntegerIntermediates: false };
    expect(applyOperator(int(-6), 'divide', int(3), policy)).toEqual({ ok: true, value: int(-2) });
    expect(applyOperator(int(7), 'divide', int(2), policy)).toEqual({
      ok: false,
      code: 'NON_INTEGER_DIVISION',
    });
  });

  it('exactDivision=false pero positiveInteger=true sigue rechazando fracciones como resultado', () => {
    const policy: NumbersPolicy = { ...STRICT_POLICY, requireExactDivision: false };
    expect(applyOperator(int(7), 'divide', int(2), policy)).toEqual({
      ok: false,
      code: 'NON_INTEGER_RESULT',
    });
  });
});
