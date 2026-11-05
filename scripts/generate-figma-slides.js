import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const outDir = path.resolve(__dirname, '../presentation_figma')

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true })
}

// Brand Colors
const C = {
  cream: '#FAF6F5',
  plum: '#1E0C30',
  plumLight: '#2D1945',
  rose: '#B8385E',
  coral: '#E27D7D',
  border: '#EFE8E6',
  white: '#FFFFFF',
  textMuted: '#59483E',
  cardBg: '#FFFFFF',
  cardDark: '#1D102E',
  grayBg: '#F3ECE9',
}

const font = `font-family="Plus Jakarta Sans, Outfit, Inter, sans-serif"`
const fontDisplay = `font-family="Outfit, Plus Jakarta Sans, Inter, sans-serif"`
const fontMono = `font-family="monospace, Courier New, sans-serif"`

// Helper to create star sparkle icon
function starIcon(x, y, size = 24, fill = C.white) {
  return `
    <g transform="translate(${x}, ${y}) scale(${size / 24})">
      <circle cx="12" cy="12" r="12" fill="${C.rose}"/>
      <path d="M12 4C12.3 8 16 11.7 20 12C16 12.3 12.3 16 12 20C11.7 16 8 12.3 4 12C8 11.7 11.7 8 12 4Z" fill="${fill}"/>
      <circle cx="18" cy="6" r="1.5" fill="${fill}"/>
    </g>
  `
}

// Common Header for Slide
function slideHeader(slideNum, category, rubricWeight, title, subtitle, isDark = false) {
  const textColor = isDark ? C.white : C.plum
  const subColor = isDark ? '#D4C5D0' : C.textMuted
  return `
    <!-- Top Branding & Slide Meta -->
    <g transform="translate(100, 70)">
      ${starIcon(0, 0, 32)}
      <text x="44" y="24" ${fontDisplay} font-size="24" font-weight="900" fill="${textColor}" letter-spacing="-0.5">bocado<tspan fill="${C.rose}"> .</tspan></text>
      <text x="180" y="23" ${fontMono} font-size="14" font-weight="700" fill="${C.rose}">|  UNIVERSIDAD ICESI</text>
      
      <!-- Rubric Pills Right -->
      <g transform="translate(1380, 0)">
        <rect x="0" y="0" width="160" height="36" rx="18" fill="${isDark ? 'rgba(255,255,255,0.15)' : C.plum}"/>
        <text x="80" y="23" ${fontMono} font-size="12" font-weight="700" fill="${C.white}" text-anchor="middle">${category}</text>
        
        <rect x="175" y="0" width="165" height="36" rx="18" fill="${C.rose}"/>
        <text x="257" y="23" ${fontMono} font-size="12" font-weight="700" fill="${C.white}" text-anchor="middle">${rubricWeight}</text>
      </g>
    </g>

    <!-- Slide Title & Subtitle -->
    <g transform="translate(100, 150)">
      <text x="0" y="55" ${fontDisplay} font-size="52" font-weight="900" fill="${textColor}" letter-spacing="-1">${title}</text>
      <text x="0" y="98" ${font} font-size="20" font-weight="400" fill="${subColor}">${subtitle}</text>
    </g>
  `
}

// Common Footer for Slide
function slideFooter(slideNum, isDark = false) {
  const textColor = isDark ? 'rgba(255,255,255,0.6)' : C.textMuted
  return `
    <g transform="translate(100, 1010)">
      <line x1="0" y1="0" x2="1720" y2="0" stroke="${isDark ? 'rgba(255,255,255,0.1)' : C.border}" stroke-width="1"/>
      <text x="0" y="28" ${fontMono} font-size="13" font-weight="600" fill="${textColor}">Bocado · Sustentación Junta Directiva · Innovación 3</text>
      <text x="1720" y="28" ${fontMono} font-size="14" font-weight="800" fill="${C.rose}" text-anchor="end">Slide ${slideNum} de 10</text>
    </g>
  `
}

// SLIDE 1: PORTADA & GANCHO
function slide1() {
  return `
    <rect width="1920" height="1080" fill="${C.cream}"/>
    
    <!-- Top Branding -->
    <g transform="translate(120, 90)">
      ${starIcon(0, 0, 44)}
      <text x="58" y="32" ${fontDisplay} font-size="36" font-weight="900" fill="${C.plum}">bocado<tspan fill="${C.rose}"> .</tspan></text>
      <text x="230" y="30" ${fontMono} font-size="15" font-weight="700" fill="${C.rose}">MICRO-COMERCIO GASTRONÓMICO INTRA-CAMPUS</text>
    </g>

    <!-- Big Headline with Outline Words -->
    <g transform="translate(120, 230)">
      <rect x="0" y="0" width="360" height="36" rx="18" fill="${C.rose}"/>
      <text x="180" y="23" ${fontMono} font-size="13" font-weight="800" fill="${C.white}" text-anchor="middle">APERTURA · PRIMEROS 45 SEGUNDOS</text>

      <text x="0" y="130" ${fontDisplay} font-size="110" font-weight="900" fill="${C.plum}" letter-spacing="-3">Tu antojo.</text>
      <text x="0" y="240" ${fontDisplay} font-size="110" font-weight="300" fill="none" stroke="${C.rose}" stroke-width="3" letter-spacing="-3">En movimiento.</text>

      <text x="0" y="320" ${font} font-size="26" font-weight="400" fill="${C.textMuted}">
        La red colaborativa que conecta a cocineros y repartidores con estudiantes
      </text>
      <text x="0" y="360" ${font} font-size="26" font-weight="700" fill="${C.plum}">
        directamente en su salón o puesto de estudio en la Universidad Icesi.
      </text>
    </g>

    <!-- 3 Quick Metrics Cards Bottom -->
    <g transform="translate(120, 680)">
      <g transform="translate(0, 0)">
        <rect width="320" height="180" rx="24" fill="${C.white}" stroke="${C.border}" stroke-width="2"/>
        <text x="36" y="55" ${fontMono} font-size="14" font-weight="700" fill="${C.rose}">TIEMPO DE PEDIDO</text>
        <text x="36" y="115" ${fontDisplay} font-size="48" font-weight="900" fill="${C.plum}">2 min</text>
        <text x="36" y="148" ${font} font-size="14" fill="${C.textMuted}">Desde cualquier celular en campus</text>
      </g>

      <g transform="translate(350, 0)">
        <rect width="320" height="180" rx="24" fill="${C.white}" stroke="${C.border}" stroke-width="2"/>
        <text x="36" y="55" ${fontMono} font-size="14" font-weight="700" fill="${C.rose}">TIEMPO DE ENTREGA</text>
        <text x="36" y="115" ${fontDisplay} font-size="48" font-weight="900" fill="${C.plum}">&lt; 15 min</text>
        <text x="36" y="148" ${font} font-size="14" fill="${C.textMuted}">Entregas a pie entre edificios</text>
      </g>

      <g transform="translate(700, 0)">
        <rect width="320" height="180" rx="24" fill="${C.plum}"/>
        <text x="36" y="55" ${fontMono} font-size="14" font-weight="700" fill="${C.coral}">INFRAESTRUCTURA</text>
        <text x="36" y="115" ${fontDisplay} font-size="48" font-weight="900" fill="${C.white}">$0 Capex</text>
        <text x="36" y="148" ${font} font-size="14" fill="#D4C5D0">Modelo 100% peer-to-peer</text>
      </g>
    </g>

    <!-- Right Graphic Artboard Frame (Representation of 3D / Campus) -->
    <g transform="translate(1220, 220)">
      <circle cx="300" cy="300" r="280" fill="${C.rose}" opacity="0.12"/>
      <circle cx="300" cy="300" r="210" fill="${C.plum}" opacity="0.08"/>
      <circle cx="300" cy="300" r="140" fill="${C.white}" stroke="${C.border}" stroke-width="2"/>
      <text x="300" y="290" ${fontDisplay} font-size="32" font-weight="900" fill="${C.plum}" text-anchor="middle">🥐 Bocado</text>
      <text x="300" y="325" ${fontMono} font-size="13" font-weight="700" fill="${C.rose}" text-anchor="middle">SABOR EN MOVIMIENTO</text>
      
      <!-- Floating Badge -->
      <rect x="180" y="470" width="240" height="50" rx="25" fill="${C.plum}"/>
      <text x="300" y="501" ${font} font-size="14" font-weight="700" fill="${C.white}" text-anchor="middle">bocado-gamma.vercel.app ↗</text>
    </g>

    ${slideFooter(1)}
  `
}

