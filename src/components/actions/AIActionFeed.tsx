import { useUIStore } from '../../stores/uiStore'
import AIActionCard from './AIActionCard'

export default function AIActionFeed() {
  const actionLog = useUIStore((s) => s.actionLog)

  return (
    <div className="flex flex-col gap-2 overflow-y-auto max-h-full pr-1">
      {actionLog.length === 0 ? (
        <div className="flex items-center justify-center py-8">
          <span className="font-mono text-xs tracking-wider uppercase" style={{ color: '#5A6A82' }}>
            NO AI ACTIONS — INJECT A FAULT
          </span>
        </div>
      ) : (
        actionLog.map((entry) => (
          <AIActionCard key={entry.id} entry={entry} />
        ))
      )}
    </div>
  )
}
