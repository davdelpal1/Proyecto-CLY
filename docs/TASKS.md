# TASKS — Backlog ejecutable (Trello / GitHub Projects)

**Versión:** 1.3 — 27/10/2026  
**Convención:** `CLY-xxx`, prioridad `P0/P1/P2`, estado inicial `TODO`. Cada épica puede convertirse en lista de Trello y cada subtarea en checklist.

## Estado real del Sprint 1 (27/10/2026)

`[x]` = hecho y verificado con los comandos indicados · `[ ]` = pendiente. Las notas entre paréntesis dicen qué falta o qué no se ha podido comprobar.

| Ticket | Estado | Resumen |
|---|---|---|
| CLY-010 | **Hecho en web** | Monorepo pnpm + Expo SDK 58. Build nativa EAS **no** hecha |
| CLY-011 | Parcial | Tipos, ruleset versionado + snapshot, sesión de cifras con replay. Falta FSM completa y parser Zod |
| CLY-012 | Parcial | Tokens + componentes base. Faltan pulsador y ficha de letra |
| CLY-014 | Parcial | Rutas y `app.config.ts`. Faltan builds EAS, sala, ajustes y adaptadores |
| CLY-015 | Parcial | Vitest + Playwright web. Faltan RNTL, E2E nativo y ADR-009 |
| CLY-016 | Parcial | `Clock` + reglas ESLint de pureza. Faltan Storage/Feedback/Network |
| CLY-017 | **Hecho** | Inicio, catálogo de 13 pruebas, ficha, E2E |
| CLY-018 | Parcial | `TrainingSession` + resultado + Repetir/Siguiente/Volver (solo Cifras) |
| CLY-019 | Parcial | Configuración contra IA + vista previa de fases. Sin partida |
| CLY-020 | **Hecho** | AST, validador, errores tipados, sin `eval` |
| CLY-021 | Parcial | Solver y generador semillado. Faltan métricas finas y benchmark |
| CLY-022 | Parcial | Pantalla de cifra exacta jugable. Falta la prueba humana de 20 casos |

**Validado localmente (Windows 11, Node 24, pnpm 10):** `pnpm validate` (lint + tipos + 141 tests unitarios + formato) y `pnpm test:e2e` (36 tests Playwright en Edge, viewports 1280×800 y 390×844). El bundle de producción web, el de Android y el de iOS compilan con Metro/Hermes; esto **no** equivale a ejecutarlos en un dispositivo.
**No comprobado:** ejecución en iOS/Android (ni emulador ni dispositivo), TalkBack/VoiceOver, CI remota (el workflow está escrito pero no se ha ejecutado), Safari y Firefox.

## ÉPICA 00 — Formato, negocio y derechos [P0 | Sprint 0]

### CLY-001 — Matriz de emisiones y reglas
- [ ] Seleccionar al menos tres episodios regulares de 2026 y uno especial.
- [ ] Crear tabla con minuto, ronda, cronómetro, puntuación y resultado observado.
- [ ] Contrastar 10 rondas clásicas, orden, selección de duelos y final.
- [ ] Confirmar qué comportamientos permanecen inciertos y señalarlos explícitamente.
- **Aceptación:** cada regla no trivial del ruleset incluye referencia, confianza y fecha.

### CLY-002 — Pruebas de reglamento crítico
- [ ] Verificar condiciones intermedias de aritmética y aproximación.
- [ ] Verificar casos de aceptación léxica, plural, conjugación, enclíticos.
- [ ] Verificar mecánicas de `2 para 2`, `Esprint`, errores de buzzer y desempate.
- [ ] Versionar `GAME_RULES.md` y fixtures.
- **Aceptación:** no se presenta como «oficial» ninguna regla abierta.

### CLY-003 — Revisión preliminar de IP y marca
- [ ] Documentar el posible titular/licenciatario del formato con evidencia.
- [ ] Analizar permiso para usar nombre, pruebas específicas, look&feel y sonidos.
- [ ] Definir ruta «con licencia» vs «juego original con rediseño sustancial».
- [ ] Registrar la aprobación del asesor jurídico antes de comercializar.
- **Aceptación:** ADR-006 con riesgos, decisor y bloqueo del lanzamiento.

