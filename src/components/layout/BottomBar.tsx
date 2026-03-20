import EWStatusStrip from '../telemetry/EWStatusStrip'
import { useFaultStore } from '../../stores/faultStore'
import { useNavigationStore } from '../../stores/navigationStore'

export default function BottomBar() {
  const jamming = useFaultStore((s) => s.jamming)
  const spoofing = useFaultStore((s) => s.spoofing)
  const missionPhase = useNavigationStore((s) => s.mission.mission_phase)

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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <EWStatusStrip />

          {/* Active fault badges */}
          {jamming && (
            <span
              className="font-mono text-xs tracking-wider uppercase font-medium px-2 py-0.5 rounded"
              style={{
                color: '#FFB800',
                backgroundColor: 'rgba(255, 184, 0, 0.1)',
                border: '1px solid rgba(255, 184, 0, 0.3)',
              }}
            >
              JAM ACTIVE
            </span>
          )}
          {spoofing && (
            <span
              className="font-mono text-xs tracking-wider uppercase font-medium px-2 py-0.5 rounded"
              style={{
                color: '#E24B4A',
                backgroundColor: 'rgba(226, 75, 74, 0.1)',
                border: '1px solid rgba(226, 75, 74, 0.3)',
              }}
            >
              SPOOF ACTIVE
            </span>
          )}
        </div>

        <span className="font-mono text-xs tracking-wider" style={{ color: '#5A6A82' }}>
          PHASE: {missionPhase}
        </span>
      </div>
    </div>
  )
}
