import { useMemo } from 'react'
import * as THREE from 'three'
import { Part } from '../Part'
import { M } from '../materials'
import { GRID_LINE_POLES } from '../partsRegistry'
import { MachineSkid, ShippingContainer } from '../primitives/Equipment'
import type { Vec3 } from '../types'
import { SoftShadow } from '../primitives/SoftShadow'

// Not present in the reference photo: a containerised CHP block that burns the
// upgraded gas and exports electricity, added to complete the energy story.

const POLE_H = 12
const ARM_Y = 11.6
const PHASES = [-1.4, 0, 1.4]
const SAG = 1.3
const transformerMaterial = new THREE.MeshStandardMaterial({ color: '#6f7d74', metalness: 0.4, roughness: 0.5 })
const conductorMaterial = new THREE.MeshStandardMaterial({ color: '#2b2f33', metalness: 0.6, roughness: 0.4 })

export function PowerGeneration() {
  return (
    <Part id="power-generation">
      <SoftShadow size={[21, 9]} position={[2.5, 0.02, 0]} />
      <mesh position={[2.5, 0.15, 0]} material={M.concrete} receiveShadow castShadow>
        <boxGeometry args={[21, 0.3, 9]} />
      </mesh>
      {[-1.7, 1.7].map((z, i) => (
        <Part key={z} id={`chp-engine-${i + 1}`} position={[-0.5, 0.3, z]}>
          <ChpEngine />
        </Part>
      ))}
      <Part id="power-transformer">
        <Transformer />
      </Part>
      {/* cable trench from the engine switchgear to the transformer */}
      <mesh position={[7.4, 0.36, 0]} material={M.concreteDark}>
        <boxGeometry args={[2.6, 0.12, 0.6]} />
      </mesh>
    </Part>
  )
}

function ChpEngine() {
  return (
    <group>
      <ShippingContainer length={12.19} color="#2f6b4f" />
      {/* roof-mounted dump radiator */}
      <group position={[2.6, 2.6, 0]}>
        <MachineSkid size={[5.2, 0.7, 2]} material={M.offWhite} fans={4} />
      </group>
      {/* exhaust silencer + stack */}
      <mesh position={[-3.6, 3.3, 0]} rotation-z={Math.PI / 2} material={M.steel} castShadow>
        <cylinderGeometry args={[0.45, 0.45, 2.2, 20]} />
      </mesh>
      <mesh position={[-4.8, 4.6, 0]} material={M.steel} castShadow>
        <cylinderGeometry args={[0.22, 0.22, 3, 12]} />
      </mesh>
    </group>
  )
}

function Transformer() {
  return (
    <group>
      <mesh position={[0, 1.1, 0]} material={transformerMaterial} castShadow receiveShadow>
        <boxGeometry args={[2.2, 2, 1.6]} />
      </mesh>
      {/* cooling fins */}
      {[-1, 1].map((s) =>
        Array.from({ length: 7 }, (_, i) => (
          <mesh key={`${s}${i}`} position={[-0.9 + i * 0.3, 1.0, s * 1.05]} material={transformerMaterial}>
            <boxGeometry args={[0.06, 1.6, 0.5]} />
          </mesh>
        )),
      )}
      {/* conservator tank */}
      <mesh position={[0, 2.5, -0.4]} rotation-z={Math.PI / 2} material={transformerMaterial}>
        <cylinderGeometry args={[0.28, 0.28, 1.6, 16]} />
      </mesh>
      {/* HV bushings */}
      {[-0.6, 0, 0.6].map((x) => (
        <mesh key={x} position={[x, 2.65, 0.35]} material={M.white} castShadow>
          <cylinderGeometry args={[0.08, 0.14, 1.1, 10]} />
        </mesh>
      ))}
      {/* security fence posts + top rail */}
      {([[-2.8, -2.4], [2.8, -2.4], [2.8, 2.4], [-2.8, 2.4]] as const).map(([x, z]) => (
        <mesh key={`${x}${z}`} position={[x, 1, z]} material={M.galvanized}>
          <cylinderGeometry args={[0.05, 0.05, 2, 6]} />
        </mesh>
      ))}
      {([
        { p: [0, 2, -2.4], s: [5.6, 0.04, 0.04] },
        { p: [0, 2, 2.4], s: [5.6, 0.04, 0.04] },
        { p: [-2.8, 2, 0], s: [0.04, 0.04, 4.8] },
        { p: [2.8, 2, 0], s: [0.04, 0.04, 4.8] },
      ] as { p: Vec3; s: Vec3 }[]).map(({ p, s }) => (
        <mesh key={p.join()} position={p} material={M.galvanized}>
          <boxGeometry args={s} />
        </mesh>
      ))}
    </group>
  )
}

