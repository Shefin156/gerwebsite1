import { useLayoutEffect, useRef } from 'react'
import * as THREE from 'three'
import type { Vec3 } from '../types'

export interface ScatterItem {
  position: Vec3
  scale?: Vec3 | number
  rotationY?: number
  color?: string
}

interface InstancedScatterProps {
  items: ScatterItem[]
  geometry: THREE.BufferGeometry
  material: THREE.Material
  castShadow?: boolean
  receiveShadow?: boolean
}

const tmp = new THREE.Object3D()
const color = new THREE.Color()

/** Many copies of one geometry in a single draw call. */
export function InstancedScatter({ items, geometry, material, castShadow = true, receiveShadow = false }: InstancedScatterProps) {
  const ref = useRef<THREE.InstancedMesh>(null!)
  useLayoutEffect(() => {
    const mesh = ref.current
    items.forEach((it, i) => {
      tmp.position.set(...it.position)
      tmp.rotation.set(0, it.rotationY ?? 0, 0)
      if (Array.isArray(it.scale)) tmp.scale.set(...it.scale)
      else tmp.scale.setScalar(it.scale ?? 1)
      tmp.updateMatrix()
      mesh.setMatrixAt(i, tmp.matrix)
      if (it.color) mesh.setColorAt(i, color.set(it.color))
    })
    mesh.instanceMatrix.needsUpdate = true
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
    mesh.computeBoundingSphere()
  }, [items])

  return (
    <instancedMesh
      ref={ref}
      args={[geometry, material, items.length]}
      castShadow={castShadow}
      receiveShadow={receiveShadow}
    />
  )
}
