import Link from 'next/link'
import { Search } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function CompanyNotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-24">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
        <Search className="h-10 w-10 text-muted-foreground" />
      </div>
      <h1 className="mt-6 text-2xl font-bold">Company Not Found</h1>
      <p className="mt-2 text-center text-muted-foreground max-w-md">
        We couldn&apos;t find a company with that ticker symbol. It may not be in
        our database yet, or the ticker might be incorrect.
      </p>
      <div className="mt-6 flex gap-4">
        <Button variant="outline" asChild>
          <Link href="/dashboard">Go to Dashboard</Link>
        </Button>
        <Button asChild>
          <Link href="/insider-trades">Browse Transactions</Link>
        </Button>
      </div>
    </div>
  )
}
