import { create } from 'zustand'
import type { SphereParameterDefinition } from '../types/sphere'
import { THREAT_SPHERE_PARAMETERS, RESPONSE_SPHERE_PARAMETERS } from '../data/navParameters'
import type {
  TechniqueId,
  TechniqueState,
  FusionState,
  MissionState,
  EnvironmentState,
} from '../types/navigation'
import {
  TECHNIQUE_IDS,
  defaultTechniqueState,
  defaultFusionState,
  defaultMissionState,
  defaultEnvironmentState,
} from '../types/navigation'

export interface ParameterState {
  confidence: number
  targetConfidence: number
  isActive: boolean
}

interface NavigationStore {
  // ── Sensor-level params (drive sphere rendering) ──
  parameters: Record<string, ParameterState>
  setConfidence: (id: string, confidence: number) => void
  batchUpdate: (updates: Record<string, Partial<ParameterState>>) => void
  setAllConfidence: (confidence: number) => void

  // ── Technique-level state (derived, drives telemetry graphs) ──
  techniques: Record<TechniqueId, TechniqueState>
  setTechniqueState: (id: TechniqueId, state: Partial<TechniqueState>) => void
  setAllTechniques: (states: Record<TechniqueId, TechniqueState>) => void

  // ── Fusion core state ──
  fusion: FusionState
  setFusion: (state: Partial<FusionState>) => void

  // ── Mission state ──
  mission: MissionState
  setMission: (state: Partial<MissionState>) => void

  // ── Environment state ──
  environment: EnvironmentState
  setEnvironment: (state: Partial<EnvironmentState>) => void
}

function initParameters(defs: SphereParameterDefinition[], defaultConfidence: number): Record<string, ParameterState> {
  const params: Record<string, ParameterState> = {}
  for (const def of defs) {
    params[def.id] = {
      confidence: defaultConfidence,
      targetConfidence: defaultConfidence,
      isActive: true,
    }
  }
  return params
}

function initTechniques(): Record<TechniqueId, TechniqueState> {
  const t = {} as Record<TechniqueId, TechniqueState>
  for (const id of TECHNIQUE_IDS) {
    t[id] = defaultTechniqueState()
  }
  return t
}

const allDefs = [...THREAT_SPHERE_PARAMETERS, ...RESPONSE_SPHERE_PARAMETERS]

export const useNavigationStore = create<NavigationStore>((set) => ({
  // ── Sensor params ──
  parameters: initParameters(allDefs, 0.95),

  setConfidence: (id, confidence) =>
    set((state) => ({
      parameters: {
        ...state.parameters,
        [id]: { ...state.parameters[id], confidence, targetConfidence: confidence },
      },
    })),

  batchUpdate: (updates) =>
    set((state) => {
      const next = { ...state.parameters }
      for (const [id, patch] of Object.entries(updates)) {
        next[id] = { ...next[id], ...patch }
      }
      return { parameters: next }
    }),

  setAllConfidence: (confidence) =>
    set((state) => {
      const next: Record<string, ParameterState> = {}
      for (const [id, p] of Object.entries(state.parameters)) {
        next[id] = { ...p, confidence, targetConfidence: confidence }
      }
      return { parameters: next }
    }),

  // ── Technique state ──
  techniques: initTechniques(),

  setTechniqueState: (id, patch) =>
    set((state) => ({
      techniques: {
        ...state.techniques,
        [id]: { ...state.techniques[id], ...patch },
      },
    })),

  setAllTechniques: (states) =>
    set(() => ({ techniques: states })),

  // ── Fusion ──
  fusion: defaultFusionState(),

  setFusion: (patch) =>
    set((state) => ({
      fusion: { ...state.fusion, ...patch },
    })),

  // ── Mission ──
  mission: defaultMissionState(),

  setMission: (patch) =>
    set((state) => ({
      mission: { ...state.mission, ...patch },
    })),

  // ── Environment ──
  environment: defaultEnvironmentState(),

  setEnvironment: (patch) =>
    set((state) => ({
      environment: { ...state.environment, ...patch },
    })),
}))
