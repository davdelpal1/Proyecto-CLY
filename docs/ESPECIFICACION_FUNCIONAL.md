# ESPECIFICACIÓN FUNCIONAL — Juego de cifras y palabras

**Versión:** 1.2 (experiencia de juego orientada a pruebas independientes y concurso completo)  
**Fecha:** 26 de octubre de 2026  
**Estado:** especificación para desarrollo; las reglas indicadas como *pendientes* no se consideran certificadas por RTVE.  
**Nombre interno:** Proyecto CLY (nombre técnico provisional; no utilizar comercialmente «Cifras y Letras» sin permiso).  
**Objetivo:** recrear la experiencia mecánica del concurso actual de RTVE, tanto en solitario como con dos competidores humanos, con las cautelas de licencias pertinentes.

## 1. Visión y objetivos

Desarrollar un videojuego multiplataforma, con una aplicación universal Expo/React Native para navegador, iOS y Android, que permita participar en un concurso completo inspirado en la edición de RTVE de 2024-2026: prueba de llave, cinco rondas de cifras, cinco rondas de letras, cuatro duelos de seis modalidades posibles y final temática de doce palabras. Incluir también dos pruebas especiales para eventos.

El sistema debe tener un **único motor determinista de reglas** consumido por la IA rival, el modo local y el multijugador online. Las reglas y su puntuación se versionan mediante `rulesetVersion`; los cambios a un perfil no modifican partidas anteriores.

### Contrato UX prioritario (referencia funcional Pasapalabra)

La experiencia de uso debe recordar a un **videojuego oficial de concurso televisivo** por su ritmo, composición amigable, cartas de pruebas, marcadores, transiciones y calidad de feedback. La app oficial de *Pasapalabra* se utiliza como referencia de **organización de modos** (pruebas sueltas / programa / duelo), sin reutilizar elementos protegidos. Identidad de interfaz y contenido originales.

La portada mostrará **dos acciones prioritarias y persistentes**:
1. **JUEGOS INDIVIDUALES** — entrar a cualquier prueba sin rival ni rondas previas y repetir cuantas veces se quiera.
2. **CONCURSO COMPLETO** — jugar la secuencia completa contra IA; local y online se añaden según fases sobre el mismo orquestador.

Los flujos, las 13 tarjetas previstas, la separación entre entrenamiento y competición y los wireframes están en [`UX_FLOWS.md`](UX_FLOWS.md).

### Objetivos medibles
- Permitir practicar **todas** las pruebas aisladamente, sin registro obligatorio ni rival, con repetición inmediata y explicación, y disputar por separado un concurso de principio a fin.
- Validar respuestas matemáticas y léxicas sin intervención humana en el flujo normal.
- Igualar la lógica de turnos, duración y puntuaciones del perfil televisivo comprobado.
- Reproducir partidas con registros de eventos y semillas/control de contenido.
- Entregar multijugador online fiable, con servidor autoritativo y reglas antiabusos.
- Preparar un producto original en marca, diseño y contenido, para posible monetización.
- Entregar desde fases tempranas builds instalables de prueba en Android e iOS, sin que el primer lanzamiento público de tiendas sea requisito de la beta técnica.
- Compartir experiencia de juego entre web, iOS y Android, incluidos enlaces de invitación y partidas cruzadas.

### No objetivos del primer lanzamiento
- Emitir un programa real, utilizar la cabecera, logotipos, músicas o voces de RTVE.
- Entregar premios reales o concursos de azar con dinero; los botes son simulados.
- Distribuir preguntas extraídas de emisiones o bases de datos propietarias sin licencia.
- Implementar idiomas distintos del español de España en la primera versión.
- Dos aplicaciones móviles independientes con motores de reglas distintos: habrá una sola app universal Expo con adaptaciones por plataforma.

## 2. Perfiles de juego

| Perfil | Jugadores | Integridad competitiva | Propuesta |
|---|---|---|---|
| **Juegos individuales (acceso principal)** | 1 | No clasificado | Cada una de 11 modalidades habituales (incluye desempate) y 2 especiales: opción con/sin reloj, solución comentada, repetir |
| Concurso vs IA | Humano + IA | Local | Partida completa con IA de dificultad regulable |
| Dos jugadores local | 2 | Local | Turnos compartidos, dos dispositivos opcionales para evitar ver respuestas |
| Sala privada online | 2 | Validada por servidor | Invitación, sala, desconexión y reanudación limitada |
| Matchmaking online | 2 | Clasificado | Futuro posterior a la beta de salas privadas |
| Desafío diario | 1 / comparación asíncrona | Clasificado | Futuro posterior a la publicación estable |
| Especial | 2 o 2 equipos | Según modo | Incluye Descifra y Palabra Maestra, como perfil alternativo |

