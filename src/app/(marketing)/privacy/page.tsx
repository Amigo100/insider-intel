import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy - InsiderIntel',
  description: 'Privacy Policy for InsiderIntel - how we collect, use, and protect your personal information.',
}

export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-4xl font-bold tracking-tight">Privacy Policy</h1>
        <p className="mt-4 text-muted-foreground">Last updated: January 15, 2026</p>

        <div className="mt-12 space-y-8 text-muted-foreground">
          <section>
            <h2 className="text-xl font-semibold text-foreground">1. Introduction</h2>
            <p className="mt-3">
              InsiderIntel (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is committed to protecting your privacy.
              This Privacy Policy explains how we collect, use, disclose, and safeguard your information
              when you use our website and services.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">2. Information We Collect</h2>
            <div className="mt-3 space-y-4">
              <div>
                <h3 className="font-medium text-foreground">Personal Information</h3>
                <p className="mt-2">When you create an account, we collect:</p>
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li>Email address</li>
                  <li>Name (if provided)</li>
                  <li>Password (stored securely hashed)</li>
                  <li>Profile information you choose to provide</li>
                </ul>
              </div>

              <div>
                <h3 className="font-medium text-foreground">Payment Information</h3>
                <p className="mt-2">
                  When you subscribe to a paid plan, payment processing is handled by Stripe.
                  We do not store your full credit card number. We receive and store:
                </p>
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li>Last four digits of your card</li>
                  <li>Card expiration date</li>
                  <li>Billing address</li>
                  <li>Stripe customer ID</li>
                </ul>
              </div>

              <div>
                <h3 className="font-medium text-foreground">Usage Information</h3>
                <p className="mt-2">We automatically collect:</p>
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li>IP address</li>
                  <li>Browser type and version</li>
                  <li>Device type and operating system</li>
                  <li>Pages visited and features used</li>
                  <li>Time spent on pages</li>
                  <li>Referring website</li>
                </ul>
              </div>

              <div>
                <h3 className="font-medium text-foreground">Watchlist Data</h3>
                <p className="mt-2">
                  We store the companies you add to your watchlist to provide personalized
                  alerts and tracking features.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">3. How We Use Your Information</h2>
            <div className="mt-3 space-y-3">
              <p>We use your information to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Provide, maintain, and improve our services</li>
                <li>Process transactions and send related information</li>
                <li>Send you alerts and notifications based on your preferences</li>
                <li>Respond to your comments, questions, and support requests</li>
                <li>Monitor and analyze usage patterns and trends</li>
                <li>Detect, prevent, and address technical issues and security threats</li>
                <li>Comply with legal obligations</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">4. Email Communications</h2>
            <div className="mt-3 space-y-3">
              <p>We may send you:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <strong className="text-foreground">Transactional emails:</strong> Account confirmations,
                  password resets, subscription updates, and security alerts
                </li>
                <li>
                  <strong className="text-foreground">Service emails:</strong> Daily digests, weekly summaries,
                  and instant alerts (based on your notification preferences)
                </li>
                <li>
                  <strong className="text-foreground">Marketing emails:</strong> Product updates and announcements
                  (you can opt out at any time)
                </li>
              </ul>
              <p>
                You can manage your email preferences in your account settings or by clicking the
                unsubscribe link in any email.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">5. Information Sharing</h2>
            <div className="mt-3 space-y-3">
              <p>We do not sell your personal information. We may share your information with:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <strong className="text-foreground">Service providers:</strong> Third parties that perform
                  services on our behalf (payment processing, email delivery, hosting, analytics)
                </li>
                <li>
                  <strong className="text-foreground">Legal requirements:</strong> When required by law,
                  subpoena, or other legal process
                </li>
                <li>
                  <strong className="text-foreground">Business transfers:</strong> In connection with a merger,
                  acquisition, or sale of assets
                </li>
                <li>
                  <strong className="text-foreground">With your consent:</strong> For any other purpose with
                  your explicit consent
                </li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">6. Third-Party Services</h2>
            <div className="mt-3 space-y-3">
              <p>We use the following third-party services:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <strong className="text-foreground">Supabase:</strong> Database and authentication
                </li>
                <li>
                  <strong className="text-foreground">Stripe:</strong> Payment processing
                </li>
                <li>
                  <strong className="text-foreground">Resend:</strong> Email delivery
                </li>
                <li>
                  <strong className="text-foreground">Vercel:</strong> Hosting and analytics
                </li>
                <li>
                  <strong className="text-foreground">Sentry:</strong> Error tracking
                </li>
              </ul>
              <p>
                Each of these services has their own privacy policy governing their use of your data.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">7. Data Security</h2>
            <div className="mt-3 space-y-3">
              <p>We implement appropriate security measures including:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>256-bit SSL/TLS encryption for data in transit</li>
                <li>Encrypted database storage</li>
                <li>Secure password hashing (bcrypt)</li>
                <li>Regular security audits</li>
                <li>Access controls and authentication</li>
              </ul>
              <p>
                While we strive to protect your personal information, no method of transmission over
                the Internet or electronic storage is 100% secure.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">8. Data Retention</h2>
            <p className="mt-3">
              We retain your personal information for as long as your account is active or as needed
              to provide you services. We may retain certain information as required by law or for
              legitimate business purposes. You can request deletion of your account and associated
              data at any time.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">9. Your Rights</h2>
            <div className="mt-3 space-y-3">
              <p>Depending on your location, you may have the right to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Access the personal information we hold about you</li>
                <li>Correct inaccurate or incomplete information</li>
                <li>Delete your personal information</li>
                <li>Export your data in a portable format</li>
                <li>Opt out of marketing communications</li>
                <li>Withdraw consent where processing is based on consent</li>
              </ul>
              <p>
                To exercise these rights, please contact us at{' '}
                <a href="mailto:privacy@insiderintel.com" className="text-primary hover:underline">
                  privacy@insiderintel.com
                </a>.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">10. Cookies</h2>
            <div className="mt-3 space-y-3">
              <p>We use cookies and similar technologies to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Keep you signed in</li>
                <li>Remember your preferences</li>
                <li>Understand how you use our service</li>
                <li>Improve our service</li>
              </ul>
              <p>
                You can control cookies through your browser settings. Disabling cookies may affect
                the functionality of our service.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">11. Children&apos;s Privacy</h2>
            <p className="mt-3">
              Our service is not intended for individuals under 18 years of age. We do not knowingly
              collect personal information from children. If we become aware that we have collected
              personal information from a child, we will take steps to delete such information.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">12. International Users</h2>
            <p className="mt-3">
              If you are accessing our service from outside the United States, please be aware that
              your information may be transferred to, stored, and processed in the United States
              where our servers are located. By using our service, you consent to this transfer.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">13. Changes to This Policy</h2>
            <p className="mt-3">
              We may update this Privacy Policy from time to time. We will notify you of any changes
              by posting the new Privacy Policy on this page and updating the &quot;Last updated&quot; date.
              We encourage you to review this Privacy Policy periodically.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">14. Contact Us</h2>
            <p className="mt-3">
              If you have any questions about this Privacy Policy, please contact us at{' '}
              <a href="mailto:privacy@insiderintel.com" className="text-primary hover:underline">
                privacy@insiderintel.com
              </a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
