import { useMemo } from 'react'
import type { TelemetryParamDef } from '../../types/telemetry'

interface Props {
  param: TelemetryParamDef
  value: number
  size?: number
}

export default function TelemetryGauge({ param, value, size = 100 }: Props) {
  const { normalizedValue, color, formattedValue } = useMemo(() => {
    const range = param.max - param.min
    const norm = range > 0 ? (value - param.min) / range : 0
    const clamped = Math.max(0, Math.min(1, norm))

    let c = '#00E5FF'
    if (param.criticalHigh !== undefined && value >= param.criticalHigh) c = '#E24B4A'
    else if (param.criticalLow !== undefined && value <= param.criticalLow) c = '#E24B4A'
    else if (param.warningHigh !== undefined && value >= param.warningHigh) c = '#FFB800'
    else if (param.warningLow !== undefined && value <= param.warningLow) c = '#FFB800'

    let fv: string
    switch (param.format) {
      case 'int': fv = Math.round(value).toString(); break
      case 'float1': fv = value.toFixed(1); break
      case 'float2': fv = value.toFixed(2); break
      case 'float4': fv = value.toFixed(4); break
      case 'bool': fv = value ? 'TRUE' : 'FALSE'; break
      case 'hex': fv = '0x' + Math.round(value).toString(16).toUpperCase().padStart(2, '0'); break
      case 'enum': fv = param.enumLabels?.[Math.round(value)] ?? Math.round(value).toString(); break
      default: fv = value.toFixed(1)
    }

    return { normalizedValue: clamped, color: c, formattedValue: fv }
  }, [value, param])

  // Use a padded viewBox so arcs never touch edges
  const vb = size + 16 // viewBox with 8px padding each side
  const cx = vb / 2
  const cy = vb / 2
  const r = size / 2 - 4
  const startAngle = 135
  const sweepAngle = 270
  const endAngle = startAngle + sweepAngle
  const valueAngle = startAngle + sweepAngle * normalizedValue

  const arcPath = describeArc(cx, cy, r, startAngle, endAngle)
  const valuePath = describeArc(cx, cy, r, startAngle, valueAngle)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
      <svg width={size} height={size * 0.85} viewBox={`0 0 ${vb} ${vb * 0.9}`} style={{ display: 'block' }}>
        {/* Background arc */}
        <path d={arcPath} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={4} strokeLinecap="round" />
        {/* Value arc */}
        <path d={valuePath} fill="none" stroke={color} strokeWidth={4} strokeLinecap="round" style={{ filter: `drop-shadow(0 0 4px ${color}40)` }} />
        {/* Needle tip */}
        <circle
          cx={cx + r * Math.cos((valueAngle - 90) * Math.PI / 180)}
          cy={cy + r * Math.sin((valueAngle - 90) * Math.PI / 180)}
          r={3}
          fill={color}
          style={{ filter: `drop-shadow(0 0 3px ${color})` }}
        />
        {/* Value text */}
        <text x={cx} y={cy + 2} textAnchor="middle" dominantBaseline="middle" fill={color} fontSize={size * 0.16} fontFamily="'JetBrains Mono', monospace" fontWeight={600}>
          {formattedValue}
        </text>
        {/* Unit */}
        <text x={cx} y={cy + size * 0.14} textAnchor="middle" dominantBaseline="middle" fill="#5A6A82" fontSize={size * 0.10} fontFamily="'JetBrains Mono', monospace">
          {param.unit}
        </text>
      </svg>
      <span className="font-mono tracking-wider uppercase" style={{ color: '#8899AA', fontSize: '9px', textAlign: 'center' }}>
        {param.shortLabel}
      </span>
    </div>
  )
}

function describeArc(cx: number, cy: number, r: number, startAngle: number, endAngle: number): string {
  const start = polarToCartesian(cx, cy, r, endAngle)
  const end = polarToCartesian(cx, cy, r, startAngle)
  const largeArc = endAngle - startAngle > 180 ? 1 : 0
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 0 ${end.x} ${end.y}`
}

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = (angleDeg - 90) * Math.PI / 180
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
}
