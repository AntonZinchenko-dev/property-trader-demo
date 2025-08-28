import { create } from 'zustand'
import { applyTileEffect, TILE } from './game/rules.ts'

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

type GameState = {
  players: Player[]
  active: number
  rolling: boolean
  isMoving: boolean

  focusTarget: { x: number, y: number, z: number } | null
  focusTile: number | null
  setFocusTile: (t: number | null) => void

  log: LogItem[]
  lastDice: number[]
  setLastDice: (vals: number[]) => void

  diceThrow?: () => Promise<number>
  setDiceThrow: (fn: (() => Promise<number>) | undefined) => void

  setFocus: (p: { x: number, y: number, z: number } | null) => void

  moveActiveBy: (steps: number) => Promise<void>
  takeTurn: () => Promise<void>
  reset: () => void
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
  focusTile: null,                        // ← НЕТ стартового 0
  setFocusTile: (t) => set({ focusTile: t }),

  log: [],
  lastDice: [],
  setLastDice: (vals) => set({ lastDice: vals }),

  setDiceThrow: (fn) => set({ diceThrow: fn }),
  setFocus: (p) => set({ focusTarget: p }),

  // Ведём кольцо ТОЛЬКО во время движения
  moveActiveBy: async (steps) => {
    const st = get()
    if (st.isMoving || steps <= 0) return
    set({ isMoving: true })

    const idx = st.active
    let tile = st.players[idx].tile
    const players = st.players.slice()

    // стартовая позиция фокуса = текущая клетка игрока
    set({ focusTile: tile })

    for (let i = 0; i < steps; i++) {
      tile = (tile + 1) % 40
      players[idx] = { ...players[idx], tile }
      set({ players, focusTile: tile })
      await sleep(180)
    }

    set({ isMoving: false })
  },

  takeTurn: async () => {
    const st0 = get()
    if (st0.rolling || st0.isMoving) return

    const idx = st0.active
    const me  = st0.players[idx]
    const all = st0.players

    // Тюрьма: пропуск
    if (me.jailTurns > 0) {
      const players = all.slice()
      players[idx] = { ...me, jailTurns: me.jailTurns - 1, doublesCount: 0 }
      set({
        players,
        log: [...st0.log, { text: `${me.name}: пропуск хода (тюрьма, осталось ${me.jailTurns - 1})`, ts: Date.now() }],
      })
      set({ active: (idx + 1) % players.length })
      return
    }

    set({ rolling: true })

    const steps = st0.diceThrow ? await st0.diceThrow() : (2 + Math.floor(Math.random() * 11))
    const { lastDice } = get()
    const isDouble = lastDice.length === 2 && lastDice[0] === lastDice[1]

    // Движение
    await get().moveActiveBy(steps)

    // Эффект клетки
    let st = get()
    let players = st.players.slice()
    const pAfter = players[idx]
    let sentToJail = false
    let money = pAfter.money

    const eff = applyTileEffect(pAfter.tile)
    if (eff.moneyDelta) money += eff.moneyDelta

    if (eff.sentToJail) {
      sentToJail = true
      players[idx] = { ...pAfter, tile: TILE.JAIL, jailTurns: 3, doublesCount: 0, money: Math.max(money, 0) }
    } else {
      players[idx] = { ...pAfter, money }
    }

    const finalTile = players[idx].tile

    const logs: LogItem[] = []
    logs.push({ text: `${pAfter.name}: бросок ${lastDice.join('+')}=${steps}, финиш ${finalTile}`, ts: Date.now() })
    if (eff.log) logs.push({ text: `${pAfter.name}: ${eff.log}`, ts: Date.now() })

    // Дубли
    if (!sentToJail && isDouble) {
      const newDoubles = (pAfter.doublesCount ?? 0) + 1
      if (newDoubles >= 3) {
        players[idx] = { ...players[idx], tile: TILE.JAIL, jailTurns: 3, doublesCount: 0 }
        set({
          players,
          focusTile: players[idx].tile,  // ← фиксируем финал (JAIL)
          log: [...get().log, ...logs, { text: `${pAfter.name}: третий дубль подряд — в тюрьму`, ts: Date.now() }],
          rolling: false,
        })
        set({ active: (idx + 1) % players.length })
        return
      } else {
        players[idx] = { ...players[idx], doublesCount: newDoubles }
        set({
          players,
          focusTile: finalTile,          // ← фиксируем финал
          log: [...get().log, ...logs, { text: `${pAfter.name}: дубль — дополнительный ход`, ts: Date.now() }],
          rolling: false,
        })
        return                                   // тот же игрок ходит ещё раз
      }
    }

    // Обычный конец
    players[idx] = { ...players[idx], doublesCount: 0 }
    set({
      players,
      focusTile: finalTile,            // ← фиксируем финал
      log: [...get().log, ...logs],
      rolling: false,
      active: (idx + 1) % players.length, // смена игрока НЕ трогает focusTile
    })
  },

  reset: () => set({
    players: [
      { id: 'p1', name: 'Player 1', tile: 0, money: 1500, jailTurns: 0, doublesCount: 0 },
      { id: 'p2', name: 'Player 2', tile: 0, money: 1500, jailTurns: 0, doublesCount: 0 },
    ],
    active: 0,
    rolling: false,
    isMoving: false,
    focusTarget: null,
    focusTile: null,                   // ← без «0»
    log: [],
    lastDice: [],
  }),
}))
