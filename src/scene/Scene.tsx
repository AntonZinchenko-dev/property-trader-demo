import { ContactShadows, Environment, Sparkles, Stars } from '@react-three/drei'
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
      <fog attach="fog" args={['#2a2d3b', 48, 120]} />
      <ambientLight intensity={0.4} />
      <hemisphereLight intensity={0.5} color="#dbe6ff" groundColor="#242635" />
      <directionalLight
        position={[7, 12, 6]}
        castShadow
        intensity={1.35}
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={1}
        shadow-camera-far={30}
        shadow-camera-left={-12}
        shadow-camera-right={12}
        shadow-camera-top={12}
        shadow-camera-bottom={-12}
      />
      <pointLight position={[-6, 3, -6]} intensity={1.45} distance={24} color="#7f8cff" />
      <pointLight position={[6, 3, 6]} intensity={0.95} distance={20} color="#ff8a66" />
      <pointLight position={[0, 2.6, 0]} intensity={0.9} distance={14} color="#7fd6ff" />
      <Sparkles count={95} speed={0.32} size={2.3} scale={[20, 7, 20]} color="#b8c8ff" />
      <Stars radius={80} depth={35} count={1600} factor={4} saturation={0} fade speed={0.45} />
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
      <ContactShadows position={[0, -0.045, 0]} opacity={0.42} blur={2.6} scale={21} far={18} />

      <CameraRig />
    </>
  )
}