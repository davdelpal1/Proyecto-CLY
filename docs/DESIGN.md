# DESIGN — Sistema visual y experiencia multiplataforma

**Versión:** 1.3 — 27/10/2026  
**Estado:** dirección de producto aprobada; arte final y marca por diseñar. **Primera implementación (web):** tokens en `packages/design-tokens` y componentes en `apps/game/src/components` (`Button`, `NumberTile`, `OperatorButton`, `Countdown`, `ScoreBoard`, `StepList`, `MainModeCard`, `StatusBadge`, `Panel`…). Un solo tema oscuro; tema claro, tipografía con licencia, audio y háptica **sin hacer**. La marca de la portada son tres fichas «C L Y» provisionales.  
**Ámbito:** Expo web/iOS/Android. **Referencia experiencial:** la sensación de app de concurso del videojuego oficial *Pasapalabra*, **sin copiar su diseño**. Véase `UX_FLOWS.md`.

## 1. Concepto visual

Construir un **videojuego de concursos**, no una herramienta de ejercicios académicos. Debe tener energía, espectáculo, recompensas visuales por aciertos y una experiencia con ritmo de programa de TV, sin sacrificar legibilidad de textos/números ni tiempos de reacción.

Lo que tomamos del benchmark: menús intuitivos para juegos aislados, entrada a programa completo, paneles de prueba muy claros, reloj grande, feedback instantáneo, ranking/historial futuro y continuidad entre rondas. Lo que **no tomamos**: identidad gráfica, nombre, logotipos, mascota, paleta exacta, tipografías reconocibles, jerarquías visuales copiadas píxel por píxel, iconos, audios, animaciones concretas o texturas.

## 2. Dos recorridos prioritarios

**A. JUEGOS INDIVIDUALES:** catálogo agrupado de las 13 modalidades previstas; ficha por prueba con Jugar con tiempo / Practicar sin tiempo / Cómo se juega; partida sin rival; resultado con Repetir y Siguiente reto.

**B. CONCURSO COMPLETO:** elección de IA/local/online; presentación breve; llave → 10 rondas clásicas → 4 duelos → desempate condicional → final de 12 palabras → resultados. El jugador siempre sabe fase, marcador, turno y tiempo restante.

Inicio prioriza dos tarjetas grandes **Juegos individuales** y **Concurso completo**. La sala online va dentro de concurso (y opcionalmente en acceso secundario). Evitar que monetización, login o ranking tapen la entrada a ambos modos.

## 3. Identidad artística propia (propuesta sujeta a aprobación)

- **Carácter:** inteligente, competitivo, vibrante, moderno, accesible y familiar.
- **Paleta sugerida:** fondo antracita/marino muy oscuro, acentos turquesa brillante y coral/naranja cálido, superficies claras de alto contraste; **no replicar el azul dominante ni la composición del menú oficial de Pasapalabra**. Definir equivalentes semánticos `background`, `surface`, `accent`, `success`, `warning`, `danger` y temas claros/oscuros si se acuerda.
- **Tipografía:** licencia comercial, palabras/números muy visibles; reloj con tabulares.
- **Fichas:** botones de número y letra grandes, estados selected/consumed/disabled y animación original breve.
- **Animaciones:** apertura de ronda, revelar resultado, avance entre fases, cambio de puntuación, victoria; no usar animaciones que alteren temporizadores. Respetar movimiento reducido.
- **Audio y háptica:** sonido original de selección, aviso de reloj, puntuación y celebración, con mute independiente de haptics.
- **Gráfica:** geometrías y fondos abstractos propios; no simular un plató identificable sin licencia.

## 4. Pantallas necesarias

| Pantalla | Información principal | CTA principal |
|---|---|---|
| Inicio | Logotipo propio, acceso a juegos individuales y concurso | Jugar prueba / Concurso |
| Catálogo de juegos | Agrupación, 13 modalidades (11 habituales y 2 especiales), estado, duración, descripción | Abrir prueba |
| Ficha de prueba | Qué hay que hacer, ejemplo, dificultad, reloj | Practicar / Jugar con tiempo |
| Prueba individual | Tablero/enunciado, control de respuesta, cronómetro opcional | Comprobar |
| Resultado individual | Correcto/incorrecto, tiempo, explicación, otra solución | Repetir / Siguiente |
| Configurar concurso | Contra IA/local/online, rivales, perfil de reglas | Empezar concurso |
| Presentación / transición | Nombre ronda, progreso y marcador | Continuar / Saltar |
| Llave | Definición, pista progresiva, reloj y estado de llave | Responder / Buzzer según modo |
| Cifra exacta | Objetivo grande, 6 fichas, pasos de cálculo | Confirmar |
| Palabra más larga | 10 fichas, elección vocales/consonantes, composición | Confirmar |
| Duelo | Pista o cálculo, buzzer/entrada, turno, reloj y marcador | Pulsar / Responder |
| Desempate | Pista de desempate y tiempo | Responder |
| Gran final | 12 paneles, pista activa, pasar, reloj | Responder / Pasar |
| Resultados concurso | Ganador, puntos, desglose, final, premios virtuales | Revancha |
| Sala privada | Crear/unirse, código, READY, red y conexión | Empezar |
| Perfil/Ajustes/Ayuda | Historial, accesibilidad, sonido y cuenta | Guardar |

