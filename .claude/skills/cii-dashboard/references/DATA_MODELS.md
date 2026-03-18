# MK-// CII Dashboard — Data Models

All TypeScript interfaces for the dashboard. These are the contracts between stores, hooks, and components.

---

## Sphere Parameter System

```typescript
// types/sphere.ts

export interface SphereParameter {
  id: string;
  label: string;
  shortLabel: string;  // ≤6 chars for sphere overlay
  group: ParameterGroup;
  theta: number;       // azimuth [0, 2π]
  phi: number;         // polar [0, π]
  confidence: number;  // 1.0=nominal, 0.0=failure, >1.0=anomalous
  targetConfidence: number;
  confidenceRate: number;
  isActive: boolean;
  rawValue?: number;
  rawUnit?: string;
}

export type ParameterGroup =
  | 'GNSS'
  | 'INS_IMU'
  | 'TERCOM'
  | 'MAGNAV'
  | 'SCENE_MATCH'
  | 'EW_DETECT'
  | 'PLATFORM'
  | 'COMMS'
  | 'RF_HOMING';

export const GROUP_COLORS: Record<ParameterGroup, string> = {
  GNSS: '#00E5FF',
  INS_IMU: '#00FF88',
  TERCOM: '#FFB800',
  MAGNAV: '#D4B86A',
  SCENE_MATCH: '#80F0FF',
  EW_DETECT: '#E24B4A',
  PLATFORM: '#8899AA',
  COMMS: '#5B9BD5',
  RF_HOMING: '#FF6B35',
};

export interface SphereRenderData {
  positions: Float32Array;    // [x,y,z] * pointCount
  colors: Float32Array;       // [r,g,b] * pointCount
  sizes: Float32Array;        // pointCount
  confidences: Float32Array;  // pointCount
  pointCount: number;
}

export interface SphereConfig {
  subdivisionLevel: 3 | 4 | 5;  // 3=162, 4=642, 5=2562 points
  baseRadius: number;
  minRadius: number;
  maxRadius: number;
  showConnections: boolean;
  showReference: boolean;
  autoRotateSpeed: number;
}
```

---

## Navigation State

```typescript
// types/navigation.ts

export interface NavigationState {
  insImu: NavLayerState;
  gnss: NavLayerState;
  tercom: NavLayerState;
  magNav: NavLayerState;
  sceneMatch: NavLayerState;
  rfHoming: NavLayerState;
  primarySource: NavSource;
  fusionConfidence: number;
  estimatedCEP_m: number;
  spoofDetection: {
    gnssIntegrity: 'NOMINAL' | 'SUSPECT' | 'SPOOFED' | 'REJECTED';
    inertialDelta: number;
  };
}

export interface NavLayerState {
  confidence: number;
  isActive: boolean;
  isAvailable: boolean;
  statusText: string;
}

export type NavSource =
  | 'GNSS' | 'TERCOM' | 'MAGNAV' | 'SCENE_MATCH'
  | 'INS_ONLY' | 'RF_HOMING' | 'FUSED';
```

---

## Electronic Warfare State

```typescript
// types/ew.ts

export interface EWState {
  threatLevel: 'CLEAR' | 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  jamming: {
    detected: boolean;
    estimatedPower_dBm: number;
    estimatedBearing_deg: number;
    estimatedRange_km: number;
    affectedBands: GNSSBand[];
    antiJamStatus: 'INACTIVE' | 'ACTIVE' | 'SATURATED';
    crpaNullSteering: boolean;
  };
  spoofing: {
    detected: boolean;
    spoofConfidence: number;
    inertialCrossCheck: 'PASS' | 'WARN' | 'FAIL';
    positionDelta_m: number;
    clockDelta_ns: number;
  };
  datalink: {
    linkQuality: number;
    status: 'CONNECTED' | 'DEGRADED' | 'LOST';
    timeSinceContact_s: number;
  };
}

export type GNSSBand = 'L1' | 'L2' | 'L5' | 'S' | 'NavIC_L5' | 'NavIC_S';

export interface CountermeasureAction {
  id: string;
  timestamp: number;
  type: CountermeasureType;
  description: string;
  trigger: string;
  confidenceBefore: number;
  confidenceAfter: number;
  approval: 'AUTO' | 'PENDING' | 'APPROVED' | 'DENIED';
}

export type CountermeasureType =
  | 'NAV_SOURCE_SWITCH' | 'GNSS_REJECTION' | 'ANTI_JAM_ACTIVATE'
  | 'CRPA_NULL_STEER' | 'ALTITUDE_ADJUST' | 'FUSION_REWEIGHT'
  | 'MISSION_ABORT' | 'ROUTE_MODIFY' | 'ALERT_OPERATOR';
```

