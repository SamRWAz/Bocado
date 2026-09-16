import type { ReactNode } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from './components/layout/AppShell'
import { PublicLayout } from './components/layout/PublicLayout'
import { StoreLayout } from './components/layout/StoreLayout'
import { PageTransition } from './components/PageTransition'
import { AdminRoute, ProtectedRoute } from './components/ProtectedRoute'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import { AccountPage } from './pages/Account'
import { CartPage } from './pages/Cart'
import { CatalogPage } from './pages/Catalog'
import { CheckoutPage } from './pages/Checkout'
import { LandingPage } from './pages/Landing'
import { LoginPage } from './pages/Login'
import { MessagesPage } from './pages/Messages'
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
          <PageTransition />
          <Routes>
            {/* Public landing & auth */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/registro" element={<RegisterPage />} />
            </Route>

            {/* Catalog & Shop views */}
            <Route element={<StoreLayout />}>
              <Route path="/catalogo" element={<CatalogPage />} />
              <Route path="/producto/:id" element={<ProductDetailPage />} />
              <Route path="/tienda/:slug" element={<Navigate to="/catalogo" replace />} />
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
            </Route>

            {/* Protected authenticated dashboard / app views */}
            <Route
              element={
                <Guard>
                  <AppShell />
                </Guard>
              }
            >
              <Route path="/mensajes" element={<MessagesPage />} />
              <Route path="/vender" element={<SellPage />} />
              <Route path="/pedidos" element={<OrdersPage />} />
              <Route
                path="/metricas"
                element={
                  <AdminRoute>
                    <MetricsPage />
                  </AdminRoute>
                }
              />
              <Route path="/cuenta" element={<AccountPage />} />
            </Route>

            <Route path="/app" element={<Navigate to="/catalogo" replace />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  )
}
