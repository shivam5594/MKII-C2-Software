import type { HealthStatus } from '../../types/navigation'

const STATUS_CONFIG: Record<HealthStatus, { color: string; bg: string }> = {
  NOMINAL:  { color: '#00E5FF', bg: 'rgba(0,229,255,0.10)' },
  DEGRADED: { color: '#FFB800', bg: 'rgba(255,184,0,0.10)' },
  DENIED:   { color: '#E24B4A', bg: 'rgba(226,75,74,0.10)' },
  SPOOFED:  { color: '#FF00FF', bg: 'rgba(255,0,255,0.10)' },
}

const SHORT_LABELS: Record<HealthStatus, string> = {
  NOMINAL: 'NOM',
  DEGRADED: 'DEG',
  DENIED: 'DEN',
  SPOOFED: 'SPF',
}

interface HealthBadgeProps {
  status: HealthStatus
}

export default function HealthBadge({ status }: HealthBadgeProps) {
  const cfg = STATUS_CONFIG[status]
  return (
    <span
      className="font-mono uppercase"
      style={{
        fontSize: '10px',
        lineHeight: '14px',
        padding: '2px 6px',
        borderRadius: '4px',
        color: cfg.color,
        backgroundColor: cfg.bg,
        letterSpacing: '0.05em',
        fontWeight: 500,
        animation: status === 'SPOOFED' ? 'healthBlink 1s ease-in-out infinite' : undefined,
      }}
    >
      {SHORT_LABELS[status]}
      <style>{`
        @keyframes healthBlink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </span>
  )
}
