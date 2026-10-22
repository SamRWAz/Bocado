/**
 * Modelo Financiero y Tarifario de Bocado
 *
 * Esquema de comisiones y pagos por campus:
 * - Comisión Bocado escalonada: Entre $100 y $500 COP por producto según su precio:
 *    * Precios <= $2.500 COP: $100 COP
 *    * Precios entre $2.501 y $4.500 COP: $200 COP
 *    * Precios entre $4.501 y $7.000 COP: $300 COP
 *    * Precios entre $7.001 y $10.000 COP: $400 COP
 *    * Precios > $10.000 COP: $500 COP (tope máximo)
 *
 * - Tarifa dinámica de Domicilio Tendedero: Entre $100 y $500 COP según distancia entre edificios
 *   (ingreso directo para el repartidor estudiantil).
 *
 * - Flujo de Pago en Campus:
 *    1. El Tendedero va donde el Vendedor y le paga el producto con la comisión respectiva descontada.
 *    2. El Comprador paga por la Pasarela Digital de Bocado:
 *       Total = Costo Productos + Tarifa Envío Tendedero ($100 - $500 COP por distancia).
 *    3. La plataforma desembolsa al Tendedero: Costo del producto + su tarifa de envío
 *       (para recuperar lo adelantado y cobrar su ganancia de entrega).
 *    4. La plataforma Bocado retiene su comisión del producto ($100 - $500 COP).
 */

export const DEFAULT_DELIVERY_FEE = 200
export const DELIVERY_FEE = 200

export function calculateProductCommission(price: number): number {
  if (price <= 2500) return 100
  if (price <= 4500) return 200
  if (price <= 7000) return 300
  if (price <= 10000) return 400
  return 500
}

/**
 * Normaliza y extrae el código de edificio universitario
 */
export function extractBuildingCode(input: string): string {
  if (!input) return 'D'
  const upper = input.toUpperCase().trim()

  if (upper.includes('BIENESTAR')) return 'BIENESTAR'
  if (upper.includes('BIBLIOTECA')) return 'BIBLIOTECA'
  if (upper.includes('CABALLERIZA')) return 'CABALLERIZAS'
  if (upper.includes('COLISEO')) return 'COLISEO'
  if (upper.includes('AUDITORIO')) return 'AUDITORIOS'
  if (upper.includes('CENTRAL')) return 'CENTRAL'

  const match = upper.match(/\b([MABCDEFGNL])\b/) || upper.match(/EDIFICIO\s*([MABCDEFGNL])/i)
  if (match) return match[1].toUpperCase()

  for (const letter of ['M', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'N', 'L']) {
    if (upper.startsWith(letter) || upper.includes(` ${letter}`) || upper.endsWith(` ${letter}`)) {
      return letter
    }
  }
  return 'D'
}

/**
 * Tarifa de domicilio según la distancia entre edificios del campus:
 * - $100 COP: Corta distancia / adyacentes (M-A, B-A, C-D, D-E, B-Biblioteca, Central-A o mismo edificio)
 * - $200 COP: Media distancia (M-B, C-E, D-A, C-L, y rutas intermedias)
 * - $500 COP: Larga distancia (desde M, A, B, C, D, E hacia F, Caballerizas, Coliseo, N o G)
 */
export function calculateDeliveryFee(origin: string, destination: string): number {
  const codeA = extractBuildingCode(origin)
  const codeB = extractBuildingCode(destination)

  // Mismo edificio
  if (codeA === codeB) return 100

  const key1 = `${codeA}__${codeB}`
  const key2 = `${codeB}__${codeA}`

  // Rutas cortas de $100 COP
  const pairs100 = new Set([
    'M__A', 'B__A', 'C__D', 'D__E', 'B__BIBLIOTECA', 'CENTRAL__A'
  ])
  if (pairs100.has(key1) || pairs100.has(key2)) {
    return 100
  }

  // Rutas medias de $200 COP
  const pairs200 = new Set([
    'M__B', 'C__E', 'D__A', 'C__L'
  ])
  if (pairs200.has(key1) || pairs200.has(key2)) {
    return 200
  }

  // Rutas largas de $500 COP
  const setCore = new Set(['M', 'A', 'B', 'C', 'D', 'E'])
  const setFar = new Set(['F', 'CABALLERIZAS', 'COLISEO', 'N', 'G'])

  if ((setCore.has(codeA) && setFar.has(codeB)) || (setCore.has(codeB) && setFar.has(codeA))) {
    return 500
  }

  return 200
}

export type OrderFinancials = {
  itemsSubtotal: number
  bocadoCommission: number
  vendorPayout: number // Lo que cobra el vendedor por sus productos
  deliveryFee: number // Tarifa dinámica por distancia para el Tendedero ($100, $200 o $500)
  tendederoReimbursementAndFee: number // Lo que recibe el Tendedero (producto adelantado + domicilio)
  totalBuyerPays: number // Lo que paga el comprador en la pasarela
}

export function computeOrderFinancials(
  items: Array<{ price: number; qty: number }>,
  deliveryContext?: number | { origin?: string; destination?: string }
): OrderFinancials {
  const itemsSubtotal = items.reduce((acc, item) => acc + item.price * item.qty, 0)
  
  const bocadoCommission = items.reduce((acc, item) => {
    return acc + calculateProductCommission(item.price) * item.qty
  }, 0)

  const vendorPayout = Math.max(0, itemsSubtotal - bocadoCommission)
  
  let deliveryFee = 0
  if (items.length > 0) {
    if (typeof deliveryContext === 'number') {
      deliveryFee = deliveryContext
    } else if (deliveryContext && (deliveryContext.origin || deliveryContext.destination)) {
      deliveryFee = calculateDeliveryFee(deliveryContext.origin || '', deliveryContext.destination || '')
    } else {
      deliveryFee = DEFAULT_DELIVERY_FEE
    }
  }

  const tendederoReimbursementAndFee = vendorPayout + deliveryFee
  const totalBuyerPays = itemsSubtotal + deliveryFee

  return {
    itemsSubtotal,
    bocadoCommission,
    vendorPayout,
    deliveryFee,
    tendederoReimbursementAndFee,
    totalBuyerPays,
  }
}
