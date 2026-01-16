import { cn } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'

interface StatCardProps {
  label: string
  value: string | number
  change?: string
  changeType?: 'positive' | 'negative' | 'neutral'
  icon?: LucideIcon
  className?: string
}

export function StatCard({
  label,
  value,
  change,
  changeType = 'neutral',
  icon: Icon,
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-xl p-5',
        'bg-gradient-to-br from-slate-800 to-slate-900',
        'border border-white/[0.08]',
        'transition-all duration-200',
        'hover:border-cyan-400/30 hover:shadow-[0_4px_20px_rgba(0,0,0,0.3),0_0_20px_rgba(34,211,238,0.08)]',
        'hover:-translate-y-0.5',
        className
      )}
    >
      {/* Optional subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />

      <div className="relative">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            {label}
          </p>
          {Icon && <Icon className="h-4 w-4 text-slate-600" />}
        </div>

        <p className="text-3xl font-extrabold text-white mt-2 tracking-tight">
          {value}
        </p>

        {change && (
          <p
            className={cn(
              'text-sm font-medium mt-1',
              changeType === 'positive' && 'text-emerald-400',
              changeType === 'negative' && 'text-red-400',
              changeType === 'neutral' && 'text-slate-400'
            )}
          >
            {change}
          </p>
        )}
      </div>
    </div>
  )
}

interface StatsRowProps {
  children: React.ReactNode
  className?: string
}

export function StatsRow({ children, className }: StatsRowProps) {
  return (
    <div className={cn('grid grid-cols-2 lg:grid-cols-4 gap-4', className)}>
      {children}
    </div>
  )
}

export default StatCard