// SLIDE 2: CONTEXTO DEL PROBLEMA
function slide2() {
  return `
    <rect width="1920" height="1080" fill="${C.cream}"/>
    ${slideHeader(2, 'Contexto del Problema', 'El Gancho', 'El Dolor Validado en la Universidad Icesi', 'Observación y entrevistas a estudiantes y profesores durante jornadas académicas intensivas.')}

    <g transform="translate(100, 270)">
      <!-- Card 1: Comprador -->
      <g transform="translate(0, 0)">
        <rect width="830" height="690" rx="28" fill="${C.white}" stroke="${C.border}" stroke-width="2"/>
        <rect x="40" y="40" width="180" height="34" rx="17" fill="${C.plum}"/>
        <text x="130" y="62" ${fontMono} font-size="12" font-weight="700" fill="${C.white}" text-anchor="middle">EL COMPRADOR</text>
        <text x="40" y="125" ${fontDisplay} font-size="34" font-weight="900" fill="${C.plum}">Estudiantes y Docentes en Clase</text>
        <text x="40" y="160" ${font} font-size="17" fill="${C.textMuted}">Pasan horas continuas en laboratorios, aulas o salas del Boreal sin descanso real.</text>

        <!-- Bullet 1 -->
        <g transform="translate(40, 200)">
          <circle cx="20" cy="20" r="16" fill="#FEE2E2"/>
          <text x="20" y="26" ${font} font-size="16" font-weight="900" fill="#DC2626" text-anchor="middle">✕</text>
          <text x="55" y="18" ${fontDisplay} font-size="20" font-weight="800" fill="${C.plum}">Pérdida del Puesto de Estudio</text>
          <text x="55" y="42" ${font} font-size="15" fill="${C.textMuted}">Salir a comprar implica perder la mesa en el Boreal o desconectarse del taller.</text>
        </g>

        <!-- Bullet 2 -->
        <g transform="translate(40, 290)">
          <circle cx="20" cy="20" r="16" fill="#FEE2E2"/>
          <text x="20" y="26" ${font} font-size="16" font-weight="900" fill="#DC2626" text-anchor="middle">✕</text>
          <text x="55" y="18" ${fontDisplay} font-size="20" font-weight="800" fill="${C.plum}">Filas Eternas en Cafetería Central</text>
          <text x="55" y="42" ${font} font-size="15" fill="${C.textMuted}">Desplazamientos de 10-15 min entre bloques y filas que no dejan tiempo de comer.</text>
        </g>

        <!-- Bullet 3 -->
        <g transform="translate(40, 380)">
          <circle cx="20" cy="20" r="16" fill="#FEE2E2"/>
          <text x="20" y="26" ${font} font-size="16" font-weight="900" fill="#DC2626" text-anchor="middle">✕</text>
          <text x="55" y="18" ${fontDisplay} font-size="20" font-weight="800" fill="${C.plum}">Opciones Costosas e Industriales</text>
          <text x="55" y="42" ${font} font-size="15" fill="${C.textMuted}">Precios altos en concesiones formales y poca oferta casera o artesanal.</text>
        </g>

        <rect x="40" y="490" width="750" height="150" rx="18" fill="${C.cream}"/>
        <text x="65" y="535" ${fontMono} font-size="13" font-weight="700" fill="${C.rose}">IMPACTO EN EL USUARIO</text>
        <text x="65" y="575" ${font} font-size="18" font-weight="600" fill="${C.plum}">"Prefiero quedarme con hambre antes que bajar a la cafetería,</text>
        <text x="65" y="605" ${font} font-size="18" font-weight="600" fill="${C.plum}">perder mi mesa con el computador y llegar tarde a la clase."</text>
      </g>

      <!-- Card 2: Vendedor -->
      <g transform="translate(890, 0)">
        <rect width="830" height="690" rx="28" fill="${C.white}" stroke="${C.border}" stroke-width="2"/>
        <rect x="40" y="40" width="180" height="34" rx="17" fill="${C.rose}"/>
        <text x="130" y="62" ${fontMono} font-size="12" font-weight="700" fill="${C.white}" text-anchor="middle">EL VENDEDOR</text>
        <text x="40" y="125" ${fontDisplay} font-size="34" font-weight="900" fill="${C.plum}">Estudiante Cocinero Emprendedor</text>
        <text x="40" y="160" ${font} font-size="17" fill="${C.textMuted}">Hornea brownies, galletas o prepara sándwiches para financiar sus estudios.</text>

        <!-- Bullet 1 -->
        <g transform="translate(40, 200)">
          <circle cx="20" cy="20" r="16" fill="#FEE2E2"/>
          <text x="20" y="26" ${font} font-size="16" font-weight="900" fill="#DC2626" text-anchor="middle">✕</text>
          <text x="55" y="18" ${fontDisplay} font-size="20" font-weight="800" fill="${C.plum}">Canal Informal de WhatsApp</text>
          <text x="55" y="42" ${font} font-size="15" fill="${C.textMuted}">Alcance reducido a amigos cercanos y estados que pocos ven a tiempo.</text>
        </g>

        <!-- Bullet 2 -->
        <g transform="translate(40, 290)">
          <circle cx="20" cy="20" r="16" fill="#FEE2E2"/>
          <text x="20" y="26" ${font} font-size="16" font-weight="900" fill="#DC2626" text-anchor="middle">✕</text>
          <text x="55" y="18" ${fontDisplay} font-size="20" font-weight="800" fill="${C.plum}">Imposibilidad de Reparto en Clase</text>
          <text x="55" y="42" ${font} font-size="15" fill="${C.textMuted}">No pueden salir a entregar a otros edificios mientras están en su propia materia.</text>
        </g>

        <!-- Bullet 3 -->
        <g transform="translate(40, 380)">
          <circle cx="20" cy="20" r="16" fill="#FEE2E2"/>
          <text x="20" y="26" ${font} font-size="16" font-weight="900" fill="#DC2626" text-anchor="middle">✕</text>
          <text x="55" y="18" ${fontDisplay} font-size="20" font-weight="800" fill="${C.plum}">Fricción de Cobro y Stock Ciego</text>
          <text x="55" y="42" ${font} font-size="15" fill="${C.textMuted}">Transferencias no confirmadas, falta de cambio y sobrante de comida diario.</text>
        </g>

        <rect x="40" y="490" width="750" height="150" rx="18" fill="${C.plum}"/>
        <text x="65" y="535" ${fontMono} font-size="13" font-weight="700" fill="${C.coral}">OPORTUNIDAD DE NEGOCIO</text>
        <text x="65" y="575" ${font} font-size="18" font-weight="600" fill="${C.white}">Hasta el 60% del inventario diario se queda sin vender</text>
        <text x="65" y="605" ${font} font-size="18" font-weight="600" fill="${C.white}">por falta de un canal logístico intra-campus coordinado.</text>
      </g>
    </g>

    ${slideFooter(2)}
  `
}

