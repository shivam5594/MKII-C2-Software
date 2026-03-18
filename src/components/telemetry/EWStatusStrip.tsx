import { useNavigationStore } from '../../stores/navigationStore'
import { useUIStore } from '../../stores/uiStore'

export default function EWStatusStrip() {
  const parameters = useNavigationStore((s) => s.parameters)
  const activeScenario = useUIStore((s) => s.activeScenario)

  const jamPower = parameters['ew_jam_power']?.confidence ?? 0.95
  const spoofConf = parameters['ew_spoof_conf']?.confidence ?? 0.95

  const jamming = jamPower < 0.5
  const spoofing = spoofConf < 0.5
  const scenarioId = activeScenario?.id

  let threatLevel = 'CLEAR'
  let threatColor = '#00E5FF'
  if (scenarioId === 'spoof-attack' && spoofing) {
    threatLevel = 'SPOOF DETECTED'
    threatColor = '#E24B4A'
  } else if (scenarioId === 'gnss-jam' && jamming) {
    threatLevel = 'JAMMING'
    threatColor = '#FF6B35'
  } else if (jamming || spoofing) {
    threatLevel = 'CAUTION'
    threatColor = '#FFB800'
  }

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-1.5">
        <div
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: threatColor }}
        />
        <span className="font-mono text-xs tracking-wider font-medium" style={{ color: threatColor }}>
          EW: {threatLevel}
        </span>
      </div>

      <div className="w-px h-3" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }} />

      <span className="font-mono text-xs" style={{ color: '#8899AA' }}>
        JAM PWR: <span className="font-medium" style={{ color: jamming ? '#E24B4A' : '#B0BFCC' }}>{(jamPower * 100).toFixed(0)}%</span>
      </span>

      <span className="font-mono text-xs" style={{ color: '#8899AA' }}>
        SPF DET: <span className="font-medium" style={{ color: spoofing ? '#E24B4A' : '#B0BFCC' }}>{(spoofConf * 100).toFixed(0)}%</span>
      </span>
    </div>
  )
}
