import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import gsap from 'gsap'

export function ThreeHeroCanvas() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [loaded, setLoaded] = useState(false)

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
    camera.position.set(0, 0.4, 5.2)

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    })
    renderer.setSize(container.clientWidth, container.clientHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.3
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    container.appendChild(renderer.domElement)

    // Warm Studio PBR Lighting
    const ambientLight = new THREE.AmbientLight(0xfff5ea, 1.6)
    scene.add(ambientLight)

    const keyLight = new THREE.DirectionalLight(0xffeed9, 2.8)
    keyLight.position.set(5, 7, 6)
    keyLight.castShadow = true
    scene.add(keyLight)

    const rimLight = new THREE.DirectionalLight(0xd94668, 1.4)
    rimLight.position.set(-5, -2, -4)
    scene.add(rimLight)

    const topLight = new THREE.DirectionalLight(0xffffff, 1.2)
    topLight.position.set(0, 8, 2)
    scene.add(topLight)

    // Master Rotating Group
    const foodGroup = new THREE.Group()
    scene.add(foodGroup)

    // Floating Golden Crumbs
    const crumbCount = 30
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
      size: 0.05,
      transparent: true,
      opacity: 0.5,
    })
    const crumbs = new THREE.Points(crumbGeo, crumbMat)
    scene.add(crumbs)

    // Load High-Quality Pre-Made 3D Food Model (Croissant Artesanal)
    const loader = new GLTFLoader()
    loader.load(
      '/models/croissant.glb',
      (gltf) => {
        const model = gltf.scene
        const box = new THREE.Box3().setFromObject(model)
        const size = box.getSize(new THREE.Vector3())
        const center = box.getCenter(new THREE.Vector3())
        const maxDim = Math.max(size.x, size.y, size.z)

        // Scale to ideal hero viewport size
        const targetScale = 3.2 / maxDim
        model.scale.set(targetScale, targetScale, targetScale)
        model.position.sub(center.clone().multiplyScalar(targetScale))

        model.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            child.castShadow = true
            child.receiveShadow = true
            const mesh = child as THREE.Mesh
            if (mesh.material && (mesh.material as THREE.MeshStandardMaterial).isMeshStandardMaterial) {
              const mat = mesh.material as THREE.MeshStandardMaterial
              mat.roughness = Math.max(mat.roughness, 0.45)
            }
          }
        })

        // Initial appetizing rotation angle
        foodGroup.rotation.x = 0.35
        foodGroup.rotation.z = -0.15
        foodGroup.add(model)
        setLoaded(true)
      },
      undefined,
      (error) => {
        console.error('Error loading 3D food model:', error)
      }
    )

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
      foodGroup.rotation.y = t * 0.4 + mouse.x * 0.5
      foodGroup.rotation.x = 0.35 + Math.sin(t * 1.2) * 0.08 - mouse.y * 0.35
      foodGroup.position.y = Math.sin(t * 1.5) * 0.08

      crumbs.rotation.y = t * 0.06

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
      crumbGeo.dispose()
      crumbMat.dispose()
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className={`w-full h-full min-h-[300px] sm:min-h-[420px] lg:min-h-[480px] cursor-grab active:cursor-grabbing flex items-center justify-center relative z-10 transition-opacity duration-700 ${
        loaded ? 'opacity-100' : 'opacity-90'
      }`}
      title="Croissant artesanal 3D interactivo"
    />
  )
}
