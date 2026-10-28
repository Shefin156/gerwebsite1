import * as THREE from 'three'

/** Blurred rounded-rectangle alpha mask, generated once. */
function shadowTexture() {
  const size = 128
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  const g = canvas.getContext('2d')
  if (!g) throw new Error('2D canvas not available')
  const grad = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  grad.addColorStop(0, 'rgba(0,0,0,0.85)')
  grad.addColorStop(0.55, 'rgba(0,0,0,0.6)')
  grad.addColorStop(1, 'rgba(0,0,0,0)')
  g.fillStyle = grad
  g.fillRect(0, 0, size, size)
  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

const material = new THREE.MeshBasicMaterial({
  color: '#1c2a21',
  alphaMap: shadowTexture(),
  transparent: true,
  opacity: 0.16,
  depthWrite: false,
  toneMapped: false,
  fog: false,
})
const geometry = new THREE.PlaneGeometry(1, 1)
geometry.rotateX(-Math.PI / 2)

interface SoftShadowProps {
  /** Footprint in metres [x, z]; the blur extends a little beyond it. */
  size: [number, number]
  position?: [number, number, number]
}

/**
 * Fake contact shadow that travels with its unit. Used instead of real shadow maps so
 * layers floating in the vertical stack each keep a soft shadow on the white page.
 */
export function SoftShadow({ size, position = [0, 0.02, 0] }: SoftShadowProps) {
  return (
    <mesh
      geometry={geometry}
      material={material}
      position={position}
      scale={[size[0] * 1.35, 1, size[1] * 1.35]}
      renderOrder={-1}
    />
  )
}
