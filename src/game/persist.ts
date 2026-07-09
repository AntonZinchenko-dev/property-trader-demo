import { useGame } from './store.ts'

const KEY = 'monopoly-save-v1'

// Что сохраняем: мин. набор для возобновления
type Snapshot = {
  players: Array<{ id: string; name: string; tile: number; money: number; jailTurns: number; doublesCount: number }>
  active: number
  ownership: Record<string, { ownerIndex: number; houses: number; mortgaged: boolean } | undefined>
  log: Array<{ text: string; ts: number }>
}

export function saveGame() {
  const s = useGame.getState()
  const snap: Snapshot = {
    players: s.players.map(p => ({ id: p.id, name: p.name, tile: p.tile, money: p.money, jailTurns: p.jailTurns, doublesCount: p.doublesCount })),
    active: s.active,
    ownership: s.ownership,
    log: s.log.slice(-200), // ограничим лог
  }
  try {
    localStorage.setItem(KEY, JSON.stringify(snap))
  } catch {}
}

export function loadGame() {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return
    const snap = JSON.parse(raw) as Snapshot
    useGame.setState({
      players: snap.players,
      active: snap.active,
      ownership: snap.ownership as any,
      log: snap.log,
      // остальное в дефолт
      rolling: false,
      isMoving: false,
      focusTarget: null,
      focusTile: null,
      lastDice: [],
      pendingAction: undefined,
      diceReady: false,
    })
  } catch {}
}

export function setupAutoPersist() {
    const unsub = useGame.subscribe((state, prev) => {
      if (
        state.active    !== prev.active ||
        state.players   !== prev.players ||
        state.ownership !== prev.ownership ||
        state.log       !== prev.log
      ) {
        saveGame()
      }
    })
    return unsub
  }
