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

## Estructura

- `src/gl/shaders.ts` — vertex/fragment shader de emulación de película.
- `src/gl/FilmRenderer.ts` — wrapper WebGL que sube cada frame como textura.
- `src/gl/presets.ts` — parámetros de cada filtro.
- `src/hooks/useFilmCamera.ts` — acceso a cámara + loop de render + captura.
- `src/components/` — carrusel de filtros, filmstrip de capturas.
