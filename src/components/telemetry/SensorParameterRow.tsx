import { confidenceToColor } from '../../assets/brand-tokens'

interface SensorParameterRowProps {
  label: string
  confidence: number
}

export default function SensorParameterRow({ label, confidence }: SensorParameterRowProps) {
  const pct = Math.max(0, Math.min(100, confidence * 100))
  const color = confidenceToColor(confidence)

  return (
    <div
      className="flex items-center gap-2"
      style={{ height: '22px' }}
    >
      <span
        className="font-mono text-xs shrink-0 truncate"
        style={{
          width: '70px',
          color: '#8899AA',
          fontSize: '10px',
        }}
      >
        {label}
      </span>
      <div
        className="flex-1 rounded-sm overflow-hidden"
        style={{ height: '6px', backgroundColor: 'rgba(255,255,255,0.06)' }}
      >
        <div
          className="h-full rounded-sm"
          style={{
            width: `${pct}%`,
            backgroundColor: color,
            boxShadow: `0 0 8px ${color}50`,
            transition: 'width 300ms ease-out',
          }}
        />
      </div>
      <span
        className="font-mono tabular-nums font-medium shrink-0 text-right"
        style={{
          width: '36px',
          fontSize: '10px',
          color,
        }}
      >
        {confidence.toFixed(2)}
      </span>
    </div>
  )
}
