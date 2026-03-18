import { useCallback, useRef } from 'react'

interface ResizeHandleProps {
  side: 'left' | 'right'
  onResize: (delta: number) => void
}

export default function ResizeHandle({ side, onResize }: ResizeHandleProps) {
  const startXRef = useRef(0)

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    startXRef.current = e.clientX

    const onMouseMove = (ev: MouseEvent) => {
      const delta = ev.clientX - startXRef.current
      startXRef.current = ev.clientX
      // Left panel: drag right = wider (positive delta)
      // Right panel: drag left = wider (negative delta)
      onResize(side === 'left' ? delta : -delta)
    }

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }

    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
  }, [onResize, side])

  return (
    <div
      onMouseDown={onMouseDown}
      className="shrink-0 flex items-center justify-center cursor-col-resize group"
      style={{ width: '6px' }}
    >
      <div
        className="w-px h-8 rounded-full transition-colors group-hover:h-16"
        style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}
      />
    </div>
  )
}
