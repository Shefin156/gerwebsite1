import { Part } from '../Part'
import { M } from '../materials'
import { CorrugatedTank } from '../primitives/CorrugatedTank'
import { MachineSkid, PipeRun } from '../primitives/Equipment'

/** Three large mesophilic digesters (back-centre of the platform). */
export function AnaerobicDigestionTanks() {
  return (
    <Part id="anaerobic-digesters">
      <Part id="ad-tank-1" position={[-2, 0, -10]}>
        <CorrugatedTank id="ad-tank-1" radius={8} height={11} mixers={2} ladderAngle={Math.PI * 0.75} />
      </Part>
      <Part id="ad-tank-2" position={[-6, 0, 8]}>
        <CorrugatedTank id="ad-tank-2" radius={9} height={13} mixers={3} ladderAngle={Math.PI * 1.25} />
      </Part>
      <Part id="ad-tank-3" position={[14, 0, 0]}>
        <CorrugatedTank id="ad-tank-3" radius={8.5} height={12} mixers={2} ladderAngle={Math.PI * 0.35} />
      </Part>
    </Part>
  )
}

/** Digestate storage – sold as liquid fertilizer. Distinctive white roof. */
export function FertilizerTank() {
  return (
    <Part id="fertilizer-tank">
      <CorrugatedTank
        id="fertilizer-tank"
        radius={6.5}
        height={9}
        roof="white"
        roofRise={0.9}
        ladderAngle={Math.PI * 1.7}
        contents={M.sludge}
        fillLevel={0.65}
      />
    </Part>
  )
}

/** Two equalisation tanks buffering MRF slurry ahead of the digesters. */
export function EqualizationTanks() {
  return (
    <Part id="equalization-tanks">
      <Part id="eq-tank-1" position={[-6, 0, -2]}>
        <CorrugatedTank id="eq-tank-1" radius={5} height={6.5} ladderAngle={Math.PI * 0.9} nozzles={[Math.PI * 0.5, Math.PI * 1.5]} contents={M.wasteMixed} />
      </Part>
      <Part id="eq-tank-2" position={[6, 0, 2]}>
        <CorrugatedTank id="eq-tank-2" radius={5} height={6.5} ladderAngle={Math.PI * 1.1} nozzles={[Math.PI * 1.5, Math.PI * 0.2]} contents={M.wasteMixed} />
      </Part>
      <Part id="eq-transfer-pumps" position={[0, 0, 4.5]}>
        <mesh position={[0, 0.1, 0]} material={M.concrete} receiveShadow>
          <boxGeometry args={[4.4, 0.2, 2.4]} />
        </mesh>
        {[-1.1, 1.1].map((x) => (
          <group key={x} position={[x, 0.2, 0]}>
            <MachineSkid size={[1.6, 0.8, 0.9]} material={M.blue} />
          </group>
        ))}
        <PipeRun points={[[-1.1, 1.3, 0], [-1.1, 1.3, -1.6], [1.1, 1.3, -1.6], [1.1, 1.3, 0]]} radius={0.1} supports={false} />
      </Part>
    </Part>
  )
}
