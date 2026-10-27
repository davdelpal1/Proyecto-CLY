/**
 * Semilla de un ejercicio nuevo. Es la única fuente de azar de la app: se decide aquí, en el borde,
 * y viaja en la URL (`?semilla=`) para poder repetir o compartir el mismo ejercicio.
 * No es un secreto: el entrenamiento no tiene validez competitiva.
 */
export function newExerciseSeed(): string {
  return Math.random().toString(36).slice(2, 10);
}
