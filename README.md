# FilmCam

Cámara web con look de película tipo Dazz Cam. El visor en vivo pasa por
un shader WebGL (`src/gl/shaders.ts`) que aplica en tiempo real exposición,
balance de blancos, contraste, split-toning, viñeta, halación y grano
animado, según el preset activo (`src/gl/presets.ts`: Noir, Golden, Mono,
Fade, Classic). La foto capturada es exactamente lo que se ve en el visor
(WYSIWYG), sin post-proceso aparte.

## Desarrollo

```bash
npm install
npm run dev
```

Requiere permiso de cámara del navegador (`getUserMedia`). El botón ⟲
alterna entre cámara frontal y trasera.

## iPhone

Dos formas de correrla en un iPhone, de menos a más esfuerzo:

1. **PWA (ya funciona, sin Mac):** abre el sitio desplegado en Safari →
   compartir → "Agregar a pantalla de inicio". Corre a pantalla completa,
   con ícono propio, sin las barras de Safari, respetando el notch/Dynamic
   Island (`env(safe-area-inset-*)` en `src/index.css`). Guardar una foto
   usa la Share Sheet nativa (`navigator.share`) con la opción "Guardar
   imagen", ya que no existe API web para escribir directo al carrete.
2. **App nativa (requiere Mac + Xcode):** el proyecto iOS ya está generado
   en `ios/` vía Capacitor. Para abrirlo:

   ```bash
   npm run build
   npx cap sync ios
   npx cap open ios
   ```

   Esto abre Xcode, donde puedes correrla en el simulador o un iPhone
   físico y, eventualmente, subirla a TestFlight/App Store. El identifier
   de la app es `com.filmcam.app` (`capacitor.config.ts`) — cámbialo antes
   de publicar.

## Estructura

- `src/gl/shaders.ts` — vertex/fragment shader de emulación de película.
- `src/gl/FilmRenderer.ts` — wrapper WebGL que sube cada frame como textura.
- `src/gl/presets.ts` — parámetros de cada filtro.
- `src/hooks/useFilmCamera.ts` — acceso a cámara + loop de render + captura.
- `src/components/` — carrusel de filtros, filmstrip de capturas.
