import { useMemo } from 'react'
import * as THREE from 'three'
import { Part } from '../Part'
import { M } from '../materials'
import { PipeRun } from '../primitives/Equipment'
import { InstancedScatter } from '../primitives/InstancedScatter'
import { mulberry32 } from '../utils'
import type { ScatterItem } from '../primitives/InstancedScatter'
import type { Vec3 } from '../types'
import { SoftShadow } from '../primitives/SoftShadow'

type Fill = 'gravel' | 'planted' | 'water' | 'waterLight' | 'waterDark'

const CELL_W = 15
const CELL_D = 10.5
const BERM = 1.4
const BERM_H = 1.1

const reedGeometry = new THREE.ConeGeometry(0.18, 1.2, 5)
reedGeometry.translate(0, 0.6, 0)

// Fill types: 'planted' gravel bed with reeds, 'gravel' bare bed, or a water material key.
const CELLS: { n: number; col: number; row: number; fill: Fill }[] = [
  { n: 1, col: 0, row: 0, fill: 'gravel' },
  { n: 2, col: 1, row: 0, fill: 'water' },
  { n: 3, col: 2, row: 0, fill: 'waterLight' },
  { n: 4, col: 0, row: 1, fill: 'waterLight' },
  { n: 5, col: 1, row: 1, fill: 'waterDark' },
  { n: 6, col: 2, row: 1, fill: 'planted' },
]

/**
 * HDPE-lined earth basin. Each basin owns half a berm on every side so neighbouring
 * basins butt together cleanly and separate cleanly when exploded.
 */
export function LinedBasin({ width, depth, fill = 'water', seed = 1 }: { width: number; depth: number; fill?: Fill; seed?: number }) {
  const innerW = width - BERM
  const innerD = depth - BERM
  const bed = fill === 'gravel' || fill === 'planted'
  const reeds = useMemo((): ScatterItem[] => {
    if (fill !== 'planted') return []
    const rand = mulberry32(seed)
    return Array.from({ length: 220 }, () => ({
      position: [(rand() - 0.5) * (innerW - 0.6), 0.75, (rand() - 0.5) * (innerD - 0.6)],
      scale: [1, 0.6 + rand() * 0.9, 1],
      rotationY: rand() * Math.PI,
      color: rand() > 0.5 ? '#6f8f3e' : '#86a04a',
    }))
  }, [fill, seed, innerW, innerD])

  const walls: { pos: Vec3; size: Vec3 }[] = [
    { pos: [0, 0, -(depth - BERM / 2) / 2], size: [width, BERM_H, BERM / 2] },
    { pos: [0, 0, (depth - BERM / 2) / 2], size: [width, BERM_H, BERM / 2] },
    { pos: [-(width - BERM / 2) / 2, 0, 0], size: [BERM / 2, BERM_H, depth - BERM] },
    { pos: [(width - BERM / 2) / 2, 0, 0], size: [BERM / 2, BERM_H, depth - BERM] },
  ]

  return (
    <group>
      <mesh position={[0, 0.1, 0]} material={M.liner} receiveShadow>
        <boxGeometry args={[innerW, 0.2, innerD]} />
      </mesh>
      {walls.map((w, i) => (
        <group key={i} position={w.pos}>
          <mesh position={[0, BERM_H / 2, 0]} material={M.liner} castShadow receiveShadow>
            <boxGeometry args={w.size} />
          </mesh>
          {/* sand anchor-trench cap */}
          <mesh position={[0, BERM_H + 0.04, 0]} material={M.sand} receiveShadow>
            <boxGeometry args={[w.size[0] - 0.05, 0.08, w.size[2] - 0.05]} />
          </mesh>
        </group>
      ))}
      {bed ? (
        <mesh position={[0, 0.45, 0]} material={M.gravel} receiveShadow>
          <boxGeometry args={[innerW, 0.6, innerD]} />
        </mesh>
      ) : (
        <mesh position={[0, 0.72, 0]} rotation-x={-Math.PI / 2} material={M[fill as 'water' | 'waterLight' | 'waterDark']} receiveShadow>
          <planeGeometry args={[innerW, innerD]} />
        </mesh>
      )}
      {reeds.length > 0 && <InstancedScatter items={reeds} geometry={reedGeometry} material={M.reed} />}
    </group>
  )
}

/** Six-cell horizontal-flow constructed wetland that polishes effluent (back-left). */
export function ConstructedWetlands() {
  const x0 = -CELL_W
  const z0 = -CELL_D / 2
  return (
    <Part id="constructed-wetlands">
      <SoftShadow size={[CELL_W * 3, CELL_D * 2]} />
      {CELLS.map((c) => (
        <Part key={c.n} id={`wetland-cell-${c.n}`} position={[x0 + c.col * CELL_W, 0, z0 + c.row * CELL_D]}>
          <LinedBasin width={CELL_W} depth={CELL_D} fill={c.fill} seed={c.n * 17} />
        </Part>
      ))}
      <Part id="wetland-distribution">
        <PipeRun
          points={[[x0 - CELL_W / 2 + 1, 1.5, CELL_D + 0.4], [x0 + CELL_W * 2.5 - 1, 1.5, CELL_D + 0.4]]}
          radius={0.16}
          material={M.pipeWater}
          spacing={4}
        />
        {[0, 1, 2].map((col) => (
          <PipeRun
            key={col}
            points={[[x0 + col * CELL_W, 1.5, CELL_D + 0.4], [x0 + col * CELL_W, 1.5, CELL_D - 0.6], [x0 + col * CELL_W, 0.9, CELL_D - 0.6]]}
            radius={0.1}
            material={M.pipeWater}
            supports={false}
          />
        ))}
      </Part>
    </Part>
  )
}

/** Lined settling / polishing pond between the digestate tank and the wetlands. */
export function PolishingPond() {
  return (
    <Part id="polishing-pond">
      <SoftShadow size={[16, 9]} />
      <LinedBasin width={16} depth={9} fill="waterLight" />
    </Part>
  )
}

/** Two circular concrete sumps at the western edge of the platform. */
export function InletSumps() {
  return (
    <Part id="inlet-sumps">
      {[[0, -3.6], [1.2, 3.6]].map(([x, z]) => (
        <group key={z} position={[x, 0, z]}>
          <SoftShadow size={[7, 7]} />
          <mesh position={[0, 0.6, 0]} material={M.liner} castShadow receiveShadow>
            <cylinderGeometry args={[3.2, 3.4, 1.2, 40, 1, true]} />
          </mesh>
          <mesh position={[0, 1.2, 0]} rotation-x={-Math.PI / 2} material={M.concreteDark}>
            <ringGeometry args={[2.9, 3.3, 40]} />
          </mesh>
          <mesh position={[0, 0.85, 0]} rotation-x={-Math.PI / 2} material={M.sludge}>
            <circleGeometry args={[3.15, 40]} />
          </mesh>
        </group>
      ))}
    </Part>
  )
}
