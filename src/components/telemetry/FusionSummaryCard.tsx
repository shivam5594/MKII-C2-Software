import { useState } from 'react'
import { useNavigationStore } from '../../stores/navigationStore'
import { TECHNIQUE_LABELS } from '../../types/navigation'
import { confidenceToColor } from '../../assets/brand-tokens'
import DataChip from '../common/DataChip'
import { ChevronDown, ChevronRight } from 'lucide-react'

function FusionStateRow({ label, value, color = '#B0BFCC' }: { label: string; value: string | number | boolean; color?: string }) {
  const display = typeof value === 'boolean' ? (value ? 'TRUE' : 'FALSE') : value
  const displayColor = typeof value === 'boolean' ? (value ? '#E24B4A' : '#00E5FF') : color
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

export default function FusionSummaryCard() {
  const fusion = useNavigationStore((s) => s.fusion)
  const compositeColor = confidenceToColor(fusion.composite_confidence)
  const [expanded, setExpanded] = useState(false)

  return (
    <div
      style={{
        backgroundColor: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: '8px',
        padding: '10px 12px',
      }}
    >
      {/* Header with toggle */}
      <div
        className="flex items-center gap-1.5 cursor-pointer select-none"
        onClick={() => setExpanded(!expanded)}
        style={{ marginBottom: '8px' }}
      >
        <span style={{ color: '#5A6A82', width: 14, height: 14, display: 'flex', alignItems: 'center' }}>
          {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </span>
        <span
          className="font-mono text-xs tracking-[0.15em] uppercase font-medium"
          style={{ color: '#8899AA' }}
        >
          FUSION STATE
        </span>
      </div>

      {/* Key metrics — always visible */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '8px 16px',
        }}
      >
        <DataChip
          label="Composite"
          value={`${Math.round(fusion.composite_confidence * 100)}%`}
          color={compositeColor}
        />
        <DataChip
          label="Primary"
          value={TECHNIQUE_LABELS[fusion.primary_technique]}
          color="#B0BFCC"
        />
        <DataChip
          label="Active"
          value={`${fusion.active_technique_count}/6`}
          color={fusion.active_technique_count >= 4 ? '#00E5FF' : fusion.active_technique_count >= 2 ? '#FFB800' : '#E24B4A'}
        />
        <DataChip
          label="Cov Trace"
          value={fusion.covariance_trace.toFixed(1)}
          color={fusion.covariance_trace < 20 ? '#00E5FF' : '#FFB800'}
        />
      </div>

      {/* Expanded: all remaining fusion variables */}
      <div
        style={{
          maxHeight: expanded ? '300px' : '0px',
          transition: 'max-height 300ms ease-out',
          overflow: 'hidden',
        }}
      >
        <div style={{ height: '1px', backgroundColor: 'rgba(255,255,255,0.06)', margin: '8px 0 6px' }} />
        <div className="flex flex-col">
          <FusionStateRow
            label="Fallback Queue"
            value={fusion.fallback_queue.map((t) => TECHNIQUE_LABELS[t]).join(' → ')}
            color="#8899AA"
          />
          <FusionStateRow
            label="INS Accum Error"
            value={`${fusion.inertial_accumulated_error_m.toFixed(1)}m`}
            color={fusion.inertial_accumulated_error_m < 50 ? '#B0BFCC' : '#FFB800'}
          />
          <FusionStateRow
            label="Last Abs Fix"
            value={`${fusion.last_absolute_fix_age_s.toFixed(1)}s`}
            color={fusion.last_absolute_fix_age_s < 5 ? '#B0BFCC' : '#FFB800'}
          />
          <FusionStateRow
            label="EKF Predict"
            value={`${fusion.ekf_predict_rate_hz} Hz`}
          />
          <FusionStateRow
            label="EKF Update"
            value={`${fusion.ekf_update_rate_hz} Hz`}
          />
          <FusionStateRow
            label="Innovation Anomaly"
            value={fusion.innovation_anomaly_flag}
          />
        </div>
      </div>
    </div>
  )
}
