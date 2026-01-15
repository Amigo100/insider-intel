import { Star, Quote } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

interface Testimonial {
  quote: string
  name: string
  title: string
  company: string
  rating: number
}

const testimonials: Testimonial[] = [
  {
    quote:
      "InsiderIntel has completely changed how I research stocks. The cluster buying alerts have helped me identify opportunities I would have missed otherwise.",
    name: 'Michael Chen',
    title: 'Portfolio Manager',
    company: 'Apex Capital',
    rating: 5,
  },
  {
    quote:
      "The AI analysis saves me hours of work every week. Instead of manually parsing SEC filings, I get clear insights on what matters and why.",
    name: 'Sarah Rodriguez',
    title: 'Independent Trader',
    company: 'Self-employed',
    rating: 5,
  },
  {
    quote:
      "As a financial advisor, I use InsiderIntel to stay on top of insider activity for my clients' holdings. The real-time alerts are invaluable.",
    name: 'David Thompson',
    title: 'Financial Advisor',
    company: 'Meridian Wealth',
    rating: 5,
  },
]

/**
 * Testimonials section showing social proof from users
 */
export function Testimonials() {
  return (
    <section className="py-16 sm:py-24">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Trusted by investors worldwide
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            See what our users have to say about InsiderIntel
          </p>
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard key={index} testimonial={testimonial} />
          ))}
        </div>
      </div>
    </section>
  )
}

function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    <Card className="relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
      {/* Quote icon decoration */}
      <div className="absolute right-4 top-4 text-primary/10">
        <Quote className="h-12 w-12" />
      </div>

      <CardContent className="pt-6">
        {/* Star rating */}
        <div className="mb-4 flex gap-0.5">
          {Array.from({ length: testimonial.rating }).map((_, i) => (
            <Star
              key={i}
              className="h-4 w-4 fill-yellow-400 text-yellow-400"
            />
          ))}
        </div>

        {/* Quote */}
        <blockquote className="text-muted-foreground">
          &ldquo;{testimonial.quote}&rdquo;
        </blockquote>

        {/* Author */}
        <div className="mt-6 flex items-center gap-3">
          {/* Avatar placeholder */}
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
            {testimonial.name
              .split(' ')
              .map((n) => n[0])
              .join('')}
          </div>
          <div>
            <p className="font-semibold">{testimonial.name}</p>
            <p className="text-sm text-muted-foreground">
              {testimonial.title}, {testimonial.company}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