**Decisión inicial:** implementar la interfaz y los contratos de partida pensando ya en dos jugadores, aunque los primeros hitos jugables sean entrenamiento y contra IA. El catálogo de juegos individuales es **P0**, no un extra de beta ampliada.

### 2.1 Selección de experiencia desde Inicio

| Paso | Juegos individuales | Concurso completo |
|---|---|---|
| Seleccionar | Catálogo de todas las pruebas | Contra IA / dos jugadores local / sala online |
| Configurar | Prueba, dificultad disponible, reloj con o sin límite | Rival, nombres, dificultad IA y perfil televisivo |
| Jugar | Una instancia independiente sin contrincante obligatorio | Orquestador de fases; rival e información de puntos |
| Terminar | Respuesta, explicación, repetir o siguiente | Ganador, desglose, final, revancha |
| Reglas | Motor compartido, overrides de práctica explícitos | Ruleset referencial versionado, sin modificar libremente la competición |

La misma prueba debe ejecutar su validador en cualquiera de los dos recorridos. No presentar una práctica individual como «concurso completo».

## 3. Usuarios y roles

- **Visitante:** inicia entrenamiento o partida local sin registro; progreso local limitado.
- **Jugador registrado:** historial, estadísticas, favoritos, desafíos, salas online y clasificación.
- **Editor de contenidos:** crea, revisa, publica y retira preguntas con trazabilidad.
- **Administrador:** gestiona reportes, versiones de reglas, estadísticas agregadas y moderación.
- **Sistema/IA rival:** usuario virtual que actúa bajo las mismas restricciones de tiempo y visibilidad.

## 4. Flujo general del concurso

1. Configuración: modo, nombres, dificultad IA, perfil de reglas, accesibilidad.
2. Asignación de jugadores: campeón y aspirante (o posiciones A/B si no existe carrera de campeón).
3. **La llave:** oportunidad inicial de ganar un comodín para la final.
4. **Primera ronda:** diez pruebas clásicas, cinco de cifras y cinco de letras, alternadas de acuerdo con el perfil televisivo; cada tirada determina sus datos antes de iniciar el cronómetro.
5. **Duelos:** cuatro retos rápidos seleccionados entre seis modalidades, valorados en 10, 20, 30 y 50 puntos según la posición. Se resuelven con pulsador.
6. **Desempate:** si los puntos acumulados empatan después de los cuatro duelos.
7. **Gran final:** entra exclusivamente el ganador de la competición; doce palabras de un mismo tema en tres minutos; la llave, si está disponible, funciona como comodín.
8. **Resultados:** vencedor, puntuación, aciertos, ganancias virtuales, bote virtual, estadísticas y repetición/revancha.

El orden preciso del primer tipo de ronda clásica, la alternancia de elección de vocales y otras variantes editorialmente variables se definen en `GAME_RULES.md` y se fijarán mediante verificación de una muestra de programas.

### Máquina de estados
`CREATED → READY → KEY → CLASSIC_ROUND[1..10] → DUEL[1..4] → (TIEBREAK?) → FINAL → COMPLETED`.

Estados transversales: `PAUSED` (solo modos donde se permita), `DISCONNECTED`, `RECONNECTING`, `FORFEITED`, `ABORTED`. Ningún cliente puede saltarse estados. Una partida completa registra cada transición con sello de tiempo del servidor.

## 5. Requisitos funcionales — sistema general

### RF-GEN-001: inicio y configuración
**Como** jugador, **quiero** elegir entre una prueba suelta o un concurso, **para** empezar sin registrarme.  
**Criterios de aceptación:** botones destacados «Juegos individuales» y «Concurso completo» en Inicio; el primero abre el catálogo; el segundo abre selector IA/local/online; tiempos de referencia por defecto en concurso; confirmación antes de abandonar; el invitado no entra a rankings competitivos. No mostrar pantalla de login como requisito para entrenar.