### CLY-004 — Benchmark UX y arquitectura de menús [P0 | Sprint 0]
- [ ] Analizar como referencia **funcional** la app oficial Pasapalabra (modos sueltos/programa/duelo, navegación y feedback), sin importar sus assets/código.
- [ ] Convertir el diseño de `UX_FLOWS.md` en wireframes originales de inicio, catálogo, ficha, práctica, concurso y resultado.
- [ ] Definir experiencia sin registro obligatorio, sin paywall inicial y con 2 CTA prioritarios.
- [ ] Auditar riesgos de propiedad intelectual visual de ambas referencias televisivas.
- **Aceptación:** flujo aprobado, identidad original, referencias documentadas y 5 usuarios encuentran Juegos y Concurso sin ayuda.

## ÉPICA 01 — Infraestructura [P0 | Sprint 1]

### CLY-010 — Crear monorepo
- [x] `apps/game` (Expo Router web+iOS+Android), `apps/api`, `apps/realtime`, `packages/*`, pnpm workspace. (`api` y `realtime` son placeholders sin servicio; en `packages/` solo existen `numbers-engine`, `game-engine` y `design-tokens`: el resto se crea cuando haya un ticket que lo use)
- [x] TS estricto, ESLint, Prettier, convenciones y CI. (CI en `.github/workflows/ci.yml`, **sin ejecutar** todavía)
- [x] Variables de entorno `.env.example`; no subir secretos. (Sprint 1 no necesita ninguna)
- [x] Configurar scripts `web`, `android`, `ios`, `lint`, `typecheck`, `test` compatibles con Expo y documentación de entorno. (`android`/`ios` definidos pero **no probados**)
- **Aceptación:** la app Expo abre una pantalla en navegador ✅; tipos/tests verdes en local ✅; CI remota sin comprobar. No afirmar build nativa sin probarla.
- **Decisiones del ticket:** pnpm **10** (no 12) y `nodeLinker: hoisted`; ver README «Decisiones de entorno».

### CLY-011 — Dominio y reglas versionadas
- [x] Definir enums de modalidades, fases, tipos de prueba y acciones. (`Stage`, `GameMode`, `PuzzleType`, `DuelType`; acciones solo de cifras)
- [ ] Implementar parser validado de rulesets y snapshots inmutables. (hay `validateRuleset` + `createRulesetSnapshot` con hash; **falta el parser Zod** de entrada)
- [ ] Implementar máquina de estados pura con inyección de tiempo y RNG. (hecho solo para la sesión de cifras, `numbers-session.ts`; falta la FSM del concurso)
- [x] Añadir pruebas de transiciones inválidas. (para la sesión de cifras)
- **Aceptación:** replay idéntico con mismo estado inicial y mismos eventos ✅ para cifras (`replayNumbersEvents`).

### CLY-012 — Diseño base
- [x] Crear tokens de color, tipografía, radio, espaciado y componentes. (`packages/design-tokens`, con test de contraste WCAG AA de la paleta)
- [ ] Cronómetro ✅, marcadores ✅, botones de pulsador ❌, fichas numéricas ✅ / letras ❌. (`Countdown`, `ScoreBoard`, `NumberTile`)
- [ ] Layout móvil/tablet/escritorio ✅ (verificado en web), safe areas (implementadas con `react-native-safe-area-context`, **sin probar en dispositivo**), teclado virtual (sin campos críticos aún), teclado hardware ✅ (atajos + foco con Tab), foco ✅, lector de pantalla (roles y etiquetas `aria-*` implementados; **sin probar con VoiceOver/TalkBack**).
- [x] Usar primitives React Native, no `shadcn/ui` DOM como base.
- [ ] Alinear componentes con `docs/DESIGN.md` y `docs/UX_FLOWS.md`: tarjetas de modo ✅, catálogo ✅, resultado individual ✅, **transiciones de concurso ❌**.
- **Aceptación:** pantallas prototipo propias accesibles sin activos RTVE ✅ en web.

### CLY-013 — Persistencia mínima
- [ ] Decidir ORM + migrations + esquema matches/rulesets/puzzles.
- [ ] Persistir eventos y resultados.
- [ ] Crear fixtures y seed de desarrollo.
- **Aceptación:** una partida se guarda y restaura sin inconsistencias.

