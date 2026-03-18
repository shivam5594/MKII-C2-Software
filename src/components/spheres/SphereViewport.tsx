import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import ConfidenceSphere from './ConfidenceSphere'

export default function SphereViewport() {
  return (
    <div style={{ width: '100%', height: '100%', backgroundColor: '#060A12' }}>
      <Canvas
        camera={{ position: [0, 0, 7], fov: 45 }}
        gl={{ antialias: true, alpha: false }}
        onCreated={({ gl }) => {
          gl.setClearColor('#060A12', 1)
        }}
      >
        <ambientLight intensity={0.1} />

        <group position={[-2.5, 0, 0]}>
          <ConfidenceSphere mode="threat" label="THREAT CONDITION" />
        </group>

        <group position={[2.5, 0, 0]}>
          <ConfidenceSphere mode="response" label="AI RESPONSE" />
        </group>

        <OrbitControls
          enablePan={false}
          maxDistance={12}
          minDistance={4}
          enableDamping
          dampingFactor={0.05}
        />
      </Canvas>
    </div>
  )
}