### RF-GEN-007: catálogo de todos los juegos individuales
**Como** jugador, **quiero** seleccionar cualquier prueba independientemente de la competición, **para** practicar solo un tipo de ejercicio.  
**Criterios de aceptación:** 11 tipos del concurso habitual (incluido desempate), 2 tipos especiales al completar beta ampliada, pantalla propia por tipo, tutorial, práctica con/sin reloj, sin IA obligatoria, resultados detallados y repetición inmediata. Las modalidades aún en desarrollo se etiquetan honestamente como no disponibles en prototipos.

### RF-GEN-008: experiencia audiovisual de concurso
**Como** jugador, **quiero** sentir que participo en un concurso de televisión, **para** que resulte emocionante y comprensible.  
**Criterios de aceptación:** pantalla de presentación, nombre de ronda, marcador continuo, reloj destacado, transiciones propias y breves, feedback de puntos y final; todos los efectos originales y con opción de silencio/reducir movimiento. No crear escenas 3D ni introducir Unity como requisito.

### RF-GEN-002: cronómetro uniforme
Cada prueba recibe duración, instante de inicio y deadline; el cliente muestra una interpolación local pero **el servidor arbitra** en partidas conectadas. Al finalizar el plazo, se congelan entradas válidas. Latencia, pausa y reconexión tienen reglas explícitas.

### RF-GEN-003: puntuación y auditoría
El resultado se calcula en un servicio independiente de la UI. Cada concesión de puntos incluye motivo, respuesta validada, ruleset y versión de contenido. No aceptar marcadores enviados por clientes.

### RF-GEN-004: contenido versionado
Toda pregunta identifica `puzzleId`, `type`, `locale`, `difficulty`, `revision`, `status`, `sourceLicense` y `answerPolicy`. Una pregunta nunca se modifica silenciosamente tras ser utilizada en un match clasificado.

### RF-GEN-005: feedback pedagógico
Entrenamiento: mostrar solución y por qué la respuesta era inválida. Competitivo: ocultar explicaciones y soluciones hasta que todos concluyan la prueba; guardar métricas.

### RF-GEN-006: perfil reglamentario
Configurable y auditable: duración de rondas, puntos, límites de vocales, selección de duelos, política de respuesta, llave, final, desempate, modalidad de especiales. `RTVE_2026_REFERENCE` es perfil de implementación, **no sello de oficialidad**.

## 6. Especificación de las pruebas

### 6.1 La llave — RF-KEY
- **Entrada:** definición redactada editorialmente, respuesta canónica, variantes permitidas, número de letras y primera letra para pista.
- **Jugabilidad:** ambos compiten con pulsador durante 30 s; a los 15 s se revela una letra conforme a la referencia estudiada; quien pulsa puede introducir/decir (futuro voz) su respuesta.
- **Resultado:** acierto da un comodín al jugador; error o expiración no conceden comodín conforme al perfil provisional.
- **Interfaz:** contador, definición grande, huecos, indicador de pista, dos pulsadores, estado de propiedad de llave.
- **Validaciones:** impedir doble pulsación, detener/continuar tiempo según política versionada y no mostrar la solución hasta cerrar la ronda.
- **Aceptación:** quien obtuvo la llave y gana el concurso puede usarla una única vez en la final; quien no gana no la traslada al otro.

### 6.2 La cifra exacta — RF-NUM
- **Entrada:** seis fichas numéricas y objetivo de tres cifras (100–999); generador semillado con dificultad/calidad.
- **Objetivo:** aproximarse lo máximo posible al objetivo, idealmente alcanzarlo.
- **Operaciones:** +, −, ×, ÷; cada ficha como máximo una vez, con los duplicados tratados como fichas distintas. No hace falta usar las seis.
- **Formato de interacción:** calculadora de fichas que construye un árbol de operaciones y conserva rastro; posibilidad de corregir pasos; respuesta definitiva se confirma antes del deadline.
- **Resultado referencial:** 10 puntos si la mejor solución válida es exacta; si no hay exactas, 7 puntos a la mejor aproximación válida; empates puntuables para ambos. Verificar casos fronterizos contra episodios.
- **Motor:** evaluar expresión sin `eval`, validar consumo de fichas, divisiones exactas y restricciones de intermedios que fije el reglamento; obtener y explicar al menos una solución óptima.
- **Aceptación:** rechazo de 2 usos de la misma ficha; distinguir valores numéricos duplicados, comprobar `+ − × ÷`, bloquear entradas tardías, registrar delta respecto al objetivo.
- **Pendiente:** confirmar del programa el comportamiento exacto para operaciones intermedias no enteras/no positivas y el procedimiento televisivo de consignación.

