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
  }
  
  export function applyTileEffect(tile: number): TileEffectResult {
    if (tile === TILE.START) {
      return { moneyDelta: +200, log: 'Бонус за старт +$200' }
    }
    if (TAX_TILES.has(tile)) {
      return { moneyDelta: -100, log: 'Налог -$100' }
    }
    if (tile === TILE.GO_TO_JAIL) {
      return { sentToJail: true, log: 'Отправлен в тюрьму' }
    }
    if (tile === TILE.FREE_PARKING) {
      return { log: 'Бесплатная парковка' }
    }
    if (CHANCE_TILES.has(tile)) {
      const delta = Math.random() < 0.5 ? -100 : +100
      return { moneyDelta: delta, log: `Карта шанс: ${delta > 0 ? '+' : ''}$${delta}` }
    }
    return {}
  }
  