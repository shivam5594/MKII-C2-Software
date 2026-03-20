// Per-parameter nominal confidence values and sinusoidal micro-jitter
// to avoid flat-line appearance in sparklines

interface NominalDef {
  nominal: number
  jitterFreq: number  // Hz — unique per param to avoid coherent oscillation
}

const NOMINAL_MAP: Record<string, NominalDef> = {
  // GNSS — strong multi-constellation
  gnss_l1_snr:      { nominal: 0.96, jitterFreq: 0.41 },
  gnss_l5_snr:      { nominal: 0.95, jitterFreq: 0.53 },
  gnss_navic_l5:    { nominal: 0.93, jitterFreq: 0.37 },
  gnss_navic_s:     { nominal: 0.94, jitterFreq: 0.62 },
  gnss_glonass:     { nominal: 0.93, jitterFreq: 0.48 },
  gnss_pdop:        { nominal: 0.97, jitterFreq: 0.31 },
  gnss_raim:        { nominal: 0.98, jitterFreq: 0.44 },
  gnss_spoof_delta: { nominal: 0.97, jitterFreq: 0.35 },

  // INS/IMU — high-quality IMU
  imu_gyro_x:       { nominal: 0.97, jitterFreq: 0.72 },
  imu_gyro_y:       { nominal: 0.97, jitterFreq: 0.68 },
  imu_gyro_z:       { nominal: 0.96, jitterFreq: 0.81 },
  imu_accel_bias:   { nominal: 0.98, jitterFreq: 0.55 },
  imu_alignment:    { nominal: 0.99, jitterFreq: 0.39 },
  imu_temperature:  { nominal: 0.96, jitterFreq: 1.10 },

  // TERCOM — terrain dependent
  tercom_ralt:        { nominal: 0.92, jitterFreq: 0.43 },
  tercom_dem_corr:    { nominal: 0.90, jitterFreq: 0.57 },
  tercom_terrain_var: { nominal: 0.88, jitterFreq: 0.66 },
  tercom_update_age:  { nominal: 0.91, jitterFreq: 0.38 },

  // MAGNAV — map quality dependent
  magnav_field_str:  { nominal: 0.85, jitterFreq: 0.52 },
  magnav_map_corr:   { nominal: 0.83, jitterFreq: 0.74 },
  magnav_anomaly:    { nominal: 0.81, jitterFreq: 0.61 },

  // SCENE_MATCH — good EO conditions
  scene_eo_quality:  { nominal: 0.92, jitterFreq: 0.47 },
  scene_dsmac_corr:  { nominal: 0.89, jitterFreq: 0.83 },
  scene_vio:         { nominal: 0.87, jitterFreq: 0.91 },
  scene_lighting:    { nominal: 0.90, jitterFreq: 0.33 },

  // RF_HOMING — low nominal, terminal phase only
  rf_homing_snr:     { nominal: 0.42, jitterFreq: 0.58 },
  rf_homing_lock:    { nominal: 0.38, jitterFreq: 0.69 },
  rf_homing_bearing: { nominal: 0.35, jitterFreq: 0.77 },

  // EW_DETECT — sensors healthy
  ew_jam_power:      { nominal: 0.97, jitterFreq: 0.45 },
  ew_spoof_conf:     { nominal: 0.98, jitterFreq: 0.36 },
  ew_rf_scan:        { nominal: 0.95, jitterFreq: 0.54 },

  // PLATFORM — nominal
  plat_airspeed:     { nominal: 0.98, jitterFreq: 0.40 },
  plat_altitude:     { nominal: 0.97, jitterFreq: 0.63 },
  plat_attitude:     { nominal: 0.99, jitterFreq: 0.50 },
  plat_engine:       { nominal: 0.96, jitterFreq: 1.15 },

  // COMMS
  comms_mitl_link:   { nominal: 0.94, jitterFreq: 0.42 },
  comms_satcom:      { nominal: 0.93, jitterFreq: 0.56 },

  // Response params — always-on AI baseline
  resp_inertial_lock:   { nominal: 0.94, jitterFreq: 0.38 },
  resp_gnss_reject:     { nominal: 0.10, jitterFreq: 0.30 },
  resp_antijam_power:   { nominal: 0.10, jitterFreq: 0.32 },
  resp_crpa_null:       { nominal: 0.10, jitterFreq: 0.34 },
  resp_tercom_activate: { nominal: 0.90, jitterFreq: 0.46 },
  resp_magnav_activate: { nominal: 0.83, jitterFreq: 0.51 },
  resp_scene_activate:  { nominal: 0.89, jitterFreq: 0.59 },
  resp_ekf_reweight:    { nominal: 0.30, jitterFreq: 0.44 },
  resp_alt_adjust:      { nominal: 0.15, jitterFreq: 0.37 },
  resp_route_modify:    { nominal: 0.10, jitterFreq: 0.41 },
  resp_fusion_conf:     { nominal: 0.95, jitterFreq: 0.48 },
  resp_operator_alert:  { nominal: 0.10, jitterFreq: 0.33 },
}

const JITTER_AMPLITUDE = 0.015

/**
 * Returns the nominal target confidence for a parameter at a given simulation time,
 * including sinusoidal micro-jitter to avoid flat-line sparklines.
 */
export function getNominalTarget(paramId: string, simTime: number): number {
  const def = NOMINAL_MAP[paramId]
  if (!def) return 0.95 // fallback for unknown params
  return def.nominal + Math.sin(simTime * def.jitterFreq * Math.PI * 2) * JITTER_AMPLITUDE
}

/**
 * Returns the raw nominal value (no jitter) for use in target calculations.
 */
export function getRawNominal(paramId: string): number {
  return NOMINAL_MAP[paramId]?.nominal ?? 0.95
}
