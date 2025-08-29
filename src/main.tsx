import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { UserProvider } from './context/usercontext.tsx';
import { CartProvider } from './context/cartcontext.tsx';
import App from './App.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <UserProvider>
      <CartProvider>
        <App />
      </CartProvider>
    </UserProvider>
  </StrictMode>
);
