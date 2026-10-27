# GAME_RULES — Reglamento implementable y verificable

**Versión:** 1.3 — 27/10/2026 (ruleset `RTVE_2026_REFERENCE` rev. 0.1.1; ver §1.1)  
**Estado:** Perfil de referencia, sujeto a validación audiovisual y jurídica. **Implementado en código solo para La cifra exacta** (`packages/numbers-engine`, `packages/game-engine`).  
**Regla fundamental:** «Reproducir lo observado» y «publicarlo legalmente» son dos problemas distintos. El motor puede representar reglas del programa; su comercialización exacta exige decidir los derechos de explotación.

El cambio de arquitectura a Expo/React Native no altera tiempos, cálculos, léxico ni puntuaciones: los rulesets son **independientes de plataforma**. Las mismas reglas se aplican a web, iOS y Android, con autoridad en servidor para multijugador.

## 0. Claves de evidencia

- **[RTVE]**: aparece documentado por RTVE en materiales públicos.
- **[SECUNDARIA]**: descrito por fuentes secundarias; no debe afirmarse como reglamento oficial sin contraste.
- **[DISEÑO]**: elección de implementación digital que no necesariamente replica un plató.
- **[PENDIENTE]**: falta validación con al menos tres emisiones representativas de la temporada 2026 o reglamento autorizado.

## 1. Perfil por defecto (borrador de configuración)

```yaml
rulesetId: RTVE_2026_REFERENCE
revision: 0.1.1 # 0.1.0 + parámetros añadidos en §1.1
releaseStatus: UNVERIFIED
locale: es-ES
stages:
  key: { enabled: true, durationSeconds: 30, firstLetterRevealAt: 15 }
  classic:
    count: 10
    numberRounds: 5
    letterRounds: 5
    order: alternating # orden inicial pendiente de comprobar
    numberDurationSeconds: 40
    letterDurationSeconds: 30
  duels:
    count: 4
    pointValues: [10, 20, 30, 50]
    durationSeconds: 30
    availableTypes: [THREE_IN_ONE, DOUBLE_WORD, TWO_FOR_TWO,
      DOUBLE_MEANING, MENTAL_CALCULATION, NUMBER_SPRINT]
  final:
    durationSeconds: 180
    words: 12
    panelLetterTiles: 10
    rewardUnits: simulated
    baseRewardPerWord: 100
    elevenWordReward: 1500
    jackpotIncrement: configurable
numberRules:
  minTarget: 100
  maxTarget: 999
  tilesPerRound: 6
  allowedOperators: [add, subtract, multiply, divide]
  allowRepeatTile: false
  requirePositiveIntegerIntermediates: true # PENDIENTE
  requireExactDivision: true # PENDIENTE
  allowUnusedTiles: true
letterRules:
  tileCount: 10
  minVowels: 3
  maxVowels: 6
  minAnswerLength: 5
  winnerOnlyScores: true
  bothScoreOnBestTie: true
```

Todos estos campos se tiparán en código y tendrán comprobación de consistencia al publicar reglas. Cada partida guarda `rulesetId`, `revision` y un `rulesetSnapshotHash`.

### 1.1 Cambios y decisiones de implementación (rev. 0.1.0 → 0.1.1, 27/10/2026)

El YAML anterior sigue siendo la fuente. Al implementar La cifra exacta fue necesario **añadir parámetros** que el YAML no recogía y **tomar decisiones** que el reglamento no resuelve. Ninguna se presenta como verificada; todas son configurables en `RTVE_2026_REFERENCE` (`packages/game-engine/src/ruleset.ts`) y la interfaz muestra «Reglas provisionales» en la ficha de la prueba.

**Parámetros añadidos al ruleset**

| Campo | Valor | Evidencia | Motivo |
|---|---|---|---|
| `stages.classic.firstType` | `NUMBER` | [PENDIENTE] | El YAML dice `alternating` con «orden inicial pendiente»; hace falta un valor para construir la secuencia |
| `numberTiles.smallValues` / `bigValues` | 1–10 / 25, 50, 75, 100 | [SECUNDARIA] | Ya constaba en la ficha NUMBER; ahora es dato configurable |
| `numberTiles.smallCopies` | 2 | [DISEÑO] | Cada valor pequeño puede salir dos veces («como ficha independiente»); cuántas copias hay en la bolsa no consta |
| `numberTiles.bigCountRange` | 1–3 | [DISEÑO] | No consta cuántas fichas grandes salen por ronda |
| `numberScoring.exactPoints` / `closestPoints` | 10 / 7 | [SECUNDARIA] | Pasos 2–3 de la puntuación NUMBER, ahora datos |
| `numberScoring.maxApproxDistance` | `null` (sin umbral) | [PENDIENTE] | Paso 5 de la puntuación NUMBER |

