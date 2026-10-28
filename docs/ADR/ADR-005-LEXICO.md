# ADR-005 — Léxico de las pruebas de letras

**Estado:** ACEPTADA **provisionalmente** (28/10/2026): el responsable decidió «seguir con Hunspell de momento». Pendiente de revisión jurídica (CLY-071) y de contraste con emisiones (CLY-002). Primer uso real: *La palabra más larga* (CLY-024, 28/10/2026).
**Responsable:** producto/desarrollo
**Decisión:** usar el diccionario ortográfico **RLA-ES (es_ES, v2.9)**, bajo licencia **MPL 1.1**, como fuente del léxico; compilarlo a una lista local, versionada y con niveles de fiabilidad. Sin APIs externas en tiempo de ejecución.

## Contexto

Las pruebas de letras (La palabra más larga, Doble palabra, 3 en 1, Gran final, Palabra maestra…) necesitan decidir si una palabra es válida: en el cliente para el entrenamiento sin conexión y en el servidor para las partidas online (`ARCHITECTURE.md` §7–8; `CLAUDE.md` regla 10: no usar bancos léxicos sin derechos). La especificación ya advertía que **un corrector ortográfico no equivale al criterio del programa ni de la RAE** (`ESPECIFICACION_FUNCIONAL.md` §6.3 y §13).

## Opciones evaluadas

| Opción | Resultado |
|---|---|
| **API oficial de la RAE** | No se ha encontrado ninguna API pública oficial ni programa de desarrolladores (búsqueda 28/10/2026). Sin ella no hay base contractual para usarla en una app comercial. |
| **API/raspadores no oficiales del DLE** (p. ej. `rae-api.com`, actores de Apify) | Descartada: operador y licencia desconocidos, riesgo de incumplir las condiciones de uso del DLE (no se pudo leer su aviso legal: HTTP 403), servicio inestable y **imposible offline**. |
| **Raspar el DLE** | Descartada: riesgo legal (derechos de base de datos) y técnico, sin ventaja. |
| **Licencia directa de la RAE** | No descartada para el futuro. No se ha comprobado que la ofrezcan ni sus condiciones. |
| **Wiktionary en español** | Descartada por ahora: CC BY-SA (compartir igual lo derivado), mezcla de lenguas y calidad irregular. |
| **Lista propia curada** | Necesaria igualmente como capa de excepciones (§Consecuencias), pero inviable como base única a corto plazo. |
| **RLA-ES / Hunspell (elegida)** | Licencia abierta con elección GPL 3 / LGPL 3 / MPL 1.1; trabajo declarado «completamente nuevo» y no basado en diccionarios anteriores; usable offline y reproducible. |

## Decisión

1. **Fuente:** RLA-ES `es_ES`, v2.9, commit `762abe74008b94b2ff06db6f4024b59a8254c467` de `LibreOffice/dictionaries`. Los archivos originales se guardan **sin modificar** en `third_party/rla-es/` con huellas SHA-256 (`SOURCES.json`) y `.gitattributes` que impide la conversión de saltos de línea.
2. **Licencia elegida: MPL 1.1.** Es copyleft por archivo: se puede distribuir junto a código propio sin que este quede sujeto a la licencia, pero los archivos del diccionario (y sus derivados) deben seguir bajo MPL, con aviso, descripción de las modificaciones y acceso a su fuente.
3. **Obra derivada:** `scripts/lexicon/build-lexicon.ts` expande los afijos, filtra y clasifica; produce `es-ES.lexicon.tsv`, `report.json` y `NOTICE.txt` (`pnpm lexicon:build`). Es **determinista** (misma entrada ⇒ misma huella) y no usa la red.
4. **Niveles de fiabilidad** (`packages/words-engine/src/lexicon-tiers.ts`): cada palabra lleva el nivel de su ruta de derivación **más fiable**:

   | Nivel | Qué es | Ejemplo |
   |---|---|---|
   | 0 `BASE` | entrada del diccionario | casa, jugaron |
   | 1 `INFLECTION` | plural/femenino y conjugación generados | mesas, cantando |
   | 2 `SUFFIX_DERIVATION` | sufijos derivativos | diablillos, serísimo |
   | 3 `PREFIX_DERIVATION` | prefijos | preguerras, rehacían |
   | 4 `PRONOUN_ATTACHED` | verbo + pronombre | evacuarlo, gústennos |

   Un sufijo que la tabla no reconozca se trata como nivel 4 y el script **falla** hasta que se revise (protege frente a una futura actualización del diccionario).
5. **Qué niveles admite cada partida lo decide el ruleset**, no el código (GAME_RULES §4 LETTERS deja plurales, flexiones y clíticos como [PENDIENTE]).

## Datos medidos (28/10/2026)

Palabras de 2–10 letras: **361 620**. Solo minúsculas a–z, ñ, vocales con tilde y ü; se descartan 1 332 formas con mayúsculas (nombres propios y siglas).

