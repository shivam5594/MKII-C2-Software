import EWStatusStrip from '../telemetry/EWStatusStrip'
import TimelineScrubber from '../spheres/TimelineScrubber'
import { useUIStore } from '../../stores/uiStore'

export default function BottomBar() {
  const activeScenario = useUIStore((s) => s.activeScenario)

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: '0 16px',
        height: '40px',
        backgroundColor: '#0A0E1A',
        borderRadius: '10px',
        flexShrink: 0,
      }}
    >
      {activeScenario ? (
        <div style={{ flex: 1 }}>
          <TimelineScrubber />
        </div>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <EWStatusStrip />
          <span className="font-mono text-xs tracking-wider" style={{ color: '#5A6A82' }}>
            PHASE: STANDBY
          </span>
        </div>
      )}
    </div>
  )
}
