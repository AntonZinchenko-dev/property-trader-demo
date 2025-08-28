import { createRoot } from 'react-dom/client'
import { StrictMode } from 'react'
import './styles.css'
import App from './App.tsx'

const root = document.getElementById('root')

if (!root) throw new Error('Не найден #root элемент в index.html')

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>
)