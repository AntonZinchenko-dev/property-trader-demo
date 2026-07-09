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
    <div style={backdrop}>
      <div style={panel}>
        {title ? <div style={header}><strong>{title}</strong></div> : null}
        <div style={body}>{children}</div>
        {footer ? <div style={footerBox}>{footer}</div> : null}
      </div>
    </div>
  )
}

const backdrop: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(0,0,0,0.45)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
}

const panel: React.CSSProperties = {
  width: 420,
  background: '#1f2230',
  color: '#e6e8ef',
  border: '1px solid #2a2d3b',
  borderRadius: 12,
  boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
}

const header: React.CSSProperties = {
  padding: '14px 16px',
  borderBottom: '1px solid #2a2d3b',
  fontSize: 16,
}

const body: React.CSSProperties = {
  padding: 16,
  lineHeight: 1.45,
  fontSize: 14,
}

const footerBox: React.CSSProperties = {
  padding: 12,
  borderTop: '1px solid #2a2d3b',
  display: 'flex',
  gap: 8,
  justifyContent: 'flex-end',
}
