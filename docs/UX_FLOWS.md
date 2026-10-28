# UX_FLOWS — Navegación y experiencia de juego

**Versión:** 1.3 — 27/10/2026  
**Estado:** especificación funcional de UX, no diseño gráfico final. Implementación parcial en web: ver «Estado de implementación» al final.  
**Referencia de producto:** videojuego oficial *Pasapalabra* (Games Momentum / licencia de sus titulares) como **benchmark de claridad, ritmo y organización**, NO como colección de recursos reutilizables ni licencia para copiar el formato.  
**Referencias externas:** https://momentumgames.io/games/pasapalabra · https://www.antena3.com/programas/pasapalabra/lanza-app-oficial-que-permite-disfrutar-movil-concurso-lider-espana_2023073164c798ccbcaee00001b362b7.html

## 1. Decisión de producto innegociable

La navegación de primer nivel tiene **dos destinos protagonistas**:

1. **JUEGOS INDIVIDUALES:** lista de **todas las pruebas jugables una por una**, sin necesidad de disputar el concurso, elegir rival, registrarse o desbloquear otra prueba.
2. **CONCURSO COMPLETO:** secuencia televisiva completa contra rival IA y, progresivamente, contra otra persona en el mismo dispositivo o por internet.

**JUGAR CON AMIGOS** se presenta como opción destacada dentro de CONCURSO COMPLETO y, si interesa para descubrimiento, como acceso secundario en la portada; no sustituye al menú de dos destinos.

En el primer lanzamiento se admite entrenamiento sin cuenta. Un usuario nuevo debe entender la elección en menos de 5 s. Nunca mostrar tienda, tickets, energía ni anuncios antes de enseñar los dos modos: posibles modelos freemium serán decisión futura.

## 2. Mapa de navegación (Expo Router)

```text
/inicio
  ├── /juegos                                # catálogo de todas las pruebas
  │     └── /juegos/[prueba]                 # ficha: objetivo, cómo se juega, dificultad
  │           └── /sesion/entrenamiento     # motor común parametrizado por tipo
  │                 └── /resultado/entrenamiento
  │                       ├── repetir
  │                       ├── otro reto de la misma prueba
  │                       └── volver al catálogo
  ├── /concurso                             # pantalla de configuración
  │     ├── /concurso/contra-ia             # dificultad, nombre, ayudas, comenzar
  │     ├── /concurso/local                 # 2 jugadores, si disponible
  │     └── /concurso/online                # sala privada (fase posterior)
  │           ├── /sala/crear
  │           └── /sala/unirse
  │                └── /sala/[id]
  ├── /partida/[id]                         # orquestador por etapa
  │     └── /resultado/concurso             # ganador y resumen por fases
  ├── /perfil                               # opcional y nunca bloqueante
  ├── /ajustes
  └── /ayuda
```

**Regla de rutas:** la URL/ruta de juego decide la sesión y su contexto, pero NO duplica la validación de reglas. Reutilizar componentes `PuzzleScreen`, `Countdown`, `AnswerInput`, `ScoreBoard`, `Buzzer` y `ResultSummary` en ambos recorridos; el contexto decide modo, presencia de rival, transiciones y parámetros permitidos.

## 3. Inicio — jerarquía visual e información

```text
┌─────────────────────────────────────────┐
│  [LOGOTIPO PROPIO]            [⚙] [👤]  │
│                                         │
│      RETA TU MENTE                      │
│  Cifras, palabras y reflejos            │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │  🧠 JUEGOS INDIVIDUALES            │  │
│  │  Elige una prueba y practica      │  │
│  │                           [JUGAR] │  │
│  └───────────────────────────────────┘  │
│  ┌───────────────────────────────────┐  │
│  │  🏆 CONCURSO COMPLETO             │  │
│  │  Todas las rondas y gran final    │  │
│  │                      [COMENZAR]   │  │
│  └───────────────────────────────────┘  │
│                                         │
│   [Con amigos] [Cómo jugar] [Estad.]     │
└─────────────────────────────────────────┘
```

