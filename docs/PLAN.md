# PLAN — Hoja de ruta inicial del videojuego

**Versión:** 1.3 — 27/10/2026  
**Estado:** Sprint 0 (documentación) cerrado. **Sprint 1 ejecutado parcialmente**: ver «Estado real» al final de este documento y `docs/TASKS.md`.  
**Horizonte estimado:** 20–26 semanas para una beta completa desarrollada principalmente por una persona con apoyo de Claude Code. No es compromiso de entrega: depende del tiempo disponible, el contenido editorial y las decisiones legales.  
**Filosofía:** experiencia de app de concurso pulida, **dos rutas principales (Juegos individuales + Concurso completo)**, desarrollo por vertical slices, motor común, multiplayer-ready y pruebas web/iOS/Android. El objetivo de 20–26 semanas sigue siendo orientativo; disponibilidad de dispositivos, reglas y licencias puede alargarlo.

## 1. Prioridades

**P0 (imprescindible):** Expo universal web/iOS/Android, builds nativas de prueba, **Inicio con Juegos individuales y Concurso completo, catálogo de pruebas independientes**, motor, dos pruebas clásicas, llave, seis duelos, desempate, final, concurso completo vs IA, guardado, sala privada online cruzada, seguridad y licencias de contenido.

**P1 (beta ampliada):** dos pruebas especiales, editor editorial opcional, perfiles, historial avanzado, accesibilidad ampliada y pilotos mediante TestFlight / pruebas internas de Android. **El modo de pruebas independientes NO es P1: es núcleo P0.**

**P2 (después de la beta):** matchmaking, ranking, desafíos diarios, temporadas competitivas, monetización y posible publicación comercial de tiendas tras gate legal. Las aplicaciones nativas NO quedan relegadas a P2: se desarrollan desde la primera fase.

El MVP inicial se define como **vertical slice jugable** (no como producto completo): cifras + letras + IA simple. La **beta de concurso completo** sí contempla todas las pruebas del programa habitual.

## 2. Calendario por fases

| Sprint/Fase | Semanas orientativas | Objetivos | Resultado demostrable |
|---|---:|---|---|
| 0 — Descubrimiento | 1–2 | Investigación emisiones, benchmarking funcional Pasapalabra, reglas, riesgos IP, wireframes | UX_FLOWS, DESIGN, GAME_RULES y ADR iniciales |
| 1 — Fundaciones | 3–4 | Monorepo, Expo Router, CI, FSM, tokens, **portada dos modos + catálogo**, builds Android/iOS dev | Navegación Inicio → Juegos → Cifras / Inicio → Concurso → IA |
| 2 — Motor clásico | 5–8 | Calculadora, solver, validador de palabras, generadores, puntuación, reloj | Entrenamiento de cifras y letras en web y al menos un móvil real |
| 3 — Llave y duelos | 9–12 | Llave, seis duelos, pulsadores, desempate, **juegos individuales para cada prueba** | Catálogo habitual completo salvo final, con miniconcurso |
| 4 — Final y concurso | 13–15 | 12 palabras, pases, comodín, premios virtuales, secuencia completa, IA graduada | **11 modalidades habituales jugables individualmente y concurso completo vs IA** |
| 5 — Multijugador privado | 16–19 | Lobby, servidor WS, eventos, reloj, reconexión, seguridad | Partida real entre web, Android e iOS (al menos dos plataformas distintas) |
| 6 — Calidad y especiales | 20–22 | Descifra, Maestra, contenido QA, accesibilidad, builds TestFlight / Android internas | Beta cerrada web + builds móviles instalables |
| 7 — Beta/pulido | 23–26 | Test usuarios por plataforma, balance, costes, privacidad y revisión jurídica | Release Candidate técnico; publicación comercial sujeta a permisos |

Las semanas son relativas al arranque. No presuponen dedicación exclusiva. Un objetivo comercial sólido puede ampliar considerablemente el horizonte.

## 3. Fase 0 — investigación del formato y derechos

