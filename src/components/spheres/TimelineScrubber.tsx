import { useState } from 'react'
import { useUIStore, ACTION_TYPE_COLORS } from '../../stores/uiStore'
import type { ActionLogEntry } from '../../stores/uiStore'
import { Play, Pause, RotateCcw } from 'lucide-react'
import { useScenario } from '../../hooks/useScenario'

function ActionMarker({ entry, duration }: { entry: ActionLogEntry; duration: number }) {
  const [hovered, setHovered] = useState(false)
  const pct = (entry.timestamp / duration) * 100
  const color = ACTION_TYPE_COLORS[entry.type] ?? ACTION_TYPE_COLORS.DEFAULT

  return (
    <div
      className="absolute top-1/2 -translate-y-1/2 flex flex-col items-center"
      style={{ left: `${pct}%`, transform: `translateX(-50%) translateY(-50%)` }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Square marker overlaying the track */}
      <div
        className="shrink-0 cursor-pointer rounded-sm"
        style={{
          width: '6px',
          height: '14px',
          backgroundColor: color,
        }}
      />

      {/* Tooltip */}
      {hovered && (
        <div
          className="absolute bottom-full mb-3 px-3 py-2 rounded-md whitespace-nowrap pointer-events-none z-20"
          style={{
            backgroundColor: '#131A24',
            border: `1px solid rgba(255,255,255,0.1)`,
          }}
        >
          <div className="flex items-center gap-1.5 mb-0.5">
            <div className="w-1.5 h-1.5 rounded-sm" style={{ backgroundColor: color }} />
            <span className="font-mono text-xs font-medium uppercase tracking-wider" style={{ color }}>
              {entry.title}
            </span>
          </div>
          <div className="font-mono text-[11px]" style={{ color: '#B0BFCC' }}>
            {entry.detail}
          </div>
          <div className="font-mono text-[10px] mt-0.5" style={{ color: '#5A6A82' }}>
            T+{entry.timestamp.toFixed(1)}s
          </div>
        </div>
      )}
    </div>
  )
}

export default function TimelineScrubber() {
  const activeScenario = useUIStore((s) => s.activeScenario)
  const isPlaying = useUIStore((s) => s.isPlaying)
  const playbackTime = useUIStore((s) => s.playbackTime)
  const togglePlayback = useUIStore((s) => s.togglePlayback)
  const setPlaybackTime = useUIStore((s) => s.setPlaybackTime)
  const setPlaying = useUIStore((s) => s.setPlaying)
  const actionLog = useUIStore((s) => s.actionLog)
  const { stop } = useScenario()

  if (!activeScenario) return null

  const duration = activeScenario.duration_seconds
  const progress = duration > 0 ? playbackTime / duration : 0
  const timeStr = `T+${playbackTime.toFixed(1)}s`
  const durationStr = `${duration}s`

  return (
    <div className="flex items-center gap-3 px-4 py-2">
      {/* Play/Pause */}
      <button
        onClick={togglePlayback}
        className="flex items-center justify-center w-8 h-8 rounded-md transition-colors"
        style={{
          backgroundColor: 'rgba(255,255,255,0.06)',
          color: '#8899AA',
        }}
      >
        {isPlaying ? <Pause size={16} /> : <Play size={16} />}
      </button>

      {/* Reset */}
      <button
        onClick={() => { setPlaybackTime(0); setPlaying(false) }}
        className="flex items-center justify-center w-8 h-8 rounded-md transition-colors"
        style={{
          backgroundColor: 'rgba(255,255,255,0.04)',
          color: '#5A6A82',
        }}
      >
        <RotateCcw size={14} />
      </button>

      {/* Time display */}
      <span className="font-mono text-sm font-medium min-w-[70px]" style={{ color: '#B0BFCC' }}>
        {timeStr}
      </span>

      {/* Scrubber bar with action markers */}
      <div className="flex-1 relative h-6 flex items-center group">
        {/* Track */}
        <div
          className="w-full h-1.5 rounded-full cursor-pointer relative"
          style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect()
            const frac = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
            setPlaybackTime(frac * duration)
          }}
        >
          {/* Progress fill — solid, no glow */}
          <div
            className="h-full rounded-full transition-all duration-75"
            style={{
              width: `${progress * 100}%`,
              backgroundColor: '#3A4A62',
            }}
          />

          {/* Action markers */}
          {actionLog.map((entry) => (
            <ActionMarker key={entry.id} entry={entry} duration={duration} />
          ))}
        </div>
      </div>

      {/* Duration */}
      <span className="font-mono text-xs" style={{ color: '#5A6A82' }}>
        {durationStr}
      </span>

      {/* Scenario name */}
      <span
        className="font-mono text-xs tracking-wider uppercase px-2.5 py-1 rounded font-medium"
        style={{
          backgroundColor: 'rgba(255,255,255,0.05)',
          color: '#B0BFCC',
        }}
      >
        {activeScenario.name}
      </span>

      {/* Stop */}
      <button
        onClick={stop}
        className="font-mono text-xs tracking-wider uppercase px-2.5 py-1 rounded transition-colors font-medium"
        style={{
          backgroundColor: 'rgba(226, 75, 74, 0.12)',
          color: '#E24B4A',
        }}
      >
        STOP
      </button>
    </div>
  )
}
