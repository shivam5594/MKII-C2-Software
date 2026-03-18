import { Zap, AlertTriangle, ArrowRightLeft, Shield, Info } from 'lucide-react'
import type { ActionLogEntry } from '../../stores/uiStore'
import { ACTION_TYPE_COLORS } from '../../stores/uiStore'

const TYPE_ICONS: Record<string, typeof Zap> = {
  NAV_SWITCH: ArrowRightLeft,
  ALERT: AlertTriangle,
  SPOOF_DETECT: Shield,
  FUSION: Zap,
  DEFAULT: Info,
}

interface AIActionCardProps {
  entry: ActionLogEntry
}

export default function AIActionCard({ entry }: AIActionCardProps) {
  const color = ACTION_TYPE_COLORS[entry.type] ?? ACTION_TYPE_COLORS.DEFAULT
  const Icon = TYPE_ICONS[entry.type] ?? TYPE_ICONS.DEFAULT

  const timeStr = `T+${entry.timestamp.toFixed(1)}s`

  return (
    <div
      className="px-3 py-2.5 rounded-md border-l-2"
      style={{
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderLeftColor: color,
      }}
    >
      <div className="flex items-center gap-2 mb-1">
        <Icon size={13} style={{ color: color }} />
        <span
          className="font-mono text-xs tracking-wider uppercase font-medium"
          style={{ color: color }}
        >
          {entry.title}
        </span>
      </div>
      <div className="font-mono text-[13px] mb-1.5" style={{ color: '#B0BFCC' }}>
        {entry.detail}
      </div>
      <div className="flex items-center justify-between">
        <span className="font-mono text-[11px]" style={{ color: '#5A6A82' }}>
          {timeStr}
        </span>
        <span
          className="font-mono text-[11px] uppercase font-medium"
          style={{ color: entry.status === 'AUTO' ? '#00FF88' : '#FFB800' }}
        >
          {entry.status === 'AUTO' ? '✓ AUTO-APPROVED' : entry.status}
        </span>
      </div>
    </div>
  )
}
