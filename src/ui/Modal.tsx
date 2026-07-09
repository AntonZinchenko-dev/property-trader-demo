// src/ui/Modal.tsx
import { type ReactNode, useEffect } from 'react'

type ModalProps = {
  open: boolean
  title?: string
  onClose?: () => void
  children?: ReactNode
  footer?: ReactNode
}

export function Modal({ open, title, onClose, children, footer }: ModalProps) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && open) onClose?.()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="modal-backdrop">
      <div className="modal-panel">
        {title ? <div className="modal-header"><strong>{title}</strong></div> : null}
        <div className="modal-body">{children}</div>
        {footer ? <div className="modal-footer">{footer}</div> : null}
      </div>
    </div>
  )
}
