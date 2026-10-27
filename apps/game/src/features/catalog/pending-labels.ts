/** Descripción en lenguaje llano de cada regla marcada [PENDIENTE] en el ruleset. */
const PENDING_LABELS: Readonly<Record<string, string>> = {
  'numberRules.requirePositiveIntegerIntermediates':
    'Los resultados intermedios deben ser números enteros positivos.',
  'numberRules.requireExactDivision': 'Las divisiones deben ser exactas.',
  'numberScoring.maxApproxDistance':
    'Hasta qué distancia del objetivo sigue puntuando una aproximación (solo afecta al concurso).',
};

export const describePendingField = (path: string): string => PENDING_LABELS[path] ?? path;
