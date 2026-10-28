/**
 * Fecha y hora de calendario en ms desde epoch. Solo para etiquetar cuándo se hizo una práctica
 * ("hace 2 h"). NO se usa para medir tiempos de juego: de eso se encarga `systemClock` (monotónico).
 */
export const epochNowMs = (): number => Date.now();
