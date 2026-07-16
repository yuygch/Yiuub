import { VERTEX_SRC, FRAGMENT_SRC } from './shaders'
import type { FilterPreset } from './presets'

function compileShader(gl: WebGLRenderingContext, type: number, src: string): WebGLShader {
  const shader = gl.createShader(type)
  if (!shader) throw new Error('Unable to create shader')
  gl.shaderSource(shader, src)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const info = gl.getShaderInfoLog(shader)
    gl.deleteShader(shader)
    throw new Error(`Shader compile error: ${info}`)
  }
  return shader
}

/** Uploads a video/canvas frame as a texture and renders it through the
 * film-emulation fragment shader. One instance drives both the live
 * viewfinder canvas and the full-resolution still-capture canvas. */
export class FilmRenderer {
  private canvas: HTMLCanvasElement
  private gl: WebGLRenderingContext
  private program: WebGLProgram
  private texture: WebGLTexture
  private uniforms: Record<string, WebGLUniformLocation | null>
  private startTime = performance.now()

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas
    const gl = canvas.getContext('webgl', { premultipliedAlpha: false })
    if (!gl) throw new Error('WebGL not supported')
    this.gl = gl

    const vs = compileShader(gl, gl.VERTEX_SHADER, VERTEX_SRC)
    const fs = compileShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SRC)
    const program = gl.createProgram()
    if (!program) throw new Error('Unable to create program')
    gl.attachShader(program, vs)
    gl.attachShader(program, fs)
    gl.linkProgram(program)
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      throw new Error(`Program link error: ${gl.getProgramInfoLog(program)}`)
    }
    this.program = program
    gl.useProgram(program)

    const buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW,
    )
    const posLoc = gl.getAttribLocation(program, 'a_position')
    gl.enableVertexAttribArray(posLoc)
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0)

    const texture = gl.createTexture()
    if (!texture) throw new Error('Unable to create texture')
    this.texture = texture
    gl.bindTexture(gl.TEXTURE_2D, texture)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)

    const names = [
      'u_tex', 'u_time', 'u_exposure', 'u_contrast', 'u_saturation',
      'u_temp', 'u_tint', 'u_fade', 'u_shadowTint', 'u_highlightTint',
      'u_vignette', 'u_grain', 'u_grainSize', 'u_halation', 'u_mirror',
    ]
    this.uniforms = {}
    for (const name of names) {
      this.uniforms[name] = gl.getUniformLocation(program, name)
    }
  }

  resize(width: number, height: number) {
    if (this.canvas.width !== width || this.canvas.height !== height) {
      this.canvas.width = width
      this.canvas.height = height
    }
    this.gl.viewport(0, 0, width, height)
  }

  render(source: TexImageSource, preset: FilterPreset, mirror: boolean) {
    const gl = this.gl
    gl.useProgram(this.program)
    gl.bindTexture(gl.TEXTURE_2D, this.texture)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source)

    const u = this.uniforms
    gl.uniform1i(u.u_tex, 0)
    gl.uniform1f(u.u_time, (performance.now() - this.startTime) / 1000)
    gl.uniform1f(u.u_exposure, preset.exposure)
    gl.uniform1f(u.u_contrast, preset.contrast)
    gl.uniform1f(u.u_saturation, preset.saturation)
    gl.uniform1f(u.u_temp, preset.temp)
    gl.uniform1f(u.u_tint, preset.tint)
    gl.uniform1f(u.u_fade, preset.fade)
    gl.uniform3fv(u.u_shadowTint, preset.shadowTint)
    gl.uniform3fv(u.u_highlightTint, preset.highlightTint)
    gl.uniform1f(u.u_vignette, preset.vignette)
    gl.uniform1f(u.u_grain, preset.grain)
    gl.uniform1f(u.u_grainSize, preset.grainSize)
    gl.uniform1f(u.u_halation, preset.halation)
    gl.uniform1f(u.u_mirror, mirror ? 1 : 0)

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
  }

  dispose() {
    this.gl.deleteTexture(this.texture)
    this.gl.deleteProgram(this.program)
  }
}
