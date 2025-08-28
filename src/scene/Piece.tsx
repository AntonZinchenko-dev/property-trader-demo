// Piece.tsx
import { useEffect } from 'react'
import { a, useSpring } from '@react-spring/three'
import { useGame } from '../game/store.ts'
import { tileToVec3 } from '../game/boardLayout.ts'

export function Piece({ playerIndex, color }:{ playerIndex:number; color:string }) {
  const tile = useGame(s => s.players[playerIndex].tile)
  const setFocus = useGame(s => s.setFocus)
  const v = tileToVec3(tile)

  const { position } = useSpring({
    to: { position: [v.x, 0.4, v.z] as [number, number, number] },
    config: { tension: 180, friction: 28 },
  })

  useEffect(() => {
    setFocus({ x: v.x, y: 0.4, z: v.z })
  }, [tile])

  return (
    <a.mesh position={position} castShadow>
      <cylinderGeometry args={[0.25, 0.25, 0.6, 24]} />
      <meshStandardMaterial color={color} metalness={0.6} roughness={0.3} />
    </a.mesh>
  )
}