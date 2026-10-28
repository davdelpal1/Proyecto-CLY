export interface Settings {
  readonly version: 1;
  readonly hapticsEnabled: boolean;
}

export const DEFAULT_SETTINGS: Settings = { version: 1, hapticsEnabled: true };

/** Lee los ajustes guardados; ante cualquier contenido inesperado devuelve los valores por defecto. */
export function parseSettings(raw: string | null): Settings {
  if (raw === null) return DEFAULT_SETTINGS;
  try {
    const data: unknown = JSON.parse(raw);
    if (typeof data !== 'object' || data === null) return DEFAULT_SETTINGS;
    const record = data as Record<string, unknown>;
    if (record['version'] !== 1) return DEFAULT_SETTINGS;
    return {
      version: 1,
      hapticsEnabled:
        typeof record['hapticsEnabled'] === 'boolean'
          ? record['hapticsEnabled']
          : DEFAULT_SETTINGS.hapticsEnabled,
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export const serializeSettings = (settings: Settings): string => JSON.stringify(settings);
