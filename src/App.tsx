import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { Scene } from './Scene'
import { Overlay } from './components/Overlay'
import { Header } from './components/Header'
import { Footer } from './components/Footer'
import { Loader } from './components/Loader'
import type { OverlayHandles } from './story/Director'
import { NARROW, WIDE_FOV } from './story/timeline'

function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches)
  useEffect(() => {
    const mql = window.matchMedia(query)
    const onChange = () => setMatches(mql.matches)
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [query])
  return matches
}

export default function App() {
  const narrow = useMediaQuery(`(max-width: ${NARROW.maxWidth}px)`)
  const [activeChapter, setActiveChapter] = useState(0)
  const [ready, setReady] = useState(false)

  const blocks = useRef<(HTMLElement | null)[]>([])
  const progress = useRef<HTMLDivElement | null>(null)
  const scrims = useRef<(HTMLDivElement | null)[]>([])
  const scrollHint = useRef<HTMLDivElement | null>(null)
  const stage = useRef<HTMLDivElement | null>(null)
  const footer = useRef<HTMLElement | null>(null)
  const scrollEl = useRef<HTMLElement | null>(null)
  const labelLayer = useRef<HTMLDivElement>(null!)
  const overlay = useMemo<OverlayHandles>(
    () => ({ blocks, progress, scrims, scrollHint, stage, footer, scrollEl }),
    [],
  )

  // Wheel over the header/footer still drives the story (ScrollControls only listens on its own container).
  useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      const el = scrollEl.current
      if (el && !el.contains(e.target as Node)) el.scrollTop += e.deltaY
    }
    window.addEventListener('wheel', onWheel, { passive: true })
    return () => window.removeEventListener('wheel', onWheel)
  }, [])

  /** Smooth-scroll the ScrollControls container to a story offset (0–1). */
  const scrollTo = useCallback((offset: number) => {
    const el = scrollEl.current
    if (!el) return
    el.scrollTo({ top: offset * (el.scrollHeight - el.clientHeight), behavior: 'smooth' })
  }, [])

  return (
    <div className="relative h-full w-full overflow-hidden bg-white">
      {/* the "page": canvas + text, pushed up when the footer arrives */}
      <div ref={stage} className="absolute inset-0 will-change-transform">
        <Canvas
          dpr={[1, narrow ? 1.5 : 2]}
          camera={{ fov: narrow ? NARROW.fov : WIDE_FOV, near: 1, far: 1600, position: [-80, 56, 80] }}
          gl={{ antialias: true }}
          onCreated={() => requestAnimationFrame(() => requestAnimationFrame(() => setReady(true)))}
        >
          <Suspense fallback={null}>
            <Scene overlay={overlay} labelLayer={labelLayer} activeChapter={activeChapter} onChapterChange={setActiveChapter} narrow={narrow} />
          </Suspense>
        </Canvas>
        {/* name tags render here so they stay put above the canvas */}
        <div ref={labelLayer} className="pointer-events-none absolute inset-0 z-[5] overflow-hidden" />
        <Overlay handles={overlay} />
      </div>

      <Header activeChapter={activeChapter} scrollTo={scrollTo} />
      <Footer footerRef={footer} scrollTo={scrollTo} />
      <Loader ready={ready} />
    </div>
  )
}
