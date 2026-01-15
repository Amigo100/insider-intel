import type { Metadata } from 'next'
import { AlertTriangle } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Disclaimer - InsiderIntel',
  description: 'Important disclaimer regarding the use of InsiderIntel for investment research and decision-making.',
}

export default function DisclaimerPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-4xl font-bold tracking-tight">Disclaimer</h1>
        <p className="mt-4 text-muted-foreground">Last updated: January 15, 2026</p>

        {/* Important Notice Banner */}
        <div className="mt-8 rounded-lg border-2 border-amber-500/50 bg-amber-50 p-6 dark:bg-amber-950/20">
          <div className="flex gap-4">
            <AlertTriangle className="h-6 w-6 flex-shrink-0 text-amber-600 dark:text-amber-500" />
            <div>
              <h2 className="text-lg font-semibold text-amber-800 dark:text-amber-400">
                Important: Not Financial Advice
              </h2>
              <p className="mt-2 text-amber-700 dark:text-amber-300">
                InsiderIntel is an informational platform only. Nothing on this website constitutes
                financial, investment, legal, or tax advice. Always consult with qualified professionals
                before making investment decisions.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-12 space-y-8 text-muted-foreground">
          <section>
            <h2 className="text-xl font-semibold text-foreground">General Disclaimer</h2>
            <div className="mt-3 space-y-3">
              <p>
                The information provided by InsiderIntel is for general informational and educational
                purposes only. All information on the site is provided in good faith; however, we make
                no representation or warranty of any kind, express or implied, regarding the accuracy,
                adequacy, validity, reliability, availability, or completeness of any information on the site.
              </p>
              <p>
                UNDER NO CIRCUMSTANCE SHALL WE HAVE ANY LIABILITY TO YOU FOR ANY LOSS OR DAMAGE OF ANY
                KIND INCURRED AS A RESULT OF THE USE OF THE SITE OR RELIANCE ON ANY INFORMATION PROVIDED
                ON THE SITE. YOUR USE OF THE SITE AND YOUR RELIANCE ON ANY INFORMATION ON THE SITE IS
                SOLELY AT YOUR OWN RISK.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">Investment Disclaimer</h2>
            <div className="mt-3 space-y-3">
              <p>
                <strong className="text-foreground">InsiderIntel is not a registered investment advisor,
                broker-dealer, or financial planner.</strong> We do not provide personalized investment
                advice or recommendations.
              </p>
              <p>
                The data, analysis, and insights provided through our platform should not be construed
                as recommendations to buy, sell, or hold any securities. Insider trading data and
                institutional holdings information reflect past transactions and do not predict future
                stock performance.
              </p>
              <p className="font-medium text-foreground">
                Past performance is not indicative of future results. Investing in securities involves
                risk, including the potential loss of principal.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">AI-Generated Content Disclaimer</h2>
            <div className="mt-3 space-y-3">
              <p>
                InsiderIntel uses artificial intelligence to generate analysis and insights about
                insider trading transactions. This AI-generated content:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Is automated and may contain errors or inaccuracies</li>
                <li>Should not be relied upon as the sole basis for investment decisions</li>
                <li>May not capture all relevant context or nuances of a transaction</li>
                <li>Reflects patterns in data and does not constitute expert financial analysis</li>
              </ul>
              <p>
                &quot;Significance scores&quot; and other AI-derived metrics are algorithmic assessments
                based on historical patterns and should be treated as one of many data points,
                not as definitive measures of investment opportunity.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">Data Accuracy Disclaimer</h2>
            <div className="mt-3 space-y-3">
              <p>
                While we strive for accuracy, InsiderIntel does not guarantee the accuracy,
                completeness, or timeliness of any data displayed on our platform.
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <strong className="text-foreground">SEC Data:</strong> Our data is sourced from
                  public SEC EDGAR filings. Errors in original filings will be reflected in our data.
                </li>
                <li>
                  <strong className="text-foreground">Delays:</strong> There may be delays between
                  when a filing is submitted to the SEC and when it appears in our system.
                </li>
                <li>
                  <strong className="text-foreground">Amendments:</strong> Filings may be amended
                  or corrected by the issuer. We attempt to process amendments but cannot guarantee
                  real-time updates.
                </li>
                <li>
                  <strong className="text-foreground">Ticker Mapping:</strong> Company ticker symbols
                  are derived from third-party data sources and may occasionally be incorrect.
                </li>
              </ul>
              <p>
                Always verify critical information directly with official SEC filings before making
                investment decisions.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">No Professional Relationship</h2>
            <p className="mt-3">
              Use of InsiderIntel does not create a professional-client relationship of any kind.
              We do not have a fiduciary duty to you. The content on our platform is not intended
              as a substitute for advice from qualified investment, legal, tax, or accounting
              professionals.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">Third-Party Links</h2>
            <p className="mt-3">
              Our platform may contain links to third-party websites or services that are not
              owned or controlled by InsiderIntel. We have no control over, and assume no
              responsibility for, the content, privacy policies, or practices of any third-party
              sites or services.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">Limitation of Liability</h2>
            <div className="mt-3 space-y-3">
              <p>
                IN NO EVENT WILL INSIDERINTEL, ITS OFFICERS, DIRECTORS, EMPLOYEES, OR AGENTS BE
                LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES,
                INCLUDING BUT NOT LIMITED TO:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Loss of profits or anticipated profits</li>
                <li>Loss of revenue or income</li>
                <li>Loss of business or contracts</li>
                <li>Loss of anticipated savings</li>
                <li>Loss of data or information</li>
                <li>Loss of goodwill</li>
                <li>Any other consequential or indirect loss</li>
              </ul>
              <p>
                This limitation applies regardless of the form of action, whether in contract,
                tort (including negligence), strict liability, or otherwise, even if InsiderIntel
                has been advised of the possibility of such damages.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">Regulatory Notice</h2>
            <p className="mt-3">
              Insider trading data is public information filed with the U.S. Securities and
              Exchange Commission. The SEC requires corporate insiders to report their transactions
              within two business days. This data is made public to promote transparency in
              the markets. InsiderIntel aggregates and presents this public data for informational
              purposes only.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">Acknowledgment</h2>
            <p className="mt-3">
              By using InsiderIntel, you acknowledge that you have read, understood, and agree
              to be bound by this Disclaimer. If you do not agree with any part of this Disclaimer,
              you must not use our service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">Contact</h2>
            <p className="mt-3">
              If you have questions about this Disclaimer, please contact us at{' '}
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
