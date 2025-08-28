// UIOverlay.tsx
import { useEffect, useMemo, useState } from 'react'
import { useGame } from '../game/store.ts'

export function UIOverlay() {
    const takeTurn = useGame(s => s.takeTurn)
    const reset    = useGame(s => s.reset)
    const rolling  = useGame(s => s.rolling)
    const isMoving = useGame(s => s.isMoving)
    const players  = useGame(s => s.players)
    const active   = useGame(s => s.active)
    const lastDice = useGame(s => s.lastDice)
  
    const [lastRoll, setLastRoll] = useState<number | null>(null)
    const disabled = rolling || isMoving
    const activeName = useMemo(() => players[active]?.name ?? '—', [players, active])
  
    async function handleRoll() {
      if (disabled) return
      await takeTurn()
      if (lastDice.length === 2) setLastRoll(lastDice[0] + lastDice[1])
    }
  
    useEffect(() => {
      const onKey = (e: KeyboardEvent) => {
        if (e.code === 'Space') { e.preventDefault(); handleRoll() }
        if (e.key.toLowerCase() === 'r') { reset(); setLastRoll(null) }
      }
      window.addEventListener('keydown', onKey)
      return () => window.removeEventListener('keydown', onKey)
    }, [disabled, lastDice])
  
    return (
      <div className="ui-overlay">
        <div className="ui-card" style={{ gap: 16 }}>
          <button className="ui-btn" onClick={handleRoll} disabled={disabled}>
            {rolling ? 'Бросаем…' : isMoving ? 'Двигаемся…' : 'Бросить кубики (Space)'}
          </button>
          <div className="ui-chip">Ход: {activeName}</div>
          <div className="ui-chip">Бросок: {lastRoll ?? '—'}</div>
          <button className="ui-btn" onClick={() => { reset(); setLastRoll(null) }} disabled={disabled}>
            Reset (R)
          </button>
          <div className="ui-chip">
            Кости: {lastDice.length ? `${lastDice[0]} + ${lastDice[1]} = ${lastDice[0] + lastDice[1]}` : '—'}
          </div>
          <div className="ui-chip">
            Баланс: {players.map(p => `${p.name}: $${p.money}`).join(' | ')}
          </div>
        </div>
      </div>
    )
  }