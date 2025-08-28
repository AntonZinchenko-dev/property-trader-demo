import { useMemo } from 'react'
import { TILES } from '../game/boardLayout.ts'
import { Tile } from './board/Tile.tsx'
import { styleByIndex } from './board/styles.ts'

export function Board() {
  const cells = useMemo(() => TILES.map(([x, y, z], i) => ({ x, y, z, i })), [])
  return (
    <group>
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
        <planeGeometry args={[16, 16]} />
        <meshStandardMaterial color="#2b2e39" />
      </mesh>

      {cells.map(c => (
        <Tile
          key={c.i}
          x={c.x}
          z={c.z}
          size={1.1}
          style={styleByIndex(c.i)}
        />
      ))}
    </group>
  )
}
