import type { TileStyle } from './tileTextures.ts'

const palette = ['#3a3f50', '#34384a', '#2e3342', '#40465a']

export function styleByIndex(i: number): TileStyle {
  const bg = palette[i % palette.length]
  // Примеры подписей — поставь свои (названия, цены, события)
  const label =
    i === 0 ? 'START' :
    i === 10 ? 'JAIL' :
    i === 20 ? 'PARK' :
    i === 30 ? 'GO TO\nJAIL' :
    `T${i}`

  return {
    bg,
    border: '#202331',
    label,
    labelColor: '#e9edf7',
  }
}
