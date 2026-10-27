import { RTVE_2026_REFERENCE, createRulesetSnapshot } from '@cly/game-engine';

/**
 * Ruleset activo de la app: snapshot inmutable del perfil de referencia (sigue `UNVERIFIED`).
 * La UI lo lee para tiempos, textos y secuencia; no duplica ninguna regla.
 */
const snapshot = createRulesetSnapshot(RTVE_2026_REFERENCE);

export const ACTIVE_RULESET = snapshot.ruleset;
export const ACTIVE_RULESET_HASH = snapshot.hash;
