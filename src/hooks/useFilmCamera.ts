import { useCallback, useEffect, useRef, useState } from 'react'
import { FilmRenderer } from '../gl/FilmRenderer'
import type { FilterPreset } from '../gl/presets'

export type CameraStatus = 'idle' | 'starting' | 'ready' | 'error'

interface UseFilmCameraOptions {
  preset: FilterPreset
  facingMode: 'user' | 'environment'
}

export function useFilmCamera({ preset, facingMode }: UseFilmCameraOptions) {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const rendererRef = useRef<FilmRenderer | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const rafRef = useRef<number | null>(null)
  const presetRef = useRef(preset)
  const [status, setStatus] = useState<CameraStatus>('idle')
  const [error, setError] = useState<string | null>(null)

  presetRef.current = preset
  const mirror = facingMode === 'user'

  useEffect(() => {
    let cancelled = false
    setStatus('starting')
    setError(null)

    async function start() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode, width: { ideal: 1280 }, height: { ideal: 1280 } },
          audio: false,
        })
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop())
          return
        }
        streamRef.current = stream
        const video = videoRef.current
        if (!video) return
        video.srcObject = stream
        await video.play()
        if (cancelled) return

        const canvas = canvasRef.current
        if (!canvas) return
        const renderer = new FilmRenderer(canvas)
        rendererRef.current = renderer
        setStatus('ready')

        const loop = () => {
          if (cancelled) return
          const v = videoRef.current
          const r = rendererRef.current
          if (v && r && v.videoWidth > 0) {
            const size = Math.min(v.videoWidth, v.videoHeight)
            r.resize(size, size)
            r.render(v, presetRef.current, mirror)
          }
          rafRef.current = requestAnimationFrame(loop)
        }
        rafRef.current = requestAnimationFrame(loop)
      } catch (err) {
        if (cancelled) return
        setStatus('error')
        setError(err instanceof Error ? err.message : 'No se pudo acceder a la camara')
      }
    }

    start()

    return () => {
      cancelled = true
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      rendererRef.current?.dispose()
      rendererRef.current = null
      streamRef.current?.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
  }, [facingMode, mirror])

  const capture = useCallback((): string | null => {
    const canvas = canvasRef.current
    if (!canvas) return null
    return canvas.toDataURL('image/jpeg', 0.92)
  }, [])

  return { videoRef, canvasRef, status, error, capture }
}
