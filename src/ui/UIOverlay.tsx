// src/ui/UIOverlay.tsx
import { useEffect, useState } from 'react'
import { useGame } from '../game/store.ts'
import { getPropertyByTile } from '../game/rules.ts'
import { PurchaseModal } from './PurchaseModal.tsx'
import { CardModal } from './CardModal.tsx'
import { GameOverModal } from './GameOverModal.tsx'

const BOT_INDEX = 1
const TURN_LIMIT = 160
const BOT_RULES = {
  SAFE: { reserve: 450, minRent: 26 },
  BALANCED: { reserve: 260, minRent: 18 },
  AGGRESSIVE: { reserve: 120, minRent: 10 },
} as const
type BotProfile = keyof typeof BOT_RULES

export function UIOverlay() {
  const takeTurn = useGame(s => s.takeTurn)
  const reset = useGame(s => s.reset)
  const rolling = useGame(s => s.rolling)
  const isMoving = useGame(s => s.isMoving)
  const players = useGame(s => s.players)
  const active = useGame(s => s.active)
  const ownership = useGame(s => s.ownership)
  const lastDice = useGame(s => s.lastDice)
  const log = useGame(s => s.log)
  const diceReady = useGame(s => s.diceReady)
  const payJail = useGame(s => s.payJail)
  const pendingAction = useGame(s => s.pendingAction)
  const [lastRoll, setLastRoll] = useState<number | null>(null)
  const [botEnabled, setBotEnabled] = useState(true)
  const [botProfile, setBotProfile] = useState<BotProfile>('BALANCED')
  const inJail = (players[active]?.jailTurns ?? 0) > 0
  const turnCount = log.reduce((acc, item) => (item.text.includes('бросок') ? acc + 1 : acc), 0)
  const roundCount = Math.max(1, Math.floor(turnCount / players.length) + 1)

  const propertyValueByPlayer = players.map((_, idx) => {
    let sum = 0
    for (const [tileKey, own] of Object.entries(ownership)) {
      if (!own || own.ownerIndex !== idx) continue
      const p = getPropertyByTile(Number(tileKey))
      if (p) sum += p.price
    }
    return sum
  })
  const netWorthByPlayer = players.map((p, idx) => p.money + propertyValueByPlayer[idx])
  const leaderIndex = netWorthByPlayer.reduce((best, value, idx, arr) => (value > arr[best] ? idx : best), 0)
  const aliveIndices = players.flatMap((p, idx) => (p.money >= 0 ? [idx] : []))
  const gameOverByBankruptcy = aliveIndices.length <= 1
  const gameOverByTurnLimit = turnCount >= TURN_LIMIT
  const gameOver = gameOverByBankruptcy || gameOverByTurnLimit
  const winnerIndex = gameOverByBankruptcy
    ? (aliveIndices[0] ?? leaderIndex)
    : leaderIndex
  const disabled = rolling || isMoving || !diceReady || gameOver

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
        reset()
        setLastRoll(null)
      }
      if (e.key.toLowerCase() === 'b') {
        setBotEnabled(v => !v)
      }
      if (e.key.toLowerCase() === 'm') {
        setBotProfile((prev) => {
          if (prev === 'SAFE') return 'BALANCED'
          if (prev === 'BALANCED') return 'AGGRESSIVE'
          return 'SAFE'
        })
      }
      if (e.key === 'Enter' && gameOver) {
        reset()
        setLastRoll(null)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [disabled, reset, gameOver])

  useEffect(() => {
    if (!botEnabled || active !== BOT_INDEX || disabled || gameOver) return
    const timer = window.setTimeout(async () => {
      const st = useGame.getState()
      if (st.pendingAction?.type === 'CARD') {
        await st.resolveCard()
        return
      }
      if (st.pendingAction?.type === 'PURCHASE') {
        const me = st.players[st.active]
        const rule = BOT_RULES[botProfile]
        const spareMoney = me.money - st.pendingAction.price
        const shouldBuy = spareMoney >= rule.reserve || st.pendingAction.rent >= rule.minRent
        if (shouldBuy) st.buyProperty()
        else st.skipPurchase()
        return
      }
      await st.takeTurn()
    }, 450)
    return () => window.clearTimeout(timer)
  }, [active, botEnabled, botProfile, disabled, gameOver, pendingAction])

  const activeName = players[active]?.name ?? '—'

  return (
    <>
      <div className="hud-root">
        <div className="hud-topbar">
          <button className="ui-btn" onClick={handleTurn} disabled={disabled}>
            Бросить (Space)
          </button>
          <div className="ui-chip ui-chip--strong">Ход: {activeName}{active === BOT_INDEX && botEnabled ? ' (BOT)' : ''}</div>
          <div className="ui-chip">Кости: {lastDice.length ? `${lastDice[0]} + ${lastDice[1]}` : (diceReady ? '—' : '...')}</div>
          <div className="ui-chip">Бросок: {lastRoll ?? '—'}</div>
          <div className="ui-chip">Раунд: {roundCount}</div>
          <button className="ui-btn" onClick={() => { reset(); setLastRoll(null) }} disabled={rolling || isMoving}>
            Reset (R)
          </button>
          <div className={`ui-chip ${gameOver ? 'ui-chip--danger' : 'ui-chip--ok'}`}>
            Матч: {gameOver ? 'ЗАВЕРШЕН' : 'В ПРОЦЕССЕ'}
          </div>
          {inJail && (
            <button className="ui-btn" onClick={() => payJail()} disabled={rolling || isMoving}>
              Выйти из тюрьмы ($50)
            </button>
          )}
        </div>

        <div className="hud-sidebar">
          <div className="hud-title">Property Trader 3.0</div>
          {players.map((p, idx) => {
            const propsCount = Object.values(ownership).filter(own => own?.ownerIndex === idx).length
            const isLeader = idx === leaderIndex
            const isActive = idx === active
            return (
              <div key={p.id} className={`hud-player-card${isActive ? ' is-active' : ''}`}>
                <div className="hud-player-head">
                  <strong>{p.name}</strong>
                  <span className={`ui-badge ${isActive ? 'ui-badge--active' : 'ui-badge--idle'}`}>{isActive ? 'ACTIVE' : 'WAIT'}</span>
                </div>
                <div className="hud-row">Баланс: <strong>${p.money}</strong></div>
                <div className="hud-row">Недвижка: <strong>${propertyValueByPlayer[idx]}</strong> ({propsCount} шт.)</div>
                <div className="hud-row">Капитал (Net Worth): <strong>${netWorthByPlayer[idx]}</strong></div>
                <div className="hud-row">Статус: <strong>{p.jailTurns > 0 ? `Тюрьма (${p.jailTurns})` : 'Свободен'}</strong></div>
                {isLeader && <div className="ui-badge ui-badge--leader">Лидер по капиталу</div>}
              </div>
            )
          })}
          <div className="hud-controls">
            <button className="ui-btn ui-btn--ghost" onClick={() => setBotEnabled(v => !v)}>
              BOT P2: {botEnabled ? 'ON' : 'OFF'} (B)
            </button>
            <button
              className="ui-btn ui-btn--ghost"
              onClick={() => {
                setBotProfile((prev) => {
                  if (prev === 'SAFE') return 'BALANCED'
                  if (prev === 'BALANCED') return 'AGGRESSIVE'
                  return 'SAFE'
                })
              }}
            >
              AI: {botProfile} (M)
            </button>
            <div className="hud-subtle">Ходов: {turnCount} / {TURN_LIMIT}</div>
          </div>
        </div>

        <div className="hud-log">
          {log.slice(-7).map((l, i) => (
            <div key={i} className="hud-log-item">{new Date(l.ts).toLocaleTimeString()} — {l.text}</div>
          ))}
        </div>
      </div>

      <PurchaseModal />
      <CardModal />
      <GameOverModal
        open={gameOver}
        players={players}
        propertyValueByPlayer={propertyValueByPlayer}
        netWorthByPlayer={netWorthByPlayer}
        winnerIndex={winnerIndex}
        turnCount={turnCount}
        reason={gameOverByBankruptcy ? 'bankruptcy' : 'turn-limit'}
        onRestart={() => {
          reset()
          setLastRoll(null)
        }}
      />
    </>
  )
}
