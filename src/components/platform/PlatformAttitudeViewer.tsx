import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber'
import { useRef, Suspense, useMemo, useState, useEffect, Component, type ReactNode, type ErrorInfo } from 'react'
import { OrbitControls, Text } from '@react-three/drei'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import * as THREE from 'three'
import { useTelemetryStore } from '../../stores/telemetryStore'

const MODEL_PATH = `${import.meta.env.BASE_URL}models/shahed136.glb`
const COMPASS_RADIUS = 1.6
const CYAN = '#00E5FF'

// --- 3D Compass Ring (flat in XZ plane, fixed — does not rotate with aircraft) ---
function CompassRing3D() {
  const groupRef = useRef<THREE.Group>(null)
  const targetYaw = useRef(0)

  // The ring stays fixed, but the heading marker rotates
  useFrame(() => {
    if (!groupRef.current) return
    const values = useTelemetryStore.getState().values
    const yaw = (values.psi ?? 0) * Math.PI / 180

    let diff = yaw - targetYaw.current
    if (diff > Math.PI) diff -= 2 * Math.PI
    if (diff < -Math.PI) diff += 2 * Math.PI
    targetYaw.current += diff * 0.08

    // Rotate the whole compass so heading faces camera direction
    groupRef.current.rotation.y = -targetYaw.current
  })

  // Build ring geometry
  const ringGeo = useMemo(() => {
    const curve = new THREE.EllipseCurve(0, 0, COMPASS_RADIUS, COMPASS_RADIUS, 0, Math.PI * 2, false, 0)
    const points = curve.getPoints(128)
    const geo = new THREE.BufferGeometry().setFromPoints(
      points.map((p) => new THREE.Vector3(p.x, 0, p.y))
    )
    return geo
  }, [])

  // Tick marks
  const ticks = useMemo(() => {
    const lines: { start: THREE.Vector3; end: THREE.Vector3; major: boolean }[] = []
    for (let deg = 0; deg < 360; deg += 10) {
      const rad = deg * Math.PI / 180
      const isMajor = deg % 30 === 0
      const inner = COMPASS_RADIUS - (isMajor ? 0.12 : 0.06)
      lines.push({
        start: new THREE.Vector3(Math.sin(rad) * inner, 0, Math.cos(rad) * inner),
        end: new THREE.Vector3(Math.sin(rad) * COMPASS_RADIUS, 0, Math.cos(rad) * COMPASS_RADIUS),
        major: isMajor,
      })
    }
    return lines
  }, [])

  const cardinals: [number, string][] = [[0, 'N'], [90, 'E'], [180, 'S'], [270, 'W']]

  return (
    <group ref={groupRef} position={[0, -0.7, 0]}>
      {/* Main ring */}
      <line>
        <bufferGeometry attach="geometry" {...ringGeo} />
        <lineBasicMaterial color={CYAN} transparent opacity={0.4} />
      </line>

      {/* Tick marks */}
      {ticks.map((t, i) => {
        const geo = new THREE.BufferGeometry().setFromPoints([t.start, t.end])
        return (
          <line key={i}>
            <bufferGeometry attach="geometry" {...geo} />
            <lineBasicMaterial color={CYAN} transparent opacity={t.major ? 0.6 : 0.25} />
          </line>
        )
      })}

      {/* Cardinal labels — 3D text on the ring plane */}
      {cardinals.map(([deg, label]) => {
        const rad = deg * Math.PI / 180
        const labelR = COMPASS_RADIUS + 0.2
        return (
          <Text
            key={label}
            position={[Math.sin(rad) * labelR, 0, Math.cos(rad) * labelR]}
            rotation={[-Math.PI / 2, 0, 0]}
            fontSize={0.16}
            color={label === 'N' ? CYAN : '#6B7B8D'}
            fontWeight={label === 'N' ? 700 : 400}
            font="https://fonts.gstatic.com/s/jetbrainsmono/v18/tDbY2o-flEEny0FZhsfKu5WU4zr3E_BX0PnT8RD8yKxjPVmUsaaDhw.woff2"
            anchorX="center"
            anchorY="middle"
          >
            {label}
          </Text>
        )
      })}

      {/* Heading pointer — triangle at north position */}
      <mesh position={[0, 0.01, COMPASS_RADIUS - 0.04]} rotation={[-Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.06, 0.12, 3]} />
        <meshBasicMaterial color={CYAN} />
      </mesh>
    </group>
  )
}

