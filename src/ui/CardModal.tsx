import { Modal } from './Modal.tsx'
import { useGame } from '../game/store.ts'

export function CardModal() {
  const pending = useGame((s) => s.pendingAction)
  const resolve = useGame((s) => s.resolveCard)

  const open = pending?.type === 'CARD'
  if (!open) return null

  const { card, source } = pending

  return (
    <Modal
      open
      title={`${source}: ${card.title}`}
      onClose={() => resolve()}  
      footer={
        <button
          className="ui-btn"
          onClick={() => resolve()}
        >
          Ок
        </button>
      }
    >
      <div className="modal-card-text">
        {card.text}
      </div>
    </Modal>
  )
}
