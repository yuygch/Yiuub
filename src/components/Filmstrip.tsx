export interface Shot {
  id: string
  dataUrl: string
  presetLabel: string
  takenAt: number
}

interface Props {
  shots: Shot[]
  onSelect: (shot: Shot) => void
}

export function Filmstrip({ shots, onSelect }: Props) {
  if (shots.length === 0) return null
  return (
    <div className="filmstrip">
      {shots.map((shot) => (
        <button
          key={shot.id}
          className="filmstrip-thumb"
          onClick={() => onSelect(shot)}
          type="button"
        >
          <img src={shot.dataUrl} alt={`Foto ${shot.presetLabel}`} />
        </button>
      ))}
    </div>
  )
}
