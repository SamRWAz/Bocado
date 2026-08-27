const stalls = [
  { emoji: '🍫', name: 'El Rincón Dulce', offer: 'Brownies y galletas', place: 'Bloque A' },
  { emoji: '🥟', name: 'La Esquina Salada', offer: 'Empanadas y sándwiches', place: 'Cafetería' },
  { emoji: '☕', name: 'Café del Bloque', offer: 'Café y muffins', place: 'Ingeniería' },
  { emoji: '🥗', name: 'Naturalmente', offer: 'Bowls y fruta fresca', place: 'Biblioteca' },
  { emoji: '🍰', name: 'Casa Arequipe', offer: 'Tortas y postres', place: 'Plazoleta' },
  { emoji: '🌯', name: 'Don Wrap', offer: 'Wraps para el receso', place: 'Portería' },
]

export function StallCarousel() {
  const loop = [...stalls, ...stalls]

  return (
    <div className="stall-marquee" aria-label="Puestos del campus">
      <div className="stall-track">
        {loop.map((stall, index) => (
          <article
            key={`${stall.name}-${index}`}
            className="w-[240px] shrink-0 rounded-lg border border-border bg-card/80 p-5 backdrop-blur-sm sm:w-[280px]"
          >
            <p className="text-3xl">{stall.emoji}</p>
            <h3 className="mt-3 font-display text-lg font-semibold">{stall.name}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{stall.offer}</p>
            <p className="mt-3 text-xs text-primary">{stall.place}</p>
          </article>
        ))}
      </div>
    </div>
  )
}