### 6.3 La palabra más larga — RF-WORD
- **Entrada:** una tirada de diez fichas de letras, con 3–6 vocales elegidas por quien tiene turno, según perfil de referencia.
- **Objetivo:** construir una palabra válida en español de cinco o más letras, usando cada ficha a lo sumo una vez.
- **Interacción:** selección de letras o teclado; vista de ficha disponible; confirmar antes de 30 s; tildes normalizables para consumo, pero la validez lingüística se conserva.
- **Resultado referencial:** un punto por letra para la mejor palabra válida; si ambos empatan en longitud válida, ambos puntúan; una forma menos larga no recibe puntos en esa ronda.
- **Diccionario:** léxico con derechos compatibles y política editorial específica (flexiones, formas conjugadas, plurales, nombres propios y enclíticos). Un corrector ortográfico por sí solo **no** basta para reproducir el arbitraje del DLE.
- **Aceptación:** «CASA» no cumple el mínimo; una letra repetida más veces de las disponibles invalida; entradas con tilde tienen comparación consistente; los fallos dicen la razón al terminar.

### 6.4 Cuatro duelos — RF-DUEL
**Reglas comunes:** 30 s por duelo y puntuación secuencial de 10/20/30/50. Primera pulsación válida reserva la respuesta; si hay acierto gana puntos el pulsador; si falla o no contesta dentro del plazo autorizado, los puntos van al rival en el perfil provisional. Si nadie pulsa, cero puntos. La IA virtual pulsa según una política parametrizada, no instantáneamente en todas las dificultades. Empate final: prueba de desempate.

**Catálogo (seis tipos para cuatro puestos):**

1. **3 en 1:** una definición y longitud de palabra; revelar pistas de letras en momentos programados, progresivamente. Respuesta editorial única o variantes explícitas.
2. **Doble palabra:** diez fichas; dos respuestas concretas que, combinadas, emplean las diez letras de acuerdo con una pista. Validación de ambas y de sus multiplicidades.
3. **2 para 2:** dos pistas con dos respuestas relacionadas con las diez fichas; al menos una respuesta de diez letras en el perfil documentado de forma secundaria. **Pendiente:** confirmar si comparten/consumen letras en conjunto y el formato exacto.
4. **Doble sentido:** una palabra que satisface dos definiciones diferentes; se presenta longitud, sin revelar letras según la referencia secundaria.
5. **El cálculo:** operación matemática con agrupaciones/paréntesis para resolver mentalmente; aceptar número final y validar con parser seguro.
6. **Esprint numérico:** versión rápida de cifra exacta, con limitación de tiempo y respuesta mediante pulsador. **Pendiente:** concretar reglas de demostración y si las fichas visibles y los límites aritméticos coinciden completamente.

**Caso especial de UX:** el juego digital no puede comprobar una respuesta oral como el plató. Por tanto, tras pulsar se abre una ventana breve y autoritativa de respuesta; en modo competitivo se define un límite técnico configurable, sujeto a validación del reglamento y pruebas de usabilidad.

### 6.5 Desempate — RF-TIE
Presentar un juego rápido de palabra preparada con letras, primero en pulsar y responder correctamente gana. Si falla, gana el otro. El contenido, las letras disponibles y los fallos técnicos se auditan. **Pendiente:** precisar la duración de desempates sucesivos y el formato exacto en emisión.

### 6.6 Gran final — RF-FINAL
- **Entrada:** pack editorial con un mismo tema, doce palabras objetivo, y para cada una un anagrama o panel de diez fichas con longitud de la solución.
- **Duración:** 180 s globales; el cronómetro continúa durante avances y pases.
- **Mecánica:** resolver palabra, pasar a la siguiente o usar llave disponible; tras visitar los 12 paneles, volver a los no resueltos siguiendo el orden del perfil.
- **La llave:** se consume una vez y resuelve automáticamente un panel elegible.
- **Resultado económico:** premio **virtual**, nunca monetario real; perfil provisional: 100 unidades por cada palabra hasta 10, 1.500 si se aciertan 11 y bote virtual si se consiguen 12. La progresión histórica del bote varió, así que el crecimiento debe configurarse, sin presentarlo como cifra oficial inmutable.
- **Aceptación:** doce respuestas únicas auditadas; llave no duplica recompensa; «pasar» no marca acierto; se corta a los 180 s; el contador se conserva mientras se cambia de panel; ciclo de pendientes correcto.

