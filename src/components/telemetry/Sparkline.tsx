import { useMemo } from 'react'

interface SparklineProps {
  data: number[]
  width?: number
  height?: number
  color?: string
}

export default function Sparkline({ data, width = 44, height = 16, color = '#00E5FF' }: SparklineProps) {
  const path = useMemo(() => {
    if (data.length < 2) return ''
    const stepX = width / (data.length - 1)
    const min = 0
    const max = 1
    const range = max - min || 1

    return data
      .map((v, i) => {
        const x = i * stepX
        const y = height - ((Math.min(1, Math.max(0, v)) - min) / range) * height
        return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`
      })
      .join(' ')
  }, [data, width, height])

  if (data.length < 2) return <div style={{ width, height }} />

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      style={{ display: 'block', flexShrink: 0 }}
    >
      <path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
