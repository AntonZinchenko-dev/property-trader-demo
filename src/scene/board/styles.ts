import type { TileStyle } from './tileTextures.ts'

const PROPERTY_GROUPS: Array<{ name: string; color: string; tiles: number[] }> = [
  { name: 'BROWN', color: '#8a5a34', tiles: [1, 3] },
  { name: 'LIGHT BLUE', color: '#7bc8ff', tiles: [6, 8, 9] },
  { name: 'PINK', color: '#ff7fc2', tiles: [11, 13, 14] },
  { name: 'ORANGE', color: '#ff9b42', tiles: [16, 18, 19] },
  { name: 'RED', color: '#ff6161', tiles: [21, 23, 24] },
  { name: 'YELLOW', color: '#ffd954', tiles: [26, 27, 29] },
  { name: 'GREEN', color: '#46c77a', tiles: [31, 32, 34] },
  { name: 'DARK BLUE', color: '#4664d9', tiles: [37, 39] },
]

const CHANCE_TILES = new Set([7, 22, 36])
const TAX_TILES = new Set([4, 38])
const RAIL_TILES = new Set([5, 15, 25, 35])
const UTILITY_TILES = new Set([12, 28])

const groupByTile = new Map<number, { name: string; color: string }>()
for (const group of PROPERTY_GROUPS) {
  for (const tile of group.tiles) {
    groupByTile.set(tile, { name: group.name, color: group.color })
  }
}

function specialStyle(label: string, sublabel: string, bg: string, bandColor: string, pattern: TileStyle['pattern']): TileStyle {
  return {
    bg,
    border: '#1f2430',
    label,
    sublabel,
    labelColor: '#f0f4ff',
    bandColor,
    pattern,
  }
}

export function styleByIndex(i: number): TileStyle {
  if (i === 0) return specialStyle('START', '+200', '#1f3d35', '#3fd07c', 'diagonal')
  if (i === 10) return specialStyle('JAIL', 'VISIT', '#3f2f21', '#c78b4a', 'diagonal')
  if (i === 20) return specialStyle('FREE', 'PARK', '#203845', '#4cb2de', 'dots')
  if (i === 30) return specialStyle('GO TO', 'JAIL', '#4a2228', '#de5a66', 'diagonal')

  if (CHANCE_TILES.has(i)) {
    return specialStyle('CHANCE', `T${i}`, '#322659', '#9e86ff', 'dots')
  }
  if (TAX_TILES.has(i)) {
    return specialStyle('TAX', `T${i}`, '#4b2529', '#ff7070', 'diagonal')
  }
  if (RAIL_TILES.has(i)) {
    return specialStyle('RAIL', `T${i}`, '#263749', '#a6bdd4', 'diagonal')
  }
  if (UTILITY_TILES.has(i)) {
    return specialStyle('UTIL', `T${i}`, '#224546', '#67d0c2', 'dots')
  }

  const group = groupByTile.get(i)
  if (group) {
    return {
      bg: '#293347',
      border: '#1f2430',
      label: `T${i}`,
      sublabel: group.name,
      labelColor: '#edf2ff',
      bandColor: group.color,
      pattern: 'none',
    }
  }

  return {
    bg: '#2c3242',
    border: '#1f2430',
    label: `T${i}`,
    sublabel: 'EVENT',
    labelColor: '#e2e9fb',
    bandColor: '#6f7d99',
    pattern: 'none',
  }
}
