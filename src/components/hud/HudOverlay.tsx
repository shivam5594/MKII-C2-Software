import { useUIStore } from '../../stores/uiStore'
import { useTelemetryStore } from '../../stores/telemetryStore'
import HudPitchLadder from './HudPitchLadder'
import HudAirspeedTape from './HudAirspeedTape'
import HudAltitudeTape from './HudAltitudeTape'
import HudHeadingTape from './HudHeadingTape'

export default function HudOverlay() {
  const hudVisible = useUIStore((s) => s.hudVisible)
  const values = useTelemetryStore((s) => s.values)

  if (!hudVisible) return null

  const ias = values.ias ?? 0
  const mach = values.mach ?? 0
  const alt = values.alt_msl ?? 0
  const vs = values.vs ?? 0
  const pitch = values.theta ?? 0
  const roll = values.phi ?? 0
  const heading = values.psi ?? 0

  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      pointerEvents: 'none',
      zIndex: 10,
      overflow: 'hidden',
    }}>
      {/* SVG filter for dark outline on all symbology — ensures readability on bright maps */}
      <svg width={0} height={0} style={{ position: 'absolute' }}>
        <defs>
          <filter id="hud-shadow" x="-10%" y="-10%" width="120%" height="120%">
            <feMorphology in="SourceAlpha" operator="dilate" radius="1.2" result="expanded" />
            <feFlood floodColor="#000000" floodOpacity="0.8" result="black" />
            <feComposite in="black" in2="expanded" operator="in" result="shadow" />
            <feMerge>
              <feMergeNode in="shadow" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
      </svg>

      {/* IAS tape — left edge */}
      <div style={{
        position: 'absolute',
        left: 40,
        top: '50%',
        transform: 'translateY(-55%)',
      }}>
        <HudAirspeedTape ias={ias} mach={mach} />
      </div>

      {/* Pitch ladder — center */}
      <div style={{
        position: 'absolute',
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -55%)',
      }}>
        <HudPitchLadder pitch={pitch} roll={roll} />
      </div>

      {/* ALT tape — right edge */}
      <div style={{
        position: 'absolute',
        right: 40,
        top: '50%',
        transform: 'translateY(-55%)',
      }}>
        <HudAltitudeTape altitude={alt} vs={vs} />
      </div>

      {/* Heading tape — bottom center */}
      <div style={{
        position: 'absolute',
        bottom: 24,
        left: '50%',
        transform: 'translateX(-50%)',
      }}>
        <HudHeadingTape heading={heading} />
      </div>
    </div>
  )
}
