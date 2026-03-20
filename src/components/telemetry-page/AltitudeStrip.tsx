// Rolling altitude strip indicator — tape-style display

interface Props {
  altitude: number
  vs: number
}

const STRIP_HEIGHT = 200
const STRIP_WIDTH = 100
const PX_PER_M = 0.4     // pixels per meter of altitude
const TICK_INTERVAL = 100 // meters between major ticks
const MINOR_TICK = 50     // meters between minor ticks

export default function AltitudeStrip({ altitude, vs }: Props) {
  // Visible range: altitude +/- half of strip height in meters
  const visibleRange = STRIP_HEIGHT / PX_PER_M / 2

  // Generate ticks within visible range
  const minAlt = Math.floor((altitude - visibleRange) / TICK_INTERVAL) * TICK_INTERVAL
  const maxAlt = Math.ceil((altitude + visibleRange) / TICK_INTERVAL) * TICK_INTERVAL

  const ticks: { alt: number; major: boolean }[] = []
  for (let a = minAlt; a <= maxAlt; a += MINOR_TICK) {
    ticks.push({ alt: a, major: a % TICK_INTERVAL === 0 })
  }

  const altToY = (a: number) => STRIP_HEIGHT / 2 - (a - altitude) * PX_PER_M

  const vsColor = vs > 2 ? '#00FF88' : vs < -2 ? '#FFB800' : '#00E5FF'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
      <div style={{
        position: 'relative',
        width: STRIP_WIDTH + 40,
        height: STRIP_HEIGHT,
        backgroundColor: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '6px',
        overflow: 'hidden',
      }}>
        <svg width={STRIP_WIDTH + 40} height={STRIP_HEIGHT} style={{ display: 'block' }}>
          {/* Background gradient */}
          <defs>
            <linearGradient id="alt-fade-top" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#060A12" stopOpacity="0.8" />
              <stop offset="0.15" stopColor="#060A12" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="alt-fade-bottom" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0.85" stopColor="#060A12" stopOpacity="0" />
              <stop offset="1" stopColor="#060A12" stopOpacity="0.8" />
            </linearGradient>
          </defs>

          {/* Ticks and labels */}
          {ticks.map(({ alt, major }) => {
            const y = altToY(alt)
            if (y < -10 || y > STRIP_HEIGHT + 10) return null
            return (
              <g key={alt}>
                <line
                  x1={major ? 10 : 18}
                  y1={y}
                  x2={28}
                  y2={y}
                  stroke={major ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.15)'}
                  strokeWidth={major ? 1 : 0.5}
                />
                {major && (
                  <text
                    x={32}
                    y={y + 3}
                    fill="#8899AA"
                    fontSize="9"
                    fontFamily="'JetBrains Mono'"
                  >
                    {alt}
                  </text>
                )}
              </g>
            )
          })}

          {/* Current altitude marker (center) */}
          <rect x={0} y={STRIP_HEIGHT / 2 - 12} width={STRIP_WIDTH + 40} height={24} fill="rgba(0, 229, 255, 0.08)" />
          <line x1={0} y1={STRIP_HEIGHT / 2} x2={28} y2={STRIP_HEIGHT / 2} stroke="#00E5FF" strokeWidth={2} />

          {/* Digital readout box */}
          <rect x={30} y={STRIP_HEIGHT / 2 - 11} width={70} height={22} rx={3} fill="rgba(6,10,18,0.95)" stroke="#00E5FF" strokeWidth={1} />
          <text x={65} y={STRIP_HEIGHT / 2 + 4} textAnchor="middle" fill="#00E5FF" fontSize="13" fontWeight={700} fontFamily="'JetBrains Mono'">
            {Math.round(altitude)}
          </text>

          {/* VS trend arrow */}
          {Math.abs(vs) > 0.5 && (
            <g>
              <line
                x1={STRIP_WIDTH + 28}
                y1={STRIP_HEIGHT / 2}
                x2={STRIP_WIDTH + 28}
                y2={STRIP_HEIGHT / 2 - vs * 4}
                stroke={vsColor}
                strokeWidth={2}
              />
              <polygon
                points={vs > 0
                  ? `${STRIP_WIDTH + 24},${STRIP_HEIGHT / 2 - vs * 4 + 4} ${STRIP_WIDTH + 32},${STRIP_HEIGHT / 2 - vs * 4 + 4} ${STRIP_WIDTH + 28},${STRIP_HEIGHT / 2 - vs * 4}`
                  : `${STRIP_WIDTH + 24},${STRIP_HEIGHT / 2 - vs * 4 - 4} ${STRIP_WIDTH + 32},${STRIP_HEIGHT / 2 - vs * 4 - 4} ${STRIP_WIDTH + 28},${STRIP_HEIGHT / 2 - vs * 4}`
                }
                fill={vsColor}
              />
            </g>
          )}

          {/* Fade overlays */}
          <rect x={0} y={0} width={STRIP_WIDTH + 40} height={STRIP_HEIGHT} fill="url(#alt-fade-top)" />
          <rect x={0} y={0} width={STRIP_WIDTH + 40} height={STRIP_HEIGHT} fill="url(#alt-fade-bottom)" />
        </svg>
      </div>

      {/* VS readout */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
        <span className="font-mono" style={{ fontSize: '9px', color: '#8899AA', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          ALT
        </span>
        <span className="font-mono" style={{ fontSize: '9px', color: '#5A6A82' }}>
          VS {vs >= 0 ? '+' : ''}{vs.toFixed(1)} m/s
        </span>
      </div>
    </div>
  )
}
