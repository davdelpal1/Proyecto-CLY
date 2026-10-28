import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Almacén clave-valor asíncrono (CLY-016). Sirve para preferencias y progreso de ENTRENAMIENTO.
 * No es apto para secretos ni para nada con valor competitivo: el cliente nunca decide puntuaciones.
 */
export interface StorageAdapter {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}

/** Web: localStorage. iOS/Android: almacenamiento persistente de la app. Misma API en las tres. */
export const deviceStorage: StorageAdapter = {
  getItem: (key) => AsyncStorage.getItem(key),
  setItem: (key, value) => AsyncStorage.setItem(key, value),
  removeItem: (key) => AsyncStorage.removeItem(key),
};

/** Implementación en memoria para tests y para degradar con elegancia si el almacén falla. */
export function createMemoryStorage(initial: Record<string, string> = {}): StorageAdapter {
  const data = new Map(Object.entries(initial));
  return {
    getItem: async (key) => data.get(key) ?? null,
    setItem: async (key, value) => void data.set(key, value),
    removeItem: async (key) => void data.delete(key),
  };
}

export const STORAGE_KEYS = {
  progress: 'cly.progress.v1',
  settings: 'cly.settings.v1',
} as const;