// SLIDE 3: PMV Y ENTREGA DE VALOR (30%)
function slide3() {
  return `
    <rect width="1920" height="1080" fill="${C.cream}"/>
    ${slideHeader(3, 'PMV & Demostración Real', '30% de la Nota', 'Demostración de Funcionamiento Real del PMV', 'Plataforma web progresiva 100% operativa en bocado-gamma.vercel.app para la comunidad Icesi.')}

    <g transform="translate(100, 270)">
      <!-- Left: 3 Process Steps -->
      <g transform="translate(0, 0)">
        <rect width="520" height="690" rx="28" fill="${C.white}" stroke="${C.border}" stroke-width="2"/>
        <text x="40" y="55" ${fontDisplay} font-size="26" font-weight="900" fill="${C.plum}">Flujo Operativo en Vivo</text>
        <text x="40" y="85" ${font} font-size="15" fill="${C.textMuted}">Probado en instalaciones reales del campus.</text>

        <!-- Step 1 -->
        <g transform="translate(40, 120)">
          <rect width="440" height="150" rx="18" fill="${C.cream}"/>
          <text x="24" y="38" ${fontMono} font-size="13" font-weight="800" fill="${C.rose}">PASO 01 · CATÁLOGO DINÁMICO</text>
          <text x="24" y="70" ${fontDisplay} font-size="20" font-weight="800" fill="${C.plum}">Explora Snacks Frescos</text>
          <text x="24" y="100" ${font} font-size="14" fill="${C.textMuted}">El estudiante ve opciones disponibles en el campus con precio claro y fotos reales.</text>
        </g>

        <!-- Step 2 -->
        <g transform="translate(40, 290)">
          <rect width="440" height="150" rx="18" fill="${C.cream}"/>
          <text x="24" y="38" ${fontMono} font-size="13" font-weight="800" fill="${C.rose}">PASO 02 · ORDEN CON EDIFICIO</text>
          <text x="24" y="70" ${fontDisplay} font-size="20" font-weight="800" fill="${C.plum}">Pide a su Aula Exacta</text>
          <text x="24" y="100" ${font} font-size="14" fill="${C.textMuted}">Selecciona su bloque (Edif. D, M, E, Boreal) y paga por Nequi o contra-entrega.</text>
        </g>

        <!-- Step 3 -->
        <g transform="translate(40, 460)">
          <rect width="440" height="150" rx="18" fill="${C.plum}"/>
          <text x="24" y="38" ${fontMono} font-size="13" font-weight="800" fill="${C.coral}">PASO 03 · ENTREGA A PIE</text>
          <text x="24" y="70" ${fontDisplay} font-size="20" font-weight="800" fill="${C.white}">Entrega en &lt; 15 Minutos</text>
          <text x="24" y="100" ${font} font-size="14" fill="#D4C5D0}">Un compañero en hueco libre lleva el snack directamente a la puerta del salón.</text>
        </g>

        <rect x="40" y="628" width="440" height="36" rx="18" fill="${C.rose}"/>
        <text x="260" y="651" ${fontMono} font-size="12" font-weight="700" fill="${C.white}" text-anchor="middle">URL: bocado-gamma.vercel.app</text>
      </g>

      <!-- Right: Large Evidence Placeholder Frame -->
      <g transform="translate(560, 0)">
        <rect width="1160" height="690" rx="28" fill="${C.white}" stroke="${C.rose}" stroke-width="3" stroke-dasharray="12 12"/>
        
        <g transform="translate(580, 280)">
          <circle cx="0" cy="0" r="44" fill="${C.rose}" opacity="0.12"/>
          <text x="0" y="12" ${font} font-size="34" font-weight="900" fill="${C.rose}" text-anchor="middle">📷</text>
          
          <text x="0" y="75" ${fontDisplay} font-size="24" font-weight="900" fill="${C.plum}" text-anchor="middle">
            [ESPACIO PARA EVIDENCIA: PANTALLAZO DEL PMV REAL]
          </text>
          <text x="0" y="115" ${font} font-size="16" fill="${C.textMuted}" text-anchor="middle">
            Pega aquí la captura del Catálogo en Vivo, pantalla de Checkout o
          </text>
          <text x="0" y="145" ${font} font-size="16" fill="${C.textMuted}" text-anchor="middle">
            fotografía real del estudiante recibiendo el snack en un aula de Icesi.
          </text>
          <text x="0" y="185" ${fontMono} font-size="13" font-weight="700" fill="${C.rose}" text-anchor="middle">
            (Haz clic en este recuadro en Figma y presiona Ctrl + V con tu imagen)
          </text>
        </g>
      </g>
    </g>

    ${slideFooter(3)}
  `
}

// SLIDE 4: EVOLUCION Y APRENDIZAJES (30%)
function slide4() {
  return `
    <rect width="1920" height="1080" fill="${C.cream}"/>
    ${slideHeader(4, 'Evolución & Iteración', '30% de la Nota', 'Evolución y Aprendizajes: De Smart Lockers a Peer-to-Peer', 'Cómo la validación con usuarios nos llevó a simplificar la arquitectura eliminando costos millonarios.')}

    <g transform="translate(100, 270)">
      <!-- Left: Hipótesis Inicial (Descartada) -->
      <g transform="translate(0, 0)">
        <rect width="830" height="690" rx="28" fill="${C.white}" stroke="${C.border}" stroke-width="2"/>
        <rect x="40" y="40" width="280" height="34" rx="17" fill="#EF4444"/>
        <text x="180" y="62" ${fontMono} font-size="12" font-weight="700" fill="${C.white}" text-anchor="middle">HIPÓTESIS INICIAL (DESBANCADA)</text>
        
        <text x="40" y="125" ${fontDisplay} font-size="34" font-weight="900" fill="${C.plum}">Red de Casilleros Inteligentes</text>
        <text x="40" y="160" ${font} font-size="17" fill="${C.textMuted}">Módulos físicos con teclados numéricos y apertura remota por código.</text>

        <g transform="translate(40, 210)">
          <rect width="750" height="90" rx="16" fill="#FEF2F2"/>
          <text x="24" y="35" ${fontDisplay} font-size="18" font-weight="800" fill="#991B1B">Capex Alto e Inviable</text>
          <text x="24" y="62" ${font} font-size="14" fill="${C.textMuted}">Fabricación, cerrajería electrónica, baterías y conectividad requerían más de $15M COP.</text>
        </g>

        <g transform="translate(40, 320)">
          <rect width="750" height="90" rx="16" fill="#FEF2F2"/>
          <text x="24" y="35" ${fontDisplay} font-size="18" font-weight="800" fill="#991B1B">Fricción Regulatoria de Campus</text>
          <text x="24" y="62" ${font} font-size="14" fill="${C.textMuted}">Permisos de planta física, anclaje en pasillos y mantenimiento técnico permanente.</text>
        </g>

        <g transform="translate(40, 430)">
          <rect width="750" height="90" rx="16" fill="#FEF2F2"/>
          <text x="24" y="35" ${fontDisplay} font-size="18" font-weight="800" fill="#991B1B">No Resolvía el Dolor Real</text>
          <text x="24" y="62" ${font} font-size="14" fill="${C.textMuted}">El comprador aún tenía que pararse de su salón y caminar hasta el casillero en otro piso.</text>
        </g>

        <rect x="40" y="550" width="750" height="95" rx="16" fill="${C.grayBg}"/>
        <text x="375" y="590" ${fontDisplay} font-size="18" font-weight="800" fill="${C.plum}" text-anchor="middle">Aprendizaje Validado:</text>
        <text x="375" y="618" ${font} font-size="15" fill="${C.textMuted}" text-anchor="middle">"El valor para el usuario no es el casillero; es no tener que levantarse de su puesto."</text>
      </g>

      <!-- Right: Solución Validada (Bocado P2P) -->
      <g transform="translate(890, 0)">
        <rect width="830" height="690" rx="28" fill="${C.plum}"/>
        <rect x="40" y="40" width="280" height="34" rx="17" fill="${C.rose}"/>
        <text x="180" y="62" ${fontMono} font-size="12" font-weight="700" fill="${C.white}" text-anchor="middle">SOLUCIÓN FINAL (VALIDADA)</text>
        
        <text x="40" y="125" ${fontDisplay} font-size="34" font-weight="900" fill="${C.white}">Red Colaborativa Peer-to-Peer</text>
        <text x="40" y="160" ${font} font-size="17" fill="#D4C5D0">Estudiantes domiciliarios en huecos libres realizan entregas a pie.</text>

        <g transform="translate(40, 210)">
          <rect width="750" height="90" rx="16" fill="rgba(255,255,255,0.08)"/>
          <text x="24" y="35" ${fontDisplay} font-size="18" font-weight="800" fill="${C.coral}">$0 Inversión en Hardware</text>
          <text x="24" y="62" ${font} font-size="14" fill="#D4C5D0">Cero costos de capital. Todo opera sobre la web app responsive y WhatsApp de apoyo.</text>
        </g>

        <g transform="translate(40, 320)">
          <rect width="750" height="90" rx="16" fill="rgba(255,255,255,0.08)"/>
          <text x="24" y="35" ${fontDisplay} font-size="18" font-weight="800" fill="${C.coral}">Entrega Directa en el Aula / Puesto</text>
          <text x="24" y="62" ${font} font-size="14" fill="#D4C5D0">El snack llega en mano al pupitre del estudiante sin interrumpir su clase ni perder su puesto.</text>
        </g>

        <g transform="translate(40, 430)">
          <rect width="750" height="90" rx="16" fill="rgba(255,255,255,0.08)"/>
          <text x="24" y="35" ${fontDisplay} font-size="18" font-weight="800" fill="${C.coral}">Impacto Social en Campus</text>
          <text x="24" y="62" ${font} font-size="14" fill="#D4C5D0">Crea el rol de Domiciliario: monetiza tiempos muertos de compañeros entre materias.</text>
        </g>

        <rect x="40" y="550" width="750" height="95" rx="16" fill="rgba(184,56,94,0.3)"/>
        <text x="375" y="590" ${fontDisplay} font-size="18" font-weight="800" fill="${C.white}" text-anchor="middle">Resultado de la Iteración:</text>
        <text x="375" y="618" ${font} font-size="15" fill="#FCE7F3" text-anchor="middle">Velocidad de entrega x3 más rápida y modelo escalable a cualquier otra universidad.</text>
      </g>
    </g>

    ${slideFooter(4)}
  `
}

