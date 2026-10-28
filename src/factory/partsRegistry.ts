import type { Category, CategoryKey, PartDef, Vec3 } from './types'

/**
 * Single source of truth for every named part of the plant.
 *
 *   id        – also the THREE.Group name (scene.getObjectByName(id))
 *   position  – placement in the parent's frame (metres; +X east, −Z north, Y up)
 *   explode   – offset when fully disassembled (parent's frame)
 *   stage     – [start, end] window of the global 0–1 disassembly progress for this motion.
 *               Windows follow the process order, so the plant comes apart chapter by chapter:
 *                 piping → biomass → biogas → electricity → digestate & water
 *
 * Vertical stack explode: each chapter's units drop straight down into their own layer
 * (BAND_GAP metres apart) and keep their plan position, so the plant becomes a tall exploded
 * tower read top-to-bottom in process order. Inside a layer, sub-assemblies separate vertically
 * in tiers (roof above frame above equipment above slab).
 */

export const CATEGORIES: Record<CategoryKey, Category> = {
  site: { label: 'Site & Landscape', color: '#8d9a6b' },
  feedstock: { label: 'Feedstock Reception', color: '#7CB342' },
  digestion: { label: 'Anaerobic Digestion', color: '#4f8f78' },
  gas: { label: 'Biogas Upgrading', color: '#F2A93B' },
  water: { label: 'Water & Effluent Treatment', color: '#4FA3C7' },
  power: { label: 'Power Generation', color: '#2FA8D8' },
  utilities: { label: 'Process Piping', color: '#7d848b' },
}

/** Disassembly windows (global progress 0–1) per chapter. */
export const CHAPTER_STAGES = {
  piping: [0.0, 0.1],
  biomass: [0.08, 0.3],
  biogas: [0.28, 0.52],
  electricity: [0.5, 0.68],
  water: [0.68, 0.92],
} as const satisfies Record<string, readonly [number, number]>

type Window = readonly [number, number]

/** Sub-window inside a chapter: a = 0…1 start, b = 0…1 end. */
const within = ([s, e]: Window, a: number, b: number): [number, number] => [s + (e - s) * a, s + (e - s) * b]

/** Shell + roof sub-parts generated for every corrugated tank. */
function tankParts(id: string, name: string, category: CategoryKey, roofLift: number, stage: [number, number]): PartDef[] {
  return [
    { id: `${id}-shell`, name: `${name} · Shell`, category, parent: id },
    { id: `${id}-roof`, name: `${name} · Roof`, category, parent: id, explode: [0, roofLift, 0], stage },
  ]
}

const C = CHAPTER_STAGES

/** Vertical distance between chapter layers when fully disassembled. */
export const BAND_GAP = 36
/** Layer depth per chapter (y offset when fully disassembled). */
export const BAND_Y = { biomass: -BAND_GAP, biogas: -2 * BAND_GAP, electricity: -3 * BAND_GAP, water: -4 * BAND_GAP } as const

