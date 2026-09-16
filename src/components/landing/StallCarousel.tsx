const snacks = [
  { emoji: '🍫', name: 'Brownie Melcochudo', seller: 'Valeria M.', place: '📍 Edificio D (Piso 2)', tag: '🌱 Vegano / Sin Gluten' },
  { emoji: '🥟', name: 'Empanadas de Pollo & Champiñón', seller: 'Juan Pablo', place: '📍 Cafetería Central', tag: '🔥 Salado' },
  { emoji: '🍪', name: 'Galletas de Avena & Canela', seller: 'Sofía G.', place: '📍 Edificio E (Ingeniería)', tag: '⚡ Fit & Proteína' },
  { emoji: '🥑', name: 'Bowl de Fruta & Chía', seller: 'Andrés V.', place: '📍 Biblioteca Central', tag: '🍯 Sin Azúcar' },
  { emoji: '🥐', name: 'Alfajores Artesanales de Maicena', seller: 'Camila T.', place: '📍 El Samán', tag: '✨ Recién horneados' },
  { emoji: '🌯', name: 'Burrito Ranchero Express', seller: 'Santiago B.', place: '📍 Plazoleta Las Palmas', tag: '⚡ Alto en proteína' },
]

export function StallCarousel() {
  const loop = [...snacks, ...snacks]

  return (
    <div className="stall-marquee" aria-label="Snacks del campus">
      <div className="stall-track">
        {loop.map((item, index) => (
          <article
            key={`${item.name}-${index}`}
            className="w-[260px] shrink-0 rounded-2xl border border-border/80 bg-card/80 p-5 backdrop-blur-md transition-all hover:border-primary/50 sm:w-[300px]"
          >
            <div className="flex items-center justify-between">
              <span className="text-3xl">{item.emoji}</span>
              <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-bold text-primary">
                {item.tag}
              </span>
            </div>
            <h3 className="mt-3 font-display text-base font-bold text-foreground leading-snug line-clamp-1">
              {item.name}
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">Por {item.seller}</p>
            <p className="mt-3 text-xs font-semibold text-primary">{item.place}</p>
          </article>
        ))}
      </div>
    </div>
  )
}
