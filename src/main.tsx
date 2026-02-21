import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

// Registra o Service Worker do PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // Service worker não crítico — app funciona sem ele
    })
  })
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
