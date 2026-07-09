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
  const ownerCoreMat = useMemo(
    () => ownerColor ? new THREE.MeshBasicMaterial({ color: new THREE.Color(ownerColor), transparent: true, opacity: 0.95 }) : null,
    [ownerColor]
  )
  const ownerGlowMat = useMemo(
    () => ownerColor ? new THREE.MeshBasicMaterial({ color: new THREE.Color(ownerColor), transparent: true, opacity: 0.36 }) : null,
    [ownerColor]
  )
  const ownerMarkerMat = useMemo(
    () => ownerColor
      ? new THREE.MeshStandardMaterial({
          color: new THREE.Color(ownerColor),
          emissive: new THREE.Color(ownerColor),
          emissiveIntensity: 0.55,
          metalness: 0.25,
          roughness: 0.25,
        })
      : null,
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
      {ownerCoreMat && ownerGlowMat && ownerMarkerMat && (
        <>
          {/* Четкий ownership-контур */}
          <mesh position={[x, 0.0034, z]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[size * 0.468, size * 0.5, 4]} />
            <primitive object={ownerCoreMat} attach="material" />
          </mesh>

          {/* Внешний glow-контур */}
          <mesh position={[x, 0.0032, z]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[size * 0.5, size * 0.56, 32]} />
            <primitive object={ownerGlowMat} attach="material" />
          </mesh>

          {/* Явный маркер владения в углу */}
          <mesh position={[x + size * 0.34, 0.048, z - size * 0.34]} castShadow>
            <sphereGeometry args={[0.07, 18, 12]} />
            <primitive object={ownerMarkerMat} attach="material" />
          </mesh>
        </>
      )}
    </group>
  )
}
