import { useTelemetryStore } from '../../stores/telemetryStore'

export default function FlightInstruments() {
  const values = useTelemetryStore((s) => s.values)

  const ias = values.ias ?? 95
  const alt = values.alt_msl ?? 2000
  const vs = values.vs ?? 0
  const roll = values.phi ?? 0
  const pitch = values.theta ?? -2
  const heading = values.psi ?? 270
  const gLoad = values.g_load ?? 1.0
  const mach = values.mach ?? 0.15

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', justifyItems: 'center', padding: '4px' }}>
      <AttitudeIndicator roll={roll} pitch={pitch} />
      <AirspeedIndicator ias={ias} mach={mach} />
      <AltitudeIndicator alt={alt} vs={vs} />
      <HeadingIndicator heading={heading} />
      <VSI vs={vs} />
      <GLoadIndicator gLoad={gLoad} />
    </div>
  )
}

// All instruments use a 120x120 viewBox with content drawn within r=48 from center (60,60).
// This gives 12px padding on all sides — no cropping.

const S = 120 // viewBox size
const C = 60  // center
const R = 46  // max content radius (leaves 14px padding)
const TR = 38 // tick label radius
const IR = 40 // inner tick radius

// ── Attitude Indicator ──

function AttitudeIndicator({ roll, pitch }: { roll: number; pitch: number }) {
  const pitchPx = pitch * 1.5

  return (
    <InstrumentFrame label="ATT">
      <defs>
        <clipPath id="att-clip">
          <circle cx={C} cy={C} r={R} />
        </clipPath>
      </defs>
      <g clipPath="url(#att-clip)">
        <g transform={`rotate(${-roll}, ${C}, ${C})`}>
          <rect x={-S} y={-S * 2} width={S * 3} height={S * 2 + C + pitchPx} fill="#1a3a5c" />
          <rect x={-S} y={C + pitchPx} width={S * 3} height={S * 3} fill="#4a3520" />
          <line x1={-S} y1={C + pitchPx} x2={S * 2} y2={C + pitchPx} stroke="#FFB800" strokeWidth={1.5} />
          {[-20, -10, 10, 20].map((deg) => {
            const y = C + pitchPx - deg * 1.5
            const w = Math.abs(deg) === 10 ? 16 : 10
            return (
              <g key={deg}>
                <line x1={C - w} y1={y} x2={C + w} y2={y} stroke="rgba(255,255,255,0.5)" strokeWidth={0.8} />
                <text x={C + w + 3} y={y + 3} fill="rgba(255,255,255,0.4)" fontSize="6" fontFamily="'JetBrains Mono'">{Math.abs(deg)}</text>
              </g>
            )
          })}
        </g>
        <line x1={C - 20} y1={C} x2={C - 6} y2={C} stroke="#00E5FF" strokeWidth={2} />
        <line x1={C + 6} y1={C} x2={C + 20} y2={C} stroke="#00E5FF" strokeWidth={2} />
        <circle cx={C} cy={C} r={2.5} fill="none" stroke="#00E5FF" strokeWidth={1.5} />
      </g>
      {/* Roll arc outside clip */}
      {[-60, -45, -30, -20, -10, 0, 10, 20, 30, 45, 60].map((deg) => {
        const rad = (deg - 90) * Math.PI / 180
        const x1 = C + (R - 4) * Math.cos(rad)
        const y1 = C + (R - 4) * Math.sin(rad)
        const x2 = C + R * Math.cos(rad)
        const y2 = C + R * Math.sin(rad)
        return <line key={deg} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(255,255,255,0.3)" strokeWidth={deg === 0 ? 1.5 : 0.7} />
      })}
      <g transform={`rotate(${-roll}, ${C}, ${C})`}>
        <polygon points={`${C},${C - R + 1} ${C - 3},${C - R + 6} ${C + 3},${C - R + 6}`} fill="#00E5FF" />
      </g>
    </InstrumentFrame>
  )
}

// ── Airspeed Indicator ──