/** Unit vector perpendicular (in plan) to the line direction at pole i. */
function crossArmDirection(i: number): [number, number] {
  const a = GRID_LINE_POLES[Math.max(0, i - 1)]
  const b = GRID_LINE_POLES[Math.min(GRID_LINE_POLES.length - 1, i + 1)]
  const dx = b[0] - a[0]
  const dz = b[1] - a[1]
  const len = Math.hypot(dx, dz)
  return [-dz / len, dx / len]
}

/**
 * Sagging conductor path in world space for one phase (offset along the cross-arm),
 * starting at the transformer bushings. Used for both the cable mesh and the
 * electricity pulse animation.
 */
export function gridConductorPath(phase = 0, samplesPerSpan = 10): Vec3[] {
  const pts: Vec3[] = []
  for (let i = 0; i < GRID_LINE_POLES.length - 1; i++) {
    const [ax, az] = GRID_LINE_POLES[i]
    const [bx, bz] = GRID_LINE_POLES[i + 1]
    const [na, ma] = crossArmDirection(i)
    const [nb, mb] = crossArmDirection(i + 1)
    for (let j = i === 0 ? 0 : 1; j <= samplesPerSpan; j++) {
      const t = j / samplesPerSpan
      const x = THREE.MathUtils.lerp(ax + na * phase, bx + nb * phase, t)
      const z = THREE.MathUtils.lerp(az + ma * phase, bz + mb * phase, t)
      pts.push([x, ARM_Y - 0.35 - SAG * 4 * t * (1 - t), z])
    }
  }
  return pts
}

/** Overhead export line: concrete poles, cross-arms, insulators and three sagging phases. */
export function GridLine() {
  const conductors = useMemo(
    () =>
      PHASES.map((phase) => {
        const curve = new THREE.CatmullRomCurve3(gridConductorPath(phase).map((p) => new THREE.Vector3(...p)))
        return new THREE.TubeGeometry(curve, 240, 0.04, 5, false)
      }),
    [],
  )
  // drop from the first pole down to the transformer bushings
  const [tx, , tz] = [30, 0, 22]
  const [px, pz] = GRID_LINE_POLES[0]

  return (
    <Part id="power-grid-line">
      {GRID_LINE_POLES.map(([x, z], i) => {
        const [nx, nz] = crossArmDirection(i)
        const angle = Math.atan2(-nz, nx)
        return (
          <group key={i} position={[x, 0, z]}>
            <mesh position={[0, POLE_H / 2, 0]} material={M.concrete} castShadow>
              <cylinderGeometry args={[0.18, 0.3, POLE_H, 10]} />
            </mesh>
            <group position={[0, ARM_Y, 0]} rotation-y={angle}>
              <mesh material={M.steelDark} castShadow>
                <boxGeometry args={[3.6, 0.18, 0.18]} />
              </mesh>
              {PHASES.map((p) => (
                <mesh key={p} position={[p, -0.2, 0]} material={M.white}>
                  <cylinderGeometry args={[0.07, 0.1, 0.35, 8]} />
                </mesh>
              ))}
            </group>
          </group>
        )
      })}
      {conductors.map((g, i) => (
        <mesh key={i} geometry={g} material={conductorMaterial} />
      ))}
      <mesh
        position={[(tx + px) / 2, (2.9 + ARM_Y - 0.35) / 2, (tz + pz) / 2]}
        quaternion={new THREE.Quaternion().setFromUnitVectors(
          new THREE.Vector3(0, 1, 0),
          new THREE.Vector3(px - tx, ARM_Y - 0.35 - 2.9, pz - tz).normalize(),
        )}
        material={conductorMaterial}
      >
        <cylinderGeometry args={[0.05, 0.05, Math.hypot(px - tx, ARM_Y - 3.25, pz - tz), 6]} />
      </mesh>
    </Part>
  )
}
