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

/** "hace 5 min", "hace 2 h", "ayer", "hace 3 días". Marcas futuras o muy recientes → "hace un momento". */
export function formatAgo(nowMs: number, thenMs: number): string {
  const minutes = Math.floor((nowMs - thenMs) / 60_000);
  if (minutes < 1) return 'hace un momento';
  if (minutes < 60) return `hace ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `hace ${hours} h`;
  const days = Math.floor(hours / 24);
  return days === 1 ? 'ayer' : `hace ${days} días`;
}

/** Texto de distancia al objetivo para voz y pantalla: "a 12 del objetivo". */
export function formatDistance(distance: number): string {
  if (distance === 0) return 'justo en el objetivo';
  const shown = Number.isInteger(distance)
    ? String(distance)
    : distance.toFixed(2).replace('.', ',');
  return `a ${shown} del objetivo`;
}
