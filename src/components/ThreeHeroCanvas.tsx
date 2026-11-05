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
      42,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    )
    camera.position.set(0, 0, 7.8)

    // Renderer (Matte, transparent background)
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    })
    renderer.setSize(container.clientWidth, container.clientHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.15
    container.appendChild(renderer.domElement)

    // Lighting (Warm bakery studio lighting)
    const ambientLight = new THREE.AmbientLight(0xfff5ea, 1.3)
    scene.add(ambientLight)

    const keyLight = new THREE.DirectionalLight(0xfff0db, 2.4)
    keyLight.position.set(5, 7, 6)
    scene.add(keyLight)

    const rimLight = new THREE.DirectionalLight(0xd94668, 1.2)
    rimLight.position.set(-5, -4, -3)
    scene.add(rimLight)

    const bottomFill = new THREE.DirectionalLight(0xfef3c7, 0.8)
    bottomFill.position.set(0, -6, 4)
    scene.add(bottomFill)

    // Cookie Group
    const cookieGroup = new THREE.Group()

    // 1. Procedural 3D Cookie Dough
    const cookieGeo = new THREE.CylinderGeometry(2.1, 1.95, 0.65, 48, 8)
    
    // Deform vertices for an organic, freshly-baked, slightly uneven rim and surface
    const pos = cookieGeo.attributes.position
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i)
      const y = pos.getY(i)
      const z = pos.getZ(i)
      const distFromCenter = Math.sqrt(x * x + z * z)

      // Surface bumpiness
      const surfaceBump =
        Math.sin(x * 4.2) * Math.cos(z * 4.2) * 0.04 +
        Math.sin(x * 8.5 + z * 8.5) * 0.02

      // Rim waviness (crispy, rustic artisanal edge)
      const angle = Math.atan2(z, x)
      const rimWaviness = distFromCenter > 1.4 ? Math.sin(angle * 9) * 0.08 + Math.cos(angle * 13) * 0.04 : 0

      pos.setY(i, y + surfaceBump)
      if (distFromCenter > 1.2) {
        pos.setX(i, x + rimWaviness * (x / distFromCenter))
        pos.setZ(i, z + rimWaviness * (z / distFromCenter))
      }
    }
    cookieGeo.computeVertexNormals()

    // Baked golden cookie dough material (matte, warm, appetizing)
    const cookieMat = new THREE.MeshStandardMaterial({
      color: 0xd69956, // Golden baked dough
      roughness: 0.82,
      metalness: 0.04,
      flatShading: false,
    })

    const cookieMesh = new THREE.Mesh(cookieGeo, cookieMat)
    cookieGroup.add(cookieMesh)

    // 2. Realistic 3D Chocolate Chips (Chispas de Chocolate)
    const chipGeo = new THREE.DodecahedronGeometry(0.28, 1)
    chipGeo.scale(1, 0.6, 1)

    const chipMat = new THREE.MeshStandardMaterial({
      color: 0x221108, // Dark roasted cocoa
      roughness: 0.38, // Satin finish for chocolate
      metalness: 0.12,
    })

    // Coordinates scattered naturally over the top face
    const chipPositions = [
      { x: 0.2, z: 0.1, s: 1.15, r: 0.4 },
      { x: -0.65, z: 0.55, s: 0.95, r: 1.2 },
      { x: 0.85, z: -0.45, s: 1.1, r: 2.1 },
      { x: -0.8, z: -0.6, s: 1.05, r: 0.8 },
      { x: 0.6, z: 0.85, s: 0.9, r: 3.1 },
      { x: -0.15, z: -1.05, s: 1.0, r: 1.7 },
      { x: -1.1, z: 0.1, s: 0.85, r: 2.5 },
      { x: 1.15, z: 0.2, s: 1.0, r: 0.2 },
      { x: 0.0, z: 1.15, s: 0.9, r: 1.9 },
      { x: -0.4, z: -0.15, s: 1.2, r: 2.8 },
      { x: 0.45, z: -0.9, s: 0.85, r: 0.9 },
      { x: 1.05, z: -0.95, s: 0.75, r: 1.4 },
      { x: -0.95, z: 0.9, s: 0.8, r: 2.2 },
    ]

    chipPositions.forEach((cp) => {
      const chip = new THREE.Mesh(chipGeo, chipMat)
      chip.position.set(cp.x, 0.33, cp.z)
      chip.scale.set(cp.s, cp.s * 0.9, cp.s)
      chip.rotation.set(0.2, cp.r, -0.15)
      cookieGroup.add(chip)
    })

    // Tilt cookie to show its delicious chocolate chips
    cookieGroup.rotation.x = 0.55
    cookieGroup.rotation.z = -0.25
    scene.add(cookieGroup)

    // 3. Floating Cocoa/Sugar Crumb Particles
    const particleCount = 28
    const particlePositions = new Float32Array(particleCount * 3)
    for (let i = 0; i < particleCount; i++) {
      particlePositions[i * 3] = (Math.random() - 0.5) * 8
      particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 6
      particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 4
    }

    const particleGeometry = new THREE.BufferGeometry()
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3))

    const particleMaterial = new THREE.PointsMaterial({
      color: 0xe27d95,
      size: 0.06,
      transparent: true,
      opacity: 0.55,
    })

    const particles = new THREE.Points(particleGeometry, particleMaterial)
    scene.add(particles)

    // GSAP Interactive Mouse Tracking
    const mouse = { x: 0, y: 0 }
    const handleMouseMove = (event: MouseEvent) => {
      const rect = container.getBoundingClientRect()
      const x = ((event.clientX - rect.left) / rect.width) * 2 - 1
      const y = -(((event.clientY - rect.top) / rect.height) * 2 - 1)

      gsap.to(mouse, {
        x,
        y,
        duration: 1.0,
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
    let clock = new THREE.Clock()

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate)
      const elapsedTime = clock.getElapsedTime()

      // Smooth organic rotation and floating bobbing
      cookieGroup.rotation.y = elapsedTime * 0.45 + mouse.x * 0.4
      cookieGroup.rotation.x = 0.55 + Math.sin(elapsedTime * 1.2) * 0.08 - mouse.y * 0.35
      cookieGroup.position.y = Math.sin(elapsedTime * 1.5) * 0.12

      // Subtle particle float
      particles.rotation.y = elapsedTime * 0.08

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
      particleGeometry.dispose()
      particleMaterial.dispose()
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className="w-full h-full min-h-[340px] sm:min-h-[420px] lg:min-h-[480px] cursor-grab active:cursor-grabbing flex items-center justify-center relative z-10"
      title="3D Galleta Bocado interactiva hecha a mano"
    />
  )
}
