import * as THREE from 'three'
import { PART_INDEX } from './partsRegistry'
import type { PartDef, Vec3 } from './types'

const euler = new THREE.Euler()

/**
 * Convert a point in a part's local frame to world space using the registry's assembled
 * (un-exploded) position/rotation chain. Used to route pipes and flows across rotated assemblies.
 */
export function toWorld(partId: string, point: Vec3): Vec3 {
  const v = new THREE.Vector3(...point)
  let id: string | null = partId
  while (id) {
    const meta: PartDef | undefined = PART_INDEX[id]
    if (!meta) throw new Error(`toWorld: unknown part "${id}"`)
    if (meta.rotation) v.applyEuler(euler.set(meta.rotation[0], meta.rotation[1], meta.rotation[2]))
    if (meta.position) v.add(new THREE.Vector3(...meta.position))
    id = meta.parent
  }
  return [v.x, v.y, v.z]
}
