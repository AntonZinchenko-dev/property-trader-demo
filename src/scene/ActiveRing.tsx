import * as THREE from 'three'
import { useEffect, useRef } from 'react'
import { a, useSpring } from '@react-spring/three'
import { useFrame } from '@react-three/fiber'
import { tileToVec3 } from '../game/boardLayout.ts'
import { useGame } from '../game/store.ts'

export function ActiveRing() {
  const active = useGame(s => s.active)
  const activeTile = useGame(s => s.players[s.active]?.tile ?? 0)
  const coreMat = useRef<THREE.MeshBasicMaterial>(null)
  const haloMat = useRef<THREE.MeshBasicMaterial>(null)
  const haloRef = useRef<THREE.Mesh>(null)

  const p = tileToVec3(activeTile)

  const [{ position, scale }, api] = useSpring(() => ({
    position: [p.x, 0.04, p.z] as [number, number, number],
    scale: 1,
    config: { tension: 180, friction: 20 },
  }))

  useEffect(() => {
    const v = tileToVec3(activeTile)
    api.start({
      from: { scale: 0.95 },
      to:   { position: [v.x, 0.04, v.z] as [number, number, number], scale: 1 },
    })
  }, [activeTile, active, api])

  useFrame(({ clock }) => {
    const pulse = 0.5 + 0.5 * Math.sin(clock.getElapsedTime() * 4.2)
    if (coreMat.current) coreMat.current.opacity = 0.62 + pulse * 0.28
    if (haloMat.current) haloMat.current.opacity = 0.2 + pulse * 0.22
    if (haloRef.current) haloRef.current.scale.setScalar(1.02 + pulse * 0.1)
  })

  return (
    <a.group
      position={position}
      rotation={[-Math.PI / 2, 0, 0]}
      scale={scale}
      receiveShadow
    >
      <mesh>
        <ringGeometry args={[0.54, 0.66, 48]} />
        <meshBasicMaterial ref={coreMat} color="#ffd166" transparent opacity={0.9} />
      </mesh>
      <mesh ref={haloRef} position={[0, 0.0008, 0]}>
        <ringGeometry args={[0.68, 0.92, 56]} />
        <meshBasicMaterial ref={haloMat} color="#ffe5a8" transparent opacity={0.25} />
      </mesh>
    </a.group>
  )
}
