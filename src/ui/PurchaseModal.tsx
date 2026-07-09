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
          <button className="ui-btn ui-btn--ghost" onClick={() => skip()}>Пропустить</button>
          <button className="ui-btn" style={{ opacity: canBuy ? 1 : 0.5 }} onClick={() => canBuy && buy()}>
            Купить за ${p.price}
          </button>
        </>
      }
    >
      <div className="modal-info-grid">
        <div className="modal-title"><strong>{p.name}</strong></div>
        <div className="modal-row">Клетка: #{p.tile}</div>
        <div className="modal-row">Цена: ${p.price}</div>
        <div className="modal-row">Аренда: ${p.rent}</div>
        <div className="modal-row">Баланс игрока: ${me.money}</div>
        {!canBuy && <div className="modal-error">Недостаточно средств</div>}
      </div>
    </Modal>
  )
}
