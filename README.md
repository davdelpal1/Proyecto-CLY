# Proyecto CLY — Concurso de cifras, palabras y duelos

**Versión:** 1.3 — 27 de octubre de 2026  
**Estado:** Sprint 1 ejecutado parcialmente. **Funciona en web**: portada con dos modos, catálogo de 13 pruebas, ficha de prueba, **La cifra exacta jugable de principio a fin** y configuración de «Concurso contra la IA». **No existe todavía** la partida de concurso, la IA, el multijugador ni el resto de pruebas, y **la app no se ha ejecutado en iOS ni Android**.  
**Nombre:** «CLY» es una clave interna temporal, no una marca comercial validada.

## Visión

Videojuego multiplataforma **web + iOS + Android**, con una experiencia de app de concurso inspirada funcionalmente en el videojuego oficial *Pasapalabra*: **dos entradas prioritarias, JUEGOS INDIVIDUALES y CONCURSO COMPLETO**. La primera permite practicar cada prueba por separado; la segunda simula el programa contra IA, con partidas locales y online previstas. La referencia de mecánicas es la edición moderna del concurso de RTVE: llave, cinco rondas de cifras, cinco de letras, cuatro duelos de seis modalidades, desempate y final temática de doce palabras. Se contemplan dos pruebas especiales.

La paridad exacta con RTVE está condicionada a verificar reglas aún abiertas, derechos del formato y posibilidad de comercializar. **No utilizar marca, audiovisual, preguntas ni identidad de RTVE sin licencia.** El catálogo ya usa nombres de pruebas del formato televisivo: pendiente de la revisión de propiedad intelectual (CLY-003) antes de publicar.

## Arrancar el proyecto (Antigravity, VS Code o cualquier terminal)

Antigravity se basa en el mismo modelo de editor que VS Code, así que los pasos son los habituales. **No se han ejecutado dentro de Antigravity**; sí se han ejecutado en una terminal de Windows 11.

**Requisitos:** Node.js ≥ 22 (probado con 24.11), pnpm **10** y, para los tests E2E, Edge o Chrome instalado.

