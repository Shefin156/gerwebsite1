import { useMemo, useRef, type MutableRefObject } from 'react'
import { ExplodeContext, type ExplodeContextValue } from './Part'
import { SiteTerrain, Vegetation, LaydownArea } from './parts/Site'
import { MaterialRecoveryFacility } from './parts/MaterialRecoveryFacility'
import { AnaerobicDigestionTanks, EqualizationTanks, FertilizerTank } from './parts/Tanks'
import { BiogasUpgradingPlant } from './parts/BiogasUpgradingPlant'
import { ConstructedWetlands, PolishingPond, InletSumps } from './parts/WaterTreatment'
import { ProcessPiping } from './parts/ProcessPiping'
import { PowerGeneration, GridLine } from './parts/PowerGeneration'

/**
 * Complete waste-to-biomethane plant ("Main Plant – Top Platform").
 *
 * explode     – 0 (assembled) … 1 (fully split). Convenient for sliders / state.
 * explodeRef  – alternatively pass a ref and mutate `.current` from a scroll handler
 *               to drive the animation without re-rendering React.
 * smoothing   – motion damping (0 = follow the value exactly, ideal for scrubbed scroll).
 * showSite    – terrain, forest and laydown clutter.
 * showLabels  – floating name tags on the major units (true, or an array of part ids).
 * overridesRef – ref of { [partId]: 0‒1 } explode values that bypass `explode` for those parts.
 */
interface BiogasPlantProps {
  explode?: number
  explodeRef?: MutableRefObject<number>
  overridesRef?: MutableRefObject<Record<string, number>>
  smoothing?: number
  showSite?: boolean
  showLabels?: ExplodeContextValue['showLabels']
  /** Number of trees in the surrounding forest (lower it on mobile). */
  treeCount?: number
  /** Overhead export line running off-site to the east. */
  showGridLine?: boolean
  /** DOM node for name tags (required when rendered inside drei <ScrollControls>). */
  labelPortal?: MutableRefObject<HTMLElement>
}

export function BiogasPlant({
  explode = 0, explodeRef, overridesRef, smoothing = 8, showSite = true, showLabels = false, treeCount = 900, showGridLine = true, labelPortal,
}: BiogasPlantProps) {
  const internal = useRef(explode)
  if (!explodeRef) internal.current = explode
  const progress = explodeRef ?? internal
  const noOverrides = useRef<Record<string, number>>({})
  const overrides = overridesRef ?? noOverrides

  const ctx = useMemo<ExplodeContextValue>(() => ({ progress, smoothing, showLabels, overrides, labelPortal }), [progress, smoothing, showLabels, overrides, labelPortal])

  return (
    <ExplodeContext.Provider value={ctx}>
      <group name="biogas-plant">
        {showSite && (
          <>
            <SiteTerrain />
            <Vegetation count={treeCount} />
            <LaydownArea />
          </>
        )}
        <MaterialRecoveryFacility />
        <EqualizationTanks />
        <AnaerobicDigestionTanks />
        <FertilizerTank />
        <BiogasUpgradingPlant />
        <ConstructedWetlands />
        <PolishingPond />
        <InletSumps />
        <PowerGeneration />
        {showGridLine && <GridLine />}
        <ProcessPiping />
      </group>
    </ExplodeContext.Provider>
  )
}
