import { useEffect, useState } from 'react';

const COUNTDOWN_FROM = 3;
const COUNTDOWN_STEP_MS = 800;

/**
 * Cuenta atrás de 3 s previa a las pruebas con reloj, con el ejercicio oculto: así nadie lo lee antes
 * de que corra su tiempo. No consume tiempo de respuesta. Sin reloj arranca de inmediato.
 * Devuelve el número que toca mostrar o `null` cuando ya no hay cuenta atrás.
 */
export function useGetReady(timed: boolean, start: () => void, enabled = true): number | null {
  const [countdown, setCountdown] = useState<number | null>(timed ? COUNTDOWN_FROM : null);

  useEffect(() => {
    if (!enabled) return;
    if (!timed) {
      start();
      return;
    }
    let remaining = COUNTDOWN_FROM;
    setCountdown(remaining);
    const id = setInterval(() => {
      remaining -= 1;
      if (remaining <= 0) {
        clearInterval(id);
        setCountdown(null);
        start();
      } else {
        setCountdown(remaining);
      }
    }, COUNTDOWN_STEP_MS);
    return () => clearInterval(id);
  }, [timed, start, enabled]);

  return countdown;
}
