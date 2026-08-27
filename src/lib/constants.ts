export const CATEGORIES = [
  'Postres',
  'Galletas',
  'Alfajores',
  'Paquetes',
  'Tortas',
  'Dulces',
  'Saludable',
  'Brownies',
] as const

export const FILTERS = ['Todas', ...CATEGORIES] as const

export const PICKUP_POINTS = [
  'Cafetería central',
  'Biblioteca',
  'Portería principal',
  'Bloque de ingeniería',
  'Plazoleta',
] as const

export const CAMPUSES = ['Icesi', 'Javeriana', 'Univalle', 'USC', 'Otro'] as const

export const SESSION_KEY = 'bocado.session'
export const CART_KEY = 'bocado.cart'

export const inputClass =
  'w-full bg-secondary text-foreground rounded-lg px-4 py-3 text-sm placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring font-body'

export const labelClass = 'block text-xs text-muted-foreground mb-1.5 font-body'
