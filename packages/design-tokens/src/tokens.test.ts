import { describe, expect, it } from 'vitest';
import { colors, contrastRatio, getBreakpoint, minTouchTarget } from './index';

describe('contraste de la paleta (WCAG 2.2 AA: texto normal ≥ 4.5)', () => {
  // [primer plano, fondo, mínimo exigido]
  const pairs = [
    ['text', 'background', 7],
    ['text', 'surface', 7],
    ['textMuted', 'background', 4.5],
    ['textMuted', 'surface', 4.5],
    ['textMuted', 'surfaceRaised', 4.5],
    ['textSubtle', 'background', 4.5],
    ['textSubtle', 'surface', 4.5],
    ['onAccent', 'accent', 4.5],
    ['onAccent', 'accentPressed', 4.5],
    ['onHighlight', 'highlight', 4.5],
    ['onHighlight', 'highlightPressed', 4.5],
    ['onGold', 'gold', 4.5],
    ['onTilePaper', 'tilePaper', 7],
    ['accent', 'background', 4.5],
    ['accent', 'surface', 4.5],
    ['highlight', 'background', 4.5],
    ['success', 'surface', 4.5],
    ['warning', 'surface', 4.5],
    ['danger', 'surface', 4.5],
  ] as const;

  it.each(pairs)('%s sobre %s ≥ %d', (foreground, background, minimum) => {
    expect(contrastRatio(colors[foreground], colors[background])).toBeGreaterThanOrEqual(minimum);
  });

  it('el anillo de foco es perceptible sobre el fondo (≥ 3, WCAG 1.4.11)', () => {
    expect(contrastRatio(colors.focusRing, colors.background)).toBeGreaterThanOrEqual(3);
    expect(contrastRatio(colors.focusRing, colors.surface)).toBeGreaterThanOrEqual(3);
  });

  it('los bordes de controles son distinguibles del fondo (≥ 3)', () => {
    expect(contrastRatio(colors.borderStrong, colors.background)).toBeGreaterThanOrEqual(3);
  });
});

describe('layout', () => {
  it('clasifica anchos en móvil, tablet y escritorio', () => {
    expect(getBreakpoint(360)).toBe('phone');
    expect(getBreakpoint(639)).toBe('phone');
    expect(getBreakpoint(640)).toBe('tablet');
    expect(getBreakpoint(1023)).toBe('tablet');
    expect(getBreakpoint(1024)).toBe('desktop');
  });

  it('el tamaño táctil mínimo es 48', () => {
    expect(minTouchTarget).toBe(48);
  });
});
