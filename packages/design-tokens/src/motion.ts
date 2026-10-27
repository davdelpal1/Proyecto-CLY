/**
 * Duraciones de animación en ms. Con "reducir movimiento" activo la interfaz usa `reduced`
 * (cambio casi instantáneo). Ninguna animación modifica relojes ni puntuaciones (DESIGN.md §5).
 */
export const motion = {
  instant: 0,
  fast: 120,
  normal: 220,
  slow: 420,
  reduced: 1,
} as const;
