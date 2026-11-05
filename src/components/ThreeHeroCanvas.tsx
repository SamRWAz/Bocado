import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import gsap from 'gsap'

export function ThreeHeroCanvas() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // Scene & Camera
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(
      40,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    )
    camera.position.set(0, 0, 7.5)

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    })
    renderer.setSize(container.clientWidth, container.clientHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.25
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    container.appendChild(renderer.domElement)

    // Studio Lighting
    const ambientLight = new THREE.AmbientLight(0xfff6ed, 1.4)
    scene.add(ambientLight)

    const keyLight = new THREE.DirectionalLight(0xffeed9, 2.8)
    keyLight.position.set(5, 7, 6)
    keyLight.castShadow = true
    scene.add(keyLight)

    const rimLight = new THREE.DirectionalLight(0xd94668, 1.3)
    rimLight.position.set(-6, -3, -4)
    scene.add(rimLight)

    const topSpecular = new THREE.DirectionalLight(0xffffff, 1.0)
    topSpecular.position.set(0, 8, 3)
    scene.add(topSpecular)

    // Cookie Master Group
    const cookieGroup = new THREE.Group()

    // 1. Procedural 3D Cookie Dough with Vertex Color Baking Gradient
    const cookieGeo = new THREE.CylinderGeometry(2.35, 2.2, 0.72, 64, 14)
    const pos = cookieGeo.attributes.position
    const colors: number[] = []

    // Baked color palette (center dough to toasted rim)
    const colorCenter = new THREE.Color(0xdfa460) // golden baked dough
    const colorRim = new THREE.Color(0xb86e2d) // toasted crust edge
    const colorCrevice = new THREE.Color(0x99561e) // deep oven baked crevices

    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i)
      const y = pos.getY(i)
      const z = pos.getZ(i)
      const distFromCenter = Math.sqrt(x * x + z * z)
      const angle = Math.atan2(z, x)

      // Organic artisanal cracks and surface undulation
      const crackNoise =
        Math.sin(x * 5.2) * Math.cos(z * 5.2) * 0.06 +
        Math.sin(x * 11.0 + z * 8.0) * 0.025 +
        Math.cos(x * 3.1 - z * 3.1) * 0.03

      // Rustic, slightly wavy, thick bakery rim
      const rimDisplacement =
        distFromCenter > 1.3
          ? Math.sin(angle * 7) * 0.08 + Math.cos(angle * 13) * 0.05
          : 0

      // Natural cookie dome curvature (slightly thicker in the center)
      const domeCurve = (1.0 - Math.min(distFromCenter / 2.3, 1.0)) * 0.15

      const newY = y > 0 ? y + domeCurve + crackNoise : y - crackNoise * 0.5
      pos.setY(i, newY)

      if (distFromCenter > 1.0) {
        const factor = (distFromCenter + rimDisplacement) / distFromCenter
        pos.setX(i, x * factor)
        pos.setZ(i, z * factor)
      }

      // Compute vertex color based on depth and distance from center
      const tempColor = new THREE.Color()
      const rimRatio = Math.min(distFromCenter / 2.3, 1.0)
      tempColor.lerpColors(colorCenter, colorRim, rimRatio)

      // Darken crevices
      if (crackNoise < -0.02 && y > 0) {
        tempColor.lerp(colorCrevice, 0.45)
      }

      colors.push(tempColor.r, tempColor.g, tempColor.b)
    }

    cookieGeo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))
    cookieGeo.computeVertexNormals()

    const cookieMat = new THREE.MeshStandardMaterial({
      vertexColors: true,
      roughness: 0.85,
      metalness: 0.02,
      flatShading: false,
    })

    const cookieMesh = new THREE.Mesh(cookieGeo, cookieMat)
    cookieMesh.castShadow = true
    cookieMesh.receiveShadow = true
    cookieGroup.add(cookieMesh)

    // 2. Chunky, Tempting Chocolate Chips (Chispas & Chunks de Chocolate)
    const chipGeo = new THREE.DodecahedronGeometry(0.32, 1)
    chipGeo.scale(1, 0.65, 1)

    // Melted rich dark chocolate material
    const chipMat = new THREE.MeshStandardMaterial({
      color: 0x1f0f07, // Deep dark roasted chocolate
      roughness: 0.28, // Satin chocolate sheen
      metalness: 0.12,
    })

    // Natural chocolate chip clusters across the top
    const chipData = [
      { x: 0.25, z: 0.15, s: 1.25, rx: 0.3, rz: 0.2 },
      { x: -0.7, z: 0.6, s: 1.05, rx: 0.1, rz: 0.4 },
      { x: 0.95, z: -0.4, s: 1.15, rx: -0.2, rz: 0.3 },
      { x: -0.85, z: -0.65, s: 1.1, rx: 0.4, rz: -0.1 },
      { x: 0.65, z: 0.9, s: 0.95, rx: 0.2, rz: 0.5 },
      { x: -0.15, z: -1.15, s: 1.05, rx: -0.3, rz: 0.2 },
      { x: -1.2, z: 0.12, s: 0.9, rx: 0.5, rz: 0.1 },
      { x: 1.25, z: 0.25, s: 1.0, rx: 0.1, rz: -0.3 },
      { x: 0.05, z: 1.25, s: 0.95, rx: 0.2, rz: 0.2 },
      { x: -0.45, z: -0.18, s: 1.3, rx: -0.1, rz: 0.3 },
      { x: 0.5, z: -0.95, s: 0.9, rx: 0.3, rz: -0.2 },
      { x: 1.1, z: -1.0, s: 0.8, rx: 0.4, rz: 0.1 },
      { x: -1.0, z: 0.95, s: 0.85, rx: -0.2, rz: 0.4 },
      // Smaller morsels / shavings
      { x: 0.1, z: -0.5, s: 0.55, rx: 0.1, rz: 0.1 },
      { x: -0.3, z: 0.9, s: 0.5, rx: 0.3, rz: -0.2 },
      { x: 0.8, z: 0.3, s: 0.6, rx: -0.1, rz: 0.2 },
    ]

    chipData.forEach((cd) => {
      const chip = new THREE.Mesh(chipGeo, chipMat)
      chip.position.set(cd.x, 0.4, cd.z)
      chip.scale.set(cd.s, cd.s * 0.9, cd.s)
      chip.rotation.set(cd.rx, Math.random() * Math.PI, cd.rz)
      chip.castShadow = true
      cookieGroup.add(chip)
    })

    // Tilt cookie to showcase its golden surface and glossy chocolate
    cookieGroup.rotation.x = 0.52
    cookieGroup.rotation.z = -0.22
    scene.add(cookieGroup)

    // 3. Floating Golden Biscuit Crumbs
    const crumbCount = 35
    const crumbPositions = new Float32Array(crumbCount * 3)
    for (let i = 0; i < crumbCount; i++) {
      crumbPositions[i * 3] = (Math.random() - 0.5) * 8
      crumbPositions[i * 3 + 1] = (Math.random() - 0.5) * 6
      crumbPositions[i * 3 + 2] = (Math.random() - 0.5) * 4
    }

    const crumbGeo = new THREE.BufferGeometry()
    crumbGeo.setAttribute('position', new THREE.BufferAttribute(crumbPositions, 3))

    const crumbMat = new THREE.PointsMaterial({
      color: 0xe28a38,
      size: 0.055,
      transparent: true,
      opacity: 0.6,
    })

    const crumbs = new THREE.Points(crumbGeo, crumbMat)
    scene.add(crumbs)

    // GSAP Interactive Mouse Tracking
    const mouse = { x: 0, y: 0 }
    const handleMouseMove = (event: MouseEvent) => {
      const rect = container.getBoundingClientRect()
      const x = ((event.clientX - rect.left) / rect.width) * 2 - 1
      const y = -(((event.clientY - rect.top) / rect.height) * 2 - 1)

      gsap.to(mouse, {
        x,
        y,
        duration: 1.2,
        ease: 'power2.out',
      })
    }

    window.addEventListener('mousemove', handleMouseMove)

    // Resize Handler
    const handleResize = () => {
      if (!container) return
      camera.aspect = container.clientWidth / container.clientHeight
      camera.updateProjectionMatrix()
      renderer.setSize(container.clientWidth, container.clientHeight)
    }
    window.addEventListener('resize', handleResize)

    // Animation Loop
    let animationFrameId: number
    const clock = new THREE.Clock()

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate)
      const t = clock.getElapsedTime()

      // Smooth floating rotation and gentle organic breathing
      cookieGroup.rotation.y = t * 0.42 + mouse.x * 0.45
      cookieGroup.rotation.x = 0.52 + Math.sin(t * 1.3) * 0.06 - mouse.y * 0.35
      cookieGroup.position.y = Math.sin(t * 1.6) * 0.1

      crumbs.rotation.y = t * 0.07

      renderer.render(scene, camera)
    }

    animate()

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('resize', handleResize)
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement)
      }
      renderer.dispose()
      cookieGeo.dispose()
      cookieMat.dispose()
      chipGeo.dispose()
      chipMat.dispose()
      crumbGeo.dispose()
      crumbMat.dispose()
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className="w-full h-full min-h-[300px] sm:min-h-[420px] lg:min-h-[480px] cursor-grab active:cursor-grabbing flex items-center justify-center relative z-10"
      title="Galleta Bocado 3D interactiva"
    />
  )
}
