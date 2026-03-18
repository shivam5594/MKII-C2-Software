type LEDStatus = 'nominal' | 'caution' | 'critical' | 'offline'

const STATUS_COLORS: Record<LEDStatus, { bg: string; glow: string }> = {
  nominal:  { bg: '#00E5FF', glow: '0 0 8px rgba(0, 229, 255, 0.4)' },
  caution:  { bg: '#FFB800', glow: '0 0 8px rgba(255, 184, 0, 0.4)' },
  critical: { bg: '#E24B4A', glow: '0 0 8px rgba(226, 75, 74, 0.4)' },
  offline:  { bg: '#3A4A62', glow: 'none' },
}

interface StatusLEDProps {
  status: LEDStatus
  label?: string
  blink?: boolean
}

export default function StatusLED({ status, label, blink }: StatusLEDProps) {
  const { bg, glow } = STATUS_COLORS[status]

  return (
    <div className="flex items-center gap-1.5">
      <div
        className="w-2 h-2 rounded-full flex-shrink-0"
        style={{
          backgroundColor: bg,
          boxShadow: glow,
          animation: blink && status === 'critical' ? 'blink 1s step-end infinite' : undefined,
        }}
      />
      {label && (
        <span className="font-mono text-xs uppercase tracking-wider" style={{ color: '#B0BFCC' }}>
          {label}
        </span>
      )}
    </div>
  )
}
