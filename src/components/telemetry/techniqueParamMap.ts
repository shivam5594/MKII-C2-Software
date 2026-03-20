import type { ParameterGroup } from '../../types/sphere'
import type { TechniqueId } from '../../types/navigation'

/** Maps sensor parameter groups to their parent navigation technique */
export const GROUP_TO_TECHNIQUE_MAP: Record<ParameterGroup, TechniqueId> = {
  INS_IMU: 'INS',
  GNSS: 'GNSS',
  TERCOM: 'TERCOM',
  MAGNAV: 'MAGNAV',
  SCENE_MATCH: 'SCENE_MATCH',
  EW_DETECT: 'GNSS',
  PLATFORM: 'INS',
  COMMS: 'INS',
  RF_HOMING: 'RF_HOMING',
}
