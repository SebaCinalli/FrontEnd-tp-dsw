import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { UserProvider } from './context/usercontext.tsx';
import { CartProvider } from './context/cartcontext.tsx';
import { EventDateProvider } from './context/eventdatecontext.tsx';
import { AlertProvider } from './context/alertcontext.tsx';
import { ConfirmProvider } from './context/confirmcontext.tsx';
import App from './App.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AlertProvider>
      <ConfirmProvider>
        <UserProvider>
          <CartProvider>
            <EventDateProvider>
              <App />
            </EventDateProvider>
          </CartProvider>
        </UserProvider>
      </ConfirmProvider>
    </AlertProvider>
  </StrictMode>
);
