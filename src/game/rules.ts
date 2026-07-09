// src/game/rules.ts
import { getPropertyByTile, isPropertyTile } from './properties/properties.ts'

export const TILE = {
  START: 0,
  JAIL: 10,
  FREE_PARKING: 20,
  GO_TO_JAIL: 30,
} as const

export const TAX_TILES = new Set([4, 38])
export const CHANCE_TILES = new Set([7, 22, 36])

export type TileEffectResult = {
  sentToJail?: boolean
  moneyDelta?: number
  log?: string
  maybePurchasable?: boolean
  draw?: 'CHANCE'  // НОВОЕ: тянуть карту шанс
}

export function applyTileEffect(tile: number): TileEffectResult {
  if (TAX_TILES.has(tile)) {
    const cost = tile === 4 ? 200 : 100
    return { moneyDelta: -cost, log: `уплатил налог $${cost}` }
  }

  if (CHANCE_TILES.has(tile)) {
    // вместо рандомных ±$ отдаём событие "тянуть карту"
    return { draw: 'CHANCE', log: 'тянет карту Chance' }
  }

  if (tile === TILE.GO_TO_JAIL) {
    return { sentToJail: true, log: 'отправлен в тюрьму' }
  }

  if (tile === TILE.FREE_PARKING) {
    return { log: 'свободная парковка' }
  }

  if (isPropertyTile(tile)) {
    return { maybePurchasable: true }
  }

  return {}
}

export { getPropertyByTile, isPropertyTile }
