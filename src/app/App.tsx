import { Canvas } from '@react-three/fiber'
import { Scene } from '../scene/Scene.tsx'
import { UIOverlay } from '../ui/UIOverlay.tsx'
import { useEffect } from 'react'
import { loadGame, setupAutoPersist } from '../game/persist.ts'

export default function App() {
  useEffect(() => {
    loadGame()
    const unsub = setupAutoPersist()
    return () => unsub?.()
  }, [])

  
  return (
    <div style={{ width: '100vw', height: '100vh', background: 'radial-gradient(circle at 20% 15%, #273758 0%, #151925 50%, #0c0f16 100%)' }}>
      <Canvas dpr={[1, 1.5]} shadows camera={{ position: [8, 10, 12], fov: 45 }} gl={{ antialias: true, powerPreference: 'high-performance' }}>
        <color attach="background" args={['#131722']} />
        <Scene />
      </Canvas>
      <UIOverlay />
    </div>
  )
}