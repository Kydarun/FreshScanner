export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-300 p-8 py-16 flex justify-center">
      <div className="max-w-2xl w-full flex flex-col gap-6">
        <h1 className="text-3xl font-bold text-white mb-4">Terms of Service for FreshScan</h1>
        <p className="text-sm text-slate-500">Last Updated: May 18, 2026</p>

        <section>
          <h2 className="text-xl font-semibold text-white mb-2">1. Acceptance of Terms</h2>
          <p>By accessing or using the FreshScan application ("Service"), you agree to be bound by these Terms of Service. If you disagree with any part of the terms, you may not access the Service.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-2">2. Description of Service & Medical Disclaimer</h2>
          <p className="mb-2">FreshScan utilizes Artificial Intelligence (AI) to evaluate the visual appearance of food items to estimate freshness and shelf-life.</p>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Not a Replacement for Judgment:</strong> The Service is strictly for informational and educational purposes. It is <strong>not</strong> a substitute for professional food safety guidelines, expiration dates printed on packaging, or basic human judgment (smell, touch, taste).</li>
            <li><strong>No Liability:</strong> We do not guarantee the accuracy, reliability, or completeness of the AI analysis. FreshScan and its creators are not liable for any foodborne illnesses, health issues, damages, or losses resulting from the consumption of food scanned by the application. Always err on the side of caution.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-2">3. Accounts and Subscriptions (FreshScan+)</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Account Creation:</strong> You are responsible for safeguarding the password or Google account you use to access the Service.</li>
            <li><strong>Payments:</strong> Premium features require a paid subscription ("FreshScan+"). All payments are securely processed via Stripe.</li>
            <li><strong>Cancellation:</strong> You may cancel your subscription at any time through the customer portal. Cancellations take effect at the end of the current billing cycle. We do not offer prorated refunds.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-2">4. User Content and Conduct</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Acceptable Use:</strong> You agree to use the camera and upload features strictly for scanning food items.</li>
            <li><strong>Prohibited Conduct:</strong> You agree not to attempt to bypass our paywalls, reverse-engineer our API, scrape our databases, or repeatedly upload non-food, inappropriate, or illegal imagery to overload our AI servers. We reserve the right to ban accounts that violate these rules.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-2">5. Intellectual Property</h2>
          <p>The Service and its original content, features, and functionality are and will remain the exclusive property of FreshScan and its licensors.</p>
        </section>

        <div className="mt-12 pt-6 border-t border-slate-800">
          <a href="/" className="text-emerald-500 hover:text-emerald-400 font-medium">← Back to App</a>
        </div>
      </div>
    </div>
  );
}
