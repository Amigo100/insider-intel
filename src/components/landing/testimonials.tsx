import { FileText, TrendingUp, Bell } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

interface UseCase {
  title: string
  description: string
  icon: React.ElementType
}

const useCases: UseCase[] = [
  {
    title: 'Track Insider Activity',
    description:
      'Monitor Form 4 filings to see when executives and directors buy or sell shares in their own companies.',
    icon: FileText,
  },
  {
    title: 'Spot Cluster Buying',
    description:
      'Identify when multiple insiders at the same company are buying shares - a potential signal of confidence.',
    icon: TrendingUp,
  },
  {
    title: 'Get Timely Alerts',
    description:
      'Receive notifications when there is significant insider activity in companies on your watchlist.',
    icon: Bell,
  },
]

/**
 * Use cases section - replacing fake testimonials with honest feature descriptions
 *
 * NOTE: This replaces the previous testimonials section which contained
 * fabricated quotes from fictional people. Real testimonials should only
 * be added once actual users provide them with permission.
 */
export function Testimonials() {
  return (
    <section className="py-16 sm:py-24">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Make smarter investment decisions
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Leverage insider trading data to inform your research
          </p>
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {useCases.map((useCase, index) => (
            <UseCaseCard key={index} useCase={useCase} />
          ))}
        </div>
      </div>
    </section>
  )
}

function UseCaseCard({ useCase }: { useCase: UseCase }) {
  const Icon = useCase.icon

  return (
    <Card className="relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
      <CardContent className="pt-6">
        {/* Icon */}
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
          <Icon className="h-6 w-6 text-primary" />
        </div>

        {/* Title */}
        <h3 className="text-lg font-semibold">{useCase.title}</h3>

        {/* Description */}
        <p className="mt-2 text-muted-foreground">{useCase.description}</p>
      </CardContent>
    </Card>
  )
}
