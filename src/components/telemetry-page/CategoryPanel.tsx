import { useTelemetryStore } from '../../stores/telemetryStore'
import { TELEMETRY_PARAMS, TELEMETRY_CATEGORIES } from '../../types/telemetry'
import type { TelemetryCategory } from '../../types/telemetry'
import TelemetryGauge from './TelemetryGauge'
import TelemetrySparkline from './TelemetrySparkline'

// Params best displayed as gauges
const GAUGE_PARAMS = new Set([
  'ias', 'eng_rpm', 'egt', 'fuel_pct', 'oil_p', 'oil_t', 'thr_pos',
  'vbus', 'bat_soc', 'bat_temp', 'link_qual', 'g_load',
])

export default function CategoryPanel() {
  const activeCategory = useTelemetryStore((s) => s.activeCategory)
  const setActiveCategory = useTelemetryStore((s) => s.setActiveCategory)
  const values = useTelemetryStore((s) => s.values)
  const history = useTelemetryStore((s) => s.history)

  const categoryParams = TELEMETRY_PARAMS.filter((p) => p.category === activeCategory)
  const gaugeParams = categoryParams.filter((p) => GAUGE_PARAMS.has(p.id))
  const sparklineParams = categoryParams.filter((p) => !GAUGE_PARAMS.has(p.id))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Category tabs */}
      <div style={{
        display: 'flex',
        gap: '2px',
        padding: '8px 12px',
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
              padding: '4px 8px',
              borderRadius: '4px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '9px',
              fontWeight: 600,
              backgroundColor: activeCategory === cat.id ? 'rgba(255,255,255,0.06)' : 'transparent',
              color: activeCategory === cat.id ? cat.color : '#5A6A82',
              transition: 'all 0.15s',
            }}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px', minHeight: 0 }}>
        {/* Gauges row */}
        {gaugeParams.length > 0 && (
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px',
            justifyContent: 'center',
            marginBottom: '12px',
            paddingBottom: '12px',
            borderBottom: '1px solid rgba(255,255,255,0.04)',
          }}>
            {gaugeParams.map((p) => (
              <TelemetryGauge key={p.id} param={p} value={values[p.id] ?? p.nominalCruise} size={90} />
            ))}
          </div>
        )}

        {/* Sparklines grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
          gap: '6px',
        }}>
          {sparklineParams.map((p) => (
            <TelemetrySparkline
              key={p.id}
              param={p}
              value={values[p.id] ?? p.nominalCruise}
              history={history[p.id] ?? []}
              width={200}
              height={36}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
