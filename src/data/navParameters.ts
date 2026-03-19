import type { SphereParameterDefinition } from '../types/sphere'

export const THREAT_SPHERE_PARAMETERS: SphereParameterDefinition[] = [
  // GNSS group
  { id: 'gnss_l1_snr',      label: 'GNSS L1 SNR',        shortLabel: 'L1',   group: 'GNSS' },
  { id: 'gnss_l5_snr',      label: 'GNSS L5 SNR',        shortLabel: 'L5',   group: 'GNSS' },
  { id: 'gnss_navic_l5',    label: 'NavIC L5 Signal',     shortLabel: 'NL5',  group: 'GNSS' },
  { id: 'gnss_navic_s',     label: 'NavIC S-Band',        shortLabel: 'NS',   group: 'GNSS' },
  { id: 'gnss_glonass',     label: 'GLONASS Signal',      shortLabel: 'GLN',  group: 'GNSS' },
  { id: 'gnss_pdop',        label: 'GNSS PDOP',           shortLabel: 'PDOP', group: 'GNSS' },
  { id: 'gnss_raim',        label: 'RAIM Integrity',      shortLabel: 'RAIM', group: 'GNSS' },
  { id: 'gnss_spoof_delta', label: 'Spoof Detection Δ',   shortLabel: 'SPF',  group: 'GNSS' },

  // INS/IMU group
  { id: 'imu_gyro_x',       label: 'Gyro X Drift',        shortLabel: 'GX',   group: 'INS_IMU' },
  { id: 'imu_gyro_y',       label: 'Gyro Y Drift',        shortLabel: 'GY',   group: 'INS_IMU' },
  { id: 'imu_gyro_z',       label: 'Gyro Z Drift',        shortLabel: 'GZ',   group: 'INS_IMU' },
  { id: 'imu_accel_bias',   label: 'Accel Bias Estimate',  shortLabel: 'ABE',  group: 'INS_IMU' },
  { id: 'imu_alignment',    label: 'INS Alignment',        shortLabel: 'ALN',  group: 'INS_IMU' },
  { id: 'imu_temperature',  label: 'IMU Temperature',      shortLabel: 'TMP',  group: 'INS_IMU' },

  // TERCOM group
  { id: 'tercom_ralt',        label: 'Radar Altimeter',    shortLabel: 'RALT', group: 'TERCOM' },
  { id: 'tercom_dem_corr',    label: 'DEM Correlation',    shortLabel: 'DEM',  group: 'TERCOM' },
  { id: 'tercom_terrain_var', label: 'Terrain Variance',   shortLabel: 'TVR',  group: 'TERCOM' },
  { id: 'tercom_update_age',  label: 'Last TAN Update',    shortLabel: 'UPD',  group: 'TERCOM' },

  // MagNav group
  { id: 'magnav_field_str',  label: 'Mag Field Strength',  shortLabel: 'MAG',  group: 'MAGNAV' },
  { id: 'magnav_map_corr',   label: 'Mag Map Correlation', shortLabel: 'MCR',  group: 'MAGNAV' },
  { id: 'magnav_anomaly',    label: 'Mag Anomaly Match',   shortLabel: 'ANM',  group: 'MAGNAV' },

  // Scene matching group
  { id: 'scene_eo_quality',  label: 'EO Image Quality',    shortLabel: 'EOQ',  group: 'SCENE_MATCH' },
  { id: 'scene_dsmac_corr',  label: 'DSMAC Correlation',   shortLabel: 'DSM',  group: 'SCENE_MATCH' },
  { id: 'scene_vio',         label: 'Visual Odometry',     shortLabel: 'VIO',  group: 'SCENE_MATCH' },
  { id: 'scene_lighting',    label: 'Scene Lighting',      shortLabel: 'LGT',  group: 'SCENE_MATCH' },

  // RF Homing group
  { id: 'rf_homing_snr',     label: 'RF Homing SNR',       shortLabel: 'RSN',  group: 'RF_HOMING' },
  { id: 'rf_homing_lock',    label: 'RF Lock Status',      shortLabel: 'RLK',  group: 'RF_HOMING' },
  { id: 'rf_homing_bearing', label: 'RF Bearing Quality',  shortLabel: 'RBQ',  group: 'RF_HOMING' },

  // EW detection group
  { id: 'ew_jam_power',      label: 'Jam Power Level',     shortLabel: 'JAM',  group: 'EW_DETECT' },
  { id: 'ew_spoof_conf',     label: 'Spoof Confidence',    shortLabel: 'SPF',  group: 'EW_DETECT' },
  { id: 'ew_rf_scan',        label: 'RF Environment Scan', shortLabel: 'RFS',  group: 'EW_DETECT' },

  // Platform group
  { id: 'plat_airspeed',     label: 'Airspeed',            shortLabel: 'IAS',  group: 'PLATFORM' },
  { id: 'plat_altitude',     label: 'Barometric Alt',      shortLabel: 'ALT',  group: 'PLATFORM' },
  { id: 'plat_attitude',     label: 'Attitude Est.',       shortLabel: 'ATT',  group: 'PLATFORM' },
  { id: 'plat_engine',       label: 'Engine Health',       shortLabel: 'ENG',  group: 'PLATFORM' },

  // Comms group
  { id: 'comms_mitl_link',   label: 'MITL Link Quality',   shortLabel: 'LNK',  group: 'COMMS' },
  { id: 'comms_satcom',      label: 'SATCOM Signal',       shortLabel: 'SAT',  group: 'COMMS' },
]

export const RESPONSE_SPHERE_PARAMETERS: SphereParameterDefinition[] = [
  { id: 'resp_inertial_lock',   label: 'Inertial Lock',           shortLabel: 'INL', group: 'INS_IMU' },
  { id: 'resp_gnss_reject',     label: 'GNSS Rejection',          shortLabel: 'REJ', group: 'GNSS' },
  { id: 'resp_antijam_power',   label: 'Anti-Jam Power',          shortLabel: 'AJM', group: 'EW_DETECT' },
  { id: 'resp_crpa_null',       label: 'CRPA Null Steering',      shortLabel: 'NUL', group: 'EW_DETECT' },
  { id: 'resp_tercom_activate', label: 'TERCOM Activation',       shortLabel: 'TAN', group: 'TERCOM' },
  { id: 'resp_magnav_activate', label: 'MagNav Activation',       shortLabel: 'MNV', group: 'MAGNAV' },
  { id: 'resp_scene_activate',  label: 'Scene Match Activation',  shortLabel: 'SCN', group: 'SCENE_MATCH' },
  { id: 'resp_ekf_reweight',    label: 'EKF Reweighting',         shortLabel: 'EKF', group: 'INS_IMU' },
  { id: 'resp_alt_adjust',      label: 'Altitude Adjustment',     shortLabel: 'ALT', group: 'PLATFORM' },
  { id: 'resp_route_modify',    label: 'Route Modification',      shortLabel: 'RTE', group: 'PLATFORM' },
  { id: 'resp_fusion_conf',     label: 'Fusion Confidence',       shortLabel: 'FUS', group: 'INS_IMU' },
  { id: 'resp_operator_alert',  label: 'Operator Alert',          shortLabel: 'OPR', group: 'COMMS' },
]
