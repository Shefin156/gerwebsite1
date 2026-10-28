import { Part } from '../Part'
import { M } from '../materials'
import { PipeRun } from '../primitives/Equipment'
import { toWorld } from '../coords'
import type * as THREE from 'three'
import type { Vec3 } from '../types'

export interface PipeRoute {
  material: THREE.Material
  radius: number
  runs: Vec3[][]
}

// World-space routes (process-piping sits at the origin). Elevations are staggered so
// crossing lines pass over / under each other.
// Upgraded gas leaves the end of the upgrading skid's pipe rack (a rotated assembly).
const [gx, , gz] = toWorld('biogas-upgrading-plant', [18.5, 0, -4.85])

export const ROUTES: Record<string, PipeRoute> = {
  'pipe-biogas-header': {
    material: M.pipeGas,
    radius: 0.22,
    runs: [
      [[3.0, 1.6, -27.3], [4.5, 1.6, -27.3], [4.5, 1.6, -6], [-15.5, 1.6, -6], [-15.5, 1.6, 5.4]],
      [[5.1, 1.6, -24], [4.5, 1.6, -24]],
      [[3.4, 1.6, -16], [4.5, 1.6, -16]],
    ],
  },
  'pipe-feed-line': {
    material: M.pipeSludge,
    radius: 0.2,
    runs: [[[30.5, 0.9, -15.5], [30.5, 0.9, -5], [29.6, 0.9, -4.5]]],
  },
  'pipe-substrate-feed': {
    material: M.pipeSludge,
    radius: 0.18,
    runs: [[[24, 0.9, -9.4], [24, 0.9, -16.8], [19.6, 0.9, -16.8]]],
  },
  'pipe-digestate-line': {
    material: M.pipeSludge,
    radius: 0.18,
    runs: [[[-6, 0.9, -6.6], [-6, 0.9, 4], [-0.9, 0.9, 4]]],
  },
  'pipe-effluent-line': {
    material: M.pipeWater,
    radius: 0.14,
    runs: [[[1.4, 0.35, -0.6], [1.4, 0.35, -3], [-24, 0.35, -3], [-24, 0.35, -6], [-26, 0.35, -6]]],
  },
  'pipe-gas-to-chp': {
    material: M.pipeGas,
    radius: 0.18,
    runs: [[[gx, 2.9, gz], [gx + 2, 2.9, gz], [gx + 2, 1.6, gz], [12, 1.6, gz], [12, 1.6, 22], [13.6, 1.6, 22]]],
  },
  'pipe-wetland-feed': {
    material: M.pipeWater,
    radius: 0.14,
    runs: [[[-34, 0.35, -12.6], [-34, 0.35, -19.6]]],
  },
}

/** Above-ground pipework linking the process units. */
export function ProcessPiping() {
  return (
    <Part id="process-piping">
      {Object.entries(ROUTES).map(([id, { material, radius, runs }]) => (
        <Part key={id} id={id}>
          {runs.map((points, i) => (
            <PipeRun key={i} points={points} radius={radius} material={material} />
          ))}
        </Part>
      ))}
    </Part>
  )
}
