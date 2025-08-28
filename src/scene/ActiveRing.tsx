import { useEffect } from 'react'
import { a, useSpring } from '@react-spring/three'
import { tileToVec3 } from '../game/boardLayout.ts'
import { useGame } from '../game/store.ts'

export function ActiveRing() {
  const focusTile = useGame(s => s.focusTile)

  const tileIndex = focusTile ?? 0 
  const p = tileToVec3(tileIndex)

  const [{ position, scale }, api] = useSpring(() => ({
    position: [p.x, 0.04, p.z] as [number, number, number],
    scale: 0,
    config: { tension: 180, friction: 20 },
  }))

  useEffect(() => {
    if (focusTile == null) {
      api.start({ to: { scale: 0 } })
      return
    }
    const v = tileToVec3(focusTile)
    api.start({
      from: { scale: 0.9 },
      to:   { position: [v.x, 0.04, v.z] as [number, number, number], scale: 1 },
    })
  }, [focusTile, api])

  return (
    <a.mesh
      visible={focusTile != null}   // просто прячем, не меняя хуки
      position={position}
      rotation={[-Math.PI / 2, 0, 0]}
      scale={scale}
      receiveShadow
    >
      <ringGeometry args={[0.55, 0.65, 32]} />
      <meshBasicMaterial color="#ffd166" transparent opacity={0.9} />
    </a.mesh>
  )
}
