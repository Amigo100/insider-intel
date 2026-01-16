interface LiveIndicatorProps {
  text?: string
}

/**
 * Pulsing indicator showing live data status
 */
export default function LiveIndicator({
  text = 'Data updated hourly from SEC EDGAR',
}: LiveIndicatorProps) {
  return (
    <div className="flex items-center gap-2" role="status" aria-live="polite">
      <span className="relative flex h-2 w-2" aria-hidden="true">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400" />
      </span>
      <span className="text-sm text-slate-400">{text}</span>
      <span className="sr-only">Live data indicator active</span>
    </div>
  )
}