1. Abre la carpeta del proyecto: *File → Open Folder…* y elige la raíz (donde está `package.json`).
2. Abre la terminal integrada (`` Ctrl+` ``).
3. Instala pnpm 10 si no lo tienes: `npm install -g pnpm@10` (el proyecto fija `pnpm@10.34.9` en `package.json`).
4. Instala dependencias: `pnpm install` (la primera vez tarda 1–2 min).
5. Arranca la web: `pnpm web`. Se abre `http://localhost:8081`. Recorrido para probar: **Inicio → Juegos individuales → La cifra exacta → Practicar sin presión**.

| Comando | Qué hace |
|---|---|
| `pnpm web` | Servidor de desarrollo, abre la web |
| `pnpm android` / `pnpm ios` | Servidor para móvil. **Sin probar**: Android exige emulador o dispositivo; iOS exige un Mac o una build de EAS |
| `pnpm lint` | ESLint (incluye reglas de pureza del motor) |
| `pnpm typecheck` | TypeScript estricto en todo el monorepo |
| `pnpm test` | Tests unitarios de motor, tokens y lógica de la app (141) |
| `pnpm test:e2e` | Tests de navegador con Playwright (36: 18 × escritorio y móvil). Levanta el servidor por sí solo |
| `pnpm format` / `pnpm format:check` | Prettier |
| `pnpm validate` | `lint` + `typecheck` + `test` + `format:check` |
| `pnpm build:web` | Exporta la web de producción a `apps/game/dist` |

Variables de entorno: **ninguna es necesaria** en esta fase (`.env.example` solo reserva nombres futuros).

### Decisiones de entorno (léelas si algo falla)

- **Mueve el repositorio a una ruta corta y fuera de OneDrive** (por ejemplo `C:\dev\cly`). Esta carpeta está en una ruta de ~160 caracteres dentro de OneDrive: Windows limita las rutas a 260 caracteres y OneDrive intentará sincronizar decenas de miles de archivos de `node_modules`. Hoy funciona gracias a lo siguiente, pero es frágil.
- **pnpm 10, no 12.** pnpm 12 escribe archivos de estado dentro de `node_modules` y con esta ruta falla (`os error 3`) en cualquier `pnpm run`.
- **`nodeLinker: hoisted`** (`pnpm-workspace.yaml`): con el almacén aislado por defecto, pnpm genera rutas de más de 260 caracteres y Node no resuelve el `package.json` de Vite. Expo admite este modo.
- **Scripts de instalación bloqueados por defecto:** solo `esbuild` está autorizado.
- Si ves un aviso de `unrs-resolver` ignorado, es inofensivo.

## Qué hay hoy

**Funciona (verificado en web con Edge):**
- Portada con **JUEGOS INDIVIDUALES** y **CONCURSO COMPLETO**, sin login.
- Catálogo con las **13 modalidades**; solo *La cifra exacta* es jugable; las demás aparecen como «En preparación» y su ficha no tiene botón de jugar.
- Ficha de prueba con cómo se juega, tiempo del programa, reglas provisionales y dos modos: *con tiempo del programa* (cuenta atrás de 3 s y reloj de 0:40) y *sin presión*.
- **La cifra exacta:** seis fichas y objetivo; operaciones con fichas y resultados encadenables; deshacer y reiniciar; temporizador; confirmar; resultado validado; solución razonada paso a paso; repetir, siguiente ejercicio o volver al catálogo. Teclado físico: `+ − * /`, `Retroceso`, `Esc`, `Enter`.
- Concurso: elección de modo, configuración contra la IA (nombre, dificultad) y vista previa de las fases derivada del ruleset. **Sin partida.**
- Ejercicios reproducibles: la semilla va en la URL (`?semilla=…`).

**No existe todavía:** partida de concurso, IA, local/online, la llave, letras, duelos, desempate, final, especiales, perfil, ajustes, audio, háptica, persistencia, backend.

**No comprobado:** ejecución en iOS/Android (los bundles JS de ambos compilan con Metro/Hermes, nada más), VoiceOver/TalkBack, Safari/Firefox, la CI remota.

Detalle ticket a ticket en [`docs/TASKS.md`](docs/TASKS.md); desviaciones de UX en [`docs/UX_FLOWS.md`](docs/UX_FLOWS.md) §8.1; decisiones de reglas en [`docs/GAME_RULES.md`](docs/GAME_RULES.md) §1.1.

## Estructura

```text
apps/
  game/            Expo Router (web + iOS + Android): app/, src/components, src/features, src/adapters, e2e/
  api/             PLACEHOLDER (sin servicio)
  realtime/        PLACEHOLDER (sin servicio)
packages/
  numbers-engine/  AST, validador, aritmética racional exacta, solver, generador semillado
  game-engine/     ruleset versionado, sesión de cifras reproducible, puntuación, registro de 13 pruebas, secuencia de concurso
  design-tokens/   color, tipografía, espaciado, movimiento
docs/              documentación de producto y arquitectura
```

Los paquetes de dominio **no pueden importar React, Expo ni APIs del navegador**, ni usar `Date.now`, `Math.random` o `eval`: lo impone ESLint.

## Arquitectura v1.3

- **Cliente:** Expo + React Native + React Native Web + TypeScript; un proyecto, tres plataformas.
- **Navegación:** Expo Router.
- **Motor:** TypeScript puro, reproducible (misma semilla y reglas ⇒ mismo ejercicio y resultado), sin dependencias de interfaz.
- **Backend:** Node.js, API HTTP y servidor WebSocket autoritativo *(previsto, no implementado)*.
- **Datos:** PostgreSQL/Supabase; autenticación opcional *(previsto)*.
- **Distribución:** Expo EAS Build *(pendiente: cuenta, dispositivos y posible coste)*.
- **Motor gráfico:** **no usar Unity ni Godot** en el MVP (ADR-007). Next.js solo para web comercial/editorial opcional y separada.

## Documentos incluidos

| Documento | Finalidad |
|---|---|
| [`docs/ESPECIFICACION_FUNCIONAL.md`](docs/ESPECIFICACION_FUNCIONAL.md) | Funciones, pruebas, flujo y plataformas |
| [`docs/GAME_RULES.md`](docs/GAME_RULES.md) | Reglamento versionado y límites de lo verificado |
| [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) | Stack, monorepo (§4.1: estado real), servidor y contratos |
| [`docs/DESIGN.md`](docs/DESIGN.md) | Diseño de videojuego televisivo con identidad propia |
| [`docs/UX_FLOWS.md`](docs/UX_FLOWS.md) | Menús, catálogo de 13 pruebas, modos, wireframes y recorridos |
| [`docs/MOBILE_RELEASE.md`](docs/MOBILE_RELEASE.md) | Preparación de App Store y Google Play |
| [`docs/PLAN.md`](docs/PLAN.md) | Fases, hitos y criterios de cierre (§15: estado real) |
| [`docs/TASKS.md`](docs/TASKS.md) | Backlog y estado real del Sprint 1 |
| [`docs/ADR/ADR-007-EXPO-VS-UNITY.md`](docs/ADR/ADR-007-EXPO-VS-UNITY.md) | Decisión Expo frente a Unity y Godot |
| [`CLAUDE.md`](CLAUDE.md) | Instrucciones de desarrollo asistido |

## Estado legal y editorial

- Los premios son simulados, no dinero real.
- Los diccionarios y bancos de preguntas necesitan licencias y revisión editorial.
- No existe permiso implícito para comercializar una réplica fiel del programa.
- Los valores del reglamento etiquetados `[SECUNDARIA]` o `[PENDIENTE]` deben contrastarse. En cifras, las reglas de resultados intermedios y el umbral de aproximación siguen **sin verificar** y la interfaz lo indica.
- La carpeta todavía no es un repositorio git; no se ha hecho ningún commit.