### 6.7 Pruebas especiales — RF-SPECIAL
No forman parte de todas las emisiones regulares. Módulo de juegos especiales habilitable por campaña:
- **Descifra:** preguntas con respuestas numéricas desordenadas; turnos alternos en parejas/equipos; la fuente RTVE de 2024 documenta dos minutos y un punto por acierto para esa edición.
- **La palabra maestra:** palabra semilla de ocho letras en especiales de 2025; formar el máximo de palabras válidas de longitud mínima cinco. Atención: en los especiales de 2024 el mínimo documentado era cuatro, por lo que se necesitan `SPECIAL_2024` y `SPECIAL_2025` como reglas versionadas.
- **Aceptación:** puntuación, reloj, número de turnos y composición de equipos parametrizables; no mezclar reglas de ediciones distintas.

## 7. Interfaz y pantallas

### RNF-MOB — Requisitos específicos multiplataforma

- **RF-PLAT-001 — Universal:** un mismo proyecto Expo/React Native atiende web, Android e iOS. El motor de juego es TypeScript puro, sin React, DOM ni Expo.
- **RF-PLAT-002 — Navegación:** Expo Router con rutas compartidas y deep links para invitaciones; el enlace a una sala permite abrir app o web conforme a la plataforma.
- **RF-PLAT-003 — Interacción:** toda prueba soporta pantalla táctil y, cuando corresponde, teclado físico, teclado virtual y lector de pantalla.
- **RF-PLAT-004 — Dispositivos:** layout accesible de teléfono vertical, tablet y desktop; safe areas, variación de tamaño de texto, teclado y diferencias de plataforma.
- **RF-PLAT-005 — Entrenamiento offline:** práctica local con pack descargado/embarcado autorizado y persistencia, con resultados sin validez de ranking competitivo hasta arbitraje server.
- **RF-PLAT-006 — Online cruzado:** participantes en iOS, Android o web podrán disputar la misma sala con la misma versión de reglas; el servidor arbitra puntuaciones, pulsadores y tiempo.
- **RF-PLAT-007 — Ciclo de vida:** minimizar, cerrar o perder conexión no concede tiempo extra y provoca recuperación validada por servidor.
- **RF-PLAT-008 — Publicación preparada:** configuraciones de ID Android/iOS, arte original, permisos mínimos, privacidad y builds con Expo EAS desde las primeras fases.
- **RF-PLAT-009 — Interfaz comercial propia:** no usar logotipos, audiovisuales ni disposición copiada del concurso RTVE sin licencia. El sistema visual está en `docs/DESIGN.md`.
- **RF-PLAT-010 — QA:** comprobar la vertical slice en web y al menos una build de desarrollo Android e iOS, indicando si algún dispositivo no se ha podido probar.

Los criterios de diseño y publicación se detallan en `docs/DESIGN.md` y `docs/MOBILE_RELEASE.md`. No es necesario instalar Unity o Godot; véase `docs/ADR/ADR-007-EXPO-VS-UNITY.md`.


| ID | Pantalla | Función y elementos |
|---|---|---|
| UI-01 | Inicio | **Juegos individuales** y **Concurso completo** como dos CTA protagonistas; ajustes/perfil secundarios |
| UI-02 | Catálogo de juegos | Todas las pruebas por tipo y categoría, ficha Cómo se juega, dificultad y reloj |
| UI-02B | Configuración de concurso | Contra IA, local u online; dificultad del rival y ajustes de experiencia |
| UI-02C | Resultado individual | Solución, explicación, tiempo, repetir, siguiente prueba y volver al catálogo |
| UI-03 | Lobby | Jugadores, estado listo, enlace/código de sala, reconexión |
| UI-04 | Llave | Definición, huecos, pista, pulsadores, reloj |
| UI-05 | Cifras | Seis números, objetivo, calculadora de fichas, pasos, respuesta final |
| UI-06 | Letras | 10 fichas, vocales, editor de palabra, confirmar |
| UI-07 | Duelos | Pregunta/elementos, ambos marcadores, pulsador, tiempo y posesión |
| UI-08 | Desempate | Letras, pulsador, input y resultado |
| UI-09 | Gran final | Tema, 12 indicadores, panel, «pasar», llave, reloj de 3 min |
| UI-10 | Resultados | Marcador, monedas ficticias, respuestas, estadísticas, revancha |
| UI-11 | Perfil | Historial, logros, dificultad, datos, privacidad |
| UI-12 | Editor | Crear, previsualizar, validar, revisar y publicar packs |
| UI-13 | Administración | Moderación, gestión de versiones, auditoría |

