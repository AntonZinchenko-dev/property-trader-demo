import * as THREE from 'three'

export type TileStyle = {
  bg: string
  border?: string
  label?: string
  sublabel?: string
  labelColor?: string
  bandColor?: string
  pattern?: 'none' | 'diagonal' | 'dots'
}

export function makeTileTexture(style: TileStyle, size = 512): THREE.CanvasTexture {
  const {
    bg,
    border = '#2b2b2b',
    label,
    sublabel,
    labelColor = '#111',
    bandColor,
    pattern = 'none',
  } = style
  const cnv = document.createElement('canvas')
  cnv.width = cnv.height = size
  const ctx = cnv.getContext('2d')!

  // base background
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, size, size)

  // soft gradient for depth
  const g = ctx.createLinearGradient(0, 0, 0, size)
  g.addColorStop(0, 'rgba(255,255,255,0.11)')
  g.addColorStop(0.45, 'rgba(255,255,255,0.02)')
  g.addColorStop(1, 'rgba(0,0,0,0.22)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, size, size)

  // subtle pattern
  if (pattern === 'diagonal') {
    ctx.strokeStyle = 'rgba(255,255,255,0.08)'
    ctx.lineWidth = Math.max(1, Math.floor(size * 0.01))
    const step = Math.floor(size * 0.16)
    for (let x = -size; x < size * 2; x += step) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x - size, size)
      ctx.stroke()
    }
  } else if (pattern === 'dots') {
    ctx.fillStyle = 'rgba(255,255,255,0.08)'
    const step = Math.floor(size * 0.18)
    const r = Math.max(2, Math.floor(size * 0.012))
    for (let y = Math.floor(step / 2); y < size; y += step) {
      for (let x = Math.floor(step / 2); x < size; x += step) {
        ctx.beginPath()
        ctx.arc(x, y, r, 0, Math.PI * 2)
        ctx.fill()
      }
    }
  }

  // top color band for groups
  if (bandColor) {
    const bandH = Math.floor(size * 0.18)
    ctx.fillStyle = bandColor
    ctx.fillRect(0, 0, size, bandH)
    ctx.fillStyle = 'rgba(0,0,0,0.24)'
    ctx.fillRect(0, bandH - Math.floor(size * 0.02), size, Math.floor(size * 0.02))
  }

  // border
  ctx.strokeStyle = border
  ctx.lineWidth = Math.max(2, Math.floor(size * 0.02))
  ctx.strokeRect(ctx.lineWidth / 2, ctx.lineWidth / 2, size - ctx.lineWidth, size - ctx.lineWidth)

  // labels
  if (label) {
    const lines = label.split('\n')
    const lineH = Math.floor(size * 0.16)
    const startY = size * 0.54 - ((lines.length - 1) * lineH) / 2
    ctx.fillStyle = labelColor
    ctx.font = `bold ${Math.floor(size * 0.18)}px system-ui, Arial, sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    lines.forEach((line, idx) => {
      ctx.fillText(line, size / 2, startY + idx * lineH)
    })
  }
  if (sublabel) {
    ctx.fillStyle = labelColor
    ctx.font = `${Math.floor(size * 0.095)}px system-ui, Arial, sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(sublabel, size / 2, size * 0.82)
  }

  const tex = new THREE.CanvasTexture(cnv)
  tex.anisotropy = 8
  tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping
  tex.needsUpdate = true
  return tex
}
