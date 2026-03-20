import type { EnvironmentState, MissionState, DataLinkStatus } from '../types/navigation'
import { defaultEnvironmentState, defaultMissionState } from '../types/navigation'
import type { FaultState } from './faultInjectionEngine'
import { exponentialApproach } from './faultInjectionEngine'

// ── Environment targets under fault conditions ──

interface EnvTargets {
  gnss_cn0_dbhz: number
  gnss_satellite_count: number
  rf_noise_floor_dbm: number
  ew_threat_detected: boolean
}

const NOMINAL_ENV: EnvTargets = {
  gnss_cn0_dbhz: 42,
  gnss_satellite_count: 12,
  rf_noise_floor_dbm: -110,
  ew_threat_detected: false,
}

function getEnvTargets(faults: FaultState): EnvTargets {
  if (faults.jamming && faults.spoofing) {
    return {
      gnss_cn0_dbhz: 8,
      gnss_satellite_count: 0,
      rf_noise_floor_dbm: -65,
      ew_threat_detected: true,
    }
  }
  if (faults.jamming) {
    return {
      gnss_cn0_dbhz: 8,
      gnss_satellite_count: 0,
      rf_noise_floor_dbm: -65,
      ew_threat_detected: true,
    }
  }
  if (faults.spoofing) {
    return {
      gnss_cn0_dbhz: 22,
      gnss_satellite_count: 12, // spoofed sats still visible
      rf_noise_floor_dbm: -95,
      ew_threat_detected: true,
    }
  }
  return NOMINAL_ENV
}

const TAU_ENV_ONSET = 2.0
const TAU_ENV_RECOVERY = 4.0

/**
 * Derive environment state updates from fault conditions.
 * Uses exponential approach for smooth numeric transitions.
 */
export function deriveEnvironmentUpdates(
  currentEnv: EnvironmentState,
  faults: FaultState,
  dt: number,
): Partial<EnvironmentState> {
  const targets = getEnvTargets(faults)
  const defaults = defaultEnvironmentState()

  const tauCn0 = targets.gnss_cn0_dbhz < currentEnv.gnss_cn0_dbhz ? TAU_ENV_ONSET : TAU_ENV_RECOVERY
  const tauNoise = targets.rf_noise_floor_dbm > currentEnv.rf_noise_floor_dbm ? TAU_ENV_ONSET : TAU_ENV_RECOVERY
  const tauSat = targets.gnss_satellite_count < currentEnv.gnss_satellite_count ? TAU_ENV_ONSET : TAU_ENV_RECOVERY

  return {
    gnss_cn0_dbhz: exponentialApproach(currentEnv.gnss_cn0_dbhz, targets.gnss_cn0_dbhz, dt, tauCn0),
    gnss_satellite_count: Math.round(
      exponentialApproach(currentEnv.gnss_satellite_count, targets.gnss_satellite_count, dt, tauSat),
    ),
    rf_noise_floor_dbm: exponentialApproach(currentEnv.rf_noise_floor_dbm, targets.rf_noise_floor_dbm, dt, tauNoise),
    ew_threat_detected: targets.ew_threat_detected,
    // Other env vars stay at defaults
    cloud_cover: defaults.cloud_cover,
    visibility_km: defaults.visibility_km,
    thermal_contrast: defaults.thermal_contrast,
    terrain_roughness: defaults.terrain_roughness,
    terrain_map_coverage: defaults.terrain_map_coverage,
    magnetic_field_quality: defaults.magnetic_field_quality,
    magnetic_map_loaded: defaults.magnetic_map_loaded,
    eo_image_quality: defaults.eo_image_quality,
    altitude_agl_m: defaults.altitude_agl_m,
  }
}

/**
 * Derive mission state updates from fault conditions and current state.
 */
export function deriveMissionUpdates(
  currentMission: MissionState,
  faults: FaultState,
  dt: number,
  gnssConfidence: number,
  compositeConfidence: number,
  activeCount: number,
): Partial<MissionState> {
  const defaults = defaultMissionState()

  // Accumulate GNSS denial time when confidence drops below threshold
  const timeInDenial = gnssConfidence < 0.35
    ? currentMission.time_in_denial_s + dt
    : Math.max(0, currentMission.time_in_denial_s - dt * 0.5) // slow decay when recovering

  // Datalink status based on satcom confidence proxy
  let datalinkStatus: DataLinkStatus = 'UP'
  if (faults.jamming) {
    // comms_satcom gets jammed — check via fault state directly
    datalinkStatus = 'DEGRADED'
  }
  if (faults.jamming && faults.spoofing) {
    datalinkStatus = 'DENIED'
  }

  // Abort condition: composite below floor AND insufficient techniques
  const abortCondition = compositeConfidence < currentMission.mission_floor_confidence && activeCount <= 1

  return {
    time_in_denial_s: timeInDenial,
    datalink_status: datalinkStatus,
    abort_condition: abortCondition,
    // Preserve other mission state
    mission_phase: defaults.mission_phase,
    distance_to_target_km: defaults.distance_to_target_km,
    cep_threshold_m: defaults.cep_threshold_m,
    mitl_auth_status: defaults.mitl_auth_status,
    operator_override_active: defaults.operator_override_active,
    mission_floor_confidence: defaults.mission_floor_confidence,
    waypoint_index: defaults.waypoint_index,
    bda_sensor_active: defaults.bda_sensor_active,
  }
}
