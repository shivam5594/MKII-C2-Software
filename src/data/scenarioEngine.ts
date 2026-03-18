export interface ScenarioKeyframe {
  t: number
  threat?: Record<string, number>
  response?: Record<string, number>
}

export interface ScenarioData {
  id: string
  name: string
  description: string
  duration_seconds: number
  timeline: ScenarioKeyframe[]
}

export interface InterpolatedState {
  threat: Record<string, number>
  response: Record<string, number>
}

/**
 * Load a scenario JSON from public/scenarios/.
 */
export async function loadScenario(id: string): Promise<ScenarioData> {
  const res = await fetch(`/scenarios/${id}.json`)
  if (!res.ok) throw new Error(`Failed to load scenario: ${id}`)
  return res.json()
}

/**
 * Linearly interpolate between keyframes at a given time t.
 * Sparse keyframes: only keys present in a keyframe are updated.
 * Values carry forward from the last keyframe that set them.
 */
export function interpolateAtTime(scenario: ScenarioData, t: number): InterpolatedState {
  const { timeline } = scenario
  const clamped = Math.max(0, Math.min(t, scenario.duration_seconds))

  // Build accumulated state up to time t
  const threat: Record<string, number> = {}
  const response: Record<string, number> = {}

  // Find surrounding keyframes for each parameter
  // First pass: collect all parameters and their keyframe values
  const threatKeys = new Set<string>()
  const responseKeys = new Set<string>()

  for (const kf of timeline) {
    if (kf.threat) Object.keys(kf.threat).forEach((k) => threatKeys.add(k))
    if (kf.response) Object.keys(kf.response).forEach((k) => responseKeys.add(k))
  }

  // For each parameter, find the two surrounding keyframes and interpolate
  for (const key of threatKeys) {
    threat[key] = interpolateParameter(timeline, 'threat', key, clamped)
  }
  for (const key of responseKeys) {
    response[key] = interpolateParameter(timeline, 'response', key, clamped)
  }

  return { threat, response }
}

function interpolateParameter(
  timeline: ScenarioKeyframe[],
  sphere: 'threat' | 'response',
  key: string,
  t: number,
): number {
  let prevT = 0
  let prevVal: number | undefined
  let nextT: number | undefined
  let nextVal: number | undefined

  for (const kf of timeline) {
    const val = kf[sphere]?.[key]
    if (val !== undefined) {
      if (kf.t <= t) {
        prevT = kf.t
        prevVal = val
      } else if (nextVal === undefined) {
        nextT = kf.t
        nextVal = val
      }
    }
  }

  if (prevVal === undefined) return 0.95 // default
  if (nextVal === undefined || nextT === undefined) return prevVal

  // Linear interpolation
  const frac = (t - prevT) / (nextT - prevT)
  return prevVal + (nextVal - prevVal) * frac
}
