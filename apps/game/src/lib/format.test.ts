import { describe, expect, it } from 'vitest';
import { formatAgo, formatClock, formatDistance, formatDuration, formatSeconds } from './format';

describe('formatClock', () => {
  it('redondea hacia arriba para no mostrar 0:00 con tiempo disponible', () => {
    expect(formatClock(40_000)).toBe('0:40');
    expect(formatClock(39_001)).toBe('0:40');
    expect(formatClock(1)).toBe('0:01');
    expect(formatClock(0)).toBe('0:00');
  });

  it('formatea minutos y nunca devuelve negativos', () => {
    expect(formatClock(180_000)).toBe('3:00');
    expect(formatClock(65_000)).toBe('1:05');
    expect(formatClock(-500)).toBe('0:00');
  });
});

describe('formatSeconds', () => {
  it('usa coma decimal', () => {
    expect(formatSeconds(12_400)).toBe('12,4 s');
    expect(formatSeconds(0)).toBe('0,0 s');
  });
});

describe('formatDuration', () => {
  it('muestra segundos, minutos exactos o "Por definir"', () => {
    expect(formatDuration(40)).toBe('40 s');
    expect(formatDuration(180)).toBe('3 min');
    expect(formatDuration(90)).toBe('90 s');
    expect(formatDuration(null)).toBe('Por definir');
  });
});

describe('formatAgo', () => {
  const now = 10 * 24 * 3_600_000;
  it('escala de "hace un momento" a días', () => {
    expect(formatAgo(now, now - 30_000)).toBe('hace un momento');
    expect(formatAgo(now, now - 5 * 60_000)).toBe('hace 5 min');
    expect(formatAgo(now, now - 3 * 3_600_000)).toBe('hace 3 h');
    expect(formatAgo(now, now - 30 * 3_600_000)).toBe('ayer');
    expect(formatAgo(now, now - 4 * 24 * 3_600_000)).toBe('hace 4 días');
  });

  it('una marca futura (reloj cambiado) no produce textos raros', () => {
    expect(formatAgo(now, now + 3_600_000)).toBe('hace un momento');
  });
});

describe('formatDistance', () => {
  it('describe la distancia al objetivo', () => {
    expect(formatDistance(0)).toBe('justo en el objetivo');
    expect(formatDistance(12)).toBe('a 12 del objetivo');
    expect(formatDistance(2.5)).toBe('a 2,50 del objetivo');
  });
});
