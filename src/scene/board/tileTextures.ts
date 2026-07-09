import * as THREE from 'three'

export type TileStyle = {
  bg: string
  border?: string
  label?: string
  sublabel?: string
  labelColor?: string
  bandColor?: string
  pattern?: 'none' | 'diagonal' | 'dots'
  icon?: 'start' | 'property' | 'chance' | 'tax' | 'rail' | 'utility' | 'jail' | 'park' | 'gotojail' | 'chest'
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
    icon,
  } = style
  const cnv = document.createElement('canvas')
  cnv.width = cnv.height = size
  const ctx = cnv.getContext('2d')!

  // base background
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, size, size)

  // soft gradient for depth
  const g = ctx.createLinearGradient(0, 0, 0, size)
  g.addColorStop(0, 'rgba(255,255,255,0.14)')
  g.addColorStop(0.45, 'rgba(255,255,255,0.02)')
  g.addColorStop(1, 'rgba(0,0,0,0.28)')
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

  // inner frame to make cells feel less flat
  ctx.strokeStyle = 'rgba(255,255,255,0.16)'
  ctx.lineWidth = Math.max(1, Math.floor(size * 0.008))
  const m = Math.floor(size * 0.08)
  ctx.strokeRect(m, m, size - m * 2, size - m * 2)

  // labels
  if (icon) {
    const cx = size / 2
    const cy = size * 0.32
    const w = size * 0.18
    const h = size * 0.14

    ctx.save()
    ctx.strokeStyle = 'rgba(245,249,255,0.92)'
    ctx.fillStyle = 'rgba(245,249,255,0.88)'
    ctx.lineWidth = Math.max(2, Math.floor(size * 0.01))
    ctx.lineJoin = 'round'
    ctx.lineCap = 'round'

    if (icon === 'start') {
      ctx.beginPath()
      ctx.moveTo(cx - w * 0.8, cy)
      ctx.lineTo(cx + w * 0.6, cy)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(cx + w * 0.3, cy - h * 0.5)
      ctx.lineTo(cx + w * 0.8, cy)
      ctx.lineTo(cx + w * 0.3, cy + h * 0.5)
      ctx.closePath()
      ctx.fill()
    } else if (icon === 'property') {
      ctx.beginPath()
      ctx.rect(cx - w * 0.45, cy - h * 0.28, w * 0.9, h * 0.56)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(cx - w * 0.55, cy - h * 0.28)
      ctx.lineTo(cx, cy - h * 0.75)
      ctx.lineTo(cx + w * 0.55, cy - h * 0.28)
      ctx.stroke()
      ctx.beginPath()
      ctx.rect(cx - w * 0.1, cy - h * 0.04, w * 0.2, h * 0.32)
      ctx.stroke()
    } else if (icon === 'chance') {
      ctx.beginPath()
      ctx.arc(cx, cy, w * 0.42, 0, Math.PI * 2)
      ctx.stroke()
      ctx.font = `bold ${Math.floor(size * 0.12)}px system-ui, Arial, sans-serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText('?', cx, cy + 1)
    } else if (icon === 'tax') {
      ctx.beginPath()
      ctx.moveTo(cx, cy - h * 0.85)
      ctx.lineTo(cx, cy + h * 0.2)
      ctx.stroke()
      ctx.beginPath()
      ctx.arc(cx, cy + h * 0.4, w * 0.32, 0, Math.PI * 2)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(cx - w * 0.2, cy - h * 0.45)
      ctx.lineTo(cx + w * 0.2, cy - h * 0.45)
      ctx.stroke()
    } else if (icon === 'rail') {
      ctx.beginPath()
      ctx.rect(cx - w * 0.5, cy - h * 0.33, w, h * 0.5)
      ctx.stroke()
      ctx.beginPath()
      ctx.arc(cx - w * 0.22, cy + h * 0.27, w * 0.12, 0, Math.PI * 2)
      ctx.arc(cx + w * 0.22, cy + h * 0.27, w * 0.12, 0, Math.PI * 2)
      ctx.stroke()
    } else if (icon === 'utility') {
      ctx.beginPath()
      ctx.moveTo(cx - w * 0.22, cy - h * 0.7)
      ctx.lineTo(cx + w * 0.02, cy - h * 0.15)
      ctx.lineTo(cx - w * 0.05, cy - h * 0.15)
      ctx.lineTo(cx + w * 0.2, cy + h * 0.7)
      ctx.lineTo(cx - w * 0.02, cy + h * 0.1)
      ctx.lineTo(cx + w * 0.06, cy + h * 0.1)
      ctx.closePath()
      ctx.fill()
    } else if (icon === 'jail') {
      for (let k = -2; k <= 2; k++) {
        const x = cx + k * w * 0.2
        ctx.beginPath()
        ctx.moveTo(x, cy - h * 0.7)
        ctx.lineTo(x, cy + h * 0.7)
        ctx.stroke()
      }
      ctx.beginPath()
      ctx.moveTo(cx - w * 0.5, cy - h * 0.7)
      ctx.lineTo(cx + w * 0.5, cy - h * 0.7)
      ctx.moveTo(cx - w * 0.5, cy + h * 0.7)
      ctx.lineTo(cx + w * 0.5, cy + h * 0.7)
      ctx.stroke()
    } else if (icon === 'park') {
      ctx.beginPath()
      ctx.moveTo(cx, cy - h * 0.9)
      ctx.lineTo(cx - w * 0.4, cy)
      ctx.lineTo(cx + w * 0.4, cy)
      ctx.closePath()
      ctx.fill()
      ctx.beginPath()
      ctx.moveTo(cx, cy - h * 0.55)
      ctx.lineTo(cx - w * 0.32, cy + h * 0.22)
      ctx.lineTo(cx + w * 0.32, cy + h * 0.22)
      ctx.closePath()
      ctx.fill()
      ctx.beginPath()
      ctx.moveTo(cx, cy + h * 0.2)
      ctx.lineTo(cx, cy + h * 0.8)
      ctx.stroke()
    } else if (icon === 'gotojail') {
      ctx.beginPath()
      ctx.arc(cx, cy, w * 0.36, 0, Math.PI * 2)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(cx + w * 0.1, cy - h * 0.55)
      ctx.lineTo(cx + w * 0.52, cy - h * 0.15)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(cx + w * 0.5, cy - h * 0.38)
      ctx.lineTo(cx + w * 0.55, cy - h * 0.05)
      ctx.lineTo(cx + w * 0.22, cy - h * 0.08)
      ctx.stroke()
    } else if (icon === 'chest') {
      ctx.beginPath()
      ctx.rect(cx - w * 0.5, cy - h * 0.28, w, h * 0.58)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(cx - w * 0.5, cy - h * 0.02)
      ctx.lineTo(cx + w * 0.5, cy - h * 0.02)
      ctx.stroke()
      ctx.beginPath()
      ctx.arc(cx, cy + h * 0.02, w * 0.06, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.restore()
  }

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
  // text shadow pass
  if (label) {
    ctx.globalCompositeOperation = 'multiply'
    ctx.fillStyle = 'rgba(12,16,28,0.35)'
    ctx.font = `bold ${Math.floor(size * 0.18)}px system-ui, Arial, sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    const lines = label.split('\n')
    const lineH = Math.floor(size * 0.16)
    const startY = size * 0.54 - ((lines.length - 1) * lineH) / 2
    lines.forEach((line, idx) => {
      ctx.fillText(line, size / 2 + 1, startY + idx * lineH + 1)
    })
    ctx.globalCompositeOperation = 'source-over'
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
