import { useMemo } from 'react'
import * as THREE from 'three'
import { Part } from '../Part'
import { M, useCorrugatedMaterial, usePanelMaterial } from '../materials'
import { polar } from '../utils'
import { Ladder } from './Ladder'
import { SoftShadow } from './SoftShadow'

interface CorrugatedTankProps {
  id: string
  radius?: number
  height?: number
  roof?: keyof typeof ROOF_COLORS
  roofRise?: number
  contents?: THREE.Material
  fillLevel?: number
  ladderAngle?: number
  nozzles?: number[]
  mixers?: number
}

const ROOF_COLORS = { green: '#79a693', white: '#eef1f2' } as const
const PLINTH_H = 0.4

/** Height of the conical roof surface at radius r (0 at the rim, `rise` at the centre). */
const roofY = (r: number, R: number, rise: number) => rise * (1 - Math.pow(Math.min(r / R, 1), 1.15))

/**
 * Bolted, horizontally-corrugated galvanised steel tank with a ribbed conical roof.
 * Renders two explodable sub-parts: `${id}-shell` and `${id}-roof`.
 *
 * contents   – material for the liquid surface (visible when the roof lifts off)
 * fillLevel  – liquid height as a fraction of the shell
 * mixers     – number of top-entry mixer drives on the roof
 */
