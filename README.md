# ReportaCR — MVP funcional (web + app nativa iOS/Android)

App para reportar y ver en un mapa en vivo cortes de luz, agua, internet, gas u otro servicio en Costa Rica. Sin necesidad de cuenta. Diseño rediseñado con estética tipo Google Maps (tema claro, barra superior tipo buscador, chips de filtro, bottom sheets deslizables, vista de mapa y de lista).

## Qué ya está funcionando

- Base de datos real en Supabase (proyecto `ReportaCR`, org `Aurevo`), con PostGIS.
- Tablas `reports` y `confirmations`, con triggers que actualizan conteos y el estado (`reportado` → `verificado` → `resuelto`, o `descartado` si la comunidad lo desmiente).
- Función `submit_report`: si ya existe un reporte del mismo servicio a menos de 500 m y últimos 30 min, no duplica el pin — suma una confirmación al existente.
- Función `cast_vote`: para los botones "Sigue sin servicio" / "Ya volvió" / "No es cierto".
- Límite de frecuencia (máx. 3 reportes cada 10 min por dispositivo) y geo-cerca a Costa Rica.
- RLS activado: lectura pública, escritura únicamente vía las funciones (no se puede insertar directo a la tabla).
- Bucket de Storage `report-photos` para las fotos opcionales.
- Realtime activado: el mapa se actualiza solo cuando entra un reporte nuevo, sin recargar la página.
- Interfaz rediseñada: tema claro, barra superior flotante tipo Google Maps, toggle Mapa/Lista, chips de filtro por servicio, bottom sheets con "swipe to dismiss" para reportar y ver el detalle de cada pin, panel de estadísticas en el menú (☰).
- Manifest + service worker para instalación como PWA, y ahora también **proyecto nativo de Capacitor** para compilar como app real de iOS y Android.

Probado extremo a extremo directamente contra la base de datos (inserción, fusión de duplicados, votos, cambio de estado). La base quedó limpia, sin datos de prueba.

## Cómo probarlo ya mismo

1. Abre la carpeta con los archivos (`index.html`, `manifest.json`, `sw.js`, `icon-192.png`, `icon-512.png`).
2. Sirve la carpeta con cualquier servidor estático, por ejemplo:
   ```
   npx serve .
   ```
   o
   ```
   python3 -m http.server 8080
   ```
3. Ábrelo en el celular (mismo WiFi) o publícalo (ver abajo) para probar geolocalización real.

## Cómo publicarlo para compartir por redes

La forma más simple y gratuita:

1. Sube estos archivos a un repositorio en GitHub.
2. Conéctalo a **Vercel** o **Netlify** (plan gratuito) — despliegue en un clic, sin necesidad de configurar nada más porque es HTML/JS puro.
3. Consigue un dominio corto (ej. `reportacr.com` o similar) y apúntalo al despliegue.
4. Comparte el link — el botón de WhatsApp ya está integrado para que cada reporte se pueda reenviar fácilmente.

## Base de datos (para referencia)

- Proyecto Supabase: `ReportaCR` (`mrncqbhoojhrbqchogfz`)
- Tablas: `reports`, `confirmations`
- Funciones: `submit_report(...)`, `cast_vote(...)`
- Storage: bucket `report-photos` (público)

---

## App nativa iOS + Android (Capacitor)

Usamos **Capacitor**: toma la misma web app y la empaca en un proyecto Android (Android Studio) y un proyecto iOS (Xcode) reales, listos para compilar e instalar en el celular o subir a las tiendas. Todo el código de la app vive en `www/` — es el mismo `index.html` de la versión web.

Este es el contenido del zip `ReportaCR_App_Nativa.zip`:

```
capacitor.config.json   ← configuración de la app (nombre, id, colores)
package.json / package-lock.json
www/                    ← el código de la app (HTML/CSS/JS)
android/                ← proyecto nativo de Android Studio, listo para abrir
ios/                    ← proyecto nativo de Xcode, listo para abrir
```

Ya configuré permisos de ubicación y cámara en ambos proyectos (`AndroidManifest.xml` e `Info.plist`), y activé Realtime + PostGIS en la base para que funcione igual que la versión web.

### Importante: qué pude hacer yo y qué falta hacer en tu máquina

Este entorno donde trabajo es Linux y no tiene acceso a los servidores de Android (`dl.google.com`) ni de Gradle, así que no puedo descargar el Android SDK ni compilar el `.apk` desde aquí — lo intenté y confirmé que está bloqueado por la red del sandbox. Tampoco existe una Mac aquí para compilar iOS (Apple lo exige siempre). Lo que sí dejé listo es el proyecto completo, correctamente configurado, para que compilar sea cuestión de un clic en tu computadora.

### Compilar Android (gratis, sin Mac)

1. Instala **Android Studio** (gratis): https://developer.android.com/studio
2. Descomprime el zip y abre la carpeta `android/` como proyecto en Android Studio.
3. Espera a que descargue el SDK automáticamente la primera vez (lo hace solo).
4. Presiona ▶️ Run para probarlo en un emulador o en tu celular conectado por USB.
5. Cuando quieras publicarlo: Build → Generate Signed Bundle/APK, y sigue el asistente para subirlo a **Google Play Console** (cuenta de desarrollador: pago único de $25).

### Compilar iOS (necesitas Mac, o una alternativa en la nube)

1. Si tienes Mac: instala **Xcode** (gratis, App Store), abre `ios/App/App.xcworkspace`, conecta tu iPhone o usa el simulador, y presiona ▶️ Run.
2. Si NO tienes Mac, puedes compilar igual usando un servicio de CI en la nube que sí tiene Mac, sin comprar una:
   - **Codemagic** (tiene plan gratuito pensado justo para esto — conecta tu repo y compila iOS en la nube).
   - **GitHub Actions** con el runner `macos-latest` (gratis con límites, requiere algo de configuración).
   - **Ionic Appflow** (de pago, pero muy simple si ya usas Capacitor).
3. Para publicarlo en la **App Store** necesitas una cuenta de Apple Developer ($99/año), sin importar cuál de las opciones de arriba uses.

### Actualizar la app después de cambios

Cada vez que edites `www/index.html` (o cualquier archivo dentro de `www/`), corre desde la carpeta del proyecto:
```
npx cap copy
```
y vuelve a compilar en Android Studio / Xcode.

## Pendiente para siguientes fases (ver el documento de plan)

- Suscripciones por cantón/distrito con alertas.
- Panel público de "rendición de cuentas" por proveedor (tiempo de resolución).
- Mapa de calor histórico.
- Insignia de reportero verificado (teléfono, opcional).
- Publicación real en App Store y Google Play (requiere las cuentas de desarrollador mencionadas arriba).

## Nota de seguridad

El linter de Supabase reporta (como advertencia, no error) que la extensión PostGIS vive en el esquema `public` — es el comportamiento estándar al habilitarla así y no representa un riesgo real para este proyecto; se puede mover a un esquema separado más adelante si se quiere estar más estricto.
