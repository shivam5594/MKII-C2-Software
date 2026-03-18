import { useScenario } from '../../hooks/useScenario'
import { useUIStore } from '../../stores/uiStore'

const SCENARIOS = [
  {
    id: 'nominal',
    name: 'Nominal Flight',
    description: 'All systems nominal — baseline cruise',
    color: '#00E5FF',
  },
  {
    id: 'gnss-jam',
    name: 'GNSS Jamming',
    description: 'Progressive GNSS degradation with nav switching',
    color: '#FFB800',
  },
  {
    id: 'spoof-attack',
    name: 'Spoofing Attack',
    description: 'GNSS spoofing detected, AI rejects and switches',
    color: '#E24B4A',
  },
]

export default function ScenarioPicker() {
  const { load } = useScenario()
  const activeId = useUIStore((s) => s.activeScenario?.id)

  return (
    <>
      {SCENARIOS.map((s) => {
        const isActive = activeId === s.id
        return (
          <button
            key={s.id}
            onClick={() => load(s.id)}
            className="flex flex-col items-start w-full px-3 py-2.5 rounded-md border transition-all duration-200 cursor-pointer text-left"
            style={{
              backgroundColor: isActive ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.02)',
              borderColor: isActive ? s.color : 'rgba(255,255,255,0.06)',
              boxShadow: isActive ? `0 0 15px ${s.color}20` : 'none',
            }}
          >
            <div className="flex items-center gap-2 mb-0.5">
              <div
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: s.color }}
              />
              <span
                className="font-mono text-xs tracking-wider uppercase font-medium"
                style={{ color: isActive ? s.color : '#B0BFCC' }}
              >
                {s.name}
              </span>
            </div>
            <span className="text-xs leading-tight pl-4" style={{ color: '#5A6A82' }}>
              {s.description}
            </span>
          </button>
        )
      })}
    </>
  )
}
