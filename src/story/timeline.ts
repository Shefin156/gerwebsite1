import * as THREE from 'three'
import { easeInOutCubic, seg } from '../factory/utils'
import { BAND_Y } from '../factory/partsRegistry'
import type { Vec3 } from '../factory/types'
import { FLOW } from '../theme'

/**
 * ───────────────────────────────────────────────────────────────────────────────
 *  TIMELINE: tweak everything here.
 *  Every value on screen is a pure function of the ScrollControls offset (0–1),
 *  so scrolling back up re-stacks the plant exactly.
 * ───────────────────────────────────────────────────────────────────────────────
 */

export const SCROLL_PAGES = 8
/** Seconds ScrollControls takes to catch up with the wheel – higher = silkier. */
export const SCROLL_DAMPING = 0.35

/**
 * Scroll range over which the plant comes apart. Disassembly progress 0→1 is mapped
 * linearly onto this range; the per-part stage windows in partsRegistry.ts sequence it.
 */
export const DISASSEMBLY_RANGE: [number, number] = [0.05, 0.84]

/** The footer slides up (pushing the page up) over this final scroll range. */
export const FOOTER_RANGE: [number, number] = [0.94, 1]

/** Scroll distance used for text fades. */
export const FADE = 0.03

export type Side = 'left' | 'right'

export interface Chapter {
  key: string
  /** Scroll range in which the chapter's text is on screen. */
  range: [number, number]
  side: Side
  /** Biomass → Quality Biogas → Electricity indicator index. */
  chainStep?: number
  accent?: string
  /** Part ids that show name tags while the chapter is active; true = all labelled parts. */
  labels: string[] | true
  copy: { eyebrow: string; title: string; body: string }
}

export const CHAPTERS: Chapter[] = [
  {
    key: 'hero',
    range: [0, 0.07],
    side: 'left',
    labels: [],
    copy: { eyebrow: 'BioCycle', title: 'Waste into Power.', body: 'How a biogas plant turns organic waste into clean energy, one layer at a time.' },
  },
  {
    key: 'biomass',
    range: [0.1, 0.28],
    side: 'right',
    chainStep: 0,
    accent: FLOW.biomass,
    labels: ['material-recovery-facility', 'equalization-tanks'],
    copy: {
      eyebrow: '01 / Biomass',
      title: 'Organic waste comes in.',
      body: 'Agricultural residue, food waste and manure are sorted in the Material Recovery Facility and blended in equalization tanks before feeding the digesters.',
    },
  },
  {
    key: 'biogas',
    range: [0.3, 0.49],
    side: 'left',
    chainStep: 1,
    accent: FLOW.rawGas,
    labels: ['anaerobic-digesters', 'biogas-upgrading-plant'],
    copy: {
      eyebrow: '02 / Quality Biogas',
      title: 'Digested. Cleaned. Upgraded.',
      body: 'In sealed, oxygen-free digesters, microbes turn organic matter into methane-rich biogas. It is then scrubbed, filtered and upgraded on membranes.',
    },
  },
  {
    key: 'electricity',
    range: [0.51, 0.66],
    side: 'right',
    chainStep: 2,
    accent: FLOW.electricity,
    labels: ['power-generation'],
    copy: {
      eyebrow: '03 / Electricity',
      title: 'Clean gas becomes power.',
      body: 'The quality gas fuels gas engines that generate electricity and heat, stepped up by a transformer for the grid.',
    },
  },
  {
    key: 'water',
    range: [0.68, 0.83],
    side: 'left',
    accent: FLOW.water,
    labels: ['fertilizer-tank', 'polishing-pond', 'constructed-wetlands'],
    copy: {
      eyebrow: '04 / Digestate & Water',
      title: 'Nothing goes to waste.',
      body: 'The leftover slurry becomes natural fertiliser, and process water is polished in ponds and constructed wetlands.',
    },
  },
  {
    key: 'closing',
    range: [0.86, 0.95],
    side: 'left',
    labels: true,
    copy: { eyebrow: 'The whole plant', title: 'Circular by design.', body: 'Waste in. Renewable power, natural fertiliser and clean water out, layer by layer.' },
  },
]

/** Where the header links scroll to (offset 0–1). */
export const NAV_TARGETS = {
  process: 0.14,
  plant: 0.9,
  impact: 0.74,
  contact: 1,
} as const

