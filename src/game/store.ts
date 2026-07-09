// src/game/store.ts
import { create } from 'zustand'
import { applyTileEffect, TILE, getPropertyByTile, isPropertyTile } from './rules.ts'
import type { Card } from './cards.ts'
import { CHANCE_DECK, shuffle } from './cards.ts'

type Player = {
  id: string
  name: string
  tile: number
  money: number
  jailTurns: number
  doublesCount: number
}

type LogItem = { text: string; ts: number }
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))

type Ownership = {
  ownerIndex: number
  houses: number
  mortgaged: boolean
}

type PendingAction =
  | {
      type: 'PURCHASE'
      tile: number
      name: string
      price: number
      rent: number
      isDouble: boolean
    }
  | {
      type: 'CARD'
      card: Card
      isDouble: boolean
    }

type GameState = {
  players: Player[]
  active: number
  rolling: boolean
  isMoving: boolean
  focusTarget: { x: number; y: number; z: number } | null
  focusTile: number | null
  log: LogItem[]
  lastDice: number[]
  diceThrow?: () => Promise<number>

  // Chance
  chanceDeck: Card[]
  resolveCard: () => Promise<void>

  // Собственность
  ownership: Record<number, Ownership | undefined>
  pendingAction?: PendingAction

  // Готовность костей
  diceReady: boolean

  // Экшены
  payJail: () => void
  setDiceThrow: (fn?: () => Promise<number>) => void
  setFocus: (indexOrVec: number | { x: number; y: number; z: number } | null) => void
  setLastDice: (vals: number[]) => void
  setDiceReady: (ready: boolean) => void

  movePlayerBy: (playerIndex: number, steps: number) => Promise<void>
  takeTurn: () => Promise<void>

  buyProperty: () => void
  skipPurchase: () => void

  reset: () => void
}

// вспомогалки
const TILES_COUNT = 40
const moveStepsForward = (from: number, to: number) => (to - from + TILES_COUNT) % TILES_COUNT
const resetDoubles = (players: Player[], playerIndex: number) => {
  const p = players[playerIndex]
  if (!p || p.doublesCount === 0) return
  players[playerIndex] = { ...p, doublesCount: 0 }
}

