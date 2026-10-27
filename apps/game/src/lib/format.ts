/** "0:40": segundos restantes redondeados hacia arriba, para no mostrar 0:00 con tiempo aún disponible. */
export function formatClock(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

/** "12,4 s" (coma decimal, es-ES). */
export function formatSeconds(ms: number): string {
  return `${(Math.max(0, ms) / 1000).toFixed(1).replace('.', ',')} s`;
}

/** "40 s", "3 min" o "Por definir" cuando la prueba aún no tiene duración documentada. */
export function formatDuration(seconds: number | null): string {
  if (seconds === null) return 'Por definir';
  if (seconds >= 60 && seconds % 60 === 0) return `${seconds / 60} min`;
  return `${seconds} s`;
}

/** Texto de distancia al objetivo para voz y pantalla: "a 12 del objetivo". */
export function formatDistance(distance: number): string {
  if (distance === 0) return 'justo en el objetivo';
  const shown = Number.isInteger(distance)
    ? String(distance)
    : distance.toFixed(2).replace('.', ',');
  return `a ${shown} del objetivo`;
}
