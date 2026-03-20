import { ChevronDown, ChevronRight } from 'lucide-react'

interface PanelHeaderProps {
  label: string
  expanded?: boolean
  onToggle?: () => void
}

export default function PanelHeader({ label, expanded, onToggle }: PanelHeaderProps) {
  const hasToggle = onToggle !== undefined && expanded !== undefined

  return (
    <div
      className="flex items-center gap-1.5 select-none"
      style={{
        cursor: hasToggle ? 'pointer' : 'default',
      }}
      onClick={onToggle}
    >
      {hasToggle && (
        <span style={{ color: '#5A6A82', width: 14, height: 14, display: 'flex', alignItems: 'center' }}>
          {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </span>
      )}
      <span
        className="font-mono text-xs tracking-[0.15em] uppercase font-medium"
        style={{ color: '#8899AA' }}
      >
        {label}
      </span>
    </div>
  )
}