**Decisiones de comportamiento (cifra exacta)** — todas [DISEÑO] salvo que se indique:

1. **Tiempo agotado sin confirmar = sin respuesta.** No se envía automáticamente lo que hubiese a medias (coherente con «el usuario … confirma antes del límite»). En entrenamiento la ronda «no cuenta» y se muestra la solución.
2. **Deadline inclusivo.** Una acción recibida exactamente en el instante del deadline es válida; con `nowMs > deadline` se rechaza con `DEADLINE_EXPIRED` y la ronda queda `EXPIRED` (GAME_RULES §3.1).
3. **Reglas de intermedios en cada paso.** Con la política por defecto (`requirePositiveIntegerIntermediates` y `requireExactDivision`, ambas [PENDIENTE]) se rechaza todo resultado no entero, cero o negativo, y toda división no exacta; con la política relajada se usa aritmética racional exacta (sin errores de coma flotante).
4. **Una ficha sola es una respuesta válida** («se pueden dejar fichas sin usar»).
5. **«Confirmar» propone la mejor respuesta disponible.** Si no hay nada seleccionado, la interfaz propone el elemento sin consumir más cercano al objetivo; la persona puede elegir otro. Es una ayuda de interfaz, no una regla.
6. **El entrenamiento nunca otorga puntos.** `scoreNumbersRound` (10/7 con empates, NUM-04/05) existe en el motor para el concurso, pero la práctica individual no lo invoca.
7. **El generador es solo de entrenamiento:** exige solución exacta, al menos 2 operaciones y que el objetivo no coincida con una ficha. Esto no es una regla del programa.
8. **Cuenta atrás de 3 s previa a las pruebas con reloj**, con el ejercicio oculto; no consume tiempo de respuesta (UX_FLOWS §6).

## 2. Ciclo de una partida

| Posición | Segmento | Participación | Evidencia |
|---|---|---|---|
| 0 | La llave | Ambos, pulsador | [RTVE] |
| 1–10 | 5 cifras y 5 letras alternadas | Ambos, envíos individuales | [SECUNDARIA]; orden por confirmar |
| 11–14 | 4 duelos elegidos entre 6 modalidades | Ambos, pulsador | 4 duelos [RTVE], modalidades/puntos [SECUNDARIA] |
| 15 | Desempate (si hace falta) | Ambos | [SECUNDARIA] |
| 16 | Gran final | Campeón | 12 palabras, 180 s [RTVE] |

En el modo contra IA, todos los segmentos siguen la misma lógica y la IA únicamente genera acciones autorizadas (`BUZZ`, `ANSWER`, `SUBMIT`, `PASS`, `USE_KEY`).

## 3. Normas comunes

### 3.1 Temporización
- El servidor crea un instante de inicio y un deadline por prueba.
- Una entrada recibida antes del deadline puede ser válida; una posterior se rechaza con código `DEADLINE_EXPIRED`.
- Los eventos de temporización se calculan por reloj monotónico del proceso en sesión; se persistirán metadatos del reloj para recuperación.
- En modo individual offline, el motor local utiliza el mismo contrato de deadline, sin reclamar validez competitiva.
- En modo competitivo online, el cliente nunca declara el momento efectivo de una respuesta.

### 3.2 Respuestas
- **Respuesta provisional:** puede editarse hasta que el jugador pulsa «Confirmar», si el tipo de prueba lo permite.
- **Respuesta definitiva:** primera válida en tiempo según política; se bloquea al cerrar ronda.
- **Error de forma:** el servidor devuelve causa técnica segura sin filtrar la solución antes de terminar.
- Las variantes válidas (sinónimos, ortografía admitida) se almacenan de forma explícita en el pack; no decidir mediante LLM en caliente.

### 3.3 Marcador y empates
- Los puntos se conceden mediante `ScoreAwarded` único, idempotente.
- Los dos jugadores pueden recibir puntos en una misma prueba clásica si empatan con la mejor respuesta válida según referencia secundaria.
- Si hay empate tras los duelos, se ejecuta desempate, nunca se elige ganador aleatoriamente.
- La gran final no suma puntos al duelo, sino recompensa **virtual** distinta.

### 3.4 Modos de ejecución (UX, sin duplicar reglamento)