---

## Mission State

```typescript
// types/mission.ts

export interface MissionState {
  missionTime_s: number;
  phase: MissionPhase;
  activeScenario: string | null;
  playback: {
    isPlaying: boolean;
    speed: number;
    progress: number;
  };
  platform: {
    altitude_m: number;
    speed_kmh: number;
    heading_deg: number;
    latitude: number;
    longitude: number;
    fuelRemaining_pct: number;
    engineRPM: number;
  };
  target: {
    assigned: boolean;
    latitude?: number;
    longitude?: number;
    distanceToTarget_km?: number;
    timeToTarget_s?: number;
  };
}

export type MissionPhase =
  | 'PRE_LAUNCH' | 'LAUNCH' | 'CLIMB' | 'CRUISE'
  | 'LOITER' | 'TERMINAL' | 'POST_STRIKE';
```

---

## Scenario Format

```typescript
// types/scenario.ts

export interface Scenario {
  id: string;
  name: string;
  description: string;
  duration_s: number;
  timeline: ScenarioKeyframe[];
}

export interface ScenarioKeyframe {
  t: number;
  nav?: Partial<{
    insImu: number;
    gnss: number;
    tercom: number;
    magNav: number;
    sceneMatch: number;
    rfHoming: number;
    primarySource: NavSource;
    fusionConfidence: number;
    cep_m: number;
  }>;
  ew?: Partial<{
    jammingDetected: boolean;
    jamPower_dBm: number;
    spoofDetected: boolean;
    spoofConfidence: number;
    inertialCrossCheck: 'PASS' | 'WARN' | 'FAIL';
    antiJamStatus: 'INACTIVE' | 'ACTIVE' | 'SATURATED';
    linkQuality: number;
  }>;
  mission?: Partial<{
    phase: MissionPhase;
    altitude_m: number;
    speed_kmh: number;
    heading_deg: number;
  }>;
  actions?: CountermeasureAction[];
}
```

---

## Parameter Map — Sphere Point Assignments

