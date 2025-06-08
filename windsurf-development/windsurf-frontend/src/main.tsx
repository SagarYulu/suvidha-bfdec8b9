
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { RealTimeProvider } from './components/RealTimeProvider'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RealTimeProvider>
      <App />
    </RealTimeProvider>
  </React.StrictMode>,
)
