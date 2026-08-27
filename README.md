# Bocado

Marketplace de comida universitaria: landing pública, cuentas con JWT, catálogo, carrito, reservas y puesto de vendedor.

## Cómo correrlo

```bash
cp .env.example .env
npm install
npm run dev
```

Abre `http://localhost:5173`.

## Qué incluye

- Landing responsive (no es solo vista de teléfono)
- Registro e inicio de sesión con JWT
- Catálogo, detalle de producto y carrito
- Checkout por punto de encuentro en el campus
- Pedidos para quien compra y para quien vende
- Publicar snacks, inventario y métricas del experimento

El catálogo de productos sigue en el Supabase del PoC. Cuentas y pedidos se guardan para que el equipo pueda probar sin confirmar correo.

## Stack

React + Vite + TypeScript + Tailwind + Supabase
