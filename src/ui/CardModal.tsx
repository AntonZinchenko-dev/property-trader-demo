import { Modal } from './Modal'
import { useGame } from '../game/store'

export function CardModal() {
  const pending = useGame(s => s.pendingAction)
  const resolve = useGame(s => s.resolveCard)

  const open = pending?.type === 'CARD'
  if (!open) return null

  const { card } = pending

  return (
    <Modal
      open
      title={`Chance: ${card.title}`}
      onClose={() => resolve()}  
      footer={
        <button
          style={{ padding:'10px 14px', borderRadius:10, border:'1px solid #3a3d4b', background:'#6b8bff', color:'#0b0d13', fontWeight:700, cursor:'pointer' }}
          onClick={() => resolve()}
        >
          Ок
        </button>
      }
    >
      <div style={{ whiteSpace:'pre-wrap', lineHeight:1.45 }}>
        {card.text}
      </div>
    </Modal>
  )
}
