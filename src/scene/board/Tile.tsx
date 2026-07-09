import * as THREE from 'three'
import { useMemo } from 'react'
import { makeTileTexture, type TileStyle } from './tileTextures.ts'

type Props = {
  i: number
  x: number
  z: number
  size?: number
  style: TileStyle
  ownerColor?: string
}

export function Tile({ x, z, size = 1.1, style, ownerColor }: Props) {
  const map = useMemo(
    () => makeTileTexture(style, 512),
    [style.bg, style.border, style.label, style.sublabel, style.labelColor, style.bandColor, style.pattern],
  )
  const material = useMemo(() => new THREE.MeshStandardMaterial({ map, roughness: 0.96, metalness: 0.04 }), [map])

  // узкая цветная рамка сверху — признак владельца
  const ownerMat = useMemo(
    () => ownerColor ? new THREE.MeshStandardMaterial({ color: new THREE.Color(ownerColor), roughness: 1 }) : null,
    [ownerColor]
  )

  return (
    <group>
      {/* плоская текстурированная плитка */}
      <mesh position={[x, 0.002, z]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[size, size]} />
        <primitive object={material} attach="material" />
      </mesh>

      {/* рамка-владелец (если есть) — тонкое кольцо/рамка поверх плитки */}
      {ownerMat && (
        <mesh position={[x, 0.003, z]} rotation={[-Math.PI / 2, 0, 0]}>
          {/* узкий “тор” вокруг периметра: рисуем как две плоскости-разницы (упрощенно: чуть меньший квадрат поверх большего) */}
          <ringGeometry args={[size * 0.49, size * 0.5, 4]} />
          <primitive object={ownerMat} attach="material" />
        </mesh>
      )}
    </group>
  )
}
