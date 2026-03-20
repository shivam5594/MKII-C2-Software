import { create } from 'zustand'
import type { TechniqueId } from '../types/navigation'
import { TECHNIQUE_IDS } from '../types/navigation'

const SPARKLINE_SIZE = 60 // 60 samples at 1Hz = 60s history

export interface TelemetryPanelStore {
  // Expand/collapse state
  expanded: Set<TechniqueId>
  toggle: (id: TechniqueId) => void
  expandAll: () => void
  collapseAll: () => void

  // Sparkline ring buffers — one per technique
  sparklines: Record<TechniqueId, number[]>
  pushSparkline: (id: TechniqueId, value: number) => void
  pushAllSparklines: (values: Record<TechniqueId, number>) => void
}

function initSparklines(): Record<TechniqueId, number[]> {
  const s = {} as Record<TechniqueId, number[]>
  for (const id of TECHNIQUE_IDS) {
    s[id] = []
  }
  return s
}

export const useTelemetryPanelStore = create<TelemetryPanelStore>((set) => ({
  expanded: new Set<TechniqueId>(),

  toggle: (id) =>
    set((state) => {
      const next = new Set(state.expanded)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return { expanded: next }
    }),

  expandAll: () => set({ expanded: new Set(TECHNIQUE_IDS) }),
  collapseAll: () => set({ expanded: new Set<TechniqueId>() }),

  sparklines: initSparklines(),

  pushSparkline: (id, value) =>
    set((state) => {
      const buf = [...state.sparklines[id], value]
      if (buf.length > SPARKLINE_SIZE) buf.shift()
      return { sparklines: { ...state.sparklines, [id]: buf } }
    }),

  pushAllSparklines: (values) =>
    set((state) => {
      const next = { ...state.sparklines }
      for (const id of TECHNIQUE_IDS) {
        const buf = [...next[id], values[id]]
        if (buf.length > SPARKLINE_SIZE) buf.shift()
        next[id] = buf
      }
      return { sparklines: next }
    }),
}))
