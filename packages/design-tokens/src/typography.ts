/**
 * Tipografía. De momento se usa la fuente del sistema en todas las plataformas: no hay ninguna
 * fuente comercial licenciada todavía (DESIGN.md exige licencia comercial). Cambiar aquí cuando se decida.
 */
export const fontSizes = {
  caption: 13,
  body: 16,
  bodyLarge: 18,
  title: 22,
  headline: 30,
  display: 44,
  timer: 40,
  target: 72,
} as const;

export const fontWeights = {
  regular: '400',
  medium: '600',
  bold: '800',
} as const;

export const lineHeights = {
  tight: 1.1,
  normal: 1.35,
} as const;

/** Cifras de ancho fijo para que el reloj y los marcadores no "bailen". */
export const tabularNumbers = { fontVariant: ['tabular-nums'] } as const;