export function CorrugatedTank({
  id,
  radius = 8,
  height = 10,
  roof = 'green',
  roofRise = radius * 0.16,
  contents = M.digestate,
  fillLevel = 0.8,
  ladderAngle = Math.PI * 0.8,
  nozzles = [Math.PI * 0.2, Math.PI * 1.1, Math.PI * 1.6],
  mixers = 0,
}: CorrugatedTankProps) {
  const shellGeometry = useMemo(() => {
    const pitch = 0.32
    const amp = 0.035
    const steps = Math.ceil(height / pitch) * 6
    const pts: THREE.Vector2[] = []
    for (let i = 0; i <= steps; i++) {
      const y = (i / steps) * height
      pts.push(new THREE.Vector2(radius + amp * Math.sin((y / pitch) * Math.PI * 2), y))
    }
    return new THREE.LatheGeometry(pts, 80)
  }, [radius, height])

  const roofGeometry = useMemo(() => {
    const R = radius + 0.25
    const pts: THREE.Vector2[] = []
    for (let i = 0; i <= 24; i++) {
      const r = R * (1 - i / 24)
      pts.push(new THREE.Vector2(Math.max(r, 0.001), roofY(r, R, roofRise)))
    }
    return new THREE.LatheGeometry(pts, 80)
  }, [radius, roofRise])

  const panelsAround = Math.round((Math.PI * 2 * radius) / 2.4)
  const shellMaterial = usePanelMaterial('#dde1e3', panelsAround, height / 1.25)
  const roofMaterial = useCorrugatedMaterial(ROOF_COLORS[roof], Math.round(radius * 9), {
    side: THREE.DoubleSide, metalness: 0.45, roughness: 0.42,
  })

  const ladderTop = height + PLINTH_H
  const rimR = radius - 0.25

  return (
    <group>
      <SoftShadow size={[radius * 2.4, radius * 2.4]} />
      {/* ring foundation – stays with the tank origin */}
      <mesh position={[0, PLINTH_H / 2, 0]} material={M.concrete} receiveShadow castShadow>
        <cylinderGeometry args={[radius + 0.5, radius + 0.7, PLINTH_H, 64]} />
      </mesh>

      <Part id={`${id}-shell`}>
        <mesh position={[0, PLINTH_H, 0]} geometry={shellGeometry} material={shellMaterial} castShadow receiveShadow />
        {/* top curb angle */}
        <mesh position={[0, PLINTH_H + height, 0]} rotation-x={Math.PI / 2} material={M.galvanized}>
          <torusGeometry args={[radius + 0.04, 0.07, 6, 80]} />
        </mesh>
        {/* floor + liquid surface (revealed when the roof is lifted) */}
        <mesh position={[0, PLINTH_H + 0.02, 0]} rotation-x={-Math.PI / 2} material={M.concreteDark}>
          <circleGeometry args={[radius - 0.02, 48]} />
        </mesh>
        <mesh position={[0, PLINTH_H + height * fillLevel, 0]} rotation-x={-Math.PI / 2} material={contents}>
          <circleGeometry args={[radius - 0.05, 64]} />
        </mesh>

        <group position={polar(radius + 0.32, ladderAngle, PLINTH_H)} rotation-y={ladderAngle}>
          <Ladder height={height} />
        </group>

        {nozzles.map((a) => (
          <group key={a} position={polar(radius, a, PLINTH_H + 0.9)} rotation-y={a}>
            <mesh position={[0, 0, 0.45]} rotation-x={Math.PI / 2} material={M.pipeGrey} castShadow>
              <cylinderGeometry args={[0.18, 0.18, 0.9, 16]} />
            </mesh>
            <mesh position={[0, 0, 0.9]} rotation-x={Math.PI / 2} material={M.steelDark}>
              <cylinderGeometry args={[0.3, 0.3, 0.06, 20]} />
            </mesh>
          </group>
        ))}
        {/* shell manway */}
        <group position={polar(radius + 0.05, ladderAngle + 0.5, PLINTH_H + 1)} rotation-y={ladderAngle + 0.5}>
          <mesh rotation-x={Math.PI / 2} material={M.galvanized} castShadow>
            <cylinderGeometry args={[0.45, 0.45, 0.2, 24]} />
          </mesh>
        </group>
      </Part>

      <Part id={`${id}-roof`} position={[0, ladderTop, 0]}>
        <mesh geometry={roofGeometry} material={roofMaterial} castShadow receiveShadow />
        {/* eave fascia */}
        <mesh position={[0, -0.12, 0]} material={M.galvanized}>
          <cylinderGeometry args={[radius + 0.27, radius + 0.27, 0.24, 80, 1, true]} />
        </mesh>
        {/* centre vent */}
        <mesh position={[0, roofRise + 0.35, 0]} material={M.galvanized} castShadow>
          <cylinderGeometry args={[0.35, 0.45, 0.7, 20]} />
        </mesh>
        <mesh position={[0, roofRise + 0.75, 0]} material={M.galvanized}>
          <coneGeometry args={[0.6, 0.3, 20]} />
        </mesh>
        {/* roof hatch above the ladder */}
        <group position={polar(radius - 1.6, ladderAngle, roofY(radius - 1.6, radius, roofRise) + 0.1)} rotation-y={ladderAngle}>
          <mesh material={M.galvanized} castShadow>
            <boxGeometry args={[0.9, 0.2, 0.9]} />
          </mesh>
        </group>
        {/* guard rail at the ladder landing */}
        <group rotation-y={ladderAngle}>
          <mesh position={[0, 1.05, 0]} rotation={[-Math.PI / 2, 0, -Math.PI / 2 - 0.22]} material={M.yellow}>
            <torusGeometry args={[rimR, 0.03, 4, 24, 0.44]} />
          </mesh>
          {[-0.22, -0.11, 0, 0.11, 0.22].map((d) => (
            <mesh key={d} position={polar(rimR, d, 0.55)} material={M.yellow}>
              <cylinderGeometry args={[0.025, 0.025, 1.1, 6]} />
            </mesh>
          ))}
        </group>
        {/* top-entry mixer drives */}
        {Array.from({ length: mixers }, (_, i) => {
          const a = (i / mixers) * Math.PI * 2 + 0.6
          const r = radius * 0.45
          return (
            <group key={i} position={polar(r, a, roofY(r, radius, roofRise))}>
              <mesh position={[0, 0.25, 0]} material={M.steel} castShadow>
                <boxGeometry args={[1.1, 0.5, 1.1]} />
              </mesh>
              <mesh position={[0, 0.95, 0]} material={M.blue} castShadow>
                <cylinderGeometry args={[0.3, 0.3, 0.9, 16]} />
              </mesh>
            </group>
          )
        })}
      </Part>
    </group>
  )
}
