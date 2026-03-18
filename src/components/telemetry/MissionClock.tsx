import { useUIStore } from '../../stores/uiStore'

export default function MissionClock() {
  const playbackTime = useUIStore((s) => s.playbackTime)
  const isPlaying = useUIStore((s) => s.isPlaying)

  const totalSeconds = Math.floor(playbackTime)
  const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0')
  const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0')
  const seconds = String(totalSeconds % 60).padStart(2, '0')
  const ms = String(Math.floor((playbackTime % 1) * 100)).padStart(2, '0')

  return (
    <div className="flex items-center gap-2">
      <span className="font-mono text-xs uppercase tracking-wider" style={{ color: '#8899AA' }}>
        MISSION
      </span>
      <span
        className="font-mono text-base tabular-nums"
        style={{ color: isPlaying ? '#00E5FF' : '#8899AA' }}
      >
        {hours}:{minutes}:{seconds}.{ms}
      </span>
    </div>
  )
}
