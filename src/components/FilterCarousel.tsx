import { PRESETS } from '../gl/presets'

interface Props {
  activeId: string
  onSelect: (id: string) => void
}

export function FilterCarousel({ activeId, onSelect }: Props) {
  return (
    <div className="filter-carousel">
      {PRESETS.map((p) => (
        <button
          key={p.id}
          className={`filter-chip ${p.id === activeId ? 'is-active' : ''}`}
          onClick={() => onSelect(p.id)}
          type="button"
        >
          {p.label}
        </button>
      ))}
    </div>
  )
}
