import { Environment, Sparkles } from '@react-three/drei'
import { Physics } from '@react-three/cannon'
import { Board } from './Board.tsx'
import { CameraRig } from './CameraRig.tsx'
import { Piece } from './Piece.tsx'
import { ActiveRing } from './ActiveRing.tsx'
import { Ground } from './physics/Ground.tsx'
import { DicePair } from './physics/DicePair.tsx'

export function Scene() {
  return (
    <>
      <fog attach="fog" args={['#2a2d3b', 12, 30]} />
      <ambientLight intensity={0.45} />
      <hemisphereLight intensity={0.5} color="#dbe6ff" groundColor="#242635" />
      <directionalLight
        position={[7, 12, 6]}
        castShadow
        intensity={1.25}
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={1}
        shadow-camera-far={30}
        shadow-camera-left={-12}
        shadow-camera-right={12}
        shadow-camera-top={12}
        shadow-camera-bottom={-12}
      />
      <pointLight position={[-6, 3, -6]} intensity={1.2} distance={24} color="#7f8cff" />
      <pointLight position={[6, 3, 6]} intensity={0.8} distance={20} color="#ff8a66" />
      <Sparkles count={60} speed={0.28} size={2.2} scale={[20, 7, 20]} color="#b8c8ff" />
      <Environment preset="city" />

      <Physics
        gravity={[0, -9.81, 0]}
        allowSleep
        broadphase="SAP"
        defaultContactMaterial={{ friction: 0.7, restitution: 0.02 }}
      >
        <Ground />
        <Board />
        <ActiveRing />
        <Piece playerIndex={0} color="#9c6bff" />
        <Piece playerIndex={1} color="#ff7a66" />
        <DicePair />
      </Physics>

      <CameraRig />
    </>
  )
}