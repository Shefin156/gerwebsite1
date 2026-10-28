import type { MutableRefObject, ReactNode } from 'react'
import { CHAIN, CHAPTERS, NAV_TARGETS } from '../story/timeline'
import { CONTACT_HREF, SITE } from '../site'

interface FooterProps {
  footerRef: MutableRefObject<HTMLElement | null>
  scrollTo: (offset: number) => void
}

/** Site footer. Slides up over the last part of the scroll (driven by the Director). */
export function Footer({ footerRef, scrollTo }: FooterProps) {
  const processLinks = [...CHAIN, CHAPTERS.find((c) => c.key === 'water')].filter((c) => c !== undefined)

  return (
    <footer
      ref={footerRef}
      className="fixed inset-x-0 bottom-0 z-20 border-t border-hairline bg-white"
      style={{ transform: 'translate3d(0, 100%, 0)', visibility: 'hidden' }}
    >
      <div className="mx-auto max-w-7xl px-5 pb-6 pt-8 md:px-10 md:pb-8 md:pt-16">
        <div className="grid grid-cols-2 gap-x-6 gap-y-8 md:grid-cols-[1.6fr_1fr_1fr_1.2fr] md:gap-10">
          <div className="col-span-2 md:col-span-1">
            <p className="flex items-center gap-2.5 text-[17px] font-semibold tracking-tight text-ink">
              <span className="inline-block h-6 w-6 rounded-full rounded-tr-none bg-primary" aria-hidden />
              {SITE.name}
            </p>
            <p className="mt-3 max-w-xs text-[14px] leading-relaxed text-muted md:mt-4">{SITE.tagline}</p>
            <a
              href={CONTACT_HREF}
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-[13px] font-medium text-white transition hover:bg-primary-soft"
            >
              Get in touch <span aria-hidden>→</span>
            </a>
          </div>

          <FooterColumn title="Process">
            {processLinks.map((c) => (
              <li key={c.key}>
                <button type="button" onClick={() => scrollTo((c.range[0] + c.range[1]) / 2)} className="transition-colors hover:text-ink">
                  {c.copy.eyebrow.split('/ ')[1]}
                </button>
              </li>
            ))}
          </FooterColumn>

          <FooterColumn title="Company" className="hidden md:block">
            {SITE.company.map((l) => (
              <li key={l.label}>
                <a href={l.href} className="transition-colors hover:text-ink">{l.label}</a>
              </li>
            ))}
            <li>
              <button type="button" onClick={() => scrollTo(NAV_TARGETS.plant)} className="transition-colors hover:text-ink">
                The plant
              </button>
            </li>
          </FooterColumn>

          <FooterColumn title="Contact">
            <li>
              <a href={CONTACT_HREF} className="transition-colors hover:text-ink">{SITE.email}</a>
            </li>
            <li>{SITE.phone}</li>
            <li className="leading-relaxed">{SITE.address}</li>
          </FooterColumn>
        </div>

        <div className="mt-8 flex flex-col gap-3 border-t border-hairline pt-6 text-[12px] text-muted md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} {SITE.name}. All rights reserved.</p>
          <div className="flex gap-6">
            {SITE.legal.map((l) => (
              <a key={l.label} href={l.href} className="transition-colors hover:text-ink">{l.label}</a>
            ))}
            <button type="button" onClick={() => scrollTo(0)} className="transition-colors hover:text-ink">
              Back to top ↑
            </button>
          </div>
        </div>
      </div>
    </footer>
  )
}

function FooterColumn({ title, children, className = '' }: { title: string; children: ReactNode; className?: string }) {
  return (
    <div className={className}>
      <p className="text-[11px] font-medium uppercase tracking-label text-primary">{title}</p>
      <ul className="mt-3 space-y-2 text-[14px] text-muted md:mt-4 md:space-y-2.5">{children}</ul>
    </div>
  )
}
