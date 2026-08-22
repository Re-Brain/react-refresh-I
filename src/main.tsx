import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './css/index.css'
import App from './App.tsx'
import { AuthProvider } from './modules/auth'
import { FarmProvider } from './modules/farm'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <FarmProvider>
          <App />
        </FarmProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
)
