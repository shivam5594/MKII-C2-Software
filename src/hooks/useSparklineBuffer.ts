import { useEffect } from 'react'
import { useNavigationStore } from '../stores/navigationStore'
import { useTelemetryPanelStore } from '../stores/telemetryPanelStore'
import { TECHNIQUE_IDS } from '../types/navigation'
import type { TechniqueId } from '../types/navigation'

/**
 * Samples technique confidences at 1Hz and pushes to sparkline ring buffers.
 * Reads store state directly via getState() — no React re-renders.
 */
export function useSparklineBuffer() {
  useEffect(() => {
    const interval = setInterval(() => {
      const techniques = useNavigationStore.getState().techniques
      const values = {} as Record<TechniqueId, number>
      for (const id of TECHNIQUE_IDS) {
        values[id] = techniques[id].confidence_score
      }
      useTelemetryPanelStore.getState().pushAllSparklines(values)
    }, 1000)

    return () => clearInterval(interval)
  }, [])
}
