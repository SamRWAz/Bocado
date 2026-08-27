# Bocado

PoC de marketplace de mecato universitario: un catálogo compartido para comprar, vender y medir interés real.

Port del MVP publicado en [bocado-poc.lovable.app](https://bocado-poc.lovable.app/). Misma UI, mismas pestañas y el mismo backend de Supabase, para que el equipo pueda ver y correr el código fuera de Lovable.

## Qué incluye

- **Comprar**: catálogo, filtros, búsqueda y “¡Lo quiero!”
- **Vender**: publicar snack, inventario, foto y simulación de comisión
- **Métricas**: clicks de interés, inventario y resultados de la encuesta del experimento

## Cómo correrlo

Necesitas Node.js 20+.

```bash
cp .env.example .env
npm install
npm run dev
```

Abre `http://localhost:5173`. El `.env.example` ya trae la URL y la anon key públicas del PoC, así que apunta al mismo catálogo que el sitio de Lovable.

## Stack

- React + Vite + TypeScript
- Tailwind CSS
- Supabase (Postgres + Storage)

Si quieres un proyecto de Supabase propio, corre `supabase/schema.sql` y cambia las variables de `.env`.
