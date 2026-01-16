import type { Metadata } from 'next'
import Link from 'next/link'
import { TrendingUp, Target, Shield, Zap, Users, Database } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'About - InsiderIntel',
  description: 'Learn about InsiderIntel - our mission to make insider trading data accessible to all investors.',
}

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="mx-auto max-w-3xl">
        {/* Hero */}
        <div className="text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-xl bg-primary">
            <TrendingUp className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight">About InsiderIntel</h1>
          <p className="mt-4 text-xl text-muted-foreground">
            Making insider trading data accessible to every investor.
          </p>
        </div>

        {/* Mission */}
        <section className="mt-16">
          <h2 className="text-2xl font-bold">Our Mission</h2>
          <div className="mt-4 space-y-4 text-muted-foreground">
            <p>
              Insider trading data has always been publicly available through SEC filings, but
              accessing and understanding it required specialized tools and expertise. We built
              InsiderIntel to change that.
            </p>
            <p>
              Our mission is to democratize access to insider trading intelligence. We believe
              every investor, whether managing a personal portfolio or running a hedge fund,
              deserves access to the same information about what corporate insiders are doing
              with their own money.
            </p>
            <p>
              When a CEO buys $5 million worth of their own company&apos;s stock, that&apos;s a signal.
              When multiple executives at the same company start buying simultaneously, that&apos;s
              a stronger signal. We help you see these signals in real-time, understand their
              context, and make more informed investment decisions.
            </p>
          </div>
        </section>

        {/* Values */}
        <section className="mt-16">
          <h2 className="text-2xl font-bold">What We Believe</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            <ValueCard
              icon={Target}
              title="Transparency"
              description="Markets work best when information flows freely. We're committed to making SEC data accessible and understandable."
            />
            <ValueCard
              icon={Shield}
              title="Accuracy"
              description="We source data directly from SEC EDGAR and validate every data point. When we can't verify something, we say so."
            />
            <ValueCard
              icon={Zap}
              title="Speed"
              description="In investing, timing matters. We deliver insider trading data within minutes of SEC filing, not hours or days."
            />
            <ValueCard
              icon={Users}
              title="Accessibility"
              description="Professional-grade tools shouldn't require professional-grade budgets. We offer meaningful features at every price point."
            />
          </div>
        </section>

        {/* How It Works */}
        <section className="mt-16">
          <h2 className="text-2xl font-bold">How We Work</h2>
          <div className="mt-6 space-y-4 text-muted-foreground">
            <p>
              InsiderIntel continuously monitors SEC EDGAR for new Form 4 filings (insider trades)
              and 13F filings (institutional holdings). When a new filing appears, we:
            </p>
            <ol className="list-decimal pl-6 space-y-3">
              <li>
                <strong className="text-foreground">Extract the data</strong> — We parse the XML
                filing to extract transaction details: who traded, what they traded, how much,
                and at what price.
              </li>
              <li>
                <strong className="text-foreground">Enrich it</strong> — We match transactions to
                companies, calculate ownership percentages, and identify patterns like cluster buying.
              </li>
              <li>
                <strong className="text-foreground">Analyze it</strong> — Our AI reviews each
                transaction to provide context: Is this routine compensation? An unusual purchase?
                Part of a broader pattern?
              </li>
              <li>
                <strong className="text-foreground">Deliver it</strong> — Subscribers receive
                instant alerts, while all users can explore the data through our dashboard.
              </li>
            </ol>
          </div>
        </section>

        {/* Data Sources */}
        <section className="mt-16">
          <h2 className="text-2xl font-bold">Our Data</h2>
          <div className="mt-6 space-y-4 text-muted-foreground">
            <p>
              We believe in transparency about our data sources and methodology:
            </p>
            <div className="mt-6 rounded-lg border bg-card p-6">
              <div className="flex items-start gap-4">
                <Database className="h-6 w-6 flex-shrink-0 text-primary mt-1" />
                <div>
                  <h3 className="font-semibold text-foreground">SEC EDGAR</h3>
                  <p className="mt-1 text-sm">
                    All insider trading (Form 4) and institutional holdings (13F) data comes
                    directly from the SEC&apos;s EDGAR database. This is the official, authoritative
                    source for these filings.
                  </p>
                </div>
              </div>
            </div>
            <p>
              We don&apos;t scrape data from third-party sites or use unofficial sources. When you
              see a transaction on InsiderIntel, you can verify it against the original SEC filing.
            </p>
          </div>
        </section>

        {/* Team */}
        <section className="mt-16">
          <h2 className="text-2xl font-bold">Built by Investors, for Investors</h2>
          <div className="mt-4 space-y-4 text-muted-foreground">
            <p>
              InsiderIntel was created by a small team of engineers and investors who were
              frustrated by the existing options for tracking insider trades. The expensive
              platforms were overkill for individual investors, while the free options were
              clunky and unreliable.
            </p>
            <p>
              We built the tool we wanted to use ourselves: fast, accurate, and affordable.
              We use InsiderIntel for our own investment research, which keeps us motivated
              to make it better every day.
            </p>
          </div>
        </section>

        {/* CTA */}
        <section className="mt-16 rounded-xl border bg-muted/30 p-8 text-center">
          <h2 className="text-2xl font-bold">Ready to Get Started?</h2>
          <p className="mt-2 text-muted-foreground">
            Join thousands of investors tracking insider activity with InsiderIntel.
          </p>
          <div className="mt-6 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button size="lg" asChild>
              <Link href="/signup">Start Free</Link>
            </Button>
            <Button size="lg" variant="outline-light" asChild>
              <Link href="/contact">Contact Us</Link>
            </Button>
          </div>
        </section>
      </div>
    </div>
  )
}

interface ValueCardProps {
  icon: React.ElementType
  title: string
  description: string
}

function ValueCard({ icon: Icon, title, description }: ValueCardProps) {
  return (
    <div className="rounded-lg border bg-card p-6">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <h3 className="mt-4 font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
    </div>
  )
}
