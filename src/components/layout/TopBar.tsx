import Logo from '../common/Logo'
import MissionClock from '../telemetry/MissionClock'
import StatusLED from '../common/StatusLED'
import { useFaultStore } from '../../stores/faultStore'
import { useNavigationStore } from '../../stores/navigationStore'

export default function TopBar() {
  const jamming = useFaultStore((s) => s.jamming)
  const spoofing = useFaultStore((s) => s.spoofing)
  const gnssHealth = useNavigationStore((s) => s.techniques.GNSS.health_status)
  const ewJam = useNavigationStore((s) => s.parameters['ew_jam_power']?.confidence ?? 1)
  const commsSat = useNavigationStore((s) => s.parameters['comms_satcom']?.confidence ?? 1)

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
          status={gnssHealth === 'DENIED' || gnssHealth === 'SPOOFED' ? 'critical' : gnssHealth === 'DEGRADED' ? 'caution' : 'nominal'}
          label="GNSS"
          blink={jamming || spoofing}
        />
        <StatusLED status="nominal" label="NAV" />
        <StatusLED status={ewJam < 0.5 ? 'caution' : 'nominal'} label="EW" />
        <StatusLED status={commsSat < 0.5 ? 'caution' : 'nominal'} label="COMMS" />
      </div>
    </div>
  )
}
