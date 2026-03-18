import { create } from 'zustand'
import type { SphereParameterDefinition } from '../types/sphere'
import { THREAT_SPHERE_PARAMETERS, RESPONSE_SPHERE_PARAMETERS } from '../data/navParameters'

export interface ParameterState {
  confidence: number
  targetConfidence: number
  isActive: boolean
}

interface NavigationStore {
  /** Confidence values keyed by parameter id */
  parameters: Record<string, ParameterState>
  /** Update a single parameter's confidence */
  setConfidence: (id: string, confidence: number) => void
  /** Batch update multiple parameters */
  batchUpdate: (updates: Record<string, Partial<ParameterState>>) => void
  /** Set all parameters to a uniform confidence */
  setAllConfidence: (confidence: number) => void
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

const allDefs = [...THREAT_SPHERE_PARAMETERS, ...RESPONSE_SPHERE_PARAMETERS]

export const useNavigationStore = create<NavigationStore>((set) => ({
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
}))
