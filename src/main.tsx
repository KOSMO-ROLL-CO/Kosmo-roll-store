import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { CartProvider } from './context/CartProvider'
import { AuthProvider } from './context/AuthProvider'
import { OrderProvider } from './context/OrderProvider'
import { KosmoProvider } from './context/KosmoProvider'
import './index.css'
import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <OrderProvider>
          <KosmoProvider>
            <CartProvider>
              <App />
            </CartProvider>
          </KosmoProvider>
        </OrderProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