// SLIDE 5: GTM STRATEGY (15%)
function slide5() {
  return `
    <rect width="1920" height="1080" fill="${C.cream}"/>
    ${slideHeader(5, 'Go-to-Market', '15% de la Nota', 'Estrategia de Adquisición y Activación Orgánica', 'Aprovechamiento de la alta densidad física de la Universidad Icesi con CAC cercano a cero.')}

    <g transform="translate(100, 270)">
      <!-- Pilar 1 -->
      <g transform="translate(0, 0)">
        <rect width="545" height="690" rx="28" fill="${C.white}" stroke="${C.border}" stroke-width="2"/>
        <rect x="40" y="40" width="130" height="34" rx="17" fill="${C.plum}"/>
        <text x="105" y="62" ${fontMono} font-size="12" font-weight="700" fill="${C.white}" text-anchor="middle">PILAR 01</text>
        
        <text x="40" y="125" ${fontDisplay} font-size="28" font-weight="900" fill="${C.plum}">Público Objetivo</text>
        <text x="40" y="160" ${font} font-size="16" fill="${C.textMuted}">Focalización de alta concentración.</text>

        <g transform="translate(40, 200)">
          <circle cx="16" cy="16" r="14" fill="${C.rose}" opacity="0.15"/>
          <text x="16" y="21" ${font} font-size="14" font-weight="900" fill="${C.rose}" text-anchor="middle">1</text>
          <text x="45" y="18" ${fontDisplay} font-size="18" font-weight="800" fill="${C.plum}">Estudiantes en Bloques Largos</text>
          <text x="45" y="42" ${font} font-size="14" fill="${C.textMuted}">Edificios D, M, E y zonas de estudio Boreal donde no se puede abandonar el puesto.</text>
        </g>

        <g transform="translate(40, 310)">
          <circle cx="16" cy="16" r="14" fill="${C.rose}" opacity="0.15"/>
          <text x="16" y="21" ${font} font-size="14" font-weight="900" fill="${C.rose}" text-anchor="middle">2</text>
          <text x="45" y="18" ${fontDisplay} font-size="18" font-weight="800" fill="${C.plum}">Docentes y Catedráticos</text>
          <text x="45" y="42" ${font} font-size="14" fill="${C.textMuted}">Poco tiempo entre clases consecutivas para comprar snacks o café.</text>
        </g>

        <g transform="translate(40, 420)">
          <circle cx="16" cy="16" r="14" fill="${C.rose}" opacity="0.15"/>
          <text x="16" y="21" ${font} font-size="14" font-weight="900" fill="${C.rose}" text-anchor="middle">3</text>
          <text x="45" y="18" ${fontDisplay} font-size="18" font-weight="800" fill="${C.plum}">Cocineros Clave de Icesi</text>
          <text x="45" y="42" ${font} font-size="14" fill="${C.textMuted}">Emprendedores con reputación existente migrados a la plataforma.</text>
        </g>
      </g>

      <!-- Pilar 2 -->
      <g transform="translate(585, 0)">
        <rect width="545" height="690" rx="28" fill="${C.white}" stroke="${C.border}" stroke-width="2"/>
        <rect x="40" y="40" width="130" height="34" rx="17" fill="${C.rose}"/>
        <text x="105" y="62" ${fontMono} font-size="12" font-weight="700" fill="${C.white}" text-anchor="middle">PILAR 02</text>
        
        <text x="40" y="125" ${fontDisplay} font-size="28" font-weight="900" fill="${C.plum}">Canales Orgánicos</text>
        <text x="40" y="160" ${font} font-size="16" fill="${C.textMuted}">Costo de Adquisición (CAC) = $0 COP.</text>

        <g transform="translate(40, 200)">
          <circle cx="16" cy="16" r="14" fill="${C.rose}" opacity="0.15"/>
          <text x="16" y="21" ${font} font-size="14" font-weight="900" fill="${C.rose}" text-anchor="middle">1</text>
          <text x="45" y="18" ${fontDisplay} font-size="18" font-weight="800" fill="${C.plum}">Voz a Voz en Aulas y Grupos</text>
          <text x="45" y="42" ${font} font-size="14" fill="${C.textMuted}">Difusión directa en chats de WhatsApp de semestres y materias específicas.</text>
        </g>

        <g transform="translate(40, 310)">
          <circle cx="16" cy="16" r="14" fill="${C.rose}" opacity="0.15"/>
          <text x="16" y="21" ${font} font-size="14" font-weight="900" fill="${C.rose}" text-anchor="middle">2</text>
          <text x="45" y="18" ${fontDisplay} font-size="18" font-weight="800" fill="${C.plum}">Activación en Plazoletas</text>
          <text x="45" y="42" ${font} font-size="14" fill="${C.textMuted}">Presencia visible durante los 10 minutos de cambio de clase en puntos estratégicos.</text>
        </g>

        <g transform="translate(40, 420)">
          <circle cx="16" cy="16" r="14" fill="${C.rose}" opacity="0.15"/>
          <text x="16" y="21" ${font} font-size="14" font-weight="900" fill="${C.rose}" text-anchor="middle">3</text>
          <text x="45" y="18" ${fontDisplay} font-size="18" font-weight="800" fill="${C.plum}">Efecto Red del Cocinero</text>
          <text x="45" y="42" ${font} font-size="14" fill="${C.textMuted}">El cocinero comparte su link de Bocado porque le multiplica sus ventas sin esfuerzo.</text>
        </g>
      </g>

      <!-- Pilar 3 -->
      <g transform="translate(1170, 0)">
        <rect width="550" height="690" rx="28" fill="${C.plum}"/>
        <rect x="40" y="40" width="130" height="34" rx="17" fill="${C.coral}"/>
        <text x="105" y="62" ${fontMono} font-size="12" font-weight="700" fill="${C.plum}" text-anchor="middle">PILAR 03</text>
        
        <text x="40" y="125" ${fontDisplay} font-size="28" font-weight="900" fill="${C.white}">Tácticas de Conversión</text>
        <text x="40" y="160" ${font} font-size="16" fill="#D4C5D0">Incentivos directos al consumo inmediato.</text>

        <g transform="translate(40, 200)">
          <circle cx="16" cy="16" r="14" fill="rgba(255,255,255,0.15)"/>
          <text x="16" y="21" ${font} font-size="14" font-weight="900" fill="${C.coral}" text-anchor="middle">1</text>
          <text x="45" y="18" ${fontDisplay} font-size="18" font-weight="800" fill="${C.white}">Preventas de Receso</text>
          <text x="45" y="42" ${font} font-size="14" fill="#D4C5D0">Reserva tu snack antes de las clases de la tarde para asegurar disponibilidad.</text>
        </g>

        <g transform="translate(40, 310)">
          <circle cx="16" cy="16" r="14" fill="rgba(255,255,255,0.15)"/>
          <text x="16" y="21" ${font} font-size="14" font-weight="900" fill="${C.coral}" text-anchor="middle">2</text>
          <text x="45" y="18" ${fontDisplay} font-size="18" font-weight="800" fill="${C.white}">Micro-Tarifas Amigables</text>
          <text x="45" y="42" ${font} font-size="14" fill="#D4C5D0">$100 a $500 COP por entrega. Costo despreciable para el estudiante.</text>
        </g>

        <g transform="translate(40, 420)">
          <circle cx="16" cy="16" r="14" fill="rgba(255,255,255,0.15)"/>
          <text x="16" y="21" ${font} font-size="14" font-weight="900" fill="${C.coral}" text-anchor="middle">3</text>
          <text x="45" y="18" ${fontDisplay} font-size="18" font-weight="800" fill="${C.white}">Entrega Garantizada en Mano</text>
          <text x="45" y="42" ${font} font-size="14" fill="#D4C5D0">Comodidad absoluta sin interrumpir el ritmo académico.</text>
        </g>
      </g>
    </g>

    ${slideFooter(5)}
  `
}

