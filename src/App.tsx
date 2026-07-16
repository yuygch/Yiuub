import { useState } from 'react'
import { useFilmCamera } from './hooks/useFilmCamera'
import { PRESETS, DEFAULT_PRESET_ID } from './gl/presets'
import { FilterCarousel } from './components/FilterCarousel'
import { Filmstrip, type Shot } from './components/Filmstrip'

function App() {
  const [presetId, setPresetId] = useState(DEFAULT_PRESET_ID)
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment')
  const [shots, setShots] = useState<Shot[]>([])
  const [flash, setFlash] = useState(false)
  const [viewing, setViewing] = useState<Shot | null>(null)

  const preset = PRESETS.find((p) => p.id === presetId) ?? PRESETS[0]
  const { videoRef, canvasRef, status, error, capture } = useFilmCamera({ preset, facingMode })

  function handleShutter() {
    const dataUrl = capture()
    if (!dataUrl) return
    setFlash(true)
    setTimeout(() => setFlash(false), 140)
    setShots((prev) => [
      { id: crypto.randomUUID(), dataUrl, presetLabel: preset.label, takenAt: Date.now() },
      ...prev,
    ])
  }

  async function saveShot(shot: Shot) {
    const filename = `filmcam-${shot.presetLabel.toLowerCase()}-${shot.takenAt}.jpg`
    const res = await fetch(shot.dataUrl)
    const blob = await res.blob()
    const file = new File([blob], filename, { type: 'image/jpeg' })

    // iOS Safari has no direct "save to Photos" from a web page; the
    // native share sheet's "Save Image" action is the closest equivalent.
    if (navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({ files: [file] })
      } catch {
        // user cancelled the share sheet, nothing else to do
      }
      return
    }

    const a = document.createElement('a')
    a.href = shot.dataUrl
    a.download = filename
    a.click()
  }

  return (
    <div className="app">
      <header className="topbar">
        <span className="brand">FilmCam</span>
        <button
          type="button"
          className="icon-btn"
          onClick={() => setFacingMode((m) => (m === 'user' ? 'environment' : 'user'))}
          aria-label="Cambiar camara"
        >
          ⟲
        </button>
      </header>

      <main className="viewfinder-wrap">
        <div className="viewfinder">
          <video ref={videoRef} playsInline muted className="hidden-video" />
          <canvas ref={canvasRef} className="viewfinder-canvas" />
          {flash && <div className="flash" />}
          {status === 'starting' && <div className="overlay-msg">Iniciando camara…</div>}
          {status === 'error' && (
            <div className="overlay-msg overlay-error">
              No se pudo acceder a la camara.
              <br />
              {error}
            </div>
          )}
        </div>
      </main>

      <FilterCarousel activeId={presetId} onSelect={setPresetId} />

      <footer className="bottombar">
        <Filmstrip shots={shots} onSelect={setViewing} />
        <button
          type="button"
          className="shutter"
          onClick={handleShutter}
          disabled={status !== 'ready'}
          aria-label="Tomar foto"
        />
        <div className="spacer" />
      </footer>

      {viewing && (
        <div className="lightbox" onClick={() => setViewing(null)}>
          <img src={viewing.dataUrl} alt={viewing.presetLabel} onClick={(e) => e.stopPropagation()} />
          <div className="lightbox-actions" onClick={(e) => e.stopPropagation()}>
            <button type="button" onClick={() => saveShot(viewing)}>
              Guardar
            </button>
            <button type="button" onClick={() => setViewing(null)}>
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
