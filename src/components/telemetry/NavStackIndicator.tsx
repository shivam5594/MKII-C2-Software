import { useNavigationStore } from '../../stores/navigationStore'

interface NavLayer {
  label: string
  shortLabel: string
  paramIds: string[]
  color: string
}

const NAV_LAYERS: NavLayer[] = [
  {
    label: 'INS/IMU',
    shortLabel: 'INS',
    paramIds: ['imu_gyro_x', 'imu_gyro_y', 'imu_gyro_z', 'imu_accel_bias', 'imu_alignment', 'imu_temperature'],
    color: '#00FF88',
  },
  {
    label: 'GNSS',
    shortLabel: 'GNSS',
    paramIds: ['gnss_l1_snr', 'gnss_l5_snr', 'gnss_navic_l5', 'gnss_navic_s', 'gnss_glonass', 'gnss_pdop', 'gnss_raim'],
    color: '#00E5FF',
  },
  {
    label: 'TERCOM',
    shortLabel: 'TER',
    paramIds: ['tercom_ralt', 'tercom_dem_corr', 'tercom_terrain_var', 'tercom_update_age'],
    color: '#FFB800',
  },
  {
    label: 'MagNav',
    shortLabel: 'MAG',
    paramIds: ['magnav_field_str', 'magnav_map_corr', 'magnav_anomaly'],
    color: '#D4B86A',
  },
  {
    label: 'ScMatch',
    shortLabel: 'SCN',
    paramIds: ['scene_eo_quality', 'scene_dsmac_corr', 'scene_vio', 'scene_lighting'],
    color: '#80F0FF',
  },
]

function getBarColor(confidence: number, baseColor: string): string {
  if (confidence < 0.2) return '#E24B4A'
  if (confidence < 0.4) return '#FF6B35'
  if (confidence < 0.6) return '#FFB800'
  return baseColor
}

export default function NavStackIndicator() {
  const parameters = useNavigationStore((s) => s.parameters)

  return (
    <div className="flex flex-col gap-2.5">
      {NAV_LAYERS.map((layer) => {
        let sum = 0
        let count = 0
        for (const id of layer.paramIds) {
          const p = parameters[id]
          if (p) {
            sum += p.confidence
            count++
          }
        }
        const confidence = count > 0 ? sum / count : 0
        const pct = Math.max(0, Math.min(100, confidence * 100))
        const barColor = getBarColor(confidence, layer.color)

        return (
          <div key={layer.label} className="flex items-center gap-2">
            <span
              className="font-mono text-xs w-11 text-right uppercase tracking-wider shrink-0"
              style={{ color: '#8899AA' }}
            >
              {layer.shortLabel}
            </span>
            <div
              className="flex-1 h-3 rounded-sm overflow-hidden"
              style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}
            >
              <div
                className="h-full rounded-sm transition-all duration-300 ease-out"
                style={{
                  width: `${pct}%`,
                  backgroundColor: barColor,
                  boxShadow: `0 0 8px ${barColor}50`,
                }}
              />
            </div>
            <span
              className="font-mono text-xs w-10 text-right tabular-nums font-medium"
              style={{ color: barColor }}
            >
              {Math.round(pct)}%
            </span>
          </div>
        )
      })}
    </div>
  )
}
