import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Mic,
  Sparkles,
  ShoppingBag,
  Bike,
  CheckCircle2,
  Home,
} from 'lucide-react'
import { BrandMark } from '../components/BrandMark'
import { playKeyBeep } from '../lib/sounds'

interface Slide {
  id: number
  title: string
  subtitle: string
  rubricBadge: string
  rubricWeight: string
  category: string
  speakerNotes: string
  content: {
    type: 'hero' | 'comparison' | 'flow' | 'timeline' | 'gtm' | 'evidence' | 'economics' | 'risks' | 'closing'
    data: any
  }
}

const SLIDES: Slide[] = [
  {
    id: 1,
    title: 'Tu antojo. En movimiento.',
    subtitle: 'El micro-comercio gastronómico intra-campus que conecta a quienes cocinan con quienes tienen hambre en la Universidad Icesi.',
    rubricBadge: 'Contexto & Propuesta de Valor',
    rubricWeight: 'Apertura (0:00 - 0:45)',
    category: '1. Gancho Inicial',
    speakerNotes:
      'Buenos días miembros de la Junta Directiva y evaluadores. Imaginen esto: son las 3:15 de la tarde en el Boreal o en el laboratorio del Edificio D. Tienen hambre, pero si bajan a la cafetería central pierden su puesto, hacen 20 minutos de fila y llegan tarde a clase. Al mismo tiempo, un compañero tiene en su morral brownies y galletas caseras, pero no tiene cómo venderlas fuera de su círculo íntimo. Presentamos Bocado: el servicio de entrega intra-campus operado por estudiantes que lleva los mejores snacks directo a tu aula en minutos.',
    content: {
      type: 'hero',
      data: {
        tagline: 'CERO FILAS · PRODUCTOS CASEROS · COMUNIDAD ICESI',
        stats: [
          { label: 'Tiempo de pedido', value: '2 min' },
          { label: 'Entrega promedio', value: '< 15 min' },
          { label: 'Infraestructura física', value: '$0 Capex' },
        ],
      },
    },
  },
  {
    id: 2,
    title: 'El Dolor Validado en el Campus',
    subtitle: 'Fricciones reales observadas y entrevistadas entre estudiantes y docentes de la Universidad Icesi.',
    rubricBadge: 'Contexto del Problema',
    rubricWeight: 'Validación del Dolor',
    category: '1. Contexto del Problema',
    speakerNotes:
      'Validamos este problema mediante observaciones y entrevistas directas. Encontramos que el comercio informal mueve volumen constante, pero con dos dolores críticos: el comprador pasa hambre por no perder su puesto de estudio, y el vendedor pierde hasta el 60% de sus ventas potenciales porque no puede salir de clase a entregar. Bocado desbloquea este cuello de botella con logística peer-to-peer.',
    content: {
      type: 'comparison',
      data: {
        buyer: {
          role: 'Estudiante / Docente Comprador',
          points: [
            'Pérdida de puesto en salas de estudio o laboratorios al salir a comprar.',
            'Filas eternas de 15 a 20 minutos en cafeterías centrales en descansos.',
            'Opciones limitadas, industriales y de alto costo en concesiones.',
          ],
        },
        seller: {
          role: 'Estudiante Cocinero Emprendedor',
          points: [
            'Canal informal y ciego: estados de WhatsApp con alcance muy limitado.',
            'Imposibilidad de entregar en otros edificios mientras asiste a clases.',
            'Fricción de cobro: comprobantes dispersos y falta de cambio en efectivo.',
          ],
        },
      },
    },
  },
  {
    id: 3,
    title: 'PMV y Evidencia de Entrega de Valor',
    subtitle: 'Plataforma web progresiva 100% funcional y desplegada en producción sobre el campus Icesi.',
    rubricBadge: 'PMV & Demostración Real',
    rubricWeight: '30% de la nota',
    category: '2. PMV y Validación',
    speakerNotes:
      'Para entregar valor real no nos quedamos en un mockup de Figma: construimos y desplegamos un PMV funcional en bocado-gamma.vercel.app. Cuenta con catálogo vivo con fotos reales, gestión de stock para el cocinero, cálculo automático de tarifas y seguimiento de pedido en tiempo real.',
    content: {
      type: 'evidence',
      data: {
        headline: 'Demostración de Funcionamiento Real',
        flow: [
          { step: '1', title: 'Explora', desc: 'El estudiante navega los snacks frescos del día' },
          { step: '2', title: 'Pide', desc: 'Selecciona su aula/edificio y paga con Nequi o efectivo' },
          { step: '3', title: 'Recibe', desc: 'Un compañero domiciliario entrega en su pupitre en < 15 min' },
        ],
        placeholderText: 'ESPACIO PARA CAPTURA DEL PMV EN VIVO O FOTO DE ENTREGA EN ICESI',
      },
    },
  },
  {
    id: 4,
    title: 'Evolución y Aprendizajes del Proyecto',
    subtitle: 'De una idea compleja e inviable de hardware a un modelo colaborativo ultra-ágil.',
    rubricBadge: 'Iteración & Aprendizajes',
    rubricWeight: '30% de la nota',
    category: '2. PMV y Validación',
    speakerNotes:
      'Nuestro aprendizaje más valioso fue aprender a pivotar rápido. Inicialmente concebimos una red de casilleros inteligentes físicos en pasillos. Pero al validar la viabilidad técnica y regulatoria, descubrimos que el verdadero dolor del usuario no era un casillero fijo, sino no tener que desplazarse de su puesto. Por eso migramos a un modelo peer-to-peer a pie: cero inversión en hardware y entrega personalizada en el aula.',
    content: {
      type: 'timeline',
      data: {
        initial: {
          badge: 'HIPÓTESIS INICIAL (DESBANCADA)',
          title: 'Casilleros Inteligentes Físicos (Smart Lockers)',
          flaws: [
            'Alto gasto de capital inicial (Capex) en módulos metálicos y electrónica.',
            'Permisos regulatorios y de espacio físico complejos con la universidad.',
            'Obligaba al estudiante a caminar hasta el casillero (no resolvía el dolor principal).',
          ],
        },
        pivot: {
          badge: 'SOLUCIÓN FINAL (VALIDADA)',
          title: 'Red Colaborativa de Entregas a Pie (Peer-to-Peer)',
          benefits: [
            'Inversión en infraestructura física: $0 COP. 100% basado en software.',
            'Entrega directa en el pupitre del estudiante o puesto de trabajo.',
            'Creación del rol de Domiciliario: ingresos para estudiantes en huecos libres.',
          ],
        },
      },
    },
  },
  {
    id: 5,
    title: 'Estrategia Go-to-Market',
    subtitle: 'Penetración orgánica con costo de adquisición cercano a cero en Universidad Icesi.',
    rubricBadge: 'Go-to-Market',
    rubricWeight: '15% de la nota',
    category: '3. Estrategia GTM',
    speakerNotes:
      'Nuestra estrategia de salida al mercado aprovecha la alta densidad del campus. En vez de pauta digital costosa, activamos canales orgánicos: grupos de WhatsApp académicos y alianzas con los cocineros reconocidos que ya tenían clientela fija. Al resolverles la logística, ellos mismos promueven Bocado para duplicar sus ventas sin perder sus clases.',
    content: {
      type: 'gtm',
      data: {
        pillars: [
          {
            title: 'Público Objetivo Focalizado',
            items: [
              'Estudiantes en bloques continuos (Edificios D, M, E y Boreal).',
              'Docentes con poco tiempo entre cátedras consecutivas.',
              'Estudiantes cocineros con preparaciones de repostería y sal.',
            ],
          },
          {
            title: 'Canales Orgánicos de Tracción',
            items: [
              'Voz a voz en salas de estudio y grupos de WhatsApp por carrera.',
              'Presencia táctica en plazoletas durante los cambios de clase.',
              'Onboarding directo a cocineros universitarios clave.',
            ],
          },
          {
            title: 'Tácticas de Conversión',
            items: [
              'Preventas de receso: reserva de snacks antes de las clases de la tarde.',
              'Micro-tarifas accesibles ($100 - $500 COP) sin barreras de entrada.',
              'Garantía de inmediatez: snack en mano en menos de 15 minutos.',
            ],
          },
        ],
      },
    },
  },
  {
    id: 6,
    title: 'Evidencia Real de Venta o Intento de Pago',
    subtitle: 'Comprobantes de transacciones y pedidos gestionados dentro del campus.',
    rubricBadge: 'Tracción Comercial',
    rubricWeight: '20% de la nota',
    category: '4. Tracción & Ventas',
    speakerNotes:
      'Este proyecto no es teoría: aquí presentamos la evidencia de transacciones reales gestionadas a través de Bocado. Estudiantes del campus han seleccionado snacks, procesado pagos vía Nequi/Wompi o contra-entrega y recibido sus pedidos, validando de forma irrefutable la disposición a pagar por el producto y el servicio logístico.',
    content: {
      type: 'evidence',
      data: {
        headline: 'Comprobantes de Pago y Registro de Pedidos',
        metrics: [
          { label: 'Ticket promedio', value: '$4.500 COP' },
          { label: 'Medios de pago', value: 'Nequi / Wompi / Efectivo' },
          { label: 'Cumplimiento', value: '100% entregado' },
        ],
        placeholderText: 'ESPACIO PARA CAPTURAS DE TRANSFERENCIAS NEQUI / WOMPI / REGISTRO DE ÓRDENES REALES',
      },
    },
  },
  {
    id: 7,
    title: 'Validación del Perfil del Cliente',
    subtitle: 'Verificación de que los compradores corresponden al arquetipo estudiantil de Icesi.',
    rubricBadge: 'Match de Mercado',
    rubricWeight: '20% de la nota',
    category: '4. Validación de Perfil',
    speakerNotes:
      'Verificamos que cada persona que compró o inició pedido cumple de manera rigurosa con el perfil de usuario definido: estudiantes y miembros de Icesi en salones de clase y zonas de coworking que priorizan su tiempo académico y están dispuestos a pagar una micro-tarifa antes que perder 20 minutos en la cafetería central.',
    content: {
      type: 'evidence',
      data: {
        headline: 'Validación del Arquetipo de Usuario',
        metrics: [
          { label: 'Ubicaciones validadas', value: 'Edif. D, M, E y Boreal' },
          { label: 'Picos de demanda', value: '9:30 AM y 3:30 PM' },
          { label: 'Tasa de satisfacción', value: '5 / 5 estrellas' },
        ],
        placeholderText: 'ESPACIO PARA FOTOS / CHATS DE FEEDBACK CON CLIENTES Y REPARTIDORES DE ICESI',
      },
    },
  },
  {
    id: 8,
    title: 'Modelo Económico y Sostenibilidad Financiera',
    subtitle: 'Unit economics transparentes, distribución justa y márgenes escalables.',
    rubricBadge: 'Unit Economics',
    rubricWeight: '25% de la nota',
    category: '5. Modelo Económico',
    speakerNotes:
      'El modelo económico de Bocado está balanceado para el bolsillo universitario. En un pedido promedio de $4.500 pesos, el estudiante cocinero retiene más del 90% del valor. El estudiante domiciliario recibe el 100% de la tarifa por distancia ($100 a $500 pesos) por una caminata corta de 3 minutos. Y Bocado retiene un micro-márgen operativo de $300 pesos que cubre pasarela y servidores.',
    content: {
      type: 'economics',
      data: {
        breakdown: [
          { role: 'Estudiante Cocinero', amount: '$4.500 COP', pct: '93.3%', note: 'Precio del snack artesanal' },
          { role: 'Estudiante Domiciliario', amount: '$200 COP', pct: '100%', note: 'Tarifa por distancia intra-campus' },
          { role: 'Plataforma Bocado', amount: '$300 COP', pct: 'Margen', note: 'Sostenibilidad y costos cloud' },
        ],
        totalBuyer: '$4.700 COP',
      },
    },
  },
  {
    id: 9,
    title: 'Gestión de Riesgos y Mitigación',
    subtitle: 'Identificación proactiva de amenazas operativas y estrategias de resiliencia.',
    rubricBadge: 'Análisis de Riesgos',
    rubricWeight: '25% de la nota',
    category: '5. Gestión de Riesgos',
    speakerNotes:
      'Para alcanzar el Nivel 5 de la rúbrica identificamos los principales riesgos operativos: la fluctuación de la demanda por horarios de clase se mitiga mediante preventas antes del receso. La falta de domiciliarios en horas pico se resuelve con tarifas dinámicas de distancia. Y la inocuidad alimentaria se asegura mediante verificación de cocineros y retroalimentación comunitaria.',
    content: {
      type: 'risks',
      data: {
        risks: [
          {
            threat: 'Fluctuación de demanda según bloques de clase',
            impact: 'Alta / Moderado',
            mitigation: 'Sistema de preventa y apartado de stock antes de recesos clave.',
          },
          {
            threat: 'Escasez de domiciliarios en horas pico',
            impact: 'Media / Alto',
            mitigation: 'Micro-tarifa dinámica por distancia ($100 - $500 COP) que activa rutas de paso.',
          },
          {
            threat: 'Inocuidad y calidad de los alimentos',
            impact: 'Baja / Crítico',
            mitigation: 'Cocineros verificados, fotos reales de preparación y validación por comunidad.',
          },
          {
            threat: 'Incumplimiento de entrega o cobro',
            impact: 'Baja / Moderado',
            mitigation: 'Protocolo de triple confirmación (comprador, vendedor y domiciliario en la app).',
          },
        ],
      },
    },
  },
  {
    id: 10,
    title: 'Haz que el campus se mueva.',
    subtitle: 'Bocado demuestra que el micro-comercio universitario puede ser ágil, colaborativo y rentable.',
    rubricBadge: 'Conclusión & Cierre',
    rubricWeight: 'Nivel 5 Rúbrica',
    category: 'Cierre',
    speakerNotes:
      'En conclusión: Bocado demostró que dentro de la Universidad Icesi existe un mercado vivo, dispuesto a pagar y listo para organizarse a través de software. No solo resolvemos el hambre del estudiante sin interrumpir su clase, sino que construimos un motor de ingresos complementarios para decenas de compañeros que cocinan o caminan por el campus. Muchas gracias.',
    content: {
      type: 'closing',
      data: {
        summaryPoints: [
          '3 Roles colaborativos en un único campus conectado.',
          '$0 COP en Capex de infraestructura física.',
          'PMV 100% funcional disponible en bocado-gamma.vercel.app.',
          'Tracción real con clientes del campus Icesi.',
        ],
        ctaText: 'Ver PMV en Producción',
        ctaLink: '/catalogo',
      },
    },
  },
]

