// src/scene/physics/diceTextures.ts
import * as THREE from 'three'

function drawPips(ctx: CanvasRenderingContext2D, n: number, size: number) {
  const r = Math.floor(size * 0.085)            // радиус точки
  const off = Math.floor(size * 0.28)           // отступ от центра
  const cx = size / 2, cy = size / 2

  const dots: Array<[number, number]> = []
  const add = (x: number, y: number) => dots.push([cx + x * off, cy + y * off])

  // раскладки классические
  if (n === 1) add(0, 0)
  if (n === 2) { add(-1, -1); add(1, 1) }
  if (n === 3) { add(-1, -1); add(0, 0); add(1, 1) }
  if (n === 4) { add(-1, -1); add(1, -1); add(-1, 1); add(1, 1) }
  if (n === 5) { add(-1, -1); add(1, -1); add(0, 0); add(-1, 1); add(1, 1) }
  if (n === 6) { add(-1, -1); add(1, -1); add(-1, 0); add(1, 0); add(-1, 1); add(1, 1) }

  // фон
  ctx.fillStyle = '#e9e9e9'
  ctx.fillRect(0, 0, size, size)

  // лёгкая обводка
  ctx.strokeStyle = '#bdbdbd'
  ctx.lineWidth = Math.max(1, Math.floor(size * 0.015))
  ctx.strokeRect(0.5, 0.5, size - 1, size - 1)

  // точки
  ctx.fillStyle = '#111'
  for (const [x, y] of dots) {
    ctx.beginPath()
    ctx.arc(x, y, r, 0, Math.PI * 2)
    ctx.fill()
  }
}

export function makeDiceMaterials(size = 256): THREE.MeshStandardMaterial[] {
  const faces = [3, 4, 1, 6, 2, 5] // порядок материалов: +x,-x,+y,-y,+z,-z
  return faces.map((num) => {
    const cnv = document.createElement('canvas')
    cnv.width = cnv.height = size
    const ctx = cnv.getContext('2d')!
    drawPips(ctx, num, size)
    const tex = new THREE.CanvasTexture(cnv)
    tex.anisotropy = 8
    tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping
    tex.needsUpdate = true
    return new THREE.MeshStandardMaterial({ map: tex, roughness: 0.6, metalness: 0.05 })
  })
}
