import Logo from '../common/Logo'
import MissionClock from '../telemetry/MissionClock'
import StatusLED from '../common/StatusLED'
import { useUIStore } from '../../stores/uiStore'

export default function TopBar() {
  const isPlaying = useUIStore((s) => s.isPlaying)
  const activeScenario = useUIStore((s) => s.activeScenario)

  const scenarioId = activeScenario?.id
  const hasJamming = scenarioId === 'gnss-jam'
  const hasSpoofing = scenarioId === 'spoof-attack'

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 16px',
        height: '48px',
        backgroundColor: '#0A0E1A',
        borderRadius: '10px',
        flexShrink: 0,
      }}
    >
      {/* Left: Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <Logo height={22} />
        <div style={{ width: '1px', height: '20px', backgroundColor: 'rgba(255,255,255,0.08)' }} />
        <span className="font-mono text-xs tracking-[0.2em] uppercase" style={{ color: '#8899AA' }}>
          CII AUTONOMY DASHBOARD
        </span>
      </div>

      {/* Center: Mission clock */}
      <MissionClock />

      {/* Right: Status LEDs */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <StatusLED status="nominal" label="INS" />
        <StatusLED
          status={isPlaying && (hasJamming || hasSpoofing) ? 'critical' : 'nominal'}
          label="GNSS"
          blink={isPlaying && (hasJamming || hasSpoofing)}
        />
        <StatusLED status="nominal" label="NAV" />
        <StatusLED status={isPlaying && hasSpoofing ? 'caution' : 'nominal'} label="EW" />
        <StatusLED status="nominal" label="COMMS" />
      </div>
    </div>
  )
}
