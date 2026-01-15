import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service - InsiderIntel',
  description: 'Terms of Service for InsiderIntel - insider trading and institutional holdings tracking platform.',
}

export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-4xl font-bold tracking-tight">Terms of Service</h1>
        <p className="mt-4 text-muted-foreground">Last updated: January 15, 2026</p>

        <div className="mt-12 space-y-8 text-muted-foreground">
          <section>
            <h2 className="text-xl font-semibold text-foreground">1. Acceptance of Terms</h2>
            <p className="mt-3">
              By accessing or using InsiderIntel (&quot;the Service&quot;), you agree to be bound by these Terms of Service.
              If you do not agree to these terms, please do not use our Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">2. Description of Service</h2>
            <p className="mt-3">
              InsiderIntel provides a platform for tracking and analyzing SEC insider trading filings (Form 4)
              and institutional holdings (13F filings). The Service aggregates publicly available data from
              SEC EDGAR and provides AI-generated analysis and insights.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">3. Not Financial Advice</h2>
            <div className="mt-3 space-y-3">
              <p>
                <strong className="text-foreground">THE INFORMATION PROVIDED BY INSIDERINTEL IS FOR INFORMATIONAL
                PURPOSES ONLY AND DOES NOT CONSTITUTE FINANCIAL, INVESTMENT, LEGAL, OR TAX ADVICE.</strong>
              </p>
              <p>
                InsiderIntel is not a registered investment advisor, broker-dealer, or financial planner.
                The data, analysis, and insights provided through our Service should not be construed as
                recommendations to buy, sell, or hold any securities.
              </p>
              <p>
                You should always conduct your own research and consult with qualified financial professionals
                before making any investment decisions. Past performance of any security or investment strategy
                does not guarantee future results.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">4. Data Accuracy</h2>
            <div className="mt-3 space-y-3">
              <p>
                While we strive for accuracy, InsiderIntel does not guarantee the accuracy, completeness,
                or timeliness of any data provided through the Service. Data is sourced from public SEC filings
                and may contain errors present in the original filings.
              </p>
              <p>
                AI-generated insights and significance scores are automated analyses and may not accurately
                reflect the true significance or implications of any transaction. These should be used as
                starting points for research, not as definitive assessments.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">5. User Accounts</h2>
            <div className="mt-3 space-y-3">
              <p>
                To access certain features of the Service, you must create an account. You are responsible
                for maintaining the confidentiality of your account credentials and for all activities that
                occur under your account.
              </p>
              <p>
                You agree to provide accurate, current, and complete information during registration and
                to update such information to keep it accurate, current, and complete.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">6. Subscription Plans</h2>
            <div className="mt-3 space-y-3">
              <p>
                InsiderIntel offers various subscription tiers with different features and pricing.
                By subscribing to a paid plan, you agree to pay the applicable fees as described at
                the time of purchase.
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <strong className="text-foreground">Billing:</strong> Subscription fees are billed in
                  advance on a monthly or annual basis, depending on your selected plan.
                </li>
                <li>
                  <strong className="text-foreground">Cancellation:</strong> You may cancel your subscription
                  at any time. Upon cancellation, you will retain access to paid features until the end of
                  your current billing period.
                </li>
                <li>
                  <strong className="text-foreground">Refunds:</strong> We offer a 14-day money-back guarantee
                  on all paid plans. Refund requests made within 14 days of initial purchase will be honored
                  in full.
                </li>
                <li>
                  <strong className="text-foreground">Price Changes:</strong> We reserve the right to change
                  subscription prices. Existing subscribers will be notified at least 30 days before any
                  price increase takes effect.
                </li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">7. Acceptable Use</h2>
            <div className="mt-3 space-y-3">
              <p>You agree not to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Use the Service for any illegal purpose or in violation of any applicable laws</li>
                <li>Attempt to gain unauthorized access to any part of the Service or its systems</li>
                <li>Interfere with or disrupt the Service or servers connected to the Service</li>
                <li>Scrape, crawl, or use automated means to access the Service without our express permission</li>
                <li>Redistribute, resell, or commercially exploit the Service or its data without authorization</li>
                <li>Share your account credentials with third parties</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">8. Intellectual Property</h2>
            <p className="mt-3">
              The Service, including its design, features, and content (excluding SEC data which is public domain),
              is owned by InsiderIntel and protected by intellectual property laws. You may not copy, modify,
              distribute, or create derivative works based on our proprietary content without express permission.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">9. Limitation of Liability</h2>
            <div className="mt-3 space-y-3">
              <p>
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, INSIDERINTEL SHALL NOT BE LIABLE FOR ANY INDIRECT,
                INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO
                LOSS OF PROFITS, DATA, OR GOODWILL, ARISING OUT OF OR IN CONNECTION WITH YOUR USE OF THE SERVICE.
              </p>
              <p>
                IN NO EVENT SHALL OUR TOTAL LIABILITY TO YOU EXCEED THE AMOUNT YOU PAID TO US IN THE
                TWELVE (12) MONTHS PRECEDING THE CLAIM.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">10. Indemnification</h2>
            <p className="mt-3">
              You agree to indemnify and hold harmless InsiderIntel, its officers, directors, employees,
              and agents from any claims, damages, losses, or expenses arising out of your use of the Service
              or violation of these Terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">11. Termination</h2>
            <p className="mt-3">
              We reserve the right to suspend or terminate your access to the Service at any time,
              with or without cause, and with or without notice. Upon termination, your right to use
              the Service will immediately cease.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">12. Changes to Terms</h2>
            <p className="mt-3">
              We may modify these Terms at any time. We will notify users of material changes via email
              or through the Service. Your continued use of the Service after such modifications constitutes
              acceptance of the updated Terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">13. Governing Law</h2>
            <p className="mt-3">
              These Terms shall be governed by and construed in accordance with the laws of the State of
              Delaware, without regard to its conflict of law provisions.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">14. Contact</h2>
            <p className="mt-3">
              If you have any questions about these Terms, please contact us at{' '}
              <a href="mailto:legal@insiderintel.com" className="text-primary hover:underline">
                legal@insiderintel.com
              </a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
