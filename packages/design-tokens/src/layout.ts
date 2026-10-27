export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

export const radii = {
  sm: 8,
  md: 12,
  lg: 20,
  xl: 28,
  pill: 999,
} as const;

/** Tamaño táctil mínimo recomendado por WCAG 2.2 (2.5.8) y las guías de plataforma. */
export const minTouchTarget = 48;

export type Breakpoint = 'phone' | 'tablet' | 'desktop';

export const breakpoints = { tablet: 640, desktop: 1024 } as const;

/** Ancho máximo del contenido por clase de pantalla: evita líneas kilométricas en escritorio. */
export const maxContentWidth: Readonly<Record<Breakpoint, number>> = {
  phone: 560,
  tablet: 760,
  desktop: 1120,
};

export function getBreakpoint(width: number): Breakpoint {
  if (width >= breakpoints.desktop) return 'desktop';
  if (width >= breakpoints.tablet) return 'tablet';
  return 'phone';
}

/** Sombras en sintaxis CSS (`boxShadow`, soportada por React Native moderno y por React Native Web). */
export const shadows = {
  card: '0px 8px 24px rgba(0, 0, 0, 0.35)',
  raised: '0px 4px 0px rgba(0, 0, 0, 0.35)',
  glowAccent: '0px 0px 24px rgba(31, 224, 207, 0.35)',
} as const;
