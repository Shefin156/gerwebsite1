import * as THREE from 'three'
import { useMemo } from 'react'
import { TEX } from './textures'
import { THEME } from '../theme'

type StdParams = THREE.MeshStandardMaterialParameters

const std = (params: StdParams) => new THREE.MeshStandardMaterial(params)

function textured(tex: THREE.Texture, repeat: [number, number], params: StdParams) {
  const map = tex.clone()
  map.repeat.set(...repeat)
  map.needsUpdate = true
  return std({ map, ...params })
}

/** Shared material palette. Reuse these instead of creating inline materials. */
export const M = {
  // structure
  concrete: std({ color: '#d6d5cc', roughness: 0.95 }),
  concreteDark: std({ color: '#b2b0a6', roughness: 0.95 }),
  steel: std({ color: '#959ca1', metalness: 0.6, roughness: 0.45 }),
  steelDark: std({ color: '#545b60', metalness: 0.5, roughness: 0.55 }),
  galvanized: std({ color: '#cdd2d5', metalness: 0.55, roughness: 0.4 }),

  // paint & finishes
  white: std({ color: '#f1f3f1', roughness: 0.55 }),
  offWhite: std({ color: '#e0e3e0', roughness: 0.6 }),
  yellow: std({ color: '#ddb33a', roughness: 0.5, metalness: 0.2 }),
  red: std({ color: '#a8423a', roughness: 0.6, metalness: 0.2 }),
  blue: std({ color: '#3f6fa8', roughness: 0.5 }),
  green: std({ color: '#4a8259', roughness: 0.55 }),
  black: std({ color: '#25282a', roughness: 0.6 }),
  rubber: std({ color: '#161718', roughness: 0.9 }),
  glassDark: std({ color: '#2c3a40', roughness: 0.15, metalness: 0.4 }),

  // piping
  pipeGrey: std({ color: '#a0a7ab', metalness: 0.5, roughness: 0.4 }),
  pipeGas: std({ color: '#d7b24a', metalness: 0.3, roughness: 0.45 }),
  pipeWater: std({ color: '#4f7fa8', metalness: 0.3, roughness: 0.45 }),
  pipeSludge: std({ color: '#7a6750', metalness: 0.2, roughness: 0.6 }),

  // liquids & lined basins
  liner: std({ color: '#2b3230', roughness: 0.7 }),
  digestate: std({ color: '#55452f', roughness: 0.3 }),
  water: std({ color: '#5f9d97', roughness: 0.12, metalness: 0.15 }),
  waterLight: std({ color: '#b2d8c3', roughness: 0.18, metalness: 0.05 }),
  waterDark: std({ color: '#3a6a70', roughness: 0.1, metalness: 0.15 }),
  sludge: std({ color: '#332e29', roughness: 0.35 }),

  // ground
  sand: textured(TEX.sand, [1 / 18, 1 / 18], { color: THEME.sand, roughness: 1 }),
  forestFloor: textured(TEX.soil, [1 / 25, 1 / 25], { color: THEME.forestFloor, roughness: 1 }),
  gravel: textured(TEX.gravel, [3, 2], { color: '#d8c8a5', roughness: 1 }),
  wasteMixed: textured(TEX.gravel, [2, 2], { color: '#8f826d', roughness: 1 }),

  // vegetation
  reed: std({ color: '#76984a', roughness: 0.9 }),
  trunk: std({ color: '#6d5a45', roughness: 1 }),
  foliage: std({ color: '#ffffff', roughness: 0.9, flatShading: true }), // tinted per instance
}

/** Corrugated sheet material; `ribs` = rib periods across the face (U). */
export function useCorrugatedMaterial(color: string, ribs: number, params: StdParams = {}) {
  return useMemo(
    () => textured(TEX.rib, [ribs, 1], { color, metalness: 0.35, roughness: 0.55, ...params }),
    // params are static literals at every call site
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [color, ribs],
  )
}

/** Bolted panel material with per-object panel counts (tank shells). */
export function usePanelMaterial(color: string, repeatU: number, repeatV: number) {
  return useMemo(
    () => textured(TEX.panel, [repeatU, repeatV], { color, metalness: 0.5, roughness: 0.42, side: THREE.DoubleSide }),
    [color, repeatU, repeatV],
  )
}
