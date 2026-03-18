import { useMemo } from 'react'
import * as THREE from 'three'
import { generateIcoSphere, extractWireframeEdges } from '../../three/geometries/IcoSpherePoints'

interface ReferenceWireframeProps {
  radius?: number
  order?: number
}

export default function ReferenceWireframe({ radius = 1.0, order = 2 }: ReferenceWireframeProps) {
  const geometry = useMemo(() => {
    const sphere = generateIcoSphere(order)
    const edges = extractWireframeEdges(sphere.triangles)

    // Scale positions by radius
    const positions = new Float32Array(sphere.positions.length)
    for (let i = 0; i < positions.length; i++) {
      positions[i] = sphere.positions[i] * radius
    }

    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geo.setIndex(new THREE.BufferAttribute(edges, 1))

    return geo
  }, [radius, order])

  return (
    <lineSegments geometry={geometry}>
      <lineBasicMaterial
        color="#00E5FF"
        transparent
        opacity={0.06}
        depthWrite={false}
      />
    </lineSegments>
  )
}
