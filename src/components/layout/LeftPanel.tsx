import { useUIStore } from '../../stores/uiStore'
import NavStackIndicator from '../telemetry/NavStackIndicator'
import ScenarioPicker from '../actions/ScenarioPicker'

export default function LeftPanel() {
  const open = useUIStore((s) => s.leftPanelOpen)
  const width = useUIStore((s) => s.leftPanelWidth)

  if (!open) return null

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        overflow: 'hidden',
        width: `${width}px`,
        backgroundColor: '#0A0E1A',
        borderRadius: '10px',
      }}
    >
      {/* Section: Nav Stack */}
      <div style={{ padding: '16px 16px 8px' }}>
        <div className="font-mono text-xs tracking-[0.15em] uppercase font-medium" style={{ color: '#8899AA', marginBottom: '12px' }}>
          NAVIGATION STACK
        </div>
        <NavStackIndicator />
      </div>

      <div style={{ height: '1px', backgroundColor: 'rgba(255,255,255,0.06)', margin: '4px 16px' }} />

      {/* Section: Scenarios */}
      <div style={{ padding: '8px 16px 16px', flex: 1, overflowY: 'auto' }}>
        <div className="font-mono text-xs tracking-[0.15em] uppercase font-medium" style={{ color: '#8899AA', marginBottom: '12px' }}>
          SCENARIOS
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <ScenarioPicker />
        </div>
      </div>
    </div>
  )
}
