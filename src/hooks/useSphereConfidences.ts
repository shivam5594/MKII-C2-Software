import { THREAT_SPHERE_PARAMETERS, RESPONSE_SPHERE_PARAMETERS } from '../data/navParameters'
import type { SphereParameterDefinition } from '../types/sphere'
import type { ParameterGroup } from '../types/sphere'
import type { ParameterState } from '../stores/navigationStore'

// Map ParameterGroup → axis index (matching ALGORITHM_AXES order)
const GROUP_TO_AXIS: Record<ParameterGroup, number> = {
  INS_IMU: 0,
  GNSS: 1,
  TERCOM: 2,
  MAGNAV: 3,
  SCENE_MATCH: 4,
  EW_DETECT: 1,
  PLATFORM: 0,
  COMMS: 0,
  RF_HOMING: 4,
}

function computeAxisConfidences(
  params: SphereParameterDefinition[],
  storeParams: Record<string, ParameterState>,
): number[] {
  const sums = [0, 0, 0, 0, 0]
  const counts = [0, 0, 0, 0, 0]

  for (const p of params) {
    const axis = GROUP_TO_AXIS[p.group]
    const state = storeParams[p.id]
    if (state) {
      sums[axis] += state.confidence
      counts[axis]++
    }
  }

  return sums.map((sum, i) => counts[i] > 0 ? sum / counts[i] : 0.95)
}

/**
 * Pure function — call from useFrame with store snapshot.
 * Returns [INS, GNSS, TER, MAG, SCN] for the threat sphere.
 */
export function getThreatConfidences(storeParams: Record<string, ParameterState>): number[] {
  return computeAxisConfidences(THREAT_SPHERE_PARAMETERS, storeParams)
}

/**
 * Pure function — call from useFrame with store snapshot.
 * Returns [INS, GNSS, TER, MAG, SCN] for the response sphere.
 * Values >1.0 when AI is actively pushing.
 */
export function getResponseConfidences(storeParams: Record<string, ParameterState>): number[] {
  return computeAxisConfidences(RESPONSE_SPHERE_PARAMETERS, storeParams)
}
