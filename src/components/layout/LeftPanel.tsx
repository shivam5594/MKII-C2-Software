import { useUIStore } from '../../stores/uiStore'
import SensorPanel from '../telemetry/SensorPanel'

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
      <SensorPanel />
    </div>
  )
}