Es un **wireframe conceptual**. No reproducir coordenadas exactas, botones circulares, avatar, paleta, tipografía, ticketera, iconos, ilustraciones o fondo de *Pasapalabra*. El resultado debe ser inequívocamente nuestro producto.

## 4. Catálogo — JUEGOS INDIVIDUALES

**Acceso inmediato a todas las modalidades:**

| Grupo visible | Tarjeta | Disponibilidad prevista | Mecánica individual |
|---|---|---|---|
| Clásicas | La cifra exacta | MVP inicial | Obtener objetivo con 6 números, resolver y ver explicación |
| Clásicas | La palabra más larga | MVP inicial | Formar palabra válida y consultar mejores opciones |
| Apertura | La llave | Antes de beta completa | Definición y pista progresiva sin otro jugador; ganar acierto personal |
| Duelos | 3 en 1 | Antes de beta completa | Pistas/letras graduales sin necesidad de pulsar ante un rival |
| Duelos | Doble palabra | Antes de beta completa | Resolver dos palabras y mostrar corrección |
| Duelos | 2 para 2 | Antes de beta completa | Resolver dos palabras conforme al perfil verificado |
| Duelos | Doble sentido | Antes de beta completa | Resolver palabra común a dos definiciones |
| Duelos | El cálculo | Antes de beta completa | Cálculo mental contrarreloj |
| Duelos | Esprint numérico | Antes de beta completa | Resolver reto numérico rápido |
| Final | Gran final | Antes de beta completa | 12 palabras, pases y temporizador |
| Extra | Desempate | Antes de beta completa | Ejercicio individual de resolución rápida |
| Especiales | Descifra | Beta ampliada | Resolver la prueba según ruleset especial |
| Especiales | La palabra maestra | Beta ampliada | Resolver la prueba según ruleset especial |

**Resultado:** 11 tipos de entrenamiento correspondientes al concurso habitual si se cuenta el desempate; **13** incluyendo las dos pruebas especiales. No se incluyen cinco copias de cifras/letras: el usuario elige un *tipo* y el generador ofrece nuevos ejercicios.

Cada tarjeta debe mostrar **nombre, icono original, resumen de una línea, tiempo predeterminado, nivel disponible y botón «Jugar»**. Si un tipo aún no está programado en una build de desarrollo, mostrar «En preparación», no simular disponibilidad. En la versión beta completa el catálogo contendrá todos los tipos comprometidos.

La ficha de prueba ofrece:
- **Jugar con tiempo del programa** (perfil de referencia verificado).
- **Practicar sin presión** (sin reloj; no participa en rankings ni puntuaciones del concurso).
- Dificultad `Fácil`, `Normal` o `Difícil` **solo cuando el banco de contenido la soporte**.
- **Cómo se juega** (guía breve y un ejemplo original) y, tras finalizar, **solución razonada**.
- `Repetir` / `Siguiente ejercicio` / `Cambiar de prueba` tras cada partida.

**Nota de diseño:** en pruebas competitivas de pulsador, sustituir el rival por una acción «Responder», conservando el mismo contenido, reglas de validación y duración configurada; ningún componente debe exigir que existan dos jugadores para renderizar un duelo de entrenamiento.

## 5. Concurso completo — configuración y recorrido

```text
Inicio → Concurso completo
        → [1 jugador contra la IA] [2 jugadores local] [Online / sala privada]
        → Dificultad IA (si aplica) + nombres + breve reglamento
        → Pantalla de presentación (saltar opcionalmente)
        → LA LLAVE
        → RONDA CLÁSICA 1..10 (5 cifras + 5 letras)
        → 4 DUELOS (4 modalidades elegidas entre 6)
        → DESEMPATE (solo si corresponde)
        → FINAL DE 12 PALABRAS (la disputa el ganador)
        → RESULTADOS / RECOMPENSAS VIRTUALES / REVANCHA
```

