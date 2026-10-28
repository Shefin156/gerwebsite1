export type Vec3 = [number, number, number]

export type CategoryKey = 'site' | 'feedstock' | 'digestion' | 'gas' | 'water' | 'power' | 'utilities'

export interface PartDef {
  /** Also the THREE.Group name – scene.getObjectByName(id). */
  id: string
  name: string
  category: CategoryKey
  parent: string | null
  /** Placement in the parent's frame (metres; +X east, −Z north, Y up). */
  position?: Vec3
  rotation?: Vec3
  /** Offset when fully split, in the parent's frame. */
  explode?: Vec3
  /** [start, end] window of the 0–1 explode progress for this part's motion. */
  stage?: [number, number]
  label?: boolean
  labelOffset?: Vec3
}

export interface Category {
  label: string
  color: string
}
