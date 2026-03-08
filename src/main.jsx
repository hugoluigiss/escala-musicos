import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import EscalaMusicos from './EscalaMusicos.jsx'

const style = document.createElement('style')
style.textContent = `
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { background: #0d0b1e; }
  ::-webkit-scrollbar { width: 6px; height: 6px; }
  ::-webkit-scrollbar-track { background: rgba(255,255,255,0.03); }
  ::-webkit-scrollbar-thumb { background: rgba(201,169,110,0.3); border-radius: 3px; }
`
document.head.appendChild(style)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <EscalaMusicos />
  </StrictMode>,
)
