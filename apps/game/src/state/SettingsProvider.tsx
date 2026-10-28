import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { STORAGE_KEYS, deviceStorage } from '../adapters/storage';
import type { StorageAdapter } from '../adapters/storage';
import { DEFAULT_SETTINGS, parseSettings, serializeSettings } from '../lib/settings';
import type { Settings } from '../lib/settings';

interface SettingsApi {
  settings: Settings;
  /** `false` hasta leer el almacén; evita mostrar un valor por defecto que luego "salta". */
  loaded: boolean;
  setHapticsEnabled(enabled: boolean): void;
}

const SettingsContext = createContext<SettingsApi | null>(null);

export function SettingsProvider({
  children,
  storage = deviceStorage,
}: {
  children: ReactNode;
  storage?: StorageAdapter;
}) {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    storage
      .getItem(STORAGE_KEYS.settings)
      .then((raw) => active && setSettings(parseSettings(raw)))
      .catch(() => {}) // sin almacén: se usan los valores por defecto
      .finally(() => active && setLoaded(true));
    return () => {
      active = false;
    };
  }, [storage]);

  const setHapticsEnabled = useCallback(
    (hapticsEnabled: boolean) => {
      const next: Settings = { version: 1, hapticsEnabled };
      setSettings(next);
      storage.setItem(STORAGE_KEYS.settings, serializeSettings(next)).catch(() => {});
    },
    [storage],
  );

  const value = useMemo(
    () => ({ settings, loaded, setHapticsEnabled }),
    [settings, loaded, setHapticsEnabled],
  );
  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings(): SettingsApi {
  const context = useContext(SettingsContext);
  if (!context) throw new Error('useSettings debe usarse dentro de <SettingsProvider>');
  return context;
}
