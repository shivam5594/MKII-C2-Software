import { useEffect, useRef } from 'react'
import { interpolateAtTime } from '../data/scenarioEngine'
import { useUIStore } from '../stores/uiStore'
import { useNavigationStore } from '../stores/navigationStore'
import type { ParameterState } from '../stores/navigationStore'
import type { ActionLogEntry } from '../stores/uiStore'

// Predefined action triggers based on scenario + time thresholds
interface ActionTrigger {
  scenarioId: string
  time: number
  type: string
  title: string
  detail: string
}

const ACTION_TRIGGERS: ActionTrigger[] = [
  // GNSS Jamming scenario
  { scenarioId: 'gnss-jam', time: 8, type: 'ALERT', title: 'GNSS DEGRADATION', detail: 'L1/L5 SNR below threshold — jamming suspected' },
  { scenarioId: 'gnss-jam', time: 12, type: 'NAV_SWITCH', title: 'ANTI-JAM ACTIVE', detail: 'CRPA null steering engaged toward bearing 247°' },
  { scenarioId: 'gnss-jam', time: 15, type: 'NAV_SWITCH', title: 'NAV SOURCE SWITCH', detail: 'GNSS → TERCOM/TAN — confidence 0.65' },
  { scenarioId: 'gnss-jam', time: 20, type: 'FUSION', title: 'MAGNAV ACTIVATED', detail: 'Magnetic anomaly correlation online — CEP 450m' },
  { scenarioId: 'gnss-jam', time: 25, type: 'FUSION', title: 'MULTI-SOURCE FUSION', detail: 'TERCOM + MagNav + Scene Match — fusion confidence 0.85' },
  { scenarioId: 'gnss-jam', time: 35, type: 'FUSION', title: 'GPS-DENIED STABLE', detail: 'Navigation stable without GNSS — CEP 52m' },

  // Spoofing scenario
  { scenarioId: 'spoof-attack', time: 5, type: 'ALERT', title: 'GNSS ANOMALY', detail: 'Signal strength exceeds expected — monitoring' },
  { scenarioId: 'spoof-attack', time: 10, type: 'ALERT', title: 'INERTIAL DELTA GROWING', detail: 'GNSS-INS position delta: 45m and increasing' },
  { scenarioId: 'spoof-attack', time: 14, type: 'SPOOF_DETECT', title: 'SPOOFING DETECTED', detail: 'Inertial cross-check FAIL — GNSS integrity compromised' },
  { scenarioId: 'spoof-attack', time: 16, type: 'NAV_SWITCH', title: 'GNSS REJECTED', detail: 'Spoofed GNSS solution rejected — fallback to INS+TERCOM' },
  { scenarioId: 'spoof-attack', time: 20, type: 'FUSION', title: 'TERCOM ACTIVATED', detail: 'Terrain correlation nav online — confidence 0.55' },
  { scenarioId: 'spoof-attack', time: 30, type: 'FUSION', title: 'NAV RECOVERED', detail: 'Multi-source fusion stable — CEP 65m without GNSS' },
]

export function useSimulation() {
  const rafRef = useRef<number>(0)
  const lastTimeRef = useRef<number>(0)
  const firedActionsRef = useRef<Set<string>>(new Set())

  useEffect(() => {
    const tick = (timestamp: number) => {
      const dt = lastTimeRef.current ? (timestamp - lastTimeRef.current) / 1000 : 0
      lastTimeRef.current = timestamp

      const { activeScenario, isPlaying, playbackTime, playbackSpeed, setPlaybackTime, addAction } =
        useUIStore.getState()

      if (activeScenario && isPlaying) {
        const newTime = playbackTime + dt * playbackSpeed
        const duration = activeScenario.duration_seconds

        if (newTime >= duration) {
          setPlaybackTime(0)
          firedActionsRef.current.clear()
        } else {
          setPlaybackTime(newTime)
        }

        const clampedTime = Math.min(newTime, duration)
        const state = interpolateAtTime(activeScenario, clampedTime)
        const updates: Record<string, Partial<ParameterState>> = {}

        for (const [id, confidence] of Object.entries(state.threat)) {
          updates[id] = { confidence }
        }
        for (const [id, confidence] of Object.entries(state.response)) {
          updates[id] = { confidence }
        }

        useNavigationStore.getState().batchUpdate(updates)

        // Fire action triggers
        for (const trigger of ACTION_TRIGGERS) {
          if (trigger.scenarioId !== activeScenario.id) continue
          const key = `${trigger.scenarioId}_${trigger.time}`
          if (clampedTime >= trigger.time && !firedActionsRef.current.has(key)) {
            firedActionsRef.current.add(key)
            const entry: ActionLogEntry = {
              id: key + '_' + Date.now(),
              timestamp: trigger.time,
              type: trigger.type,
              title: trigger.title,
              detail: trigger.detail,
              status: 'AUTO',
            }
            addAction(entry)
          }
        }
      }

      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [])
}
