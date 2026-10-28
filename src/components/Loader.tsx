/** Shown until the first frames have rendered, then fades away. */
export function Loader({ ready }: { ready: boolean }) {
  return (
    <div
      className={`fixed inset-0 z-30 flex flex-col items-center justify-center gap-4 bg-canvas transition-opacity duration-700 ${
        ready ? 'pointer-events-none opacity-0' : 'opacity-100'
      }`}
      aria-hidden={ready}
    >
      <span className="text-[11px] font-medium uppercase tracking-label text-muted">Preparing the plant</span>
      <span className="loader-bar" />
    </div>
  )
}
