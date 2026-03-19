import type { ParameterGroup } from '../types/sphere'
import type {
  TechniqueId,
  TechniqueState,
  FusionState,
  HealthStatus,
  StateVariableDefinition,
} from '../types/navigation'
import {
  TECHNIQUE_IDS,
  defaultTechniqueState,
  defaultFusionState,
} from '../types/navigation'
import type { ParameterState } from '../stores/navigationStore'
import { THREAT_SPHERE_PARAMETERS } from './navParameters'

// ── Confidence threshold (from spec) ──

export const CONFIDENCE_THRESHOLD = 0.35

// ── Map sensor groups → technique ──

const GROUP_TO_TECHNIQUE: Record<ParameterGroup, TechniqueId> = {
  INS_IMU: 'INS',
  GNSS: 'GNSS',
  TERCOM: 'TERCOM',
  MAGNAV: 'MAGNAV',
  SCENE_MATCH: 'SCENE_MATCH',
  EW_DETECT: 'GNSS',        // EW detection feeds into GNSS threat assessment
  PLATFORM: 'INS',          // platform health maps to INS backbone
  COMMS: 'INS',             // comms maps to INS (always-on backbone)
  RF_HOMING: 'RF_HOMING',
}

// ── Derive technique confidence from sensor-level params ──

export function deriveTechniqueConfidences(
  sensorParams: Record<string, ParameterState>,
): Record<TechniqueId, number> {
  const sums: Record<TechniqueId, number> = { INS: 0, GNSS: 0, TERCOM: 0, MAGNAV: 0, SCENE_MATCH: 0, RF_HOMING: 0 }
  const counts: Record<TechniqueId, number> = { INS: 0, GNSS: 0, TERCOM: 0, MAGNAV: 0, SCENE_MATCH: 0, RF_HOMING: 0 }

  for (const p of THREAT_SPHERE_PARAMETERS) {
    const tech = GROUP_TO_TECHNIQUE[p.group]
    const state = sensorParams[p.id]
    if (state) {
      sums[tech] += state.confidence
      counts[tech]++
    }
  }

  const result = {} as Record<TechniqueId, number>
  for (const id of TECHNIQUE_IDS) {
    result[id] = counts[id] > 0 ? sums[id] / counts[id] : 0.95
  }
  return result
}

// ── Derive health status from confidence ──

export function deriveHealthStatus(confidence: number, spoofFlag: boolean, jamFlag: boolean): HealthStatus {
  if (spoofFlag) return 'SPOOFED'
  if (jamFlag) return 'DENIED'
  if (confidence < CONFIDENCE_THRESHOLD) return 'DENIED'
  if (confidence < 0.6) return 'DEGRADED'
  return 'NOMINAL'
}

// ── Derive full technique states from sensor params ──

export function deriveTechniqueStates(
  sensorParams: Record<string, ParameterState>,
): Record<TechniqueId, TechniqueState> {
  const confidences = deriveTechniqueConfidences(sensorParams)
  const result = {} as Record<TechniqueId, TechniqueState>

  for (const id of TECHNIQUE_IDS) {
    const conf = confidences[id]
    const base = defaultTechniqueState()

    // Derive spoofing/jamming flags from specific sensor params
    const spoofFlag = id === 'GNSS' && (sensorParams['gnss_spoof_delta']?.confidence ?? 1) > 1.1
    const jamFlag = id === 'GNSS' && (sensorParams['ew_jam_power']?.confidence ?? 1) < 0.3
    const rfJam = id === 'RF_HOMING' && (sensorParams['ew_rf_scan']?.confidence ?? 1) < 0.3

    result[id] = {
      ...base,
      confidence_score: conf,
      health_status: deriveHealthStatus(conf, spoofFlag, jamFlag || rfJam),
      is_active: conf >= CONFIDENCE_THRESHOLD,
      current_cep_estimate_m: conf > 0.8 ? 15 : conf > 0.5 ? 80 : conf > 0.35 ? 200 : 500,
      measurement_noise_scale: conf > 0.5 ? 1.0 : 1.0 + (0.5 - conf) * 10,
      denial_duration_s: conf < CONFIDENCE_THRESHOLD ? base.denial_duration_s : 0,
      spoofing_flag: spoofFlag,
      jamming_detected: jamFlag || rfJam,
    }
  }

  return result
}

// ── Derive fusion state from technique states ──

export function deriveFusionState(
  techniques: Record<TechniqueId, TechniqueState>,
): FusionState {
  const base = defaultFusionState()

  // Count active techniques
  const active = TECHNIQUE_IDS.filter((id) => techniques[id].is_active)
  const activeCount = active.length

  // Sort by confidence for fallback queue
  const sorted = [...TECHNIQUE_IDS].sort(
    (a, b) => techniques[b].confidence_score - techniques[a].confidence_score,
  )
  const primary = sorted[0]
  const fallback = sorted.slice(1)

  // Composite confidence: weighted average of active technique confidences
  let confSum = 0
  for (const id of active) {
    confSum += techniques[id].confidence_score
  }
  const composite = activeCount > 0 ? confSum / activeCount : 0

  // Covariance trace proxy: inversely proportional to active count and confidence
  const covTrace = composite > 0 ? (1 / composite) * (6 / Math.max(1, activeCount)) * 10 : 100

  return {
    ...base,
    composite_confidence: composite,
    primary_technique: primary,
    active_technique_count: activeCount,
    fallback_queue: fallback,
    covariance_trace: covTrace,
    inertial_accumulated_error_m: techniques.INS.is_active
      ? (1 - techniques.INS.confidence_score) * 200
      : 500,
    innovation_anomaly_flag: activeCount < 3,
  }
}