**Trabajo concreto:**
1. Revisar al menos tres programas regulares de 2026 separados temporalmente, un especial y al menos un desempate visible si está disponible.
2. Abrir matriz observacional: `programa`, `fecha`, `minuto`, `prueba`, `regla observada`, `duda`, `confianza`.
3. Resolver pendientes del perfil `RTVE_2026_REFERENCE`, especialmente operación aritmética, puntuaciones fronterizas y duelos.
4. Investigar titularidad/licenciatarios del formato televisivo para negociar o valorar permisos; registrar riesgos y alternativas de producto original.
5. Crear wireframes **Inicio, catálogo, ficha de prueba, entrenamiento, resultado individual, configuración de concurso, duelo, final y resultados** según `UX_FLOWS.md`; definir accesibilidad del pulsador.
6. Resolver ADR-001 a ADR-006 y registrar **ADR-007 (Expo)** antes de empezar fuerte con infraestructura.
7. Confirmar disponibilidad de un Android y un iPhone para QA, acceso a macOS/Xcode o uso adecuado de EAS para builds iOS.

**Definition of Done:** documento del formato versionado, riesgos visibles, decisiones de stack y diseño, preguntas críticas trasladadas a tickets.

## 4. Fase 1 — fundaciones

- Inicializar repo privado con `apps/game` (Expo Router para web/iOS/Android), `apps/api`, `apps/realtime` y paquetes de reglas; linters, TS estricto, tests y CI.
- Configurar identificadores de app de desarrollo, enlaces profundos, variables de entorno y primera build nativa con EAS.
- Probar en web, Android y iOS los elementos básicos de navegación, safe areas y teclado.
- Definir `GameState`, `GameAction`, `RuleEngine`, `RuleSet`, `ContentPack` y máquina de estados.
- Crear sistema visual propio en `DESIGN.md` (sin copiar RTVE ni Pasapalabra); **dos CTAs principales y catálogo desde el primer sprint**, componentes React Native de cronómetro, marcador, fichas y pulsador con variantes adaptativas.
- Preparar base de datos y migraciones mínimas para partidas locales y progreso opcional.
- Añadir contenido sintético de pruebas para desarrollo y e2e.

**DoD:** rutas Inicio → Juegos → Catálogo/Ficha y Inicio → Concurso → Configuración (sin concurso funcional todavía), tests y typecheck verdes, build de desarrollo Android/iOS probada o bloqueo documentado; demo con fixtures.

## 5. Fase 2 — cifras y letras

**Cifras:** parser AST, consumos por `tileId`, operaciones, errores claros, solver óptimo, generador por dificultad, tablero interactivo y envíos.

**Letras:** adquisición del diccionario con atribución, normalizador, índice de palabras, validación por multiplicidad, vocales 3–6, mejor palabra, tabla de puntuación y UI.

**QA:** propiedad de nunca reutilizar ficha; reproducibilidad de soluciones; unit de palabras con tilde/ñ/plurales; límite de tiempos.

**DoD:** Cifras y Letras están accesibles **como pruebas aisladas**, con reloj opcional, corrección, solución, Repetir/Siguiente reto; un humano termina 20 ejercicios de cada tipo sin errores bloqueantes tanto en web como en móvil; el dominio arbitra sin duplicar lógica; las soluciones son auditables.

## 6. Fase 3 — llave, seis duelos y desempate

- Motor genérico de buzzer y resultado del duelo.
- Seis generadores/catálogos de contenido, empezando por pruebas de respuesta única.
- Interfaz de reloj y pistas graduales.
- Editor/importación YAML/JSON para preguntas revisadas.
- Pruebas E2E de empate, fallo, no respuesta, vencimiento y pulsación simultánea.

**DoD:** La llave, los seis duelos y desempate se entrenan desde el catálogo **sin rival obligatorio**; un concurso corto puede ejecutar cuatro duelos distintos más un desempate.

**Riesgo:** pruebas 2 para 2 y Esprint deben verificarse antes de marcar «fiel».

## 7. Fase 4 — final, concurso e IA