```typescript
// data/navParameters.ts

export const THREAT_SPHERE_PARAMETERS: SphereParameterDefinition[] = [
  // GNSS group — clustered in upper hemisphere
  { id: 'gnss_l1_snr',      label: 'GNSS L1 SNR',       shortLabel: 'L1',    group: 'GNSS' },
  { id: 'gnss_l5_snr',      label: 'GNSS L5 SNR',       shortLabel: 'L5',    group: 'GNSS' },
  { id: 'gnss_navic_l5',    label: 'NavIC L5 Signal',    shortLabel: 'NL5',   group: 'GNSS' },
  { id: 'gnss_navic_s',     label: 'NavIC S-Band',       shortLabel: 'NS',    group: 'GNSS' },
  { id: 'gnss_glonass',     label: 'GLONASS Signal',     shortLabel: 'GLN',   group: 'GNSS' },
  { id: 'gnss_pdop',        label: 'GNSS PDOP',          shortLabel: 'PDOP',  group: 'GNSS' },
  { id: 'gnss_raim',        label: 'RAIM Integrity',     shortLabel: 'RAIM',  group: 'GNSS' },
  { id: 'gnss_spoof_delta', label: 'Spoof Detection Δ',  shortLabel: 'SPF',   group: 'GNSS' },

  // INS/IMU group — equatorial band
  { id: 'imu_gyro_x',       label: 'Gyro X Drift',       shortLabel: 'GX',    group: 'INS_IMU' },
  { id: 'imu_gyro_y',       label: 'Gyro Y Drift',       shortLabel: 'GY',    group: 'INS_IMU' },
  { id: 'imu_gyro_z',       label: 'Gyro Z Drift',       shortLabel: 'GZ',    group: 'INS_IMU' },
  { id: 'imu_accel_bias',   label: 'Accel Bias Estimate', shortLabel: 'ABE',  group: 'INS_IMU' },
  { id: 'imu_alignment',    label: 'INS Alignment',       shortLabel: 'ALN',  group: 'INS_IMU' },
  { id: 'imu_temperature',  label: 'IMU Temperature',     shortLabel: 'TMP',  group: 'INS_IMU' },

  // TERCOM group
  { id: 'tercom_ralt',      label: 'Radar Altimeter',     shortLabel: 'RALT', group: 'TERCOM' },
  { id: 'tercom_dem_corr',  label: 'DEM Correlation',     shortLabel: 'DEM',  group: 'TERCOM' },
  { id: 'tercom_terrain_var', label: 'Terrain Variance',  shortLabel: 'TVR',  group: 'TERCOM' },
  { id: 'tercom_update_age', label: 'Last TAN Update',    shortLabel: 'UPD',  group: 'TERCOM' },

  // MagNav group
  { id: 'magnav_field_str', label: 'Mag Field Strength',  shortLabel: 'MAG',  group: 'MAGNAV' },
  { id: 'magnav_map_corr',  label: 'Mag Map Correlation', shortLabel: 'MCR',  group: 'MAGNAV' },
  { id: 'magnav_anomaly',   label: 'Mag Anomaly Match',   shortLabel: 'ANM',  group: 'MAGNAV' },

  // Scene matching group
  { id: 'scene_eo_quality', label: 'EO Image Quality',    shortLabel: 'EOQ',  group: 'SCENE_MATCH' },
  { id: 'scene_dsmac_corr', label: 'DSMAC Correlation',   shortLabel: 'DSM',  group: 'SCENE_MATCH' },
  { id: 'scene_vio',        label: 'Visual Odometry',     shortLabel: 'VIO',  group: 'SCENE_MATCH' },
  { id: 'scene_lighting',   label: 'Scene Lighting',      shortLabel: 'LGT',  group: 'SCENE_MATCH' },

  // EW detection group
  { id: 'ew_jam_power',     label: 'Jam Power Level',     shortLabel: 'JAM',  group: 'EW_DETECT' },
  { id: 'ew_spoof_conf',    label: 'Spoof Confidence',    shortLabel: 'SPF',  group: 'EW_DETECT' },
  { id: 'ew_rf_scan',       label: 'RF Environment Scan', shortLabel: 'RFS',  group: 'EW_DETECT' },

  // Platform group
  { id: 'plat_airspeed',    label: 'Airspeed',            shortLabel: 'IAS',  group: 'PLATFORM' },
  { id: 'plat_altitude',    label: 'Barometric Alt',      shortLabel: 'ALT',  group: 'PLATFORM' },
  { id: 'plat_attitude',    label: 'Attitude Est.',       shortLabel: 'ATT',  group: 'PLATFORM' },
  { id: 'plat_engine',      label: 'Engine Health',       shortLabel: 'ENG',  group: 'PLATFORM' },

  // Comms group
  { id: 'comms_mitl_link',  label: 'MITL Link Quality',   shortLabel: 'LNK',  group: 'COMMS' },
  { id: 'comms_satcom',     label: 'SATCOM Signal',       shortLabel: 'SAT',  group: 'COMMS' },
];

export const RESPONSE_SPHERE_PARAMETERS: SphereParameterDefinition[] = [
  { id: 'resp_inertial_lock',  label: 'Inertial Lock',          shortLabel: 'INL',  group: 'INS_IMU' },
  { id: 'resp_gnss_reject',    label: 'GNSS Rejection',         shortLabel: 'REJ',  group: 'GNSS' },
  { id: 'resp_antijam_power',  label: 'Anti-Jam Power',         shortLabel: 'AJM',  group: 'EW_DETECT' },
  { id: 'resp_crpa_null',      label: 'CRPA Null Steering',     shortLabel: 'NUL',  group: 'EW_DETECT' },
  { id: 'resp_tercom_activate', label: 'TERCOM Activation',     shortLabel: 'TAN',  group: 'TERCOM' },
  { id: 'resp_magnav_activate', label: 'MagNav Activation',     shortLabel: 'MNV',  group: 'MAGNAV' },
  { id: 'resp_scene_activate',  label: 'Scene Match Activation', shortLabel: 'SCN', group: 'SCENE_MATCH' },
  { id: 'resp_ekf_reweight',    label: 'EKF Reweighting',       shortLabel: 'EKF',  group: 'INS_IMU' },
  { id: 'resp_alt_adjust',      label: 'Altitude Adjustment',   shortLabel: 'ALT',  group: 'PLATFORM' },
  { id: 'resp_route_modify',    label: 'Route Modification',    shortLabel: 'RTE',  group: 'PLATFORM' },
  { id: 'resp_fusion_conf',     label: 'Fusion Confidence',     shortLabel: 'FUS',  group: 'INS_IMU' },
  { id: 'resp_operator_alert',  label: 'Operator Alert',        shortLabel: 'OPR',  group: 'COMMS' },
];
```

---

## UI State

```typescript
// types/ui.ts

export interface UIState {
  viewportMode: 'MAP' | 'SPHERES' | 'SPLIT';
  leftPanelOpen: boolean;
  rightPanelOpen: boolean;
  selectedAssetId: string | null;
  hoveredParameter: string | null;
  classification: 'external' | 'investor' | 'internal' | 'classified';
  scenarioPickerOpen: boolean;
}
```
