import type { CSSProperties } from 'react'
import { CHAPTERS } from '../story/timeline'
import type { OverlayHandles } from '../story/Director'
import { CONTACT_HREF } from '../site'

interface OverlayProps {
  handles: OverlayHandles
}

/**
 * Fixed text layer above the canvas. Opacity/position of each block is written by the
 * Director every frame via refs; this component only renders once.
 */
export function Overlay({ handles }: OverlayProps) {
  return (
    <div className="pointer-events-none fixed inset-0 z-10">
      {/* soft white fades that keep the text readable over the model (desktop) */}
      {(['left', 'right'] as const).map((side, i) => (
        <div
          key={side}
          ref={(el) => {
            handles.scrims.current[i] = el
          }}
          className={`absolute inset-y-0 hidden w-[52vw] md:block ${
            side === 'left' ? 'left-0 bg-gradient-to-r' : 'right-0 bg-gradient-to-l'
          } from-white/95 via-white/75 to-white/0`}
          style={{ opacity: side === 'left' ? 1 : 0 }}
        />
      ))}
      {CHAPTERS.map((beat, i) => {
        const isHero = i === 0
        const isClosing = i === CHAPTERS.length - 1
        const side = beat.side === 'left' ? 'md:left-[6vw] md:items-start' : 'md:right-[7vw] md:items-end'
        return (
          <section
            key={beat.key}
            ref={(el) => {
              handles.blocks.current[i] = el
            }}
            className={`absolute inset-x-0 bottom-0 flex flex-col items-center bg-gradient-to-t from-white via-white/90 to-transparent px-6 pb-12 pt-28 text-center
              md:inset-x-auto md:bottom-auto md:top-1/2 md:w-[min(30rem,38vw)] md:-translate-y-1/2 md:bg-none md:p-0 md:text-left ${side}`}
            style={{ opacity: isHero ? 1 : 0, '--accent': beat.accent ?? '#2F7D4F' } as CSSProperties}
          >
            <div className="overlay-inner w-full">
              <p className="mb-4 flex items-center justify-center gap-3 text-[11px] font-medium uppercase tracking-label text-primary md:justify-start">
                {beat.accent && <span className="h-1.5 w-1.5 rounded-full" style={{ background: beat.accent }} />}
                {beat.copy.eyebrow}
              </p>
              <h2
                className={`font-light leading-[1.05] tracking-tight text-ink ${
                  isHero || isClosing ? 'text-5xl md:text-7xl' : 'text-4xl md:text-5xl'
                }`}
              >
                {beat.copy.title}
              </h2>
              <p className="mx-auto mt-5 max-w-md text-[15px] leading-relaxed text-muted md:mx-0 md:text-base">
                {beat.copy.body}
              </p>
              {isClosing && (
                <a
                  href={CONTACT_HREF}
                  className="pointer-events-auto mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-white shadow-[0_8px_24px_-10px_rgba(47,125,79,0.6)] transition hover:bg-primary-soft focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-canvas"
                >
                  Get in touch <span aria-hidden>→</span>
                </a>
              )}
            </div>
          </section>
        )
      })}

      {/* scroll hint */}
      <div
        ref={handles.scrollHint}
        className="absolute bottom-8 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-3 text-[10px] uppercase tracking-label text-muted md:flex"
      >
        Scroll
        <span className="scroll-line" />
      </div>

      {/* progress bar */}
      <div className="absolute right-0 top-0 h-full w-[3px] bg-hairline/70">
        <div ref={handles.progress} className="h-full w-full origin-top scale-y-0 bg-primary" />
      </div>
    </div>
  )
}