- Packs temáticos de 12 preguntas, con ciclos de pendientes, `PASS` y `USE_KEY`.
- Integración de concurso completo con rondas clásicas y duelos.
- IA principiante, normal y experto que solo recibe vista pública de la partida.
- Premios virtuales, bote simulado y resultados explicados al cierre.
- Sistema de estadísticas básicas y reintento.

**DoD:** **Gran final disponible también individualmente; 11 tipos habituales accesibles como juegos aislados**, y concurso completo de inicio a fin vs IA sin ajustes manuales ni soluciones filtradas.

## 8. Fase 5 — multijugador online

- Crear/unirse a sala, códigos temporales, estados READY.
- Servicio WebSocket de larga duración, ordenación de mensajes y deadlines.
- Recuperación de partida tras reconexión y protección contra abandono.
- Dos clientes con roles independientes, respuestas filtradas y marcador compartido.
- Tests de dos navegadores, web vs móvil y Android vs iOS cuando esté disponible; red lenta, segundo plano, doble toque, reenvío y pérdida de paquetes.

**DoD:** dos jugadores completan una partida privada desde distintas plataformas (mínimo dos de web/Android/iOS), con servidor como árbitro y reconexión probada. No lanzar ranking todavía.

## 9. Fase 6 — beta cerrada y especiales

- Soporte de Descifra y Maestra, reglas por edición y equipos como funcionalidad modular.
- Herramienta editorial de packs, QA y revisión.
- Semillas de contenido suficientes para beta (véase ESPECIFICACION_FUNCIONAL.md).
- Evaluación WCAG AA, telemetría sin recoger respuestas personales innecesarias.
- Tests en Safari iOS, Chrome Android y navegadores de escritorio, **además de aplicaciones nativas instaladas** mediante TestFlight/Android internal o build desarrollo.

## 10. Fase 7 — release candidate y comercialización

**Pruebas:** bug bash con usuarios reales, equilibrio IA, carga realtime, datos de retención y costes.

**Legal/comercial:** evaluación expresa de derechos del formato, licencia de fuentes léxicas, marcas y contenido. La liberación pública de una copia fiel no se considera aprobada automáticamente por estar técnicamente terminada.

**Producto:** landing y marca propia, política de privacidad, términos, FAQ, soporte y ficha de tiendas. Una app técnicamente apta no puede publicarse fielmente sin resolver los derechos.

**Mobile release:** ejecutar checklist de `MOBILE_RELEASE.md` (firma, identidad, builds AAB/iOS, pruebas en dispositivos, borrado de cuenta, políticas, edad y métodos de compra digital cuando corresponda). No confundir el sprint final con fecha garantizada de aprobación de tiendas.

## 11. Gestión de trabajo

### Ritmo propuesto
- Sprints de 2 semanas; demo funcional y retrospectiva en cada cierre.
- Una sola columna de tickets `Backlog → Ready → In Progress → Review → Done`.
- Cada ticket describe escenario de usuario, reglas, tests, dependencias y checkboxes.
- No iniciar diseño decorativo extensivo antes de cerrar el contrato del motor.

### Criterios para cada PR
- Cambio asociado a ticket y ADR cuando corresponda.
- Test unitario para toda regla nueva o bug de motor.
- Validación/seguridad en server cuando afecta multiplayer.
- Captura de cambios UI cuando corresponda.
- Documentar fuente y licencia cuando añade contenido.

## 12. Dependencias críticas y riesgos

| Riesgo | Prob. | Impacto | Mitigación |
|---|---|---|---|
| Derechos del formato, nombre y apariencia | Media/Alta | Muy alto | Resolver con profesional de IP, licencia o rediseño antes de comercialización |
| Falta de reglamento público exhaustivo | Alta | Alto | Matriz de observación; etiquetar reglas como provisionales |
| Diccionario distinto del arbitraje de RTVE | Alta | Alto | Léxico + excepciones editorialmente revisadas |
| Duelos ambiguos/respuestas múltiples | Media | Alto | Packs de respuesta única y revisión humana |
| Latencia/pulsadores online | Media | Alto | Autoridad server, instrumentación de RTT, pruebas de red |
| Exceso de alcance | Alta | Medio | Vertical slices, P0/P1/P2, no matchmaking inicial |
| Incompatibilidades Expo/web/nativas | Media | Alto | Prototipos en las 3 plataformas desde Sprint 1; adaptadores y variantes específicas |
| Revisión de tiendas iOS/Android | Media | Alto | Identidad propia, QA de builds, privacidad, TestFlight y pruebas internas |
| Ciclo de vida/segundo plano en móviles | Alta | Medio | Deadline server y protocolo de reconexión, sin confiar en temporizadores locales |
| Costes del backend | Media | Medio | Límite salas, métricas y presupuestos |
| Copia de materiales de RTVE | Media | Muy alto | Diseño y contenido originales; checklist de licencias |

