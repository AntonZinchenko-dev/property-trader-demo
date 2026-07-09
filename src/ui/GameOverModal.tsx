import { Modal } from './Modal.tsx'

type PlayerSnapshot = {
  id: string
  name: string
  money: number
}

type Props = {
  open: boolean
  players: PlayerSnapshot[]
  propertyValueByPlayer: number[]
  netWorthByPlayer: number[]
  winnerIndex: number
  turnCount: number
  reason: 'bankruptcy' | 'turn-limit'
  onRestart: () => void
}

export function GameOverModal({
  open,
  players,
  propertyValueByPlayer,
  netWorthByPlayer,
  winnerIndex,
  turnCount,
  reason,
  onRestart,
}: Props) {
  if (!open) return null

  const ranking = players
    .map((p, idx) => ({
      ...p,
      idx,
      properties: propertyValueByPlayer[idx] ?? 0,
      netWorth: netWorthByPlayer[idx] ?? p.money,
    }))
    .sort((a, b) => b.netWorth - a.netWorth)

  return (
    <Modal
      open
      title="Match Result"
      onClose={onRestart}
      footer={
        <>
          <button className="ui-btn ui-btn--ghost" onClick={onRestart}>Новая игра</button>
          <button className="ui-btn" onClick={onRestart}>Играть снова</button>
        </>
      }
    >
      <div className="gameover-wrap">
        <div className="gameover-head">
          <div className="gameover-winner">{players[winnerIndex]?.name ?? 'Winner'} wins</div>
          <div className="gameover-sub">
            {reason === 'bankruptcy' ? 'Победа по банкротству' : 'Победа по капиталу (лимит ходов)'} • Ходов: {turnCount}
          </div>
        </div>

        <div className="gameover-list">
          {ranking.map((row, place) => (
            <div key={row.id} className={`gameover-row${place === 0 ? ' is-top' : ''}`}>
              <div className="gameover-place">#{place + 1}</div>
              <div className="gameover-player">{row.name}</div>
              <div className="gameover-metric">Cash ${row.money}</div>
              <div className="gameover-metric">Props ${row.properties}</div>
              <div className="gameover-metric gameover-metric--strong">Net ${row.netWorth}</div>
            </div>
          ))}
        </div>
      </div>
    </Modal>
  )
}
