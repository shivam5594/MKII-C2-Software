import { Canvas, useFrame, useLoader } from '@react-three/fiber'
import { useRef, Suspense, useMemo, useState, Component, type ReactNode, type ErrorInfo } from 'react'
import { OrbitControls, Environment } from '@react-three/drei'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import * as THREE from 'three'
import { useTelemetryStore } from '../../stores/telemetryStore'

const MODEL_PATH = `${import.meta.env.BASE_URL}models/shahed136.glb`

// --- Compass Rose SVG ---
function CompassRose({ heading }: { heading: number }) {
  const size = 100
  const cx = size / 2
  const cy = size / 2
  const r = 38

  const cardinals: [number, string][] = [[0, 'N'], [90, 'E'], [180, 'S'], [270, 'W']]

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display: 'block', margin: '0 auto' }}>
      {/* Outer ring */}
      <circle cx={cx} cy={cy} r={r + 4} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={1} />
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(0,229,255,0.25)" strokeWidth={1} />

      {/* Tick marks every 30° */}
      {Array.from({ length: 12 }, (_, i) => i * 30).map((deg) => {
        const rad = (deg - 90) * Math.PI / 180
        const isMajor = deg % 90 === 0
        const inner = isMajor ? r - 8 : r - 5
        return (
          <line key={deg}
            x1={cx + inner * Math.cos(rad)} y1={cy + inner * Math.sin(rad)}
            x2={cx + r * Math.cos(rad)} y2={cy + r * Math.sin(rad)}
            stroke={isMajor ? 'rgba(0,229,255,0.6)' : 'rgba(255,255,255,0.2)'}
            strokeWidth={isMajor ? 1.5 : 0.8}
          />
        )
      })}

      {/* Cardinal labels */}
      {cardinals.map(([deg, label]) => {
        const rad = (deg - 90) * Math.PI / 180
        const labelR = r + 12
        return (
          <text key={label}
            x={cx + labelR * Math.cos(rad)}
            y={cy + labelR * Math.sin(rad) + 3.5}
            textAnchor="middle"
            fill={label === 'N' ? '#00E5FF' : '#5A6A82'}
            fontSize={label === 'N' ? 11 : 9}
            fontWeight={label === 'N' ? 700 : 500}
            fontFamily="'JetBrains Mono', monospace"
          >
            {label}
          </text>
        )
      })}

      {/* Heading pointer (rotates) */}
      <g transform={`rotate(${heading}, ${cx}, ${cy})`}>
        <polygon
          points={`${cx},${cy - r + 2} ${cx - 4},${cy - r + 10} ${cx + 4},${cy - r + 10}`}
          fill="#00E5FF"
        />
        <line x1={cx} y1={cy + 4} x2={cx} y2={cy + r - 6}
          stroke="rgba(0,229,255,0.3)" strokeWidth={1} />
      </g>

      {/* Center dot */}
      <circle cx={cx} cy={cy} r={2} fill="#00E5FF" />

      {/* Heading readout */}
      <text x={cx} y={cy + r + 24} textAnchor="middle"
        fill="#00E5FF" fontSize={11} fontWeight={600}
        fontFamily="'JetBrains Mono', monospace">
        HDG {String(Math.round(((heading % 360) + 360) % 360)).padStart(3, '0')}°
      </text>
    </svg>
  )
}

// --- Shared attitude animation hook ---
function useAttitudeAnimation(groupRef: React.RefObject<THREE.Group | null>) {
  const targetRef = useRef({ pitch: 0, roll: 0, yaw: 0 })

  useFrame(() => {
    if (!groupRef.current) return
    const values = useTelemetryStore.getState().values
    const pitch = (values.theta ?? 0) * Math.PI / 180
    const roll = (values.phi ?? 0) * Math.PI / 180
    const yaw = (values.psi ?? 0) * Math.PI / 180

    const t = targetRef.current
    t.pitch += (pitch - t.pitch) * 0.08
    t.roll += (roll - t.roll) * 0.08

    let yawDiff = yaw - t.yaw
    if (yawDiff > Math.PI) yawDiff -= 2 * Math.PI
    if (yawDiff < -Math.PI) yawDiff += 2 * Math.PI
    t.yaw += yawDiff * 0.08

    groupRef.current.rotation.set(t.pitch, -t.yaw, -t.roll, 'YXZ')
  })
}

