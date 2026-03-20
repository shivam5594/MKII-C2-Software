// Standalone Attitude Indicator (Artificial Horizon)
// Uses a 160x160 viewBox with 14px padding — no cropping

const S = 160
const C = 80
const R = 64

interface Props {
  roll: number
  pitch: number
}

export default function AttitudeIndicator({ roll, pitch }: Props) {
  const pitchPx = pitch * 2

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
      <div style={{
        backgroundColor: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '50%',
        padding: '6px',
      }}>
        <svg width={S} height={S} viewBox={`0 0 ${S} ${S}`}>
          <circle cx={C} cy={C} r={R + 2} fill="rgba(6,10,18,0.9)" stroke="rgba(255,255,255,0.1)" strokeWidth={1} />

          <defs>
            <clipPath id="att-clip-main">
              <circle cx={C} cy={C} r={R} />
            </clipPath>
          </defs>

          <g clipPath="url(#att-clip-main)">
            <g transform={`rotate(${-roll}, ${C}, ${C})`}>
              {/* Sky */}
              <rect x={-S} y={-S * 2} width={S * 3} height={S * 2 + C + pitchPx} fill="#1a3a5c" />
              {/* Ground */}
              <rect x={-S} y={C + pitchPx} width={S * 3} height={S * 3} fill="#4a3520" />
              {/* Horizon line */}
              <line x1={-S} y1={C + pitchPx} x2={S * 2} y2={C + pitchPx} stroke="#FFB800" strokeWidth={1.5} />
              {/* Pitch ladder */}
              {[-20, -10, 10, 20].map((deg) => {
                const y = C + pitchPx - deg * 2
                const w = Math.abs(deg) === 10 ? 20 : 14
                return (
                  <g key={deg}>
                    <line x1={C - w} y1={y} x2={C + w} y2={y} stroke="rgba(255,255,255,0.5)" strokeWidth={0.8} />
                    <text x={C + w + 4} y={y + 3} fill="rgba(255,255,255,0.4)" fontSize="8" fontFamily="'JetBrains Mono'">{Math.abs(deg)}</text>
                  </g>
                )
              })}
            </g>
            {/* Fixed aircraft symbol */}
            <line x1={C - 28} y1={C} x2={C - 8} y2={C} stroke="#00E5FF" strokeWidth={2.5} />
            <line x1={C + 8} y1={C} x2={C + 28} y2={C} stroke="#00E5FF" strokeWidth={2.5} />
            <circle cx={C} cy={C} r={3} fill="none" stroke="#00E5FF" strokeWidth={2} />
          </g>

          {/* Roll arc */}
          {[-60, -45, -30, -20, -10, 0, 10, 20, 30, 45, 60].map((deg) => {
            const rad = (deg - 90) * Math.PI / 180
            const x1 = C + (R - 5) * Math.cos(rad)
            const y1 = C + (R - 5) * Math.sin(rad)
            const x2 = C + (R + 1) * Math.cos(rad)
            const y2 = C + (R + 1) * Math.sin(rad)
            return <line key={deg} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(255,255,255,0.35)" strokeWidth={deg === 0 ? 1.5 : 0.7} />
          })}
          <g transform={`rotate(${-roll}, ${C}, ${C})`}>
            <polygon points={`${C},${C - R + 2} ${C - 4},${C - R + 8} ${C + 4},${C - R + 8}`} fill="#00E5FF" />
          </g>

          {/* Roll / Pitch text */}
          <text x={C} y={S - 8} textAnchor="middle" fill="#5A6A82" fontSize="9" fontFamily="'JetBrains Mono'">
            {roll >= 0 ? '+' : ''}{roll.toFixed(1)}° / {pitch >= 0 ? '+' : ''}{pitch.toFixed(1)}°
          </text>
        </svg>
      </div>
      <span className="font-mono" style={{ fontSize: '9px', color: '#8899AA', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
        ATTITUDE
      </span>
    </div>
  )
}