// SLIDE 6: EVIDENCIA REAL DE VENTA (20%)
function slide6() {
  return `
    <rect width="1920" height="1080" fill="${C.cream}"/>
    ${slideHeader(6, 'Tracción Comercial', '20% de la Nota', 'Evidencia Real de Venta o Intento de Pago', 'Comprobantes de pedidos, transacciones Nequi/Wompi y disposición a pagar demostrada.')}

    <g transform="translate(100, 270)">
      <!-- Left: Metrics Column -->
      <g transform="translate(0, 0)">
        <rect width="480" height="690" rx="28" fill="${C.white}" stroke="${C.border}" stroke-width="2"/>
        <text x="40" y="55" ${fontDisplay} font-size="24" font-weight="900" fill="${C.plum}">Tracción Validada</text>
        
        <g transform="translate(40, 90)">
          <rect width="400" height="120" rx="18" fill="${C.cream}"/>
          <text x="24" y="36" ${fontMono} font-size="12" font-weight="700" fill="${C.rose}">TICKET PROMEDIO</text>
          <text x="24" y="80" ${fontDisplay} font-size="38" font-weight="900" fill="${C.plum}">$4.500 COP</text>
          <text x="24" y="105" ${font} font-size="13" fill="${C.textMuted}">Por snack artesanal consumido</text>
        </g>

        <g transform="translate(40, 230)">
          <rect width="400" height="120" rx="18" fill="${C.cream}"/>
          <text x="24" y="36" ${fontMono} font-size="12" font-weight="700" fill="${C.rose}">MÉTODOS DE PAGO</text>
          <text x="24" y="80" ${fontDisplay} font-size="28" font-weight="900" fill="${C.plum}">Nequi / Wompi / Cash</text>
          <text x="24" y="105" ${font} font-size="13" fill="${C.textMuted}">Pasarela integrada y pago en mano</text>
        </g>

        <g transform="translate(40, 370)">
          <rect width="400" height="120" rx="18" fill="${C.plum}"/>
          <text x="24" y="36" ${fontMono} font-size="12" font-weight="700" fill="${C.coral}">TASA DE ÉXITO</text>
          <text x="24" y="80" ${fontDisplay} font-size="38" font-weight="900" fill="${C.white}">100%</text>
          <text x="24" y="105" ${font} font-size="13" fill="#D4C5D0">Pedidos entregados sin incidentes</text>
        </g>

        <rect x="40" y="520" width="400" height="130" rx="18" fill="${C.grayBg}"/>
        <text x="60" y="555" ${fontMono} font-size="12" font-weight="700" fill="${C.plum}">CONCLUSIÓN COMERCIAL</text>
        <text x="60" y="585" ${font} font-size="15" font-weight="600" fill="${C.plum}">Se demostró intención de compra</text>
        <text x="60" y="610" ${font} font-size="15" font-weight="600" fill="${C.plum}">explícita con dinero real en campus.</text>
      </g>

      <!-- Right: Large Evidence Placeholder Frame -->
      <g transform="translate(520, 0)">
        <rect width="1200" height="690" rx="28" fill="${C.white}" stroke="${C.rose}" stroke-width="3" stroke-dasharray="12 12"/>
        
        <g transform="translate(600, 270)">
          <circle cx="0" cy="0" r="44" fill="${C.rose}" opacity="0.12"/>
          <text x="0" y="12" ${font} font-size="34" font-weight="900" fill="${C.rose}" text-anchor="middle">🧾</text>
          
          <text x="0" y="75" ${fontDisplay} font-size="24" font-weight="900" fill="${C.plum}" text-anchor="middle">
            [ESPACIO PARA EVIDENCIA: COMPROBANTES DE PAGO Y TRANSACCIONES REALES]
          </text>
          <text x="0" y="115" ${font} font-size="16" fill="${C.textMuted}" text-anchor="middle">
            Pega aquí capturas de pantalla de transferencias Nequi recibidas, registros de Wompi
          </text>
          <text x="0" y="145" ${font} font-size="16" fill="${C.textMuted}" text-anchor="middle">
            o el registro de pedidos completados en la consola de la plataforma.
          </text>
          <text x="0" y="195" ${fontMono} font-size="13" font-weight="700" fill="${C.rose}" text-anchor="middle">
            (Pega la imagen de Nequi directamente sobre este marco en Figma)
          </text>
        </g>
      </g>
    </g>

    ${slideFooter(6)}
  `
}

