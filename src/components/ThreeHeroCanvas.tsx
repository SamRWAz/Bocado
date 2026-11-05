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
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    )
    camera.position.set(0, 0, 11)

    // Renderer (Matte, transparent, no neon)
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    })
    renderer.setSize(container.clientWidth, container.clientHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.1
    container.appendChild(renderer.domElement)

    // Lighting (Warm artisanal bakery lighting)
    const ambientLight = new THREE.AmbientLight(0xfffbf5, 1.4)
    scene.add(ambientLight)

    const keyLight = new THREE.DirectionalLight(0xfff1e0, 2.2)
    keyLight.position.set(6, 8, 8)
    scene.add(keyLight)

    const rimLight = new THREE.DirectionalLight(0xb45309, 1.0)
    rimLight.position.set(-6, -4, -3)
    scene.add(rimLight)

    // Organic Sculptural Geometry (Fluid artisan torus knot - like braided dough / cocoa pretzel)
    const geometry = new THREE.TorusKnotGeometry(2.3, 0.72, 128, 32, 2, 3)
    
    // Matte warm terracotta / baked porcelain finish (ZERO neon, zero plastic gloss)
    const material = new THREE.MeshStandardMaterial({
      color: 0x8f1414,
      roughness: 0.65,
      metalness: 0.08,
      flatShading: false,
    })

    const mesh = new THREE.Mesh(geometry, material)
    mesh.scale.set(0.9, 0.9, 0.9)
    scene.add(mesh)

    // Ambient Floating Cocoa / Flour particles
    const particleCount = 45
    const particlePositions = new Float32Array(particleCount * 3)
    for (let i = 0; i < particleCount; i++) {
      particlePositions[i * 3] = (Math.random() - 0.5) * 16
      particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 10
      particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 8
    }

    const particleGeometry = new THREE.BufferGeometry()
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3))

    const particleMaterial = new THREE.PointsMaterial({
      color: 0xd97706,
      size: 0.08,
      transparent: true,
      opacity: 0.45,
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
        duration: 1.2,
        ease: 'power2.out',
      })
    }

    window.addEventListener('mousemove', handleMouseMove)

    // Animation Loop
    let animationFrameId: number
    const clock = new THREE.Clock()

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate)
      const t = clock.getElapsedTime()

      // Fluid continuous organic rotation
      mesh.rotation.y = t * 0.35 + mouse.x * 0.6
      mesh.rotation.x = Math.sin(t * 0.25) * 0.3 + mouse.y * 0.5
      mesh.rotation.z = Math.cos(t * 0.2) * 0.15

      // Fluid wave oscillation
      mesh.position.y = Math.sin(t * 0.8) * 0.15 + mouse.y * 0.4
      mesh.position.x = mouse.x * 0.5

      // Particle subtle drift
      particles.rotation.y = t * 0.05

      renderer.render(scene, camera)
    }

    animate()

    // Handle Resize
    const handleResize = () => {
      if (!container) return
      camera.aspect = container.clientWidth / container.clientHeight
      camera.updateProjectionMatrix()
      renderer.setSize(container.clientWidth, container.clientHeight)
    }

    window.addEventListener('resize', handleResize)

    return () => {
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('resize', handleResize)
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement)
      }
      geometry.dispose()
      material.dispose()
      particleGeometry.dispose()
      particleMaterial.dispose()
      renderer.dispose()
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none z-0 overflow-hidden opacity-90"
      aria-hidden="true"
    />
  )
}
