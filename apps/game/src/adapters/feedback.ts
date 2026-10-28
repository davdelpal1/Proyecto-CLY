import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

/**
 * Respuesta táctil (CLY-016). Nunca es imprescindible para entender el estado de la partida
 * (DESIGN.md §7): solo refuerza. En web no hace nada.
 */
export interface FeedbackAdapter {
  /** Pulsación ligera: seleccionar una ficha u operador. */
  tap(): void;
  success(): void;
  warning(): void;
  error(): void;
}

const noop = () => {};

function safely(run: () => Promise<void>): void {
  // La vibración es opcional: si el dispositivo no la soporta, se ignora sin romper la partida.
  run().catch(() => {});
}

export const deviceFeedback: FeedbackAdapter =
  Platform.OS === 'web'
    ? { tap: noop, success: noop, warning: noop, error: noop }
    : {
        tap: () => safely(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)),
        success: () =>
          safely(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)),
        warning: () =>
          safely(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)),
        error: () =>
          safely(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)),
      };
