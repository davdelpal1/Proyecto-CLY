# ADR-007 — Motor de presentación y estrategia multiplataforma

**Estado:** ACEPTADA provisionalmente para v1.1  
**Fecha:** 21/10/2026  
**Responsable:** producto/desarrollo  
**Decisión:** **Expo + React Native Web**, sin Unity/Godot en la primera implementación.

## Contexto

El producto es un juego de concurso 2D de texto, operaciones matemáticas, fichas, pulsadores, temporizadores, marcador y preguntas editoriales. Debe funcionar en web, iOS y Android con IA rival, entrenamiento y multijugador por WebSockets. La lógica es altamente determinista y el render no necesita físicas, iluminación 3D ni escena persistente a 60 FPS.

## Comparación

| Criterio | Expo / React Native | Unity | Godot |
|---|---|---|---|
| iOS y Android | Sí, apps nativas con EAS | Sí, exportadores | Sí, exportadores |
| Navegador | React Native Web | Unity Web/WebGL | Export HTML5/Web |
| Menús, formularios, teclado y accesibilidad | Ventaja relevante | Exige trabajo específico | Exige trabajo específico |
| Efectos visuales y escenas complejas | Posible, con más límites | Gran ventaja | Gran ventaja |
| Lenguaje único con backend TS | TypeScript end-to-end | C# más contratos con TS | GDScript/C# más contratos con TS |
| Tamaño de descarga/inicio web | Habitualmente más favorable para interfaces | Puede ser más pesado | Depende de export y recursos |
| Curva de aprendizaje para este dominio | Menor si se conoce React/TS | Motor de juego completo | Motor de juego completo |
| Coste/licencia motor | Expo open source; EAS tiene costes variables | Condiciones y umbrales de licencia comercial | Código abierto MIT |

La tabla es una evaluación del proyecto, no una promesa de rendimiento. Unity y Godot **pueden** hacer el trabajo, pero sus principales ventajas no son críticas en esta versión.

## Motivos

1. Priorizar UX de concurso, accesibilidad, teclado, adaptabilidad e integración con cuentas/tiendas.
2. Unificar modelo, validador, solver y contratos con TypeScript.
3. Reducir las diferencias entre web y móvil, aceptando componentes específicos por plataforma cuando sean necesarios.
4. Crear desde la primera fase un prototipo instalable en Android/iOS, no un wrapper móvil improvisado al finalizar.
5. Integrar animaciones y sonido sin convertir todo el render en un motor de escenas.

## Consecuencias y límites

- El render universal no garantiza paridad visual absoluta. Las animaciones se verifican por plataforma y el rendimiento se mide en equipos reales.
- `shadcn/ui` es React DOM/web, no la librería principal para RN nativo. Diseño mediante tokens y componentes RN.
- Un proyecto Expo no implica publicar automáticamente en App Store ni Google Play: se requieren cuentas, firma, aprobación, privacidad y derechos comerciales.
- Una futura web corporativa puede usar Next.js en un proyecto independiente.
- IA/solver y autoridad del servidor no deben depender de Expo para facilitar una migración futura.

## Cuándo reabrir esta decisión

Evaluar Unity/Godot si aparece una dirección de producto con: plató 3D explorable, avatares con cinemáticas complejas, físicas, minijuegos de alta frecuencia, necesidades importantes de shaders/partículas o limitaciones medidas de rendimiento en RN que no puedan solventarse de forma razonable. No migrar por estética o preferencia abstracta.

## Alternativa descartada

Next.js + wrapper móvil (Capacitor): es válida para otras aplicaciones, pero aquí se prefiere crear UI nativa y web desde el inicio para disponer de distribución, controles y adaptaciones móviles propias.

## Referencias

- https://docs.expo.dev/router/introduction/
- https://docs.expo.dev/build/setup/
- https://docs.unity3d.com/6000.0/Documentation/Manual/system-requirements.html
- https://docs.godotengine.org/en/stable/about/faq.html
