import { useCallback, useEffect, useState } from 'react';
import { parseLexicon } from '@cly/words-engine';
import type { Lexicon } from '@cly/words-engine';

export interface LoadedLexicon {
  readonly lexicon: Lexicon;
  /** Identifica el contenido exacto del léxico; se guarda con cada partida. */
  readonly id: string;
}

let loading: Promise<LoadedLexicon> | null = null;
let loaded: LoadedLexicon | null = null;

/**
 * Carga el léxico es-ES una sola vez por sesión de la app (CLY-023, ADR-005). Va tras un `import()`
 * para que el motor de pantallas que no lo usan no lo evalúe al arrancar. Hoy viaja dentro del
 * bundle (~5 MB de texto); empaquetarlo como recurso aparte o en una estructura compacta es trabajo
 * pendiente de ADR-005. Si falla, el siguiente intento vuelve a cargarlo.
 */
export function loadSpanishLexicon(): Promise<LoadedLexicon> {
  loading ??= import('@cly/words-engine/data/es-ES')
    .then((data) => {
      loaded = { lexicon: parseLexicon(data.ES_LEXICON_TEXT), id: data.ES_LEXICON_ID };
      return loaded;
    })
    .catch((error: unknown) => {
      loading = null;
      throw error;
    });
  return loading;
}

export type LexiconStatus =
  | { readonly status: 'loading' }
  | { readonly status: 'error' }
  | ({ readonly status: 'ready' } & LoadedLexicon);

/** Si el léxico ya se cargó antes, la pantalla nace lista: sin parpadeo de «cargando» al repetir o seguir. */
export function useSpanishLexicon(): { state: LexiconStatus; retry: () => void } {
  const [state, setState] = useState<LexiconStatus>(() =>
    loaded === null ? { status: 'loading' } : { status: 'ready', ...loaded },
  );
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    if (loaded === null) setState({ status: 'loading' });
    loadSpanishLexicon().then(
      (result) => {
        if (!cancelled) setState({ status: 'ready', ...result });
      },
      () => {
        if (!cancelled) setState({ status: 'error' });
      },
    );
    return () => {
      cancelled = true;
    };
  }, [attempt]);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);
  return { state, retry };
}
