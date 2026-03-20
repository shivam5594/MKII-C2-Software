import { useState } from 'react'
import { useNavigationStore } from '../../stores/navigationStore'
import { ChevronDown, ChevronRight } from 'lucide-react'

function EnvRow({ label, value, color = '#B0BFCC' }: { label: string; value: string | number | boolean; color?: string }) {
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

function qualityColor(v: number, threshold = 0.5): string {
  return v >= 0.8 ? '#00E5FF' : v >= threshold ? '#FFB800' : '#E24B4A'
}

export default function EnvironmentStateCard() {
  const env = useNavigationStore((s) => s.environment)
  const [expanded, setExpanded] = useState(false)

  const ewColor = env.ew_threat_detected ? '#E24B4A' : '#00E5FF'

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
          ENVIRONMENT
        </span>
        {/* Inline EW status when collapsed */}
        <span className="font-mono tabular-nums font-medium" style={{ fontSize: '10px', color: ewColor }}>
          {env.ew_threat_detected ? 'EW THREAT' : 'CLEAR'}
        </span>
      </div>

      {/* All 13 environment variables */}
      <div
        style={{
          maxHeight: expanded ? '350px' : '0px',
          transition: 'max-height 300ms ease-out',
          overflow: 'hidden',
        }}
      >
        <div className="flex flex-col">
          <EnvRow label="Cloud Cover" value={`${(env.cloud_cover * 100).toFixed(0)}%`} color={qualityColor(1 - env.cloud_cover)} />
          <EnvRow label="Visibility" value={`${env.visibility_km.toFixed(1)} km`} color={env.visibility_km >= 10 ? '#00E5FF' : env.visibility_km >= 3 ? '#FFB800' : '#E24B4A'} />
          <EnvRow label="Thermal Contrast" value={env.thermal_contrast.toFixed(2)} color={qualityColor(env.thermal_contrast)} />
          <EnvRow label="Terrain Roughness" value={env.terrain_roughness.toFixed(2)} color={qualityColor(env.terrain_roughness)} />
          <EnvRow label="Terrain Map Cov" value={`${(env.terrain_map_coverage * 100).toFixed(0)}%`} color={qualityColor(env.terrain_map_coverage)} />
          <EnvRow label="Mag Field Quality" value={env.magnetic_field_quality.toFixed(2)} color={qualityColor(env.magnetic_field_quality)} />
          <EnvRow label="Mag Map Loaded" value={env.magnetic_map_loaded} />
          <EnvRow label="GNSS C/N₀" value={`${env.gnss_cn0_dbhz.toFixed(1)} dBHz`} color={env.gnss_cn0_dbhz >= 35 ? '#00E5FF' : env.gnss_cn0_dbhz >= 25 ? '#FFB800' : '#E24B4A'} />
          <EnvRow label="Satellites" value={env.gnss_satellite_count} color={env.gnss_satellite_count >= 8 ? '#00E5FF' : env.gnss_satellite_count >= 4 ? '#FFB800' : '#E24B4A'} />
          <EnvRow label="RF Noise Floor" value={`${env.rf_noise_floor_dbm.toFixed(0)} dBm`} color={env.rf_noise_floor_dbm < -100 ? '#00E5FF' : '#E24B4A'} />
          <EnvRow label="EW Threat" value={env.ew_threat_detected} color={env.ew_threat_detected ? '#E24B4A' : '#5A6A82'} />
          <EnvRow label="EO Image Quality" value={env.eo_image_quality.toFixed(2)} color={qualityColor(env.eo_image_quality)} />
          <EnvRow label="Altitude AGL" value={`${env.altitude_agl_m.toFixed(0)}m`} />
        </div>
      </div>
    </div>
  )
}
