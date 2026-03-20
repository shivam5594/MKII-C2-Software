import { useNavigationStore } from '../../stores/navigationStore'
import { THREAT_SPHERE_PARAMETERS } from '../../data/navParameters'
import { GROUP_TO_TECHNIQUE_MAP } from './techniqueParamMap'
import type { TechniqueId } from '../../types/navigation'
import SensorParameterRow from './SensorParameterRow'
import { useShallow } from 'zustand/shallow'
import { confidenceToColor } from '../../assets/brand-tokens'

interface TechniqueDetailProps {
  techniqueId: TechniqueId
}

function StateRow({ label, value, color = '#B0BFCC' }: { label: string; value: string | number | boolean; color?: string }) {
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

export default function TechniqueDetail({ techniqueId }: TechniqueDetailProps) {
  const paramDefs = THREAT_SPHERE_PARAMETERS.filter(
    (p) => GROUP_TO_TECHNIQUE_MAP[p.group] === techniqueId
  )
  const paramIds = paramDefs.map((p) => p.id)

  const confidences = useNavigationStore(
    useShallow((s) => {
      const result: Record<string, number> = {}
      for (const id of paramIds) {
        result[id] = s.parameters[id]?.confidence ?? 0
      }
      return result
    })
  )

  const t = useNavigationStore((s) => s.techniques[techniqueId])

  return (
    <div style={{ padding: '4px 0 8px' }}>
      {/* Sensor parameter bars */}
      <div
        className="font-mono uppercase"
        style={{ fontSize: '9px', color: '#5A6A82', letterSpacing: '0.1em', marginBottom: '4px' }}
      >
        SENSOR PARAMETERS
      </div>
      <div className="flex flex-col gap-0.5">
        {paramDefs.map((p) => (
          <SensorParameterRow
            key={p.id}
            label={p.shortLabel}
            confidence={confidences[p.id]}
          />
        ))}
      </div>

      {/* Divider */}
      <div style={{ height: '1px', backgroundColor: 'rgba(255,255,255,0.06)', margin: '8px 0 6px' }} />

      {/* All 13 technique state variables */}
      <div
        className="font-mono uppercase"
        style={{ fontSize: '9px', color: '#5A6A82', letterSpacing: '0.1em', marginBottom: '4px' }}
      >
        TECHNIQUE STATE
      </div>
      <div className="flex flex-col">
        <StateRow label="Confidence" value={`${(t.confidence_score * 100).toFixed(1)}%`} color={confidenceToColor(t.confidence_score)} />
        <StateRow
          label="Health"
          value={t.health_status}
          color={
            t.health_status === 'NOMINAL' ? '#00E5FF' :
            t.health_status === 'DEGRADED' ? '#FFB800' :
            t.health_status === 'DENIED' ? '#E24B4A' : '#FF00FF'
          }
        />
        <StateRow label="Active" value={t.is_active} />
        <StateRow label="Fix Age" value={`${t.last_fix_age_s.toFixed(1)}s`} color={t.last_fix_age_s < 2 ? '#B0BFCC' : '#FFB800'} />
        <StateRow label="Fix Rate" value={`${t.fix_rate_hz.toFixed(1)} Hz`} />
        <StateRow label="CEP" value={`${t.current_cep_estimate_m}m`} color={t.current_cep_estimate_m < 30 ? '#00E5FF' : t.current_cep_estimate_m < 100 ? '#FFB800' : '#E24B4A'} />
        <StateRow label="Innovation" value={`${t.innovation_residual_m.toFixed(2)}m`} color={t.innovation_residual_m < 2 ? '#B0BFCC' : '#FFB800'} />
        <StateRow label="Gate Pass" value={t.innovation_gate_pass} />
        <StateRow label="Spoof Flag" value={t.spoofing_flag} color={t.spoofing_flag ? '#FF00FF' : '#5A6A82'} />
        <StateRow label="Jam Detect" value={t.jamming_detected} color={t.jamming_detected ? '#E24B4A' : '#5A6A82'} />
        <StateRow label="R Scale" value={t.measurement_noise_scale.toFixed(2)} color={t.measurement_noise_scale > 2 ? '#FFB800' : '#B0BFCC'} />
        <StateRow label="Denial" value={`${t.denial_duration_s.toFixed(1)}s`} color={t.denial_duration_s > 0 ? '#E24B4A' : '#B0BFCC'} />
        <StateRow label="Decay Rate" value={t.confidence_decay_rate.toFixed(3)} />
      </div>
    </div>
  )
}
