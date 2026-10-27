import type { Clock } from '@cly/game-engine';

/**
 * Reloj de la plataforma (CLY-016). `performance.now()` es monotónico en web y en Hermes, así que un
 * cambio de hora del sistema no altera el tiempo restante. Es el ÚNICO lugar donde se lee el reloj:
 * el motor recibe `nowMs` como parámetro.
 */
export const systemClock: Clock = {
  nowMs: () => (typeof performance !== 'undefined' ? performance.now() : Date.now()),
};
