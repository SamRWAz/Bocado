import { useEffect, useRef } from 'react'
import * as THREE from 'three'

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
    camera.position.z = 18

    // Renderer
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
    renderer.setSize(container.clientWidth, container.clientHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    container.appendChild(renderer.domElement)

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9)
    scene.add(ambientLight)

    const pointLight = new THREE.PointLight(0xfef3c7, 2.5, 50)
    pointLight.position.set(5, 5, 10)
    scene.add(pointLight)

    const rimLight = new THREE.DirectionalLight(0xd97706, 1.8)
    rimLight.position.set(-5, -5, 5)
    scene.add(rimLight)

    // Central Floating Mesh (Modern geometric badge)
    const centralGroup = new THREE.Group()

    const icosaGeometry = new THREE.IcosahedronGeometry(3.2, 1)
    const icosaMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.15,
      metalness: 0.25,
      wireframe: true,
      transparent: true,
      opacity: 0.35,
    })
    const icosaMesh = new THREE.Mesh(icosaGeometry, icosaMaterial)
    centralGroup.add(icosaMesh)

    const coreGeometry = new THREE.OctahedronGeometry(2, 0)
    const coreMaterial = new THREE.MeshStandardMaterial({
      color: 0xfbbf24,
      roughness: 0.2,
      metalness: 0.8,
    })
    const coreMesh = new THREE.Mesh(coreGeometry, coreMaterial)
    centralGroup.add(coreMesh)

    scene.add(centralGroup)

    // Floating particles around the hero
    const particleCount = 75
    const positions = new Float32Array(particleCount * 3)
    const colors = new Float32Array(particleCount * 3)

    const baseColor = new THREE.Color(0xfde68a)
    const whiteColor = new THREE.Color(0xffffff)

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 30
      positions[i * 3 + 1] = (Math.random() - 0.5) * 20
      positions[i * 3 + 2] = (Math.random() - 0.5) * 15

      const c = Math.random() > 0.5 ? baseColor : whiteColor
      colors[i * 3] = c.r
      colors[i * 3 + 1] = c.g
      colors[i * 3 + 2] = c.b
    }

    const particleGeometry = new THREE.BufferGeometry()
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))

    const particleMaterial = new THREE.PointsMaterial({
      size: 0.18,
      vertexColors: true,
      transparent: true,
      opacity: 0.75,
    })
    const particleSystem = new THREE.Points(particleGeometry, particleMaterial)
    scene.add(particleSystem)

    // Mouse movement parallax
    let mouseX = 0
    let mouseY = 0
    let targetX = 0
    let targetY = 0

    const handleMouseMove = (event: MouseEvent) => {
      const rect = container.getBoundingClientRect()
      mouseX = ((event.clientX - rect.left) / rect.width) * 2 - 1
      mouseY = -(((event.clientY - rect.top) / rect.height) * 2 - 1)
    }

    window.addEventListener('mousemove', handleMouseMove)

    // Animation Loop
    let animationFrameId: number
    const clock = new THREE.Clock()

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate)
      const elapsedTime = clock.getElapsedTime()

      // Smooth central rotation
      centralGroup.rotation.y = elapsedTime * 0.45
      centralGroup.rotation.x = Math.sin(elapsedTime * 0.3) * 0.25

      coreMesh.rotation.y = -elapsedTime * 0.6
      coreMesh.rotation.z = Math.cos(elapsedTime * 0.4) * 0.3

      // Float particles
      particleSystem.rotation.y = elapsedTime * 0.08
      particleSystem.rotation.x = Math.sin(elapsedTime * 0.05) * 0.1

      // Mouse Parallax easing
      targetX += (mouseX - targetX) * 0.04
      targetY += (mouseY - targetY) * 0.04

      centralGroup.position.x = targetX * 1.5
      centralGroup.position.y = targetY * 1.2

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
      geometryDispose(scene)
      renderer.dispose()
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none z-0 overflow-hidden opacity-70"
      aria-hidden="true"
    />
  )
}

function geometryDispose(obj: THREE.Object3D | THREE.Scene) {
  obj.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      child.geometry.dispose()
      if (Array.isArray(child.material)) {
        child.material.forEach((m) => m.dispose())
      } else if (child.material) {
        child.material.dispose()
      }
    }
  })
}