// SLIDE 7: VALIDACION DE PERFIL DE CLIENTE (20%)
function slide7() {
  return `
    <rect width="1920" height="1080" fill="${C.cream}"/>
    ${slideHeader(7, 'Match de Mercado', '20% de la Nota', 'Validación del Perfil del Cliente en Campus Icesi', 'Verificación rigurosa de que los compradores corresponden al arquetipo estudiantil planteado.')}

    <g transform="translate(100, 270)">
      <!-- Left: Profile Checklist -->
      <g transform="translate(0, 0)">
        <rect width="520" height="690" rx="28" fill="${C.white}" stroke="${C.border}" stroke-width="2"/>
        <text x="40" y="55" ${fontDisplay} font-size="24" font-weight="900" fill="${C.plum}">Arquetipo de Usuario</text>
        <text x="40" y="85" ${font} font-size="15" fill="${C.textMuted}">Criterios de correspondencia verificados.</text>

        <!-- Check 1 -->
        <g transform="translate(40, 120)">
          <rect width="440" height="110" rx="16" fill="${C.cream}"/>
          <text x="24" y="35" ${fontDisplay} font-size="17" font-weight="800" fill="${C.plum}">Comunidad Icesi Activa</text>
          <text x="24" y="60" ${font} font-size="13" fill="${C.textMuted}">100% de las ventas fueron realizadas por estudiantes y profesores matriculados.</text>
        </g>

        <!-- Check 2 -->
        <g transform="translate(40, 250)">
          <rect width="440" height="110" rx="16" fill="${C.cream}"/>
          <text x="24" y="35" ${fontDisplay} font-size="17" font-weight="800" fill="${C.plum}">Ubicaciones Clave del Campus</text>
          <text x="24" y="60" ${font} font-size="13" fill="${C.textMuted}">Entregas registradas en aulas de Edificios D, M, E y puestos de estudio del Boreal.</text>
        </g>

        <!-- Check 3 -->
        <g transform="translate(40, 380)">
          <rect width="440" height="110" rx="16" fill="${C.cream}"/>
          <text x="24" y="35" ${fontDisplay} font-size="17" font-weight="800" fill="${C.plum}">Horarios de Mayor Demanda</text>
          <text x="24" y="60" ${font} font-size="13" fill="${C.textMuted}">Picos validados: 9:30 AM a 10:00 AM (receso mañana) y 3:30 PM a 4:30 PM (tarde).</text>
        </g>

        <!-- Check 4 -->
        <g transform="translate(40, 510)">
          <rect width="440" height="130" rx="16" fill="${C.plum}"/>
          <text x="24" y="35" ${fontDisplay} font-size="17" font-weight="800" fill="${C.coral}">Disposición a Pagar Micro-Tarifa</text>
          <text x="24" y="65" ${font} font-size="13" fill="#D4C5D0">El usuario prefiere pagar $200-$500 COP de delivery antes que interrumpir su jornada académica.</text>
        </g>
      </g>

      <!-- Right: Large Evidence Placeholder Frame -->
      <g transform="translate(560, 0)">
        <rect width="1160" height="690" rx="28" fill="${C.white}" stroke="${C.rose}" stroke-width="3" stroke-dasharray="12 12"/>
        
        <g transform="translate(580, 270)">
          <circle cx="0" cy="0" r="44" fill="${C.rose}" opacity="0.12"/>
          <text x="0" y="12" ${font} font-size="34" font-weight="900" fill="${C.rose}" text-anchor="middle">💬</text>
          
          <text x="0" y="75" ${fontDisplay} font-size="24" font-weight="900" fill="${C.plum}" text-anchor="middle">
            [ESPACIO PARA EVIDENCIA: FOTOS Y CHATS DE CLIENTES REALES ICESI]
          </text>
          <text x="0" y="115" ${font} font-size="16" fill="${C.textMuted}" text-anchor="middle">
            Pega aquí capturas de chats de coordinación en WhatsApp con compradores,
          </text>
          <text x="0" y="145" ${font} font-size="16" fill="${C.textMuted}" text-anchor="middle">
            testimonios de satisfacción o fotografías tomadas durante la entrega en el salón.
          </text>
          <text x="0" y="195" ${fontMono} font-size="13" font-weight="700" fill="${C.rose}" text-anchor="middle">
            (Pega tu testimonio o foto del comprador directamente aquí)
          </text>
        </g>
      </g>
    </g>

    ${slideFooter(7)}
  `
}

// SLIDE 8: MODELO ECONOMICO & UNIT ECONOMICS (25%)
function slide8() {
  return `
    <rect width="1920" height="1080" fill="${C.cream}"/>
    ${slideHeader(8, 'Unit Economics', '25% de la Nota', 'Modelo Económico y Sostenibilidad Financiera', 'Desglose transparente de 1 pedido promedio ($4.500 COP) y distribución de márgenes.')}

    <g transform="translate(100, 270)">
      <!-- Main Economics Breakdown Table -->
      <rect width="1720" height="420" rx="28" fill="${C.white}" stroke="${C.border}" stroke-width="2"/>
      
      <!-- Table Header -->
      <g transform="translate(60, 40)">
        <rect width="1600" height="50" rx="14" fill="${C.cream}"/>
        <text x="40" y="32" ${fontMono} font-size="14" font-weight="800" fill="${C.textMuted}">ACTOR / CONCEPTO</text>
        <text x="500" y="32" ${fontMono} font-size="14" font-weight="800" fill="${C.textMuted}">VALOR (COP)</text>
        <text x="850" y="32" ${fontMono} font-size="14" font-weight="800" fill="${C.textMuted}">% DEL TOTAL</text>
        <text x="1150" y="32" ${fontMono} font-size="14" font-weight="800" fill="${C.textMuted}">JUSTIFICACIÓN & ROL</text>
      </g>

      <!-- Row 1: Cocinero -->
      <g transform="translate(60, 115)">
        <text x="40" y="38" ${fontDisplay} font-size="22" font-weight="900" fill="${C.plum}">Estudiante Cocinero</text>
        <text x="40" y="60" ${font} font-size="14" fill="${C.textMuted}">Precio del snack (brownie, galleta, wrap)</text>
        <text x="500" y="45" ${fontDisplay} font-size="26" font-weight="900" fill="${C.rose}">$4.500 COP</text>
        <text x="850" y="45" ${fontMono} font-size="20" font-weight="800" fill="${C.plum}">93.3%</text>
        <text x="1150" y="35" ${font} font-size="15" font-weight="600" fill="${C.plum}">Ingreso directo para el emprendedor.</text>
        <text x="1150" y="58" ${font} font-size="14" fill="${C.textMuted}">Cero costo fijo; solo produce bajo demanda o stock fijo.</text>
        <line x1="0" y1="80" x2="1600" y2="80" stroke="${C.border}" stroke-width="1"/>
      </g>

      <!-- Row 2: Domiciliario -->
      <g transform="translate(60, 215)">
        <text x="40" y="38" ${fontDisplay} font-size="22" font-weight="900" fill="${C.plum}">Estudiante Domiciliario</text>
        <text x="40" y="60" ${font} font-size="14" fill="${C.textMuted}">Tarifa micro-escalada por distancia intra-campus</text>
        <text x="500" y="45" ${fontDisplay} font-size="26" font-weight="900" fill="${C.rose}">$200 COP</text>
        <text x="850" y="45" ${fontMono} font-size="20" font-weight="800" fill="${C.plum}">100% Tarifa</text>
        <text x="1150" y="35" ${font} font-size="15" font-weight="600" fill="${C.plum}">Incentivo por caminata de 3 a 5 min.</text>
        <text x="1150" y="58" ${font} font-size="14" fill="${C.textMuted}">Rango entre $100 y $500 COP según distancia entre bloques.</text>
        <line x1="0" y1="80" x2="1600" y2="80" stroke="${C.border}" stroke-width="1"/>
      </g>

      <!-- Row 3: Plataforma Bocado -->
      <g transform="translate(60, 315)">
        <text x="40" y="38" ${fontDisplay} font-size="22" font-weight="900" fill="${C.plum}">Plataforma Bocado</text>
        <text x="40" y="60" ${font} font-size="14" fill="${C.textMuted}">Comisión operativa por intermediación digital</text>
        <text x="500" y="45" ${fontDisplay} font-size="26" font-weight="900" fill="${C.rose}">$300 COP</text>
        <text x="850" y="45" ${fontMono} font-size="20" font-weight="800" fill="${C.plum}">Margen Bruto</text>
        <text x="1150" y="35" ${font} font-size="15" font-weight="600" fill="${C.plum}">Sostenibilidad del software y pasarela.</text>
        <text x="1150" y="58" ${font} font-size="14" fill="${C.textMuted}">Cubre servidor en la nube, API Wompi y reinversión táctica.</text>
      </g>

      <!-- Total Bar -->
      <g transform="translate(0, 450)">
        <rect width="1720" height="100" rx="22" fill="${C.plum}"/>
        <text x="60" y="58" ${fontDisplay} font-size="24" font-weight="900" fill="${C.white}">TOTAL PAGADO POR EL COMPRADOR EN ICESI</text>
        <text x="1250" y="62" ${fontDisplay} font-size="44" font-weight="900" fill="${C.coral}">$4.700 COP</text>
        <text x="1560" y="58" ${font} font-size="15" fill="#D4C5D0">Super accesible</text>
      </g>

      <!-- 3 Key Model Highlights -->
      <g transform="translate(0, 580)">
        <rect width="550" height="100" rx="18" fill="${C.white}" stroke="${C.border}" stroke-width="2"/>
        <text x="30" y="40" ${fontMono} font-size="12" font-weight="700" fill="${C.rose}">SIN COSTO DE ENTRADA</text>
        <text x="30" y="68" ${font} font-size="15" font-weight="600" fill="${C.plum}">El cocinero no paga nada por listar sus productos.</text>
      </g>

      <g transform="translate(585, 580)">
        <rect width="550" height="100" rx="18" fill="${C.white}" stroke="${C.border}" stroke-width="2"/>
        <text x="30" y="40" ${fontMono} font-size="12" font-weight="700" fill="${C.rose}">LIQUIDEZ INMEDIATA</text>
        <text x="30" y="68" ${font} font-size="15" font-weight="600" fill="${C.plum}">El domiciliario cobra su carrera en el acto.</text>
      </g>

      <g transform="translate(1170, 580)">
        <rect width="550" height="100" rx="18" fill="${C.white}" stroke="${C.border}" stroke-width="2"/>
        <text x="30" y="40" ${fontMono} font-size="12" font-weight="700" fill="${C.rose}">ESCALABILIDAD HORIZONTAL</text>
        <text x="30" y="68" ${font} font-size="15" font-weight="600" fill="${C.plum}">Cero Capex permite replicarlo en Javeriana o Univalle.</text>
      </g>
    </g>

    ${slideFooter(8)}
  `
}

