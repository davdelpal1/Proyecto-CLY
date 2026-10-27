# CLAUDE.md — Instrucciones de desarrollo de Proyecto CLY

**Versión:** 1.2 — 26/10/2026

## Identidad y objetivo

Construir un videojuego de cifras, letras y duelos **web + iOS + Android**, comercializable solo cuando se hayan despejado las restricciones jurídicas del formato televisivo. Se usa un nombre de trabajo propio (Proyecto CLY), no RTVE ni su identidad audiovisual. El proyecto comienza como documentación; no atribuir funcionalidades aún no implementadas.

## Leer antes de implementar

1. `docs/ARCHITECTURE.md` — arquitectura vigente multiplataforma.
2. `docs/ADR/ADR-007-EXPO-VS-UNITY.md` — por qué Expo, no Unity/Godot.
3. `docs/GAME_RULES.md` — reglas verificadas, provisionales y pendientes.
4. `docs/ESPECIFICACION_FUNCIONAL.md` — historias de usuario y pantallas.
5. `docs/UX_FLOWS.md` — **dos rutas: JUEGOS INDIVIDUALES y CONCURSO COMPLETO**, catálogo y wireframes.
6. `docs/DESIGN.md` — interfaz de videojuego pulida y original, móvil, tablet y desktop.
7. `docs/MOBILE_RELEASE.md` — requisitos de apps nativas y tiendas.
8. `docs/PLAN.md` y `docs/TASKS.md` — fases y tickets priorizados.

## Stack obligatorio (salvo nuevo ADR explícito)

- App: **Expo + React Native + TypeScript + Expo Router + React Native Web** en `apps/game`.
- Dominio: TypeScript puro en paquetes reutilizables, sin React ni Expo.
- HTTP/realtime: Node.js + WebSocket/Socket.IO, servidor autoritativo para cualquier partida competitiva.
- Datos: PostgreSQL/Supabase; Auth opcional, privacidad desde el diseño.
- UI: primitives React Native, `StyleSheet` y `packages/design-tokens` como opción inicial.
- Animación: valorar Reanimated cuando el caso lo necesite, con opción de movimiento reducido.
- Builds: Expo EAS, con pruebas web y nativas desde fases tempranas.
- **No crear frontend Next.js de juego, wrapper Capacitor, app Unity ni app Godot**. Next.js solo para panel/marketing opcional si se aprueba un ticket futuro.
- No instalar `shadcn/ui`, Radix DOM o Tailwind DOM como base del cliente móvil. NativeWind requiere ADR antes de adoptarlo.

## Reglas de producto y experiencia (P0)

- La pantalla inicial **siempre** destaca «Juegos individuales» y «Concurso completo»; no esconderlas tras login, tienda, créditos o ranking.
- El catálogo debe permitir practicar **cada modalidad por separado**, incluidas la llave, las seis variantes de duelo, desempate, gran final y dos especiales (estos últimos en beta ampliada). El entrenamiento carece de rival obligado.
- Tras practicar, mostrar solución razonada y `Repetir` / `Siguiente ejercicio` / `Volver a juegos`.
- Concurso contra IA: reproducir todas las fases del perfil elegido con reloj, marcador, transiciones propias y final.
- El benchmark oficial *Pasapalabra* (Games Momentum) es **referencia de estructura de producto, ritmo y nivel de pulido**, nunca fuente de assets, código, pantallas exactas, branding ni contenidos.
- Reutilizar motor y componentes en ambos modos con configuraciones explícitas; no duplicar reglas en UI.
- Los primeros tickets de UI deben demostrar **Inicio → Juegos → Cifras** y **Inicio → Concurso → IA**, aunque el concurso entero se habilite más tarde.

## Reglas de implementación

