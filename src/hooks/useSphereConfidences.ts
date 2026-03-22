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
 * RESPONSE sphere: compute per-axis confidence using activation-weighted averaging.
 *
 * Problem with naive mean: dormant countermeasures (0.10) dilute active ones (1.15).
 * Fix: use power-mean (p=2) — squares emphasize high values, dormant values contribute minimally.
 *
 * Example: mean(1.20, 0.10, 0.10) = 0.467 (looks cratered — WRONG)
 *          power2(1.20, 0.10, 0.10) = sqrt((1.44+0.01+0.01)/3) = 0.698 (better)
 *
 * But we also want >1.0 when ANY param is actively pushing. So we use:
 *          max-biased: 0.4*max + 0.6*mean — the strongest response dominates
 */
export function getResponseConfidences(storeParams: Record<string, ParameterState>): number[] {
  const sums = [0, 0, 0, 0, 0]
  const maxes = [0, 0, 0, 0, 0]
  const counts = [0, 0, 0, 0, 0]

  for (const p of RESPONSE_SPHERE_PARAMETERS) {
    const axis = GROUP_TO_AXIS[p.group]
    const state = storeParams[p.id]
    if (state) {
      sums[axis] += state.confidence
      counts[axis]++
      if (state.confidence > maxes[axis]) {
        maxes[axis] = state.confidence
      }
    }
  }

  return sums.map((sum, i) => {
    if (counts[i] === 0) return 0.95
    const mean = sum / counts[i]
    const max = maxes[i]
    // Max-biased blend: strongest response dominates the axis visualization
    // When one param pushes >1.0, the axis shows outward push even if others are dormant
    return 0.4 * max + 0.6 * mean
  })
}