- **Entrenamiento individual:** todas las pruebas se pueden ejecutar aisladas sin rival. Un duelo se transforma en reto con botón «Responder» y las mismas reglas de contenido/verificación; el pulsador competitivo es sustituido por una acción local explícita.
- **Variación de práctica:** con reloj y referencia de duración o sin reloj; alteraciones guardadas en `sessionConfig` y siempre identificadas como entrenamiento no clasificado, no como reglamento televisivo.
- **Concurso completo:** mismas modalidades y validadores dentro de la máquina de estados; puntuación/rival/buzzer y secuencia según ruleset de referencia verificado. La práctica jamás modifica el `ruleset` de una partida ya empezada.
- **Gran final individual:** permite entrenar las 12 palabras aunque el modo concurso reserve esa fase a un ganador.
- **Desempate individual:** ofrecer ejercicio de práctica aunque en concurso solo se active en igualdad de puntos.
- **Especiales:** Descifra y Palabra maestra como juegos independientes una vez implementadas; su presencia en una temporada concreta se rige por perfil.
- Las 13 tarjetas previstas y los flujos de usuario se detallan en `UX_FLOWS.md`. La denominación comercial y uso del formato están sujetos a revisión de derechos.

## 4. Ficha por prueba

### KEY — La llave
- **Duración:** 30 s [RTVE/SECUNDARIA].
- **Contenido:** definición, longitud, palabra válida, inicial visible desde 15 s [SECUNDARIA].
- **Pulsador:** dos contendientes; primera pulsación válida obtiene derecho a contestar.
- **Premio:** una llave para la final del mismo jugador, no puntos.
- **Fallos:** no se conceden llaves si se agota el tiempo o respuesta errónea, según referencia secundaria.
- **Acciones:** `BUZZ`, `ANSWER_WORD`, `KEY_GRANTED`, `KEY_EXPIRED`.
- **Pendiente:** comportamiento exacto del reloj durante la intervención del concursante.

### NUMBER — La cifra exacta
- **Duración:** 40 s [SECUNDARIA].
- **Datos:** seis fichas, valores pequeños 1–10 y grandes 25/50/75/100, objetivo 100–999 [SECUNDARIA].
- **Regla:** operaciones básicas. Un valor puede aparecer dos veces solo si existe por duplicado como ficha independiente. Se pueden dejar fichas sin usar.
- **Precisión de las operaciones:** inicialmente, resultados intermedios enteros y positivos; divisiones exactas. [DISEÑO], a validar en emisión.
- **Envío:** el usuario registra pasos que demuestran el valor final y confirma antes del límite.
- **Puntuación:**
  1. Extraer todas las respuestas definitivas que pasan validación de operaciones y tiempo.
  2. Si alguna tiene diferencia 0, asignar 10 puntos a todas las diferencias 0.
  3. Si ninguna tiene diferencia 0, asignar 7 puntos a toda respuesta con mínima diferencia, incluida diferencia >0.
  4. Respuestas no válidas/no enviadas: cero.
  5. **[PENDIENTE]** confirmar si hay umbral máximo de aproximación y si se concede algún punto distinto según diferencia.
- **Solución del solver:** guardar `bestDistance`, `witnessExpression`, `difficultyBucket` y `numberOfSolutions` aproximado para auditoría.
- **Ejemplo técnico:** fichas `[25, 7, 3, 2, 10, 5]`, objetivo `150`; respuesta `25 × (7 − (5 − 3)) + (10 × 2 + 5)` = `150` **no es válida** porque reutiliza el 5. El validador debe detectarlo incluso si el valor es correcto. El ejemplo deliberadamente prueba una respuesta inválida.

### LETTERS — La palabra más larga
- **Duración:** 30 s [SECUNDARIA].
- **Datos:** diez letras, 3–6 vocales solicitadas [SECUNDARIA].
- **Validez:** al menos cinco letras, palabra aceptada por el léxico editorial, y consumos dentro de multiplicidades de las fichas.
- **Normalización:** mayúsculas/minúsculas equivalentes; las tildes se validan conforme a forma canónica pero no requieren fichas distintas de la vocal base; «Ñ» no equivale a «N», «Ü» requiere tratamiento específico.
- **Políticas lingüísticas:** verbos flexionados, plurales y clíticos se habilitan tras validación lexicográfica; no equivaler diccionario ortográfico con admisión por la RAE.
- **Puntuación:** elegir máxima longitud validada entre ambos; 1 punto por letra al/los empatado(s) en la mayor longitud; restantes 0.
- **Pendiente:** palabras compuestas, arcaísmos, regionalismos, acentuación de envío y nombres propios permitidos en clásicas.