// --- Shared attitude animation hook (pitch + roll only, yaw handled by compass) ---
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
    const scale = 2.0 / maxDim

    clone.position.set(-center.x * scale, -center.y * scale, -center.z * scale)
    clone.scale.setScalar(scale)

    // Bright, visible material — light grey body with subtle blue tint
    clone.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh
        mesh.material = new THREE.MeshPhongMaterial({
          color: 0x8899aa,
          specular: 0x44aacc,
          shininess: 60,
          transparent: true,
          opacity: 0.92,
        })
      }
    })

    return clone
  }, [gltf])

  return (
    <group ref={groupRef}>
      <primitive object={scene} />
    </group>
  )
}

// --- Fallback wireframe ---
function FallbackAircraft() {
  const groupRef = useRef<THREE.Group>(null)
  useAttitudeAnimation(groupRef)

  const mat = useMemo(() => new THREE.MeshPhongMaterial({
    color: 0x8899aa, specular: 0x44aacc, shininess: 60,
  }), [])
  const wireMat = useMemo(() => new THREE.MeshBasicMaterial({
    color: CYAN, wireframe: true, transparent: true, opacity: 0.2,
  }), [])

  return (
    <group ref={groupRef}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.08, 0.12, 2, 8]} />
        <primitive object={mat} attach="material" />
      </mesh>
      <mesh position={[0, 0, 0.2]}>
        <boxGeometry args={[2.2, 0.03, 0.6]} />
        <primitive object={mat} attach="material" />
      </mesh>
      <mesh position={[0, 0, -0.8]}>
        <boxGeometry args={[0.5, 0.03, 0.2]} />
        <primitive object={mat} attach="material" />
      </mesh>
      <mesh position={[0, 0.15, -0.8]}>
        <boxGeometry args={[0.02, 0.3, 0.2]} />
        <primitive object={mat} attach="material" />
      </mesh>
      {/* Wireframe overlay */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.08, 0.12, 2, 8]} />
        <primitive object={wireMat} attach="material" />
      </mesh>
      <mesh position={[0, 0, 0.2]}>
        <boxGeometry args={[2.2, 0.03, 0.6]} />
        <primitive object={wireMat} attach="material" />
      </mesh>
    </group>
  )
}

// --- Error boundary ---
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

// --- Adjust camera on mount ---
function CameraSetup() {
  const { camera } = useThree()
  useEffect(() => {
    camera.position.set(2.5, 1.8, 2.5)
    camera.lookAt(0, -0.2, 0)
  }, [camera])
  return null
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
      {/* 3D viewport with integrated compass */}
      <div style={{
        width: '100%',
        height: 200,
        borderRadius: '8px',
        overflow: 'hidden',
        border: '1px solid rgba(255,255,255,0.06)',
        backgroundColor: '#060A12',
      }}>
        <Canvas
          camera={{ position: [2.5, 1.8, 2.5], fov: 32, near: 0.1, far: 50 }}
          gl={{ antialias: true, alpha: true }}
          style={{ background: 'transparent' }}
        >
          <CameraSetup />

          {/* Lighting — bright enough to see model clearly */}
          <ambientLight intensity={0.6} />
          <directionalLight position={[4, 6, 4]} intensity={1.0} color="#ffffff" />
          <directionalLight position={[-3, 3, -2]} intensity={0.4} color="#88ccff" />
          <directionalLight position={[0, -2, 0]} intensity={0.15} color="#00E5FF" />

          {/* Aircraft model */}
          <ModelWithFallback />

          {/* 3D compass ring — in scene, below aircraft */}
          <CompassRing3D />

          <OrbitControls
            enableZoom={false}
            enablePan={false}
            autoRotate={false}
            maxPolarAngle={Math.PI / 2.2}
            minPolarAngle={Math.PI / 6}
          />
        </Canvas>
      </div>

      {/* Subtitle + heading readout */}
      <div style={{ textAlign: 'center', padding: '4px 0 2px' }}>
        <div className="font-mono" style={{
          fontSize: '8px',
          color: '#5A6A82',
          letterSpacing: '0.05em',
          fontStyle: 'italic',
        }}>
          Notional model — may not reflect actual aircraft type
        </div>
        <div className="font-mono" style={{
          fontSize: '11px',
          color: CYAN,
          fontWeight: 600,
          marginTop: '2px',
        }}>
          HDG {String(Math.round(((heading % 360) + 360) % 360)).padStart(3, '0')}°
        </div>
      </div>
    </div>
  )
}