export const PARTS: PartDef[] = [
  // ── Site (not shown in the clean white scene, kept for the full-site view) ────
  { id: 'site-terrain', name: 'Site Platform', category: 'site', parent: null },
  { id: 'site-vegetation', name: 'Surrounding Forest', category: 'site', parent: null },
  { id: 'site-laydown', name: 'Laydown Area', category: 'site', parent: null },

  // ── 00 Piping lifts off first, as one layer ───────────────────────────────────
  {
    id: 'process-piping', name: 'Process Piping', category: 'utilities', parent: null,
    explode: [0, 8, 0], stage: within(C.piping, 0, 0.8),
  },
  ...([
    ['pipe-biogas-header', 'Raw Biogas Header', 2.5],
    ['pipe-feed-line', 'MRF → EQ Feed Line', 1],
    ['pipe-substrate-feed', 'EQ → Digester Substrate Line', 1.5],
    ['pipe-digestate-line', 'Digestate Transfer Line', 2],
    ['pipe-effluent-line', 'Effluent Line to Pond', 0.5],
    ['pipe-gas-to-chp', 'Biomethane → CHP Line', 2],
    ['pipe-wetland-feed', 'Pond → Wetland Line', 0.5],
  ] as const).map(([id, name, lift]): PartDef => ({
    id, name, category: 'utilities', parent: 'process-piping', explode: [0, lift, 0], stage: within(C.piping, 0.3, 1),
  })),

  // ── 01 Biomass ────────────────────────────────────────────────────────────────
  {
    id: 'material-recovery-facility', name: 'Material Recovery Facility', category: 'feedstock', parent: null,
    position: [38, 0, -24], rotation: [0, -0.2, 0],
    explode: [0, BAND_Y.biomass, 0], stage: within(C.biomass, 0, 0.6), label: true, labelOffset: [0, 16, 0],
  },
  { id: 'mrf-slab', name: 'MRF Floor Slab', category: 'feedstock', parent: 'material-recovery-facility' },
  { id: 'mrf-equipment', name: 'Sorting Line & Baler', category: 'feedstock', parent: 'material-recovery-facility', explode: [0, 1.6, 0], stage: within(C.biomass, 0.45, 1) },
  { id: 'mrf-frame', name: 'MRF Steel Portal Frame', category: 'feedstock', parent: 'material-recovery-facility', explode: [0, 6, 0], stage: within(C.biomass, 0.35, 0.95) },
  { id: 'mrf-roof', name: 'MRF Roof', category: 'feedstock', parent: 'material-recovery-facility', explode: [0, 14, 0], stage: within(C.biomass, 0.25, 0.85) },

  {
    id: 'equalization-tanks', name: 'Equalization Tanks', category: 'feedstock', parent: null,
    position: [30, 0, -2], explode: [0, BAND_Y.biomass, 0], stage: within(C.biomass, 0.1, 0.7), label: true, labelOffset: [10, 9, 8],
  },
  { id: 'eq-tank-1', name: 'EQ Tank 1', category: 'feedstock', parent: 'equalization-tanks', explode: [-3, 0, 0], stage: within(C.biomass, 0.4, 1) },
  ...tankParts('eq-tank-1', 'EQ Tank 1', 'feedstock', 5, within(C.biomass, 0.3, 0.9)),
  { id: 'eq-tank-2', name: 'EQ Tank 2', category: 'feedstock', parent: 'equalization-tanks', explode: [3, 0, 0], stage: within(C.biomass, 0.4, 1) },
  ...tankParts('eq-tank-2', 'EQ Tank 2', 'feedstock', 5, within(C.biomass, 0.3, 0.9)),
  { id: 'eq-transfer-pumps', name: 'EQ Transfer Pump Skid', category: 'feedstock', parent: 'equalization-tanks', explode: [0, 0, 5], stage: within(C.biomass, 0.4, 1) },

  // ── 02 Quality biogas ─────────────────────────────────────────────────────────
  {
    id: 'anaerobic-digesters', name: 'Anaerobic Digesters', category: 'digestion', parent: null,
    position: [0, 0, -24], explode: [0, BAND_Y.biogas, 0], stage: within(C.biogas, 0, 0.55), label: true, labelOffset: [4, 28, 0],
  },
  { id: 'ad-tank-1', name: 'Digester 1', category: 'digestion', parent: 'anaerobic-digesters', explode: [-1, 0, -3], stage: within(C.biogas, 0.15, 0.7) },
  ...tankParts('ad-tank-1', 'Digester 1', 'digestion', 9, within(C.biogas, 0.05, 0.5)),
  { id: 'ad-tank-2', name: 'Digester 2', category: 'digestion', parent: 'anaerobic-digesters', explode: [-3, 0, 3], stage: within(C.biogas, 0.15, 0.7) },
  ...tankParts('ad-tank-2', 'Digester 2', 'digestion', 9, within(C.biogas, 0.05, 0.5)),
  { id: 'ad-tank-3', name: 'Digester 3', category: 'digestion', parent: 'anaerobic-digesters', explode: [4, 0, 0], stage: within(C.biogas, 0.15, 0.7) },
  ...tankParts('ad-tank-3', 'Digester 3', 'digestion', 9, within(C.biogas, 0.05, 0.5)),

  {
    id: 'biogas-upgrading-plant', name: 'Biogas Upgrading Plant', category: 'gas', parent: null,
    position: [-14, 0, 20], rotation: [0, -0.6, 0],
    explode: [0, BAND_Y.biogas, 0], stage: within(C.biogas, 0.3, 0.8), label: true, labelOffset: [0, 16, 0],
  },
  { id: 'bup-slab', name: 'Equipment Slab', category: 'gas', parent: 'biogas-upgrading-plant' },
  ...([
    ['bup-scrubber-column', 'Desulphurisation Scrubber Column', [-8, 0, -9], [0, 0, -6]],
    ['bup-pretreatment-shelter', 'Gas Pre-treatment Shelter', [-12, 0, 0], [0, 6, 0]],
    ['bup-control-containers', 'Control & Electrical Containers', [-3, 0, 0], [0, 4, 0]],
    ['bup-carbon-filters', 'Activated Carbon Filters', [2.2, 0, -0.6], [0, 5, 0]],
    ['bup-compressor-container', 'Compressor Container', [6.5, 0, -1.6], [0, 4, 0]],
    ['bup-membrane-skid', 'Membrane Separation Skid', [6, 0, 3.2], [0, 3, 3]],
    ['bup-compressor-shelter', 'Biomethane Compression Shelter', [14.5, 0, 0], [0, 6, 0]],
    ['bup-pipe-rack', 'Skid Pipe Rack', [0, 0, 0], [0, 9, 0]],
    ['bup-gantry-crane', 'Gantry Crane', [-24, 0, -1], [-6, 0, 0]],
    ['bup-water-tanks', 'Process Water Tanks', [-25, 0, 4], [-4, 0, 4]],
    ['bup-genset', 'Standby Generator', [10, 0, -7.5], [0, 0, -5]],
  ] as const).map(([id, name, position, explode], i): PartDef => ({
    id, name, category: 'gas', parent: 'biogas-upgrading-plant',
    position: [...position] as Vec3, explode: [...explode] as Vec3,
    stage: within(C.biogas, 0.55 + i * 0.012, 0.92 + i * 0.008),
  })),

  // ── 03 Electricity ────────────────────────────────────────────────────────────
  {
    id: 'power-generation', name: 'CHP Power Plant', category: 'power', parent: null,
    position: [20, 0, 22], explode: [0, BAND_Y.electricity, 0], stage: within(C.electricity, 0, 0.6), label: true, labelOffset: [0, 12, 0],
  },
  { id: 'chp-engine-1', name: 'CHP Gas Engine 1', category: 'power', parent: 'power-generation', explode: [0, 4, -3], stage: within(C.electricity, 0.35, 1) },
  { id: 'chp-engine-2', name: 'CHP Gas Engine 2', category: 'power', parent: 'power-generation', explode: [0, 4, 3], stage: within(C.electricity, 0.35, 1) },
  {
    id: 'power-transformer', name: 'Step-up Transformer', category: 'power', parent: 'power-generation',
    position: [10, 0.3, 0], explode: [5, 2, 0], stage: within(C.electricity, 0.35, 1),
  },
  { id: 'power-grid-line', name: 'Grid Export Line', category: 'power', parent: null },

  // ── 04 Digestate & water ──────────────────────────────────────────────────────
  {
    id: 'fertilizer-tank', name: 'Fertilizer Tank', category: 'digestion', parent: null,
    position: [6, 0, 4], explode: [0, BAND_Y.water, 0], stage: within(C.water, 0, 0.5), label: true, labelOffset: [0, 18, 0],
  },
  ...tankParts('fertilizer-tank', 'Fertilizer Tank', 'digestion', 7, within(C.water, 0.1, 0.6)),
  {
    id: 'constructed-wetlands', name: 'Constructed Wetlands', category: 'water', parent: null,
    position: [-40, 0, -32], explode: [0, BAND_Y.water, 0], stage: within(C.water, 0.15, 0.7), label: true, labelOffset: [0, 8, 0],
  },
  ...[1, 2, 3, 4, 5, 6].map((n): PartDef => ({
    id: `wetland-cell-${n}`, name: `Wetland Cell ${n}`, category: 'water', parent: 'constructed-wetlands',
    explode: [0, 1 + n * 0.5, 0], stage: within(C.water, 0.4 + n * 0.04, 0.75 + n * 0.04),
  })),
  { id: 'wetland-distribution', name: 'Wetland Distribution Header', category: 'water', parent: 'constructed-wetlands', explode: [0, 0, 4], stage: within(C.water, 0.5, 1) },
  {
    id: 'polishing-pond', name: 'Polishing Pond', category: 'water', parent: null,
    position: [-34, 0, -8], explode: [0, BAND_Y.water, 0], stage: within(C.water, 0.1, 0.65), label: true, labelOffset: [0, 5, 0],
  },
  {
    id: 'inlet-sumps', name: 'Sludge Sumps', category: 'water', parent: null,
    position: [-60, 0, -12], explode: [0, BAND_Y.water, 0], stage: within(C.water, 0.2, 0.75),
  },
]

export const PART_INDEX: Record<string, PartDef> = Object.fromEntries(PARTS.map((p) => [p.id, p]))

export const childrenOf = (id: string): PartDef[] => PARTS.filter((p) => p.parent === id)
export const TOP_LEVEL_PARTS = PARTS.filter((p) => p.parent === null)

/** Plan positions (x, z) of the overhead export line poles, heading east off-site. */
export const GRID_LINE_POLES: [number, number][] = [[34, 24], [54, 19], [76, 13], [100, 7], [126, 1], [154, -5]]
