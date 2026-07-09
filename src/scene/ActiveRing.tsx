import * as THREE from 'three'
import { useEffect, useRef } from 'react'
import { a, useSpring } from '@react-spring/three'
import { useFrame } from '@react-three/fiber'
import { tileToVec3 } from '../game/boardLayout.ts'
import { useGame } from '../game/store.ts'
import { PLAYER_COLORS } from '../game/colors.ts'

export function ActiveRing() {
  const active = useGame(s => s.active)
  const activeTile = useGame(s => s.players[s.active]?.tile ?? 0)
  const haloMat = useRef<THREE.MeshBasicMaterial>(null)
  const haloRef = useRef<THREE.Mesh>(null)
  const ringColor = PLAYER_COLORS[active] ?? '#8fb1ff'

  const p = tileToVec3(activeTile)

  const [{ position, scale }, api] = useSpring(() => ({
    position: [p.x, 0.012, p.z] as [number, number, number],
    scale: 1,
    config: { mass: 1, tension: 240, friction: 28, clamp: true },
  }))

  useEffect(() => {
    const v = tileToVec3(activeTile)
    api.start({
      from: { scale: 0.95 },
      to:   { position: [v.x, 0.012, v.z] as [number, number, number], scale: 1 },
    })
  }, [activeTile, active, api])

  useFrame(({ clock }) => {
    const pulse = 0.5 + 0.5 * Math.sin(clock.getElapsedTime() * 4.2)
    if (haloMat.current) haloMat.current.opacity = 0.16 + pulse * 0.26
    if (haloRef.current) haloRef.current.scale.setScalar(1.03 + pulse * 0.12)
  })

  return (
    <a.group
      position={position}
      rotation={[-Math.PI / 2, 0, 0]}
      scale={scale}
      receiveShadow
    >
      <mesh ref={haloRef} position={[0, 0.0006, 0]}>
        <ringGeometry args={[0.64, 0.94, 64]} />
        <meshBasicMaterial ref={haloMat} color={new THREE.Color(ringColor)} transparent opacity={0.26} />
      </mesh>
    </a.group>
  )
}