### CLY-014 — App universal y primeros builds [P0 | Sprint 1]
- [ ] Expo Router con rutas de **Inicio ✅, Juegos individuales ✅, Catálogo/Ficha ✅, Entrenamiento ✅, Concurso/Configuración ✅**, sala ❌ y ajustes ❌.
- [x] React Native Web; probar un componente de fichas y cronómetro en navegador. (E2E Playwright)
- [ ] Configuración `app.config.ts` ✅ e identificadores de desarrollo iOS/Android ✅ (`dev.proyectocly.game`, **provisionales**); splash e icono propios ❌.
- [ ] Crear build de desarrollo Android e iOS con EAS; instalar y probar en dispositivo/emulador y anotar limitaciones de acceso. **BLOQUEADO (decisión del usuario):** requiere cuenta Expo/EAS (posible coste), cuenta Apple Developer para iOS y un dispositivo/emulador. Este equipo no tiene Android SDK/adb ni macOS. Los bundles JS de Android e iOS **sí compilan** con Metro/Hermes (`expo export`), sin ejecutarse.
- [ ] Abstraer haptics/audio y persistencia con fallback web. (solo hay adaptadores de reloj y de semilla aleatoria)
- **Aceptación:** misma pantalla Expo funcional en web ✅, Android ❌ e iOS ❌ (bloqueo externo documentado arriba; plan: abrir cuenta EAS → `eas build --profile development` → probar `Inicio → Juegos → Cifras`).

### CLY-015 — Pruebas cross-platform automatizadas [P0 | Sprint 1]
- [ ] Vitest para motor ✅ (134 tests de paquetes + 7 de la app), React Native Testing Library ❌, Playwright para web ✅ (36 tests = 18 × {escritorio, móvil}).
- [ ] Elegir estrategia Maestro/Detox en ADR-009 ❌; smoke test nativo de lanzamiento y navegación ❌.
- [ ] Pruebas de layout con safe area, teclado abierto y texto grande ❌.
- [ ] CI con pruebas de dominio/UI y build web ✅ (escrito, sin ejecutar); plan de builds nativas periódicas ❌.
- **Aceptación:** checks repetibles y versiones compatibles ✅ (`expo install --check` y `expo-doctor` 20/20), sin declarar un dispositivo probado: **ninguno** se ha probado.

### CLY-016 — Contratos y adaptadores de plataforma [P0 | Sprint 1]
- [ ] Definir `ClockAdapter` ✅ (`Clock` en `game-engine` + `systemClock` en `apps/game/src/adapters`), `StorageAdapter` ❌, `FeedbackAdapter` ❌, `NetworkStatusAdapter` ❌.
- [x] Implementar diferencias web/nativas sin filtrar APIs DOM al motor. (los atajos de teclado son solo web y viven en la app)
- [ ] Decidir estrategia del modo entrenamiento offline sin recompensas competitivas. (hoy: todo en cliente y sin persistencia; el progreso no se guarda)
- **Aceptación:** `packages/game-engine` no importa React, Expo ni APIs de navegador ✅ **y está impuesto por ESLint** (también prohíbe `Date.now`, `Math.random`, `performance.now`, `new Date` y `eval` en el motor).

### CLY-017 — Inicio de videojuego y catálogo de todas las pruebas [P0 | Sprint 1]
- [x] Inicio con dos CTAs dominantes **Juegos individuales** y **Concurso completo**; accesos secundarios a perfil/ajustes/online. (los secundarios, «Con amigos» y «Estadísticas», salen como no interactivos «En preparación»; no hay perfil ni ajustes)
- [x] Catálogo agrupado con **13 tipos previstos**, de los que 11 son habituales (incluye desempate) y 2 especiales.
- [x] Ficha de prueba: descripción, cómo se juega, tiempo con/sin reloj, dificultad si está soportada (no se muestra selector: ningún banco la soporta aún) y estado real de disponibilidad.
- [x] Reutilizar `PuzzleRegistry` y no hardcodear pantallas ficticiamente jugables. (`puzzle-registry.ts`; solo `NUMBER` está `AVAILABLE`)
- [x] Test E2E: abrir Inicio → Juegos → Cifras; Inicio → Concurso → IA; no requerir cuenta.
- **Aceptación:** la estructura de dos modos resulta inequívoca en web ✅ (sin prueba de usabilidad con 5 personas todavía); iOS/Android sin comprobar; las pruebas aún no implementadas se etiquetan «En preparación» ✅.

