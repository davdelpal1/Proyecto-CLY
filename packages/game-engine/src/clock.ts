/**
 * Contrato de reloj inyectado (CLY-016). El motor nunca lee la hora del sistema:
 * recibe `nowMs` como parámetro. Cada plataforma aporta su implementación en `apps/game/src/adapters`.
 */
export interface Clock {
  /** Milisegundos monotónicos, válidos solo para diferencias dentro de una misma sesión. */
  nowMs(): number;
}
