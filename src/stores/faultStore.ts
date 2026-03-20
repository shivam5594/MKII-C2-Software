import { create } from 'zustand'

interface FaultStore {
  jamming: boolean
  spoofing: boolean
  jammingStartedAt: number | null
  spoofingStartedAt: number | null

  injectJamming: (simTime: number) => void
  clearJamming: () => void
  injectSpoofing: (simTime: number) => void
  clearSpoofing: () => void
  clearAll: () => void
}

export const useFaultStore = create<FaultStore>((set) => ({
  jamming: false,
  spoofing: false,
  jammingStartedAt: null,
  spoofingStartedAt: null,

  injectJamming: (simTime) =>
    set((s) => s.jamming ? s : { jamming: true, jammingStartedAt: simTime }),

  clearJamming: () =>
    set({ jamming: false, jammingStartedAt: null }),

  injectSpoofing: (simTime) =>
    set((s) => s.spoofing ? s : { spoofing: true, spoofingStartedAt: simTime }),

  clearSpoofing: () =>
    set({ spoofing: false, spoofingStartedAt: null }),

  clearAll: () =>
    set({ jamming: false, spoofing: false, jammingStartedAt: null, spoofingStartedAt: null }),
}))