export const useGame = create<GameState>((set, get) => ({
  players: [
    { id: 'p1', name: 'Player 1', tile: 0, money: 1500, jailTurns: 0, doublesCount: 0 },
    { id: 'p2', name: 'Player 2', tile: 0, money: 1500, jailTurns: 0, doublesCount: 0 },
  ],
  active: 0,
  rolling: false,
  isMoving: false,
  focusTarget: null,
  focusTile: null,
  log: [],
  lastDice: [],
  ownership: {},
  pendingAction: undefined,
  diceReady: false,

  // колода Chance
  chanceDeck: shuffle(CHANCE_DECK),

  setDiceThrow: (fn) => set({ diceThrow: fn }),
  setLastDice: (vals) => set({ lastDice: vals }),
  setDiceReady: (ready) => set({ diceReady: ready }),

  setFocus: (indexOrVec) => {
    if (indexOrVec == null) return set({ focusTarget: null, focusTile: null })
    if (typeof indexOrVec === 'number') {
      return set({ focusTile: indexOrVec })
    }
    return set({ focusTarget: indexOrVec, focusTile: null })
  },

  payJail: () => {
    const { players, active } = get()
    const me = players[active]
    if (me.jailTurns <= 0) return
    if (me.money < 50) {
      set({ log: [...get().log, { text: `${me.name}: недостаточно денег для выхода из тюрьмы ($50)`, ts: Date.now() }] })
      return
    }
    me.money -= 50
    me.jailTurns = 0
    set({
      players: [...players],
      log: [...get().log, { text: `${me.name}: оплатил $50 и вышел из тюрьмы`, ts: Date.now() }],
    })
  },

  resolveCard: async () => {
    const pending = get().pendingAction
    if (!pending || pending.type !== 'CARD') return

    const { players, active } = get()
    const me = players[active]
    const { card, isDouble } = pending
    const logs: LogItem[] = [{ text: `${me.name}: карта — ${card.title}`, ts: Date.now() }]

    if (card.effect.kind === 'money') {
      me.money += card.effect.delta
      logs.push({ text: `${me.name}: ${card.effect.delta > 0 ? '+' : ''}$${card.effect.delta}`, ts: Date.now() })
      set({ players: [...players], pendingAction: undefined, log: [...get().log, ...logs] })
    }

    else if (card.effect.kind === 'move_to') {
      const steps = moveStepsForward(me.tile, card.effect.tile)
      await get().movePlayerBy(active, steps)
      set({ pendingAction: undefined })
      logs.push({ text: `${me.name}: переместился на ${card.effect.tile}`, ts: Date.now() })

      const eff2 = applyTileEffect(players[active].tile)
      if (eff2.moneyDelta) {
        me.money += eff2.moneyDelta
        logs.push({ text: `${me.name}: ${eff2.moneyDelta > 0 ? '+' : ''}$${eff2.moneyDelta}`, ts: Date.now() })
      }
      if (eff2.sentToJail) {
        players[active] = { ...me, tile: TILE.JAIL, jailTurns: 3, doublesCount: 0 }
        set({
          players: [...players],
          focusTile: TILE.JAIL,
          log: [...get().log, ...logs, { text: `${me.name}: отправлен в тюрьму`, ts: Date.now() }],
        })
        set({ active: (active + 1) % players.length })
        return
      }
      if (isPropertyTile(players[active].tile)) {
        const property = getPropertyByTile(players[active].tile)!
        const own = get().ownership[players[active].tile]
        if (!own) {
          set({
            pendingAction: {
              type: 'PURCHASE',
              tile: property.tile,
              name: property.name,
              price: property.price,
              rent: property.rent,
              isDouble,
            },
            log: [...get().log, ...logs, { text: `${me.name}: ${property.name} доступна к покупке`, ts: Date.now() }],
          })
          return
        } else if (own.ownerIndex !== active && !own.mortgaged) {
          const rent = property.rent
          players[active].money -= rent
          players[own.ownerIndex].money += rent
          logs.push({ text: `${me.name}: аренда $${rent} игроку ${players[own.ownerIndex].name}`, ts: Date.now() })
          set({ players: [...players] })
        }
      }
      set({ log: [...get().log, ...logs] })
    }

    else if (card.effect.kind === 'go_to_jail') {
      players[active] = { ...me, tile: TILE.JAIL, jailTurns: 3, doublesCount: 0 }
      set({
        players: [...players],
        focusTile: TILE.JAIL,
        pendingAction: undefined,
        log: [...get().log, ...logs, { text: `${me.name}: в тюрьму`, ts: Date.now() }],
      })
      set({ active: (active + 1) % players.length })
      return
    }

    // обработка дублей после карты
    if (isDouble) {
      const newDoubles = (me.doublesCount ?? 0) + 1
      if (newDoubles >= 3) {
        players[active] = { ...me, tile: TILE.JAIL, jailTurns: 3, doublesCount: 0 }
        set({
          players: [...players],
          focusTile: TILE.JAIL,
          log: [...get().log, { text: `${me.name}: третий дубль подряд — в тюрьму`, ts: Date.now() }],
        })
        set({ active: (active + 1) % players.length })
      } else {
        players[active] = { ...me, doublesCount: newDoubles }
        set({
          players: [...players],
          log: [...get().log, { text: `${me.name}: дубль — дополнительный ход`, ts: Date.now() }],
        })
      }
    } else {
      resetDoubles(players, active)
      set({ players: [...players] })
      set({ active: (active + 1) % players.length })
    }
  },

  movePlayerBy: async (playerIndex, steps) => {
    const { players } = get()
    const p = players[playerIndex]
    set({ isMoving: true })

    for (let i = 0; i < steps; i++) {
      const nextTile = (p.tile + 1) % TILES_COUNT
      if (nextTile === TILE.START) {
        p.money += 200
        set({ log: [...get().log, { text: `${p.name}: прошёл через START +$200`, ts: Date.now() }] })
      }
      p.tile = nextTile
      set({ players: [...players], focusTile: p.tile })
      await sleep(180)
    }

    set({ isMoving: false, focusTile: p.tile })
  },

  takeTurn: async () => {
    const { active, players, diceThrow, rolling, isMoving, diceReady } = get()
    if (rolling || isMoving || !diceThrow || !diceReady) return

    const me = players[active]

    if (me.jailTurns > 0) {
      me.jailTurns -= 1
      set({
        players: [...players],
        log: [...get().log, { text: `${me.name}: пропускает ход (тюрьма)`, ts: Date.now() }],
      })
      set({ active: (active + 1) % players.length })
      return
    }

    set({ rolling: true })
    const total = await diceThrow()
    const [d1, d2] = get().lastDice
    const isDouble = d1 === d2

    if (!d1 || !d2 || total === 0) {
      set({
        rolling: false,
        log: [...get().log, { text: `${me.name}: кости не готовы — повтори бросок`, ts: Date.now() }],
      })
      return
    }
    if (!isDouble) resetDoubles(players, active)

    await get().movePlayerBy(active, total)
    const finalTile = players[active].tile

    const eff = applyTileEffect(finalTile)
    const logs: LogItem[] = []
    logs.push({ text: `${me.name}: бросок ${d1}+${d2}=${total}, финиш ${finalTile}`, ts: Date.now() })

    if (eff.moneyDelta) {
      me.money += eff.moneyDelta
      logs.push({
        text: `${me.name}: ${eff.moneyDelta > 0 ? '+' : ''}${eff.moneyDelta}`,
        ts: Date.now(),
      })
    }

    if (eff.sentToJail) {
      players[active] = { ...me, tile: TILE.JAIL, jailTurns: 3, doublesCount: 0 }
      set({
        players: [...players],
        focusTile: TILE.JAIL,
        log: [...get().log, ...logs, { text: `${me.name}: ${eff.log ?? 'тюрьма'}`, ts: Date.now() }],
        rolling: false,
      })
      set({ active: (active + 1) % players.length })
      return
    }

    // тянем карту Chance
    if (eff.draw === 'CHANCE') {
      const deck = get().chanceDeck
      const [card, ...rest] = deck.length ? deck : shuffle(CHANCE_DECK)
      set({
        pendingAction: { type: 'CARD', card, isDouble },
        chanceDeck: rest.length ? rest : shuffle(CHANCE_DECK),
        log: [...get().log, ...logs, { text: `${me.name}: тянет карту Chance`, ts: Date.now() }],
        rolling: false,
      })
      return
    }

    // собственность
    if (isPropertyTile(finalTile)) {
      const property = getPropertyByTile(finalTile)!
      const own = get().ownership[finalTile]

      if (!own) {
        set({
          pendingAction: {
            type: 'PURCHASE',
            tile: property.tile,
            name: property.name,
            price: property.price,
            rent: property.rent,
            isDouble,
          },
          log: [...get().log, ...logs, { text: `${me.name}: ${property.name} доступна к покупке`, ts: Date.now() }],
          rolling: false,
        })
        return
      }

      if (own.ownerIndex !== active && !own.mortgaged) {
        const rent = property.rent
        players[active].money -= rent
        players[own.ownerIndex].money += rent
        logs.push({ text: `${me.name}: аренда $${rent} игроку ${players[own.ownerIndex].name}`, ts: Date.now() })
        set({ players: [...players] })
      }
    }

    // дубль
    if (isDouble) {
      const newDoubles = (me.doublesCount ?? 0) + 1
      if (newDoubles >= 3) {
        players[active] = { ...me, tile: TILE.JAIL, jailTurns: 3, doublesCount: 0 }
        set({
          players: [...players],
          focusTile: TILE.JAIL,
          log: [...get().log, ...logs, { text: `${me.name}: третий дубль подряд — в тюрьму`, ts: Date.now() }],
          rolling: false,
        })
        set({ active: (active + 1) % players.length })
        return
      } else {
        players[active] = { ...me, doublesCount: newDoubles }
        set({
          players: [...players],
          focusTile: finalTile,
          log: [...get().log, ...logs, { text: `${me.name}: дубль — дополнительный ход`, ts: Date.now() }],
          rolling: false,
        })
        return
      }
    }

    set({
      focusTile: finalTile,
      log: [...get().log, ...logs],
      rolling: false,
      players: [...players],
    })
    set({ active: (active + 1) % players.length })
  },

  buyProperty: () => {
    const pending = get().pendingAction
    if (!pending || pending.type !== 'PURCHASE') return

    const { players, active, ownership } = get()
    const me = players[active]
    const { tile, price, name, isDouble } = pending

    if (me.money < price) {
      set({
        log: [...get().log, { text: `${me.name}: не хватило денег на ${name}`, ts: Date.now() }],
        pendingAction: undefined,
      })
      get().skipPurchase()
      return
    }

    me.money -= price
    ownership[tile] = { ownerIndex: active, houses: 0, mortgaged: false }

    const logs: LogItem[] = [{ text: `${me.name}: купил ${name} за $${price}`, ts: Date.now() }]

    set({ players: [...players], ownership: { ...ownership }, pendingAction: undefined })

    if (isDouble) {
      const newDoubles = (me.doublesCount ?? 0) + 1
      if (newDoubles >= 3) {
        players[active] = { ...me, tile: TILE.JAIL, jailTurns: 3, doublesCount: 0 }
        set({
          players: [...players],
          focusTile: TILE.JAIL,
          log: [...get().log, ...logs, { text: `${me.name}: третий дубль подряд — в тюрьму`, ts: Date.now() }],
        })
        set({ active: (active + 1) % players.length })
        return
      } else {
        players[active] = { ...me, doublesCount: newDoubles }
        set({
          players: [...players],
          log: [...get().log, ...logs, { text: `${me.name}: дубль — дополнительный ход`, ts: Date.now() }],
        })
        return
      }
    }

    resetDoubles(players, active)
    set({
      players: [...players],
      log: [...get().log, ...logs],
      active: (active + 1) % players.length,
    })
  },

  skipPurchase: () => {
    const pending = get().pendingAction
    if (!pending || pending.type !== 'PURCHASE') return

    const { players, active } = get()
    const me = players[active]
    const { name, isDouble } = pending

    set({ pendingAction: undefined })

    const logs: LogItem[] = [{ text: `${me.name}: отказался покупать ${name}`, ts: Date.now() }]

    if (isDouble) {
      const newDoubles = (me.doublesCount ?? 0) + 1
      if (newDoubles >= 3) {
        players[active] = { ...me, tile: TILE.JAIL, jailTurns: 3, doublesCount: 0 }
        set({
          players: [...players],
          focusTile: TILE.JAIL,
          log: [...get().log, ...logs, { text: `${me.name}: третий дубль подряд — в тюрьму`, ts: Date.now() }],
        })
        set({ active: (active + 1) % players.length })
        return
      } else {
        players[active] = { ...me, doublesCount: newDoubles }
        set({
          players: [...players],
          log: [...get().log, ...logs, { text: `${me.name}: дубль — дополнительный ход`, ts: Date.now() }],
        })
        return
      }
    }

    resetDoubles(players, active)
    set({
      players: [...players],
      log: [...get().log, ...logs],
      active: (active + 1) % players.length,
    })
  },

  reset: () =>
    set({
      players: [
        { id: 'p1', name: 'Player 1', tile: 0, money: 1500, jailTurns: 0, doublesCount: 0 },
        { id: 'p2', name: 'Player 2', tile: 0, money: 1500, jailTurns: 0, doublesCount: 0 },
      ],
      active: 0,
      rolling: false,
      isMoving: false,
      focusTarget: null,
      focusTile: null,
      log: [],
      lastDice: [],
      ownership: {},
      pendingAction: undefined,
      diceReady: false,
      chanceDeck: shuffle(CHANCE_DECK),
    }),
}))
