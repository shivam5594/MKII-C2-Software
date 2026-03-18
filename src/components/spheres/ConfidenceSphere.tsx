import { Html } from '@react-three/drei'
import SphereParticles from './SphereParticles'
import ReferenceWireframe from './ReferenceWireframe'
import AxisLines from './AxisLines'

interface ConfidenceSphereProps {
  mode: 'threat' | 'response'
  label: string
}

export default function ConfidenceSphere({ mode, label }: ConfidenceSphereProps) {
  return (
    <group>
      <Html
        position={[0, 1.8, 0]}
        center
        style={{
          color: '#8899AA',
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '11px',
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          whiteSpace: 'nowrap',
          userSelect: 'none',
          pointerEvents: 'none',
        }}
      >
        {label}
      </Html>

      <group>
        <SphereParticles mode={mode} />
        <ReferenceWireframe radius={1.0} order={2} />
        <AxisLines />
      </group>
    </group>
  )
}
