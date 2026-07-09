// Piece.tsx
import * as THREE from 'three'
import { useEffect, useMemo } from 'react'
import { a, useSpring } from '@react-spring/three'
import { useGame } from '../game/store.ts'
import { tileToVec3 } from '../game/boardLayout.ts'

const PIECE_Y = 0.235

export function Piece({ playerIndex, color }:{ playerIndex:number; color:string }) {
  const tile = useGame(s => s.players[playerIndex].tile)
  const setFocus = useGame(s => s.setFocus)
  const v = tileToVec3(tile)
  const baseColor = useMemo(() => new THREE.Color(color), [color])
  const darkColor = useMemo(() => baseColor.clone().multiplyScalar(0.65), [baseColor])
  const lightColor = useMemo(() => baseColor.clone().lerp(new THREE.Color('#ffffff'), 0.35), [baseColor])

  const [{ position }, api] = useSpring(() => ({
    position: [v.x, PIECE_Y, v.z] as [number, number, number],
    config: { mass: 1, tension: 260, friction: 34, clamp: true, precision: 0.0001 },
  }))

  useEffect(() => {
    api.start({
      to: { position: [v.x, PIECE_Y, v.z] as [number, number, number] },
    })
  }, [v.x, v.z, api])

  useEffect(() => {
    setFocus({ x: v.x, y: PIECE_Y, z: v.z })
  }, [tile, v.x, v.z, setFocus])

  return (
    <a.group position={position}>
      {/* основание */}
      <mesh castShadow receiveShadow position={[0, -0.15, 0]}>
        <cylinderGeometry args={[0.28, 0.34, 0.18, 32]} />
        <meshPhysicalMaterial color={darkColor} metalness={0.36} roughness={0.5} clearcoat={0.34} />
      </mesh>

      {/* корпус */}
      <mesh castShadow receiveShadow position={[0, 0.08, 0]}>
        <cylinderGeometry args={[0.2, 0.25, 0.28, 32]} />
        <meshPhysicalMaterial color={baseColor} metalness={0.6} roughness={0.24} clearcoat={0.56} />
      </mesh>

      {/* плечи фишки */}
      <mesh castShadow receiveShadow position={[0, 0.25, 0]}>
        <sphereGeometry args={[0.19, 32, 24]} />
        <meshPhysicalMaterial color={lightColor} metalness={0.65} roughness={0.19} clearcoat={0.62} />
      </mesh>

      {/* корона/навершие */}
      <mesh castShadow receiveShadow position={[0, 0.43, 0]}>
        <coneGeometry args={[0.1, 0.16, 24]} />
        <meshPhysicalMaterial color={baseColor} metalness={0.62} roughness={0.21} clearcoat={0.62} />
      </mesh>

      {/* декоративный ореол под фишкой */}
      <mesh position={[0, -0.235, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.26, 0.34, 40]} />
        <meshBasicMaterial color={baseColor} transparent opacity={0.26} />
      </mesh>

      {/* светящийся "камень" сверху */}
      <mesh castShadow position={[0, 0.54, 0]}>
        <sphereGeometry args={[0.055, 24, 16]} />
        <meshPhysicalMaterial
          color={new THREE.Color('#ffffff')}
          emissive={baseColor}
          emissiveIntensity={0.65}
          metalness={0.32}
          roughness={0.05}
          clearcoat={0.8}
        />
      </mesh>
    </a.group>
  )
}