import type { ReactNode } from 'react'
import { M, useCorrugatedMaterial } from '../materials'

interface GableRoofProps {
  length: number
  span: number
  rise: number
  overhang?: number
  color?: string
}

/** Corrugated metal gable roof. Origin at eave height on the centreline; ridge along X. */
export function GableRoof({ length, span, rise, overhang = 0.5, color = '#a8423a' }: GableRoofProps) {
  const half = span / 2
  const angle = Math.atan2(rise, half)
  const slope = Math.hypot(half, rise) + overhang
  const sheet = useCorrugatedMaterial(color, Math.round((length + overhang * 2) / 0.22))

  // centre of each sheet, shifted down-slope by half the overhang
  const cz = half / 2 + (overhang / 2) * Math.cos(angle)
  const cy = rise / 2 - (overhang / 2) * Math.sin(angle)

  return (
    <group>
      {[1, -1].map((side) => (
        <mesh key={side} position={[0, cy, side * cz]} rotation-x={side * angle} material={sheet} castShadow receiveShadow>
          <boxGeometry args={[length + overhang * 2, 0.08, slope]} />
        </mesh>
      ))}
      <mesh position={[0, rise + 0.04, 0]} material={sheet} castShadow>
        <boxGeometry args={[length + overhang * 2, 0.1, 0.5]} />
      </mesh>
    </group>
  )
}

interface CanopyProps {
  length: number
  span: number
  eave?: number
  rise?: number
  bays?: number
  color?: string
  children?: ReactNode
}

/** Open-sided steel shelter: columns, eave beams, rafters and a gable roof. */
export function Canopy({ length, span, eave = 3.2, rise = 1.2, bays = 2, color, children }: CanopyProps) {
  const half = span / 2
  const xs = Array.from({ length: bays + 1 }, (_, i) => -length / 2 + (i * length) / bays)
  const rafterLen = Math.hypot(half, rise)
  const angle = Math.atan2(rise, half)
  return (
    <group>
      {xs.map((x) =>
        [-1, 1].map((s) => (
          <mesh key={`${x}${s}`} position={[x, eave / 2, s * half]} material={M.steel} castShadow>
            <boxGeometry args={[0.18, eave, 0.18]} />
          </mesh>
        )),
      )}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[0, eave - 0.1, s * half]} material={M.steel}>
          <boxGeometry args={[length, 0.2, 0.15]} />
        </mesh>
      ))}
      {xs.map((x) =>
        [-1, 1].map((s) => (
          <mesh key={`r${x}${s}`} position={[x, eave + rise / 2 - 0.12, (s * half) / 2]} rotation-x={s * angle} material={M.steel}>
            <boxGeometry args={[0.12, 0.18, rafterLen]} />
          </mesh>
        )),
      )}
      <group position={[0, eave, 0]}>
        <GableRoof length={length} span={span} rise={rise} overhang={0.4} color={color} />
      </group>
      {children}
    </group>
  )
}
