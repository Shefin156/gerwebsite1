import { Part } from '../Part'
import { M } from '../materials'
import { Canopy } from '../primitives/GableRoof'
import { Ladder } from '../primitives/Ladder'
import { MachineSkid, PipeRun, ShippingContainer, VerticalVessel } from '../primitives/Equipment'
import { SoftShadow } from '../primitives/SoftShadow'

// Local frame: the skid runs along +X (≈ 39 m), Z is across the slab (≈ 11 m).
const SLAB = { x: -0.5, length: 39, width: 11 }

/** Containerised biogas-to-biomethane upgrading train (front-left of the site). */
export function BiogasUpgradingPlant() {
  return (
    <Part id="biogas-upgrading-plant">
      <SoftShadow size={[SLAB.length + 12, SLAB.width + 2]} position={[SLAB.x - 4, 0.02, 0]} />
      <Part id="bup-slab">
        <mesh position={[SLAB.x, 0.15, 0]} material={M.concrete} receiveShadow castShadow>
          <boxGeometry args={[SLAB.length, 0.3, SLAB.width]} />
        </mesh>
        {/* kerb / bund edge */}
        {[-1, 1].map((s) => (
          <mesh key={s} position={[SLAB.x, 0.4, (s * (SLAB.width - 0.3)) / 2]} material={M.concreteDark}>
            <boxGeometry args={[SLAB.length, 0.2, 0.3]} />
          </mesh>
        ))}
      </Part>

      <Part id="bup-scrubber-column">
        <ScrubberColumn />
      </Part>

      <Part id="bup-pretreatment-shelter">
        <Canopy length={8} span={8} eave={3.4} rise={1.3} bays={2} color="#a3322c">
          <group position={[-1.8, 0.3, -1.6]}>
            <MachineSkid size={[2.4, 1.6, 1.4]} material={M.white} fans={2} />
          </group>
          <group position={[1.6, 0.3, -1.8]}>
            <VerticalVessel radius={0.55} height={2} legs={0.5} />
          </group>
          <group position={[2.9, 0.3, -1.8]}>
            <VerticalVessel radius={0.55} height={2} legs={0.5} />
          </group>
          <group position={[0.5, 0.3, 1.8]}>
            <MachineSkid size={[3, 1, 1.2]} material={M.blue} />
          </group>
          <group position={[-2.6, 0.3, 2]}>
            <MachineSkid size={[1.2, 1.2, 1.2]} material={M.white} />
          </group>
        </Canopy>
      </Part>

      <Part id="bup-control-containers">
        <group position={[0, 0.3, -1.45]}>
          <ShippingContainer length={6.06} acUnits={0} />
        </group>
        <group position={[0, 0.3, 1.25]}>
          <ShippingContainer length={6.06} acUnits={2} />
        </group>
        <group position={[-1.5, 0.3, 3.9]}>
          <ShippingContainer length={2.99} color="#2f5d9c" doors={false} />
        </group>
      </Part>

      <Part id="bup-carbon-filters">
        {[-1.5, 1.2].map((z) => (
          <group key={z} position={[0, 0.3, z]}>
            <VerticalVessel radius={0.85} height={3.6} legs={0.9} />
          </group>
        ))}
        <PipeRun points={[[0, 5.6, -1.5], [0, 5.9, -1.5], [0, 5.9, 1.2], [0, 5.6, 1.2]]} radius={0.12} supports={false} />
      </Part>

      <Part id="bup-compressor-container">
        <group position={[0, 0.3, 0]}>
          <ShippingContainer length={6.06} color="#8c9399" acUnits={0} />
        </group>
        {/* roof-mounted cooler */}
        <group position={[0, 2.9, 0]}>
          <MachineSkid size={[3.6, 0.6, 1.8]} material={M.offWhite} fans={3} />
        </group>
      </Part>

      <Part id="bup-membrane-skid">
        <MembraneSkid />
      </Part>

      <Part id="bup-compressor-shelter">
        <Canopy length={9} span={8} eave={3.6} rise={1.4} bays={3} color="#a3322c">
          {[-2.4, 1.2].map((x) => (
            <group key={x} position={[x, 0.3, -1.4]}>
              <MachineSkid size={[2.6, 1.7, 1.6]} material={M.steel} />
            </group>
          ))}
          <group position={[-0.5, 0.3, 2]}>
            <MachineSkid size={[4, 1.2, 1.4]} material={M.white} fans={3} />
          </group>
          <group position={[3.2, 0.3, 2]}>
            <VerticalVessel radius={0.45} height={1.8} legs={0.4} material={M.steel} />
          </group>
        </Canopy>
      </Part>

      <Part id="bup-pipe-rack">
        <PipeRack />
      </Part>

      <Part id="bup-gantry-crane">
        <GantryCrane />
      </Part>

      <Part id="bup-water-tanks">
        {[[0, 0], [1.9, 0.2], [0.9, 1.7]].map(([x, z]) => (
          <group key={`${x}${z}`} position={[x, 0, z]}>
            <mesh position={[0, 0.95, 0]} material={M.black} castShadow receiveShadow>
              <cylinderGeometry args={[0.8, 0.8, 1.9, 24]} />
            </mesh>
            <mesh position={[0, 1.95, 0]} material={M.black}>
              <cylinderGeometry args={[0.25, 0.25, 0.15, 12]} />
            </mesh>
          </group>
        ))}
      </Part>

      <Part id="bup-genset">
        <mesh position={[0, 0.1, 0]} material={M.concrete} receiveShadow>
          <boxGeometry args={[4.4, 0.2, 2.6]} />
        </mesh>
        <mesh position={[0, 1.2, 0]} material={M.yellow} castShadow>
          <boxGeometry args={[3.6, 2, 1.7]} />
        </mesh>
        <mesh position={[0, 1.2, 0.86]} material={M.steelDark}>
          <boxGeometry args={[2.4, 1.2, 0.02]} />
        </mesh>
        <mesh position={[1.3, 2.6, 0]} material={M.steelDark} castShadow>
          <cylinderGeometry args={[0.12, 0.12, 1, 10]} />
        </mesh>
      </Part>
    </Part>
  )
}

