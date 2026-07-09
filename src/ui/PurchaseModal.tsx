// src/ui/PurchaseModal.tsx
import { useGame } from '../game/store.ts'
import { Modal } from './Modal.tsx'

export function PurchaseModal() {
  const pending = useGame(s => s.pendingAction)
  const players = useGame(s => s.players)
  const active  = useGame(s => s.active)
  const buy     = useGame(s => s.buyProperty)
  const skip    = useGame(s => s.skipPurchase)

  const open = pending?.type === 'PURCHASE'
  if (!open) return null

  const p = pending!
  const me = players[active]
  const canBuy = me.money >= p.price

  return (
    <Modal
      open
      title="Покупка собственности"
      onClose={() => skip()}  // ESC = пропустить покупку
      footer={
        <>
          <button style={btnGhost} onClick={() => skip()}>Пропустить</button>
          <button style={{...btn, opacity: canBuy ? 1 : 0.5}} onClick={() => canBuy && buy()}>
            Купить за ${p.price}
          </button>
        </>
      }
    >
      <div style={{display:'grid', gap:8}}>
        <div><strong>{p.name}</strong></div>
        <div>Клетка: #{p.tile}</div>
        <div>Цена: ${p.price}</div>
        <div>Аренда: ${p.rent}</div>
        <div>Баланс игрока: ${me.money}</div>
        {!canBuy && <div style={{color:'#ff8a80'}}>Недостаточно средств</div>}
      </div>
    </Modal>
  )
}

const btn: React.CSSProperties = {
  padding: '10px 14px',
  background: '#6b8bff',
  color: '#0b0d13',
  border: 'none',
  borderRadius: 10,
  cursor: 'pointer',
  fontWeight: 700,
}

const btnGhost: React.CSSProperties = {
  padding: '10px 14px',
  background: 'transparent',
  color: '#e6e8ef',
  border: '1px solid #3a3d4b',
  borderRadius: 10,
  cursor: 'pointer',
  fontWeight: 600,
}