function AirspeedIndicator({ ias, mach }: { ias: number; mach: number }) {
  return (
    <InstrumentFrame label="IAS">
      <ArcRange startVal={0} endVal={180} rangeStart={60} rangeEnd={130} color="#00FF88" />
      <ArcRange startVal={0} endVal={180} rangeStart={130} rangeEnd={150} color="#FFB800" />
      <ArcRange startVal={0} endVal={180} rangeStart={150} rangeEnd={180} color="#E24B4A" />
      {[0, 30, 60, 90, 120, 150, 180].map((spd) => (
        <DialTick key={spd} value={spd} min={0} max={180} label={String(spd)} />
      ))}
      <Needle value={ias} min={0} max={180} />
      <text x={C} y={C + 10} textAnchor="middle" fill="#00E5FF" fontSize="14" fontWeight={700} fontFamily="'JetBrains Mono'">
        {Math.round(ias)}
      </text>
      <text x={C} y={C + 20} textAnchor="middle" fill="#5A6A82" fontSize="7" fontFamily="'JetBrains Mono'">
        M{mach.toFixed(2)}
      </text>
    </InstrumentFrame>
  )
}

// ── Altitude Indicator ──

function AltitudeIndicator({ alt, vs }: { alt: number; vs: number }) {
  return (
    <InstrumentFrame label="ALT">
      {[0, 1000, 2000, 3000, 4000, 5000].map((a) => (
        <DialTick key={a} value={a} min={0} max={5000} label={`${a / 1000}k`} />
      ))}
      <Needle value={alt} min={0} max={5000} />
      <text x={C} y={C + 8} textAnchor="middle" fill="#00E5FF" fontSize="13" fontWeight={700} fontFamily="'JetBrains Mono'">
        {Math.round(alt)}
      </text>
      <text x={C} y={C + 19} textAnchor="middle" fill="#5A6A82" fontSize="7" fontFamily="'JetBrains Mono'">
        {vs >= 0 ? '+' : ''}{vs.toFixed(1)} m/s
      </text>
    </InstrumentFrame>
  )
}

// ── Heading Indicator ──

function HeadingIndicator({ heading }: { heading: number }) {
  const cardinals: [number, string][] = [[0, 'N'], [90, 'E'], [180, 'S'], [270, 'W']]

  return (
    <InstrumentFrame label="HDG">
      <g transform={`rotate(${-heading}, ${C}, ${C})`}>
        {Array.from({ length: 12 }, (_, i) => i * 30).map((deg) => {
          const rad = (deg - 90) * Math.PI / 180
          return <line key={deg} x1={C + IR * Math.cos(rad)} y1={C + IR * Math.sin(rad)} x2={C + R * Math.cos(rad)} y2={C + R * Math.sin(rad)} stroke="rgba(255,255,255,0.4)" strokeWidth={1} />
        })}
        {cardinals.map(([deg, label]) => {
          const rad = (deg - 90) * Math.PI / 180
          return (
            <text key={label} x={C + (TR - 4) * Math.cos(rad)} y={C + (TR - 4) * Math.sin(rad) + 3} textAnchor="middle" fill={label === 'N' ? '#E24B4A' : '#8899AA'} fontSize="9" fontWeight={600} fontFamily="'JetBrains Mono'">
              {label}
            </text>
          )
        })}
      </g>
      <polygon points={`${C},${C - R} ${C - 3},${C - R - 5} ${C + 3},${C - R - 5}`} fill="#00E5FF" />
      <text x={C} y={C + 5} textAnchor="middle" fill="#00E5FF" fontSize="14" fontWeight={700} fontFamily="'JetBrains Mono'">
        {Math.round(heading).toString().padStart(3, '0')}°
      </text>
    </InstrumentFrame>
  )
}

// ── Vertical Speed Indicator ──

function VSI({ vs }: { vs: number }) {
  return (
    <InstrumentFrame label="VSI">
      {[-30, -20, -10, 0, 10, 20, 30].map((v) => (
        <DialTick key={v} value={v} min={-30} max={30} label={String(v)} bold={v === 0} />
      ))}
      <Needle value={vs} min={-30} max={30} />
      <text x={C} y={C + 8} textAnchor="middle" fill={vs > 5 ? '#00FF88' : vs < -5 ? '#FFB800' : '#00E5FF'} fontSize="13" fontWeight={700} fontFamily="'JetBrains Mono'">
        {vs >= 0 ? '+' : ''}{vs.toFixed(1)}
      </text>
      <text x={C} y={C + 19} textAnchor="middle" fill="#5A6A82" fontSize="7" fontFamily="'JetBrains Mono'">m/s</text>
    </InstrumentFrame>
  )
}

