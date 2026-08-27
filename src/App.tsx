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
import { MetricsPage } from './pages/Metrics'
import { NotFoundPage } from './pages/NotFound'
import { OrdersPage } from './pages/Orders'
import { ProductDetailPage } from './pages/ProductDetail'
import { RegisterPage } from './pages/Register'
import { ShopPage } from './pages/Shop'
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
            <Route element={<PublicLayout />}>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/registro" element={<RegisterPage />} />
            </Route>
            <Route element={<StoreLayout />}>
              <Route path="/catalogo" element={<CatalogPage />} />
              <Route path="/tienda/:slug" element={<ShopPage />} />
              <Route path="/producto/:id" element={<ProductDetailPage />} />
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
            <Route
              element={
                <Guard>
                  <AppShell />
                </Guard>
              }
            >
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
            <Route path="/app" element={<Navigate to="/vender" replace />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  )
}
