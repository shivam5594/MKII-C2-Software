import { useNavigationStore } from '../../stores/navigationStore'
import { useTelemetryPanelStore } from '../../stores/telemetryPanelStore'
import { THREAT_SPHERE_PARAMETERS } from '../../data/navParameters'
import { GROUP_TO_TECHNIQUE_MAP } from './techniqueParamMap'
import type { TechniqueId } from '../../types/navigation'
import { TECHNIQUE_LABELS, TECHNIQUE_COLORS } from '../../types/navigation'
import { confidenceToColor } from '../../assets/brand-tokens'
import HealthBadge from '../common/HealthBadge'
import Sparkline from './Sparkline'
import TechniqueDetail from './TechniqueDetail'

interface TechniqueCardProps {
  techniqueId: TechniqueId
}

export default function TechniqueCard({ techniqueId }: TechniqueCardProps) {
  const technique = useNavigationStore((s) => s.techniques[techniqueId])
  const expanded = useTelemetryPanelStore((s) => s.expanded.has(techniqueId))
  const sparkline = useTelemetryPanelStore((s) => s.sparklines[techniqueId])
  const toggle = useTelemetryPanelStore((s) => s.toggle)

  const pct = Math.round(technique.confidence_score * 100)
  const color = confidenceToColor(technique.confidence_score)
  const techColor = TECHNIQUE_COLORS[techniqueId]

  // Count params for max-height calculation
  const paramCount = THREAT_SPHERE_PARAMETERS.filter(
    (p) => GROUP_TO_TECHNIQUE_MAP[p.group] === techniqueId
  ).length

  // Sensor bars + section headers + 13 technique state rows + dividers
  const expandedMaxHeight = paramCount * 22 + 13 * 18 + 140

  return (
    <div
      style={{
        backgroundColor: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: '8px',
        overflow: 'hidden',
      }}
    >
      {/* Collapsed header row */}
      <div
        className="flex items-center gap-2 cursor-pointer select-none"
        style={{ padding: '8px 10px' }}
        onClick={() => toggle(techniqueId)}
      >
        {/* Status dot */}
        <div
          className="shrink-0 rounded-full"
          style={{
            width: 8,
            height: 8,
            backgroundColor: color,
            boxShadow: `0 0 6px ${color}60`,
          }}
        />

        {/* Label */}
        <span
          className="font-mono text-xs uppercase tracking-wider font-medium flex-1 truncate"
          style={{ color: techColor }}
        >
          {TECHNIQUE_LABELS[techniqueId]}
        </span>

        {/* Health badge */}
        <HealthBadge status={technique.health_status} />

        {/* Confidence % */}
        <span
          className="font-mono text-xs tabular-nums font-medium shrink-0"
          style={{ color, width: '32px', textAlign: 'right' }}
        >
          {pct}%
        </span>

        {/* Sparkline */}
        <Sparkline data={sparkline} color={techColor} />
      </div>

      {/* Expandable detail */}
      <div
        style={{
          maxHeight: expanded ? `${expandedMaxHeight}px` : '0px',
          transition: 'max-height 300ms ease-out',
          overflow: 'hidden',
        }}
      >
        <div style={{ padding: '0 10px 4px' }}>
          <TechniqueDetail techniqueId={techniqueId} />
        </div>
      </div>
    </div>
  )
}