// ── G-Load Indicator ──

function GLoadIndicator({ gLoad }: { gLoad: number }) {
  const color = gLoad > 3.5 ? '#E24B4A' : gLoad > 3.0 ? '#FFB800' : '#00E5FF'

  return (
    <InstrumentFrame label="G-LOAD">
      {[-1, 0, 1, 2, 3, 4].map((g) => (
        <DialTick key={g} value={g} min={-1} max={4} label={String(g)} bold={g === 1} />
      ))}
      <Needle value={gLoad} min={-1} max={4} />
      <text x={C} y={C + 8} textAnchor="middle" fill={color} fontSize="14" fontWeight={700} fontFamily="'JetBrains Mono'">
        {gLoad.toFixed(2)}
      </text>
      <text x={C} y={C + 19} textAnchor="middle" fill="#5A6A82" fontSize="7" fontFamily="'JetBrains Mono'">g</text>
    </InstrumentFrame>
  )
}

// ── Shared Components ──

function InstrumentFrame({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
      <div style={{
        backgroundColor: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '50%',
        padding: '4px',
      }}>
        <svg width={S} height={S} viewBox={`0 0 ${S} ${S}`}>
          <circle cx={C} cy={C} r={R + 2} fill="rgba(6,10,18,0.9)" stroke="rgba(255,255,255,0.1)" strokeWidth={1} />
          {children}
        </svg>
      </div>
      <span className="font-mono" style={{ fontSize: '9px', color: '#8899AA', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
        {label}
      </span>
    </div>
  )
}

function DialTick({ value, min, max, label, bold }: { value: number; min: number; max: number; label: string; bold?: boolean }) {
  const norm = (value - min) / (max - min)
  const angle = 225 + norm * 270
  const rad = (angle - 90) * Math.PI / 180
  return (
    <g>
      <line x1={C + IR * Math.cos(rad)} y1={C + IR * Math.sin(rad)} x2={C + R * Math.cos(rad)} y2={C + R * Math.sin(rad)} stroke="rgba(255,255,255,0.5)" strokeWidth={bold ? 1.5 : 0.8} />
      <text x={C + (TR - 6) * Math.cos(rad)} y={C + (TR - 6) * Math.sin(rad) + 3} textAnchor="middle" fill="#8899AA" fontSize="7" fontFamily="'JetBrains Mono'">{label}</text>
    </g>
  )
}

function Needle({ value, min, max }: { value: number; min: number; max: number }) {
  const norm = Math.max(0, Math.min(1, (value - min) / (max - min)))
  const angle = 225 + norm * 270
  const rad = (angle - 90) * Math.PI / 180
  const tipX = C + (R - 4) * Math.cos(rad)
  const tipY = C + (R - 4) * Math.sin(rad)
  const tailX = C - 5 * Math.cos(rad)
  const tailY = C - 5 * Math.sin(rad)

  return (
    <g>
      <line x1={tailX} y1={tailY} x2={tipX} y2={tipY} stroke="#FFFFFF" strokeWidth={1.5} />
      <circle cx={C} cy={C} r={3} fill="#1A2332" stroke="rgba(255,255,255,0.3)" strokeWidth={1} />
    </g>
  )
}

function ArcRange({ startVal, endVal, rangeStart, rangeEnd, color }: {
  startVal: number; endVal: number; rangeStart: number; rangeEnd: number; color: string
}) {
  const range = endVal - startVal
  const sAngle = 225 + ((rangeStart - startVal) / range) * 270
  const eAngle = 225 + ((rangeEnd - startVal) / range) * 270
  const sRad = (sAngle - 90) * Math.PI / 180
  const eRad = (eAngle - 90) * Math.PI / 180
  const arcR = R - 1
  const sx = C + arcR * Math.cos(sRad)
  const sy = C + arcR * Math.sin(sRad)
  const ex = C + arcR * Math.cos(eRad)
  const ey = C + arcR * Math.sin(eRad)
  const largeArc = (eAngle - sAngle) > 180 ? 1 : 0

  return (
    <path d={`M ${sx} ${sy} A ${arcR} ${arcR} 0 ${largeArc} 1 ${ex} ${ey}`} fill="none" stroke={color} strokeWidth={3} opacity={0.4} />
  )
}