## 13. Hitos y entregables

- **M1 (semana 4):** repositorio, motor base, **Inicio/Catálogo/Concurso navegables** y prueba real de Expo en web + build Android/iOS de desarrollo.
- **M2 (semana 8):** cifras y letras entrenables.
- **M3 (semana 12):** llave + seis duelos + desempate, **cada uno practicable desde Juegos**.
- **M4 (semana 15):** concurso completo contra IA y **11 tipos de prueba habitual individual disponibles**, incluida la final.
- **M5 (semana 19):** sala privada multijugador entre plataformas.
- **M6 (semana 22):** beta con especiales/editor/QA en web y builds nativas instalables.
- **M7 (semana 26):** candidato técnico a lanzamiento, checklist de tiendas y decisión legal/comercial (no publicación prometida).

## 14. Próximas cinco acciones ejecutables

1. ~~Crear repositorio privado y colocar estos documentos en raíz/docs.~~ Pendiente: la carpeta aún no es un repositorio git.
2. Auditar emisiones y editar `GAME_RULES.md` con evidencias hasta cerrar OPEN-02/03/05. **Sigue pendiente** (CLY-001/002).
3. Abrir ADR-006 de propiedad intelectual para no generar dependencia en una marca ajena. **Sigue pendiente** (CLY-003). El catálogo ya usa nombres de pruebas del formato televisivo: revisar antes de publicar.
4. ~~Crear app Expo mínima, probar rutas en web/Android/iOS y arrancar motor puro~~ **Hecho en web**; Android/iOS sin probar (bloqueo documentado en CLY-014).
5. ~~Implementar primera vertical slice de cifras~~ **Hecha**: solver determinista, motor reproducible y UI reutilizable.

## 15. Estado real (27/10/2026)

**Sprint 1 — Fundaciones: parcialmente cumplido.**

| Objetivo del Sprint 1 | Estado |
|---|---|
| Monorepo, Expo Router, TS estricto, lint/format/tests | ✅ |
| Tokens + componentes base + portada de dos modos + catálogo de 13 | ✅ |
| Navegación Inicio → Juegos → Cifras e Inicio → Concurso → IA | ✅ en web |
| La cifra exacta jugable (motor, UI, solución razonada, repetir) | ✅ en web |
| CI | escrito, no ejecutado |
| Build de desarrollo Android/iOS (EAS) | ❌ bloqueado: cuentas, dispositivos y coste |
| Prueba en móvil real | ❌ |

**DoD de la Fase 1 (§4)**: «rutas … tests y typecheck verdes ✅, build de desarrollo Android/iOS probada o bloqueo documentado ✅ (documentado)». La demo con fixtures corresponde a semillas reproducibles en la URL (`?semilla=`).

**Riesgos nuevos detectados en la implementación**
- *Rutas largas en Windows/OneDrive*: pnpm 12 y el almacén aislado de pnpm 10 superan los 260 caracteres. Mitigado con pnpm 10 + `nodeLinker: hoisted`; mejor aún, mover el repositorio a una ruta corta y fuera de OneDrive.
- *Accesibilidad en React Native Web*: `accessibilityState` se ignora en web; se usa `aria-*`. Cualquier componente nuevo debe verificarse en web **y** en nativo.
- *Reglas de cifras sin verificar*: el comportamiento en tiempo agotado y el umbral de aproximación son decisiones provisionales (ver `GAME_RULES.md` §1.1).
