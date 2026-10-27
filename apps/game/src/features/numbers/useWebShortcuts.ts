import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';

export type ShortcutHandlers = Partial<Record<string, () => void>>;

/**
 * Atajos de teclado físico (solo web; en móvil no hace nada). Las teclas son valores de
 * `KeyboardEvent.key`. Se ignoran con modificadores y cuando el foco está en un campo de texto.
 * Enter/espacio se dejan al elemento enfocado para no activar dos veces un botón.
 */
export function useWebShortcuts(handlers: ShortcutHandlers, enabled: boolean): void {
  const ref = useRef(handlers);
  ref.current = handlers;

  useEffect(() => {
    if (Platform.OS !== 'web' || !enabled) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey || event.altKey) return;
      const target = event.target as HTMLElement | null;
      if (target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA') return;

      const interactive =
        target?.getAttribute?.('role') === 'button' || target?.tagName === 'BUTTON';
      if (interactive && (event.key === 'Enter' || event.key === ' ')) return;

      const handler = ref.current[event.key];
      if (handler) {
        event.preventDefault();
        handler();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [enabled]);
}