### THREE_IN_ONE — 3 en 1
- **Duración:** 30 s [SECUNDARIA].
- **Datos:** definición, respuesta y longitud; revelar tres letras en etapas configuradas (referencia secundaria indica una cada 10 s).
- **Validación:** solución editorial, no mero anagrama libre.
- **Ganancia:** según puesto del duelo.

### DOUBLE_WORD — Doble palabra
- **Duración:** 30 s [SECUNDARIA].
- **Datos:** diez letras, pistas y pareja de respuestas.
- **Condición:** las dos palabras consumen, conjuntamente, las diez fichas sin reutilizar ninguna; variantes auditadas editorialmente.
- **Ganancia:** según puesto del duelo.

### TWO_FOR_TWO — 2 para 2
- **Duración:** 30 s [SECUNDARIA].
- **Datos:** dos definiciones, dos respuestas y panel de letras. Referencia secundaria describe una respuesta de diez letras.
- **PENDIENTE/ALTO RIESGO:** comprobar si las letras se consumen por separado, cuántas fichas hay, en qué orden se responden y si una palabra debe tener exactamente diez letras.
- **Implementación:** `answerRules` permite un conjunto de fichas por respuesta y restricciones parametrizadas; bloquear publicación de packs de este tipo hasta verificar la mecánica.

### DOUBLE_MEANING — Doble sentido
- **Duración:** 30 s [SECUNDARIA].
- **Datos:** dos acepciones que conducen a la misma palabra, con su longitud.
- **Validación:** una respuesta canónica + variantes editoriales; sin pistas añadidas por defecto.

### MENTAL_CALCULATION — El cálculo
- **Duración:** 30 s [SECUNDARIA].
- **Datos:** expresión matemática con sumas, restas, productos, divisiones y paréntesis; resultado predeterminado.
- **Validación:** evaluador de expresiones seguro, entrada numérica; preferir expresiones con resultado exacto.
- **PENDIENTE:** si algún tipo de cifra, operación o visualización se restringe en emisión.

### NUMBER_SPRINT — Esprint numérico
- **Duración:** 30 s [SECUNDARIA].
- **Datos:** objetivo y números visibles, reto mental rápido.
- **Validación:** introducir resultado/propuesta junto a un testigo aritmético, o verificar verbalmente según perfil seleccionado.
- **PENDIENTE/ALTO RIESGO:** número de fichas, reglas del pulsador, cercanía admisible y demostración de operación; no lanzar modo exacto hasta contrastarlo.

### DUEL BUZZ RULE — común a los seis
- Puestos 1–4: 10/20/30/50 puntos [SECUNDARIA].
- `DUEL_STARTED`, `BUZZ_ACCEPTED`, `ANSWER_ACCEPTED` o `ANSWER_REJECTED`, `SCORE_AWARDED`, `DUEL_CLOSED`.
- Primer pulsador válido obtiene el derecho; acierto: puntos al pulsador; fallo: puntos al rival, según referencia secundaria. Expiración sin pulsación: cero.
- **[DISEÑO]** Ventana `buzzAnswerSeconds`: valor provisional en tests, pero ningún tiempo definitivo hasta QA con RTVE.
- Para prevenir trampas de latencia, el servidor arbitra por orden de recepción. La compensación de RTT solo se considerará tras instrumentación y diseño antiabusos, no confiando en relojes locales.

### TIEBREAK — Desempate
- **Datos:** letras y palabra concreta deducible.
- **Mecánica:** pulsar y responder; respuesta correcta gana, respuesta errónea da victoria al rival [SECUNDARIA].
- **PENDIENTE:** cadencia, tiempo y número de desempates ante ninguna pulsación.

### FINAL — La gran final
- **Duración:** 180 s [RTVE].
- **Datos:** 12 objetivos relacionados por un mismo tema [RTVE], panel de diez letras para cada uno [SECUNDARIA].
- **Acciones:** `ANSWER_WORD`, `PASS`, `USE_KEY`, `FINAL_COMPLETED`, `FINAL_EXPIRED`.
- **Avance:** tras respuesta válida o pase, ir al siguiente; al completar vuelta, recorrer pendientes en el mismo orden, no reiniciar tiempo.
- **Comodín llave:** solo el ganador de la llave puede usarla cuando ha llegado a la final; resuelve una palabra pendiente de manera automática; se consume una vez.
- **Premios** (virtuales): 1–10 aciertos => `100 × aciertos`; 11 => `1.500`; 12 => bote virtual. [SECUNDARIA]. No monetarios.
- **Bote:** valor inicial y crecimiento configurables porque las ediciones históricas no son constantes; perfil de comercialización define economía independiente.
- **[PENDIENTE]** condiciones de palabra errónea, reintento y panel de un solo intento por vuelta, y variantes de llave.

