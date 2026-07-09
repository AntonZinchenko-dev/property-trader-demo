// src/ui/UIOverlay.tsx
import { useEffect, useState } from 'react'
import { useGame } from '../game/store.ts'
import { PurchaseModal } from './PurchaseModal.tsx'

export function UIOverlay() {
  const takeTurn = useGame(s => s.takeTurn)
  const reset = useGame(s => s.reset)
  const rolling = useGame(s => s.rolling)
  const isMoving = useGame(s => s.isMoving)
  const players = useGame(s => s.players)
  const active = useGame(s => s.active)
  const lastDice = useGame(s => s.lastDice)
  const log = useGame(s => s.log)
  const diceReady = useGame(s => s.diceReady)
  const payJail = useGame(s => s.payJail)
  const inJail = (players[active]?.jailTurns ?? 0) > 0
  const [lastRoll, setLastRoll] = useState<number | null>(null)
  const disabled = rolling || isMoving || !diceReady

  async function handleTurn() {
    if (disabled) return
    await takeTurn()
    const [a, b] = useGame.getState().lastDice
    if (a && b) setLastRoll(a + b)
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.repeat) return
      if (e.key === ' ') {
        e.preventDefault()
        handleTurn()
      }
      if (e.key.toLowerCase() === 'r') {
        reset(); setLastRoll(null)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [disabled])

  const activeName = players[active]?.name ?? '—'

  return (
    <>
      <div style={root}>
        <div style={bar}>
          <button className="ui-btn" onClick={handleTurn} disabled={disabled}>
            Бросить (Space)
          </button>
          <div className="ui-chip">Ход: {activeName}</div>
          <div className="ui-chip">Бросок: {lastRoll ?? '—'}</div>
          <button className="ui-btn" onClick={() => { reset(); setLastRoll(null) }} disabled={rolling || isMoving}>
            Reset (R)
          </button>
          <div className="ui-chip">
            Кости: {lastDice.length ? `${lastDice[0]} + ${lastDice[1]} = ${lastDice[0] + lastDice[1]}` : (diceReady ? '—' : '…подготовка костей')}
          </div>
          <div className="ui-chip">
            Баланс: {players.map(p => `${p.name}: $${p.money}`).join(' | ')}
          </div>
          {inJail && (
            <button className="ui-btn" onClick={() => payJail()} disabled={rolling || isMoving}>
              Выйти из тюрьмы ($50)
            </button>
          )}
        </div>

        <div style={logBox}>
          {log.slice(-8).map((l, i) => (
            <div key={i} style={{ opacity: 0.9 }}>{new Date(l.ts).toLocaleTimeString()} — {l.text}</div>
          ))}
        </div>
      </div>

      <PurchaseModal />
    </>
  )
}

const root: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  pointerEvents: 'none',
}

const bar: React.CSSProperties = {
  position: 'absolute',
  top: 12,
  left: 12,
  right: 12,
  display: 'flex',
  gap: 12,
  alignItems: 'center',
  pointerEvents: 'auto',
  background: 'rgba(15,16,20,0.6)',
  borderRadius: 10,
  padding: 10,
  color: '#dfe2ea',
  fontSize: 12,
  lineHeight: 1.35,
  width: "fit-content"
}

const logBox: React.CSSProperties = {
  position: 'absolute',
  right: 12,
  bottom: 12,
  width: 400,
  maxHeight: 220,
  overflow: 'auto',
  background: 'rgba(15,16,20,0.6)',
  border: '1px solid #2a2d3b',
  borderRadius: 10,
  padding: 10,
  color: '#dfe2ea',
  pointerEvents: 'auto',
  fontSize: 12,
  lineHeight: 1.35,
}
