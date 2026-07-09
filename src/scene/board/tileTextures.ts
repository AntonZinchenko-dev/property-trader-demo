import * as THREE from 'three'

export type TileStyle = {
  bg: string
  border?: string
  label?: string
  sublabel?: string
  labelColor?: string
  artSrc?: string
}

export function makeTileTexture(style: TileStyle, size = 512): THREE.CanvasTexture {
  const { bg, border = '#2b2b2b', label, sublabel, labelColor = '#111' } = style
  const cnv = document.createElement('canvas')
  cnv.width = cnv.height = size
  const ctx = cnv.getContext('2d')!

  // фон
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, size, size)

  // рамка
  ctx.strokeStyle = border
  ctx.lineWidth = Math.max(2, Math.floor(size * 0.02))
  ctx.strokeRect(ctx.lineWidth / 2, ctx.lineWidth / 2, size - ctx.lineWidth, size - ctx.lineWidth)

  // текст
  if (label) {
    ctx.fillStyle = labelColor
    ctx.font = `bold ${Math.floor(size * 0.18)}px system-ui, Arial, sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(label, size / 2, size * 0.55)
  }
  if (sublabel) {
    ctx.fillStyle = labelColor
    ctx.font = `${Math.floor(size * 0.1)}px system-ui, Arial, sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(sublabel, size / 2, size * 0.8)
  }

  const tex = new THREE.CanvasTexture(cnv)
  tex.anisotropy = 8
  tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping
  tex.needsUpdate = true
  return tex
}
