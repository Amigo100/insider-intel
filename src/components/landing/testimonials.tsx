import { User, TrendingUp, BarChart3 } from 'lucide-react'

interface UseCase {
  title: string
  description: string
  icon: React.ElementType
}

const useCases: UseCase[] = [
  {
    title: 'Retail Investor',
    description:
      'Track insider buying and selling at companies you own. Get alerts when executives show confidence in their stock.',
    icon: User,
  },
  {
    title: 'Day Trader',
    description:
      'Spot cluster buying patterns before they hit the news. React quickly to significant insider activity.',
    icon: TrendingUp,
  },
  {
    title: 'Analyst',
    description:
      'Comprehensive 13F data and insider transaction history. Export data and integrate with your research workflow.',
    icon: BarChart3,
  },
]

/**
 * Use cases section - Built for Every Investor
 * Per spec: 3 persona cards (Retail Investor, Day Trader, Analyst)
 */
export function Testimonials() {
  return (
    <section className="py-16 sm:py-24 bg-white">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-[#171717] sm:text-4xl">
            Built for Every Investor
          </h2>
          <p className="mt-4 text-lg text-[#525252]">
            Whether you&apos;re a retail investor or professional analyst
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
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
    <div className="rounded-xl border border-[#E5E5E5] bg-white p-6 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFA028] focus-visible:ring-offset-2">
      {/* Icon */}
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-[#F5F5F5]">
        <Icon className="h-6 w-6 text-[#525252]" />
      </div>

      {/* Title */}
      <h3 className="text-lg font-semibold text-[#171717]">{useCase.title}</h3>

      {/* Description */}
      <p className="mt-2 text-sm text-[#525252]">{useCase.description}</p>
    </div>
  )
}
