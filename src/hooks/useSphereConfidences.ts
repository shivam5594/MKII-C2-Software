import { THREAT_SPHERE_PARAMETERS, RESPONSE_SPHERE_PARAMETERS } from '../data/navParameters'
import type { ParameterGroup } from '../types/sphere'
import type { ParameterState } from '../stores/navigationStore'

// Map ParameterGroup → axis index (matching ALGORITHM_AXES order)
// Axes: 0=INS, 1=GNSS, 2=TERCOM, 3=MAGNAV, 4=SCENE_MATCH
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

// Params with inverted semantics: high value = BAD (anomaly detectors)
// These must be inverted before averaging with confidence values (high = GOOD)
const INVERTED_PARAMS = new Set(['gnss_spoof_delta'])

// Params that are inherently low in nominal (terminal-phase sensors)
// Excluded from axis averaging to prevent false degradation appearance
const EXCLUDED_FROM_THREAT_AVG = new Set([
  'rf_homing_snr', 'rf_homing_lock', 'rf_homing_bearing',
])

/**
 * THREAT sphere: compute per-axis confidence using mean averaging.
 * Handles inverted params (spoof_delta) and excludes terminal-only params.
 */
export function getThreatConfidences(storeParams: Record<string, ParameterState>): number[] {
  const sums = [0, 0, 0, 0, 0]
  const counts = [0, 0, 0, 0, 0]

  for (const p of THREAT_SPHERE_PARAMETERS) {
    // Skip terminal-phase-only params that would falsely depress axes
    if (EXCLUDED_FROM_THREAT_AVG.has(p.id)) continue

    const axis = GROUP_TO_AXIS[p.group]
    const state = storeParams[p.id]
    if (state) {
      let conf = state.confidence

      // Invert anomaly detectors: gnss_spoof_delta nominal ~0.97, spoofed ~1.35
      // Convert to: nominal ~0.97 (good), spoofed ~0.62 (bad)
      if (INVERTED_PARAMS.has(p.id)) {
        // Map: 0.97 → 0.97 (nominal), 1.35 → 0.62 (spoofed)
        conf = Math.max(0, 2.0 - conf)
      }

      sums[axis] += conf
      counts[axis]++
    }
  }

  return sums.map((sum, i) => counts[i] > 0 ? sum / counts[i] : 0.95)
}

/**
 * RESPONSE sphere: compute per-axis confidence.
 *
 * Response params have two states:
 *   - DORMANT (< 0.20): countermeasure is off, not needed
 *   - ACTIVE  (>= 0.20): countermeasure is responding
 *
 * Dormant params must NOT contribute to the axis — they are "off switches",
 * not degradation indicators. Only active params drive the sphere shape.
 *
 * If ALL params on an axis are dormant, the axis shows nominal (0.95) —
 * "no response needed" looks the same as "all systems healthy".
 *
 * If ANY param is active, the axis shows the max active value —
 * the strongest response drives the visual.
 */
export function getResponseConfidences(storeParams: Record<string, ParameterState>): number[] {
  const DORMANT_THRESHOLD = 0.20

  const activeSums = [0, 0, 0, 0, 0]
  const activeMaxes = [0, 0, 0, 0, 0]
  const activeCounts = [0, 0, 0, 0, 0]

  for (const p of RESPONSE_SPHERE_PARAMETERS) {
    const axis = GROUP_TO_AXIS[p.group]
    const state = storeParams[p.id]
    if (!state) continue

    // Only count params that are actively responding
    if (state.confidence >= DORMANT_THRESHOLD) {
      activeSums[axis] += state.confidence
      activeCounts[axis]++
      if (state.confidence > activeMaxes[axis]) {
        activeMaxes[axis] = state.confidence
      }
    }
  }

  return activeSums.map((sum, i) => {
    if (activeCounts[i] === 0) {
      // All params dormant on this axis — show nominal (no response needed = healthy)
      return 0.95
    }
    const mean = sum / activeCounts[i]
    const max = activeMaxes[i]
    // Blend: max dominates but mean provides context
    return 0.35 * max + 0.65 * mean
  })
}
