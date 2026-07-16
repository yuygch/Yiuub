export const VERTEX_SRC = `
attribute vec2 a_position;
varying vec2 v_uv;
void main() {
  v_uv = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`

// Film-emulation fragment shader: exposure, white balance, contrast,
// shadow/highlight split-toning, saturation, vignette, halation and
// animated grain. Every knob is fed from a FilterPreset so the same
// pass drives both the live viewfinder and the full-res capture.
export const FRAGMENT_SRC = `
precision highp float;
varying vec2 v_uv;

uniform sampler2D u_tex;
uniform float u_time;
uniform float u_exposure;
uniform float u_contrast;
uniform float u_saturation;
uniform float u_temp;
uniform float u_tint;
uniform float u_fade;
uniform vec3  u_shadowTint;
uniform vec3  u_highlightTint;
uniform float u_vignette;
uniform float u_grain;
uniform float u_grainSize;
uniform float u_halation;
uniform float u_mirror;

float luma(vec3 c) { return dot(c, vec3(0.2126, 0.7152, 0.0722)); }

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

void main() {
  vec2 uv = v_uv;
  if (u_mirror > 0.5) uv.x = 1.0 - uv.x;

  vec3 color = texture2D(u_tex, uv).rgb;

  // Exposure
  color *= pow(2.0, u_exposure);

  // White balance (temp: blue<->orange, tint: green<->magenta)
  color.r += u_temp * 0.12;
  color.b -= u_temp * 0.12;
  color.g += u_tint * 0.08;

  // Halation: bloom highlights toward warm red/orange, film-style
  float hl = smoothstep(0.72, 1.0, luma(color));
  color += hl * u_halation * vec3(0.9, 0.35, 0.15);

  // Contrast around mid-grey
  color = (color - 0.5) * u_contrast + 0.5;

  // Fade: lift shadows toward a soft warm grey (crushed-black film look)
  vec3 fadeColor = vec3(0.12, 0.11, 0.1);
  float shadowMask = 1.0 - smoothstep(0.0, 0.5, luma(color));
  color = mix(color, fadeColor + color * 0.5, u_fade * shadowMask);

  // Split toning
  float l = luma(color);
  float shadowW = 1.0 - smoothstep(0.0, 0.55, l);
  float highW = smoothstep(0.45, 1.0, l);
  color = mix(color, color * u_shadowTint, shadowW * 0.5);
  color = mix(color, color * u_highlightTint, highW * 0.5);

  // Saturation
  float g = luma(color);
  color = mix(vec3(g), color, u_saturation);

  // Vignette
  vec2 centered = v_uv - 0.5;
  float dist = length(centered * vec2(1.15, 1.0));
  float vig = smoothstep(0.9, 0.15, dist);
  color *= mix(1.0, vig, u_vignette);

  // Animated film grain, stronger in shadows
  vec2 grainUv = floor(gl_FragCoord.xy / u_grainSize);
  float n = hash(grainUv + u_time);
  float grainAmt = u_grain * (0.5 + 0.5 * (1.0 - luma(color)));
  color += (n - 0.5) * grainAmt;

  color = clamp(color, 0.0, 1.0);
  gl_FragColor = vec4(color, 1.0);
}
`
