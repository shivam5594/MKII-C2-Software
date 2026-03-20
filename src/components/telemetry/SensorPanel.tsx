import { TECHNIQUE_IDS } from '../../types/navigation'
import { useSparklineBuffer } from '../../hooks/useSparklineBuffer'
import FusionSummaryCard from './FusionSummaryCard'
import TechniqueCard from './TechniqueCard'
import MissionStateCard from './MissionStateCard'
import EnvironmentStateCard from './EnvironmentStateCard'
import FaultInjector from '../actions/FaultInjector'

export default function SensorPanel() {
  useSparklineBuffer()

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden',
      }}
    >
      {/* Scrollable content area */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          minHeight: 0,
          padding: '12px 12px 8px',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
        }}
      >
        {/* Fusion State */}
        <FusionSummaryCard />

        {/* Section: Navigation Stack */}
        <div style={{ padding: '4px 0 2px' }}>
          <div
            className="font-mono text-xs tracking-[0.15em] uppercase font-medium"
            style={{ color: '#8899AA' }}
          >
            NAVIGATION STACK
          </div>
        </div>
        {TECHNIQUE_IDS.map((id) => (
          <TechniqueCard key={id} techniqueId={id} />
        ))}

        {/* Mission State */}
        <MissionStateCard />

        {/* Environment State */}
        <EnvironmentStateCard />
      </div>

      {/* Divider */}
      <div style={{ height: '1px', backgroundColor: 'rgba(255,255,255,0.06)', margin: '0 12px' }} />

      {/* Fault Injection — pinned at bottom */}
      <div style={{ padding: '8px 12px 12px', flexShrink: 0 }}>
        <div
          className="font-mono text-xs tracking-[0.15em] uppercase font-medium"
          style={{ color: '#8899AA', marginBottom: '8px' }}
        >
          FAULT INJECTION
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <FaultInjector />
        </div>
      </div>
    </div>
  )
}
