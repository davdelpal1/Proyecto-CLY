import { useMemo } from 'react';
import { deviceFeedback } from '../adapters/feedback';
import type { FeedbackAdapter } from '../adapters/feedback';
import { useSettings } from './SettingsProvider';

/** Respuesta táctil que respeta el ajuste del usuario. Sin vibración, todas las llamadas son inertes. */
export function useFeedback(adapter: FeedbackAdapter = deviceFeedback): FeedbackAdapter {
  const { settings } = useSettings();
  const enabled = settings.hapticsEnabled;
  return useMemo(
    () => ({
      tap: () => enabled && adapter.tap(),
      success: () => enabled && adapter.success(),
      warning: () => enabled && adapter.warning(),
      error: () => enabled && adapter.error(),
    }),
    [adapter, enabled],
  );
}