| Hasta el nivel | Palabras de 5–10 letras | Tamaño | Comprimido |
|---|---:|---:|---:|
| 0 BASE | 41 114 | 360 KB | 120 KB |
| 1 INFLECTION | 335 526 | 3,2 MB | 758 KB |
| 2 SUFFIX_DERIVATION | 337 205 | 3,2 MB | 762 KB |
| 3 PREFIX_DERIVATION | 340 249 | 3,2 MB | 770 KB |
| 4 PRONOUN_ATTACHED | 357 941 | 3,3 MB | 808 KB |

Cabe holgadamente en el móvil, incluso sin estructura compacta. El 82 % de las palabras son flexiones (conjugaciones y plurales).

## Calidad: lo que se ha comprobado y lo que no

- **Comprobación puntual** (no exhaustiva): 30 palabras comunes de 5–10 letras (casa, perro, cigüeña, pingüino, murciélago, canté, lápices…) están todas, y 7 inventos (`asdfg`, `perroz`, `antiárbol`…) no están.
- **Huecos detectados:** `ñu` (2 letras), `vámonos` y `cómpralo` **no están**. Confirma que no es el léxico de la RAE y que hará falta una lista editorial.
- **Formas discutibles:** conjugaciones muy raras (`traílles`), derivados poco lexicalizados (`serísimo`, `usajes`) y combinaciones con prefijo. Por eso existen los niveles.
- **No se ha comparado con el DLE ni con emisiones reales.** No hay una medida de cobertura o precisión frente a un criterio de referencia.
- **Origen de las palabras:** el README dice que no se basa en los diccionarios anteriores, pero **no detalla de qué fuentes salen sus entradas**. Hay que verificarlo antes de publicar.

## Consecuencias y pendiente

- **Ruleset de letras (CLY-024):** parámetro `letterRules.maxLexiconTier`, aplicado **provisionalmente** con `SUFFIX_DERIVATION` (niveles 0–2, **337 205** palabras de 5–10 letras, tal como proponía este ADR): prefijo y pronombre pegado quedan fuera hasta verificarlos con emisiones. Figura como [PENDIENTE] en el ruleset y la ficha de la prueba lo dice. **El responsable aún no ha confirmado el nivel**; cambiarlo es una línea en `ruleset.ts` (y subir la revisión).
- **Capa editorial (CLY-062):** listas `allow` y `deny` propias, revisadas por una persona, con licencia trazable (§13: «léxico + excepciones editorialmente revisadas»). Aquí entrarían `ñu` o `vámonos`.
- **Formato de empaquetado (implementado, provisional):** `pnpm lexicon:build` genera además `packages/words-engine/data/es-ES.ts` (≈5 MB, **se versiona**: la app arranca sin pasos previos), con una línea por **forma de ficha** (palabra sin tildes ni diéresis; ver `lexicon-text.ts`): 321 922 formas de 2–10 letras. `pnpm lexicon:check` falla si el módulo no coincide con lo que se generaría desde `third_party/rla-es/` (pensado para CI). En la app se carga con `import()` bajo demanda: en web es un *chunk* aparte de 5,2 MB (solo se descarga al abrir letras); en Android/iOS va dentro del bundle de Hermes. `parseLexicon` no crea un objeto por palabra (texto + índices de posición) y busca con búsqueda binaria; encontrar todas las palabras formables con diez fichas tarda del orden de 5 ms en este equipo. **No medido:** tiempo de carga y memoria en un móvil real. Estructura compacta (trie/DAWG) o recurso aparte, pendientes si la medida lo exige.
- **Lenguaje de la interfaz:** hablar de «palabra válida en nuestro diccionario». **Nunca** «según la RAE».
- **Normalización de fichas** (implementada, [DISEÑO]): las tildes y la diéresis no tienen ficha propia (`toTileKey`), la `Ñ` no equivale a la `N`, y `ü` se forma con la `U`. Cuando dos palabras comparten forma de ficha (`canto`/`cantó`) se guarda la de nivel más fiable; `año` y `ano` sí son distintas. GAME_RULES.md §4 deja la «Ü» como «tratamiento específico» pendiente.
- **Obligaciones MPL a mantener:** conservar `NOTICE.txt`, `third_party/rla-es/` y el script de construcción en el repositorio; el aviso ya se muestra en la app (Ajustes → «Créditos y licencias»); falta incluirlo en las fichas de las tiendas si se pide.
- **Revisión jurídica (CLY-071):** esto **no es asesoramiento legal**. El asesor debe validar la elección MPL, que la lista expandida sea una obra derivada, y el origen real de las palabras.

## Cuándo reabrir esta decisión

- Si el asesor ve un problema con la licencia o con el origen de los datos.
- Si la RAE ofrece una licencia viable y el negocio decide pagar por criterio oficial.
- Si la cobertura medida frente a emisiones reales resulta insuficiente (p. ej. > 2 % de palabras válidas rechazadas en una muestra).
- Si se localiza el juego a otros idiomas (CLY-085): cada léxico, su propio ADR.

## Referencias

- Diccionario: https://github.com/LibreOffice/dictionaries/tree/master/es
- MPL 1.1: https://www.mozilla.org/en-US/MPL/1.1/
- `third_party/rla-es/PROVENANCE.md`, `SOURCES.json`
- `scripts/lexicon/build-lexicon.ts`, `packages/words-engine/src/lexicon-tiers.ts`
