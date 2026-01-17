'use client'

import { useState } from 'react'
import { ChevronDown, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface FAQItem {
  question: string
  answer: string
}

interface FAQCategory {
  name: string
  items: FAQItem[]
}

const faqData: FAQCategory[] = [
  {
    name: 'Product',
    items: [
      {
        question: 'What is insider trading data?',
        answer:
          'When company executives, directors, or major shareholders buy or sell stock in their own company, they must report it to the SEC within 2 business days. These are called Form 4 filings. We track these filings in real-time and provide AI-powered analysis to help you understand the significance of each transaction.',
      },
      {
        question: 'How quickly do you get the data?',
        answer:
          'We pull data directly from the SEC EDGAR database. Free users receive data with a 24-hour delay, while paid subscribers get real-time updates within minutes of filings being published. Our system continuously monitors the SEC for new filings.',
      },
      {
        question: 'What makes your AI analysis different?',
        answer:
          "Our AI doesn't just report the numbers. It analyzes the context: Is this a routine sale or something unusual? How does it compare to historical patterns? Is there cluster buying happening? What's the insider's track record? We surface the insights that matter and assign a significance score to help you prioritize.",
      },
      {
        question: 'What is cluster buying detection?',
        answer:
          "Cluster buying occurs when multiple insiders at the same company purchase stock within a short time period. This can be a stronger signal than individual purchases because it suggests multiple people with inside knowledge believe the stock is undervalued. We automatically detect these patterns and alert you.",
      },
    ],
  },
  {
    name: 'Billing',
    items: [
      {
        question: 'Can I cancel my subscription anytime?',
        answer:
          "Yes, you can cancel your subscription at any time with no questions asked. Simply go to Settings > Billing and click 'Cancel Subscription'. You'll continue to have access to paid features until the end of your current billing period.",
      },
      {
        question: 'Do you offer refunds?',
        answer:
          "Yes, we offer a 14-day money-back guarantee on all paid plans. If you're not satisfied for any reason, contact us within 14 days of your purchase and we'll process a full refund. No questions asked.",
      },
      {
        question: 'What payment methods do you accept?',
        answer:
          'We accept all major credit cards (Visa, Mastercard, American Express, Discover) as well as debit cards. Payments are processed securely through Stripe. We also support Apple Pay and Google Pay for convenience.',
      },
      {
        question: 'Can I switch between monthly and annual billing?',
        answer:
          "Yes, you can switch between monthly and annual billing at any time. If you switch to annual, you'll receive a 20% discount and be charged the prorated amount for the remainder of your billing cycle. If you switch to monthly, the change will take effect at your next renewal date.",
      },
    ],
  },
  {
    name: 'Data & Security',
    items: [
      {
        question: 'Is my data secure?',
        answer:
          'Absolutely. We use bank-grade 256-bit SSL encryption for all data transmission. Your personal information is stored securely and never shared with third parties. We implement industry security best practices and regularly audit our systems. Your payment information is handled by Stripe and never touches our servers.',
      },
      {
        question: 'Where does your data come from?',
        answer:
          "All our insider trading data comes directly from official SEC EDGAR filings. We don't use any scraped or unofficial sources. For security identifiers and company information, we use the OpenFIGI database. This ensures you're always getting accurate, official data.",
      },
      {
        question: 'How accurate is the data?',
        answer:
          'Our data accuracy is 99.9%+. We pull directly from SEC EDGAR and run multiple validation checks. In rare cases where the SEC filing contains errors (which happens occasionally), we flag these for manual review. We also track amendments and corrections to filings.',
      },
    ],
  },
]

/**
 * Enhanced FAQ section with categories, accordion, and animations
 */
export function FAQSection() {
  const [activeCategory, setActiveCategory] = useState<string>('Product')
  const [openItems, setOpenItems] = useState<Set<string>>(new Set())

  const toggleItem = (question: string) => {
    const newOpenItems = new Set(openItems)
    if (newOpenItems.has(question)) {
      newOpenItems.delete(question)
    } else {
      newOpenItems.add(question)
    }
    setOpenItems(newOpenItems)
  }

  const currentCategory = faqData.find((cat) => cat.name === activeCategory)

  return (
    <section id="faq" className="border-t bg-muted/30 py-16 sm:py-24 scroll-mt-16">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Frequently asked questions
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Everything you need to know about InsiderIntel
          </p>
        </div>

        {/* Category Tabs */}
        <div className="mx-auto mt-10 flex justify-center">
          <div className="inline-flex rounded-lg border bg-card p-1">
            {faqData.map((category) => (
              <button
                key={category.name}
                onClick={() => setActiveCategory(category.name)}
                className={`rounded-md px-4 py-2 text-sm font-medium transition-all ${
                  activeCategory === category.name
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* FAQ Items */}
        <div className="mx-auto mt-10 max-w-3xl">
          <div className="space-y-4">
            {currentCategory?.items.map((item, index) => (
              <FAQAccordionItem
                key={`${activeCategory}-${index}`}
                question={item.question}
                answer={item.answer}
                isOpen={openItems.has(item.question)}
                onToggle={() => toggleItem(item.question)}
              />
            ))}
          </div>
        </div>

        {/* Contact CTA */}
        <div className="mx-auto mt-12 max-w-xl text-center">
          <div className="rounded-lg border bg-card p-6">
            <MessageCircle className="mx-auto h-8 w-8 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">Still have questions?</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Can&apos;t find the answer you&apos;re looking for? Our support team is here to help.
            </p>
            <Button className="mt-4" variant="outline-light" asChild>
              <a href="mailto:support@insiderintel.com">Contact Support</a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}

interface FAQAccordionItemProps {
  question: string
  answer: string
  isOpen: boolean
  onToggle: () => void
}

function FAQAccordionItem({ question, answer, isOpen, onToggle }: FAQAccordionItemProps) {
  return (
    <div className="rounded-lg border bg-card overflow-hidden transition-shadow hover:shadow-md">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between p-6 text-left"
        aria-expanded={isOpen}
      >
        <h3 className="text-lg font-semibold pr-4">{question}</h3>
        <ChevronDown
          className={`h-5 w-5 flex-shrink-0 text-muted-foreground transition-transform duration-300 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>
      <div
        className={`grid transition-all duration-300 ease-in-out ${
          isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="overflow-hidden">
          <p className="px-6 pb-6 text-muted-foreground leading-relaxed">
            {answer}
          </p>
        </div>
      </div>
    </div>
  )
}
