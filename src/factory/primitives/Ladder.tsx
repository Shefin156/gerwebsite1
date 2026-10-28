import { useMemo } from 'react'
import * as THREE from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { M } from '../materials'

interface LadderProps {
  height: number
  width?: number
  cage?: boolean
  material?: THREE.Material
}

/** Caged access ladder. Local +Z faces away from the wall it is mounted on. */
export function Ladder({ height, width = 0.5, cage = true, material = M.galvanized }: LadderProps) {
  const geometry = useMemo(() => {
    const parts: THREE.BufferGeometry[] = []
    for (const side of [-1, 1]) {
      const rail = new THREE.BoxGeometry(0.06, height, 0.06)
      rail.translate((side * width) / 2, height / 2, 0)
      parts.push(rail)
    }
    for (let y = 0.3; y < height; y += 0.3) {
      const rung = new THREE.CylinderGeometry(0.02, 0.02, width, 6)
      rung.rotateZ(Math.PI / 2)
      rung.translate(0, y, 0)
      parts.push(rung)
    }
    if (cage && height > 3) {
      for (let y = 2.4; y <= height + 0.01; y += 0.9) {
        const hoop = new THREE.TorusGeometry(0.42, 0.02, 4, 14, Math.PI)
        hoop.rotateX(Math.PI / 2)
        hoop.translate(0, y, 0.05)
        parts.push(hoop)
      }
      for (const a of [0.15, 0.5, 0.85].map((f) => f * Math.PI)) {
        const bar = new THREE.BoxGeometry(0.03, height - 2.4, 0.03)
        bar.translate(Math.cos(a) * 0.42, 2.4 + (height - 2.4) / 2, 0.05 + Math.sin(a) * 0.42)
        parts.push(bar)
      }
    }
    return mergeGeometries(parts) ?? new THREE.BufferGeometry()
  }, [height, width, cage])

  return <mesh geometry={geometry} material={material} castShadow />
}