// ── State registry definitions (for telemetry UI rendering) ──

export const STATE_REGISTRY: StateVariableDefinition[] = [
  // Per-technique confidence variables
  { id: 'confidence_score', label: 'Confidence Score', type: 'Float [0–1]', category: 'TECHNIQUE', description: 'Composite confidence for technique, updated every EKF fusion cycle' },
  { id: 'health_status', label: 'Health Status', type: 'Enum', category: 'TECHNIQUE', description: 'NOMINAL / DEGRADED / DENIED / SPOOFED — drives EKF measurement gating' },
  { id: 'is_active', label: 'Active', type: 'Boolean', category: 'TECHNIQUE', description: 'True if technique confidence is above threshold and fusing into EKF' },
  { id: 'last_fix_age_s', label: 'Fix Staleness', type: 'Float s', category: 'TECHNIQUE', description: 'Seconds since most recent valid position fix; staleness drives confidence decay' },
  { id: 'fix_rate_hz', label: 'Fix Rate', type: 'Float Hz', category: 'TECHNIQUE', description: 'Measured update frequency; drop below nominal triggers health degradation' },
  { id: 'current_cep_estimate_m', label: 'CEP Estimate', type: 'Float m', category: 'TECHNIQUE', description: 'Estimated CEP under current environmental conditions' },
  { id: 'innovation_residual_m', label: 'Innovation Residual', type: 'Float m', category: 'TECHNIQUE', description: 'EKF innovation: difference between measurement and INS-propagated state' },
  { id: 'innovation_gate_pass', label: 'Gate Pass', type: 'Boolean', category: 'TECHNIQUE', description: 'Whether latest measurement passes chi-squared innovation gating test' },
  { id: 'spoofing_flag', label: 'Spoof Flag', type: 'Boolean', category: 'TECHNIQUE', description: 'Raised when inertial cross-check detects implausible position/velocity discontinuity' },
  { id: 'jamming_detected', label: 'Jam Detected', type: 'Boolean', category: 'TECHNIQUE', description: 'RF noise floor exceeds baseline threshold — active for GNSS and RF Homing' },
  { id: 'measurement_noise_scale', label: 'R Scale', type: 'Float', category: 'TECHNIQUE', description: 'EKF measurement noise covariance scale — dynamically inflated as confidence decays' },
  { id: 'denial_duration_s', label: 'Denial Duration', type: 'Float s', category: 'TECHNIQUE', description: 'Continuous seconds since last valid fix; drives exponential confidence decay curve' },
  { id: 'confidence_decay_rate', label: 'Decay Rate', type: 'Float', category: 'TECHNIQUE', description: 'Per-technique decay constant — INS slowest; GNSS fastest under hard jamming' },

  // EKF / fusion core state
  { id: 'composite_confidence', label: 'Composite Confidence', type: 'Float [0–1]', category: 'FUSION', description: 'Fusion-level confidence: f(P_trace, active_count, primary_technique_quality)' },
  { id: 'primary_technique', label: 'Primary Technique', type: 'Enum TechID', category: 'FUSION', description: 'Current highest-weight technique in EKF measurement update' },
  { id: 'active_technique_count', label: 'Active Count', type: 'Integer [1–6]', category: 'FUSION', description: 'Techniques currently above threshold and contributing to fusion' },
  { id: 'covariance_trace', label: 'Cov Trace', type: 'Float', category: 'FUSION', description: 'State estimation uncertainty — trace is composite navigation uncertainty proxy' },
  { id: 'inertial_accumulated_error_m', label: 'INS Accum Error', type: 'Float m', category: 'FUSION', description: 'Estimated INS position error since last absolute correction' },
  { id: 'last_absolute_fix_age_s', label: 'Last Abs Fix Age', type: 'Float s', category: 'FUSION', description: 'Time since last fix from any non-drifting (absolute) technique' },
  { id: 'ekf_predict_rate_hz', label: 'EKF Predict Rate', type: 'Float Hz', category: 'FUSION', description: 'IMU-driven prediction rate — typically 200–400 Hz' },
  { id: 'ekf_update_rate_hz', label: 'EKF Update Rate', type: 'Float Hz', category: 'FUSION', description: 'Measurement update rate — constrained by slowest active absolute technique' },
  { id: 'innovation_anomaly_flag', label: 'Innovation Anomaly', type: 'Boolean', category: 'FUSION', description: 'CUSUM-based drift anomaly detection flag' },

  // Mission phase & authorization
  { id: 'mission_phase', label: 'Mission Phase', type: 'Enum', category: 'MISSION', description: 'INIT / CLIMB / TRANSIT / LOITER / TERMINAL / BDA — governs technique priority order' },
  { id: 'distance_to_target_km', label: 'Dist to Target', type: 'Float km', category: 'MISSION', description: 'Range to target; drives terminal phase entry (< 40 km) and CEP tightening' },
  { id: 'cep_threshold_m', label: 'CEP Threshold', type: 'Float m', category: 'MISSION', description: 'Max acceptable CEP per phase — tightens from 200 m (transit) to 5 m (terminal)' },
  { id: 'time_in_denial_s', label: 'GNSS Denial Time', type: 'Float s', category: 'MISSION', description: 'Cumulative GNSS denial duration — informs INS drift budget vs. remaining range' },
  { id: 'mitl_auth_status', label: 'MITL Auth', type: 'Enum', category: 'MISSION', description: 'PENDING / AUTHORIZED / ABORTED — architecturally isolated from nav state machine' },
  { id: 'datalink_status', label: 'Datalink', type: 'Enum', category: 'MISSION', description: 'UP / DEGRADED / DENIED — loss triggers graceful degradation, never auto-engage' },
  { id: 'operator_override_active', label: 'Operator Override', type: 'Boolean', category: 'MISSION', description: 'Manual operator command overriding autonomous technique selection' },
  { id: 'abort_condition', label: 'Abort Condition', type: 'Boolean', category: 'MISSION', description: 'Set when composite_confidence < mission_floor AND fallback_queue is empty' },
  { id: 'mission_floor_confidence', label: 'Mission Floor', type: 'Float [0–1]', category: 'MISSION', description: 'Minimum acceptable composite confidence for continuation — typically 0.40' },
  { id: 'waypoint_index', label: 'Waypoint', type: 'Integer', category: 'MISSION', description: 'Current active waypoint — drives route phase and technique priority update' },
  { id: 'bda_sensor_active', label: 'BDA Sensor', type: 'Boolean', category: 'MISSION', description: 'Post-strike downward EO streaming for BDA — independent of nav sensor suite' },

  // Environmental observability
  { id: 'cloud_cover', label: 'Cloud Cover', type: 'Float [0–1]', category: 'ENVIRONMENT', description: 'EO sensor sky obscuration — directly modulates Scene Match confidence weight' },
  { id: 'visibility_km', label: 'Visibility', type: 'Float km', category: 'ENVIRONMENT', description: 'Optical visibility from EO histogram variance — < 3 km degrades Scene Match' },
  { id: 'thermal_contrast', label: 'Thermal Contrast', type: 'Float [0–1]', category: 'ENVIRONMENT', description: 'LWIR scene contrast — low value degrades thermal scene matching' },
  { id: 'terrain_roughness', label: 'Terrain Roughness', type: 'Float [0–1]', category: 'ENVIRONMENT', description: 'Terrain relief variation in TERCOM footprint — flat terrain degrades TERCOM quality' },
  { id: 'terrain_map_coverage', label: 'Terrain Map Coverage', type: 'Float [0–1]', category: 'ENVIRONMENT', description: 'Fraction of current path covered by onboard DEM — gaps degrade TERCOM validity' },
  { id: 'magnetic_field_quality', label: 'Mag Field Quality', type: 'Float [0–1]', category: 'ENVIRONMENT', description: 'Local field regularity vs. stored anomaly map — anomalous areas degrade MagNav' },
  { id: 'magnetic_map_loaded', label: 'Mag Map Loaded', type: 'Boolean', category: 'ENVIRONMENT', description: 'Whether onboard mag-anomaly map covers current geographic cell' },
  { id: 'gnss_cn0_dbhz', label: 'GNSS C/N₀', type: 'Float dBHz', category: 'ENVIRONMENT', description: 'GNSS carrier-to-noise ratio — below 25 dBHz flags degraded; below 15 flags denial' },
  { id: 'gnss_satellite_count', label: 'Satellite Count', type: 'Integer', category: 'ENVIRONMENT', description: 'Visible satellites above elevation mask — below 4 degrades or invalidates fix' },
  { id: 'rf_noise_floor_dbm', label: 'RF Noise Floor', type: 'Float dBm', category: 'ENVIRONMENT', description: 'RF environment noise floor — elevation above baseline signals active jamming' },
  { id: 'ew_threat_detected', label: 'EW Threat', type: 'Boolean', category: 'ENVIRONMENT', description: 'ESM receiver flag: adversary jamming or spoofing source in operating band' },
  { id: 'eo_image_quality', label: 'EO Image Quality', type: 'Float [0–1]', category: 'ENVIRONMENT', description: 'Blur + noise + saturation composite from EO frame analyser' },
  { id: 'altitude_agl_m', label: 'Altitude AGL', type: 'Float m', category: 'ENVIRONMENT', description: 'AGL altitude from radar altimeter — required for TERCOM; sets EO field-of-view' },
]
