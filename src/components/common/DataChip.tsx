interface DataChipProps {
  label: string
  value: string | number
  color?: string
}

export default function DataChip({ label, value, color = '#B0BFCC' }: DataChipProps) {
  return (
    <div className="flex flex-col gap-0.5">
      <span
        style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: '10px',
          lineHeight: '12px',
          color: '#5A6A82',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
        }}
      >
        {label}
      </span>
      <span
        className="font-mono tabular-nums font-medium"
        style={{
          fontSize: '13px',
          lineHeight: '16px',
          color,
        }}
      >
        {value}
      </span>
    </div>
  )
}
