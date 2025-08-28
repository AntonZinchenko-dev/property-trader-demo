// src/scene/board/Tile.tsx
import { useMemo } from 'react'
import * as THREE from 'three'
import { makeTileTexture, type TileStyle } from './tileTextures.ts'

type Props = {
  x: number
  z: number
  size?: number
  style: TileStyle
}

export function Tile({ x, z, size = 1.1, style }: Props) {
  const map = useMemo(() => makeTileTexture(style, 512), [style])
  const material = useMemo(
    () => new THREE.MeshStandardMaterial({ map, roughness: 1, metalness: 0 }),
    [map]
  )

  // плоская плитка поверх пола (избегаем z-fighting, подняв на 0.01)
  return (
    <mesh position={[x, 0.01, z]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[size, size]} />
      <primitive object={material} attach="material" />
    </mesh>
  )
}
