import { create } from 'zustand'
import type { ScenarioData } from '../data/scenarioEngine'

export type ViewportMode = 'SPHERES' | 'MAP' | 'TELEMETRY'

export interface ActionLogEntry {
  id: string
  timestamp: number
  type: string
  title: string
  detail: string
  status: 'AUTO' | 'PENDING' | 'APPROVED'
}

export const ACTION_TYPE_COLORS: Record<string, string> = {
  NAV_SWITCH: '#00E5FF',
  ALERT: '#FFB800',
  SPOOF_DETECT: '#E24B4A',
  FUSION: '#00FF88',
  DEFAULT: '#8899AA',
}

interface UIStore {
  activeScenario: ScenarioData | null
  isPlaying: boolean
  playbackTime: number
  playbackSpeed: number
  simulationTime: number

  viewportMode: ViewportMode
  leftPanelOpen: boolean
  rightPanelOpen: boolean
  leftPanelWidth: number
  rightPanelWidth: number

  hudVisible: boolean
  missionComplete: boolean
  actionLog: ActionLogEntry[]

  toggleHud: () => void
  setMissionComplete: (v: boolean) => void
  setActiveScenario: (scenario: ScenarioData | null) => void
  setPlaying: (playing: boolean) => void
  setPlaybackTime: (time: number) => void
  setPlaybackSpeed: (speed: number) => void
  setSimulationTime: (time: number) => void
  togglePlayback: () => void
  setViewportMode: (mode: ViewportMode) => void
  toggleLeftPanel: () => void
  toggleRightPanel: () => void
  setLeftPanelWidth: (w: number) => void
  setRightPanelWidth: (w: number) => void
  addAction: (entry: ActionLogEntry) => void
  clearActions: () => void
}

export const useUIStore = create<UIStore>((set) => ({
  activeScenario: null,
  isPlaying: false,
  playbackTime: 0,
  playbackSpeed: 1,
  simulationTime: 0,
  viewportMode: 'SPHERES',
  leftPanelOpen: true,
  rightPanelOpen: true,
  leftPanelWidth: 280,
  rightPanelWidth: 320,
  hudVisible: true,
  missionComplete: false,
  actionLog: [],

  toggleHud: () => set((s) => ({ hudVisible: !s.hudVisible })),
  setMissionComplete: (v) => set({ missionComplete: v }),
  setActiveScenario: (scenario) => set({ activeScenario: scenario, playbackTime: 0, isPlaying: false }),
  setPlaying: (playing) => set({ isPlaying: playing }),
  setPlaybackTime: (time) => set({ playbackTime: time }),
  setPlaybackSpeed: (speed) => set({ playbackSpeed: speed }),
  setSimulationTime: (time) => set({ simulationTime: time }),
  togglePlayback: () => set((s) => ({ isPlaying: !s.isPlaying })),
  setViewportMode: (mode) => set({ viewportMode: mode }),
  toggleLeftPanel: () => set((s) => ({ leftPanelOpen: !s.leftPanelOpen })),
  toggleRightPanel: () => set((s) => ({ rightPanelOpen: !s.rightPanelOpen })),
  setLeftPanelWidth: (w) => set({ leftPanelWidth: Math.max(200, Math.min(500, w)) }),
  setRightPanelWidth: (w) => set({ rightPanelWidth: Math.max(200, Math.min(500, w)) }),
  addAction: (entry) => set((s) => ({ actionLog: [entry, ...s.actionLog].slice(0, 50) })),
  clearActions: () => set({ actionLog: [] }),
}))
