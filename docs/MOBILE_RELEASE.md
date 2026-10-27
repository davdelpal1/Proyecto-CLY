# MOBILE_RELEASE — Preparación para App Store y Google Play

**Versión:** 1.2 — 26/10/2026  
**Alcance:** preparación desde el Sprint 1; publicación pública solo tras validación legal y de producto.

## 1. Estrategia de distribución

| Destino | Tecnología | Canal de primeras pruebas | Producto final |
|---|---|---|---|
| Web | Expo Web (React Native Web) | URL privada / entorno staging | Sitio público del juego |
| Android | Expo EAS Build | Build de desarrollo y Google Play Internal Testing | AAB en Google Play |
| iPhone/iPad | Expo EAS Build | Build de desarrollo, dispositivos y TestFlight | App Store |

**No confundir**: un juego que abre en Expo Go o en el navegador no es una app lista para tiendas. Se necesitan binarios firmados, perfiles, identificadores definitivos, políticas, revisión y pruebas de instalación.

## 2. Preparación técnica temprana

- [ ] Reservar nombre comercial propio (comprobar marcas y dominios), slug, icono y splash originales.
- [ ] Reservar `ios.bundleIdentifier` y `android.package` únicos, sin utilizar marca de RTVE.
- [ ] Configurar entornos development, preview y production; no incrustar secretos de backend en frontend.
- [ ] Integrar deep links/invitaciones (`https://.../join/<code>`) y navegación Expo Router.
- [ ] Validar carga en frío, retorno desde segundo plano, teclados, orientación, safe areas y VoiceOver/TalkBack.
- [ ] Probar almacenamiento local, credenciales seguras y reconexión del socket.
- [ ] Primeras builds Android/iOS al principio del proyecto, no al terminar el juego.
- [ ] Actualizaciones OTA: consultar reglas y límites vigentes; no usarlas para eludir revisión de cambios sustanciales.

## 3. iOS / App Store

- [ ] Cuenta Apple Developer activa; comprobar precio/requisitos actuales en el portal oficial.
- [ ] App ID, firma, provisioning, certificados y configuración de EAS Build.
- [ ] Build de desarrollo probado en iPhone real; pruebas TestFlight con usuarios.
- [ ] Política de privacidad, información de tratamiento de datos, permisos y clasificación por edad.
- [ ] Preparar capturas, descripción comercial, soporte, datos de contacto y procedimiento de revisión.
- [ ] Comprobar requisitos de eliminación de cuenta dentro de la app, login y modalidades de compra según revisión actual.
- [ ] Verificar experiencia de juego completa, no simple web envuelta.
- [ ] Gate legal aprobado antes de publicación pública.

## 4. Android / Google Play

- [ ] Cuenta de Google Play Console, verificación de identidad y requisitos actuales para cuenta nueva.
- [ ] Paquete Android estable, aplicación firmada, AAB, Play App Signing.
- [ ] Pruebas internas y cerradas según requisitos vigentes del perfil de desarrollador.
- [ ] Ficha, capturas, iconos, política de privacidad, clasificación y declaración de seguridad de datos.
- [ ] Comprobar nivel de API objetivo exigido en la fecha de subida y compatibilidad de SDK nativo.
- [ ] Probar Android gama media, teclados diferentes, gesto de volver, reanudación y notificaciones solo si necesarias.
- [ ] Gate legal aprobado antes de publicación pública.

## 5. Multijugador y tiendas

- [ ] Sesión y reconexión tras cerrar y reabrir la app (el juego no debe asumir sockets eternos).
- [ ] Reloj oficial en servidor; medir deriva de UI con red lenta.
- [ ] No aceptar puntuaciones competitivas o premios virtuales informados únicamente por el cliente.
- [ ] Control de abuso, privacidad de perfiles, apodos y contenido generado por usuarios si se habilita chat.
- [ ] Modo invitado funcional sin forzar registro cuando no haga falta.

## 6. Comercialización y pagos futuros

- [ ] Revisión profesional de derechos de reproducción del formato del programa: comprobar autorización/licencia o sustituir diseño y mecánicas protegibles según asesoramiento.
- [ ] Revisar licencias del diccionario, fuentes, sonidos, iconos, contenido y herramientas.
- [ ] Definir si se venderá juego completo, expansión, suscripción o artículos cosméticos.
- [ ] Si hay bienes digitales consumidos dentro de iOS/Android, revisar exigencias de compra integrada, obligaciones fiscales, precio y restablecimiento de compras por territorio.
- [ ] No ofrecer dinero real, apuestas ni bote canjeable sin análisis regulatorio independiente.
- [ ] Política de privacidad y derechos RGPD/LOPDGDD, eliminación de cuenta y soporte a menores.

## 7. Gates mínimos para declarar aptitud para lanzamiento

1. No existen errores bloqueantes en web, iOS y Android.
2. La partida completa se puede terminar en iOS y Android reales sin PC.
3. Las salas online funcionan entre distintos sistemas operativos y gestionan reconexiones.
4. El banco de preguntas supera revisión editorial, de seguridad y licencias.
5. Política de privacidad, soporte, edad, borrado de cuenta y pago (si aplica) están validados.
6. Aprobación expresa de la revisión jurídica de marca/formato. Sin ella, detener publicación de la réplica fiel.
7. Builds firmadas pasan los canales de prueba oficiales y revisión de metadatos.

## 8. Fuentes oficiales a consultar antes de cada publicación

- Expo EAS Build: https://docs.expo.dev/build/setup/
- Expo EAS Submit: https://docs.expo.dev/submit/introduction/
- App Store Review Guidelines: https://developer.apple.com/app-store/review/guidelines/
- App Store Connect: https://developer.apple.com/app-store-connect/
- Google Play Console ayuda: https://support.google.com/googleplay/android-developer/
- Google Play Policies: https://play.google.com/about/developer-content-policy/

Los requisitos de tiendas, costes y políticas cambian; no tratar este archivo de octubre de 2026 como sustituto de las condiciones vigentes el día del lanzamiento.

## 9. Experiencia de producto exigida en tiendas (v1.2)

- [ ] Inicio con **Juegos individuales** y **Concurso completo** accesibles sin registro para modos locales.
- [ ] Catálogo navegable con todas las pruebas independientes previstas; no anunciar como jugables modalidades sin implementar.
- [ ] Concurso contra IA completo y funcional; los modos online aparecen solamente cuando sean operativos.
- [ ] UI, iconos, sonido, vídeos y capturas de pantallas propios; no aparentar que el juego es oficial de RTVE o Pasapalabra.
- [ ] Probar el flujo Inicio → Juegos → Cifras → Resultado → Repetir y el flujo Inicio → Concurso → Final en web, Android e iOS.
- [ ] Revisar que las fichas de tienda no prometen premios reales ni licencia televisiva inexistente.
