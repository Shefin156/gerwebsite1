/**
 * Single colour source for both the UI (Tailwind reads this file) and the 3D scene,
 * so the page and the model always match.
 */
export const THEME = {
  // UI
  canvas: '#FFFFFF',
  canvasDeep: '#F5F8F4',
  primary: '#2F7D4F',
  primarySoft: '#4E9A6B',
  lightGreen: '#CDE6C8',
  ink: '#1C2A21',
  muted: '#5D6F63',
  hairline: '#DCE8D8',

  // scene
  background: '#FFFFFF',
  hemiSky: '#FFFFFF',
  hemiGround: '#DDE3DA',
  shadowOpacity: 0.11,
  sand: '#ECEFE3',
  forestFloor: '#9DB58A',
  foliage: ['#5E8F55', '#6FA062', '#7FAE6E', '#4F7F4A', '#88B57A', '#689A5C'],
} as const

/** Accent colours for the process chapters (eyebrow dots, chain indicator). */
export const FLOW = {
  biomass: '#7CB342',
  rawGas: '#F2A93B',
  qualityGas: '#3FBF8F',
  electricity: '#2FA8D8',
  digestate: '#8D6E4A',
  water: '#4FA3C7',
} as const