### Directrices UX
- El diseño debe sentirse **como app de videojuego de concurso**, con tarjetas de modos, animaciones, feedback, narrativa de rondas y sonidos originales. No como formulario escolar.
- «Juegos individuales» debe ofrecer **un camino de navegación distinto de «Concurso completo»**, pero ambos comparten tablero/motor por tipo de prueba.
- Usar `docs/UX_FLOWS.md` como contrato para la pantalla de inicio, el catálogo de 13 modalidades y las transiciones de competición.
- Mostrar información matemática y verbal en tamaños accesibles y contraste WCAG AA.
- Navegable por teclado; foco visible; pulsador accesible; no depender solo del color.
- Diseño adaptable con componentes React Native: panel principal y controles en móvil; vista amplia en escritorio; safe areas y teclado virtual.
- Evitar que el teclado virtual tape el contador o el botón de enviar.
- Diferenciar señales sonoras configurables, con opción de silencio y movimiento reducido.
- Implementar overlays/transiciones únicamente fuera del tiempo activo para no penalizar al usuario.
- En multijugador no mostrar respuestas del rival hasta que la lógica de la ronda lo permita.

## 8. Rival IA

- **Tres niveles iniciales:** principiante, normal y experto, más dificultad adaptable opcional fuera de clasificatorias.
- **Números:** solver exacto proporciona candidatos; una función de habilidad escoge una solución apropiada y una latencia humana plausible.
- **Palabras:** índice de anagramas ofrece respuestas posibles; motor elige según nivel y vocabulario frecuente.
- **Duelos:** motor de decisión configurable para tiempos y tasas de éxito; no accede a información que no esté revelada en la ronda.
- **Final:** simulada solo cuando el modo de juego o pruebas automatizadas lo requieran; el final televisivo habitual lo juega el ganador.
- **Equidad:** registrar dificultad, semilla y parámetros en toda partida local.

## 9. Multijugador online

### RF-MP-001 — Sala privada
Crear sala con código aleatorio de duración limitada; anfitrión comparte; otro jugador entra; ambos aceptan; servidor selecciona pack y comienza una cuenta atrás conjunta.

### RF-MP-002 — Tiempo y pulsador
El cliente publica intención de pulsar y nunca adjudica puntos. El servidor decide sobre secuencia y deadline. Registrar RTT para observabilidad y evaluar tolerancia de latencia; no aceptar timestamps del cliente como verdad.

### RF-MP-003 — Respuestas ocultas
Antes de la revelación, el servidor proporciona solo el material visible. La respuesta correcta, soluciones matemáticas y decisiones de puntuación permanecen en backend.

### RF-MP-004 — Desconexión
Reentrada con token de sesión, margen breve configurable, snapshot de estado y replay de eventos. Regla explícita de derrota/abandono si no regresa; no pausar el tiempo de competición silenciosamente.

### RF-MP-005 — Emparejamiento futuro
Matchmaking, MMR/Elo ajustado, penalizaciones por abandono, historial competitivo y protección anti-cheat. No bloquear el primer MVP por estas funciones.

### RF-MP-006 — Sala local con dispositivos separados
En local compartido, ofrecer modo pantalla compartida para práctica y futuro emparejamiento LAN/online de dos dispositivos cuando las respuestas deban ser privadas.

## 10. Cuentas, estadísticas y accesibilidad

- Inicio como invitado; cuentas mediante autenticación verificada para histórico y ranking.
- Perfil con victorias, derrotas, máximos, precisión, distancia media de cifras, longitud de palabras, tiempos de reacción, rachas.
- Filtros de histórico por tipo de prueba, modo y ruleset.
- Privacidad: alias público, datos personales mínimos, eliminación y exportación del perfil.
- Comodines y ayudas en entrenamiento, marcados como no aptos para ranking.
- Accesibilidad: teclado, lector de pantalla, contraste, reducción de animación, alternativas a audio.

