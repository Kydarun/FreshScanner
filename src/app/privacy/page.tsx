export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-300 p-8 py-16 flex justify-center">
      <div className="max-w-2xl w-full flex flex-col gap-6">
        <h1 className="text-3xl font-bold text-white mb-4">Privacy Policy for FreshScan</h1>
        <p className="text-sm text-slate-500">Last Updated: May 18, 2026</p>

        <section>
          <h2 className="text-xl font-semibold text-white mb-2">1. Information We Collect</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Account Information:</strong> When you log in via Google, we collect your basic profile information (Name, Email, Profile Picture) to create and manage your account.</li>
            <li><strong>Camera & Image Data:</strong> To use the core features of the app, we require access to your device's camera. Images captured are sent to our AI provider (Google Gemini) solely for the purpose of analyzing food freshness.</li>
            <li><strong>Usage Data:</strong> We store your scan history and virtual fridge contents in our secure database (Google Firebase) so you can access them later.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-2">2. How We Use Your Information</h2>
          <p>We use your information exclusively to provide, maintain, and improve the FreshScan application. We <strong>do not</strong> sell your personal data or images to third parties.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-2">3. Third-Party Services</h2>
          <p className="mb-2">We use trusted third-party services to operate the app:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Google Firebase:</strong> For secure user authentication and database storage.</li>
            <li><strong>Stripe:</strong> For secure payment processing. We do not store or have access to your credit card details.</li>
            <li><strong>Google Gemini AI:</strong> For processing images to determine food freshness.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-2">4. Data Deletion</h2>
          <p>You have the right to request the deletion of your account and all associated data at any time. Please contact us to process this request.</p>
        </section>

        <div className="mt-12 pt-6 border-t border-slate-800">
          <a href="/" className="text-emerald-500 hover:text-emerald-400 font-medium">← Back to App</a>
        </div>
      </div>
    </div>
  );
}
