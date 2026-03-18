export type ParameterGroup =
  | 'GNSS'
  | 'INS_IMU'
  | 'TERCOM'
  | 'MAGNAV'
  | 'SCENE_MATCH'
  | 'EW_DETECT'
  | 'PLATFORM'
  | 'COMMS'
  | 'RF_HOMING'

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
}

export interface SphereParameterDefinition {
  id: string
  label: string
  shortLabel: string
  group: ParameterGroup
}

export interface SphereParameter extends SphereParameterDefinition {
  theta: number
  phi: number
  confidence: number
  targetConfidence: number
  confidenceRate: number
  isActive: boolean
}

export interface SphereRenderData {
  positions: Float32Array
  colors: Float32Array
  sizes: Float32Array
  confidences: Float32Array
  radii: Float32Array
  pointCount: number
}
