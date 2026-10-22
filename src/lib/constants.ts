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

export const CAMPUS_BUILDINGS = [
  'Edificio M',
  'Edificio A',
  'Edificio B',
  'Edificio C (Aulas)',
  'Edificio D (Plazoleta / Pisos)',
  'Edificio E (Ingeniería)',
  'Edificio F',
  'Edificio G',
  'Bienestar',
  'Biblioteca Central',
  'Caballerizas',
  'Edificio N',
  'Edificio L',
  'Cafetería Central',
  'Auditorios',
  'Coliseo',
] as const

export const PICKUP_POINTS = CAMPUS_BUILDINGS

export const DEFAULT_DELIVERY_FEE = 200
export const DELIVERY_FEE = 200
export const GUARANTEED_RESERVE_FEE = 0

export const CAMPUSES = ['Universidad Icesi', 'Javeriana Cali', 'Univalle', 'USC', 'Autónoma'] as const

export const SESSION_KEY = 'bocado.session_v2'
export const CART_KEY = 'bocado.cart_v2'

export const inputClass =
  'w-full bg-secondary text-foreground rounded-lg px-4 py-3 text-sm placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring font-body transition-colors border border-transparent focus:border-primary/50'

export const labelClass = 'block text-xs font-semibold text-muted-foreground mb-1.5 font-body uppercase tracking-wider'