## 11. Operaciones editoriales

### Gestión de preguntas
**DRAFT → AUTO_CHECKED → REVIEWED → PUBLISHED → RETIRED.** El editor revisa que la respuesta sea única o tenga alternativas explícitas, que no tenga ambigüedades, que el nivel de dificultad sea adecuado, que no incluya material copiado sin autorización y que la licencia esté documentada.

Cada pack completo incluye: llave (1), cinco pruebas de cifras, cinco de letras, cuatro duelos elegibles, desempate (1+ de reserva), final temática (1×12) y metadatos de versión. Los contenidos se pueden reutilizar en entrenamiento, pero hay que prevenir repetición inmediata en partidas contra personas.

### Capacidad editorial para beta
Lote **propuesto**, no cantidad oficial: 100 llaves, 300 problemas de cifras, 300 tiradas de letras, 80 preguntas por modalidad de duelo (480 en total), 100 desempates y 30 finales completas (360 respuestas revisadas). Empezar con un pack de humo reducido en desarrollo e ir alcanzando el lote de beta mediante curación.

## 12. Requisitos no funcionales

| ID | Exigencia | Meta inicial y modo de verificación |
|---|---|---|
| RNF-01 | Consistencia | Misma entrada + reglas/versiones → mismo resultado en 100% tests deterministas |
| RNF-02 | Rendimiento | Respuesta fluida en móvil de gama media, sin congelación de entradas durante el reloj; medir tiempo de carga del juego en web y cold start en las builds nativas |
| RNF-03 | Latencia | Medición de RTT y errores de sincronización; objetivos fijados tras piloto de red real |
| RNF-04 | Seguridad | Controles por roles, rate limit, respuestas no expuestas, validación server-side |
| RNF-05 | Fiabilidad | Reanudación segura tras reconexión sin duplicar acciones ni premios |
| RNF-06 | Observabilidad | Trazas con matchId, reglas, tipo de evento y motivo de rechazo |
| RNF-07 | Calidad | Unit, property-based, integración y E2E; críticos ≥90% cobertura lógica |
| RNF-08 | Accesibilidad | Auditar WCAG 2.2 AA en flujos públicos principales |
| RNF-09 | Privacidad | Minimización de datos, consentimiento para analítica no esencial, derechos RGPD |
| RNF-10 | Costes | Alertas de gasto de base de datos, WS, almacenamiento y proveedores |

## 13. Integraciones y dependencias externas

1. Diccionario morfológico español con licencia compatible; candidato: diccionario español LibreOffice/Hunspell, sujeto a validación de alcance y licencia; no equivale automáticamente al DLE.
2. Banco de contenido editorial propio y herramientas de QA; evitar scraping masivo del DLE o RTVE sin permiso.
3. Analítica de producto con configuración de privacidad.
4. Servicios de hosting, base de datos y backend de WebSockets.
5. Asesoría sobre propiedad intelectual, marcas y condiciones de explotación, antes de publicar perfil exacto del concurso.

## 14. Criterios de aceptación para la beta funcional (v1.2)

- La portada permite escoger inmediatamente «Juegos individuales» o «Concurso completo», sin cuenta obligatoria.
- Las 11 modalidades habituales son practicables individualmente en la beta completa; las 2 especiales se añaden en la beta ampliada para un catálogo total de 13. Cada práctica permite repetir y visualizar solución tras el cierre.
- Una partida completa llega de La llave al resultado final, sin intervención de administrador.
- Las **11 modalidades/segmentos** principales están implementadas: llave, cifras, letras, seis duelos, desempate y final; el módulo especial añade otras dos pruebas.
- Un usuario puede jugar contra IA en tres dificultades y disputar una sala privada online.
- Todas las respuestas del modo competitivo se validan en servidor.
- La respuesta más rápida válida en duelos se determina por servidor, no por reloj del cliente.
- La ronda final gestiona los doce paneles, pases y llave de forma correcta.
- Los problemas de números tienen solución o dificultad verificada y registro del solver.
- Los contenidos verbales publicados han superado validación editorial y licencias.
- Tests de regresión por versión de reglas y de contenido con partidas reproducibles.
- Vertical slice comprobada en navegador, Android e iOS con builds de desarrollo; en beta, completar concurso vs IA en los tres sistemas.
- Invitación de sala y partida completa cruzada entre dos plataformas distintas.
- Instalación y pruebas internas nativas sin implicar permiso automático de publicación en tiendas.
- No se incorporan nombres, material audiovisual ni premios reales protegidos sin autorización.

