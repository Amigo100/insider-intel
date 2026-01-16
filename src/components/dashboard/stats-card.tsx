import { cn } from '@/lib/utils'

interface StatCardProps {
  label: string
  value: string
  change?: string
  changeType?: 'positive' | 'negative' | 'neutral'
  className?: string
}

interface Stat {
  label: string
  value: string
  change?: string
  changeType?: 'positive' | 'negative' | 'neutral'
}

interface StatsRowProps {
  stats: Stat[]
  className?: string
}

/**
 * Individual stat card with dark background styling
 */
export function StatCard({
  label,
  value,
  change,
  changeType = 'neutral',
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        'rounded-lg border border-slate-700/50 bg-slate-800/50 p-4',
        className
      )}
    >
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className="mt-1 text-2xl font-bold text-white">{value}</p>
      {change && (
        <p
          className={cn(
            'mt-1 text-sm',
            changeType === 'positive' && 'text-emerald-400',
            changeType === 'negative' && 'text-red-400',
            changeType === 'neutral' && 'text-slate-400'
          )}
        >
          {change}
        </p>
      )}
    </div>
  )
}

/**
 * Row of stat cards in a responsive grid layout
 */
export function StatsRow({ stats, className }: StatsRowProps) {
  return (
    <div
      className={cn(
        'grid grid-cols-2 gap-4 md:grid-cols-4',
        className
      )}
    >
      {stats.map((stat, index) => (
        <StatCard
          key={`${stat.label}-${index}`}
          label={stat.label}
          value={stat.value}
          change={stat.change}
          changeType={stat.changeType}
        />
      ))}
    </div>
  )
}
