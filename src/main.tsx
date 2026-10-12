import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { startUpdateChecks } from './pwa/updates'
import { App } from './ui/App'

startUpdateChecks()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