export function PresentationPage() {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0)
  const [showNotes, setShowNotes] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)

  const currentSlide = SLIDES[currentSlideIndex]

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault()
        handleNext()
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        handlePrev()
      } else if (e.key === 'n' || e.key === 'N') {
        setShowNotes((prev) => !prev)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentSlideIndex])

  const handleNext = () => {
    playKeyBeep(650)
    setCurrentSlideIndex((prev) => (prev < SLIDES.length - 1 ? prev + 1 : prev))
  }

  const handlePrev = () => {
    playKeyBeep(450)
    setCurrentSlideIndex((prev) => (prev > 0 ? prev - 1 : prev))
  }

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {})
      setIsFullscreen(true)
    } else {
      document.exitFullscreen().catch(() => {})
      setIsFullscreen(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#FAF6F5] dark:bg-[#130920] text-[#1E0C30] dark:text-[#F6EEF2] flex flex-col font-sans transition-colors duration-200">
      {/* Top Header / Presentation Bar */}
      <header className="sticky top-0 z-30 border-b border-[#EFE8E6] dark:border-[#2D1945] bg-[#FAF6F5]/90 dark:bg-[#130920]/90 backdrop-blur-md px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <BrandMark size="sm" />
          </Link>
          <span className="hidden sm:inline-block text-xs font-mono font-bold uppercase tracking-wider text-[#B8385E] border-l border-[#EFE8E6] dark:border-[#2D1945] pl-3">
            Junta Directiva · Nivel 5
          </span>
        </div>

        {/* Progress & Slide Counter */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono font-bold text-[#59483E] dark:text-[#C5B7C2]">
            {currentSlideIndex + 1} / {SLIDES.length}
          </span>
          <div className="hidden sm:flex w-28 h-1.5 rounded-full bg-[#EFE8E6] dark:bg-[#2D1945] overflow-hidden">
            <div
              className="h-full bg-[#B8385E] transition-all duration-300"
              style={{ width: `${((currentSlideIndex + 1) / SLIDES.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowNotes(!showNotes)}
            className={`px-3 py-1.5 rounded-full text-xs font-display font-bold flex items-center gap-1.5 transition-colors cursor-pointer border ${
              showNotes
                ? 'bg-[#1E0C30] text-white border-[#1E0C30]'
                : 'bg-white dark:bg-[#1D102E] text-[#1E0C30] dark:text-[#F6EEF2] border-[#EFE8E6] dark:border-[#2D1945] hover:bg-neutral-50 dark:hover:bg-[#25153A]'
            }`}
            title="Activar o desactivar guion del expositor (Tecla N)"
          >
            <Mic size={14} className={showNotes ? 'text-[#E27D7D]' : 'text-[#B8385E]'} />
            <span className="hidden md:inline">Guion Expositor</span>
          </button>

          <button
            type="button"
            onClick={toggleFullscreen}
            className={`p-2 rounded-full border border-[#EFE8E6] dark:border-[#2D1945] ${
              isFullscreen
                ? 'bg-[#1E0C30] text-white dark:bg-white dark:text-[#1E0C30]'
                : 'bg-white dark:bg-[#1D102E] text-[#1E0C30] dark:text-[#F6EEF2] hover:bg-neutral-50 dark:hover:bg-[#25153A]'
            } cursor-pointer`}
            title={isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
          >
            <Maximize2 size={15} />
          </button>
        </div>
      </header>

      {/* Main Slide Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-8 lg:p-12 flex flex-col justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="space-y-6 sm:space-y-8"
          >
            {/* Slide Header: Badges & Title */}
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 rounded-full text-[11px] font-mono font-bold uppercase tracking-wider bg-[#1E0C30] text-white">
                  {currentSlide.category}
                </span>
                <span className="px-3 py-1 rounded-full text-[11px] font-mono font-bold uppercase tracking-wider bg-[#B8385E] text-white">
                  {currentSlide.rubricWeight}
                </span>
              </div>

              <h1 className="font-display text-3xl sm:text-5xl lg:text-6xl font-black text-[#1E0C30] dark:text-white tracking-tight leading-tight">
                {currentSlide.title}
              </h1>

              <p className="text-sm sm:text-base lg:text-lg text-[#59483E] dark:text-[#C5B7C2] max-w-3xl leading-relaxed">
                {currentSlide.subtitle}
              </p>
            </div>

            {/* Dynamic Slide Body by Type */}
            <div className="pt-2">
              {/* 1. HERO SLIDE */}
              {currentSlide.content.type === 'hero' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 pt-4">
                  {currentSlide.content.data.stats.map((stat: any, i: number) => (
                    <div
                      key={i}
                      className="p-6 rounded-2xl bg-white dark:bg-[#1D102E] border border-[#EFE8E6] dark:border-[#2D1945] shadow-sm space-y-2"
                    >
                      <span className="text-xs font-mono uppercase tracking-wider text-[#59483E] dark:text-[#C5B7C2]">
                        {stat.label}
                      </span>
                      <p className="font-display text-3xl sm:text-4xl font-black text-[#B8385E]">
                        {stat.value}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* 2. COMPARISON SLIDE */}
              {currentSlide.content.type === 'comparison' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                  <div className="p-6 rounded-2xl bg-white dark:bg-[#1D102E] border border-[#EFE8E6] dark:border-[#2D1945] space-y-4">
                    <div className="flex items-center gap-2">
                      <ShoppingBag size={20} className="text-[#B8385E]" />
                      <h3 className="font-display text-lg font-bold text-[#1E0C30] dark:text-white">
                        {currentSlide.content.data.buyer.role}
                      </h3>
                    </div>
                    <ul className="space-y-3">
                      {currentSlide.content.data.buyer.points.map((pt: string, idx: number) => (
                        <li key={idx} className="text-sm text-[#59483E] dark:text-[#C5B7C2] flex items-start gap-2">
                          <span className="text-[#B8385E] font-bold">✕</span>
                          <span>{pt}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-6 rounded-2xl bg-white dark:bg-[#1D102E] border border-[#EFE8E6] dark:border-[#2D1945] space-y-4">
                    <div className="flex items-center gap-2">
                      <Bike size={20} className="text-[#B8385E]" />
                      <h3 className="font-display text-lg font-bold text-[#1E0C30] dark:text-white">
                        {currentSlide.content.data.seller.role}
                      </h3>
                    </div>
                    <ul className="space-y-3">
                      {currentSlide.content.data.seller.points.map((pt: string, idx: number) => (
                        <li key={idx} className="text-sm text-[#59483E] dark:text-[#C5B7C2] flex items-start gap-2">
                          <span className="text-[#B8385E] font-bold">✕</span>
                          <span>{pt}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* 3. TIMELINE & PIVOT SLIDE */}
              {currentSlide.content.type === 'timeline' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                  <div className="p-6 rounded-2xl bg-[#EFE8E6]/40 dark:bg-[#25153A]/40 border border-neutral-300 dark:border-neutral-700 space-y-3">
                    <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-500">
                      {currentSlide.content.data.initial.badge}
                    </span>
                    <h3 className="font-display text-lg font-bold text-neutral-700 dark:text-neutral-300">
                      {currentSlide.content.data.initial.title}
                    </h3>
                    <ul className="space-y-2 pt-2">
                      {currentSlide.content.data.initial.flaws.map((flaw: string, idx: number) => (
                        <li key={idx} className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 flex items-start gap-2">
                          <span className="text-neutral-400 font-bold">•</span>
                          <span>{flaw}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-6 rounded-2xl bg-[#1E0C30] text-white border border-[#3A1856] shadow-lg space-y-3">
                    <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#E27D7D]">
                      {currentSlide.content.data.pivot.badge}
                    </span>
                    <h3 className="font-display text-lg font-bold text-white">
                      {currentSlide.content.data.pivot.title}
                    </h3>
                    <ul className="space-y-2 pt-2">
                      {currentSlide.content.data.pivot.benefits.map((benefit: string, idx: number) => (
                        <li key={idx} className="text-xs sm:text-sm text-neutral-300 flex items-start gap-2">
                          <span className="text-[#E27D7D] font-bold">✓</span>
                          <span>{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* 4. GTM SLIDE */}
              {currentSlide.content.type === 'gtm' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                  {currentSlide.content.data.pillars.map((pillar: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-5 rounded-2xl bg-white dark:bg-[#1D102E] border border-[#EFE8E6] dark:border-[#2D1945] space-y-3"
                    >
                      <span className="text-xs font-mono font-bold text-[#B8385E]">
                        Pilar 0{idx + 1}
                      </span>
                      <h3 className="font-display text-base font-bold text-[#1E0C30] dark:text-white">
                        {pillar.title}
                      </h3>
                      <ul className="space-y-2 pt-1">
                        {pillar.items.map((item: string, i: number) => (
                          <li key={i} className="text-xs text-[#59483E] dark:text-[#C5B7C2] flex items-start gap-2">
                            <span className="text-[#B8385E]">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}

              {/* 5. EVIDENCE PLACEHOLDER SLIDE */}
              {currentSlide.content.type === 'evidence' && (
                <div className="space-y-4 pt-2">
                  {currentSlide.content.data.flow && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {currentSlide.content.data.flow.map((step: any, idx: number) => (
                        <div
                          key={idx}
                          className="p-4 rounded-xl bg-white dark:bg-[#1D102E] border border-[#EFE8E6] dark:border-[#2D1945]"
                        >
                          <span className="text-xs font-mono font-bold text-[#B8385E]">Paso {step.step}</span>
                          <h4 className="font-display font-bold text-sm text-[#1E0C30] dark:text-white">{step.title}</h4>
                          <p className="text-xs text-[#59483E] dark:text-[#C5B7C2]">{step.desc}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {currentSlide.content.data.metrics && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {currentSlide.content.data.metrics.map((m: any, idx: number) => (
                        <div
                          key={idx}
                          className="p-4 rounded-xl bg-white dark:bg-[#1D102E] border border-[#EFE8E6] dark:border-[#2D1945]"
                        >
                          <span className="text-xs font-mono text-[#59483E] dark:text-[#C5B7C2]">{m.label}</span>
                          <p className="font-display font-black text-xl text-[#B8385E]">{m.value}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Placeholder box for user evidence */}
                  <div className="p-8 sm:p-12 rounded-2xl border-2 border-dashed border-[#B8385E]/40 bg-[#B8385E]/5 flex flex-col items-center justify-center text-center space-y-3">
                    <Sparkles size={28} className="text-[#B8385E]" />
                    <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#B8385E]">
                      {currentSlide.content.data.placeholderText}
                    </span>
                    <p className="text-xs text-[#59483E] dark:text-[#C5B7C2] max-w-md">
                      Pega aquí la captura de pantalla de pedidos reales, transferencias Nequi o fotos tomadas en el campus durante la sustentación.
                    </p>
                  </div>
                </div>
              )}

              {/* 6. ECONOMICS SLIDE */}
              {currentSlide.content.type === 'economics' && (
                <div className="space-y-4 pt-2">
                  <div className="overflow-x-auto rounded-2xl border border-[#EFE8E6] dark:border-[#2D1945] bg-white dark:bg-[#1D102E]">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-[#FAF6F5] dark:bg-[#180C28] text-xs font-mono uppercase text-[#59483E] dark:text-[#C5B7C2] border-b border-[#EFE8E6] dark:border-[#2D1945]">
                        <tr>
                          <th className="p-4">Actor</th>
                          <th className="p-4">Monto (COP)</th>
                          <th className="p-4">% Destino</th>
                          <th className="p-4">Propósito</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#EFE8E6] dark:divide-[#2D1945]">
                        {currentSlide.content.data.breakdown.map((row: any, idx: number) => (
                          <tr key={idx} className="hover:bg-neutral-50 dark:hover:bg-[#25153A]">
                            <td className="p-4 font-bold text-[#1E0C30] dark:text-white">{row.role}</td>
                            <td className="p-4 font-mono font-bold text-[#B8385E]">{row.amount}</td>
                            <td className="p-4 font-mono text-xs">{row.pct}</td>
                            <td className="p-4 text-xs text-[#59483E] dark:text-[#C5B7C2]">{row.note}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="p-4 rounded-xl bg-[#1E0C30] text-white flex items-center justify-between">
                    <span className="font-display font-bold text-sm">TOTAL PAGADO POR EL COMPRADOR</span>
                    <span className="font-display font-black text-xl text-[#E27D7D]">
                      {currentSlide.content.data.totalBuyer}
                    </span>
                  </div>
                </div>
              )}

              {/* 7. RISKS SLIDE */}
              {currentSlide.content.type === 'risks' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  {currentSlide.content.data.risks.map((risk: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-5 rounded-2xl bg-white dark:bg-[#1D102E] border border-[#EFE8E6] dark:border-[#2D1945] space-y-2"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-mono font-bold text-[#B8385E]">Riesgo 0{idx + 1}</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#1E0C30] text-white">
                          {risk.impact}
                        </span>
                      </div>
                      <h4 className="font-display font-bold text-sm text-[#1E0C30] dark:text-white">
                        {risk.threat}
                      </h4>
                      <p className="text-xs text-[#59483E] dark:text-[#C5B7C2] leading-relaxed pt-1 border-t border-[#EFE8E6] dark:border-[#2D1945]">
                        <strong className="text-[#1E0C30] dark:text-white">Mitigación:</strong> {risk.mitigation}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* 8. CLOSING SLIDE */}
              {currentSlide.content.type === 'closing' && (
                <div className="p-8 sm:p-12 rounded-3xl bg-[#B8385E] text-white space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {currentSlide.content.data.summaryPoints.map((pt: string, idx: number) => (
                      <div key={idx} className="flex items-center gap-3">
                        <CheckCircle2 size={20} className="text-white shrink-0" />
                        <span className="font-display font-bold text-sm sm:text-base">{pt}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4 border-t border-white/20 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <span className="text-xs font-mono text-white/90">
                      Universidad Icesi · Innovación 3 · 2026
                    </span>
                    <Link
                      to="/catalogo"
                      className="px-6 py-3 rounded-full bg-[#1E0C30] text-white font-display text-xs font-bold shadow-lg hover:bg-[#2F154B] transition-all"
                    >
                      {currentSlide.content.data.ctaText} ↗
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Presenter Notes Accordion / Bottom Drawer */}
            {showNotes && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="p-5 rounded-2xl bg-[#1E0C30] text-white border border-[#3A1856] space-y-2 shadow-xl"
              >
                <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#E27D7D]">
                  <Mic size={14} />
                  <span>Guion Sugerido para el Expositor</span>
                </div>
                <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed italic">
                  "{currentSlide.speakerNotes}"
                </p>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Sticky Slide Navigation Bar */}
      <footer className="sticky bottom-0 z-30 border-t border-[#EFE8E6] dark:border-[#2D1945] bg-[#FAF6F5]/90 dark:bg-[#130920]/90 backdrop-blur-md px-4 sm:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link
            to="/"
            className="px-3 py-2 rounded-full border border-[#EFE8E6] dark:border-[#2D1945] text-xs font-display font-bold text-[#1E0C30] dark:text-[#F6EEF2] hover:bg-neutral-50 dark:hover:bg-[#25153A] flex items-center gap-1.5 cursor-pointer"
          >
            <Home size={14} />
            <span className="hidden sm:inline">Volver al Inicio</span>
          </Link>
        </div>

        {/* Slide Selector Carousel Pill */}
        <div className="flex items-center gap-1 sm:gap-2">
          {SLIDES.map((s, idx) => (
            <button
              key={s.id}
              type="button"
              onClick={() => {
                playKeyBeep(500)
                setCurrentSlideIndex(idx)
              }}
              className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full transition-all cursor-pointer ${
                idx === currentSlideIndex
                  ? 'bg-[#B8385E] scale-125'
                  : 'bg-neutral-300 dark:bg-neutral-700 hover:bg-neutral-400'
              }`}
              title={`Slide ${idx + 1}: ${s.title}`}
            />
          ))}
        </div>

        {/* Prev / Next Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrev}
            disabled={currentSlideIndex === 0}
            className="p-2 sm:px-4 sm:py-2 rounded-full border border-[#EFE8E6] dark:border-[#2D1945] bg-white dark:bg-[#1D102E] text-[#1E0C30] dark:text-[#F6EEF2] disabled:opacity-40 hover:bg-neutral-50 dark:hover:bg-[#25153A] cursor-pointer flex items-center gap-1 text-xs font-bold"
          >
            <ChevronLeft size={16} />
            <span className="hidden sm:inline">Anterior</span>
          </button>

          <button
            type="button"
            onClick={handleNext}
            disabled={currentSlideIndex === SLIDES.length - 1}
            className="p-2 sm:px-4 sm:py-2 rounded-full bg-[#B8385E] text-white disabled:opacity-40 hover:bg-[#A32F51] cursor-pointer flex items-center gap-1 text-xs font-bold shadow-md"
          >
            <span className="hidden sm:inline">Siguiente</span>
            <ChevronRight size={16} />
          </button>
        </div>
      </footer>
    </div>
  )
}
