import { useUIStore } from '../../stores/uiStore'
import AIActionFeed from '../actions/AIActionFeed'

export default function RightPanel() {
  const open = useUIStore((s) => s.rightPanelOpen)
  const width = useUIStore((s) => s.rightPanelWidth)

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
      <div style={{ padding: '16px 16px 8px' }}>
        <div className="font-mono text-xs tracking-[0.15em] uppercase font-medium" style={{ color: '#8899AA' }}>
          AI ACTIONS
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '0 16px 16px' }}>
        <AIActionFeed />
      </div>
    </div>
  )
}
