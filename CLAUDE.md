# ReportaCR

Plataforma comunitaria para reportar y consultar en un mapa en vivo cortes de servicio público en Costa Rica (luz, agua, internet, gas u otro). Sin necesidad de cuenta. Objetivo: que se comparta por redes sociales para que cualquier persona en el país pueda reportar y consultar cortes cerca de su zona.

## Estructura del repo

```
www/                 ← código fuente de la app (HTML/CSS/JS puro, sin build step). Este es el "source of truth".
  index.html          ← toda la app: mapa, lógica de reporte, votos, UI
  manifest.json        ← manifest de PWA
  sw.js                ← service worker (cachea el shell, nunca los datos de Supabase)
  privacy.html          ← política de privacidad (requerida por App Store / Google Play)
  icon-192.png, icon-512.png, apple-touch-icon.png ← ícono de la app (pin + rayo, ver logo)
  favicon.ico, favicon.svg, favicon-16.png, favicon-32.png ← favicon del navegador

android/              ← proyecto nativo generado por Capacitor (Android Studio). No editar a mano salvo AndroidManifest.xml / recursos nativos.
ios/                  ← proyecto nativo generado por Capacitor (Xcode). No editar a mano salvo Info.plist / assets.
capacitor.config.json ← configuración de Capacitor (appId: cr.reportacr.app)
docs/                 ← documento de plan de arquitectura y guía de lanzamiento (.docx)
README.md             ← instrucciones de build/publicación
```

## Cómo se edita este proyecto

1. Todo el código vive en `www/index.html` (un solo archivo, sin framework, sin paso de build). Edítalo directamente.
2. Después de cualquier cambio en `www/`, sincroniza los proyectos nativos:
   ```
   npx cap copy
   ```
   Esto copia `www/` dentro de `android/app/src/main/assets/public` y `ios/App/App/public`.
3. Para probar la web: sirve `www/` con cualquier servidor estático, ej. `npx serve www` o `python3 -m http.server 8080 -d www`.
4. Para probar Android: abre la carpeta `android/` en Android Studio y dale Run.
5. Para probar iOS: abre `ios/App/App.xcworkspace` en Xcode (necesita Mac) y dale Run.

## Backend (Supabase)

- Proyecto: `ReportaCR`, ref `mrncqbhoojhrbqchogfz`, org `Aurevo`.
- URL: `https://mrncqbhoojhrbqchogfz.supabase.co`
- La anon key pública ya está embebida en `www/index.html` (es pública por diseño, protegida por RLS — no es un secreto).
- Tablas: `reports`, `confirmations`. Funciones RPC: `submit_report(...)`, `cast_vote(...)`.
- Toda escritura pasa por las funciones RPC (RLS bloquea inserts directos a las tablas). Ver el documento `docs/ReportaCR_Plan_de_Plataforma.docx` para el modelo de datos completo.
- Si necesitas cambiar el esquema, usa el dashboard de Supabase (supabase.com/dashboard) o el CLI de Supabase (`supabase login`, `supabase link --project-ref mrncqbhoojhrbqchogfz`) — esta sesión de Claude Code no tiene la conexión MCP a Supabase que sí tenía Cowork, así que los cambios de base de datos aquí requieren tu propia sesión autenticada.

## Diseño

Tema claro estilo Google Maps: barra superior tipo buscador, chips de filtro por servicio, toggle Mapa/Lista, bottom sheets deslizables (reportar, detalle de un pin, menú de info). Paleta: azul `#1A73E8`, fondo `#F1F3F4`, colores por servicio (luz `#F9AB00`, agua `#1A73E8`, internet `#8430CE`, gas `#D93025`, otro `#5F6368`).

## Reglas de producto a mantener

- No requerir cuenta para reportar (fricción cero es el pilar del proyecto).
- Nunca eliminar el aviso de que es una plataforma comunitaria independiente, no oficial del ICE/CNFL/ESPH/JASEC/AyA.
- Cualquier escritura a la base debe seguir pasando por las funciones RPC, nunca insertar directo a las tablas desde el cliente.

## Pendiente (ver docs/ para detalle completo)

- Suscripciones por cantón/distrito con alertas.
- Panel de "rendición de cuentas" por proveedor.
- Mapa de calor histórico.
- Publicación real en App Store y Google Play (requiere cuentas de desarrollador — ver `docs/ReportaCR_Guia_de_Lanzamiento.docx`).
