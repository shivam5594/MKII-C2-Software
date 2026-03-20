import { useState } from 'react'
import { useTelemetryStore } from '../../stores/telemetryStore'
import { TELEMETRY_PARAMS, TELEMETRY_CATEGORIES, TELEMETRY_PARAM_MAP } from '../../types/telemetry'
import type { TelemetryCategory } from '../../types/telemetry'
import FlightInstruments from './FlightInstruments'
import TelemetryGauge from './TelemetryGauge'
import TelemetrySparkline from './TelemetrySparkline'
import { ChevronDown, ChevronUp } from 'lucide-react'

// Params best displayed as gauges
const GAUGE_PARAMS = new Set([
  'ias', 'eng_rpm', 'egt', 'fuel_pct', 'oil_p', 'oil_t', 'thr_pos',
  'vbus', 'bat_soc', 'bat_temp', 'link_qual', 'g_load',
])

export default function TelemetryOverlay() {
  const values = useTelemetryStore((s) => s.values)
  const history = useTelemetryStore((s) => s.history)
  const [activeCategory, setActiveCategory] = useState<TelemetryCategory>('FLIGHT')
  const [pfdExpanded, setPfdExpanded] = useState(true)

  const categoryParams = TELEMETRY_PARAMS.filter((p) => p.category === activeCategory)
  const gaugeParams = categoryParams.filter((p) => GAUGE_PARAMS.has(p.id))
  const sparklineParams = categoryParams.filter((p) => !GAUGE_PARAMS.has(p.id))

  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      zIndex: 5,
      display: 'flex',
      flexDirection: 'column',
      pointerEvents: 'none',
      overflow: 'hidden',
    }}>
      {/* Top status strip */}
      <TopStatusStrip values={values} />

      {/* Main layout: PFD left, category data right */}
      <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
        {/* Left column: Primary Flight Display */}
        <div style={{
          width: pfdExpanded ? '340px' : '40px',
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
          pointerEvents: 'auto',
          transition: 'width 0.2s',
        }}>
          <button
            onClick={() => setPfdExpanded(!pfdExpanded)}
            className="font-mono text-xs tracking-wider uppercase font-medium"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '6px 10px',
              backgroundColor: 'rgba(6, 10, 18, 0.88)',
              backdropFilter: 'blur(8px)',
              border: 'none',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
              color: '#8899AA',
              cursor: 'pointer',
              textAlign: 'left',
            }}
          >
            {pfdExpanded ? <ChevronDown size={12} /> : <ChevronUp size={12} />}
            {pfdExpanded ? 'PFD' : ''}
          </button>
          {pfdExpanded && (
            <div style={{
              padding: '8px',
              backgroundColor: 'rgba(6, 10, 18, 0.88)',
              backdropFilter: 'blur(8px)',
              overflowY: 'auto',
              flex: 1,
              minHeight: 0,
            }}>
              <FlightInstruments />
            </div>
          )}
        </div>

        {/* Spacer — transparent, allows map interaction */}
        <div style={{ flex: 1 }} />

        {/* Right column: Category telemetry data */}
        <div style={{
          width: '420px',
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
          pointerEvents: 'auto',
          backgroundColor: 'rgba(6, 10, 18, 0.88)',
          backdropFilter: 'blur(8px)',
        }}>
          {/* Category tabs — scrollable horizontal */}
          <div style={{
            display: 'flex',
            gap: '1px',
            padding: '6px 8px',
            overflowX: 'auto',
            flexShrink: 0,
            borderBottom: '1px solid rgba(255,255,255,0.06)',
          }}>
            {TELEMETRY_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id as TelemetryCategory)}
                className="font-mono uppercase tracking-wider whitespace-nowrap"
                style={{
                  padding: '3px 6px',
                  borderRadius: '3px',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '8px',
                  fontWeight: 600,
                  backgroundColor: activeCategory === cat.id ? 'rgba(255,255,255,0.08)' : 'transparent',
                  color: activeCategory === cat.id ? cat.color : '#5A6A82',
                  transition: 'all 0.15s',
                }}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '8px', minHeight: 0 }}>
            {/* Gauges */}
            {gaugeParams.length > 0 && (
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '6px',
                justifyContent: 'center',
                marginBottom: '8px',
                paddingBottom: '8px',
                borderBottom: '1px solid rgba(255,255,255,0.04)',
              }}>
                {gaugeParams.map((p) => (
                  <TelemetryGauge key={p.id} param={p} value={values[p.id] ?? p.nominalCruise} size={80} />
                ))}
              </div>
            )}

            {/* Sparklines */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
              gap: '4px',
            }}>
              {sparklineParams.map((p) => (
                <TelemetrySparkline
                  key={p.id}
                  param={p}
                  value={values[p.id] ?? p.nominalCruise}
                  history={history[p.id] ?? []}
                  width={170}
                  height={30}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Compact top status strip ──

function TopStatusStrip({ values }: { values: Record<string, number> }) {
  const items = [
    { label: 'IAS', value: `${Math.round(values.ias ?? 95)}`, unit: 'kt', param: 'ias' },
    { label: 'ALT', value: `${Math.round(values.alt_msl ?? 2000)}`, unit: 'm', param: 'alt_msl' },
    { label: 'HDG', value: `${Math.round(values.psi ?? 270)}°`, unit: '', param: 'psi' },
    { label: 'GS', value: `${Math.round(values.gs ?? 98)}`, unit: 'kt', param: 'gs' },
    { label: 'FUEL', value: `${Math.round(values.fuel_pct ?? 78)}`, unit: '%', param: 'fuel_pct' },
    { label: 'RPM', value: `${Math.round(values.eng_rpm ?? 6200)}`, unit: '', param: 'eng_rpm' },
    { label: 'EGT', value: `${Math.round(values.egt ?? 580)}`, unit: '°C', param: 'egt' },
    { label: 'VBUS', value: `${(values.vbus ?? 25.2).toFixed(1)}`, unit: 'V', param: 'vbus' },
    { label: 'LINK', value: `${Math.round(values.link_qual ?? 92)}`, unit: '%', param: 'link_qual' },
    { label: 'PHASE', value: TELEMETRY_PARAM_MAP.flt_phase?.enumLabels?.[Math.round(values.flt_phase ?? 3)] ?? 'CRUISE', unit: '', param: 'flt_phase' },
  ]

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '5px 12px',
      backgroundColor: 'rgba(6, 10, 18, 0.88)',
      backdropFilter: 'blur(8px)',
      borderBottom: '1px solid rgba(255,255,255,0.06)',
      flexShrink: 0,
      overflowX: 'auto',
      pointerEvents: 'auto',
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
          <div key={item.label} className="flex items-center gap-1 shrink-0">
            <span className="font-mono" style={{ fontSize: '9px', color: '#5A6A82', letterSpacing: '0.06em' }}>
              {item.label}
            </span>
            <span className="font-mono font-semibold" style={{ fontSize: '11px', color }}>
              {item.value}
            </span>
            {item.unit && (
              <span className="font-mono" style={{ fontSize: '8px', color: '#5A6A82' }}>
                {item.unit}
              </span>
            )}
          </div>
        )
      })}
    </div>
  )
}