### CLY-018 — Shell de entrenamiento independiente [P0 | Sprint 2]
- [x] `TrainingShell` sin marcador rival, con reloj opcional y motor común. (`features/training/TrainingSession.tsx`; hoy solo aloja Cifras)
- [x] Pantalla de resultados individual con respuesta explicada tras cierre, `Repetir`, `Siguiente ejercicio`, `Volver a juegos`. (es un estado de la pantalla de sesión, no la ruta `/resultado/entrenamiento`: ver `UX_FLOWS.md`)
- [x] Configuración de práctica no cambia puntuación ni reglas de concurso. (`TimingConfig` es una variación explícita de la sesión; el ruleset es inmutable)
- [x] Un mismo puzzle funciona con los validadores del concurso sin lógica duplicada. (`validateExpression` y `scoreNumbersRound` son los que usará el concurso)
- **Aceptación:** se puede jugar y repetir Cifras sin concurso, IA ni registro ✅ (E2E).

### CLY-019 — Configurador y presentación del concurso [P0 | Sprint 2]
- [x] Elegir vs IA / 2 jugadores local / sala online según disponibilidad real. (solo «Contra la IA» abre configuración; local y online: «En preparación»)
- [ ] Vista previa de fases ✅ (derivada del ruleset), instrucciones ❌, marcador ❌, intro original que se pueda saltar ❌.
- [ ] Integrar `ContestShell` con el mismo motor/Board que entrenamiento. ❌ (`buildContestSchedule` ya existe en `game-engine`)
- **Aceptación:** recorrer Inicio → Concurso → IA y mostrar correctamente fase/marcador, sin afirmar que la partida completa está lista ✅ para la parte de configuración y fases; **no hay marcador ni partida**.

## ÉPICA 02 — Cifras y letras [P0 | Sprints 2–3]

### CLY-020 — AST y validador de cifras
- [x] Nodos de operaciones y hojas con `tileId`. (`ExpressionTree`, serializable para red)
- [x] Divisiones exactas/intermedios sujetos a perfil. (`NumbersPolicy`; aritmética racional exacta cuando se relajan las reglas [PENDIENTE])
- [x] No repetir fichas; admitir valores duplicados en fichas distintas. (NUM-01, NUM-02)
- [x] Errores tipados y tests de casos límite. (NUM-03 y desbordamiento incluidos)
- **Aceptación:** 100% de fixture tests pasan ✅ y nunca se usa `eval` ✅ (regla ESLint `no-eval` + validador estructural que rechaza nodos desconocidos).

### CLY-021 — Solver y generador matemático
- [x] Solver por subconjuntos; devolver witness y mejor distancia. (búsqueda exhaustiva con memoización; ~30 ms por puzzle de 6 fichas en este equipo)
- [x] Generador semillado con distribución ajustable. (`GeneratorOptions` + `numberTiles` del ruleset; **la composición de la bolsa es [DISEÑO]**)
- [ ] Métricas de complejidad ✅ parcial (`operationCount`, `exploredStates`; sin nº de soluciones ni bucket de dificultad) y rechazo de puzzles degenerados ✅.
- [ ] Benchmark y tests de rendimiento. (solo una prueba de humo < 5 s; sin benchmark formal)
- **Aceptación:** solver encuentra óptimo para conjunto de fixtures acordado ✅ (952 con 25-50-75-100-3-6; seis unos → 9) y su testigo valida en 60 puzzles aleatorios semillados.

### CLY-022 — Pantalla de cifra exacta
- [x] Mostrar objetivo y 6 fichas; editor de pasos, deshacer y confirmar.
- [x] Cronómetro 40 s en perfil referencial; bloqueo de envío tardío. (`DEADLINE_EXPIRED`; reloj inyectado)
- [x] Vista de solución tras cierre y marcador actualizado **solo en concurso**; en entrenamiento mostrar resultado individual y repetir. (el marcador de concurso aún no existe)
- [ ] Controles táctiles ✅ (sin probar en pantalla táctil real; E2E emula `hasTouch`) y teclado físico ✅ (`+ − * / Retroceso Esc Enter`); teclado virtual n/a (no hay campos de texto en la prueba).
- **Aceptación:** usuario resuelve/corrige/termina 20 casos sin bloqueo ❌ **pendiente de prueba humana**. Cubierto hoy por E2E (10 semillas distintas, 2 viewports): una resolución exacta de principio a fin con el solver, una aproximación, deshacer/reiniciar, rechazo de división no exacta y de resta no positiva, rendición, repetir/siguiente/volver, cuenta atrás y agotamiento de tiempo.