- **Contra IA:** tres niveles; rival virtual sin conocer respuestas ocultas del jugador. Mostrar su puntuación y su participación sin pedir dos móviles.
- **Local:** diseño de entrega de turno que no revele respuestas; considerar dos dispositivos o modo alterno antes de prometer privacidad en uno solo.
- **Online privado:** lobby, invitación, listo, reloj y buzzer autoritativos; despliegue posterior, contratos previstos desde Sprint 1.
- **Reglas:** secuencia, duración y puntuaciones dependen de `rulesetId/revision` (no hardcode en UI). No confundir el número de fases con el número de tipos de ejercicio.
- **Transiciones televisivas originales:** cortinilla breve, nombre de prueba, participantes, puntos y progreso. Animación saltada en acceso rápido y con movimiento reducido; nunca consume tiempo de respuesta.

## 6. Pantalla de prueba — composición común

Móvil vertical: cabecera compacta (salir, ronda, reloj) → pregunta/tablero (zona central protagonista) → respuesta/acciones grandes → pie opcional con puntos/progreso. En escritorio: tablero central + marcador/progreso lateral, mismas reglas. Las soluciones solo aparecen cuando el motor confirma cierre.

**Entrenamiento:** contador opcional; sin marcador rival; botones `Comprobar`, `Pasar` cuando proceda; ayuda y solución tras terminar; botón de siguiente ejercicio inmediato.

**Concurso:** cabecera con nombres y marcador; reloj visible; turno/buzzer; cierre verificado; animación de puntos; botón `Siguiente ronda` o avance automático con opción de omitir.

**Estados obligatorios:** antes de empezar, cuenta atrás, interactivo, respuesta provisional, esperando validación, acertado, fallido, tiempo agotado, rival contestando, pausa permitida, desconectado y sesión finalizada. Nunca confiar en solo color para indicar aciertos/fallos.

## 7. Resultados y retención sin monetización invasiva

- **Individual:** acierto/error, tiempo, puntuación (si aplica), respuesta correcta y razonamiento, progreso personal, Repetir y Otra prueba.
- **Concurso:** ganador, puntuación comparada, desglose por diez pruebas clásicas + cuatro duelos, fase final, premios 100 % virtuales, revanche, ver respuestas al cerrar.
- **Continuidad:** última prueba practicada, última partida local terminada, favoritos y estadísticas opcionales; no obligar a crear cuenta.
- **Futuro P2:** desafíos diarios, ranking y colecciones de retos; no copiar mecánicas de tickets, monedas ni anuncios de otra app sin diseño de negocio propio.

## 8. Criterios de aceptación UX y pruebas

1. Desde abrir la app hasta empezar «La cifra exacta» hay **máximo tres interacciones intencionales** con onboarding ya visto: Inicio → Juegos → Cifras → Jugar (el último clic es inicio).
2. Nunca se exige jugar una ronda del concurso para entrar en una prueba individual.
3. No hay controles, marcadores ni turnos de rival en una práctica solo.
4. Las 13 modalidades tienen entrada identificable en catálogo en beta (especiales pueden llevar etiqueta de beta hasta su disponibilidad). Las 11 habituales funcionan plenamente en beta completa.
5. Desde el Inicio hasta comenzar concurso contra IA hay un flujo visible y sin registro obligatorio.
6. La partida de concurso recorre toda la secuencia configurada, incluida final y desempate condicional, sin saltarse pruebas.
7. Al terminar una prueba individual siempre se ofrece `Repetir` y `Volver a juegos`; no se fuerza reinicio de app.
8. `Cómo se juega` se puede abrir antes de cada modalidad y desde la pausa cuando procede.
9. La web admite teclado físico; iOS/Android admiten entrada táctil accesible. Cronómetro y confirmar no quedan tapados por teclado virtual.
10. Audio, haptics y motion se pueden ajustar; la información importante no depende de sonido/animación.
11. La interfaz es **un juego pulido**, con microinteracciones, efectos originales y cambios de escena, pero los derechos de RTVE/Pasapalabra no se dan por adquiridos.
12. Pruebas de usabilidad: 5 participantes nuevos pueden distinguir Juegos y Concurso sin explicación de un tercero; registrar confusiones.

## 8.1. Estado de implementación (27/10/2026)

**Rutas existentes** (`apps/game/app`): `/` (redirige a `/inicio`), `/inicio`, `/juegos`, `/juegos/[prueba]`, `/sesion/entrenamiento`, `/concurso`, `/concurso/contra-ia`, `/ajustes`. **No existen aún:** `/concurso/local`, `/concurso/online`, `/sala/*`, `/partida/[id]`, `/resultado/*`, `/perfil`, `/ayuda`.

