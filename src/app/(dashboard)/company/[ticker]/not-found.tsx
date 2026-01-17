import { AlertCircle } from 'lucide-react'
import EmptyState from '@/components/dashboard/empty-state'

/**
 * Company Not Found Page
 *
 * Uses EmptyState component with:
 * - AlertCircle icon
 * - Primary action: Browse Transactions
 * - Secondary action: Go to Dashboard
 */
export default function CompanyNotFound() {
  return (
    <div className="py-12">
      <EmptyState
        icon={AlertCircle}
        title="Company Not Found"
        description="We couldn't find a company with that ticker symbol. It may not be in our database yet, or the ticker might be incorrect."
        action={{
          label: 'Browse Transactions',
          href: '/insider-trades',
        }}
        secondaryAction={{
          label: 'Go to Dashboard',
          href: '/dashboard',
        }}
      />
    </div>
  )
}