### CLY-023 — Léxico y licencias
- [ ] Seleccionar fuente léxica permisible; documentar licencia y atribución.
- [ ] Construir normalización Unicode, tildes, ñ, plural y morfología.
- [ ] Separar palabra candidata de aceptación editorial.
- [ ] Escribir test de formas raras/ambiguas.
- **Aceptación:** no se copia un diccionario protegido sin autorización.

### CLY-024 — Motor y pantalla de letras
- [ ] Distribución de 10 fichas con elección de 3–6 vocales.
- [ ] Multiconjuntos y duplicados; mínimo de cinco letras.
- [ ] Envío de palabra y ganador/puntuación por longitud.
- [ ] Solución y otras palabras solo al terminar; `Siguiente ejercicio` disponible en el modo individual.
- **Aceptación:** comparaciones y empate sin errores.

## ÉPICA 03 — Llave, duelos y desempate [P0 | Sprints 4–5]

### CLY-030 — Implementar llave
- [ ] Datos de pista y solución; 30 s; revelación según ruleset.
- [ ] Buzzer común; un solo propietario de llave.
- [ ] Propagar `keyOwned` a la final sin filtrarla al contrincante.
- **Aceptación:** llave no se duplica ni pasa al rival por perder; la versión de práctica funciona sin rival y sin llaves ficticias acumuladas.

### CLY-031 — Buzzer autoritativo de dominio
- [ ] Arbitraje `BUZZ`; bloquear segundas pulsaciones.
- [ ] Error/timeout y adjudicación de puntos según reglas.
- [ ] Tests de empate lógico, simultaneidad y pulsación tardía.
- **Aceptación:** no hay dobles ganadores del mismo duelo.

### CLY-032 — Duelo 3 en 1
- [ ] Contenido con pista, fases de revelación y palabra única.
- [ ] UI de letras reveladas, reloj y resultado.
- **Aceptación:** pista no se revela antes del umbral.

### CLY-033 — Duelo Doble palabra
- [ ] Definición de pareja y reparto de diez fichas.
- [ ] Validador de multiplicidad conjunta.
- **Aceptación:** rechaza reutilizar letras en ambas palabras.

### CLY-034 — Duelo 2 para 2
- [ ] Cerrar reglas a partir de emisión.
- [ ] Schema editorial con validaciones específicas.
- [ ] UI y corrector de dos respuestas.
- **Aceptación:** casos reales documentados se reproducen; desde Juegos la prueba funciona en solitario.

### CLY-035 — Duelo Doble sentido
- [ ] Dos definiciones, una palabra, variantes editoriales.
- [ ] UI y validador determinista.
- **Aceptación:** una respuesta no prevista no entra automáticamente por LLM.

### CLY-036 — Duelo El cálculo
- [ ] Parser seguro de expresiones pregeneradas.
- [ ] Respuesta numérica, buzzer y feedback.
- **Aceptación:** operaciones y paréntesis evaluados exactamente.

### CLY-037 — Duelo Esprint numérico
- [ ] Cerrar reglas y política de demostración.
- [ ] UI de cifras rápidas y validación.
- **Aceptación:** partido reproducible; sin ventaja cliente sobre servidor.

### CLY-038 — Selección de 4 duelos y desempate
- [ ] Elegir cuatro dentro de seis según perfil.
- [ ] Aplicar puntos 10/20/30/50 sin duplicidad.
- [ ] Ronda de desempate si marcadores iguales.
- **Aceptación:** simulación automática llega a único vencedor.

## ÉPICA 04 — Concurso vs IA y final [P0 | Sprints 6–7]

### CLY-040 — Gran final temática
- [ ] Estructura de 12 paneles; 3 minutos; paneles de diez fichas.
- [ ] Paso, bucle de pendientes y cuenta de resueltas.
- [ ] Acción `USE_KEY` una vez.
- [ ] Tabla de premios virtuales versionada.
- **Aceptación:** todos los casos `FIN-*` de GAME_RULES pasan y la final puede elegirse aisladamente desde Juegos individuales.

### CLY-041 — Orquestar concurso completo
- [ ] Las etapas transicionan automáticamente sin saltos; UI audiovisual original estilo concurso con intro omitible, nombre de ronda, marcador y resultado.
- [ ] Mostrar marcador, resultados y rondas restantes.
- [ ] Guardar replay y estadísticas.
- **Aceptación:** se termina una partida completa sin intervención manual.

