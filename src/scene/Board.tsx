import { useMemo } from 'react'
import { TILES } from '../game/boardLayout.ts'
import { Tile } from './board/Tile.tsx'
import { styleByIndex } from './board/styles.ts'
import { useGame } from '../game/store.ts'
import { PLAYER_COLORS } from '../game/colors.ts'

export function Board() {
  const cells = useMemo(() => TILES.map(([x, y, z], i) => ({ x, y, z, i })), [])
  const ownership = useGame(s => s.ownership)

  return (
    <group>
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
        <planeGeometry args={[16, 16]} />
        <meshStandardMaterial color="#2b2e39" />
      </mesh>

      {cells.map(c => {
        const style = styleByIndex(c.i)
        const owner = ownership[c.i]
        const ownerColor = owner ? (PLAYER_COLORS[owner.ownerIndex] ?? '#ffffff') : undefined
        return (
          <Tile
            key={c.i}
            i={c.i}
            x={c.x}
            z={c.z}
            size={1.1}
            style={style}
            ownerColor={ownerColor}
          />
        )
      })}
    </group>
  )
}