import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { UserProvider } from './context/usercontext.tsx';
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>

  <UserProvider>
    <App />
  </UserProvider>
  
  </StrictMode>
)
