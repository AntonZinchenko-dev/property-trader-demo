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
      <mesh receiveShadow castShadow position={[0, -0.1, 0]}>
        <boxGeometry args={[16.6, 0.18, 16.6]} />
        <meshStandardMaterial color="#1f2430" roughness={0.9} metalness={0.05} />
      </mesh>

      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.008, 0]}>
        <planeGeometry args={[16, 16]} />
        <meshStandardMaterial color="#2a3040" roughness={0.95} metalness={0.02} />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.004, 0]}>
        <ringGeometry args={[5.95, 6.25, 96]} />
        <meshStandardMaterial color="#4a5f8a" emissive="#314362" emissiveIntensity={0.3} transparent opacity={0.6} />
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