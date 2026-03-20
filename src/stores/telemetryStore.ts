import { create } from 'zustand'
import type { TelemetryCategory } from '../types/telemetry'

const HISTORY_LENGTH = 120 // ~2 minutes at 1 sample/sec

interface TelemetryStore {
  // Current values for all 90 params
  values: Record<string, number>

  // Rolling history for sparklines/charts (last 120 samples)
  history: Record<string, number[]>

  // Active category tab
  activeCategory: TelemetryCategory

  // Update current values + push to history
  updateValues: (newValues: Record<string, number>) => void

  setActiveCategory: (cat: TelemetryCategory) => void
}

export const useTelemetryStore = create<TelemetryStore>((set) => ({
  values: {},
  history: {},
  activeCategory: 'FLIGHT',

  updateValues: (newValues) =>
    set((state) => {
      const history = { ...state.history }
      for (const [id, val] of Object.entries(newValues)) {
        const prev = history[id] ?? []
        const next = [...prev, val]
        history[id] = next.length > HISTORY_LENGTH ? next.slice(-HISTORY_LENGTH) : next
      }
      return { values: newValues, history }
    }),

  setActiveCategory: (cat) => set({ activeCategory: cat }),
}))
