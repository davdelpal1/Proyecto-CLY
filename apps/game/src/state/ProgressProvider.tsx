import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { ReactNode } from 'react';
import {
  EMPTY_PROGRESS,
  parsePracticeProgress,
  recordPracticeResult,
  serializePracticeProgress,
} from '@cly/game-engine';
import type { PracticeProgress, PracticeResult } from '@cly/game-engine';
import { STORAGE_KEYS, deviceStorage } from '../adapters/storage';
import type { StorageAdapter } from '../adapters/storage';

interface ProgressApi {
  progress: PracticeProgress;
  loaded: boolean;
  record(result: PracticeResult): void;
  /** Borra todo el progreso local (derecho de supresión; no hay copia en ningún servidor). */
  reset(): Promise<void>;
}

const ProgressContext = createContext<ProgressApi | null>(null);

/**
 * Progreso de entrenamiento: local, sin cuenta y sin valor competitivo. Si el almacén falla, la
 * partida sigue funcionando y el progreso simplemente no se conserva.
 */
export function ProgressProvider({
  children,
  storage = deviceStorage,
}: {
  children: ReactNode;
  storage?: StorageAdapter;
}) {
  const [progress, setProgress] = useState<PracticeProgress>(EMPTY_PROGRESS);
  const [loaded, setLoaded] = useState(false);
  const latest = useRef<PracticeProgress>(EMPTY_PROGRESS);

  useEffect(() => {
    let active = true;
    storage
      .getItem(STORAGE_KEYS.progress)
      .then((raw) => {
        if (!active) return;
        latest.current = parsePracticeProgress(raw);
        setProgress(latest.current);
      })
      .catch(() => {})
      .finally(() => active && setLoaded(true));
    return () => {
      active = false;
    };
  }, [storage]);

  const record = useCallback(
    (result: PracticeResult) => {
      latest.current = recordPracticeResult(latest.current, result);
      setProgress(latest.current);
      storage
        .setItem(STORAGE_KEYS.progress, serializePracticeProgress(latest.current))
        .catch(() => {});
    },
    [storage],
  );

  const reset = useCallback(async () => {
    latest.current = EMPTY_PROGRESS;
    setProgress(EMPTY_PROGRESS);
    await storage.removeItem(STORAGE_KEYS.progress).catch(() => {});
  }, [storage]);

  const value = useMemo(
    () => ({ progress, loaded, record, reset }),
    [progress, loaded, record, reset],
  );
  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

export function useProgress(): ProgressApi {
  const context = useContext(ProgressContext);
  if (!context) throw new Error('useProgress debe usarse dentro de <ProgressProvider>');
  return context;
}
