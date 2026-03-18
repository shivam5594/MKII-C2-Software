import { useCallback } from 'react'
import { loadScenario } from '../data/scenarioEngine'
import { useUIStore } from '../stores/uiStore'
import { useNavigationStore } from '../stores/navigationStore'

export function useScenario() {
  const setActiveScenario = useUIStore((s) => s.setActiveScenario)
  const setPlaying = useUIStore((s) => s.setPlaying)
  const setPlaybackTime = useUIStore((s) => s.setPlaybackTime)
  const clearActions = useUIStore((s) => s.clearActions)
  const setAllConfidence = useNavigationStore((s) => s.setAllConfidence)

  const load = useCallback(async (scenarioId: string) => {
    const scenario = await loadScenario(scenarioId)
    setAllConfidence(0.95)
    clearActions()
    setActiveScenario(scenario)
    setPlaybackTime(0)
    setPlaying(true)
  }, [setActiveScenario, setPlaying, setPlaybackTime, setAllConfidence, clearActions])

  const stop = useCallback(() => {
    setPlaying(false)
    setPlaybackTime(0)
    setActiveScenario(null)
    setAllConfidence(0.95)
    clearActions()
  }, [setPlaying, setPlaybackTime, setActiveScenario, setAllConfidence, clearActions])

  return { load, stop }
}
