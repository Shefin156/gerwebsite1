import { createContext, useContext, useRef, type CSSProperties, type MutableRefObject, type ReactNode } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import { PART_INDEX, CATEGORIES } from './partsRegistry'
import { easeInOutCubic } from './utils'
import type { PartDef, Vec3 } from './types'

export interface ExplodeContextValue {
  /** Global explode value: 0 = assembled, 1 = fully split. Mutate `.current`; no re-render needed. */
  progress: MutableRefObject<number>
  /** Damping speed for the motion (0 = follow progress exactly). */
  smoothing: number
  /** Name tags: true for every labelled part, or a list of part ids. */
  showLabels: boolean | readonly string[]
  /** Per-part 0–1 explode values that take precedence over `progress` (e.g. lift only some roofs). */
  overrides: MutableRefObject<Record<string, number>>
  /** DOM node the HTML name tags render into (needed inside drei <ScrollControls>). */
  labelPortal?: MutableRefObject<HTMLElement>
}

export const ExplodeContext = createContext<ExplodeContextValue>({
  progress: { current: 0 },
  smoothing: 8,
  showLabels: false,
  overrides: { current: {} },
})

const ZERO: Vec3 = [0, 0, 0]

type PartProps = { id: string; children?: ReactNode } & Partial<Omit<PartDef, 'id'>>

/**
 * A named, categorised, explodable node of the plant. Metadata comes from `partsRegistry.ts`
 * by `id`; props override it. The THREE.Group is named after `id` and carries
 * `userData = { partId, name, category, parent }`. Explode offsets stack with the parent's motion.
 */
export function Part({ id, children, ...props }: PartProps) {
  if (import.meta.env.DEV && !PART_INDEX[id]) console.warn(`[Part] "${id}" is not in partsRegistry`)
  const meta = { ...PART_INDEX[id], ...props }
  const position = meta.position ?? ZERO
  const rotation = meta.rotation ?? ZERO
  const explode = meta.explode ?? ZERO
  const [start, end] = meta.stage ?? [0, 1]

  const ref = useRef<THREE.Group>(null!)
  const k = useRef(0)
  const { progress, smoothing, showLabels, overrides, labelPortal } = useContext(ExplodeContext)
  const labelOn =
    meta.label === true && (showLabels === true || (Array.isArray(showLabels) && showLabels.includes(id)))

  useFrame((_, dt) => {
    const t = THREE.MathUtils.clamp((progress.current - start) / (end - start), 0, 1)
    const target = easeInOutCubic(overrides.current[id] ?? t)
    k.current = smoothing > 0 ? THREE.MathUtils.damp(k.current, target, smoothing, Math.min(dt, 0.1)) : target
    ref.current.position.set(
      position[0] + explode[0] * k.current,
      position[1] + explode[1] * k.current,
      position[2] + explode[2] * k.current,
    )
  })

  return (
    <group
      ref={ref}
      name={id}
      position={position}
      rotation={rotation}
      userData={{ partId: id, name: meta.name, category: meta.category, parent: meta.parent }}
    >
      {children}
      {labelOn && (
        <Html position={meta.labelOffset ?? [0, 5, 0]} center portal={labelPortal} zIndexRange={[20, 0]} style={{ pointerEvents: 'none' }}>
          <div className="part-label" style={{ '--cat': meta.category ? CATEGORIES[meta.category].color : '#ccc' } as CSSProperties}>
            {meta.name}
          </div>
        </Html>
      )}
    </group>
  )
}