1. Trabajar por ticket y vertical slice. No generar scaffolding masivo sin flujo funcional.
2. No implementar sin aviso una mecánica marcada `PENDIENTE` en GAME_RULES; usar configuración y fixtures explícitos.
3. `rulesetId + revision`, seed y event log reproducibles. Tiempo y aleatoriedad inyectados; no `Date.now()` directo dentro del reducer.
4. Nunca usar `eval` ni permitir que un jugador reutilice una ficha de número/letra ilegalmente.
5. Validación de contenidos y puntajes en servidor en online. Cliente no decide buzzer, deadline o victoria.
6. Nunca distribuir la respuesta correcta antes de cierre de ronda online.
7. Definir contratos de red tipados y validados, incluyendo reconexión, secuencias e idempotencia.
8. Tener en cuenta mobile safe areas, teclado virtual, accesibilidad, modo horizontal si aplica, segundo plano y conexión inestable.
9. Compartir componentes cross-platform cuando aporten valor, pero permitir variantes `.web.tsx`, `.ios.tsx`, `.android.tsx` con razón documentada.
10. No integrar assets RTVE, preguntas copiadas, bancos léxicos sin derechos o bibliotecas sin revisar su licencia.
11. No tratar una build local/Expo Go como app aprobada por tiendas.
12. Mantener sincronizados `README`, `PLAN`, `TASKS`, `ARCHITECTURE`, `DESIGN`, `UX_FLOWS` y checklist de stores.

## Protocolo por ticket

1. Consultar el ticket y las fuentes de reglas necesarias.
2. Revisar arquitectura y paquetes afectados; proponer intervención mínima.
3. Implementar código y tests: válido, inválido, tiempos y reconexión cuando corresponda.
4. Ejecutar los comandos aplicables `lint`, `typecheck`, `test` y la validación web/nativa disponible.
5. No inventar el resultado de ninguna compilación; indicar comandos que faltaron, razón y sistemas comprobados.
6. Cerrar con resumen de archivos cambiados, pruebas, riesgos y siguiente ticket.

## Definition of Done

- Reglas y eventos reproducibles con tests.
- UI utilizable en los tamaños y plataformas exigidos por el ticket; accesible.
- Integraciones online con servidor autoritativo.
- Sin respuestas privadas o credenciales expuestas.
- Derechos documentados para assets, diccionario y bancos de pruebas.
- Documentación y tickets actualizados al estado **real**.

## Comandos y trampas conocidas (añadido 27/10/2026)

Comandos desde la raíz: `pnpm install`, `pnpm web`, `pnpm validate` (lint + typecheck + test + format:check), `pnpm test:e2e` (Playwright, usa Edge/Chrome del sistema). Estado real de cada ticket en `docs/TASKS.md`.

- **pnpm 10 y `nodeLinker: hoisted`, no cambiar.** El repo vive en una ruta larga de OneDrive; pnpm 12 y el almacén aislado superan los 260 caracteres de Windows y rompen `pnpm run` o la resolución de Vite.
- **React Native Web ignora `accessibilityState`.** Usar `aria-selected`, `aria-checked`, `aria-disabled`. Verificar todo componente nuevo en web y en nativo.
- **`<Link asChild>` falla si el hijo recibe `style` como array.** Aplanar con `StyleSheet.flatten`.
- **El `Stack` de Expo Router mantiene montada (oculta) la pantalla anterior.** En Playwright, filtrar `getByText(...)` con `.filter({ visible: true })`.
- **El motor (`numbers-engine`, `game-engine`) no puede leer reloj ni azar** (ESLint lo impide): se inyectan `nowMs` y `RandomSource`. La semilla y el reloj se deciden en `apps/game/src/adapters`.
- Los paquetes se consumen como TypeScript fuente; no hay paso de build.
- Los tests E2E resuelven los ejercicios con el propio solver del motor (`apps/game/e2e/helpers.ts`).

## Primeras tareas

`CLY-001`, `CLY-003`, `CLY-004`, `CLY-010`, `CLY-012`, `CLY-014`, `CLY-017`, `CLY-011`, `CLY-015`, `CLY-020`.

**Primera petición recomendada para Claude Code:** «Lee CLAUDE.md, UX_FLOWS.md y ARCHITECTURE.md. Implementa únicamente CLY-010: monorepo pnpm + Expo app mínima, API y realtime placeholder tipados y paquetes de motor; añade comandos de validación y tests básicos. No implementes pantallas completas ni reglas especulativas».