### CLY-042 — IA en tres dificultades
- [ ] Política de búsqueda matemática y léxica según nivel.
- [ ] Tiempos realistas de reacción, fallos y estrategias.
- [ ] No permitir lectura anticipada de soluciones en su API.
- [ ] Comparar resultados en 100 partidas simuladas por nivel.
- **Aceptación:** rival diferenciable por dificultad, reproducible por semilla.

## ÉPICA 05 — Multiplayer [P0 | Sprints 8–9]

### CLY-050 — Servidor WebSocket y contratos
- [ ] Transport tipado, autenticar cada conexión, admitir invitado con token.
- [ ] Persistencia de eventos y locks por partida.
- [ ] Idempotencia `actionId`, rate limits y envíos filtrados.
- **Aceptación:** dos dispositivos ven el mismo estado y no exponen soluciones.

### CLY-051 — Salas privadas
- [ ] Crear código temporal, unirse, READY y comenzar.
- [ ] Expiración/abandono/revancha.
- **Aceptación:** A invita a B y ambos completan concurso sin registro.

### CLY-052 — Relojes, reconexión y conflictos
- [ ] Aplicar deadline exclusivo de servidor.
- [ ] Rejoin con snapshot y replay.
- [ ] Probar dos buzzer casi simultáneos, desconexiones y reenvíos.
- **Aceptación:** ninguna duplicidad de puntos ni race condition evidente.

### CLY-053 — Test de seguridad online
- [ ] Manipulación de puntajes, timestamps y respuestas.
- [ ] Acceso cruzado a salas y vistas privadas.
- [ ] Cargas y límites de peticiones.
- **Aceptación:** paquete de tests de abuso automatizado.

### CLY-054 — Compatibilidad cruzada y segundo plano [P0 | Sprint 9]
- [ ] Sala entre navegador e iPhone/Android y, cuando se disponga, iPhone frente a Android.
- [ ] Manejar app minimizada, bloqueo de pantalla, llamada entrante y reconexión.
- [ ] Confirmar deadline y marcador exclusivamente en servidor.
- **Aceptación:** desconexiones no permiten obtener tiempo extra ni información privada.

## ÉPICA 06 — Especiales, contenido y beta [P1 | Sprints 10–11]

### CLY-060 — Descifra
- [ ] Implementar preguntas de números desordenados.
- [ ] Configurar edición 2024 y futuras variantes de manera versionada.
- [ ] Soportar parejas/equipos en estructura de dominio.
- **Aceptación:** no mezclar 2024 con reglas de otros especiales.

### CLY-061 — Palabra maestra
- [ ] Base de 8 letras y generador/corrector de palabras derivadas.
- [ ] Mínimo 4 en especial 2024, mínimo 5 en especial 2025.
- [ ] Cuantificar palabras únicas y evitar repeticiones.
- **Aceptación:** los tests `SP-*` distinguen perfiles.

### CLY-062 — Editor de preguntas
- [ ] CRUD DRAFT/REVIEWED/PUBLISHED/RETIRED y revisiones.
- [ ] Preview, solver, detección de ambigüedades, metadatos de licencia.
- [ ] Banco inicial curado con cobertura de los tipos de prueba.
- **Aceptación:** un puzzle rechazado no puede publicarse.

### CLY-063 — Perfil, historia y métricas
- [ ] Login opcional y perfil de jugador.
- [ ] Estadísticas, historial y borrado de cuenta.
- [ ] Privacidad por defecto.
- **Aceptación:** un invitado puede jugar, no necesita cuenta para empezar.

### CLY-064 — Accesibilidad y cross-browser
- [ ] Teclado, lectores, foco, contraste y movimientos reducidos.
- [ ] Safari iPhone, Chrome Android, desktop, tablets y apps nativas iOS/Android.
- [ ] Evitar overlay de teclado sobre temporizador.
- **Aceptación:** rutas esenciales WCAG 2.2 AA auditadas.

### CLY-065 — Beta nativa instalable [P0 | Sprint 11]
- [ ] Configuración EAS preview/production, builds Android AAB y iOS firmadas para pruebas.
- [ ] Distribuir por TestFlight y pruebas internas/cerradas Google Play si cuentas disponibles.
- [ ] Revisar teclado virtual, safe areas, batería, tamaño de texto, accesibilidad y errores.
- **Aceptación:** completar concurso vs IA en ambos sistemas móviles y documentar incidencias por dispositivo.

