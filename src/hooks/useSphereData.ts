import { useMemo } from 'react'
import { useNavigationStore } from '../stores/navigationStore'
import type { SphereParameterDefinition } from '../types/sphere'
import { GROUP_COLORS } from '../types/sphere'
import type { SphereRenderData } from '../types/sphere'
import { generateIcoSphere } from '../three/geometries/IcoSpherePoints'

function hexToRGB(hex: string): [number, number, number] {
  const h = hex.replace('#', '')
  return [
    parseInt(h.substring(0, 2), 16) / 255,
    parseInt(h.substring(2, 4), 16) / 255,
    parseInt(h.substring(4, 6), 16) / 255,
  ]
}

/**
 * Converts store state into Float32Arrays for GPU rendering.
 * This hook is for snapshot reads — the actual per-frame updates
 * happen inside SphereParticles.tsx via useFrame.
 */
export function useSphereData(
  parameters: SphereParameterDefinition[],
  subdivisionOrder = 3,
): SphereRenderData {
  const storeParameters = useNavigationStore((s) => s.parameters)

  const icoSphere = useMemo(() => generateIcoSphere(subdivisionOrder), [subdivisionOrder])
  const pointCount = icoSphere.vertexCount

  return useMemo(() => {
    const positions = icoSphere.positions
    const colors = new Float32Array(pointCount * 3)
    const sizes = new Float32Array(pointCount)
    const confidences = new Float32Array(pointCount).fill(0.95)
    const radii = new Float32Array(pointCount).fill(0.95)

    for (let i = 0; i < parameters.length && i < pointCount; i++) {
      const param = parameters[i]
      const [r, g, b] = hexToRGB(GROUP_COLORS[param.group])
      colors[i * 3] = r
      colors[i * 3 + 1] = g
      colors[i * 3 + 2] = b
      sizes[i] = 3.0

      const state = storeParameters[param.id]
      if (state) {
        confidences[i] = state.confidence
        radii[i] = state.confidence
      }
    }

    return { positions, colors, sizes, confidences, radii, pointCount }
  }, [icoSphere, pointCount, parameters, storeParameters])
}
