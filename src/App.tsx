import type { ReactNode } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from './components/layout/AppShell'
import { ProtectedRoute } from './components/ProtectedRoute'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import { AccountPage } from './pages/Account'
import { CartPage } from './pages/Cart'
import { CatalogPage } from './pages/Catalog'
import { CheckoutPage } from './pages/Checkout'
import { LandingPage } from './pages/Landing'
import { LoginPage } from './pages/Login'
import { MetricsPage } from './pages/Metrics'
import { NotFoundPage } from './pages/NotFound'
import { OrdersPage } from './pages/Orders'
import { ProductDetailPage } from './pages/ProductDetail'
import { RegisterPage } from './pages/Register'
import { SellPage } from './pages/Sell'

function Guard({ children }: { children: ReactNode }) {
  return <ProtectedRoute>{children}</ProtectedRoute>
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/registro" element={<RegisterPage />} />
            <Route element={<AppShell />}>
              <Route path="/catalogo" element={<CatalogPage />} />
              <Route path="/producto/:id" element={<ProductDetailPage />} />
              <Route path="/metricas" element={<MetricsPage />} />
              <Route
                path="/carrito"
                element={
                  <Guard>
                    <CartPage />
                  </Guard>
                }
              />
              <Route
                path="/checkout"
                element={
                  <Guard>
                    <CheckoutPage />
                  </Guard>
                }
              />
              <Route
                path="/pedidos"
                element={
                  <Guard>
                    <OrdersPage />
                  </Guard>
                }
              />
              <Route
                path="/vender"
                element={
                  <Guard>
                    <SellPage />
                  </Guard>
                }
              />
              <Route
                path="/cuenta"
                element={
                  <Guard>
                    <AccountPage />
                  </Guard>
                }
              />
            </Route>
            <Route path="/app" element={<Navigate to="/catalogo" replace />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  )
}