**Contrato gráfico:** `PuzzleScreen` tiene un shell visual coherente pero variantes `TRAINING` y `CONTEST`. Evitar un componente con 30 flags; usar composición de HUD, Board, Controls y RoundFeedback.

## 5. Componentes del sistema de diseño

`GameShell`, `MainModeCard`, `GameCatalogCard`, `TestRulesSheet`, `GameHeader`, `StageProgress`, `Countdown`, `ScoreBoard`, `NumberTile`, `LetterTile`, `ExpressionComposer`, `WordComposer`, `BuzzerButton`, `AnswerFeedback`, `ResultsPanel`, `TransitionOverlay`, `ConnectivityStatus`, `AccessibleDialog`.

- Todas las fichas admiten teclado físico/móvil y lectura accesible.
- En entrenamiento no renderizar marcador enemigo ficticio, ni prompt de buzzer artificial cuando solo existe una respuesta.
- Las animaciones funcionan **a partir** de eventos del motor; nunca determinan quién gana o cuándo acaba el reloj.
- `packages/design-tokens` unifica colores, tipografía, medidas, sombras y motion. Usar primitives React Native, variantes específicas por plataforma cuando sean necesarias.

## 6. Layout móvil, tablet y web

### Móvil vertical (principal)

1. Safe area + cabecera con título, salida y cronómetro.
2. Tablero/pista en área central, todo el texto visible.
3. Controles grandes y botón de acción accesible cerca del pulgar, nunca bajo el teclado.
4. Marcador compacto solo en concurso; minimizar paneles secundarios durante el tiempo activo.
5. Transiciones compactas, reversibles o saltables fuera del reloj de prueba.

### Tablet y desktop

- Tablero centrado con ancho máximo; marcador/etapas en panel lateral, sin distraer.
- Teclado y ratón soportados; hover no sustituye feedback táctil.
- Mantener consistencia de mecánicas entre pantalla grande y móvil, no un juego diferente.

### Web y desktop

- Chrome, Safari y Firefox; navegación teclado/Tab y lector de pantalla.
- El diseño responsive no depende de dimensiones de un iPhone concreto.
- No introducir librerías exclusivas del navegador en código compartido con Expo nativo.

## 7. Mecánicas de feedback y sonido

- Inicio de prueba: nombre + instrucción de una línea; cuenta atrás opcional fuera del límite oficial.
- Correcto: afirmación textual, efecto visual breve, puntos cuando aplique.
- Incorrecto: explicación **solo tras cierre permitido** por el motor, nunca filtrar respuestas en online.
- Restan 10 s: estado de urgencia mediante texto/señal visual; aviso sonoro opcional.
- Final de tiempo: entrada bloqueada con resultado inequívoco.
- Transición: marcador y siguiente prueba; botón Omitir animación.
- En móvil: háptica discreta, nunca imprescindible para conocer el estado.

## 8. Accesibilidad, rendimiento y pruebas

- Contraste suficiente, escalado texto, VoiceOver/TalkBack, foco, tamaños táctiles y reducción de movimiento.
- Pruebas en pantalla pequeña de iPhone, Android de gama media, tablet y desktop.
- Incluir estados: keyboard abierto, cronómetro = 0, usuario offline, reintento, reconexión y respuesta pendiente.
- Apuntar a fluidez de interacciones y transiciones, instrumentar rendimiento de dispositivos modestos antes de añadir efectos complejos.
- Test de descubrimiento: usuario nuevo encuentra las dos áreas de juego sin explicación y puede jugar Cifras en tres interacciones de menú.

## 9. Diseño y propiedad intelectual

Usar el benchmark de *Pasapalabra* como **objetivo de calidad de producto**, no como plantilla que se puede copiar. Tanto *Pasapalabra* como el programa de RTVE pueden tener elementos y derechos protegidos. El diseño final debe ser identificable como juego propio; para comercializar una réplica sustancial del formato televisivo, estudiar licencia/acuerdo o una alternativa jurídicamente validada.

Referencias:
- App oficial Pasapalabra — https://momentumgames.io/games/pasapalabra
- Lanzamiento y modos — https://www.antena3.com/programas/pasapalabra/lanza-app-oficial-que-permite-disfrutar-movil-concurso-lider-espana_2023073164c798ccbcaee00001b362b7.html
- Programa RTVE — https://www.rtve.es/play/videos/cifras-y-letras/
- Flujos detallados, wireframe y criterios UX — `UX_FLOWS.md`.
