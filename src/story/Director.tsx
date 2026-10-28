import { useEffect, useRef, type MutableRefObject } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useScroll } from '@react-three/drei'
import * as THREE from 'three'
import {
  NARROW, VIEW_SHIFT, WIDE_FOV, cameraAt, chapterIndexAt, disassemblyAt, footerAt, textSideAt, textWeight,
} from './timeline'

/** DOM nodes the director updates every frame (no React state per frame). */
export interface OverlayHandles {
  blocks: MutableRefObject<(HTMLElement | null)[]>
  progress: MutableRefObject<HTMLDivElement | null>
  /** Soft white fades behind the text column: [left, right]. */
  scrims: MutableRefObject<(HTMLDivElement | null)[]>
  scrollHint: MutableRefObject<HTMLDivElement | null>
  /** Canvas + overlay wrapper; pushed up as the footer slides in. */
  stage: MutableRefObject<HTMLDivElement | null>
  footer: MutableRefObject<HTMLElement | null>
  /** Filled in by the director so the nav can scroll the ScrollControls container. */
  scrollEl: MutableRefObject<HTMLElement | null>
}

interface DirectorProps {
  overlay: OverlayHandles
  disassemblyRef: MutableRefObject<number>
  narrow: boolean
  onChapterChange: (index: number) => void
}

/**
 * Turns the scroll offset into: disassembly progress, a continuous camera path down the
 * stack, a gentle shift of the scene away from the text, the overlay's opacity/position
 * and the footer reveal. Everything derives from `scroll.offset`, so scrolling up reverses it.
 */
export function Director({ overlay, disassemblyRef, narrow, onChapterChange }: DirectorProps) {
  const scroll = useScroll()
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera
  const size = useThree((s) => s.size)

  const desiredPos = useRef(new THREE.Vector3())
  const desiredTarget = useRef(new THREE.Vector3())
  const lookAt = useRef<THREE.Vector3 | null>(null)
  const shift = useRef(0)
  const lastChapter = useRef(-1)

  useEffect(() => {
    overlay.scrollEl.current = scroll.el
  }, [overlay, scroll.el])

  useEffect(() => {
    camera.fov = narrow ? NARROW.fov : WIDE_FOV
    camera.updateProjectionMatrix()
  }, [camera, narrow])

  useEffect(() => () => camera.clearViewOffset(), [camera])

  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 0.1)
    const o = scroll.offset

    disassemblyRef.current = disassemblyAt(o)

    // camera – snap on the first frame, then damp along the scroll-derived path
    cameraAt(o, narrow, desiredPos.current, desiredTarget.current)
    if (!lookAt.current) {
      lookAt.current = desiredTarget.current.clone()
      camera.position.copy(desiredPos.current)
    }
    const k = 1 - Math.exp(-5 * dt)
    camera.position.lerp(desiredPos.current, k)
    lookAt.current.lerp(desiredTarget.current, k)
    camera.lookAt(lookAt.current)

    // keep the model clear of the text column (desktop only)
    const side = textSideAt(o)
    shift.current = THREE.MathUtils.damp(shift.current, narrow ? 0 : -side * VIEW_SHIFT, 3, dt)
    if (Math.abs(shift.current) > 1e-4) {
      camera.setViewOffset(size.width, size.height, -shift.current * size.width, 0, size.width, size.height)
    } else camera.clearViewOffset()

    // overlay – direct DOM writes
    overlay.blocks.current.forEach((el, i) => {
      if (!el) return
      const w = textWeight(o, i)
      el.style.opacity = w.toFixed(3)
      el.style.setProperty('--ty', `${((1 - w) * 24).toFixed(1)}px`)
      el.style.visibility = w < 0.01 ? 'hidden' : 'visible'
    })
    const [scrimL, scrimR] = overlay.scrims.current
    if (scrimL) scrimL.style.opacity = Math.max(0, -side).toFixed(3)
    if (scrimR) scrimR.style.opacity = Math.max(0, side).toFixed(3)
    if (overlay.progress.current) overlay.progress.current.style.transform = `scaleY(${o.toFixed(4)})`
    if (overlay.scrollHint.current) overlay.scrollHint.current.style.opacity = (1 - Math.min(1, o / 0.03)).toFixed(3)

    // footer reveal: footer slides up from below and pushes the page up by its height
    const f = footerAt(o)
    const footer = overlay.footer.current
    if (footer) {
      footer.style.transform = `translate3d(0, ${((1 - f) * 100).toFixed(2)}%, 0)`
      footer.style.visibility = f < 0.001 ? 'hidden' : 'visible'
      if (overlay.stage.current) {
        overlay.stage.current.style.transform = `translate3d(0, ${(-f * footer.offsetHeight * 0.6).toFixed(1)}px, 0)`
      }
    }

    // React state only changes on chapter boundaries (labels, chain indicator)
    const chapter = chapterIndexAt(o)
    if (chapter !== lastChapter.current) {
      lastChapter.current = chapter
      onChapterChange(chapter)
    }
  })

  return null
}
