import { CHAPTERS, CHAIN, NAV_TARGETS } from '../story/timeline'
import { SITE } from '../site'

interface HeaderProps {
  activeChapter: number
  scrollTo: (offset: number) => void
}

const LINKS: { label: string; target: keyof typeof NAV_TARGETS }[] = [
  { label: 'Process', target: 'process' },
  { label: 'Plant', target: 'plant' },
  { label: 'Impact', target: 'impact' },
  { label: 'Contact', target: 'contact' },
]

/** Solid site header + the Biomass → Quality Biogas → Electricity chain indicator. */
export function Header({ activeChapter, scrollTo }: HeaderProps) {
  const step = CHAPTERS[activeChapter]?.chainStep
  const passed = CHAIN.filter((c) => c.range[1] <= CHAPTERS[activeChapter].range[0]).length
  const chainVisible = activeChapter > 0 && activeChapter < CHAPTERS.length - 1

  return (
    <header className="fixed inset-x-0 top-0 z-30">
      <div className="border-b border-hairline bg-white/90 backdrop-blur-md">
        <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 md:px-10" aria-label="Main">
          <button type="button" onClick={() => scrollTo(0)} className="flex items-center gap-2.5 text-[17px] font-semibold tracking-tight text-ink">
            <span className="inline-block h-6 w-6 rounded-full rounded-tr-none bg-primary" aria-hidden />
            {SITE.name}
          </button>

          <ul className="hidden items-center gap-9 text-[14px] text-muted md:flex">
            {LINKS.map((l) => (
              <li key={l.label}>
                <button type="button" onClick={() => scrollTo(NAV_TARGETS[l.target])} className="transition-colors hover:text-ink">
                  {l.label}
                </button>
              </li>
            ))}
          </ul>

          <button
            type="button"
            onClick={() => scrollTo(NAV_TARGETS.contact)}
            className="rounded-full bg-primary px-4 py-2 text-[13px] font-medium text-white transition hover:bg-primary-soft md:px-5"
          >
            Get in touch
          </button>
        </nav>
      </div>

      <div
        className={`mx-auto mt-4 flex w-fit items-center gap-1.5 whitespace-nowrap rounded-full border border-hairline bg-white/85 px-3 py-2 text-[9px] font-medium uppercase tracking-[0.12em] text-muted backdrop-blur-md transition-all duration-500 md:gap-2 md:px-4 md:text-[11px] md:tracking-[0.14em] ${
          chainVisible ? 'translate-y-0 opacity-100' : '-translate-y-2 opacity-0'
        }`}
        aria-label="Energy chain"
      >
        {CHAIN.map((c, i) => {
          const active = step === c.chainStep
          const done = i < passed && !active
          return (
            <div key={c.key} className="flex items-center gap-1.5 md:gap-2">
              {i > 0 && <span className="h-px w-2 bg-hairline md:w-6" aria-hidden />}
              <span
                className="h-2 w-2 rounded-full bg-mint transition-all duration-500"
                style={{ background: active || done ? c.accent : undefined, boxShadow: active ? `0 0 0 4px ${c.accent}33` : undefined }}
              />
              <span className={`transition-colors duration-500 ${active ? 'text-ink' : ''}`}>{c.copy.eyebrow.split('/ ')[1]}</span>
            </div>
          )
        })}
      </div>
    </header>
  )
}
