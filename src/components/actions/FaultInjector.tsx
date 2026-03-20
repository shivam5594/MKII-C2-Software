import { useFaultStore } from '../../stores/faultStore'

export default function FaultInjector() {
  const jamming = useFaultStore((s) => s.jamming)
  const spoofing = useFaultStore((s) => s.spoofing)
  const injectJamming = useFaultStore((s) => s.injectJamming)
  const clearJamming = useFaultStore((s) => s.clearJamming)
  const injectSpoofing = useFaultStore((s) => s.injectSpoofing)
  const clearSpoofing = useFaultStore((s) => s.clearSpoofing)
  const clearAll = useFaultStore((s) => s.clearAll)

  const simTime = performance.now() / 1000 // approximate; exact time tracked in tick loop

  const buttons = [
    {
      label: jamming ? 'STOP JAM' : 'INJECT JAM',
      shortcut: 'J',
      active: jamming,
      color: '#FFB800',
      onClick: () => jamming ? clearJamming() : injectJamming(simTime),
    },
    {
      label: spoofing ? 'STOP SPOOF' : 'INJECT SPOOF',
      shortcut: 'K',
      active: spoofing,
      color: '#E24B4A',
      onClick: () => spoofing ? clearSpoofing() : injectSpoofing(simTime),
    },
  ]

  return (
    <>
      {buttons.map((b) => (
        <button
          key={b.label}
          onClick={b.onClick}
          className="flex items-center justify-between w-full px-3 py-2.5 rounded-md border transition-all duration-200 cursor-pointer"
          style={{
            backgroundColor: b.active ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.02)',
            borderColor: b.active ? b.color : 'rgba(255,255,255,0.06)',
            boxShadow: b.active ? `0 0 15px ${b.color}20` : 'none',
          }}
        >
          <div className="flex items-center gap-2">
            <div
              className="w-2 h-2 rounded-full shrink-0"
              style={{
                backgroundColor: b.active ? b.color : '#5A6A82',
                boxShadow: b.active ? `0 0 8px ${b.color}60` : 'none',
                animation: b.active ? 'pulse 1.5s ease-in-out infinite' : 'none',
              }}
            />
            <span
              className="font-mono text-xs tracking-wider uppercase font-medium"
              style={{ color: b.active ? b.color : '#B0BFCC' }}
            >
              {b.label}
            </span>
          </div>
          <span
            className="font-mono text-xs"
            style={{ color: '#5A6A82', opacity: 0.6 }}
          >
            {b.shortcut}
          </span>
        </button>
      ))}

      {/* Clear All */}
      {(jamming || spoofing) && (
        <button
          onClick={clearAll}
          className="flex items-center justify-center w-full px-3 py-2 rounded-md border transition-all duration-200 cursor-pointer"
          style={{
            backgroundColor: 'rgba(255,255,255,0.02)',
            borderColor: 'rgba(255,255,255,0.06)',
          }}
        >
          <span
            className="font-mono text-xs tracking-wider uppercase font-medium"
            style={{ color: '#5A6A82' }}
          >
            CLEAR ALL
          </span>
          <span
            className="font-mono text-xs ml-2"
            style={{ color: '#5A6A82', opacity: 0.6 }}
          >
            ESC
          </span>
        </button>
      )}

      {/* Pulse animation */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </>
  )
}
