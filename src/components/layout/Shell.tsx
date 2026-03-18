import { useEffect, useCallback } from 'react'
import ClassificationBar from './ClassificationBar'
import TopBar from './TopBar'
import BottomBar from './BottomBar'
import LeftPanel from './LeftPanel'
import RightPanel from './RightPanel'
import ResizeHandle from '../common/ResizeHandle'
import SphereViewport from '../spheres/SphereViewport'
import MapView from '../map/MapView'
import { useUIStore } from '../../stores/uiStore'
import { useSimulation } from '../../hooks/useSimulation'
import { useScenario } from '../../hooks/useScenario'
import type { ViewportMode } from '../../stores/uiStore'

function CenterViewport() {
  const mode = useUIStore((s) => s.viewportMode)

  if (mode === 'MAP') return <MapView />
  if (mode === 'SPHERES') return <SphereViewport />

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%' }}>
      <div style={{ flex: 1, minHeight: 0 }}>
        <SphereViewport />
      </div>
      <div style={{ height: '1px', backgroundColor: 'rgba(255,255,255,0.06)' }} />
      <div style={{ height: '35%', minHeight: 0 }}>
        <MapView />
      </div>
    </div>
  )
}

function ViewportTabs() {
  const mode = useUIStore((s) => s.viewportMode)
  const setMode = useUIStore((s) => s.setViewportMode)

  const tabs: { key: ViewportMode; label: string; shortcut: string }[] = [
    { key: 'MAP', label: 'MAP', shortcut: '1' },
    { key: 'SPHERES', label: 'SPHERES', shortcut: '2' },
    { key: 'SPLIT', label: 'SPLIT', shortcut: '3' },
  ]

  return (
    <div style={{
      position: 'absolute', top: '12px', left: '50%', transform: 'translateX(-50%)', zIndex: 10,
      display: 'flex', gap: '4px', padding: '4px 6px', borderRadius: '10px',
      backgroundColor: 'rgba(10, 14, 26, 0.85)', backdropFilter: 'blur(8px)',
      border: '1px solid rgba(255,255,255,0.06)',
    }}>
      {tabs.map((t) => (
        <button
          key={t.key}
          onClick={() => setMode(t.key)}
          className="font-mono text-xs tracking-wider uppercase font-medium"
          style={{
            padding: '6px 12px', borderRadius: '6px', border: 'none', cursor: 'pointer',
            transition: 'all 0.15s',
            backgroundColor: mode === t.key ? 'rgba(0, 229, 255, 0.1)' : 'transparent',
            color: mode === t.key ? '#00E5FF' : '#5A6A82',
          }}
        >
          {t.label}
          <span style={{ marginLeft: '4px', opacity: 0.4 }}>{t.shortcut}</span>
        </button>
      ))}
    </div>
  )
}

export default function Shell() {
  useSimulation()

  const { load } = useScenario()
  const setMode = useUIStore((s) => s.setViewportMode)
  const toggleLeft = useUIStore((s) => s.toggleLeftPanel)
  const toggleRight = useUIStore((s) => s.toggleRightPanel)
  const togglePlayback = useUIStore((s) => s.togglePlayback)
  const setPlaybackTime = useUIStore((s) => s.setPlaybackTime)
  const leftOpen = useUIStore((s) => s.leftPanelOpen)
  const rightOpen = useUIStore((s) => s.rightPanelOpen)
  const setLeftWidth = useUIStore((s) => s.setLeftPanelWidth)
  const setRightWidth = useUIStore((s) => s.setRightPanelWidth)

  const onResizeLeft = useCallback((delta: number) => {
    const current = useUIStore.getState().leftPanelWidth
    setLeftWidth(current + delta)
  }, [setLeftWidth])

  const onResizeRight = useCallback((delta: number) => {
    const current = useUIStore.getState().rightPanelWidth
    setRightWidth(current + delta)
  }, [setRightWidth])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return

      switch (e.key) {
        case '1': setMode('MAP'); break
        case '2': setMode('SPHERES'); break
        case '3': setMode('SPLIT'); break
        case '[': toggleLeft(); break
        case ']': toggleRight(); break
        case ' ':
          e.preventDefault()
          togglePlayback()
          break
        case 'ArrowLeft': {
          const t = useUIStore.getState().playbackTime
          setPlaybackTime(Math.max(0, t - 2))
          break
        }
        case 'ArrowRight': {
          const t = useUIStore.getState().playbackTime
          const dur = useUIStore.getState().activeScenario?.duration_seconds ?? 60
          setPlaybackTime(Math.min(dur, t + 2))
          break
        }
        case 'n': case 'N': load('nominal'); break
        case 'j': case 'J': load('gnss-jam'); break
        case 's': case 'S': load('spoof-attack'); break
      }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [setMode, toggleLeft, toggleRight, togglePlayback, setPlaybackTime, load])

  return (
    <div style={{
      height: '100%',
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: '#060A12',
      padding: '8px',
      gap: '6px',
    }}>
      {/* Classification bar — thin amber strip, respects outer padding */}
      <ClassificationBar />

      {/* Top bar — rounded */}
      <TopBar />

      {/* Main content row: left | resize | center | resize | right */}
      <div style={{ flex: 1, display: 'flex', minHeight: 0, gap: '6px' }}>
        {leftOpen && (
          <>
            <LeftPanel />
            <ResizeHandle side="left" onResize={onResizeLeft} />
          </>
        )}

        {/* Center viewport — rounded */}
        <div style={{ flex: 1, minWidth: 0, position: 'relative', borderRadius: '10px', overflow: 'hidden' }}>
          <ViewportTabs />
          <CenterViewport />
        </div>

        {rightOpen && (
          <>
            <ResizeHandle side="right" onResize={onResizeRight} />
            <RightPanel />
          </>
        )}
      </div>

      {/* Bottom bar — rounded */}
      <BottomBar />
    </div>
  )
}
