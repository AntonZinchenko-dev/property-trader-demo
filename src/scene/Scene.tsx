import { ContactShadows, Sparkles, Stars } from '@react-three/drei'
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
      <fog attach="fog" args={['#1e2230', 48, 132]} />
      <ambientLight intensity={0.36} />
      <hemisphereLight intensity={0.58} color="#dbe6ff" groundColor="#212535" />
      <directionalLight
        position={[7, 12, 6]}
        castShadow
        intensity={1.5}
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={1}
        shadow-camera-far={30}
        shadow-camera-left={-12}
        shadow-camera-right={12}
        shadow-camera-top={12}
        shadow-camera-bottom={-12}
      />
      <pointLight position={[-6, 3, -6]} intensity={1.7} distance={26} color="#7f8cff" />
      <pointLight position={[6, 3, 6]} intensity={1.08} distance={22} color="#ff8a66" />
      <pointLight position={[0, 2.6, 0]} intensity={1.1} distance={14} color="#7fd6ff" />
      <Sparkles count={48} speed={0.24} size={1.9} scale={[18, 6, 18]} color="#b8c8ff" />
      <Stars radius={70} depth={28} count={900} factor={3.2} saturation={0} fade speed={0.35} />

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
      <ContactShadows position={[0, -0.045, 0]} opacity={0.35} blur={1.8} scale={18} far={14} />

      <CameraRig />
    </>
  )
}