import * as THREE from 'three'
import { mulberry32 } from './utils'

// Procedural canvas textures, created once and cloned per use (clones share the image).

function makeCanvas(size: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('2D canvas not available')
  return [canvas, ctx]
}

function toTexture(canvas: HTMLCanvasElement): THREE.CanvasTexture {
  const tex = new THREE.CanvasTexture(canvas)
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 8
  return tex
}

/** One period of a corrugation rib (light crest, dark valley) across U. */
function ribTexture() {
  const [c, g] = makeCanvas(64)
  const grad = g.createLinearGradient(0, 0, 64, 0)
  grad.addColorStop(0.0, '#9a9a9a')
  grad.addColorStop(0.2, '#ffffff')
  grad.addColorStop(0.55, '#ececec')
  grad.addColorStop(0.75, '#c2c2c2')
  grad.addColorStop(1.0, '#9a9a9a')
  g.fillStyle = grad
  g.fillRect(0, 0, 64, 64)
  return toTexture(c)
}

/** One bolted steel panel: thin seams on the left and top edges with bolt dots. */
function panelTexture() {
  const [c, g] = makeCanvas(128)
  g.fillStyle = '#ffffff'
  g.fillRect(0, 0, 128, 128)
  g.fillStyle = '#a3a9ad'
  g.fillRect(0, 0, 3, 128)
  g.fillRect(0, 0, 128, 3)
  g.fillStyle = '#c3c8cb'
  for (let i = 8; i < 128; i += 12) {
    g.fillRect(5, i, 2, 2)
    g.fillRect(i, 5, 2, 2)
  }
  return toTexture(c)
}

/** Soft grain with blotches – sand, gravel, soil. Multiplies the material colour. */
function noiseTexture(seed: number, strength: number, blotches: number) {
  const size = 256
  const [c, g] = makeCanvas(size)
  const rand = mulberry32(seed)
  g.fillStyle = '#ffffff'
  g.fillRect(0, 0, size, size)
  for (let i = 0; i < blotches; i++) {
    const x = rand() * size
    const y = rand() * size
    const r = 10 + rand() * 40
    const shade = Math.round(255 * (1 - strength * rand()))
    const grad = g.createRadialGradient(x, y, 0, x, y, r)
    grad.addColorStop(0, `rgba(${shade},${shade},${shade},0.6)`)
    grad.addColorStop(1, `rgba(${shade},${shade},${shade},0)`)
    g.fillStyle = grad
    for (const dx of [-size, 0, size]) for (const dy of [-size, 0, size]) g.fillRect(x - r + dx, y - r + dy, r * 2, r * 2)
  }
  const img = g.getImageData(0, 0, size, size)
  for (let i = 0; i < img.data.length; i += 4) {
    const n = 1 - strength * 0.6 * rand()
    img.data[i] *= n
    img.data[i + 1] *= n
    img.data[i + 2] *= n
  }
  g.putImageData(img, 0, 0)
  return toTexture(c)
}

export const TEX = {
  rib: ribTexture(),
  panel: panelTexture(),
  sand: noiseTexture(7, 0.14, 60),
  gravel: noiseTexture(11, 0.4, 20),
  soil: noiseTexture(23, 0.25, 80),
}
