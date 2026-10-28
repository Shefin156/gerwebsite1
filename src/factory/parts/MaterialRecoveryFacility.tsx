import { useMemo } from 'react'
import * as THREE from 'three'
import { Part } from '../Part'
import { M } from '../materials'
import { GableRoof } from '../primitives/GableRoof'
import { MachineSkid } from '../primitives/Equipment'
import { InstancedScatter } from '../primitives/InstancedScatter'
import { mulberry32 } from '../utils'
import type { ScatterItem } from '../primitives/InstancedScatter'
import { SoftShadow } from '../primitives/SoftShadow'

const L = 30 // length along X
const D = 14 // span along Z
const EAVE = 5.5
const RISE = 2.2
const BAYS = 6

const baleGeometry = new THREE.BoxGeometry(1.1, 1.1, 1.1)
const baleMaterial = new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.9 })
const BALE_COLORS = ['#3c6fb0', '#e8e6df', '#5f8c4a', '#9b7a55', '#c94a3d', '#d8cf9a']

/** Open-sided portal-frame shed where incoming waste is sorted before digestion. */
export function MaterialRecoveryFacility() {
  return (
    <Part id="material-recovery-facility">
      <SoftShadow size={[L + 2, D + 2]} />
      <Part id="mrf-slab">
        <mesh position={[0, 0.15, 0]} material={M.concrete} receiveShadow castShadow>
          <boxGeometry args={[L + 2, 0.3, D + 2]} />
        </mesh>
      </Part>
      <Part id="mrf-frame">
        <PortalFrame />
      </Part>
      <Part id="mrf-roof" position={[0, EAVE + 0.3, 0]}>
        <GableRoof length={L} span={D} rise={RISE} overhang={0.8} color="#9e3a35" />
      </Part>
      <Part id="mrf-equipment" position={[0, 0.3, 0]}>
        <SortingLine />
      </Part>
    </Part>
  )
}

function PortalFrame() {
  const xs = Array.from({ length: BAYS + 1 }, (_, i) => -L / 2 + (i * L) / BAYS)
  const half = D / 2
  const angle = Math.atan2(RISE, half)
  const rafter = Math.hypot(half, RISE)
  return (
    <group position={[0, 0.3, 0]}>
      {xs.map((x) => (
        <group key={x} position={[x, 0, 0]}>
          {[-1, 1].map((s) => (
            <mesh key={s} position={[0, EAVE / 2, s * half]} material={M.steel} castShadow>
              <boxGeometry args={[0.3, EAVE, 0.35]} />
            </mesh>
          ))}
          {[-1, 1].map((s) => (
            <mesh key={`r${s}`} position={[0, EAVE + RISE / 2 - 0.2, (s * half) / 2]} rotation-x={s * angle} material={M.steel} castShadow>
              <boxGeometry args={[0.25, 0.4, rafter]} />
            </mesh>
          ))}
        </group>
      ))}
      {/* eave beams and ridge purlin */}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[0, EAVE - 0.15, s * half]} material={M.steel}>
          <boxGeometry args={[L, 0.3, 0.2]} />
        </mesh>
      ))}
      <mesh position={[0, EAVE + RISE - 0.35, 0]} material={M.steel}>
        <boxGeometry args={[L, 0.25, 0.2]} />
      </mesh>
      {/* cross bracing in the end bays */}
      {[-1, 1].map((end) =>
        [-1, 1].map((s) =>
          [1, -1].map((dir) => (
            <mesh
              key={`${end}${s}${dir}`}
              position={[end * (L / 2 - L / BAYS / 2), EAVE / 2, s * half]}
              rotation-z={dir * Math.atan2(EAVE, L / BAYS)}
              material={M.steelDark}
            >
              <boxGeometry args={[Math.hypot(EAVE, L / BAYS), 0.05, 0.05]} />
            </mesh>
          )),
        ),
      )}
    </group>
  )
}

function SortingLine() {
  const bales = useMemo(() => {
    const rand = mulberry32(42)
    const out: ScatterItem[] = []
    for (let x = 0; x < 4; x++)
      for (let z = 0; z < 3; z++)
        for (let y = 0; y < 2; y++) {
          if (y === 1 && rand() < 0.35) continue
          out.push({
            position: [9 + x * 1.2, 0.55 + y * 1.1, 2 + z * 1.2],
            rotationY: (rand() - 0.5) * 0.1,
            color: BALE_COLORS[Math.floor(rand() * BALE_COLORS.length)],
          })
        }
    return out
  }, [])

  const conveyorLen = Math.hypot(9, 2.8)
  const conveyorAngle = Math.atan2(2.8, 9)

  return (
    <group>
      {/* tipping floor waste pile */}
      <mesh position={[-10, 0, -1]} scale={[5, 1.6, 4]} material={M.wasteMixed} castShadow receiveShadow>
        <sphereGeometry args={[1, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
      </mesh>
      {/* trommel screen */}
      <group position={[-6, 1.4, -4.2]} rotation-z={Math.PI / 2 - 0.06}>
        <mesh material={M.green} castShadow>
          <cylinderGeometry args={[1.1, 1.1, 6, 24]} />
        </mesh>
        {[-2.4, 2.4].map((y) => (
          <mesh key={y} position={[0, y, 0]} material={M.steelDark}>
            <torusGeometry args={[1.15, 0.08, 6, 24]} />
          </mesh>
        ))}
      </group>
      {/* inclined picking conveyor */}
      <group position={[-1.5, 0.5 + 1.4, 0]} rotation-z={conveyorAngle}>
        <mesh material={M.steelDark} castShadow>
          <boxGeometry args={[conveyorLen, 0.35, 1.3]} />
        </mesh>
        <mesh position={[0, 0.19, 0]} material={M.rubber}>
          <boxGeometry args={[conveyorLen, 0.04, 1.0]} />
        </mesh>
      </group>
      {[-5, -1.5, 2].map((x) => {
        const h = 1.9 + (x + 1.5) * Math.tan(conveyorAngle) - 0.15
        return (
          <mesh key={x} position={[x, h / 2, 0]} material={M.steel}>
            <boxGeometry args={[0.12, h, 1.2]} />
          </mesh>
        )
      })}
      {/* elevated picking cabin */}
      <group position={[4.5, 0, 0]}>
        {[-1, 1].map((sx) =>
          [-1, 1].map((sz) => (
            <mesh key={`${sx}${sz}`} position={[sx * 1.8, 1.6, sz * 1.6]} material={M.steel}>
              <boxGeometry args={[0.15, 3.2, 0.15]} />
            </mesh>
          )),
        )}
        <mesh position={[0, 3.25, 0]} material={M.steelDark} castShadow receiveShadow>
          <boxGeometry args={[4, 0.15, 3.6]} />
        </mesh>
        <mesh position={[0, 4.3, 0]} material={M.white} castShadow>
          <boxGeometry args={[3.6, 2, 3.2]} />
        </mesh>
        <mesh position={[0, 4.4, 1.61]} material={M.glassDark}>
          <boxGeometry args={[3, 0.8, 0.02]} />
        </mesh>
      </group>
      {/* baler */}
      <group position={[10, 0, -4]}>
        <MachineSkid size={[4.5, 1.8, 1.8]} material={M.red} />
        <mesh position={[-1.6, 2.6, 0]} material={M.red} castShadow>
          <boxGeometry args={[1.2, 1.6, 1.6]} />
        </mesh>
      </group>
      {/* finished bales */}
      <InstancedScatter items={bales} geometry={baleGeometry} material={baleMaterial} receiveShadow />
    </group>
  )
}
