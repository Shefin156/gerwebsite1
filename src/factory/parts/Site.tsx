import { useMemo } from 'react'
import * as THREE from 'three'
import { Part } from '../Part'
import { M } from '../materials'
import { InstancedScatter } from '../primitives/InstancedScatter'
import { mulberry32 } from '../utils'
import { THEME } from '../../theme'
import type { ScatterItem } from '../primitives/InstancedScatter'
import { GRID_LINE_POLES } from '../partsRegistry'

// Outline of the cleared sand platform in plan (x, z).
const PAD: [number, number][] = [
  [-74, -52], [-40, -60], [-6, -56], [30, -50], [60, -42], [68, -16], [64, 12],
  [48, 32], [20, 44], [-14, 48], [-46, 42], [-70, 22], [-80, -12],
]

/** Distance in plan from (x, z) to the nearest segment of a polyline. */
function distanceToPolyline(x: number, z: number, pts: [number, number][]) {
  let best = Infinity
  for (let i = 0; i < pts.length - 1; i++) {
    const [ax, az] = pts[i]
    const [bx, bz] = pts[i + 1]
    const dx = bx - ax
    const dz = bz - az
    const t = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / (dx * dx + dz * dz)))
    best = Math.min(best, Math.hypot(x - ax - t * dx, z - az - t * dz))
  }
  return best
}

function insidePolygon(x: number, z: number, poly: [number, number][], scale = 1) {
  let inside = false
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, zi] = [poly[i][0] * scale, poly[i][1] * scale]
    const [xj, zj] = [poly[j][0] * scale, poly[j][1] * scale]
    if (zi > z !== zj > z && x < ((xj - xi) * (z - zi)) / (zj - zi) + xi) inside = !inside
  }
  return inside
}

/** Forest floor, the cleared sand platform and a few access tracks. */
export function SiteTerrain() {
  const padGeometry = useMemo(() => {
    // Shape is drawn in XY then laid flat, so plan z maps to -y.
    const shape = new THREE.Shape(PAD.map(([x, z]) => new THREE.Vector2(x, -z)))
    const g = new THREE.ShapeGeometry(shape, 24)
    g.rotateX(-Math.PI / 2)
    return g
  }, [])

  return (
    <Part id="site-terrain">
      <mesh rotation-x={-Math.PI / 2} position={[0, -0.05, 0]} material={M.forestFloor} receiveShadow>
        <planeGeometry args={[700, 700]} />
      </mesh>
      <mesh geometry={padGeometry} position={[0, 0.01, 0]} material={M.sand} receiveShadow />
      {/* compacted haul road entering from the east */}
      {[
        { p: [72, -4], len: 30, rot: 0.15 },
        { p: [50, 6], len: 22, rot: -0.35 },
      ].map(({ p, len, rot }, i) => (
        <mesh key={i} position={[p[0], 0.03, p[1]]} rotation={[-Math.PI / 2, 0, rot]} material={M.concreteDark} receiveShadow>
          <planeGeometry args={[len, 6]} />
        </mesh>
      ))}
    </Part>
  )
}

const canopyGeometry = new THREE.IcosahedronGeometry(1, 1)
const trunkGeometry = new THREE.CylinderGeometry(0.15, 0.25, 1, 6)
trunkGeometry.translate(0, 0.5, 0)
const FOLIAGE = THEME.foliage

/** Tropical secondary forest ringing the cleared platform. */
export function Vegetation({ count = 900 }: { count?: number }) {
  const { canopies, trunks, shrubs } = useMemo(() => {
    const rand = mulberry32(2024)
    const canopies: ScatterItem[] = []
    const trunks: ScatterItem[] = []
    const shrubs: ScatterItem[] = []
    let tries = 0
    while (canopies.length < count && tries < 20000) {
      tries++
      const x = (rand() - 0.5) * 360
      const z = -190 + rand() * 300
      if (insidePolygon(x, z, PAD, 1.12)) continue
      if (distanceToPolyline(x, z, GRID_LINE_POLES) < 8) continue // cleared line corridor
      // thin out the foreground so the default camera sees the plant
      if (z > 60 && rand() < 0.6) continue
      const h = 4 + rand() * 7
      const r = 2.2 + rand() * 2.6
      trunks.push({ position: [x, 0, z], scale: [1, h, 1] })
      canopies.push({
        position: [x, h + r * 0.4, z],
        scale: [r, r * (0.8 + rand() * 0.5), r],
        rotationY: rand() * Math.PI,
        color: FOLIAGE[Math.floor(rand() * FOLIAGE.length)],
      })
    }
    // low scrub on the platform margins
    for (let i = 0; i < 160; i++) {
      const a = rand() * Math.PI * 2
      const k = 0.95 + rand() * 0.15
      const [px, pz] = PAD[Math.floor(rand() * PAD.length)]
      const x = px * k + Math.cos(a) * 6
      const z = pz * k + Math.sin(a) * 6
      const s = 0.6 + rand() * 1.2
      shrubs.push({
        position: [x, s * 0.4, z],
        scale: [s, s * 0.7, s],
        color: FOLIAGE[Math.floor(rand() * FOLIAGE.length)],
      })
    }
    return { canopies, trunks, shrubs }
  }, [count])

  return (
    <Part id="site-vegetation">
      <InstancedScatter items={trunks} geometry={trunkGeometry} material={M.trunk} castShadow={false} />
      <InstancedScatter items={canopies} geometry={canopyGeometry} material={M.foliage} />
      <InstancedScatter items={shrubs} geometry={canopyGeometry} material={M.foliage} />
    </Part>
  )
}

const blockGeometry = new THREE.BoxGeometry(1.2, 0.6, 0.6)
const blockMaterial = new THREE.MeshStandardMaterial({ color: '#e9e7e1', roughness: 0.9 })

/** Stacked precast blocks and pallets scattered around the upgrading plant. */
export function LaydownArea() {
  const blocks = useMemo(() => {
    const rand = mulberry32(99)
    const clusters = [[-44, 18], [-36, 26], [-24, 34], [-50, 6], [-6, 40]]
    const out: ScatterItem[] = []
    for (const [cx, cz] of clusters) {
      const rows = 2 + Math.floor(rand() * 3)
      for (let i = 0; i < rows; i++)
        for (let j = 0; j < 2; j++)
          for (let k = 0; k < 1 + Math.floor(rand() * 3); k++)
            out.push({ position: [cx + i * 1.3, 0.3 + k * 0.6, cz + j * 0.7], rotationY: 0.4 })
    }
    return out
  }, [])
  return (
    <Part id="site-laydown">
      <InstancedScatter items={blocks} geometry={blockGeometry} material={blockMaterial} receiveShadow />
      {/* rusty skip bin */}
      <group position={[44, 0, 34]} rotation-y={0.3}>
        <mesh position={[0, 0.9, 0]} material={M.pipeSludge} castShadow>
          <boxGeometry args={[4, 1.8, 2.4]} />
        </mesh>
      </group>
    </Part>
  )
}
