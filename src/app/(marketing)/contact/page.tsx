import type { Metadata } from 'next'
import { Mail, MessageSquare, FileText, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'Contact - InsiderIntel',
  description: 'Get in touch with the InsiderIntel team for support, feedback, or inquiries.',
}

export default function ContactPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="mx-auto max-w-3xl">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight">Contact Us</h1>
          <p className="mt-4 text-xl text-muted-foreground">
            We&apos;d love to hear from you. Here&apos;s how you can reach us.
          </p>
        </div>

        {/* Contact Options */}
        <div className="mt-12 grid gap-6 sm:grid-cols-2">
          <ContactCard
            icon={MessageSquare}
            title="General Support"
            description="Questions about using InsiderIntel? Our support team is here to help."
            email="support@insiderintel.com"
            responseTime="Within 24 hours"
          />
          <ContactCard
            icon={Mail}
            title="Sales & Enterprise"
            description="Interested in our Pro plan or custom enterprise solutions?"
            email="sales@insiderintel.com"
            responseTime="Within 12 hours"
          />
          <ContactCard
            icon={FileText}
            title="Legal & Privacy"
            description="Questions about our terms, privacy policy, or data practices?"
            email="legal@insiderintel.com"
            responseTime="Within 48 hours"
          />
          <ContactCard
            icon={Mail}
            title="Press & Media"
            description="Media inquiries, interview requests, or partnership opportunities?"
            email="press@insiderintel.com"
            responseTime="Within 48 hours"
          />
        </div>

        {/* FAQ Callout */}
        <div className="mt-16 rounded-xl border bg-muted/30 p-8 text-center">
          <h2 className="text-xl font-semibold">Looking for quick answers?</h2>
          <p className="mt-2 text-muted-foreground">
            Check out our FAQ section for answers to common questions about our product,
            billing, and data.
          </p>
          <Button className="mt-6" variant="outline-light" asChild>
            <a href="/#faq">View FAQ</a>
          </Button>
        </div>

        {/* Response Time */}
        <div className="mt-16">
          <h2 className="text-xl font-semibold text-center">Our Commitment</h2>
          <div className="mt-6 rounded-lg border bg-card p-6">
            <div className="flex items-start gap-4">
              <Clock className="h-6 w-6 flex-shrink-0 text-primary mt-1" />
              <div>
                <h3 className="font-medium">Response Times</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  We aim to respond to all inquiries within 24 hours during business days
                  (Monday through Friday). Premium subscribers receive priority support with
                  faster response times.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Office Info (Optional/Future) */}
        <div className="mt-16 text-center text-sm text-muted-foreground">
          <p>InsiderIntel, Inc.</p>
          <p className="mt-1">A Delaware Corporation</p>
        </div>
      </div>
    </div>
  )
}

interface ContactCardProps {
  icon: React.ElementType
  title: string
  description: string
  email: string
  responseTime: string
}

function ContactCard({ icon: Icon, title, description, email, responseTime }: ContactCardProps) {
  return (
    <div className="rounded-lg border bg-card p-6 transition-shadow hover:shadow-md">
      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
        <Icon className="h-6 w-6 text-primary" />
      </div>
      <h3 className="mt-4 text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      <div className="mt-4">
        <a
          href={`mailto:${email}`}
          className="text-primary font-medium hover:underline"
        >
          {email}
        </a>
        <p className="mt-1 text-xs text-muted-foreground">
          Response time: {responseTime}
        </p>
      </div>
    </div>
  )
}
