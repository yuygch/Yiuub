export interface FilterPreset {
  id: string
  label: string
  exposure: number
  contrast: number
  saturation: number
  temp: number
  tint: number
  fade: number
  shadowTint: [number, number, number]
  highlightTint: [number, number, number]
  vignette: number
  grain: number
  grainSize: number
  halation: number
}

// Tuned against the reference set: dark car-interior candids, crushed
// blacks with a warm lift, cool ambient light vs. warm skin, heavy
// vignette and visible 35mm-style grain.
export const PRESETS: FilterPreset[] = [
  {
    id: 'noir',
    label: 'Noir',
    exposure: -0.15,
    contrast: 1.22,
    saturation: 0.78,
    temp: 0.02,
    tint: -0.02,
    fade: 0.35,
    shadowTint: [0.92, 0.98, 1.08],
    highlightTint: [1.08, 0.99, 0.9],
    vignette: 0.75,
    grain: 0.07,
    grainSize: 1.6,
    halation: 0.18,
  },
  {
    id: 'golden',
    label: 'Golden',
    exposure: 0.05,
    contrast: 1.08,
    saturation: 0.92,
    temp: 0.18,
    tint: 0.02,
    fade: 0.22,
    shadowTint: [1.02, 0.96, 0.85],
    highlightTint: [1.1, 1.0, 0.8],
    vignette: 0.45,
    grain: 0.05,
    grainSize: 1.8,
    halation: 0.28,
  },
  {
    id: 'mono',
    label: 'Mono',
    exposure: -0.05,
    contrast: 1.28,
    saturation: 0.0,
    temp: 0.0,
    tint: 0.0,
    fade: 0.18,
    shadowTint: [1.0, 1.0, 1.0],
    highlightTint: [1.0, 1.0, 1.0],
    vignette: 0.6,
    grain: 0.09,
    grainSize: 1.4,
    halation: 0.05,
  },
  {
    id: 'fade',
    label: 'Fade',
    exposure: 0.1,
    contrast: 0.88,
    saturation: 0.7,
    temp: 0.06,
    tint: 0.01,
    fade: 0.5,
    shadowTint: [1.0, 0.97, 0.93],
    highlightTint: [1.02, 1.0, 0.95],
    vignette: 0.3,
    grain: 0.04,
    grainSize: 2.0,
    halation: 0.15,
  },
  {
    id: 'classic',
    label: 'Classic',
    exposure: 0.0,
    contrast: 1.12,
    saturation: 0.85,
    temp: 0.08,
    tint: 0.0,
    fade: 0.15,
    shadowTint: [0.97, 1.0, 1.04],
    highlightTint: [1.05, 1.0, 0.92],
    vignette: 0.5,
    grain: 0.055,
    grainSize: 1.7,
    halation: 0.12,
  },
]

export const DEFAULT_PRESET_ID = 'noir'