// SLIDE 9: GESTION DE RIESGOS (25%)
function slide9() {
  return `
    <rect width="1920" height="1080" fill="${C.cream}"/>
    ${slideHeader(9, 'Gestión de Riesgos', '25% de la Nota', 'Identificación Proactiva de Riesgos y Mitigación', 'Estrategias de contingencia validadas para garantizar la continuidad operativa en el campus.')}

    <g transform="translate(100, 270)">
      <!-- Risk 1 -->
      <g transform="translate(0, 0)">
        <rect width="830" height="330" rx="24" fill="${C.white}" stroke="${C.border}" stroke-width="2"/>
        <rect x="40" y="35" width="160" height="30" rx="15" fill="#FEF3C7"/>
        <text x="120" y="55" ${fontMono} font-size="11" font-weight="700" fill="#B45309" text-anchor="middle">IMPACTO: ALTO / FRECUENTE</text>
        
        <text x="40" y="105" ${fontDisplay} font-size="24" font-weight="900" fill="${C.plum}">Fluctuación de Demanda por Horarios</text>
        <text x="40" y="135" ${font} font-size="15" fill="${C.textMuted}">La demanda se concentra en los 10 minutos de cambio de materia.</text>

        <rect x="40" y="175" width="750" height="115" rx="16" fill="${C.cream}"/>
        <text x="65" y="210" ${fontMono} font-size="12" font-weight="800" fill="${C.rose}">ESTRATEGIA DE MITIGACIÓN:</text>
        <text x="65" y="240" ${font} font-size="15" font-weight="600" fill="${C.plum}">Sistema de Preventa y Apartado de Stock antes del receso.</text>
        <text x="65" y="265" ${font} font-size="14" fill="${C.textMuted}">El cocinero sabe con 30 minutos de antelación qué pedidos debe preparar.</text>
      </g>

      <!-- Risk 2 -->
      <g transform="translate(890, 0)">
        <rect width="830" height="330" rx="24" fill="${C.white}" stroke="${C.border}" stroke-width="2"/>
        <rect x="40" y="35" width="160" height="30" rx="15" fill="#FEE2E2"/>
        <text x="120" y="55" ${fontMono} font-size="11" font-weight="700" fill="#B91C1C" text-anchor="middle">IMPACTO: MEDIO / CRÍTICO</text>
        
        <text x="40" y="105" ${fontDisplay} font-size="24" font-weight="900" fill="${C.plum}">Escasez de Domiciliarios en Horas Pico</text>
        <text x="40" y="135" ${font} font-size="15" fill="${C.textMuted}">Coincidencia de horarios de clase que limite la disponibilidad de caminantes.</text>

        <rect x="40" y="175" width="750" height="115" rx="16" fill="${C.cream}"/>
        <text x="65" y="210" ${fontMono} font-size="12" font-weight="800" fill="${C.rose}">ESTRATEGIA DE MITIGACIÓN:</text>
        <text x="65" y="240" ${font} font-size="15" font-weight="600" fill="${C.plum}">Tarifas Dinámicas por Distancia ($100 a $500 COP).</text>
        <text x="65" y="265" ${font} font-size="14" fill="${C.textMuted}">Incentivo extra inmediato para compañeros que ya se desplazan por esa ruta.</text>
      </g>

      <!-- Risk 3 -->
      <g transform="translate(0, 360)">
        <rect width="830" height="330" rx="24" fill="${C.white}" stroke="${C.border}" stroke-width="2"/>
        <rect x="40" y="35" width="160" height="30" rx="15" fill="#FEE2E2"/>
        <text x="120" y="55" ${fontMono} font-size="11" font-weight="700" fill="#B91C1C" text-anchor="middle">IMPACTO: BAJO / CRÍTICO</text>
        
        <text x="40" y="105" ${fontDisplay} font-size="24" font-weight="900" fill="${C.plum}">Inocuidad y Calidad de Alimentos</text>
        <text x="40" y="135" ${font} font-size="15" fill="${C.textMuted}">Garantía de frescura e higiene en preparaciones artesanales caseras.</text>

        <rect x="40" y="175" width="750" height="115" rx="16" fill="${C.cream}"/>
        <text x="65" y="210" ${fontMono} font-size="12" font-weight="800" fill="${C.rose}">ESTRATEGIA DE MITIGACIÓN:</text>
        <text x="65" y="240" ${font} font-size="15" font-weight="600" fill="${C.plum}">Perfil Verificado de Cocineros y Fotos Reales.</text>
        <text x="65" y="265" ${font} font-size="14" fill="${C.textMuted}">Control comunitario estricto: reputación visible y retiro inmediato si hay incidentes.</text>
      </g>

      <!-- Risk 4 -->
      <g transform="translate(890, 360)">
        <rect width="830" height="330" rx="24" fill="${C.white}" stroke="${C.border}" stroke-width="2"/>
        <rect x="40" y="35" width="160" height="30" rx="15" fill="#FEF3C7"/>
        <text x="120" y="55" ${fontMono} font-size="11" font-weight="700" fill="#B45309" text-anchor="middle">IMPACTO: BAJO / MODERADO</text>
        
        <text x="40" y="105" ${fontDisplay} font-size="24" font-weight="900" fill="${C.plum}">Incumplimiento en Entrega o Dinero</text>
        <text x="40" y="135" ${font} font-size="15" fill="${C.textMuted}">Falta de confirmación de recibido o malentendidos con el efectivo.</text>

        <rect x="40" y="175" width="750" height="115" rx="16" fill="${C.cream}"/>
        <text x="65" y="210" ${fontMono} font-size="12" font-weight="800" fill="${C.rose}">ESTRATEGIA DE MITIGACIÓN:</text>
        <text x="65" y="240" ${font} font-size="15" font-weight="600" fill="${C.plum}">Protocolo de Triple Confirmación en la Plataforma.</text>
        <text x="65" y="265" ${font} font-size="14" fill="${C.textMuted}">El pedido solo se cierra cuando comprador, repartidor y cocinero validan.</text>
      </g>
    </g>

    ${slideFooter(9)}
  `
}

