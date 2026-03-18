import { LOGO_PATHS } from '../../assets/brand-tokens'

interface LogoProps {
  height?: number
  className?: string
}

export default function Logo({ height = 120, className = '' }: LogoProps) {
  const aspect = LOGO_PATHS.VIEWBOX_W / LOGO_PATHS.VIEWBOX_H
  const width = height * aspect

  return (
    <svg
      viewBox={`0 0 ${LOGO_PATHS.VIEWBOX_W} ${LOGO_PATHS.VIEWBOX_H}`}
      width={width}
      height={height}
      className={className}
      aria-label="MK-//"
    >
      {/* MK in white */}
      <path d={LOGO_PATHS.M} fill="#FFFFFF" />
      <path d={LOGO_PATHS.K} fill="#FFFFFF" />
      {/* -// in cyan */}
      <path d={LOGO_PATHS.DASH} fill="#00E5FF" />
      <path d={LOGO_PATHS.SLASH_1} fill="#00E5FF" />
      <path d={LOGO_PATHS.SLASH_2} fill="#00E5FF" />
    </svg>
  )
}