### SPECIAL_DECIPHER — Descifra
- **Edición 2024:** parejas alternan preguntas con respuestas numéricas desordenadas; 120 s; 1 punto por acierto [RTVE, 2024].
- **Edición 2025:** RTVE confirma batería numérica desordenada, sin detallar en esa noticia todos los tiempos [RTVE].

### SPECIAL_MASTER_WORD — La palabra maestra
- **Edición especial 2024:** palabras con mínimo 4 letras a partir de una palabra base, 1 punto por palabra [RTVE].
- **Edición especial 2025:** palabra de 8 letras y mínimo 5 letras por palabra formada [RTVE].
- **Implementación:** dos versiones editoriales (`SPECIAL_2024`, `SPECIAL_2025`), sin sobrescribir historial.

## 5. Casos de prueba críticos

**Estado de automatización (27/10/2026):** NUM-01 a NUM-05 están cubiertos por tests (`packages/numbers-engine`, `packages/game-engine`; NUM-04/05 en `numbers-scoring.test.ts`). LET, KEY, DUEL, FIN y SP **no están implementados** todavía.

| Caso | Preparación | Esperado |
|---|---|---|
| NUM-01 | Misma ficha usada dos veces | Rechazo `TILE_REUSED` |
| NUM-02 | Dos fichas distintas con valor 5 | Ambas válidas si se consumen por `tileId` |
| NUM-03 | División no exacta con política strict | Rechazo `NON_INTEGER_DIVISION` |
| NUM-04 | Ambos alcanzan exacto | 10 puntos a ambos |
| NUM-05 | Ninguno exacto; uno a 1, otro a 2 | 7 puntos al primero, sujeto a umbral pendiente |
| LET-01 | Cinco letras válidas | Admisible |
| LET-02 | Cuatro letras válidas | No admisible en clásica |
| LET-03 | Palabra utiliza más letras «A» que disponibles | Rechazo `LETTER_MULTIPLICITY_EXCEEDED` |
| LET-04 | Empate en máxima longitud | Puntúan ambos |
| KEY-01 | El poseedor de llave pierde el duelo | Rival no hereda la llave |
| KEY-02 | Llave ya usada | Rechazo `KEY_ALREADY_USED` |
| DUEL-01 | Dos pulsaciones concurrentes | Un único pulsador aceptado |
| DUEL-02 | Primera respuesta errónea | Conceder al rival según ruleset |
| DUEL-03 | Pulsación tras deadline | Rechazo; no cambiar marcador |
| FIN-01 | Paso en palabras 2 y 4 | Revisitar 2 y 4 después de la primera vuelta |
| FIN-02 | 11 resueltas | Recompensa simulada de 1.500 en perfil referencial |
| FIN-03 | 12 resueltas | Bote simulado y cierre de campaña conforme al ruleset |
| SP-01 | Maestra de 4 letras en SPECIAL_2024 | Admisible si está en diccionario |
| SP-02 | Maestra de 4 letras en SPECIAL_2025 | No admisible |

## 6. Criterios de desbloqueo del perfil fiel

No marcar `RTVE_2026_REFERENCE` como `VERIFIED` hasta completar:
1. Muestreo de 3 episodios normales de 2026 de fechas separadas + 1 desempate documentado si aparece + 1 especial 2025/2026.
2. Matriz con **minuto de emisión, observación, fuente, regla y confianza** para todos los `PENDIENTE`.
3. Inspección manual de supuestos de arbitraje en cifra exacta, letras y duelos.
4. Casos de prueba que reproduzcan al menos un ejemplo por prueba y casos límite.
5. Revisión jurídica antes de poner a la venta el perfil de réplica comercial.

## 7. Referencias

- RTVE — Sinopsis general: https://www.rtve.es/play/videos/cifras-y-letras/programa-108/16198549/
- RTVE — Final: https://www.rtve.es/rtve/20241105/cifras-letras-entrega-esta-semana-mayor-bote-la-2-rtve/16316882.shtml
- RTVE — Especiales 2024: https://www.rtve.es/rtve/20241223/cifras-letras-celebra-navidad-dos-especiales-solidarios-miticos-concursantes/16383962.shtml
- RTVE — Especiales 2025: https://www.rtve.es/rtve/20251204/cifras-letras-celebrara-navidad-tres-especiales-solidarios-artistas-concursantes-iconicos-la2-rtve/16844957.shtml
- Mecánica secundaria a contrastar: https://es.wikipedia.org/wiki/Cifras_y_letras
