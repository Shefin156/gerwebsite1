import * as THREE from 'three'
import type { Vec3 } from './types'

/** Deterministic PRNG so scattered details (trees, reeds, bales) are stable between renders. */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export const easeInOutCubic = (t: number): number => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)

/** Clamped 0–1 progress of p within [start, end]. */
export const seg = (p: number, start: number, end: number): number =>
  THREE.MathUtils.clamp((p - start) / (end - start), 0, 1)

const UP = new THREE.Vector3(0, 1, 0)

export interface SegmentTransform {
  position: Vec3
  quaternion: [number, number, number, number]
  length: number
}

/** Position + quaternion for a Y-aligned cylinder spanning a → b. */
export function segmentTransform(a: Vec3, b: Vec3): SegmentTransform {
  const va = new THREE.Vector3(...a)
  const vb = new THREE.Vector3(...b)
  const dir = vb.clone().sub(va)
  const length = dir.length()
  const q = new THREE.Quaternion().setFromUnitVectors(UP, dir.normalize())
  const mid = va.add(vb).multiplyScalar(0.5)
  return { position: [mid.x, mid.y, mid.z], quaternion: [q.x, q.y, q.z, q.w], length }
}

/** Point on a circle of radius r at angle a (0 = +Z, increasing toward +X). */
export const polar = (r: number, a: number, y = 0): Vec3 => [Math.sin(a) * r, y, Math.cos(a) * r]