/**
 * Camera path: one continuous Catmull-Rom spline through these keys, so motion never stops
 * and starts. Each key orbits `target` at `azimuth` (0 = from the south, + toward the east),
 * `height` metres above the target. The targets descend with the layers of the stack.
 */
interface CameraKey {
  at: number
  target: Vec3
  azimuth: number
  radius: number
  height: number
}

export const CAMERA_KEYS: CameraKey[] = [
  { at: 0.0, target: [-4, 2, -6], azimuth: -0.72, radius: 112, height: 54 },
  { at: 0.19, target: [44, BAND_Y.biomass + 14, -23], azimuth: 0.75, radius: 96, height: 30 },
  { at: 0.4, target: [-8, BAND_Y.biogas + 16, -4], azimuth: -0.6, radius: 104, height: 32 },
  { at: 0.585, target: [22, BAND_Y.electricity + 9, 22], azimuth: -0.3, radius: 72, height: 24 },
  { at: 0.76, target: [-18, BAND_Y.water + 12, -14], azimuth: -0.72, radius: 108, height: 34 },
  { at: 0.9, target: [-4, BAND_Y.biogas, -6], azimuth: -0.62, radius: 340, height: 46 },
  { at: 1.0, target: [-4, BAND_Y.biogas, -6], azimuth: -0.5, radius: 340, height: 46 },
]

/** Narrow screens: wider FOV and a farther camera so the plant still fits. */
export const NARROW = { maxWidth: 640, fov: 50, distance: 1.3 }
export const WIDE_FOV = 36

/** Horizontal shift of the scene away from the text column (fraction of viewport width). */
export const VIEW_SHIFT = 0.15

// ── derived helpers (pure functions of offset) ───────────────────────────────

export const disassemblyAt = (offset: number) => seg(offset, ...DISASSEMBLY_RANGE)
export const footerAt = (offset: number) => easeInOutCubic(seg(offset, ...FOOTER_RANGE))

export function chapterIndexAt(offset: number): number {
  for (let i = CHAPTERS.length - 1; i >= 0; i--) if (offset >= CHAPTERS[i].range[0]) return i
  return 0
}

/** 0–1 visibility of a chapter's text: fade in, hold, fade out. */
export function textWeight(offset: number, index: number): number {
  const [start, end] = CHAPTERS[index].range
  const fadeIn = index === 0 ? 1 : seg(offset, start, start + FADE)
  const fadeOut = 1 - seg(offset, end - FADE, end)
  return easeInOutCubic(fadeIn * fadeOut)
}

/** Side of the text column (−1 left, +1 right), blended across chapters. */
export function textSideAt(offset: number): number {
  let side = 0
  CHAPTERS.forEach((c, i) => {
    side += textWeight(offset, i) * (c.side === 'left' ? -1 : 1)
  })
  return THREE.MathUtils.clamp(side, -1, 1)
}

const targetCurve = new THREE.CatmullRomCurve3(CAMERA_KEYS.map((k) => new THREE.Vector3(...k.target)), false, 'centripetal')
const orbitCurve = new THREE.CatmullRomCurve3(
  CAMERA_KEYS.map((k) => new THREE.Vector3(k.azimuth, k.radius, k.height)),
  false,
  'centripetal',
)
const orbit = new THREE.Vector3()

/** Map a scroll offset to the spline parameter so each key lands exactly at its `at`. */
function curveParam(offset: number): number {
  const n = CAMERA_KEYS.length - 1
  for (let i = 0; i < n; i++) {
    const a = CAMERA_KEYS[i].at
    const b = CAMERA_KEYS[i + 1].at
    if (offset <= b || i === n - 1) return (i + seg(offset, a, b)) / n
  }
  return 1
}

/** Camera position + look-at target for a scroll offset. Pure; the caller damps toward it. */
export function cameraAt(offset: number, narrow: boolean, pos: THREE.Vector3, target: THREE.Vector3) {
  const t = curveParam(THREE.MathUtils.clamp(offset, 0, 1))
  targetCurve.getPoint(t, target)
  orbitCurve.getPoint(t, orbit)
  const scale = narrow ? NARROW.distance : 1
  pos.set(
    target.x + Math.sin(orbit.x) * orbit.y * scale,
    target.y + orbit.z * scale,
    target.z + Math.cos(orbit.x) * orbit.y * scale,
  )
}

export const CHAIN = CHAPTERS.filter((c) => c.chainStep !== undefined)
