export const CATEGORIES = [
  'Brownies',
  'Galletas',
  'Alfajores',
  'Salado & Empanadas',
  'Fit & Proteína',
  'Tortas & Postres',
  'Bebidas & Fruta',
  'Dulces & Gomitas',
  'Combos',
] as const

export const FILTERS = ['Todos', ...CATEGORIES] as const

export const PICKUP_POINTS = [
  'Edificio D (Plazoleta / Pisos)',
  'El Samán',
  'Biblioteca Central',
  'Cafetería Central',
  'Edificio E (Ingeniería)',
  'Plazoleta Las Palmas',
  'Edificio C (Aulas)',
  'Edificio F',
  'Portería Principal',
] as const

export const GUARANTEED_RESERVE_FEE = 300

export const CAMPUSES = ['Universidad Icesi', 'Javeriana Cali', 'Univalle', 'USC', 'Autónoma'] as const

export const SESSION_KEY = 'bocado.session'
export const CART_KEY = 'bocado.cart'

export const inputClass =
  'w-full bg-secondary text-foreground rounded-lg px-4 py-3 text-sm placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring font-body transition-colors border border-transparent focus:border-primary/50'

export const labelClass = 'block text-xs font-semibold text-muted-foreground mb-1.5 font-body uppercase tracking-wider'