// SLIDE 10: CIERRE Y PROXIMOS PASOS
function slide10() {
  return `
    <rect width="1920" height="1080" fill="${C.rose}"/>

    <!-- Top Branding -->
    <g transform="translate(120, 90)">
      ${starIcon(0, 0, 44, C.white)}
      <text x="58" y="32" ${fontDisplay} font-size="36" font-weight="900" fill="${C.white}">bocado<tspan fill="${C.plum}"> .</tspan></text>
      <text x="230" y="30" ${fontMono} font-size="15" font-weight="700" fill="${C.white}">UNIVERSIDAD ICESI · INNOVACIÓN 3</text>
    </g>

    <g transform="translate(120, 240)">
      <text x="0" y="80" ${fontDisplay} font-size="88" font-weight="900" fill="${C.white}" letter-spacing="-2">Haz que el campus</text>
      <text x="0" y="175" ${fontDisplay} font-size="88" font-weight="300" fill="none" stroke="${C.white}" stroke-width="2.5" letter-spacing="-2">se mueva.</text>

      <text x="0" y="260" ${font} font-size="24" font-weight="400" fill="rgba(255,255,255,0.95)">
        Bocado demostró que el micro-comercio universitario puede ser ágil, colaborativo y rentable.
      </text>
    </g>

    <!-- 4 Value Delivery Summary Cards -->
    <g transform="translate(120, 560)">
      <g transform="translate(0, 0)">
        <rect width="380" height="260" rx="24" fill="${C.plum}"/>
        <text x="36" y="55" ${fontMono} font-size="14" font-weight="700" fill="${C.coral}">3 ROLES ACTIVOS</text>
        <text x="36" y="105" ${fontDisplay} font-size="32" font-weight="900" fill="${C.white}">Comunidad Viva</text>
        <text x="36" y="145" ${font} font-size="15" fill="#D4C5D0">Compradores, cocineros y domiciliarios conectados en un solo ecosistema.</text>
      </g>

      <g transform="translate(420, 0)">
        <rect width="380" height="260" rx="24" fill="${C.plum}"/>
        <text x="36" y="55" ${fontMono} font-size="14" font-weight="700" fill="${C.coral}">$0 CAPEX</text>
        <text x="36" y="105" ${fontDisplay} font-size="32" font-weight="900" fill="${C.white}">Cero Hardware</text>
        <text x="36" y="145" ${font} font-size="15" fill="#D4C5D0">Infraestructura 100% digital desplegada sobre la nube y accesible desde móvil.</text>
      </g>

      <g transform="translate(840, 0)">
        <rect width="380" height="260" rx="24" fill="${C.plum}"/>
        <text x="36" y="55" ${fontMono} font-size="14" font-weight="700" fill="${C.coral}">PMV EN VIVO</text>
        <text x="36" y="105" ${fontDisplay} font-size="32" font-weight="900" fill="${C.white}">100% Operativo</text>
        <text x="36" y="145" ${font} font-size="15" fill="#D4C5D0">Catálogo, checkout, pedidos y métricas funcionando en producción real.</text>
      </g>

      <g transform="translate(1260, 0)">
        <rect width="380" height="260" rx="24" fill="${C.white}"/>
        <text x="36" y="55" ${fontMono} font-size="14" font-weight="700" fill="${C.rose}">TRACCIÓN ICESI</text>
        <text x="36" y="105" ${fontDisplay} font-size="32" font-weight="900" fill="${C.plum}">Ventas Reales</text>
        <text x="36" y="145" ${font} font-size="15" fill="${C.textMuted}">Validación con pagos y entregas completadas en aulas del campus.</text>
      </g>
    </g>

    <!-- Bottom Question & Final Link -->
    <g transform="translate(120, 920)">
      <text x="0" y="40" ${fontDisplay} font-size="28" font-weight="800" fill="${C.white}">¿Preguntas o comentarios de la Junta Directiva?</text>
      
      <rect x="1350" y="0" width="330" height="60" rx="30" fill="${C.plum}"/>
      <text x="1515" y="37" ${fontDisplay} font-size="16" font-weight="800" fill="${C.white}" text-anchor="middle">bocado-gamma.vercel.app ↗</text>
    </g>

    ${slideFooter(10, true)}
  `
}

// Wrapper for standalone SVG
function wrapSvg(content) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1920" height="1080" viewBox="0 0 1920 1080" fill="none" xmlns="http://www.w3.org/2000/svg">
${content}
</svg>`
}

const slides = [
  { name: 'slide_01_portada.svg', fn: slide1 },
  { name: 'slide_02_contexto_problema.svg', fn: slide2 },
  { name: 'slide_03_pmv_entrega_valor_30pct.svg', fn: slide3 },
  { name: 'slide_04_evolucion_aprendizajes_30pct.svg', fn: slide4 },
  { name: 'slide_05_estrategia_gtm_15pct.svg', fn: slide5 },
  { name: 'slide_06_evidencia_venta_20pct.svg', fn: slide6 },
  { name: 'slide_07_validacion_perfil_20pct.svg', fn: slide7 },
  { name: 'slide_08_modelo_economico_25pct.svg', fn: slide8 },
  { name: 'slide_09_gestion_riesgos_25pct.svg', fn: slide9 },
  { name: 'slide_10_cierre_proximos_pasos.svg', fn: slide10 },
]

console.log('Generating Figma slide SVG files...')

// 1. Generate individual SVG files (ready to drag directly into Figma)
slides.forEach((s, idx) => {
  const filePath = path.join(outDir, s.name)
  fs.writeFileSync(filePath, wrapSvg(s.fn()), 'utf-8')
  console.log(`✓ Created: ${s.name}`)
})

// 2. Generate Combined Master Canvas (All 10 slides laid out in a 5x2 grid)
// Dimensions: 5 cols x (1920 + 120 gap) = 10,080 px width; 2 rows x (1080 + 120 gap) = 2,280 px height
const gap = 120
const masterWidth = 5 * 1920 + 4 * gap
const masterHeight = 2 * 1080 + gap

let masterContent = ''
slides.forEach((s, idx) => {
  const col = idx % 5
  const row = Math.floor(idx / 5)
  const x = col * (1920 + gap)
  const y = row * (1080 + gap)

  masterContent += `
    <g transform="translate(${x}, ${y})" id="Slide_${idx + 1}">
      ${s.fn()}
    </g>
  `
})

const masterSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${masterWidth}" height="${masterHeight}" viewBox="0 0 ${masterWidth} ${masterHeight}" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="${masterWidth}" height="${masterHeight}" fill="#E8DFDC"/>
  ${masterContent}
</svg>`

fs.writeFileSync(path.join(outDir, 'PRESENTACION_COMPLETA_10_SLIDES.svg'), masterSvg, 'utf-8')
console.log('✓ Created Master Deck: PRESENTACION_COMPLETA_10_SLIDES.svg')
console.log('Done! All Figma slide SVGs are ready in presentation_figma/')
