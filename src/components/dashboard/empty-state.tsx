import { type LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface EmptyStateAction {
  label: string
  onClick?: () => void
  href?: string
}

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  action?: EmptyStateAction
  className?: string
}

/**
 * Reusable empty state component for displaying when no data is available
 * Features cyan glowing icon container and styled action button
 */
export default function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-16 text-center',
        className
      )}
      role="status"
    >
      {/* Cyan glowing icon container */}
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-cyan-400/20 rounded-full blur-xl" />
        <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-cyan-400/10 border border-cyan-400/20">
          <Icon className="h-10 w-10 text-cyan-400" aria-hidden="true" />
        </div>
      </div>

      <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
      <p className="text-sm text-slate-300 max-w-md mb-8">{description}</p>

      {action && (
        action.href ? (
          <Button
            asChild
            className="bg-gradient-to-r from-cyan-400 to-cyan-500 text-slate-900 font-semibold shadow-[0_2px_10px_rgba(34,211,238,0.3)] hover:from-cyan-300 hover:to-cyan-400"
          >
            <a href={action.href}>{action.label}</a>
          </Button>
        ) : (
          <Button
            onClick={action.onClick}
            className="bg-gradient-to-r from-cyan-400 to-cyan-500 text-slate-900 font-semibold shadow-[0_2px_10px_rgba(34,211,238,0.3)] hover:from-cyan-300 hover:to-cyan-400"
          >
            {action.label}
          </Button>
        )
      )}
    </div>
  )
}