## 15. Asuntos abiertos (para cerrar antes del lanzamiento)

| ID | Pregunta | Responsable sugerido | Momento límite |
|---|---|---|---|
| OPEN-01 | Régimen de licencia del formato completo, nombre y marca | Legal/negocio | Antes de comercializar; desde Sprint 0 |
| OPEN-02 | Orden y selección exactos de las 10 rondas clásicas en 2026 | Producto/QA | Sprint 1 |
| OPEN-03 | Reglas intermedias y prueba de cálculo de cifra exacta | QA/motor | Sprint 2 |
| OPEN-04 | Políticas ortográficas/morfológicas idénticas al arbitraje del programa | Editorial/QA | Sprint 2 |
| OPEN-05 | Mecánica 2 para 2 y esprint, tiempos de respuesta al pulsar | QA | Sprint 3 |
| OPEN-06 | Penaltis, duración y empate de duelos | QA | Sprint 3 |
| OPEN-07 | Premios virtuales exactos, evolución del bote y restricciones llave | Producto/QA | Sprint 4 |
| OPEN-08 | Condiciones de uso de diccionarios, cuestiones de nombres propios | Legal/editorial | Sprint 2 |
| OPEN-09 | Modelo de monetización y jurisdicciones objetivo | Negocio | Beta |
| OPEN-10 | Capacidad de prueba en iPhone real/macOS, cuentas de desarrollo y firma iOS | Desarrollo | Sprint 1 |
| OPEN-11 | Sistemas de compra digital por tienda, analítica, privacidad y clasificación de edad | Negocio/legal | Antes de publicación |
| OPEN-12 | Estilo de animación y compatibilidad de componentes Expo/React Native Web | Diseño/desarrollo | Sprint 1 |

## 16. Trazabilidad de fuentes (revisadas 26/10/2026)

**Benchmark de organización de videojuegos de concursos (NO licencia de diseño):**
- Videojuego oficial *Pasapalabra*, descripción de pruebas individuales, modalidad programa y duelos: https://momentumgames.io/games/pasapalabra
- Presentación pública por Antena 3 (31/07/2023): https://www.antena3.com/programas/pasapalabra/lanza-app-oficial-que-permite-disfrutar-movil-concurso-lider-espana_2023073164c798ccbcaee00001b362b7.html


**Confirmaciones directas de RTVE:**
- Página del concurso: https://www.rtve.es/play/videos/cifras-y-letras/
- Sinopsis de prueba inicial, rondas, duelos y final: https://www.rtve.es/play/videos/cifras-y-letras/programa-108/16198549/
- Nota RTVE sobre 30 s de llave y final de 3 min/12 palabras: https://www.rtve.es/rtve/20241105/cifras-letras-entrega-esta-semana-mayor-bote-la-2-rtve/16316882.shtml
- Episodio 2026 para contraste de continuidad: https://www.rtve.es/play/videos/cifras-y-letras/programa-526/17248375/
- Especiales 2024 y prueba Maestra mínima 4 letras: https://www.rtve.es/rtve/20241223/cifras-letras-celebra-navidad-dos-especiales-solidarios-miticos-concursantes/16383962.shtml
- Especiales 2025 y prueba Maestra mínima 5 letras: https://www.rtve.es/rtve/20251204/cifras-letras-celebrara-navidad-tres-especiales-solidarios-artistas-concursantes-iconicos-la2-rtve/16844957.shtml

**Referencias secundarias (por verificar en emisiones):**
- https://es.wikipedia.org/wiki/Cifras_y_letras (número de rondas, modalidades de duelos, tiempos y puntuación de algunas pruebas; no sustituye reglamento oficial).

**Legales y diccionarios:**
- Referencia al pronunciamiento del Tribunal Supremo sobre formato El Rosco, 2026: https://www.iberley.es/jurisprudencia/sentencia-civil-tribunal-supremo-sala-lo-civil-19-5-26-1840746982
- Licencias del diccionario español LibreOffice: https://github.com/LibreOffice/dictionaries/blob/master/es/README_hunspell_es.txt
