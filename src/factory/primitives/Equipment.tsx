import { useMemo } from 'react'
import * as THREE from 'three'
import { M, useCorrugatedMaterial } from '../materials'
import { segmentTransform, type SegmentTransform } from '../utils'
import type { Vec3 } from '../types'

const H = 2.59
const W = 2.44

interface ContainerProps {
  length?: number
  color?: string
  acUnits?: number
  doors?: boolean
}

/** ISO shipping container used as a process / control enclosure. Length along X. */
export function ShippingContainer({ length = 6.06, color = '#eceeec', acUnits = 0, doors = true }: ContainerProps) {
  const walls = useCorrugatedMaterial(color, Math.round(length / 0.28), { metalness: 0.25, roughness: 0.6 })
  return (
    <group>
      <mesh position={[0, H / 2, 0]} material={walls} castShadow receiveShadow>
        <boxGeometry args={[length, H, W]} />
      </mesh>
      <mesh position={[0, H + 0.02, 0]} material={M.offWhite}>
        <boxGeometry args={[length - 0.1, 0.04, W - 0.1]} />
      </mesh>
      {[-1, 1].map((sx) =>
        [-1, 1].map((sz) => (
          <mesh key={`${sx}${sz}`} position={[(sx * (length - 0.16)) / 2, H / 2, (sz * (W - 0.16)) / 2]} material={M.steelDark}>
            <boxGeometry args={[0.17, H + 0.02, 0.17]} />
          </mesh>
        )),
      )}
      {doors && (
        <group position={[length / 2 + 0.01, H / 2, 0]}>
          {[-0.58, 0.58].map((z) => (
            <mesh key={z} position={[0, 0, z]} material={M.offWhite}>
              <boxGeometry args={[0.04, H - 0.3, 1.1]} />
            </mesh>
          ))}
          {[-0.85, -0.3, 0.3, 0.85].map((z) => (
            <mesh key={z} position={[0.04, 0, z]} material={M.steel}>
              <boxGeometry args={[0.04, H - 0.4, 0.04]} />
            </mesh>
          ))}
        </group>
      )}
      {Array.from({ length: acUnits }, (_, i) => (
        <group key={i} position={[-length / 2 + 1.2 + i * 1.6, 1.5, W / 2 + 0.3]}>
          <mesh material={M.white} castShadow>
            <boxGeometry args={[0.9, 0.6, 0.5]} />
          </mesh>
          <mesh position={[0, 0, 0.26]} material={M.steelDark}>
            <circleGeometry args={[0.22, 16]} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

interface VesselProps {
  radius?: number
  height?: number
  legs?: number
  material?: THREE.Material
}

/** Vertical pressure vessel on legs with a torispherical head. */
export function VerticalVessel({ radius = 0.8, height = 4, legs = 1.0, material = M.white }: VesselProps) {
  return (
    <group>
      {[0, 1, 2, 3].map((i) => {
        const a = (i / 4) * Math.PI * 2 + Math.PI / 4
        return (
          <mesh key={i} position={[Math.cos(a) * radius * 0.8, legs / 2, Math.sin(a) * radius * 0.8]} material={M.steel}>
            <boxGeometry args={[0.12, legs, 0.12]} />
          </mesh>
        )
      })}
      <mesh position={[0, legs + height / 2, 0]} material={material} castShadow receiveShadow>
        <cylinderGeometry args={[radius, radius, height, 32]} />
      </mesh>
      <mesh position={[0, legs + height, 0]} scale={[1, 0.45, 1]} material={material} castShadow>
        <sphereGeometry args={[radius, 32, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
      </mesh>
      <mesh position={[0, legs, 0]} scale={[1, 0.45, 1]} rotation-x={Math.PI} material={material}>
        <sphereGeometry args={[radius, 32, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
      </mesh>
    </group>
  )
}

interface SkidProps {
  size?: Vec3
  material?: THREE.Material
  fans?: number
}

/** Packaged machine (pump, compressor, chiller): box on a base frame with optional fan grilles. */
export function MachineSkid({ size = [2, 1.4, 1.2], material = M.steel, fans = 0 }: SkidProps) {
  const [x, y, z] = size
  return (
    <group>
      <mesh position={[0, 0.08, 0]} material={M.steelDark} receiveShadow>
        <boxGeometry args={[x + 0.2, 0.16, z + 0.2]} />
      </mesh>
      <mesh position={[0, 0.16 + y / 2, 0]} material={material} castShadow receiveShadow>
        <boxGeometry args={size} />
      </mesh>
      {Array.from({ length: fans }, (_, i) => (
        <mesh key={i} position={[-x / 2 + (x / fans) * (i + 0.5), 0.17 + y, 0]} rotation-x={-Math.PI / 2} material={M.black}>
          <circleGeometry args={[Math.min(x / fans, z) * 0.38, 20]} />
        </mesh>
      ))}
    </group>
  )
}

interface PipeRunProps {
  points: Vec3[]
  radius?: number
  material?: THREE.Material
  supports?: boolean
  spacing?: number
}

/** Pipe through a list of points with elbows at the joints and ground supports under elevated runs. */
export function PipeRun({ points, radius = 0.15, material = M.pipeGrey, supports = true, spacing = 5 }: PipeRunProps) {
  const { segments, posts } = useMemo(() => {
    const segments: SegmentTransform[] = []
    const posts: Vec3[] = []
    for (let i = 0; i < points.length - 1; i++) {
      const a = points[i]
      const b = points[i + 1]
      segments.push(segmentTransform(a, b))
      const horizontal = Math.abs(a[1] - b[1]) < 1e-3 && a[1] > radius * 2.5
      if (supports && horizontal) {
        const len = Math.hypot(b[0] - a[0], b[2] - a[2])
        const n = Math.max(1, Math.floor(len / spacing))
        for (let j = 0; j <= n; j++) {
          if ((j === 0 && i > 0) || len < 0.5) continue
          const t = j / n
          posts.push([a[0] + (b[0] - a[0]) * t, a[1], a[2] + (b[2] - a[2]) * t])
        }
      }
    }
    return { segments, posts }
  }, [points, radius, supports, spacing])

  return (
    <group>
      {segments.map((s, i) => (
        <mesh key={i} position={s.position} quaternion={s.quaternion} material={material} castShadow>
          <cylinderGeometry args={[radius, radius, s.length, 14]} />
        </mesh>
      ))}
      {points.slice(1, -1).map((p, i) => (
        <mesh key={`e${i}`} position={p} material={material}>
          <sphereGeometry args={[radius * 1.15, 14, 10]} />
        </mesh>
      ))}
      {posts.map((p, i) => {
        const h = p[1] - radius
        return (
          <group key={`p${i}`} position={[p[0], 0, p[2]]}>
            <mesh position={[0, h / 2, 0]} material={M.steelDark} castShadow>
              <boxGeometry args={[0.12, h, 0.12]} />
            </mesh>
            <mesh position={[0, h, 0]} material={M.steelDark}>
              <boxGeometry args={[radius * 3, 0.06, radius * 3]} />
            </mesh>
          </group>
        )
      })}
    </group>
  )
}
