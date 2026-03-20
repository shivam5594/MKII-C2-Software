import { useTelemetryStore } from '../../stores/telemetryStore'
import { TELEMETRY_PARAM_MAP } from '../../types/telemetry'

export default function StatusBar() {
  const values = useTelemetryStore((s) => s.values)

  const items = [
    { label: 'IAS', value: `${Math.round(values.ias ?? 95)} kt`, param: 'ias' },
    { label: 'ALT', value: `${Math.round(values.alt_msl ?? 2000)} m`, param: 'alt_msl' },
    { label: 'HDG', value: `${Math.round(values.psi ?? 270)}°`, param: 'psi' },
    { label: 'GS', value: `${Math.round(values.gs ?? 98)} kt`, param: 'gs' },
    { label: 'FUEL', value: `${Math.round(values.fuel_pct ?? 78)}%`, param: 'fuel_pct' },
    { label: 'RPM', value: `${Math.round(values.eng_rpm ?? 6200)}`, param: 'eng_rpm' },
    { label: 'EGT', value: `${Math.round(values.egt ?? 580)}°C`, param: 'egt' },
    { label: 'VBUS', value: `${(values.vbus ?? 25.2).toFixed(1)}V`, param: 'vbus' },
    { label: 'LINK', value: `${Math.round(values.link_qual ?? 92)}%`, param: 'link_qual' },
    { label: 'PHASE', value: TELEMETRY_PARAM_MAP.flt_phase?.enumLabels?.[Math.round(values.flt_phase ?? 3)] ?? 'CRUISE', param: 'flt_phase' },
  ]

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      padding: '6px 16px',
      borderBottom: '1px solid rgba(255,255,255,0.06)',
      backgroundColor: 'rgba(10, 14, 26, 0.8)',
      flexShrink: 0,
      overflowX: 'auto',
    }}>
      {items.map((item) => {
        const p = TELEMETRY_PARAM_MAP[item.param]
        const v = values[item.param] ?? p?.nominalCruise ?? 0
        let color = '#B0BFCC'
        if (p) {
          if ((p.criticalHigh !== undefined && v >= p.criticalHigh) ||
              (p.criticalLow !== undefined && v <= p.criticalLow)) {
            color = '#E24B4A'
          } else if ((p.warningHigh !== undefined && v >= p.warningHigh) ||
                     (p.warningLow !== undefined && v <= p.warningLow)) {
            color = '#FFB800'
          }
        }

        return (
          <div key={item.label} className="flex items-center gap-1.5 shrink-0">
            <span className="font-mono" style={{ fontSize: '9px', color: '#5A6A82', letterSpacing: '0.08em' }}>
              {item.label}
            </span>
            <span className="font-mono font-semibold" style={{ fontSize: '11px', color }}>
              {item.value}
            </span>
          </div>
        )
      })}
    </div>
  )
}