**Desviaciones deliberadas respecto a este documento**

1. **El resultado individual no es una ruta.** `/resultado/entrenamiento` no existe: el resultado es un estado de `/sesion/entrenamiento`. Motivo: pasar el resultado por URL es frágil y recargar lo perdería. En su lugar, la **semilla viaja en la URL** (`?prueba=cifras&reloj=programa|libre&semilla=…&n=…`): `Repetir` conserva la semilla, `Siguiente ejercicio` pone una nueva y el ejercicio es enlazable. Si en el futuro se necesita una ruta de resultado, el panel (`ResultPanel`) ya es un componente independiente.
2. **CTA de Concurso.** El wireframe pone `[COMENZAR]`; como la partida no existe, la tarjeta dice `VER CONCURSO` con la etiqueta «Partida en preparación». No se muestra ningún botón que simule empezar.
3. **Accesos secundarios.** «Con amigos» y «Estadísticas» salen como etiquetas **no interactivas** «En preparación» (no hay perfil ni «Cómo jugar» global; este último está en cada ficha). «Ajustes» sí existe y es un botón en la cabecera de Inicio.
4. **Cuenta atrás.** Las pruebas con reloj arrancan con una cuenta atrás de 3 s con el ejercicio oculto (estado «cuenta atrás» de §6), de modo que se cumple «Inicio → Juegos → Cifras → Jugar» en tres interacciones (§8.1). Sin reloj se empieza directamente.
5. **Catálogo.** Todas las tarjetas abren su ficha; solo las disponibles muestran `JUGAR ›`. Las demás muestran «En preparación» y su ficha lleva un aviso en lugar de botones de jugar. El selector de dificultad no se muestra porque ningún banco lo soporta aún.
6. **Reglas provisionales visibles.** La ficha de Cifras lista las reglas marcadas [PENDIENTE] (ver `GAME_RULES.md` §1.1).

**Criterios de §8**

| # | Criterio | Estado |
|---|---|---|
| 1 | Máx. 3 interacciones hasta Cifras | ✅ web (E2E) |
| 2 | Nunca se exige jugar concurso | ✅ |
| 3 | Sin controles de rival en práctica | ✅ (E2E comprueba que no aparece «rival/IA/oponente») |
| 4 | 13 modalidades con entrada en catálogo | ✅; solo 1 de 11 habituales funciona (la beta completa exige las 11) |
| 5 | Inicio → Concurso contra IA sin registro | ✅ hasta la configuración; **no hay partida** |
| 6 | El concurso recorre toda la secuencia | ❌ no implementado |
| 7 | `Repetir` y `Volver a juegos` al terminar | ✅ (además `Siguiente ejercicio`) |
| 8 | `Cómo se juega` antes de cada modalidad | ✅ en la ficha; ❌ desde la pausa (no hay pausa) |
| 9 | Teclado físico en web / táctil en móvil | ✅ web; táctil probado a mano por el responsable en un móvil con Expo Go (sin registrar modelo ni sistema) |
| 10 | Audio, haptics y motion ajustables | ⚠ vibración activable en Ajustes y movimiento reducido (sigue al sistema); **no hay audio**. La vibración se ha implementado pero no he podido comprobarla en un dispositivo |
| 11 | Interfaz de videojuego pulida | ⚠ identidad propia y microinteracciones básicas; faltan transiciones de ronda y efectos |
| 12 | Prueba con 5 personas nuevas | ❌ pendiente |

## 9. Registro de riesgos sobre la referencia

- La **app oficial de Pasapalabra** demuestra una arquitectura de producto con juegos independientes, modo programa y enfrentamientos; no autoriza reproducir sus pantallas o activos visuales.
- La **referencia de Cifras y Letras (RTVE)** define las mecánicas que queremos investigar, pero su réplica comercial completa puede requerir licencia.
- Guardar este documento como **referencia funcional y de UX**, con identidad, contenido y presentación propios. Abrir revisión jurídica antes de distribución pública.
