import { useState } from 'react'
import { useNavigationStore } from '../../stores/navigationStore'
import { ChevronDown, ChevronRight } from 'lucide-react'

function MissionRow({ label, value, color = '#B0BFCC' }: { label: string; value: string | number | boolean; color?: string }) {
  const display = typeof value === 'boolean' ? (value ? 'TRUE' : 'FALSE') : value
  const displayColor = typeof value === 'boolean' ? (value ? '#00E5FF' : '#5A6A82') : color
  return (
    <div className="flex items-center justify-between" style={{ height: '18px' }}>
      <span className="font-mono" style={{ fontSize: '10px', color: '#5A6A82', letterSpacing: '0.04em' }}>
        {label}
      </span>
      <span className="font-mono tabular-nums font-medium" style={{ fontSize: '10px', color: displayColor }}>
        {display}
      </span>
    </div>
  )
}

export default function MissionStateCard() {
  const mission = useNavigationStore((s) => s.mission)
  const [expanded, setExpanded] = useState(false)

  const phaseColor =
    mission.mission_phase === 'TERMINAL' ? '#E24B4A' :
    mission.mission_phase === 'LOITER' ? '#FFB800' : '#00E5FF'

  const authColor =
    mission.mitl_auth_status === 'AUTHORIZED' ? '#00E5FF' :
    mission.mitl_auth_status === 'ABORTED' ? '#E24B4A' : '#FFB800'

  const dlColor =
    mission.datalink_status === 'UP' ? '#00E5FF' :
    mission.datalink_status === 'DEGRADED' ? '#FFB800' : '#E24B4A'

  return (
    <div
      style={{
        backgroundColor: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: '8px',
        padding: '10px 12px',
      }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-1.5 cursor-pointer select-none"
        onClick={() => setExpanded(!expanded)}
        style={{ marginBottom: expanded ? '6px' : '0px' }}
      >
        <span style={{ color: '#5A6A82', width: 14, height: 14, display: 'flex', alignItems: 'center' }}>
          {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </span>
        <span
          className="font-mono text-xs tracking-[0.15em] uppercase font-medium flex-1"
          style={{ color: '#8899AA' }}
        >
          MISSION STATE
        </span>
        {/* Inline summary when collapsed */}
        <span className="font-mono tabular-nums font-medium" style={{ fontSize: '10px', color: phaseColor }}>
          {mission.mission_phase}
        </span>
      </div>

      {/* All 11 mission variables */}
      <div
        style={{
          maxHeight: expanded ? '300px' : '0px',
          transition: 'max-height 300ms ease-out',
          overflow: 'hidden',
        }}
      >
        <div className="flex flex-col">
          <MissionRow label="Phase" value={mission.mission_phase} color={phaseColor} />
          <MissionRow label="Dist to Target" value={`${mission.distance_to_target_km.toFixed(1)} km`} />
          <MissionRow label="CEP Threshold" value={`${mission.cep_threshold_m}m`} />
          <MissionRow label="GNSS Denial" value={`${mission.time_in_denial_s.toFixed(1)}s`} color={mission.time_in_denial_s > 0 ? '#FFB800' : '#B0BFCC'} />
          <MissionRow label="MITL Auth" value={mission.mitl_auth_status} color={authColor} />
          <MissionRow label="Datalink" value={mission.datalink_status} color={dlColor} />
          <MissionRow label="Operator Override" value={mission.operator_override_active} />
          <MissionRow label="Abort Condition" value={mission.abort_condition} color={mission.abort_condition ? '#E24B4A' : '#5A6A82'} />
          <MissionRow label="Mission Floor" value={`${(mission.mission_floor_confidence * 100).toFixed(0)}%`} />
          <MissionRow label="Waypoint" value={`#${mission.waypoint_index}`} />
          <MissionRow label="BDA Sensor" value={mission.bda_sensor_active} />
        </div>
      </div>
    </div>
  )
}