function ScrubberColumn() {
  const R = 1.3
  const H = 11.5
  return (
    <group>
      <SoftShadow size={[4, 4]} />
      <mesh position={[0, 0.15, 0]} material={M.concrete} receiveShadow>
        <boxGeometry args={[4, 0.3, 4]} />
      </mesh>
      {/* skirt */}
      <mesh position={[0, 0.9, 0]} material={M.offWhite} castShadow>
        <cylinderGeometry args={[R, R + 0.1, 1.2, 32]} />
      </mesh>
      <mesh position={[0, 1.5 + H / 2, 0]} material={M.white} castShadow receiveShadow>
        <cylinderGeometry args={[R, R, H, 40]} />
      </mesh>
      <mesh position={[0, 1.5 + H, 0]} scale={[1, 0.45, 1]} material={M.white} castShadow>
        <sphereGeometry args={[R, 40, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
      </mesh>
      {/* circumferential weld seams */}
      {[3.5, 6.5, 9.5].map((y) => (
        <mesh key={y} position={[0, 1.5 + y, 0]} rotation-x={Math.PI / 2} material={M.offWhite}>
          <torusGeometry args={[R + 0.01, 0.025, 4, 40]} />
        </mesh>
      ))}
      {/* side nozzles + outlet pipe */}
      <PipeRun points={[[0, 13.6, 0], [0, 14.2, 0], [1.8, 14.2, 0], [1.8, 2.2, 0], [3.5, 2.2, 0]]} radius={0.14} material={M.pipeGas} supports={false} />
      <group position={[0, 0.3, -R - 0.3]} rotation-y={Math.PI}>
        <Ladder height={H + 1.3} />
      </group>
      {/* top platform */}
      <mesh position={[0, 1.5 + H + 0.05, -R - 0.4]} material={M.steelDark}>
        <boxGeometry args={[1.6, 0.08, 1]} />
      </mesh>
    </group>
  )
}

function MembraneSkid() {
  const len = 8
  return (
    <group position={[0, 0.3, 0]}>
      {/* frame */}
      {[-3.6, -1.2, 1.2, 3.6].map((x) =>
        [-0.6, 0.6].map((z) => (
          <mesh key={`${x}${z}`} position={[x, 0.9, z]} material={M.steel}>
            <boxGeometry args={[0.12, 1.8, 0.12]} />
          </mesh>
        )),
      )}
      {[0.5, 1.75].map((y) =>
        [-0.6, 0.6].map((z) => (
          <mesh key={`${y}${z}`} position={[0, y, z]} material={M.steel}>
            <boxGeometry args={[len, 0.1, 0.1]} />
          </mesh>
        )),
      )}
      {/* membrane module tubes */}
      {[0.75, 1.25].map((y) =>
        [-0.4, 0, 0.4].map((z) => (
          <mesh key={`${y}${z}`} position={[0, y, z]} rotation-z={Math.PI / 2} material={M.white} castShadow>
            <cylinderGeometry args={[0.17, 0.17, len - 0.4, 16]} />
          </mesh>
        )),
      )}
    </group>
  )
}

function PipeRack() {
  const z = -4.6
  const x0 = -16
  const x1 = 18
  const h = 2.4
  return (
    <group>
      {Array.from({ length: 9 }, (_, i) => x0 + (i * (x1 - x0)) / 8).map((x) => (
        <group key={x} position={[x, 0.3, z]}>
          {[-0.4, 0.4].map((dz) => (
            <mesh key={dz} position={[0, h / 2, dz]} material={M.steelDark}>
              <boxGeometry args={[0.15, h, 0.15]} />
            </mesh>
          ))}
          <mesh position={[0, h, 0]} material={M.steelDark}>
            <boxGeometry args={[0.15, 0.15, 1.1]} />
          </mesh>
        </group>
      ))}
      <PipeRun points={[[x0, h + 0.5, z - 0.25], [x1, h + 0.5, z - 0.25]]} radius={0.16} material={M.pipeGas} supports={false} />
      <PipeRun points={[[x0, h + 0.5, z + 0.2], [x1, h + 0.5, z + 0.2]]} radius={0.1} material={M.pipeGrey} supports={false} />
      <PipeRun points={[[x0 + 2, h + 0.45, z + 0.45], [x1, h + 0.45, z + 0.45]]} radius={0.07} material={M.pipeWater} supports={false} />
      {/* long white process line along the front edge of the slab */}
      <PipeRun points={[[-16, 0.75, 5.0], [16, 0.75, 5.0]]} radius={0.2} material={M.white} supports={false} />
      {[-14, -6, 2, 10].map((x) => (
        <mesh key={x} position={[x, 0.45, 5.0]} material={M.steelDark}>
          <boxGeometry args={[0.2, 0.35, 0.5]} />
        </mesh>
      ))}
    </group>
  )
}

function GantryCrane() {
  const span = 13
  const h = 6.2
  const legSpread = 2.4
  const legAngle = Math.atan2(legSpread / 2, h)
  const legLen = Math.hypot(legSpread / 2, h)
  return (
    <group>
      {/* main beam along X */}
      <mesh position={[0, h + 0.25, 0]} material={M.yellow} castShadow>
        <boxGeometry args={[span + 1, 0.5, 0.35]} />
      </mesh>
      {[-span / 2, span / 2].map((x) => (
        <group key={x} position={[x, 0, 0]}>
          {[-1, 1].map((s) => (
            <mesh key={s} position={[0, h / 2, (s * legSpread) / 4]} rotation-x={-s * legAngle} material={M.yellow} castShadow>
              <boxGeometry args={[0.28, legLen, 0.28]} />
            </mesh>
          ))}
          <mesh position={[0, 0.25, 0]} material={M.yellow}>
            <boxGeometry args={[0.35, 0.3, legSpread + 1]} />
          </mesh>
          {[-1, 1].map((s) => (
            <mesh key={`w${s}`} position={[0, 0.2, s * (legSpread / 2 + 0.4)]} rotation-z={Math.PI / 2} material={M.rubber}>
              <cylinderGeometry args={[0.2, 0.2, 0.25, 12]} />
            </mesh>
          ))}
        </group>
      ))}
      {/* trolley + chain hoist */}
      <group position={[2, h - 0.1, 0]}>
        <mesh material={M.steelDark}>
          <boxGeometry args={[0.8, 0.3, 0.6]} />
        </mesh>
        <mesh position={[0, -1.2, 0]} material={M.steelDark}>
          <cylinderGeometry args={[0.02, 0.02, 2.2, 4]} />
        </mesh>
        <mesh position={[0, -2.4, 0]} material={M.yellow}>
          <boxGeometry args={[0.3, 0.3, 0.2]} />
        </mesh>
      </group>
    </group>
  )
}