### CLY-066 — Diseño comercial multiplataforma [P1 | Sprint 11]
- [ ] Diseño original de **videojuego televisivo**, tokens y componentes responsive alineados con `DESIGN.md` y `UX_FLOWS.md`.
- [ ] Assets, iconos y pantallas para tiendas con licencia documentada.
- [ ] Ajustes por plataforma y movimiento reducido; probar con VoiceOver y TalkBack.
- **Aceptación:** no hay assets ni UI copiados del programa y existe checklist QA visual.

## ÉPICA 07 — Publicación y negocio [P0 para release | Sprint 12+]

### CLY-070 — Revisión de beta
- [ ] Test de usuarios y bugs.
- [ ] Balance de IA y dificultad editorial.
- [ ] Monitorizar costes y rendimiento.
- **Aceptación:** lista de defectos bloqueantes vacía.

### CLY-071 — Gate legal de comercialización
- [ ] Confirmar derechos, contratos/licencias o rediseño del formato.
- [ ] Revisar todos los activos y textos comerciales.
- [ ] Aprobar términos de servicio, privacidad y contenido.
- **Aceptación:** autorización documentada por el decisor; si no, no comercializar copia fiel.

### CLY-072 — Release Candidate
- [ ] Build de producción, backups y observabilidad.
- [ ] Plan de rollback y soporte.
- [ ] QA completo, pruebas cruzadas web/iOS/Android y changelog.
- [ ] Ejecutar checklist `docs/MOBILE_RELEASE.md`; diferenciar release candidate técnico de aprobación de tiendas.
- **Aceptación:** checklist de lanzamiento técnico cumplida; publicación pública requiere gate legal y revisión de tiendas.

### CLY-073 — Preparación App Store y Google Play [P0 para publicación]
- [ ] Reservar IDs definitivos, verificar cuentas, firma y permisos mínimos.
- [ ] Fichas y capturas originales, clasificación, privacidad, borrado de cuenta y soporte.
- [ ] Validar reglas vigentes de compras integradas si hay bienes digitales.
- [ ] Publicar únicamente si el gate jurídico de marca/formato está resuelto.
- **Aceptación:** evidencia del checklist de `MOBILE_RELEASE.md`; cualquier bloqueo documentado impide comercializar.

## P2 — No desarrollar antes de terminar la beta

- **CLY-080:** ranking competitivo y temporadas.
- **CLY-081:** matchmaking y MMR.
- **CLY-082:** retos diarios con resultado firmado.
- **CLY-083:** suscripción, pago y facturación (con compliance).
- **CLY-084:** mejoras nativas avanzadas (widgets, notificaciones opcionales, atajos), no un wrapper: Expo ya es multiplataforma.
- **CLY-085:** localización a otros idiomas con diccionarios licenciados.

## Orden de desarrollo recomendado para Claude Code

`CLY-001 → CLY-003 → CLY-004 → CLY-010 → CLY-012 → CLY-014 → CLY-017 → CLY-011 → CLY-015 → CLY-016 → CLY-018 → CLY-020 → CLY-021 → CLY-022 → CLY-019 → CLY-023 → CLY-024 → CLY-030 → ...`.

El primer PR con código deberá implementar **solamente una transición de partida y su prueba**, no crear todos los módulos con archivos vacíos.

> **Nota 27/10/2026:** el Sprint 1 se ejecutó como una vertical slice mayor por petición expresa del responsable (monorepo + UI + Cifras jugable). Se mantuvo la regla de fondo: no se crearon paquetes ni archivos vacíos.

## Siguientes pasos propuestos (en este orden)

1. **Probar en un dispositivo real** (desbloquea CLY-014/015/065): decidir cuenta EAS y dispositivo/emulador; hacer la build de desarrollo y repetir `Inicio → Juegos → Cifras`.
2. **Prueba humana de Cifras** (20 ejercicios, CLY-022) y de descubrimiento con 5 personas (UX_FLOWS §8.12).
3. **CLY-016 completo**: `StorageAdapter` (progreso local de entrenamiento) y `FeedbackAdapter` (haptics/sonido con mute).
4. **CLY-023/024**: léxico y La palabra más larga: la segunda prueba `MVP inicial` del catálogo; obliga a cerrar ADR-005 (licencia del léxico).
5. **CLY-011 completo**: parser Zod de rulesets y FSM del concurso, antes de CLY-041.
6. Cerrar los `[PENDIENTE]` de cifras con la matriz de emisiones (CLY-001/002) para poder pasar el ruleset a `VERIFIED`.
