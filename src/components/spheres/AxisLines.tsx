import { useMemo } from 'react'
import * as THREE from 'three'
import { Html } from '@react-three/drei'
import { ALGORITHM_AXES } from '../../three/geometries/IcoSpherePoints'

const AXIS_COLORS = ['#00FF88', '#00E5FF', '#FFB800', '#D4B86A', '#80F0FF']
const AXIS_LENGTH = 1.5 // extends past the r=1.0 sphere surface

export default function AxisLines() {
  const lines = useMemo(() => {
    return ALGORITHM_AXES.map((axis, i) => {
      const [dx, dy, dz] = axis.dir
      const positions = new Float32Array([
        0, 0, 0,
        dx * AXIS_LENGTH, dy * AXIS_LENGTH, dz * AXIS_LENGTH,
      ])
      const geo = new THREE.BufferGeometry()
      geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
      return { geo, color: AXIS_COLORS[i], name: axis.name, dir: axis.dir }
    })
  }, [])

  return (
    <group>
      {lines.map((l, i) => (
        <group key={i}>
          {/* Axis line */}
          <lineSegments geometry={l.geo}>
            <lineBasicMaterial color={l.color} transparent opacity={0.3} />
          </lineSegments>

          {/* Label at tip */}
          <Html
            position={[
              l.dir[0] * (AXIS_LENGTH + 0.15),
              l.dir[1] * (AXIS_LENGTH + 0.15),
              l.dir[2] * (AXIS_LENGTH + 0.15),
            ]}
            center
            style={{
              color: l.color,
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '10px',
              fontWeight: 600,
              letterSpacing: '0.1em',
              whiteSpace: 'nowrap',
              userSelect: 'none',
              pointerEvents: 'none',
              opacity: 0.7,
            }}
          >
            {l.name}
          </Html>
        </group>
      ))}
    </group>
  )
}
