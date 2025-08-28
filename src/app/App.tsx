import { Canvas } from '@react-three/fiber'
import { Scene } from '../scene/Scene.tsx'
import { UIOverlay } from './UIOverlay.tsx'

export default function App() {
  return (
    <div style={{ width: '100vw', height: '100vh', background: '#0f0f12' }}>
      <Canvas dpr={[1, 1.5]} shadows camera={{ position: [8, 10, 12], fov: 45 }} gl={{ antialias: true, powerPreference: 'high-performance' }}>
        <color attach="background" args={['#56565e']} />
        <Scene />
      </Canvas>
      <UIOverlay />
    </div>
  )
}