// --- 3D Platform Model (GLB) ---
function PlatformModel() {
  const groupRef = useRef<THREE.Group>(null)
  useAttitudeAnimation(groupRef)

  const gltf = useLoader(GLTFLoader, MODEL_PATH)

  const scene = useMemo(() => {
    const clone = gltf.scene.clone(true)
    const box = new THREE.Box3().setFromObject(clone)
    const center = box.getCenter(new THREE.Vector3())
    const size = box.getSize(new THREE.Vector3())
    const maxDim = Math.max(size.x, size.y, size.z)
    const scale = 2.2 / maxDim

    clone.position.set(-center.x * scale, -center.y * scale, -center.z * scale)
    clone.scale.setScalar(scale)

    // Dark body + subtle cyan wireframe for CAD look
    clone.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh
        mesh.material = new THREE.MeshStandardMaterial({
          color: 0x0a1a2a,
          metalness: 0.6,
          roughness: 0.3,
          transparent: true,
          opacity: 0.9,
        })
      }
    })

    return clone
  }, [gltf])

  // Build wireframe overlay from all meshes
  const wireframes = useMemo(() => {
    const geos: THREE.BufferGeometry[] = []
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh
        const geo = mesh.geometry.clone()
        geo.applyMatrix4(mesh.matrixWorld)
        geos.push(geo)
      }
    })
    return geos
  }, [scene])

  return (
    <group ref={groupRef}>
      <primitive object={scene} />
      {wireframes.map((geo, i) => (
        <mesh key={i} geometry={geo}>
          <meshBasicMaterial color="#00E5FF" wireframe transparent opacity={0.1} />
        </mesh>
      ))}
    </group>
  )
}

// --- Fallback wireframe (shown while STL loads or if missing) ---
function FallbackAircraft() {
  const groupRef = useRef<THREE.Group>(null)
  useAttitudeAnimation(groupRef)

  return (
    <group ref={groupRef}>
      {/* Fuselage */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.08, 0.12, 2, 8]} />
        <meshStandardMaterial color="#0a2a3a" metalness={0.5} roughness={0.4} />
      </mesh>
      {/* Wings */}
      <mesh position={[0, 0, 0.2]}>
        <boxGeometry args={[2.2, 0.03, 0.6]} />
        <meshStandardMaterial color="#0a2a3a" metalness={0.5} roughness={0.4} />
      </mesh>
      {/* Tail */}
      <mesh position={[0, 0, -0.8]}>
        <boxGeometry args={[0.5, 0.03, 0.2]} />
        <meshStandardMaterial color="#0a2a3a" metalness={0.5} roughness={0.4} />
      </mesh>
      {/* Vertical stabilizer */}
      <mesh position={[0, 0.15, -0.8]}>
        <boxGeometry args={[0.02, 0.3, 0.2]} />
        <meshStandardMaterial color="#0a2a3a" metalness={0.5} roughness={0.4} />
      </mesh>
      {/* Wireframe overlays */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.08, 0.12, 2, 8]} />
        <meshBasicMaterial color="#00E5FF" wireframe opacity={0.3} transparent />
      </mesh>
      <mesh position={[0, 0, 0.2]}>
        <boxGeometry args={[2.2, 0.03, 0.6]} />
        <meshBasicMaterial color="#00E5FF" wireframe opacity={0.3} transparent />
      </mesh>
    </group>
  )
}

// --- Error boundary for load failure ---
class ErrorCatcher extends Component<
  { children: ReactNode; onError: () => void },
  { hasError: boolean }
> {
  state = { hasError: false }
  static getDerivedStateFromError() { return { hasError: true } }
  componentDidCatch(_: Error, __: ErrorInfo) { this.props.onError() }
  render() {
    if (this.state.hasError) return null
    return this.props.children
  }
}

function ModelWithFallback() {
  const [loadFailed, setLoadFailed] = useState(false)

  if (loadFailed) return <FallbackAircraft />

  return (
    <ErrorCatcher onError={() => setLoadFailed(true)}>
      <Suspense fallback={<FallbackAircraft />}>
        <PlatformModel />
      </Suspense>
    </ErrorCatcher>
  )
}

// --- Main exported component ---
export default function PlatformAttitudeViewer() {
  const values = useTelemetryStore((s) => s.values)
  const heading = values.psi ?? 270

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 0,
    }}>
      {/* 3D viewport */}
      <div style={{
        width: '100%',
        height: 160,
        borderRadius: '8px',
        overflow: 'hidden',
        border: '1px solid rgba(255,255,255,0.06)',
        backgroundColor: '#060A12',
      }}>
        <Canvas
          camera={{ position: [3, 1.5, 3], fov: 30, near: 0.1, far: 50 }}
          gl={{ antialias: true, alpha: true }}
          style={{ background: 'transparent' }}
        >
          <ambientLight intensity={0.3} />
          <directionalLight position={[5, 5, 5]} intensity={0.8} color="#ffffff" />
          <directionalLight position={[-3, 2, -3]} intensity={0.3} color="#00E5FF" />

          <ModelWithFallback />

          <gridHelper args={[6, 12, '#001a22', '#000d11']} position={[0, -1.2, 0]} />

          <OrbitControls
            enableZoom={false}
            enablePan={false}
            autoRotate={false}
            maxPolarAngle={Math.PI / 1.8}
            minPolarAngle={Math.PI / 4}
          />
          <Environment preset="night" />
        </Canvas>
      </div>

      {/* Subtitle */}
      <div className="font-mono" style={{
        fontSize: '8px',
        color: '#5A6A82',
        letterSpacing: '0.05em',
        textAlign: 'center',
        padding: '3px 0 2px',
        fontStyle: 'italic',
      }}>
        Notional model — may not reflect actual aircraft type
      </div>

      {/* Compass rose with heading */}
      <CompassRose heading={heading} />
    </div>
  )
}
