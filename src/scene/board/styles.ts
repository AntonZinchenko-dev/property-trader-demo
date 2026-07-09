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
  const titleByIndex: Record<number, string> = {
    0: 'GO',
    1: 'MEDIT',
    2: 'CHEST',
    3: 'BALTIC',
    4: 'TAX',
    5: 'READING',
    6: 'ORIENTAL',
    7: 'CHANCE',
    8: 'VERMONT',
    9: 'CONNECT',
    10: 'JAIL',
    11: 'CHARLES',
    12: 'ELECTRIC',
    13: 'STATES',
    14: 'VIRGINIA',
    15: 'PENN RR',
    16: 'JAMES',
    17: 'CHEST',
    18: 'TENNES',
    19: 'NEW YORK',
    20: 'FREE',
    21: 'KENTUCKY',
    22: 'CHANCE',
    23: 'INDIANA',
    24: 'ILLINOIS',
    25: 'B&O RR',
    26: 'ATLANTIC',
    27: 'VENTNOR',
    28: 'WATER',
    29: 'MARVIN',
    30: 'GO TO',
    31: 'PACIFIC',
    32: 'N.CAROL',
    33: 'CHEST',
    34: 'PENN AV',
    35: 'SHORT LN',
    36: 'CHANCE',
    37: 'PARK',
    38: 'LUX TAX',
    39: 'BOARDWK',
  }
  const priceByTile: Record<number, string> = {
    1: '$60', 3: '$60',
    6: '$100', 8: '$100', 9: '$120',
    11: '$140', 13: '$140', 14: '$160',
    16: '$180', 18: '$180', 19: '$200',
    21: '$220', 23: '$220', 24: '$240',
    26: '$260', 27: '$260', 29: '$280',
    31: '$300', 32: '$300', 34: '$320',
    37: '$350', 39: '$400',
  }

  if (i === 0) return { ...specialStyle('GO', '+$200', '#1f3d35', '#3fd07c', 'diagonal'), icon: 'start' }
  if (i === 10) return { ...specialStyle('JAIL', 'JUST VISIT', '#3f2f21', '#c78b4a', 'diagonal'), icon: 'jail' }
  if (i === 20) return { ...specialStyle('FREE', 'PARKING', '#203845', '#4cb2de', 'dots'), icon: 'park' }
  if (i === 30) return { ...specialStyle('GO TO', 'JAIL', '#4a2228', '#de5a66', 'diagonal'), icon: 'gotojail' }

  if (CHANCE_TILES.has(i)) {
    return { ...specialStyle('CHANCE', 'DRAW CARD', '#322659', '#9e86ff', 'dots'), icon: 'chance' }
  }
  if (TAX_TILES.has(i)) {
    return { ...specialStyle('TAX', i === 4 ? '$200' : '$100', '#4b2529', '#ff7070', 'diagonal'), icon: 'tax' }
  }
  if (RAIL_TILES.has(i)) {
    return { ...specialStyle(titleByIndex[i] ?? 'RAIL', '$200', '#263749', '#a6bdd4', 'diagonal'), icon: 'rail' }
  }
  if (UTILITY_TILES.has(i)) {
    return { ...specialStyle(titleByIndex[i] ?? 'UTILITY', '$150', '#224546', '#67d0c2', 'dots'), icon: 'utility' }
  }

  if (i === 2 || i === 17 || i === 33) {
    return {
      bg: '#273047',
      border: '#1f2430',
      label: titleByIndex[i] ?? 'CHEST',
      sublabel: 'BONUS',
      labelColor: '#edf2ff',
      bandColor: '#86a7ff',
      pattern: 'dots',
      icon: 'chest',
    }
  }

  const group = groupByTile.get(i)
  if (group) {
    return {
      bg: '#293347',
      border: '#1f2430',
      label: titleByIndex[i] ?? `T${i}`,
      sublabel: priceByTile[i] ?? group.name,
      labelColor: '#edf2ff',
      bandColor: group.color,
      pattern: 'none',
      icon: 'property',
    }
  }

  return {
    bg: '#2c3242',
    border: '#1f2430',
    label: titleByIndex[i] ?? `T${i}`,
    sublabel: 'EVENT',
    labelColor: '#e2e9fb',
    bandColor: '#6f7d99',
    pattern: 'none',
    icon: 'chance',
  }
}
